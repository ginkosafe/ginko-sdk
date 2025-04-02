import { PublicKey } from "@solana/web3.js";
import { GINKO_PROGRAM, SWITCHBOARD_PULL_FEED_SEED } from "../constants.js";

export class SwitchboardOracleFeed {
  static derivePublicKey(nonce: number[], paymentMint: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
      [SWITCHBOARD_PULL_FEED_SEED, Buffer.from(nonce), paymentMint.toBuffer()],
      GINKO_PROGRAM,
    )[0];
  }
}
