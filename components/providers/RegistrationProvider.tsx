'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useUserEmail } from '@/lib/services/reown';
import { RegistrationModal } from '@/components/auth/RegistrationModal';
import { Dictionary } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface RegistrationContextType {
  showRegistrationModal: boolean;
  setShowRegistrationModal: (show: boolean) => void;
  checkRegistrationStatus: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

interface RegistrationProviderProps {
  children: ReactNode;
  dict: Dictionary;
}

export function RegistrationProvider({ children, dict }: RegistrationProviderProps) {
  const { address, isConnected } = useAppKitAccount();
  const userEmail = useUserEmail();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [hasCheckedRegistration, setHasCheckedRegistration] = useState(false);

  const checkRegistrationStatus = useCallback(async () => {
    if (!isConnected || !address) {
      setShowRegistrationModal(false);
      setHasCheckedRegistration(false);
      return;
    }

    // Check Supabase users table for existing record
    if (isSupabaseConfigured()) {
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address)
        .single();
    }

    // Check localStorage to see if user has already completed registration
    const registrationKey = `registration_completed_${address}`;
    const hasCompletedRegistration = localStorage.getItem(registrationKey);

    if (!hasCompletedRegistration && !hasCheckedRegistration) {
      setShowRegistrationModal(true);
    }
    
    setHasCheckedRegistration(true);
  }, [isConnected, address, hasCheckedRegistration]);

  // Monitor connection status and check registration
  useEffect(() => {
    // Small delay to ensure the connection state is fully established
    const timeoutId = setTimeout(() => {
      checkRegistrationStatus();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [isConnected, address, hasCheckedRegistration, checkRegistrationStatus]);

  // Reset check status when disconnected
  useEffect(() => {
    if (!isConnected) {
      setHasCheckedRegistration(false);
      setShowRegistrationModal(false);
    }
  }, [isConnected]);

  const contextValue: RegistrationContextType = {
    showRegistrationModal,
    setShowRegistrationModal,
    checkRegistrationStatus,
  };

  return (
    <RegistrationContext.Provider value={contextValue}>
      {children}
      <RegistrationModal 
        dict={dict} 
        isOpen={showRegistrationModal} 
        onClose={() => setShowRegistrationModal(false)} 
      />
    </RegistrationContext.Provider>
  );
}

export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
}