# Ginko Protocol TypeScript SDK

TypeScript SDK for interacting with Ginko Protocol. This SDK provides a high-level interface for managing assets, orders, and accounts on the Solana blockchain.

## Project Structure

```sh
sdk/
├── README.md                  # this file
├── SPEC.md                    # SDK specification
├── package.json               # dependencies and scripts
├── scripts/                   # example scripts
└── src/                       # source code
    ├── account-data.ts        # account data fetching
    ├── constants.ts           # protocol constants
    ├── instruction-builders/  # transaction instruction builders
    │   ├── admin.ts           # admin operations
    │   ├── asset-creator.ts   # asset creation
    │   ├── base.ts            # base instruction builder
    │   ├── public.ts          # public operations (orders)
    │   └── switchboard.ts     # oracle operations
    ├── json/                  # JSON utilities
    ├── public-key-derivation/ # PDA derivation utilities
    │   ├── open-figi-asset.ts  # OpenFIGI asset derivation
    │   └── switchboard-oracle-feed.ts  # Switchboard oracle feed derivation
    ├── solana/                # Solana utilities
    │   ├── connection.ts      # connection management
    │   ├── token.ts           # token account utilities
    │   └── tx.ts              # transaction utilities
    └── types.ts               # type definitions
```

## Installation

```bash
bun add @ginko/sdk
```

## Usage

The SDK is organized into modules that provide different functionality. Here are some common usage examples:

### Fetching Account Data

```typescript
import { Connection } from "@solana/web3.js";
import { AccountData, solConnectionFromEnv } from "@ginko/sdk";

// Create a connection to Solana
const connection = solConnectionFromEnv();

// Create AccountData instance for fetching account information
const accountData = new AccountData(connection);

// Fetch all assets
const allAssets = await accountData.assets();

// Fetch a specific asset
const asset = await accountData.asset(assetPublicKey);

// Fetch orders for a specific owner
const orders = await accountData.orders(ownerPublicKey);
```

### Placing Orders

```typescript
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import {
  PublicInstructionBuilder,
  solBuildTx,
  confirmTransaction,
  OpenFIGIAsset,
  SwitchboardOracleFeed,
} from "@ginko/sdk";

// Create a connection to Solana
const connection = new Connection(process.env.SOLANA_RPC_URL);

// Create instruction builder
const instructionBuilder = new PublicInstructionBuilder(connection);

// Setup asset (example using AAPL stock)
const asset = new OpenFIGIAsset("AAPL", "TICKER");
const assetPubkey = await asset.derivePublicKey();
const assetNonce = await asset.deriveNonce();
const assetMint = await asset.deriveMint();

// Setup oracle feed
const priceOracle = SwitchboardOracleFeed.derivePublicKey(
  assetNonce,
  tradeMint,
);

// Create place order instruction
const instructions = await instructionBuilder.placeOrder({
  owner: ownerPublicKey,
  asset: {
    publicKey: assetPubkey,
    mint: assetMint,
  },
  direction: "buy",
  type: "limit",
  quantity: new BN(1000000), // 1 unit with 6 decimals
  priceOracle,
  tradeMint, // The token you're trading with
  limitPrice: {
    mantissa: new BN(250_000_000),
    scale: 6,
  }, // Price of $250 with 6 decimals
});

// Build and sign the transaction
const { versionedTx, lastValidHeight } = await solBuildTx(
  connection,
  ownerPublicKey,
  instructions,
  true, // Enable simulation
);

// Sign and send the transaction
versionedTx.sign([ownerKeypair]);
const signature = await connection.sendTransaction(versionedTx);

// Wait for confirmation
await confirmTransaction(connection, lastValidHeight, signature);
```

### Canceling Orders

```typescript
import { PublicInstructionBuilder, AccountData } from "@ginko/sdk";

// Fetch the order
const order = await accountData.order(orderPublicKey);

// Create cancel order instruction
const instructions = await instructionBuilder.cancelOrder(order);

// Build, sign, and send the transaction as shown above
```

See the `scripts/` directory for more complete examples of how to use the SDK.

## SDK Functions

### Account Data (`account-data.ts`)

The `AccountData` class provides methods to fetch Ginko account data from the blockchain:

- `asset(publicKey: PublicKey)`: Fetch asset data for a given public key
- `assets(paused?: boolean)`: Fetch assets with optional filter by paused status
- `order(publicKey: PublicKey)`: Fetch order data for a given public key
- `orders(owner?: PublicKey, asset?: PublicKey, paymentMint?: PublicKey)`: Fetch orders with optional filters

### Instruction Builders

The SDK provides several instruction builders for different types of operations:

#### Public Instructions (`instruction-builders/public.ts`)

