import {
  Connection,
  PublicKey,
  TransactionInstruction,
  VersionedTransaction,
  TransactionMessage,
  AddressLookupTableAccount,
  Keypair,
} from "@solana/web3.js";
import { sleep } from "@switchboard-xyz/on-demand";

export async function solBuildTx(
  conn: Connection,
  payerPublicKey: PublicKey,
  ixs: TransactionInstruction[],
  simulate = false,
  luts?: AddressLookupTableAccount[],
): Promise<{ lastValidHeight: number; versionedTx: VersionedTransaction }> {
  const latestBlockhash = await conn.getLatestBlockhash();

  const messageV0 = new TransactionMessage({
    payerKey: payerPublicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions: ixs,
  }).compileToV0Message(luts);

  const versionedTx = new VersionedTransaction(messageV0);

  if (simulate) {
    const sim = await conn.simulateTransaction(versionedTx);
    const logs = sim.value.logs?.join("\n");
    // console.log("logs", logs);
    if (sim.value.err) {
      console.log("sim.value.err", sim.value.err);
      // extract the error message from the logs
      const error = logs?.match(/Error: (.*)/)?.[1];
      throw new Error(error ?? logs);
    }
  }

  return { versionedTx, lastValidHeight: latestBlockhash.lastValidBlockHeight };
}

export const confirmTransaction = async (
  conn: Connection,
  lastValidHeight: number,
  txId: string,
) => {
  let hashExpired = false;
  let txSuccess = false;

  const START_TIME = new Date();

  while (!hashExpired && !txSuccess) {
    const { value: statuses } = await conn.getSignatureStatuses([txId]);

    if (!statuses || statuses.length === 0) {
      throw new Error("Failed to get signature status");
    }

    const status = statuses[0];

    if (status?.err) {
      throw new Error(`Transaction failed: ${status?.err}`);
    }
    // Break loop if transaction has succeeded
    if (
      status &&
      (status.confirmationStatus === "confirmed" ||
        status.confirmationStatus === "finalized")
    ) {
      txSuccess = true;
      const endTime = new Date();
      const elapsed = (endTime.getTime() - START_TIME.getTime()) / 1000;
      console.log(`Transaction confirmed. Elapsed time: ${elapsed} seconds.`);
      break;
    }

    hashExpired = await isBlockhashExpired(conn, lastValidHeight);

    // Break loop if blockhash has expired
    if (hashExpired) {
      const endTime = new Date();
      const elapsed = (endTime.getTime() - START_TIME.getTime()) / 1000;
      console.log(`Blockhash has expired. Elapsed time: ${elapsed} seconds.`);
      // (add your own logic to Fetch a new blockhash and resend the transaction or throw an error)
      break;
    }

    await sleep(300);
  }

  if (!txSuccess) {
    throw new Error("Transaction failed, try to send it again");
  }

  return txId;
};

async function isBlockhashExpired(
  connection: Connection,
  lastValidBlockHeight: number,
) {
  const currentBlockHeight = await connection.getBlockHeight("finalized");
  // console.log('                           ');
  // console.log('Current Block height:             ', currentBlockHeight);
  // console.log(
  //   'Last Valid Block height + 150:     ',
  //   lastValidBlockHeight + 150
  // );
  // console.log('--------------------------------------------');
  // console.log(
  //   'Difference:                      ',
  //   currentBlockHeight - (lastValidBlockHeight + 150)
  // ); // If Difference is positive, blockhash has expired.
  // console.log('                           ');
  return currentBlockHeight > lastValidBlockHeight + 150;
}

export async function signAndSendTransaction(
  conn: Connection,
  wallet: Keypair,
  instructions: TransactionInstruction[],
): Promise<string> {
  const { versionedTx: tx, lastValidHeight } = await solBuildTx(
    conn,
    wallet.publicKey,
    instructions,
    true, // Enable simulation
  );

  tx.sign([wallet]);

  const signature = await conn.sendTransaction(tx, {
    skipPreflight: false,
    preflightCommitment: "confirmed",
    maxRetries: 5,
  });

  await confirmTransaction(conn, lastValidHeight, signature);
  return signature;
}
