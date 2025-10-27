import { cookieStorage, createStorage } from '@wagmi/core';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { type AppKitNetwork } from '@reown/appkit/networks';

// Get projectId from environment variables
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!projectId) {
  console.warn('NEXT_PUBLIC_REOWN_PROJECT_ID is not defined. Reown AppKit will not work properly.');
}

// Define Story Protocol Mainnet compatible with both Wagmi and Reown AppKit
export const storyMainnet: AppKitNetwork = {
  id: 1514,
  name: 'Story Mainnet',
  nativeCurrency: {
    name: 'IP',
    symbol: 'IP',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/story_mainnet'],
      webSocket: ['wss://rpc.ankr.com/story_mainnet'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Story Explorer',
      url: 'https://storyscan.xyz',
    },
  },
  contracts: {},
  testnet: false,
};

// Define Story Protocol Aeneid Testnet compatible with both Wagmi and Reown AppKit
export const storyAeneid: AppKitNetwork = {
  id: 1315,
  name: 'Story Aeneid Testnet',
  nativeCurrency: {
    name: 'IP',
    symbol: 'IP',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://aeneid.storyrpc.io'],
      webSocket: ['wss://aeneid.storyrpc.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Story Explorer',
      url: 'https://aeneid.storyscan.xyz',
    },
  },
  contracts: {},
  testnet: true,
};

// Define supported networks - Story Mainnet first, then testnet
export const networks = [storyMainnet, storyAeneid];

// Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId: projectId || '',
  networks,
});

export const config = wagmiAdapter.wagmiConfig;
