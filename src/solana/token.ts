import BN from "bn.js"
import {
  getAssociatedTokenAddressSync,
  Account,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getMint,
  createAssociatedTokenAccountInstruction,
  Mint,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  Commitment,
  TransactionInstruction,
} from "@solana/web3.js";
import BigNumber from "bignumber.js";

BigNumber.config({ EXPONENTIAL_AT: 30 });

export type MintAccount = Mint;

export async function getTokenMintInfo(
  connection: Connection,
  mint: PublicKey
): Promise<MintAccount> {
  const mintInfo = await getMint(connection, mint);
  return mintInfo;
}

export async function getTokenAccountBalance(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey,
  decimals = 6
): Promise<number> {
  try {
    const tokenAccount = getAssociatedTokenAddressSync(mint, owner);
    const account = await getAccount(connection, tokenAccount);
    return toUINumber(new BN(account.amount.toString()), decimals);
  } catch (e) {
    if (
      e instanceof TokenAccountNotFoundError ||
      e instanceof TokenInvalidAccountOwnerError
    ) {
      return 0;
    }
    throw e;
  }
}

export async function solGetAssociatedTokenAccountAddress(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false,
  commitment?: Commitment,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
): Promise<PublicKey> {
  const associatedToken = getAssociatedTokenAddressSync(
    mint,
    owner,
    allowOwnerOffCurve,
    programId,
    associatedTokenProgramId
  );

  try {
    await getAccount(connection, associatedToken, commitment, programId);
  } catch (error: unknown) {
    throw error;
  }

  return associatedToken;
}

export async function solGetOrCreateAssociatedTokenAccountIx(
  connection: Connection,
  payerPublicKey: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false,
  commitment?: Commitment,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
): Promise<[TransactionInstruction[], PublicKey]> {
  const associatedToken = getAssociatedTokenAddressSync(
    mint,
    owner,
    allowOwnerOffCurve,
    programId,
    associatedTokenProgramId
  );

  let account: Account;
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    account = await getAccount(
      connection,
      associatedToken,
      commitment,
      programId
    );
  } catch (error: unknown) {
    if (
      error instanceof TokenAccountNotFoundError ||
      error instanceof TokenInvalidAccountOwnerError
    ) {
      const ix = createAssociatedTokenAccountInstruction(
        payerPublicKey,
        associatedToken,
        owner,
        mint,
        programId,
        associatedTokenProgramId
      );
      return [[ix], associatedToken];
    } else {
      throw error;
    }
  }

  return [[], associatedToken];
}

export function toUINumber(num: BN | number, decimals: number): number {
  if (!num) {
    return 0;
  }
  return new BigNumber(num.toString()).shiftedBy(-decimals).toNumber();
}

export function fromUINumber(num: number, decimals: number): BN {
  if (!num) {
    return new BN(0);
  }
  let big = new BigNumber(num)
    .shiftedBy(decimals)
    .decimalPlaces(0, BigNumber.ROUND_FLOOR);
  return new BN(big.toString());
}
