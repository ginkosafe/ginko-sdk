import { describe, expect, test } from "bun:test";

import { keypairFromPrivateKeyBase58 } from "../../src/solana/keypair";

describe("keypairFromPrivateKeyBase58", () => {
  test("should success", () => {
    const key = keypairFromPrivateKeyBase58(
      "3Zoxks6Vbj8EUVZ7WkPWqdnctCxmMAr5g1ZhVGgwSKYEz1vmWiJctXzQc25Zdsxt6D2uqohBzd6EF4zEc4VSBChS",
    );
    expect(key.publicKey.toString()).toBe(
      "HGwjFQwrFs8fhhNXsZQYpnjUuQ3haNLyBEX1Z58m9Wr8",
    );
  });
});
