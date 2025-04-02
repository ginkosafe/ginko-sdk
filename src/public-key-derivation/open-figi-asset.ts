import { PublicKey } from "@solana/web3.js";
import { ASSET_MINT_SEED, ASSET_SEED, GINKO_PROGRAM } from "../constants.js";

const DEFAULT_API_URL = "https://api.openfigi.com/v3/mapping";
const DEFAULT_NONCE_PREFIX = "OpenFIGI:";

export class OpenFIGIAsset {
  private figiItem?: OpenFIGIItem;
  private publicKey?: PublicKey;
  private mint?: PublicKey;

  get figi() {
    return this.figiItem?.figi ?? "";
  }

  get category() {
    return this.figiItem?.securityType2 ?? "";
  }

  get figiData() {
    return this.figiItem;
  }

  constructor(
    public readonly idValue: string,
    public readonly idType: string,
    private config: OpenFIGIAssetConfig = {},
    figiItem?: OpenFIGIItem,
  ) {
    if (config.noncePrefix == null) {
      config.noncePrefix = DEFAULT_NONCE_PREFIX;
    }

    if (config.figiProps == null) {
      config.figiProps = {
        exchCode: "US",
      };
    }
    if (figiItem) {
      this.figiItem = figiItem;
    }
  }

  static async fromSymbols(
    symbols: string[],
    idTypes: string[],
    config: OpenFIGIAssetConfig = {},
  ): Promise<OpenFIGIAsset[]> {
    if (config.noncePrefix == null) {
      config.noncePrefix = DEFAULT_NONCE_PREFIX;
    }
    if (config.figiProps == null) {
      config.figiProps = {
        exchCode: "US",
      };
    }

    const figiItems = await fetchFIGIBatch(idTypes, symbols, {
      ...config.figiProps,
    }, config?.apiURL);

    const assets = [];
    for (const figiItem of figiItems) {
      if (figiItem.ticker == null) {
        continue;
      }
      const asset = new OpenFIGIAsset(figiItem.ticker, "TICKER", config, figiItem);
      await asset.deriveMint();
      await asset.derivePublicKey();
      assets.push(asset);
    }

    return assets;
  }

  static async fromNonce(
    nonce: number[],
    config: Omit<OpenFIGIAssetConfig, "figiProps"> = {},
  ): Promise<OpenFIGIAsset> {
    if (config.noncePrefix == null) {
      config.noncePrefix = DEFAULT_NONCE_PREFIX;
    }

    const nonceString = nonceToString(nonce);
    if (!nonceString.startsWith(config.noncePrefix)) {
      throw new Error("Unsupported nonce: wrong prefix");
    }

    const id = nonceString.slice(config.noncePrefix.length);
    const figiItem = await fetchFIGI("ID_BB_GLOBAL", id, config?.apiURL);
    if (figiItem.ticker === null) {
      throw new Error(`Unsupported FIGI(${id}): ticker is null`);
    }

    const self = new OpenFIGIAsset(figiItem.ticker, "TICKER", config);
    self.figiItem = figiItem;
    return self;
  }

  async derivePublicKey(): Promise<PublicKey> {
    if (this.publicKey) {
      return this.publicKey;
    }

    this.publicKey = PublicKey.findProgramAddressSync(
      [ASSET_SEED, Buffer.from(await this.deriveNonce())],
      GINKO_PROGRAM,
    )[0];

    return this.publicKey;
  }

  async deriveMint(): Promise<PublicKey> {
    if (this.mint) {
      return this.mint;
    }

    this.mint = PublicKey.findProgramAddressSync(
      [ASSET_MINT_SEED, Buffer.from(await this.deriveNonce())],
      GINKO_PROGRAM,
    )[0];

    return this.mint;
  }

  async deriveNonce(): Promise<number[]> {
    const id = await this.getFIGIId();
    return stringToNonce(`${this.config.noncePrefix}${id}`);
  }

  private async getFIGIId(): Promise<OpenFIGIItem> {
    if (this.figiItem !== undefined) {
      return this.figiItem;
    }

    const figiItem = await fetchFIGI(
      this.idType,
      this.idValue,
      this.config?.apiURL,
      this.config?.figiProps,
    );


    this.figiItem = figiItem;

    return this.figiItem;
  }
}

export interface OpenFIGIAssetConfig {
  apiURL?: string;
  noncePrefix?: string;
  figiProps?: OpenFIGIProps;
}

/**
 * Properties for OpenFIGI mapping
 *
 * @dev We might want to support more fields in the future
 *
 * @link https://www.openfigi.com/api/documentation#v3-post-mapping
 */
export interface OpenFIGIProps {
  exchCode?: string;
}

export function nonceToString(nonce: number[]): string {
  return Buffer.from(nonce).toString("utf8").replaceAll(" ", "");
}

export function stringToNonce(s: string): number[] {
  return Array.from(Buffer.from(s.padEnd(32, " ")));
}

async function fetchFIGIBatch(
  idTypes: string[],
  symbols: string[],
  props: OpenFIGIProps = {},
  apiURL = DEFAULT_API_URL,
) {
  const body = [];
  for (let i = 0; i < symbols.length; i++) {
    const symbol = symbols[i];
    const idType = idTypes[i];
    body.push({ idType, idValue: symbol.replace('.', '/'), ...props });
  }

  const response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    console.error(`Failed to fetch FIGI, Status=${response.status}`)
    return [];
  }

  const data = await response.json();

  const items = [];
  for (const item of data) {
    if ((item as OpenFIGIResponseError).error) {
      throw new Error((item as OpenFIGIResponseError).error);
    }
    if ((item as OpenFIGIResponseData).data?.length > 0) {
      const figiItem = (item as OpenFIGIResponseData).data[0];
      figiItem.ticker = figiItem.ticker ? figiItem.ticker.replace('/', '.') : null; // Restore symbol according to the rules
      items.push(figiItem);
    }
  }

  return items;
}

async function fetchFIGI(
  idType: string,
  idValue: string,
  apiURL = DEFAULT_API_URL,
  props: OpenFIGIProps = {},
): Promise<OpenFIGIItem> {
  const response = await fetch(apiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        idType,
        idValue: idValue.replace('.', '/'), // FIGI Rules
        ...props,
      },
    ]),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch FIGI, Status=${response.status}`);
  }

  const data: OpenFIGIResponse = await response.json();
  for (const item of data) {
    if ((item as OpenFIGIResponseError).error) {
      throw new Error((item as OpenFIGIResponseError).error);
    }
  }

  const items = (data[0] as OpenFIGIResponseData).data;

  if (items === undefined || items.length === 0) {
    throw new Error("Failed to fetch FIGI item");
  }
  const figiItem = items[0];
  figiItem.ticker = figiItem.ticker ? figiItem.ticker.replace('/', '.') : null; // Restore symbol according to the rules

  return figiItem;
}

type OpenFIGIResponse = (OpenFIGIResponseData | OpenFIGIResponseError)[];

interface OpenFIGIResponseData {
  data: OpenFIGIItem[];
}

interface OpenFIGIResponseError {
  error: string;
}

interface OpenFIGIItem {
  figi: string;
  securityType: string | null;
  marketSector: string | null;
  ticker: string | null;
  name: string | null;
  exchCode: string | null;
  shareClassFIGI: string | null;
  compositeFIGI: string | null;
  securityType2: string | null;
  securityDescription: string | null;
}
