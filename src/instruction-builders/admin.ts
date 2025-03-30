import { BN } from "@coral-xyz/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";

import { InstructionBuilder } from "./base";
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { AUTH_MINT } from "../constants";

/**
 * Builder for admin instructions in the Ginko Protocol.
 * Handles asset management operations for admin users.
 */
export class AdminInstructionBuilder extends InstructionBuilder {
  /**
   * Creates a transaction instruction to update an existing asset in the Ginko Protocol.
   *
   * @param {Object} params - The parameters for updating an asset
   * @param {PublicKey} params.signer - The public key of the admin
   * @param {PublicKey} params.asset - The public key of the asset account
   * @param {BN} [params.minOrderSize=null] - New minimum order size for this asset
   * @param {BN} [params.ceiling=null] - New maximum supply ceiling for this asset
   * @param {boolean} [params.paused=null] - Whether trading should be paused for this asset
   * @param {PublicKey} [params.quotaPriceOracle=null] - Oracle providing the price feed for quota calculation
   *
   * @returns {Promise<TransactionInstruction[]>} Array containing the update asset instruction
   */
  async updateAsset({
    signer,
    asset,
    minOrderSize = null,
    ceiling = null,
    paused = null,
    quotaPriceOracle = null,
  }: UpdateAssetParams): Promise<TransactionInstruction[]> {
    // Prepare the update asset parameters
    const assetParams: Parameters<typeof this.program.methods.updateAsset>[0] =
      {
        minOrderSize,
        ceiling,
        paused,
        quotaPriceOracle,
      };

    const authority = getAssociatedTokenAddressSync(
      AUTH_MINT,
      signer,
      true,
      TOKEN_2022_PROGRAM_ID,
    );

    // Build the update asset instruction
    const accounts: Parameters<
      ReturnType<typeof this.program.methods.updateAsset>["accountsStrict"]
    >[0] = {
      signer,
      authority,
      asset,
    };

    return [
      await this.program.methods
        .updateAsset(assetParams)
        .accountsStrict(accounts)
        .instruction(),
    ];
  }
}

export interface UpdateAssetParams {
  signer: PublicKey;
  asset: PublicKey;
  minOrderSize?: BN | null;
  ceiling?: BN | null;
  paused?: boolean | null;
  quotaPriceOracle?: PublicKey | null;
}
