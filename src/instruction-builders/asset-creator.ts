import { BN } from "@coral-xyz/anchor";
import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import { InstructionBuilder } from "./base";
import { Asset } from "../types";
import { AUTH_MINT } from "../constants";

/**
 * Builder for asset creator instructions in the Ginko Protocol.
 * Handles asset initialization and management for asset creators.
 */
export class AssetCreatorInstructionBuilder extends InstructionBuilder {
  /**
   * Creates a transaction instruction to initialize a new asset in the Ginko Protocol.
   *
   * @param {Object} params - The parameters for initializing an asset
   * @param {PublicKey} params.signer - The public key of the asset creator/admin
   * @param {Pick<Asset, "publicKey" | "mint" | "nonce">} params.asset - The public key, mint, and nonce of the asset account
   * @param {BN} params.minOrderSize - Minimum order size for this asset
   * @param {BN} params.ceiling - Maximum supply ceiling for this asset
   * @param {PublicKey} params.quotaPriceOracle - Oracle providing the price feed for quota calculation
   * @param {number} [params.tokenDecimals=6] - Asset mint decimals, defaults to 6
   *
   * @returns {Promise<TransactionInstruction[]>} Array containing the init asset instruction
   */
  async initAsset({
    signer,
    asset,
    minOrderSize,
    ceiling,
    quotaPriceOracle,
    tokenDecimals = 6,
  }: InitAssetParams): Promise<TransactionInstruction[]> {
    // Prepare the init asset parameters
    const assetParams: Parameters<typeof this.program.methods.initAsset>[0] = {
      nonce: asset.nonce,
      tokenDecimals,
      minOrderSize,
      ceiling,
      quotaPriceOracle,
    };

    const authority = getAssociatedTokenAddressSync(
      AUTH_MINT,
      signer,
      true,
      TOKEN_2022_PROGRAM_ID,
    );

    // Build the init asset instruction
    const accounts: Parameters<
      ReturnType<typeof this.program.methods.initAsset>["accountsStrict"]
    >[0] = {
      signer,
      authority,
      asset: asset.publicKey,
      mint: asset.mint,
      systemProgram: SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    };

    return [
      await this.program.methods
        .initAsset(assetParams)
        .accountsStrict(accounts)
        .instruction(),
    ];
  }
}

export interface InitAssetParams {
  signer: PublicKey;
  asset: Pick<Asset, "publicKey" | "mint" | "nonce">;
  minOrderSize: BN;
  ceiling: BN;
  quotaPriceOracle: PublicKey;
  tokenDecimals?: number;
}
