import { Connection, Keypair } from "@solana/web3.js";
import fs from "fs";

import { AdminInstructionBuilder } from "../src/instruction-builders";
import { OpenFIGIAsset } from "../src/public-key-derivation/open-figi-asset";
import { solBuildTx, confirmTransaction } from "../src/solana/tx";
import { toJSON } from "../src/json/json";

async function main() {
  // Get connection from environment variables
  const connection = new Connection(process.env.SOLANA_RPC_URL);

  // Initialize AdminInstructionBuilder
  const instructionBuilder = new AdminInstructionBuilder(connection);

  // Get signer keypair from file
  const signerSecretKey = Uint8Array.from(
    JSON.parse(fs.readFileSync(process.env.SOLANA_KEYPAIR_PATH, "utf8")),
  );
  const signer = Keypair.fromSecretKey(signerSecretKey);
  console.log("Signer public key:", signer.publicKey.toBase58());

  // Get asset identifier from command line arguments
  const identifier = process.argv[2];
  const identifierType = process.argv[3] || "TICKER";

  if (!identifier) {
    throw new Error(
      "Please provide an asset identifier (e.g., AAPL) as the first argument",
    );
  }

  // Setup asset (e.g., AAPL stock)
  const asset = new OpenFIGIAsset(identifier, identifierType, {
    noncePrefix: process.env.NONCE_PREFIX,
  });
  const assetPubkey = await asset.derivePublicKey();

  // Create update asset instructions
  const instructions = await instructionBuilder.updateAsset({
    signer: signer.publicKey,
    asset: assetPubkey,
    paused: true,
  });

  console.log("Generated instructions:", toJSON(instructions));

  try {
    // Build and simulate the transaction
    console.log("Building and simulating transaction...");
    const { versionedTx, lastValidHeight } = await solBuildTx(
      connection,
      signer.publicKey,
      instructions,
      true, // Enable simulation
    );

    // Sign the transaction
    console.log("Signing and sending transaction...");
    versionedTx.sign([signer]);

    const signature = await connection.sendTransaction(versionedTx, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
      maxRetries: 5,
    });

    console.log(`Transaction sent! Signature: ${signature}`);
    console.log("Waiting for confirmation...");
    await confirmTransaction(connection, lastValidHeight, signature);

    console.log(
      `View transaction: https://explorer.solana.com/tx/${signature}${process.env.SOLANA_NETWORK === "devnet" ? `?cluster=devnet` : ""}`,
    );
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

main().catch(console.error);

declare module "bun" {
  interface Env {
    SOLANA_NETWORK: "mainnet-beta" | "devnet";
    SOLANA_RPC_URL: string;
    SOLANA_KEYPAIR_PATH: string;
    NONCE_PREFIX?: string;
  }
}
