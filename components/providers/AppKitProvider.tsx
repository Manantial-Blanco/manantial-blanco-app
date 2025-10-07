'use client';

import { wagmiAdapter, projectId, networks } from '@/config/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { mainnet } from '@reown/appkit/networks';
import React, { type ReactNode } from 'react';
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi';

// Set up queryClient
const queryClient = new QueryClient();

// Set up metadata
const metadata = {
  name: 'Manantial Blanco',
  description: 'Cultural IP Platform - Register, remix and monetize your art',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://manantialblanco.com',
  icons: [typeof window !== 'undefined' ? `${window.location.origin}/logo-white.svg` : '/logo-white.svg'],
};

// Create the modal only if projectId is available
let modal: ReturnType<typeof createAppKit> | null = null;

if (projectId) {
  modal = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [mainnet, ...networks.slice(1)],
    defaultNetwork: mainnet,
    metadata,
    features: {
      analytics: true, // Optional - defaults to your Cloud configuration
      socials: ['google', 'github', 'apple', 'facebook', 'x', 'discord'], // Enable social logins
      email: true, // Enable email authentication
      emailShowWallets: true, // Show wallet options alongside email
    },
  });
}

interface AppKitProviderProps {
  children: ReactNode;
  cookies: string | null;
}

export function AppKitProvider({ children, cookies }: AppKitProviderProps) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies);

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
