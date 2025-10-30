'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
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
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [hasCheckedRegistration, setHasCheckedRegistration] = useState(false);

  const checkRegistrationStatus = useCallback(async () => {
    if (!isConnected || !address) {
      setShowRegistrationModal(false);
      setHasCheckedRegistration(false);
      return;
    }

    let userExists = false;

    // Check Supabase users table for existing record
    if (isSupabaseConfigured()) {
      try {
        const { data: existingUser, error } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', address)
          .single();

        // User exists if we have data and no error (or error is not "no rows")
        if (existingUser && !error) {
          userExists = true;
          console.log('User found in Supabase:', existingUser.display_name);
        } else if (error && error.code !== 'PGRST116') {
          // PGRST116 means "no rows returned" which is expected for new users
          console.error('Error checking user registration:', error);
        }
      } catch (err) {
        console.error('Failed to check Supabase for user:', err);
      }
    }

    // Also check localStorage as a fallback/cache
    const registrationKey = `registration_completed_${address}`;
    const hasCompletedRegistration = localStorage.getItem(registrationKey);

    // Show modal ONLY if user doesn't exist in Supabase
    // If user exists in Supabase, never show the modal
    if (userExists) {
      // User exists in Supabase - ensure localStorage is in sync and hide modal
      if (!hasCompletedRegistration) {
        localStorage.setItem(registrationKey, 'true');
      }
      setShowRegistrationModal(false);
      console.log('User exists in Supabase, hiding registration modal');
    } else if (!hasCheckedRegistration) {
      // User doesn't exist in Supabase and we haven't checked yet - show modal
      console.log('User not found in Supabase, showing registration modal');
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