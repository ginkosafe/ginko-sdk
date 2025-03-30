import { Connection } from "@solana/web3.js";

import { AccountData } from "../src/account-data";
import { toJSON } from "../src/json/json";

async function main() {
  // Get connection from environment variables
  const connection = new Connection(process.env.SOLANA_RPC_URL);

  // Create AccountData instance for fetching account information
  const accountData = new AccountData(connection);

  // Example: Fetch all assets
  console.log("Fetching all assets...");
  const allAssets = await accountData.assets();
  console.log("All assets:", toJSON(allAssets));

  // Example: Fetch paused assets
  console.log("Fetching paused assets...");
  const pausedAssets = await accountData.assets(true);
  console.log("Paused assets:", toJSON(pausedAssets));
}

main().catch(console.error);

declare module "bun" {
  interface Env {
    SOLANA_RPC_URL: string;
  }
}
