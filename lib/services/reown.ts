/**
 * Reown AppKit Integration
 * Handles wallet connection and authentication
 * See: https://docs.reown.com/appkit/next/core/installation
 * 
 * Note: The AppKit modal is initialized in the AppKitProvider component.
 * This service provides utility functions for interacting with the wallet connection.
 */

import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react';

export interface ConnectResult {
  walletAddress: string;
}

export interface Session {
  walletAddress: string;
  isConnected: boolean;
  chainId?: number;
}

/**
 * Hook to open the AppKit modal
 * Use this in client components to trigger the wallet connection modal
 */
export function useWalletConnect() {
  const { open } = useAppKit();
  const { address, isConnected, caipAddress, status } = useAppKitAccount();
  const { disconnect } = useDisconnect();

  return {
    openModal: open,
    address,
    isConnected,
    caipAddress,
    status,
    disconnect,
  };
}

/**
 * Get current session information
 * This is a client-side only function
 */
export function useWalletSession(): Session | null {
  const { address, isConnected } = useAppKitAccount();

  if (!isConnected || !address) {
    return null;
  }

  return {
    walletAddress: address,
    isConnected,
  };
}
