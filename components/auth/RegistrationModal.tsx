'use client';

import { useState, useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { useUserEmail } from '@/lib/services/reown';
import { Dictionary } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface RegistrationModalProps {
  dict: Dictionary;
  isOpen: boolean;
  onClose: () => void;
}

export function RegistrationModal({ dict, isOpen, onClose }: RegistrationModalProps) {
  const { address, isConnected } = useAppKitAccount();
  const userEmail = useUserEmail();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);


  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    name: ''
  });

  // Pre-fill email when modal is shown
  useEffect(() => {
    if (isOpen && userEmail) {
      setFormData(prev => ({
        ...prev,
        email: userEmail
      }));
    }
  }, [isOpen, userEmail]);

  const handleInputChange = (field: 'email' | 'name', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address || !formData.email.trim() || !formData.name.trim()) {
      setSubmitError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setSubmitError(null);

    // Save data to Supabase
    if (isSupabaseConfigured()) {
      try {
        // First check if user already exists
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', address)
          .single();

        if (existingUser) {
          // Update existing user
          const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({
              email: formData.email,
              display_name: formData.name,
              updated_at: new Date().toISOString()
            })
            .eq('wallet_address', address)
            .select()
            .single();

          if (updateError) {
            setSubmitError('Failed to update user profile');
            setIsLoading(false);
            return;
          }
        } else {
          // Create new user
          const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
              wallet_address: address,
              email: formData.email,
              display_name: formData.name
            })
            .select()
            .single();

          if (insertError) {
            setSubmitError('Failed to create user profile');
            setIsLoading(false);
            return;
          }
        }

        // Mark registration as completed
        const registrationKey = `registration_completed_${address}`;
        localStorage.setItem(registrationKey, 'true');

        // Success!
        setIsSubmitted(true);
        setIsLoading(false);

        // Close modal after a brief delay
        setTimeout(() => {
          onClose();
          setIsSubmitted(false);
        }, 1500);

      } catch (err) {
        setSubmitError('An unexpected error occurred');
        setIsLoading(false);
      }
    } else {
      // Still mark as completed for local development
      const registrationKey = `registration_completed_${address}`;
      localStorage.setItem(registrationKey, 'true');
      
      setIsSubmitted(true);
      setIsLoading(false);
      
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
      }, 1500);
    }
  };

  // Don't render anything if modal shouldn't be shown
  if (!isOpen || !isConnected || !address) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black text-center">
            Complete Your Profile
          </h2>
          <p className="text-gray-600 text-center mt-2">
            Help us personalize your experience
          </p>
        </div>

        {/* Wallet Address Display */}
        <div className="px-6 py-4 bg-gray-50">
          <p className="text-sm font-semibold text-gray-600 mb-1">Connected Wallet</p>
          <p className="text-sm text-gray-800 font-mono break-all">
            {address || 'No address available'}
          </p>
          {!address && (
            <p className="text-xs text-red-600 mt-1">
              ⚠️ Wallet address not detected
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-600 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
              required
            />
            {userEmail && (
              <p className="text-xs text-blue-600 mt-1">
                ✓ Pre-filled from your connected account
              </p>
            )}
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-600 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitted || isLoading || !formData.email.trim() || !formData.name.trim()}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
              isSubmitted
                ? 'bg-green-500 text-white'
                : isLoading
                ? 'bg-blue-500 text-white cursor-wait'
                : formData.email.trim() && formData.name.trim()
                ? 'bg-black text-white hover:bg-gray-800 active:transform active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitted ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Profile Completed!
              </span>
            ) : isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving to Database...
              </span>
            ) : (
              'Complete Profile'
            )}
          </button>

          {/* Error Message */}
          {submitError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">
                {submitError}
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 pb-6">
          <p className="text-xs text-gray-500 text-center">
            This information helps us provide you with a better experience. 
            Your data is secure and will not be shared.
          </p>
        </div>
      </div>
    </div>
  );
}