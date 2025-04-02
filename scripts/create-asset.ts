import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js"

import { AssetCreatorInstructionBuilder } from "../src/instruction-builders";
import { OpenFIGIAsset } from "../src/public-key-derivation/open-figi-asset";
import { signAndSendTransaction } from "../src/solana/tx";
import { SwitchboardOracleFeed } from "../src/public-key-derivation/switchboard-oracle-feed";
import { keypairFromJSONFile } from "../src/solana/keypair";
import { envTxExplorerUrl } from "./env";

async function main() {
  // Get connection from environment variables
  const connection = new Connection(process.env.SOLANA_RPC_URL);
  const noncePrefix = process.env.NONCE_PREFIX ?? "OpenFIGI:";
  const ticker = process.env.TICKER ?? "AAPL";
  const signer = keypairFromJSONFile(process.env.SOLANA_KEYPAIR_PATH);
  const paymentMint = new PublicKey(process.env.PAYMENT_MINT); // Replace with actual input mint

  console.log("Signer public key:", signer.publicKey.toBase58());

  const asset = new OpenFIGIAsset(ticker, "TICKER", { noncePrefix });
  const assetNonce = await asset.deriveNonce();
  const assetPubkey = await asset.derivePublicKey();
  const assetMint = await asset.deriveMint();

  const priceOracle = SwitchboardOracleFeed.derivePublicKey(
    assetNonce,
    paymentMint,
  );

  const assetCreator = new AssetCreatorInstructionBuilder(connection);
  const instructions = await assetCreator.initAsset({
    signer: signer.publicKey,
    asset: {
      publicKey: assetPubkey,
      mint: assetMint,
      nonce: assetNonce,
    },
    minOrderSize: new BN(1_000_000), // 1 unit with 6 decimals
    ceiling: new BN(500_000_000_000), // 500,000 units with 6 decimals
    quotaPriceOracle: priceOracle,
    tokenDecimals: 6,
  });

  // console.log("Generated instructions:", toJSON(instructions));

  try {
    console.log("Sending transaction...");
    const signature = await signAndSendTransaction(
      connection,
      signer,
      instructions,
    );

    console.log(`View transaction: ${envTxExplorerUrl(signature)}`);
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
