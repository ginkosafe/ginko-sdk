import { PublicKey } from "@solana/web3.js";
import { GINKO_IDL } from "./idl";

export const GINKO_PROGRAM = new PublicKey(GINKO_IDL.address);

export const AUTH_MINT = new PublicKey(
  "AUTHFNLJwJgscANs8Un8fPKm6ccZUxysQs94kQY1UutR",
);
export const QUOTA_MINT = new PublicKey(
  "quotRVKVgQHPwgeEMyqrYMH6ytb1RaazxDsiRTL6Xn5",
);

export const ASSET_SEED = Buffer.from("asset");
export const ASSET_MINT_SEED = Buffer.from("asset_mint");
export const ORDER_SEED = Buffer.from("order");
export const SWITCHBOARD_PULL_FEED_SEED = Buffer.from("switchboard_pull_feed");

// These are anchor specific constants for enums in the solana program;
// they should be used only internally.
export const ORDER_DIRECTION = {
  BUY: { buy: {} },
  SELL: { sell: {} },
} as const;

export const ORDER_TYPE = {
  MARKET: { market: {} },
  LIMIT: { limit: {} },
} as const;

export const ASSET_OP_TYPE = {
  MINT: { mint: {} },
  BURN: { burn: {} },
} as const;
