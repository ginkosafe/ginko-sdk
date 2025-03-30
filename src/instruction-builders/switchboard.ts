import {
  AddressLookupTableAccount,
  AddressLookupTableProgram,
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { CrossbarClient, OracleJob } from "@switchboard-xyz/common";
import {
  Queue,
  State as SwitchboardState,
  PullFeed,
  getDefaultDevnetQueue,
  getDefaultQueue,
} from "@switchboard-xyz/on-demand";
import { BN } from "@coral-xyz/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import { InstructionBuilder } from "./base";
import { AUTH_MINT } from "../constants";
import { OpenFIGIAsset, SwitchboardOracleFeed } from "../public-key-derivation";

/**
 * Builder for Switchboard oracle-related instructions in the Ginko Protocol.
 * Handles oracle initialization and updates.
 */
export class SwitchboardInstructionBuilder extends InstructionBuilder {
  constructor(
    connection: Connection,
    private crossbarClient: CrossbarClient,
    private queue: Queue,
  ) {
    super(connection);
  }

  /**
   * Creates transaction instructions to initialize a Switchboard pull feed.
   *
   * @param {Object} params - Parameters for oracle initialization
   * @param {PublicKey} params.signer - The public key of the signer
   * @param {BN} params.assetNonce - The nonce of the asset
   * @param {PublicKey} params.paymentMint - The mint of the payment token
   * @param {Buffer} params.feedHash - The hash of the feed
   * @param {Buffer} params.name - The name of the feed
   * @param {PublicKey} params.feedAuthority - The authority of the feed
   * @param {number} params.maxVariance - The maximum variance allowed
   * @param {number} params.minResponses - The minimum number of responses required
   * @param {number} params.minSampleSize - The minimum sample size required
   * @param {number} params.maxStaleness - The maximum staleness of the feed
   * @param {PublicKey | null} params.permitWriteByAuthority - When enabled, only the feed's authority can push updated values,
   * bypassing oracle and other configuration requirements.
   * @returns {Promise<TransactionInstruction[]>} Array of instructions to initialize the oracle
   */
  async pullFeedInit({
    signer,
    assetNonce,
    paymentMint,
    feedHash,
    name,
    feedAuthority = signer,
    maxVariance = 10_000_000_000, // 10%
    minResponses = 1,
    minSampleSize = 3,
    maxStaleness = 3600,
    permitWriteByAuthority = null,
  }: SwitchboardPullFeedInitParams): Promise<TransactionInstruction[]> {
    const ginkoAuthority = getAssociatedTokenAddressSync(
      AUTH_MINT,
      signer,
      true,
      TOKEN_2022_PROGRAM_ID,
    );

    const pullFeed = SwitchboardOracleFeed.derivePublicKey(
      assetNonce,
      paymentMint,
    );

    const lutSigner = PublicKey.findProgramAddressSync(
      [Buffer.from("LutSigner"), pullFeed.toBuffer()],
      this.queue.program.programId,
    )[0];

    const recentSlot = await this.connection.getSlot("recent");

    const [_, lut] = AddressLookupTableProgram.createLookupTable({
      authority: lutSigner,
      payer: signer,
      recentSlot,
    });

    const params: Parameters<
      typeof this.program.methods.switchboardPullFeedInit
    >[1] = {
      feedHash: Array.from(Buffer.from(feedHash.slice(2), "hex")),
      maxVariance: new BN(maxVariance),
      minResponses,
      name: Array.from(Buffer.from(padStringWithNullBytes(name))),
      recentSlot: new BN(recentSlot),
      ipfsHash: Array.from(new Uint8Array(32)), // Deprecated.
      minSampleSize,
      maxStaleness,
      permitWriteByAuthority,
    };

    const accounts: Parameters<
      ReturnType<
        typeof this.program.methods.switchboardPullFeedInit
      >["accountsStrict"]
    >[0] = {
      pullFeed,
      queue: this.queue.pubkey,
      authority: feedAuthority,
      payer: signer,
      systemProgram: SystemProgram.programId,
      programState: SwitchboardState.keyFromSeed(this.queue.program),
      rewardEscrow: getAssociatedTokenAddressSync(NATIVE_MINT, pullFeed, true),
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      wrappedSolMint: NATIVE_MINT,
      lutSigner,
      lut,
      addressLookupTableProgram: AddressLookupTableProgram.programId,
      ginkoAuthority,
      switchboardProgram: this.queue.program.programId,
      paymentMint,
    };

    return [
      await this.program.methods
        .switchboardPullFeedInit(assetNonce, params)
        .accountsStrict(accounts)
        .instruction(),
    ];
  }

  /**
   * Creates transaction instructions to update (crank) a Switchboard pull feed.
   *
   * @param {Object} params - Parameters for feed update
   * @param {PublicKey} params.feed - The public key of the feed to update
   * @param {PublicKey} params.signer - The public key of the signer
   * @returns {Promise<[TransactionInstruction[], AddressLookupTableAccount[]]>} Array of instructions and LUTs to update the feed
   */
  async update({
    feed,
    signer,
  }: {
    feed: PublicKey;
    signer: PublicKey;
  }): Promise<[TransactionInstruction[], AddressLookupTableAccount[]]> {
    const feedAccount = new PullFeed(this.queue.program, feed);
    const [submitIx, , , luts] = await feedAccount.fetchUpdateIx(
      {
        crossbarClient: this.crossbarClient,
      },
      undefined,
      undefined,
      undefined,
      signer,
    );

    if (!submitIx) {
      throw new Error("Failed to create update feed instruction");
    }

    return [[submitIx], luts];
  }

  async getFeedHash(
    ticker: string,
    {
      priceTaskURL = "https://go-ginko-prices.fly.dev/api/price",
      priceTaskJSONPath = "price",
      simulationURL = "https://api.switchboard.xyz/api/simulate",
      simulationCluster = "Mainnet",
    }: GetFeedHashConfig = {},
  ): Promise<string> {
    const jobs: OracleJob[] = [
      OracleJob.create({
        tasks: [
          {
            httpTask: {
              url: `${priceTaskURL}/${ticker}`,
              method: OracleJob.HttpTask.Method.METHOD_GET,
            },
          },
          {
            jsonParseTask: {
              path: priceTaskJSONPath,
              aggregationMethod: OracleJob.JsonParseTask.AggregationMethod.NONE,
            },
          },
        ],
      }),
    ];

    // Simulation start
    const serializedJobs = jobs.map((oracleJob) => {
      const encoded = OracleJob.encodeDelimited(oracleJob).finish();
      const base64 = Buffer.from(encoded).toString("base64");
      return base64;
    });

    const response = await fetch(simulationURL, {
      method: "POST",
      headers: [["Content-Type", "application/json"]],
      body: JSON.stringify({
        cluster: simulationCluster,
        jobs: serializedJobs,
      }),
    });

    if (!response.ok || response.status != 200) {
      throw await response.text();
    }
    const data = await response.json();
    if (data["result"] == null) {
      throw (
        data["results"]?.[0] ?? `Simulation failed: ${JSON.stringify(data)}`
      );
    }
    // Simulation end

    const { feedHash } = await this.crossbarClient.store(
      this.queue.pubkey.toBase58(),
      jobs,
    );
    return feedHash;
  }
}

export interface SwitchboardPullFeedInitParams {
  signer: PublicKey;
  assetNonce: number[];
  paymentMint: PublicKey;
  feedHash: string;
  name: string;
  feedAuthority?: PublicKey;
  maxVariance?: number;
  minResponses?: number;
  minSampleSize?: number;
  maxStaleness?: number;
  permitWriteByAuthority?: boolean | null;
}

export interface GetFeedHashConfig {
  priceTaskURL?: string;
  priceTaskJSONPath?: string;
  simulationURL?: string;
  simulationCluster?: "Mainnet" | "Devnet";
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

export async function PrepareCreateOracleInstructions(
  signer: PublicKey,
  ticker: string,
  noncePrefix: string,
  paymentMint: PublicKey,
  isDevnet: boolean,
  conn: Connection,
  priceUrl: string, // TODO maybe, Job is better
): Promise<TransactionInstruction[]> {
  const queue = await (isDevnet
    ? getDefaultDevnetQueue(conn.rpcEndpoint)
    : getDefaultQueue(conn.rpcEndpoint));

  const crossbarClient = CrossbarClient.default();

  const switchboardBuilder = new SwitchboardInstructionBuilder(
    conn,
    crossbarClient,
    queue,
  );

  // Get the feed hash
  const feedHash = await switchboardBuilder.getFeedHash(ticker, {
    priceTaskURL: `${priceUrl}/price`,
    simulationCluster: isDevnet ? "Devnet" : "Mainnet",
  });

  const asset = new OpenFIGIAsset(ticker, "TICKER", {
    noncePrefix,
  });
  const assetNonce = await asset.deriveNonce();

  // Get the public key of the oracle feed
  const pullFeed = SwitchboardOracleFeed.derivePublicKey(
    assetNonce,
    paymentMint,
  );
  console.log("Feed public key:", pullFeed.toBase58());

  // Calculate payer public key from credential file
  // Use the current signer's authority for simplification
  return await switchboardBuilder.pullFeedInit({
    signer,
    assetNonce,
    paymentMint,
    feedHash,
    name: `${ticker} / USD`,
    feedAuthority: signer,
  });
}
