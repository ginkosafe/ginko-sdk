import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import fs from "fs";

export function keypairFromJSONFile(filePath: string): Keypair {
  const payerSecretKey = Uint8Array.from(
    JSON.parse(fs.readFileSync(filePath, "utf8")),
  );
  return Keypair.fromSecretKey(payerSecretKey);
}

export function keypairFromPrivateKeyBase58(privateKeyBase58: string): Keypair {
  try {
    const privateKeyBytes = bs58.decode(privateKeyBase58);
    return Keypair.fromSecretKey(privateKeyBytes);
  } catch (error) {
    console.error("Error constructing keypair:", error);
    throw error;
  }
}
