import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";

import { PublicInstructionBuilder } from "../src/instruction-builders/public";
import { solBuildTx, confirmTransaction } from "../src/solana/tx";
import { toJSON } from "../src/json/json";
import { AccountData } from "../src/account-data";

async function main() {
  // Get connection from environment variables
  const connection = new Connection(process.env.SOLANA_RPC_URL);

  // Create AccountData instance for fetching account information
  const accountData = new AccountData(connection);

  // Create instruction builder
  const instructionBuilder = new PublicInstructionBuilder(connection);

  // Get owner keypair from file
  const ownerSecretKey = Uint8Array.from(
    JSON.parse(fs.readFileSync(process.env.SOLANA_KEYPAIR_PATH, "utf8")),
  );
  const ownerKeypair = Keypair.fromSecretKey(ownerSecretKey);
  console.log("Owner public key:", ownerKeypair.publicKey.toBase58());

  const orderAddress = process.argv[2];
  if (!orderAddress) {
    console.log(
      "Please provide an order address, bun run ./scripts/cancel-order.ts <order_address>",
    );
    return;
  }

  const orderPubkey = new PublicKey(orderAddress);

  const order = await accountData.order(orderPubkey);

  // Create cancel order instruction
  const instructions = await instructionBuilder.cancelOrder(order);

  console.log("Generated instructions:", toJSON(instructions));

  try {
    // Build and simulate the transaction
    console.log("Building and simulating transaction...");
    const { versionedTx, lastValidHeight } = await solBuildTx(
      connection,
      ownerKeypair.publicKey,
      instructions,
      true, // Enable simulation
    );

    // Sign the transaction
    console.log("Signing and sending transaction...");
    versionedTx.sign([ownerKeypair]);

    const signature = await connection.sendTransaction(versionedTx, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
      maxRetries: 5,
    });

    console.log(`Transaction sent! Signature: ${signature}`);
    console.log("Waiting for confirmation...");
    await confirmTransaction(connection, lastValidHeight, signature);

    console.log(
      `View transaction: https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    );
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

main().catch(console.error);

declare module "bun" {
  interface Env {
    SOLANA_RPC_URL: string;
    SOLANA_KEYPAIR_PATH: string;
    ORDER_ADDRESS: string;
  }
}
