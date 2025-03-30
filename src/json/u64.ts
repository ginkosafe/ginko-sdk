import { BN } from "@coral-xyz/anchor";
import assert from "assert";

export class u64 extends BN {
  toBuffer() {
    const a = super.toArray().reverse();
    const b = Buffer.from(a);

    if (b.length === 8) {
      return b;
    }

    assert(b.length < 8, "u64 too large");
    const zeroPad = Buffer.alloc(8);
    b.copy(zeroPad);
    return zeroPad;
  }
}
