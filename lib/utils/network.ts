/**
 * Network utilities
 * Helper functions to detect and manage different blockchain networks
 */

/**
 * Get the current network from environment
 */
export function getCurrentNetwork(): 'mainnet' | 'aeneid' {
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_PROVIDER_URL || '';

  if (rpcUrl.includes('aeneid')) {
    return 'aeneid';
  }

  return 'mainnet';
}

/**
 * Get network display name
 */
export function getNetworkName(network: string): string {
  switch (network) {
    case 'aeneid':
      return 'Story Aeneid Testnet';
    case 'mainnet':
      return 'Story Odyssey Mainnet';
    default:
      return network;
  }
}

/**
 * Check if current network is testnet
 */
export function isTestnet(): boolean {
  return getCurrentNetwork() === 'aeneid';
}

/**
 * Get network badge color
 */
export function getNetworkBadgeColor(network: string): string {
  return network === 'aeneid' ? '#fbbf24' : '#10b981'; // yellow for testnet, green for mainnet
}
