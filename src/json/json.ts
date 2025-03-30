/* eslint-disable @typescript-eslint/no-explicit-any */

import { u64 } from "./u64";
import { Buffer } from "buffer";
import { PublicKey } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";

const replaceReg = /\d*$/;

// because of the typescript will add number suffix to obj.constructor.name, we need to remove it before matching
function stripNumberSuffix(key: string): string {
  return key.replace(replaceReg, "");
}

const defaultJSONFormat = "go";
export type JSONFormat = "go" | "js";

const fromJSONModifiers: Record<string, (data: any) => any> = {
  PublicKey: (data: string) => new PublicKey(data),
  BN: (data: string | number) => new BN(data),
  Buffer: (data: string) => Buffer.from(data, "hex"),
  Date: (data: string) => new Date(data),
  BigInt: (data: string) => BigInt(data),
  // u64: (data: string) => {
  //   return new u64()
  // },
};

export function fromJSON(obj: any): any {
  if (obj == null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return Array.prototype.map.call(obj, (element) => fromJSON(element));
  }

  if (typeof obj == "object") {
    const modifier = fromJSONModifiers[obj?.type];
    if (!!modifier) {
      return modifier(obj.data);
    }

    const newobj: any = {};
    for (const tuple of Object.entries(obj)) {
      const [k, v]: [string, any] = tuple;
      newobj[k] = fromJSON(v);
    }

    return newobj;
  }

  return obj;
}

type JSONFormatter = (data: any) => any;

type JSONFormatters = Record<string, JSONFormatter>;

interface JSONModifiers {
  go: JSONFormatters;
  js: JSONFormatters;
}

const toJSONModifiers: JSONModifiers = {
  js: {
    PublicKey: (instance: PublicKey) => ({
      type: "PublicKey",
      data: instance.toBase58(),
    }),
    CachedPublicKey: (instance: PublicKey) => ({
      type: "PublicKey",
      data: instance.toBase58(),
    }),
    BN: (instance: BN) => ({
      type: "BN",
      data: instance.toString(),
    }),
    Buffer: (instance: Buffer) => ({
      type: "Buffer",
      data: instance.toString("hex"),
    }),
    u64: (instance: u64) => ({
      type: "u64",
      data: instance.toString(),
    }),
    Date: (instance: Date) => ({
      type: "Date",
      data: instance.toISOString(),
    }),
    BigInt: (instance: BigInt) => ({
      type: "BigInt",
      data: instance.toString(),
    }),
  },
  go: {
    PublicKey: (instance: PublicKey) => instance.toBase58(),
    CachedPublicKey: (instance: PublicKey) => instance.toBase58(),
    BN: (instance: BN) => instance.toString(),
    Buffer: (instance: Buffer) => instance.toString("hex"),
    u64: (instance: u64) => instance.toString(),
    Date: (instance: Date) => instance.toISOString(),
    BigInt: (instance: BigInt) => instance.toString(),
  },
};

function toJSONObj(obj: any, format: JSONFormat = defaultJSONFormat): any {
  if (obj == null || obj == undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return Array.prototype.map.call(obj, (element) =>
      toJSONObj(element, format),
    );
  }

  if (typeof obj === "bigint") {
    return toJSONModifiers[format]["BigInt"](obj);
  }

  if (typeof obj === "object") {
    const modifier =
      toJSONModifiers[format][stripNumberSuffix(obj.constructor.name)];

    if (!!modifier) {
      return modifier(obj);
    }

    // if obj has a toBase58 method, it is a PublicKey
    if (!!obj.toBase58) {
      return toJSONModifiers[format]["PublicKey"](obj);
    }

    const newobj: any = {};
    for (const tuple of Object.entries(obj)) {
      const [k, v]: [string, any] = tuple;
      newobj[k] = toJSONObj(v, format);
    }

    return newobj;
  }
  return obj;
}

export function toJSON(obj: any, format?: JSONFormat, space = 2): string {
  return JSON.stringify(toJSONObj(obj, format), null, space);
}
