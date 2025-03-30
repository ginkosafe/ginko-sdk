import type { PublicKey } from "@solana/web3.js";
import type { BN } from "@coral-xyz/anchor";

export type OrderDirection = "buy" | "sell";
export type OrderType = "market" | "limit";
export type AssetOpType = "mint" | "burn";

export type Price = {
  mantissa: BN;
  scale: number;
};

export interface Asset {
  publicKey: PublicKey;
  nonce: number[];
  bump: number;
  mint: PublicKey;
  ceiling: BN;
  quotaPriceOracle: PublicKey;
  paused: boolean;
}

export interface Order {
  publicKey: PublicKey;
  nonce: number[];
  bump: number;
  owner: PublicKey;
  asset: PublicKey;
  inputHolder: PublicKey;
  paymentMint: PublicKey;
  priceOracle: PublicKey;
  direction: OrderDirection;
  type: OrderType;
  limitPrice: Price | null;
  inputQuantity: BN;
  slippageBps: number;
  createdAt: Date;
  expireAt: Date;
  canceledAt: Date | null;
  filledQuantity: BN;
  filledOutputQuantity: BN;
  lastFillSlot: BN;
}
