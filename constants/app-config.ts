import { clusterApiUrl } from '@solana/web3.js'
import { Cluster } from '@/components/cluster/cluster'
import { ClusterNetwork } from '@/components/cluster/cluster-network'

// The keyed RPC comes from EXPO_PUBLIC_SOLANA_RPC_URL (.env.local), baked in at build time and never committed.
// The public endpoint is only a dev fallback: it's rate-limited, so release builds refuse to run without the env.
const MAINNET_RPC = process.env.EXPO_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('mainnet-beta')

export class AppConfig {
  static name = 'Moocon'
  static uri = 'https://app.moocon.xyz'
  static clusters: Cluster[] = [
    {
      id: 'solana:mainnet',
      name: 'Mainnet',
      endpoint: MAINNET_RPC,
      network: ClusterNetwork.Mainnet,
    },
    {
      id: 'solana:devnet',
      name: 'Devnet',
      endpoint: clusterApiUrl('devnet'),
      network: ClusterNetwork.Devnet,
    },
    {
      id: 'solana:testnet',
      name: 'Testnet',
      endpoint: clusterApiUrl('testnet'),
      network: ClusterNetwork.Testnet,
    },
  ]
}
