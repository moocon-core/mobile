import { useEffect } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useQueryClient } from '@tanstack/react-query'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { parseVault } from 'ts-sdk/fetcher'
import { queryKeys, type VaultWithAddress } from '@moocon/shared'
import { useVaultProgram } from '@/lib/vault-program'

export function useVaultSubscriptions(vaults: VaultWithAddress[]) {
  // Refetches return new PublicKey instances (not structurally shared), so key the effect on the address list.
  const addressKey = vaults.map((v) => v.address.toBase58()).join(',')
  const { connection } = useMobileWallet()
  const program = useVaultProgram()
  const queryClient = useQueryClient()

  useEffect(() => {
    const addresses = addressKey ? addressKey.split(',').map((a) => new PublicKey(a)) : []
    if (!program || addresses.length === 0) return
    const subIds = addresses.map((address) =>
      connection.onAccountChange(
        address,
        (accountInfo) => {
          try {
            const parsed = parseVault(program.program.coder.accounts.decode('vault', accountInfo.data))
            queryClient.setQueryData(queryKeys.vaults.all(), (old: VaultWithAddress[] | undefined) =>
              old?.map((v) => (v.address.equals(address) ? { ...v, ...parsed } : v)),
            )
          } catch (err) {
            console.error('[useVaultSubscriptions] failed to decode vault account:', err)
          }
        },
        'confirmed',
      ),
    )
    return () => {
      for (const id of subIds) connection.removeAccountChangeListener(id).catch(() => {})
    }
  }, [connection, program, queryClient, addressKey])
}
