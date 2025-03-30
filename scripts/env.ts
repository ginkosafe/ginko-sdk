export function envTxExplorerUrl(signature: string) {
  return `https://explorer.solana.com/tx/${signature}${process.env.SOLANA_NETWORK === "devnet" ? `?cluster=devnet` : ""}`;
}
