import BN from "bn.js"
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";

import { OpenFIGIAsset } from "../src/public-key-derivation/open-figi-asset";
import { SwitchboardOracleFeed } from "../src/public-key-derivation/switchboard-oracle-feed";
import { PublicInstructionBuilder } from "../src/instruction-builders/public";
import { Price } from "../src/types";
import { solBuildTx, confirmTransaction } from "../src/solana/tx";
import { toJSON } from "../src/json/json";

async function main() {
  // Get connection from environment variables
  const connection = new Connection(process.env.SOLANA_RPC_URL);

  // Create instruction builder
  const instructionBuilder = new PublicInstructionBuilder(connection);

  // Setup asset (example using AAPL stock)
  const asset = new OpenFIGIAsset("AAPL", "TICKER", {
    noncePrefix: process.env.NONCE_PREFIX,
  });
  const assetPubkey = await asset.derivePublicKey();
  const assetNonce = await asset.deriveNonce();
  const assetMint = await asset.deriveMint();

  // Get owner keypair from file
  const ownerSecretKey = Uint8Array.from(
    JSON.parse(fs.readFileSync(process.env.SOLANA_KEYPAIR_PATH, "utf8")),
  );
  const ownerKeypair = Keypair.fromSecretKey(ownerSecretKey);
  console.log("Owner public key:", ownerKeypair.publicKey.toBase58());

  // Example parameters for a limit order
  const owner = ownerKeypair.publicKey;
  const tradeMint = new PublicKey(process.env.PAYMENT_MINT); // Replace with actual input mint
  const quantity = new BN(1000000);
  const limitPrice: Price = {
    mantissa: new BN(250_000_000),
    scale: 6,
  }; // Price of $250 with 6 decimals

  // Setup oracle feed
  const priceOracle = SwitchboardOracleFeed.derivePublicKey(
    assetNonce,
    tradeMint,
  );

  // Create place order instruction
  const instructions = await instructionBuilder.placeOrder({
    owner,
    asset: {
      publicKey: assetPubkey,
      mint: assetMint,
    },
    direction: "buy",
    type: "limit",
    quantity,
    priceOracle,
    tradeMint,
    limitPrice,
  });

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
    PAYMENT_MINT: string;
    NONCE_PREFIX?: string;
  }
}
