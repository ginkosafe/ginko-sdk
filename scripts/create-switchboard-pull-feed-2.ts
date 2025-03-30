import { Connection, PublicKey } from "@solana/web3.js";
import { keypairFromJSONFile } from "../src/solana/keypair";
import { PrepareCreateOracleInstructions } from "../src/instruction-builders/switchboard";
import { signAndSendTransaction } from "../src/solana/tx";

/**
 * This script creates a Switchboard pull feed using the SwitchboardInstructionBuilder from the SDK.
 * It demonstrates how to create a feed for a stock price (AAPL by default) and initialize it on-chain.
 *
 * Environment variables required:
 * - SOLANA_NETWORK: "mainnet-beta" or "devnet"
 * - SOLANA_RPC_URL: URL of the Solana RPC endpoint
 * - SOLANA_KEYPAIR_PATH: Path to the keypair file
 * - PAYMENT_MINT: Public key of the payment mint
 * - PRICE_API_URL: URL of the price API (default: https://go-ginko-prices.fly.dev/api)
 * - NONCE_PREFIX: Optional prefix for the nonce
 * - TICKER: Optional ticker symbol (default: AAPL)
 */
const ticker = process.env.TICKER ?? "AAPL";
const priceApiUrl =
  process.env.PRICE_API_URL ?? "https://go-ginko-prices.fly.dev/api";
const conn = new Connection(process.env.SOLANA_RPC_URL);
const paymentMint = new PublicKey(process.env.PAYMENT_MINT);
const wallet = keypairFromJSONFile(process.env.SOLANA_KEYPAIR_PATH);
const isDevnet = process.env.SOLANA_NETWORK === "devnet";
const noncePrefix = process.env.NONCE_PREFIX ?? "OpenFIGI:";

console.log("Using Payer:", wallet.publicKey.toBase58());

const instructions = await PrepareCreateOracleInstructions(
  wallet.publicKey,
  ticker,
  noncePrefix,
  paymentMint,
  isDevnet,
  conn,
  priceApiUrl,
);
// console.log("Generated instructions:", toJSON(instructions));

try {
  console.log("Sending instructions...");
  const signature = await signAndSendTransaction(conn, wallet, instructions);

  console.log(
    `View transaction: https://explorer.solana.com/tx/${signature}${
      isDevnet ? `?cluster=devnet` : ""
    }`,
  );
  console.log(`Switchboard pull feed created successfully!`);
} catch (error) {
  console.error("Error creating Switchboard pull feed:", error);
  process.exit(1);
}

// Type definitions for environment variables
declare module "bun" {
  interface Env {
    SOLANA_NETWORK: "mainnet-beta" | "devnet";
    SOLANA_RPC_URL: string;
    SOLANA_KEYPAIR_PATH: string;
    PAYMENT_MINT: string;
    PRICE_API_URL: string;
    NONCE_PREFIX?: string;
    TICKER?: string;
  }
}
