export const queryKeys = {
  vaults: {
    all: () => ['vaults', 'all'] as const,
    tokenBalance: (vaultAddr: string, mint: string) =>
      ['vaults', 'tokenBalance', vaultAddr, mint] as const,
  },
  proofs: {
    byDrawing: (id: string) => ['proofs', id] as const,
    byDrawingWallet: (id: string, wallet: string) => ['proofs', id, wallet] as const,
    byVaultRound: (vault: string, round: number) => ['proofs', 'vault', vault, round] as const,
  },
  drawings: {
    list: (page: number, limit: number) => ['drawings', 'list', page, limit] as const,
    top: (limit: number) => ['drawings', 'top', limit] as const,
    wins: (wallet: string) => ['drawings', 'wins', wallet] as const,
    byVault: (vault: string, page: number, limit: number) =>
      ['drawings', 'vault', vault, page, limit] as const,
    aprHistory: (vault: string) => ['drawings', 'vault', vault, 'aprHistory'] as const,
  },
  stats: {
    list: (interval: string, limit: number, cursor: string | null, vault: string | null) =>
      ['stats', interval, limit, cursor, vault] as const,
  },
  points: {
    byWallet: (wallet: string) => ['points', wallet] as const,
    leaderboard: (page: number, limit: number, wallet: string) =>
      ['points', 'leaderboard', page, limit, wallet] as const,
  },
  referrals: {
    byWallet: (wallet: string) => ['referrals', wallet] as const,
  },
  events: {
    list: (page: number, limit: number) => ['events', 'list', page, limit] as const,
    byVaultRound: (vault: string, round: number) => ['events', vault, round] as const,
  },
  mintData: {
    all: () => ['mintData'] as const,
  },
  user: {
    tokenBalance: (mint: string, owner: string) => ['user', 'tokenBalance', mint, owner] as const,
    deposited:    (vault: string, owner: string) => ['user', 'deposited',   vault, owner] as const,
    pTokenBalance:(vault: string, owner: string) => ['user', 'pTokenBalance', vault, owner] as const,
    totalDepositsUsd: (owner: string) => ['user', 'totalDepositsUsd', owner] as const,
    positions: (owner: string, vaults: string) => ['user', 'positions', owner, vaults] as const,
    swapPreference: (vault: string, owner: string) => ['user', 'swapPreference', vault, owner] as const,
  },
} as const
