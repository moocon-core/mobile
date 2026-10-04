import { createContext, type PropsWithChildren, use, useMemo } from 'react'
import { useMobileWallet } from '@wallet-ui/react-native-web3js'
import { Vault } from 'ts-sdk/vault'

const VaultProgramContext = createContext<Vault | null>(null)

export function VaultProgramProvider({ children }: PropsWithChildren) {
  const { connection } = useMobileWallet()
  const vault = useMemo(() => new Vault(connection), [connection])
  return <VaultProgramContext value={vault}>{children}</VaultProgramContext>
}

export function useVaultProgram() {
  return use(VaultProgramContext)
}