The `PublicInstructionBuilder` handles order placement and cancellation for regular users:

- `placeOrder(params)`: Creates transaction instructions to place an order
  - Parameters include: owner, asset, direction, type, quantity, priceOracle, tradeMint, limitPrice, slippageBps, expireTime
- `cancelOrder(order)`: Creates a transaction instruction to cancel an existing order
- `parsePrice(priceInput, decimals)`: Parses a user-entered price string into a `Price` object

#### Asset Creator Instructions (`instruction-builders/asset-creator.ts`)

The `AssetCreatorInstructionBuilder` handles asset initialization and management for asset creators:

- `initAsset(params)`: Creates a transaction instruction to initialize a new asset
  - Parameters include: signer, asset, minOrderSize, ceiling, quotaPriceOracle, tokenDecimals

#### Admin Instructions (`instruction-builders/admin.ts`)

The `AdminInstructionBuilder` handles asset management operations for admin users:

- `updateAsset(params)`: Creates a transaction instruction to update an existing asset
  - Parameters include: signer, asset, minOrderSize, ceiling, paused, quotaPriceOracle

#### Switchboard Instructions (`instruction-builders/switchboard.ts`)

The `SwitchboardInstructionBuilder` handles oracle initialization and updates:

- `pullFeedInit(params)`: Creates transaction instructions to initialize a Switchboard pull feed
  - Parameters include: signer, assetNonce, paymentMint, feedHash, name, feedAuthority, maxVariance, minResponses, minSampleSize, maxStaleness, permitWriteByAuthority
- `update(params)`: Creates transaction instructions to update (crank) a Switchboard pull feed
- `getFeedHash(ticker, config)`: Gets the feed hash for a ticker symbol

### Public Key Derivation

#### OpenFIGI Asset (`public-key-derivation/open-figi-asset.ts`)

The `OpenFIGIAsset` class provides methods to derive public keys for assets based on OpenFIGI identifiers:

- `static fromNonce(nonce, config)`: Creates an OpenFIGIAsset from a nonce
- `derivePublicKey()`: Derives the public key for the asset
- `deriveMint()`: Derives the mint public key for the asset
- `deriveNonce()`: Derives the nonce for the asset

#### Switchboard Oracle Feed (`public-key-derivation/switchboard-oracle-feed.ts`)

The `SwitchboardOracleFeed` class provides methods to derive public keys for Switchboard oracle feeds:

- `static derivePublicKey(nonce, paymentMint)`: Derives the public key for a Switchboard oracle feed

### Types (`types.ts`)

```typescript
// Order and Asset Types
type OrderDirection = "buy" | "sell";
type OrderType = "market" | "limit";
type AssetOpType = "mint" | "burn";

// Price representation for fixed-point arithmetic
type Price = {
  mantissa: BN; // Integer representation
  scale: number; // Decimal places (typically 6)
};

// Asset account data
interface Asset {
  publicKey: PublicKey; // Address of the asset account
  nonce: number[]; // Nonce used to derive the address
  bump: number; // PDA bump
  mint: PublicKey; // Asset token mint
  ceiling: BN; // Maximum supply ceiling
  quotaPriceOracle: PublicKey; // Oracle for quota calculation
  paused: boolean; // Whether trading is paused
}

// Order account data
interface Order {
  publicKey: PublicKey; // Address of the order account
  nonce: number[]; // Nonce used to derive the address
  bump: number; // PDA bump
  owner: PublicKey; // Order creator
  asset: PublicKey; // Asset being traded
  inputHolder: PublicKey; // Escrow account for input tokens
  paymentMint: PublicKey; // Payment token mint
  priceOracle: PublicKey; // Oracle providing price feed
  direction: OrderDirection; // Buy or sell
  type: OrderType; // Market or limit
  limitPrice: Price | null; // Target price for limit orders
  inputQuantity: BN; // Amount of input tokens
  slippageBps: number; // Maximum price deviation in basis points
  createdAt: Date; // Creation timestamp
  expireAt: Date; // Expiration timestamp
  canceledAt: Date | null; // Cancellation timestamp
  filledQuantity: BN; // Amount of input tokens filled
  filledOutputQuantity: BN; // Amount of output tokens received
  lastFillSlot: BN; // Last slot when the order was filled
}
```

### Parameter Types

