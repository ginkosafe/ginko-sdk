import BN from "bn.js"
import {
  PublicKey,
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

import { InstructionBuilder } from "./base.js";
import { OrderDirection, OrderType, Price, Order, Asset } from "../types.js";
import {
  GINKO_PROGRAM,
  ORDER_SEED,
  ORDER_DIRECTION,
  ORDER_TYPE,
} from "../constants.js";
import { solGetOrCreateAssociatedTokenAccountIx } from "../solana/index.js";
import BigNumber from "bignumber.js";

/**
 * Builder for public-facing instructions in the Ginko Protocol.
 * Handles order placement and cancellation for regular users.
 */
export class PublicInstructionBuilder extends InstructionBuilder {
  /**
   * placeOrder creates transaction instructions to swap an asset with another token (the "trade token")
   * in the Ginko Protocol. Based on the specified trade direction, this method automatically
   * derives the correct inputMint and outputMint using `tradeMint`, then delegates to
   * {@link placeOrder}.
   *
   * - If `direction` is `"buy"`, the `tradeMint` will be used as the input mint (i.e., the token
   *   you spend to acquire the asset).
   * - If `direction` is `"sell"`, the `tradeMint` will be used as the output mint (i.e., the token
   *   you receive in exchange for the asset).
   *
   * @param {Object} params - The parameters for placing an order
   * @param {PublicKey} params.owner - The public key of the order creator
   * @param {Pick<Asset, "publicKey" | "mint">} params.asset - Asset being traded
   * @param {OrderDirection} params.direction - Whether to buy or sell the asset
   * @param {OrderType} params.type - Whether this is a market or limit order
   * @param {BN} params.quantity - The amount of input tokens to trade
   * @param {PublicKey} params.priceOracle - Oracle providing the price feed
   * @param {PublicKey} [params.tradeMint] - The mint of the trade token
   * @param {Price | null} [params.limitPrice=null] - Target price for limit orders, null for market orders
   * @param {number} [params.slippageBps=0] - Maximum allowed price deviation in basis points (1/10000), must be 0 for limit orders
   * @param {number} [params.expireTime=10800] - Time in seconds until the order expires (default 3 hours)
   *
   * @returns {Promise<TransactionInstruction[]>} Array containing the place order instructions
   *
   * @throws {Error} If required parameters are invalid
   */
  async placeOrder({
    owner,
    asset,
    direction,
    type,
    quantity,
    priceOracle,
    tradeMint,
    limitPrice = null,
    slippageBps = 0,
    expireTime = 3600 * 3,
  }: PlaceOrderParams): Promise<TransactionInstruction[]> {
    // Validate input parameters
    if (tradeMint === asset.mint) {
      throw new Error(
        "Invalid parameter: `tradeMint` cannot be the same as the `asset.mint`",
      );
    }

    // Runtime type validation
    if (type === "limit") {
      if (limitPrice === null) {
        throw new Error("Limit orders require a limitPrice");
      }
      if (slippageBps !== 0) {
        throw new Error("Limit orders must have slippageBps set to 0");
      }
    } else if (type === "market") {
      if (limitPrice !== null) {
        throw new Error("Market orders should not have a limitPrice");
      }
      if (slippageBps === 0) {
        throw new Error("Market orders must have non-zero slippageBps");
      }
    }

    let createUserOutputReceiverIxs: TransactionInstruction[] | undefined = [];
    if (direction === "sell") {
      // Create user output receiver if needed
      [createUserOutputReceiverIxs] =
        await solGetOrCreateAssociatedTokenAccountIx(
          this.connection,
          owner,
          tradeMint,
          owner,
          false,
          this.connection.commitment,
          // TODO: handle token 2022
        );
    }

    // Generate a random nonce for the order
    const nonceU8Array = new Uint8Array(32);
    crypto.getRandomValues(nonceU8Array);
    const nonce = Array.from(nonceU8Array);

    // Calculate current timestamp and expiration
    const now = Math.floor(Date.now() / 1000);
    const expireAt = now + expireTime;

    // Derive the order PDA
    const [order] = PublicKey.findProgramAddressSync(
      [ORDER_SEED, owner.toBuffer(), nonceU8Array],
      GINKO_PROGRAM,
    );

    const assetExist =
      (await this.program.account.asset.getAccountInfo(asset.publicKey)) !=
      null;

    const inputMint = direction === "buy" ? tradeMint : asset.mint;
    const outputMint =
      direction === "buy" ? (assetExist ? asset.mint : null) : tradeMint;

    // Get the order input holder ATA
    const orderInputHolder = getAssociatedTokenAddressSync(
      inputMint,
      order,
      true,
      // TODO: handle token 2022
    );

    // Get the user input holder ATA
    const userInputHolder = getAssociatedTokenAddressSync(
      inputMint,
      owner,
      false,
      // TODO: handle token 2022
    );

    // Prepare the order parameters
    const orderParams: Parameters<typeof this.program.methods.placeOrder>[0] = {
      nonce,
      direction:
        direction === "buy" ? ORDER_DIRECTION.BUY : ORDER_DIRECTION.SELL,
      typ: type === "market" ? ORDER_TYPE.MARKET : ORDER_TYPE.LIMIT,
      limitPrice,
      inputQty: quantity,
      slippageBps,
      expireAt: new BN(expireAt),
    };

    // Build the place order instruction
    const accounts: Parameters<
      ReturnType<typeof this.program.methods.placeOrder>["accountsStrict"]
    >[0] = {
      owner,
      order,
      asset: asset.publicKey,
      inputMint,
      orderInputHolder,
      userInputHolder,
      priceOracle,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
      outputMint,
    };

    return [
      ...createUserOutputReceiverIxs,
      await this.program.methods
        .placeOrder(orderParams)
        .accountsStrict(accounts)
        .instruction(),
    ];
  }

  /**
   * Creates a transaction instruction to cancel an existing order.
   *
   * @param {Order} order - The order to cancel
   * @returns {Promise<TransactionInstruction[]>} Array containing the cancel order instruction
   *
   * @throws {Error} If the order is invalid or already cancelled
   */
  async cancelOrder(order: Order): Promise<TransactionInstruction[]> {
    let inputMint = order.paymentMint;

    // if sell, fetch asset to get the asset mint
    if (order.direction === "sell") {
      const asset = await this.program.account.asset.fetch(order.asset);
      inputMint = asset.mint;
    }

    // Get the order input holder ATA (escrow account)
    const orderInputHolder = getAssociatedTokenAddressSync(
      inputMint,
      order.publicKey,
      true,
      // TODO: handle token 2022
    );

    // Get the refund receiver ATA (user's token account), if it doesn't exist, create it
    const [createRefundReceiverIxs, refundReceiver] =
      await solGetOrCreateAssociatedTokenAccountIx(
        this.connection,
        order.owner,
        inputMint,
        order.owner,
        false,
        this.connection.commitment,
        // TODO: handle token 2022
      );

    // Build the cancel order instruction
    const accounts: Parameters<
      ReturnType<typeof this.program.methods.cancelOrder>["accountsStrict"]
    >[0] = {
      owner: order.owner,
      order: order.publicKey,
      orderInputHolder,
      refundReceiver,
      tokenProgram: TOKEN_PROGRAM_ID,
    };

    return [
      ...createRefundReceiverIxs,
      await this.program.methods
        .cancelOrder()
        .accountsStrict(accounts)
        .instruction(),
    ];
  }
}

/**
 * Parses a user-entered price string (e.g., "1.2345") into a `Price` object
 * that stores the value in a fixed-point integer format.
 *
 * This function:
 * 1. Converts the user input (string) into a floating number.
 * 2. Shifts that value by `decimals` places (default 6), turning it
 *    into an integer count of the smallest representable unit.
 * 3. Floors to remove any fraction beyond `decimals`.
 * 4. Returns a `Price` object with:
 *    - `mantissa`: the integer representation (BN).
 *    - `scale`: how many decimal places we shifted (number).
 *
 * For example:
 *   PriceFromUI("1.2345", 6)
 * will produce:
 *   {
 *     mantissa: BN("1234500"),  // integer 1,234,500
 *     scale: 6
 *   }
 *
 * This is useful for:
 * - Ensuring all price arithmetic is done using integers rather than floats.
 * - Storing or serializing the price in on-chain programs or low-level systems.
 *
 * @param priceInput    The user-entered price string (e.g. "1.2345").
 * @param decimals How many decimal places to shift the input price (default = 6).
 * @returns        A `Price` object with integer mantissa and associated scale.
 */
export function parsePrice(priceInput: string, decimals: number = 6): Price {
  // Use bignumber.js to shift the decimal point and floor.
  const big = new BigNumber(priceInput)
    .shiftedBy(decimals)
    .decimalPlaces(0, BigNumber.ROUND_FLOOR);

  return {
    mantissa: new BN(big.toString()),
    scale: decimals,
  };
}

export interface PlaceOrderParams {
  owner: PublicKey;
  asset: Pick<Asset, "publicKey" | "mint">;
  direction: OrderDirection;
  type: OrderType;
  quantity: BN;
  priceOracle: PublicKey;
  tradeMint: PublicKey; // token being traded with the asset token
  limitPrice?: Price | null; // required for limit orders, null for market orders
  slippageBps?: number; // 0 for limit orders
  expireTime?: number;
}
