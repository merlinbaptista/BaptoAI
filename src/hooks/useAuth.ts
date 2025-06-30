import { useState, useCallback } from 'react';
import { User, AuthState } from '../types';
import { webhookService } from '../services/webhook';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false
  });
  const [error, setError] = useState<string>('');

  const signIn = useCallback(async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError('');
    
    try {
      console.log('🔐 Attempting sign in with webhook...');
      const response = await webhookService.signIn(email, password);
      
      if (response.success && response.user) {
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          createdAt: new Date()
        };
        
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        
        console.log('✅ Sign in successful');
        return true;
      } else {
        console.error('❌ Sign in failed:', response.error);
        setError(response.error || 'Sign in failed. Please check your credentials.');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('❌ Sign in error:', error);
      setError('Network error - please check your connection and try again');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError('');
    
    try {
      console.log('📝 Attempting sign up with webhook...');
      const response = await webhookService.signUp(name, email, password);
      
      if (response.success && response.user) {
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          createdAt: new Date()
        };
        
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        
        console.log('✅ Sign up successful');
        return true;
      } else {
        console.error('❌ Sign up failed:', response.error);
        setError(response.error || 'Failed to create account. Please try again.');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }
    } catch (error) {
      console.error('❌ Sign up error:', error);
      setError('Network error - please check your connection and try again');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  const signOut = useCallback(() => {
    console.log('👋 Signing out...');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    setError('');
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setAuthState(prev => ({
      ...prev,
      user: updatedUser
    }));
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    ...authState,
    error,
    signIn,
    signUp,
    signOut,
    updateUser,
    clearError
  };
};