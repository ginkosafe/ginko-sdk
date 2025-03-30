import { Connection, Commitment } from "@solana/web3.js";

function connection(url: string, commitment: string = "confirmed"): Connection {
  return new Connection(url, {
    commitment: commitment as Commitment,
    disableRetryOnRateLimit: false,
  });
}

export function solConnectionFromEnv(): Connection {
  const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL;
  const SOLANA_RPC_COMMITMENT = process.env.SOLANA_RPC_COMMITMENT;

  if (!SOLANA_RPC_URL) {
    throw new Error("connection url is not provided");
  }
  return connection(SOLANA_RPC_URL, SOLANA_RPC_COMMITMENT);
}