```typescript
// Parameters for placing an order
interface PlaceOrderParams {
  owner: PublicKey; // Order creator
  asset: Pick<Asset, "publicKey" | "mint">; // Asset to trade
  direction: OrderDirection; // Buy or sell
  type: OrderType; // Market or limit
  quantity: BN; // Amount to trade
  priceOracle: PublicKey; // Oracle for price feed
  tradeMint: PublicKey; // Token to trade with
  limitPrice?: Price | null; // Target price for limit orders
  slippageBps?: number; // Max price deviation for market orders
  expireTime?: number; // Time until expiration in seconds
}

// Parameters for initializing an asset
interface InitAssetParams {
  signer: PublicKey; // Asset creator/admin
  asset: Pick<Asset, "publicKey" | "mint" | "nonce">; // Asset details
  minOrderSize: BN; // Minimum order size
  ceiling: BN; // Maximum supply ceiling
  quotaPriceOracle: PublicKey; // Oracle for quota calculation
  tokenDecimals?: number; // Asset token decimals
}

// Parameters for updating an asset
interface UpdateAssetParams {
  signer: PublicKey; // Admin
  asset: PublicKey; // Asset to update
  minOrderSize?: BN | null; // New minimum order size
  ceiling?: BN | null; // New maximum supply ceiling
  paused?: boolean | null; // Whether to pause trading
  quotaPriceOracle?: PublicKey | null; // New oracle for quota calculation
}

// Parameters for initializing a Switchboard pull feed
interface SwitchboardPullFeedInitParams {
  signer: PublicKey; // Feed creator
  assetNonce: number[]; // Asset nonce
  paymentMint: PublicKey; // Payment token mint
  feedHash: string; // Feed hash
  name: string; // Feed name
  feedAuthority?: PublicKey; // Feed authority
  maxVariance?: number; // Maximum variance allowed
  minResponses?: number; // Minimum number of responses
  minSampleSize?: number; // Minimum sample size
  maxStaleness?: number; // Maximum staleness in seconds
  permitWriteByAuthority?: boolean | null; // Allow authority to write
}
```

## Solana Utilities

### Connection Management (`solana/connection.ts`)

```typescript
// Create a Solana connection from environment variables (SOLANA_RPC_URL and SOLANA_RPC_COMMITMENT)
function solConnectionFromEnv(): Connection;

// Create a Solana connection with specified URL and commitment
function connection(url: string, commitment: string = "confirmed"): Connection;
```

### Token Utilities (`solana/token.ts`)

```typescript
// Get token mint information
async function getTokenMintInfo(
  connection: Connection,
  mint: PublicKey,
): Promise<MintAccount>;

// Get token balance for an account
async function getTokenAccountBalance(
  connection: Connection,
  owner: PublicKey,
  mint: PublicKey,
  decimals = 6,
): Promise<number>;

// Get associated token account address, throws if account doesn't exist
async function solGetAssociatedTokenAccountAddress(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false,
  commitment?: Commitment,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
): Promise<PublicKey>;

// Get or create associated token account instruction
async function solGetOrCreateAssociatedTokenAccountIx(
  connection: Connection,
  payerPublicKey: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false,
  commitment?: Commitment,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID,
): Promise<[TransactionInstruction[], PublicKey]>;

// Convert raw number to UI format (shift decimal places)
function toUINumber(num: BN | number, decimals: number): number;

// Convert UI number to raw format (shift decimal places)
function fromUINumber(num: number, decimals: number): BN;
```

### Transaction Utilities (`solana/tx.ts`)

```typescript
// Build and optionally simulate a transaction
async function solBuildTx(
  conn: Connection,
  payerPublicKey: PublicKey,
  ixs: TransactionInstruction[],
  simulate = false,
  luts?: AddressLookupTableAccount[],
): Promise<{ lastValidHeight: number; versionedTx: VersionedTransaction }>;

// Wait for transaction confirmation
async function confirmTransaction(
  conn: Connection,
  lastValidHeight: number,
  txId: string,
): Promise<string>;

// Check if a blockhash has expired
async function isBlockhashExpired(
  connection: Connection,
  lastValidBlockHeight: number,
): Promise<boolean>;
```

## JSON Utilities (`json/json.ts`)

The SDK provides utilities for serializing and deserializing complex objects to and from JSON:

```typescript
// Convert an object to a JSON string with proper handling of special types
// (PublicKey, BN, Buffer, Date, BigInt, etc.)
function toJSON(obj: any, format?: JSONFormat, space = 2): string;

// Convert a JSON string or object back to its original form with proper type reconstruction
function fromJSON(obj: any): any;
```

These utilities are particularly useful when working with complex objects that contain Solana-specific types like `PublicKey` or `BN` that don't have standard JSON representations.

## Development

### Getting Started

```bash
# Install dependencies
bun install

# Build the SDK
bun run build
```

### Running Examples

The SDK includes several example scripts in the `scripts/` directory:

```bash
# Run an example script
bun scripts/get-assets.ts

# Place a limit order
bun scripts/place-limit-order.ts

# Cancel an order
bun scripts/cancel-order.ts
```
