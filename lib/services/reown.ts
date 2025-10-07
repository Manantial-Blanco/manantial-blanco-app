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

export interface UserProfile {
  email?: string | null;
  username?: string | null;
  authProvider?: 'google' | 'apple' | 'facebook' | 'x' | 'discord' | 'farcaster' | 'github' | 'email';
  accountType?: 'eoa' | 'smartAccount' | 'payment' | 'ordinal' | 'stx';
  isSmartAccountDeployed?: boolean;
  hasProfile: boolean;
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

/**
 * Hook to get user profile information from social login or embedded wallet
 * Returns user email, username, and authentication provider when available
 * Use this hook anywhere you need access to user profile data
 */
export function useUserProfile(): UserProfile {
  const { address, isConnected, embeddedWalletInfo } = useAppKitAccount();

  // Return user profile data if available
  if (isConnected && embeddedWalletInfo) {
    return {
      email: embeddedWalletInfo.user?.email || null,
      username: embeddedWalletInfo.user?.username || null,
      authProvider: embeddedWalletInfo.authProvider,
      accountType: embeddedWalletInfo.accountType,
      isSmartAccountDeployed: embeddedWalletInfo.isSmartAccountDeployed,
      hasProfile: true,
    };
  }

  // Return empty profile if no embedded wallet info (external wallet)
  return {
    email: null,
    username: null,
    authProvider: undefined,
    accountType: undefined,
    isSmartAccountDeployed: undefined,
    hasProfile: false,
  };
}

/**
 * Simple hook to get just the user's email address
 * Returns the email if available from social login, null otherwise
 */
export function useUserEmail(): string | null {
  const { embeddedWalletInfo } = useAppKitAccount();
  return embeddedWalletInfo?.user?.email || null;
}

/**
 * Simple hook to get just the user's username
 * Returns the username if available from social login, null otherwise
 */
export function useUserName(): string | null {
  const { embeddedWalletInfo } = useAppKitAccount();
  return embeddedWalletInfo?.user?.username || null;
}
