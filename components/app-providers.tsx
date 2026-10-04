import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MobileWalletProvider } from '@wallet-ui/react-native-web3js'
import { PropsWithChildren } from 'react'
import { ApiError, getFriendlyError } from '@moocon/shared'
import { AuthProvider } from '@/components/auth/auth-provider'
import { ClusterProvider, useCluster } from '@/components/cluster/cluster-provider'
import { AppTheme } from '@/components/app-theme'
import { AppConfig } from '@/constants/app-config'
import { VaultProgramProvider } from '@/lib/vault-program'
import { toastError } from '@/lib/toast'

const identity = { name: AppConfig.name, uri: AppConfig.uri, icon: 'favicon.png' }
// Offline shows up as raw transport errors: RN fetch ("Network request failed"), and web3.js RPC on
// Android ("fetch failed: java.net.UnknownHostException: Unable to resolve host …").
const NETWORK_ERROR =
  /network request failed|failed to fetch|fetch failed|unknownhost|unable to resolve host|timed? ?out/i

function fetchErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  if (NETWORK_ERROR.test(message)) return "Can't reach the network. Check your connection."
  return getFriendlyError(error)
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // Only first loads: a failed background refetch still has data on screen, so it stays quiet.
    onError: (error, query) => {
      if (query.state.data === undefined) toastError(fetchErrorMessage(error))
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 120_000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status < 500) return false
        return failureCount < 2
      },
    },
    mutations: {
      onError: (error) => toastError(getFriendlyError(error)),
    },
  },
})

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <AppTheme>
      <QueryClientProvider client={queryClient}>
        <ClusterProvider>
          <SolanaProvider>
            <VaultProgramProvider>
              <AuthProvider>{children}</AuthProvider>
            </VaultProgramProvider>
          </SolanaProvider>
        </ClusterProvider>
      </QueryClientProvider>
    </AppTheme>
  )
}

function SolanaProvider({ children }: PropsWithChildren) {
  const { selectedCluster } = useCluster()
  return (
    <MobileWalletProvider chain={selectedCluster.id} endpoint={selectedCluster.endpoint} identity={identity}>
      {children}
    </MobileWalletProvider>
  )
}
