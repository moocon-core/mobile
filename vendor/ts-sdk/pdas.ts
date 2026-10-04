import { PublicKey } from '@solana/web3.js'
import { Buffer } from 'buffer'

// Kept free of Umi/Metaplex so fetcher.ts (and mobile via vault.ts) can import it.
export const getClaimAccount = (assetAddress: PublicKey, user: PublicKey) => {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('user_claim'), user.toBuffer(), assetAddress.toBuffer()],
    new PublicKey('5uDkCoM96pwGYhAUucvCzLfm5UcjVRuxz6gH81RnRBmL') //LIQUIDITY_PROGRAM_ID
  )
  return pda
}
