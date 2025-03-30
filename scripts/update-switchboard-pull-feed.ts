import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";
import { CrossbarClient } from "@switchboard-xyz/common";
import {
  getDefaultDevnetQueue,
  getDefaultQueue,
  asV0Tx,
} from "@switchboard-xyz/on-demand";

import { toJSON } from "../src/json/json";
import { SwitchboardInstructionBuilder } from "../src/instruction-builders/switchboard";
import {
  OpenFIGIAsset,
  SwitchboardOracleFeed,
} from "../src/public-key-derivation";

/**
 * This script updates a Switchboard pull feed using the update method from SwitchboardInstructionBuilder.
 * It demonstrates how to crank a feed that has already been initialized on-chain.
 *
 * Environment variables required:
 * - SOLANA_NETWORK: "mainnet-beta" or "devnet"
 * - SOLANA_RPC_URL: URL of the Solana RPC endpoint
 * - SOLANA_KEYPAIR_PATH: Path to the keypair file
 */

const ticker = process.env.TICKER ?? "AAPL";

// Get connection from environment variables
const connection = new Connection(process.env.SOLANA_RPC_URL);

// Get payer keypair from file
const payerSecretKey = Uint8Array.from(
  JSON.parse(fs.readFileSync(process.env.SOLANA_KEYPAIR_PATH, "utf8")),
);
const payerKeypair = Keypair.fromSecretKey(payerSecretKey);
const payerPublicKey = payerKeypair.publicKey;
console.log("Using Payer:", payerPublicKey.toBase58());

// Setup asset
const asset = new OpenFIGIAsset(ticker, "TICKER", {
  noncePrefix: process.env.NONCE_PREFIX,
});
const assetNonce = await asset.deriveNonce();

// Setup oracle feed parameters
const paymentMint = new PublicKey(process.env.PAYMENT_MINT);
const pullFeed = SwitchboardOracleFeed.derivePublicKey(assetNonce, paymentMint);
console.log("Feed public key:", pullFeed.toBase58());

async function main() {
  try {
    // Get the queue for the network you're deploying on
    const queue = await (process.env.SOLANA_NETWORK === "devnet"
      ? getDefaultDevnetQueue(process.env.SOLANA_RPC_URL)
      : getDefaultQueue(process.env.SOLANA_RPC_URL));

    // Get the crossbar server client
    const crossbarClient = CrossbarClient.default();

    // Create SwitchboardInstructionBuilder
    const switchboardBuilder = new SwitchboardInstructionBuilder(
      connection,
      crossbarClient,
      queue,
    );

    // Create the update instruction using the builder
    console.log("Generating update instruction...");
    const [instructions, lookupTables] = await switchboardBuilder.update({
      feed: pullFeed,
      signer: payerPublicKey,
    });

    console.log("Generated instructions:", toJSON(instructions));

    // Build and simulate the transaction
    console.log("Building and simulating transaction...");
    const versionedTx = await asV0Tx({
      connection,
      ixs: instructions,
      payer: payerKeypair.publicKey,
      lookupTables,
    });

    // Sign the transaction
    console.log("Signing and sending transaction...");
    versionedTx.sign([payerKeypair]);

    const signature = await connection.sendTransaction(versionedTx, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
      maxRetries: 5,
    });

    console.log(`Transaction sent! Signature: ${signature}`);
    console.log("Waiting for confirmation...");
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...latestBlockhash,
    });

    console.log(
      `View transaction: https://explorer.solana.com/tx/${signature}${
        process.env.SOLANA_NETWORK === "devnet" ? `?cluster=devnet` : ""
      }`,
    );
    console.log(`Switchboard pull feed updated successfully!`);
  } catch (error) {
    console.error("Error updating Switchboard pull feed:", error);
    process.exit(1);
  }
}

main();

// Type definitions for environment variables
declare module "bun" {
  interface Env {
    SOLANA_NETWORK: "mainnet-beta" | "devnet";
    SOLANA_RPC_URL: string;
    SOLANA_KEYPAIR_PATH: string;
    PAYMENT_MINT: string;
    NONCE_PREFIX?: string;
    TICKER?: string;
  }
}
