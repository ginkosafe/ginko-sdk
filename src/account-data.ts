import {
  Connection,
  GetProgramAccountsFilter,
  PublicKey,
} from "@solana/web3.js";
import { IdlAccounts, Program } from "@coral-xyz/anchor";
import { Asset, Order } from "./types";
import { GINKO_IDL, GinkoProtocol } from "./idl";

/**
 * AccountData provides methods to fetch Ginko account data from the blockchain
 */
export class AccountData {
  private program: Program<GinkoProtocol>;

  /**
   * @param connection - Solana connection instance
   */
  constructor(private connection: Connection) {
    this.program = new Program(GINKO_IDL as GinkoProtocol, {
      connection,
    });
  }

  /**
   * Fetch asset data for a given public key
   * @param publicKey - Public key of the asset account
   * @returns Promise resolving to Asset data
   */
  async asset(publicKey: PublicKey): Promise<Asset> {
    const account = await this.program.account.asset.fetch(publicKey);
    return this.convertAsset(publicKey, account);
  }

  /**
   * Fetch assets with optional filters
   * @param paused - Optional boolean to filter by paused status
   * @returns Promise resolving to array of Asset data
   */
  async assets(paused?: boolean): Promise<Asset[]> {
    const filters: GetProgramAccountsFilter[] = [];

    if (paused !== undefined) {
      filters.push({
        memcmp: {
          // discriminator, nonce, bump, mint, min_order_size, ceiling, quota_price_oracle
          offset: 8 + 32 + 1 + 32 + 8 + 8 + 32,
          bytes: paused ? "2" : "1", // this is not a typo, it's base58!
        },
      });
    }

    const accounts = await this.program.account.asset.all(filters);
    return accounts.map(({ publicKey, account }) =>
      this.convertAsset(publicKey, account),
    );
  }

  /**
   * Fetch order data for a given public key
   * @param publicKey - Public key of the order account
   * @returns Promise resolving to Order data
   */
  async order(publicKey: PublicKey): Promise<Order> {
    const account = await this.program.account.order.fetch(publicKey);
    return this.convertOrder(publicKey, account);
  }

  /**
   * Fetch orders with optional filters
   * @dev getProgramAccounts RPC method supports up to 4 filters, and there is a
   * discriminator filter
   * @param owner - Optional public key of the order owner
   * @param asset - Optional public key of the asset
   * @param paymentMint - Optional public key of the payment mint (input mint
   * for buy orders, output mint for sell orders)
   * @returns Promise resolving to array of Order data
   */
  async orders(
    owner?: PublicKey,
    asset?: PublicKey,
    paymentMint?: PublicKey,
  ): Promise<Order[]> {
    let filters: GetProgramAccountsFilter[] = [];

    if (owner !== undefined) {
      filters.push({
        memcmp: {
          offset: 8, // discriminator
          bytes: owner.toBase58(),
        },
      });
    }

    if (asset !== undefined) {
      filters.push({
        memcmp: {
          offset: 8 + 32, // discriminator, owner
          bytes: asset.toBase58(),
        },
      });
    }

    if (paymentMint !== undefined) {
      filters.push({
        memcmp: {
          // discriminator, owner, asset, nonce, bump, and input_holder
          offset: 8 + 32 + 32 + 32 + 1 + 32,
          bytes: paymentMint.toBase58(),
        },
      });
    }

    const accounts = await this.program.account.order.all(filters);
    return accounts.map(({ publicKey, account }) =>
      this.convertOrder(publicKey, account),
    );
  }

  /**
   * Convert anchor asset account to `Asset`
   * @param publicKey - Public key of the asset account
   * @param account - Asset account
   * @returns Asset data
   */
  private convertAsset(
    publicKey: PublicKey,
    account: IdlAccounts<GinkoProtocol>["asset"],
  ): Asset {
    return {
      publicKey,
      nonce: account.nonce,
      bump: account.bump,
      mint: account.mint,
      ceiling: account.ceiling,
      quotaPriceOracle: account.quotaPriceOracle,
      paused: account.paused,
    };
  }

  /**
   * Convert anchor order account to `Order`
   * @param publicKey - Public key of the order account
   * @param account - Order account
   * @returns Order data
   */
  private convertOrder(
    publicKey: PublicKey,
    account: IdlAccounts<GinkoProtocol>["order"],
  ): Order {
    return {
      publicKey,
      nonce: account.nonce,
      bump: account.bump,
      owner: account.owner,
      asset: account.asset,
      inputHolder: account.inputHolder,
      paymentMint: account.paymentMint,
      priceOracle: account.priceOracle,
      direction: account.direction.buy != null ? "buy" : "sell",
      type: account.typ.market != null ? "market" : "limit",
      limitPrice: account.limitPrice,
      inputQuantity: account.inputQty,
      slippageBps: account.slippageBps,
      createdAt: new Date(account.createdAt.toNumber() * 1000),
      expireAt: new Date(account.expireAt.toNumber() * 1000),
      canceledAt: account.canceledAt
        ? new Date(account.canceledAt.toNumber() * 1000)
        : null,
      filledQuantity: account.filledQty,
      filledOutputQuantity: account.filledOutputQty,
      lastFillSlot: account.lastFillSlot,
    };
  }
}
