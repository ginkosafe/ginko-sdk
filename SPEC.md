## SDK Specification

### Account Data

```typescript
class AccountData {
  private connection: Connection;

  asset(publicKey: PublicKey): Promise<Asset>;
  assets(paused?: boolean): Promise<Asset[]>;

  order(publicKey: PublicKey): Promise<Order>;
  orders(
    owner?: PublicKey,
    asset?: PublicKey,
    paymentMint?: PublicKey,
  ): Promise<Order[]>;
}
```

### Instruction Builders

```typescript
class InstructionBuilder {
  protected connection: Connection;
  protected program: Program<GinkoProtocol>;
}

class PublicInstructionBuilder extends InstructionBuilder {
  placeOrder(params: {
    owner: PublicKey;
    asset: Pick<Asset, "publicKey" | "mint">;
    direction: OrderDirection;
    type: OrderType;
    quantity: BN;
    priceOracle: PublicKey;
    tradeMint: PublicKey; // token being traded with the asset token
    limitPrice?: Price | null; // required for limit orders, must be `null` for market orders
    slippageBps?: number; // required for market orders, must be `0` for limit orders
    expireTime?: number;
  }): Promise<TransactionInstruction[]>;

  cancelOrder(order: Order): Promise<TransactionInstruction[]>;
}

class AssetCreatorInstructionBuilder extends InstructionBuilder {
  initAsset(params: {
    signer: PublicKey;
    asset: Pick<Asset, "publicKey" | "mint" | "nonce">;
    minOrderSize: BN;
    ceiling: BN;
    quotaPriceOracle: PublicKey;
    tokenDecimals?: number;
  }): Promise<TransactionInstruction[]>;
}

class SettlerInstructionBuilder extends InstructionBuilder {
  fillOrder(params: {
    signer: PublicKey;
    order: Order;
    fillQuantity: BN;
    fillPrice: Price;
  }): Promise<TransactionInstruction[]>;

  gcOrder(params: {
    signer: PublicKey;
    order: Order;
  }): Promise<TransactionInstruction[]>;

  mintOrBurnAsset(params: {
    signer: PublicKey;
    asset: Asset;
    type: AssetOpType;
    quantity: BN;
  }): Promise<TransactionInstruction[]>;
}

class AdminInstructionBuilder extends InstructionBuilder {
  updateAsset(params: {
    signer: PublicKey;
    asset: PublicKey;
    minOrderSize?: BN | null;
    ceiling?: BN | null;
    paused?: boolean | null;
    quotaPriceOracle?: PublicKey | null;
  }): Promise<TransactionInstruction[]>;
}

class SwitchboardInstructionBuilder extends InstructionBuilder {
  private crossbarClient: CrossbarClient;
  private queue: Queue;

  pullFeedInit(params: {
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
  }): Promise<TransactionInstruction[]>;

  update(params: {
    feed: PublicKey;
    signer: PublicKey;
  }): Promise<[TransactionInstruction[], AddressLookupTableAccount[]]>;
}
```

### Public Key Derivation

```typescript
class OpenFIGIAsset {
  private apiURL: string = "https://api.openfigi.com/v3/mapping";

  public readonly idValue: string;
  public readonly idType: string;

  static fromNonce(nonce: number[], apiURL?: string): Promise<OpenFIGIAsset>;

  derivePublicKey(): Promise<PublicKey>;
  deriveMint(): Promise<PublicKey>;
  deriveNonce(): Promise<PublicKey>;
}

class SwitchboardOracleFeed {
  static derivePublicKey(asset: PublicKey): PublicKey;
}
```

### Constants

```typescript
const GINKO_PROGRAM = new PublicKey(GINKO_IDL.address);

const AUTH_MINT = new PublicKey("AUTHFNLJwJgscANs8Un8fPKm6ccZUxysQs94kQY1UutR");
const QUOTA_MINT = new PublicKey("quotRVKVgQHPwgeEMyqrYMH6ytb1RaazxDsiRTL6Xn5");

const ASSET_SEED = Buffer.from("asset");
const ASSET_MINT_SEED = Buffer.from("asset_mint");
const ORDER_SEED = Buffer.from("order");
const SWITCHBOARD_PULL_FEED_SEED = Buffer.from("switchboard_pull_feed");

// These are anchor specific constants for enums in the solana program;
// they should be used only internally.
const ORDER_DIRECTION = {
  BUY: { buy: {} },
  SELL: { sell: {} },
};

const ORDER_TYPE = {
  MARKET: { market: {} },
  LIMIT: { limit: {} },
};

const ASSET_OP_TYPE = {
  MINT: { mint: {} },
  BURN: { burn: {} },
};
```

### Types

```typescript
type OrderDirection = "buy" | "sell";
type OrderType = "market" | "limit";
type AssetOpType = "mint" | "burn";

type Price = {
  mantissa: BN;
  scale: number;
};

interface Asset {
  publicKey: PublicKey;
  nonce: number[];
  bump: number;
  mint: PublicKey;
  ceiling: BN;
  quotaPriceOracle: PublicKey;
  paused: boolean;
}

interface Order {
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
```
