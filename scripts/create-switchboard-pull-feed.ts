import { BN, Program } from "@coral-xyz/anchor";
import {
  AddressLookupTableProgram,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import fs from "fs";
import { CrossbarClient, OracleJob } from "@switchboard-xyz/common";
import {
  getDefaultDevnetQueue,
  getDefaultQueue,
  State as SwitchboardState,
} from "@switchboard-xyz/on-demand";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import { OpenFIGIAsset } from "../src/public-key-derivation/open-figi-asset.js";
import { SwitchboardOracleFeed } from "../src/public-key-derivation/switchboard-oracle-feed.js";
import { solBuildTx, confirmTransaction } from "../src/solana/tx.js";
import { toJSON } from "../src/json/json.js";
import { GINKO_IDL, GinkoProtocol } from "../src/idl.js";
import { AUTH_MINT } from "../src/constants.js";

const jobs: OracleJob[] = [
  OracleJob.create({
    tasks: [
      {
        httpTask: {
          url: `${process.env.PRICE_API_URL}/price/AAPL`,
          method: OracleJob.HttpTask.Method.METHOD_GET,
        },
      },
      {
        jsonParseTask: {
          path: "price",
          aggregationMethod: OracleJob.JsonParseTask.AggregationMethod.NONE,
        },
      },
    ],
  }),
];

const serializedJobs = jobs.map((oracleJob) => {
  const encoded = OracleJob.encodeDelimited(oracleJob).finish();
  const base64 = Buffer.from(encoded).toString("base64");
  return base64;
});

console.log("Running simulation...\n");

// Call the simulation server.
const response = await fetch("https://api.switchboard.xyz/api/simulate", {
  method: "POST",
  headers: [["Content-Type", "application/json"]],
  body: JSON.stringify({
    cluster: process.env.SOLANA_NETWORK === "devnet" ? "Devnet" : "Mainnet",
    jobs: serializedJobs,
  }),
});

// Check response.
if (response.ok) {
  const data = await response.json();
  console.log(`Response is good (${response.status})`);
  console.log(JSON.stringify(data, null, 2));
} else {
  console.log(`Response is bad (${response.status})`);
  throw await response.text();
}

console.log("Storing and creating the feed...\n");

// Get connection from environment variables
const connection = new Connection(process.env.SOLANA_RPC_URL);
const program = new Program(GINKO_IDL as GinkoProtocol, {
  connection,
});

// Get the queue for the network you're deploying on
const queue = await (process.env.SOLANA_NETWORK === "devnet"
  ? getDefaultDevnetQueue(process.env.SOLANA_RPC_URL)
  : getDefaultQueue(process.env.SOLANA_RPC_URL)); // or `getDefaultQueue()` for mainnet,

// Get the crossbar server client
const crossbarClient = CrossbarClient.default();

// Upload jobs to Crossbar, which pins valid feeds on ipfs
const { feedHash } = await crossbarClient.store(queue.pubkey.toBase58(), jobs);
console.log(`Feed hash: ${feedHash}`);

// Get payer keypair from file
const payerSecretKey = Uint8Array.from(
  JSON.parse(fs.readFileSync(process.env.SOLANA_KEYPAIR_PATH, "utf8")),
);
const payerKeypair = Keypair.fromSecretKey(payerSecretKey);
const payerPublicKey = payerKeypair.publicKey;
console.log("Using Payer:", payerPublicKey.toBase58());

const ginkoAuthority = getAssociatedTokenAddressSync(
  AUTH_MINT,
  payerPublicKey,
  true,
  TOKEN_2022_PROGRAM_ID,
);

const maxVariance = Math.floor(10 * 1e9); // 10%

// Setup asset (example using AAPL stock)
const asset = new OpenFIGIAsset("AAPL", "TICKER", {
  noncePrefix: process.env.NONCE_PREFIX,
});
const assetNonce = await asset.deriveNonce();

// Setup oracle feed
const paymentMint = new PublicKey(process.env.PAYMENT_MINT); // Replace with actual input mint
const pullFeed = SwitchboardOracleFeed.derivePublicKey(assetNonce, paymentMint);
console.log("Feed public key:", pullFeed.toBase58());

const lutSigner = PublicKey.findProgramAddressSync(
  [Buffer.from("LutSigner"), pullFeed.toBuffer()],
  queue.program.programId,
)[0];

const recentSlot = await connection.getSlot("recent");

const [_, lut] = AddressLookupTableProgram.createLookupTable({
  authority: lutSigner,
  payer: payerPublicKey,
  recentSlot,
});

const instructions = [
  await program.methods
    .switchboardPullFeedInit(assetNonce, {
      feedHash: Array.from(Buffer.from(feedHash.slice(2), "hex")),
      maxVariance: new BN(maxVariance),
      minResponses: 1,
      name: Array.from(Buffer.from(padStringWithNullBytes("AAPL / USD"))),
      recentSlot: new BN(recentSlot),
      ipfsHash: Array.from(new Uint8Array(32)), // Deprecated.
      minSampleSize: 3,
      maxStaleness: 3600,
      permitWriteByAuthority: null,
    })
    .accountsStrict({
      pullFeed,
      queue: queue.pubkey,
      authority: payerPublicKey,
      payer: payerPublicKey,
      systemProgram: SystemProgram.programId,
      programState: SwitchboardState.keyFromSeed(queue.program),
      rewardEscrow: getAssociatedTokenAddressSync(NATIVE_MINT, pullFeed, true),
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      wrappedSolMint: NATIVE_MINT,
      lutSigner,
      lut,
      addressLookupTableProgram: AddressLookupTableProgram.programId,
      ginkoAuthority,
      switchboardProgram: queue.program.programId,
      paymentMint,
    })
    .instruction(),
];

console.log("Generated instructions:", toJSON(instructions));

try {
  // Build and simulate the transaction
  console.log("Building and simulating transaction...");
  const { versionedTx, lastValidHeight } = await solBuildTx(
    connection,
    payerKeypair.publicKey,
    instructions,
    true, // Enable simulation
  );

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
  await confirmTransaction(connection, lastValidHeight, signature);

  console.log(
    `View transaction: https://explorer.solana.com/tx/${signature}${process.env.SOLANA_NETWORK === "devnet" ? `?cluster=devnet` : ""}`,
  );
} catch (error) {
  console.error("Error:", error);
  throw error;
}

function padStringWithNullBytes(
  input: string,
  desiredLength: number = 32,
): string {
  const nullByte = "\0";
  while (input.length < desiredLength) {
    input += nullByte;
  }
  return input;
}

declare module "bun" {
  interface Env {
    SOLANA_NETWORK: "mainnet-beta" | "devnet";
    SOLANA_RPC_URL: string;
    SOLANA_KEYPAIR_PATH: string;
    PAYMENT_MINT: string;
    PRICE_API_URL: string;
    NONCE_PREFIX?: string;
  }
}
