import { Connection } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { GinkoProtocol, GINKO_IDL } from "../idl";

export class InstructionBuilder {
  protected program: Program<GinkoProtocol>;

  /**
   * @param connection - Solana connection instance
   */
  constructor(protected connection: Connection) {
    this.program = new Program(GINKO_IDL as GinkoProtocol, {
      connection,
    });
  }
}
