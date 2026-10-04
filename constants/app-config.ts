import { clusterApiUrl } from '@solana/web3.js'
import { Cluster } from '@/components/cluster/cluster'
import { ClusterNetwork } from '@/components/cluster/cluster-network'

// Same endpoint as scripts/consts.ts MAINNET_RPC.
const MAINNET_RPC = 'https://mainnet.helius-rpc.com/?api-key=f235ad37-1161-4783-8097-ba2eb17d15ef'

export class AppConfig {
  static name = 'Moocon'
  static uri = 'https://app.moocon.xyz'
  static clusters: Cluster[] = [
    {
      id: 'solana:mainnet',
      name: 'Mainnet',
      endpoint: process.env.EXPO_PUBLIC_SOLANA_RPC_URL || MAINNET_RPC,
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
