import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import fs from "fs";

import { AccountData } from "../src/account-data";
import { toJSON } from "../src/json/json";
import { OpenFIGIAsset } from "../src/public-key-derivation/open-figi-asset";

async function main() {
  // Get connection from environment variables
  const connection = new Connection(process.env.SOLANA_RPC_URL);

  // Create AccountData instance for fetching account information
  const accountData = new AccountData(connection);

  // Example: Fetch all orders
  console.log("Fetching all orders...");
  const allOrders = await accountData.orders();
  console.log("All orders:", toJSON(allOrders));

  // Example: Fetch orders for a specific owner
  if (process.env.SOLANA_KEYPAIR_PATH) {
    const ownerSecretKey = Uint8Array.from(
      JSON.parse(fs.readFileSync(process.env.SOLANA_KEYPAIR_PATH, "utf8")),
    );
    const ownerPublicKey = Keypair.fromSecretKey(ownerSecretKey).publicKey;
    console.log("\nFetching orders for owner:", ownerPublicKey.toBase58());
    const ownerOrders = await accountData.orders(ownerPublicKey);
    console.log("Owner orders:", toJSON(ownerOrders));
  }

  // Setup asset (example using AAPL stock)
  const figi = new OpenFIGIAsset("AAPL", "TICKER", {
    noncePrefix: process.env.NONCE_PREFIX,
  });
  const asset = await figi.derivePublicKey();
  console.log("\nFetching orders for asset:", asset.toBase58());
  const assetOrders = await accountData.orders(undefined, asset);
  console.log("Asset orders:", toJSON(assetOrders));

  // Example: Fetch orders for a specific payment mint
  if (process.env.PAYMENT_MINT) {
    const paymentMint = new PublicKey(process.env.PAYMENT_MINT);
    console.log("\nFetching orders for payment mint:", paymentMint.toBase58());
    const paymentMintOrders = await accountData.orders(
      undefined,
      undefined,
      paymentMint,
    );
    console.log("Payment mint orders:", toJSON(paymentMintOrders));
  }

  // Example: Fetch orders for a specific owner, asset, and payment mint
  if (
    process.env.SOLANA_KEYPAIR_PATH !== undefined &&
    process.env.PAYMENT_MINT !== undefined
  ) {
    const ownerSecretKey = Uint8Array.from(
      JSON.parse(fs.readFileSync(process.env.SOLANA_KEYPAIR_PATH, "utf8")),
    );
    const ownerPublicKey = Keypair.fromSecretKey(ownerSecretKey).publicKey;
    const paymentMint = new PublicKey(process.env.PAYMENT_MINT);
    const ownerOrders = await accountData.orders(
      ownerPublicKey,
      asset,
      paymentMint,
    );
    console.log(
      `Owner(${ownerPublicKey.toBase58()}) Asset(${asset.toBase58()}) Payment mint(${paymentMint.toBase58()}) orders:`,
      toJSON(ownerOrders),
    );
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
