import React, { useState } from 'react';
import { AuthPage } from './components/AuthPage';
import { GettingStarted } from './components/GettingStarted';
import { Dashboard } from './components/Dashboard';
import { PricingPage } from './components/PricingPage';
import { useAuth } from './hooks/useAuth';
import { User } from './types';

type AppState = 'auth' | 'onboarding' | 'dashboard' | 'pricing';

function App() {
  const { user, isAuthenticated, isLoading, error, signIn, signUp, signOut, updateUser } = useAuth();
  const [appState, setAppState] = useState<AppState>('auth'); // Start with auth instead of pricing

  // Handle authentication success
  React.useEffect(() => {
    if (isAuthenticated && user) {
      setAppState('onboarding');
    } else if (!isAuthenticated) {
      setAppState('auth');
    }
  }, [isAuthenticated, user]);

  const handleOnboardingComplete = (updatedUser?: User) => {
    if (updatedUser) {
      updateUser(updatedUser);
    }
    setAppState('dashboard');
  };

  const handleSignOut = () => {
    signOut();
    setAppState('auth');
  };

  const handleViewPricing = () => {
    setAppState('pricing');
  };

  const handleGetStarted = () => {
    setAppState('auth');
  };

  const handleContactSales = () => {
    // In a real app, this would open a contact form or redirect to a sales page
    alert('Contact Sales: sales@cordai.com or call +1 (555) 123-4567');
  };

  const handleBackToAuth = () => {
    setAppState('auth');
  };

  // Enhanced sign in wrapper that handles error display
  const handleSignIn = async (email: string, password: string): Promise<boolean> => {
    const success = await signIn(email, password);
    return success;
  };

  // Enhanced sign up wrapper that handles error display
  const handleSignUp = async (name: string, email: string, password: string): Promise<boolean> => {
    const success = await signUp(name, email, password);
    return success;
  };

  if (appState === 'pricing') {
    return (
      <PricingPage
        onGetStarted={handleGetStarted}
        onContactSales={handleContactSales}
        onBackToAuth={handleBackToAuth}
      />
    );
  }

  if (appState === 'auth') {
    return (
      <AuthPage
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        isLoading={isLoading}
        onViewPricing={handleViewPricing}
        error={error}
      />
    );
  }

  if (appState === 'onboarding' && user) {
    return (
      <GettingStarted
        user={user}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  if (appState === 'dashboard' && user) {
    return (
      <Dashboard
        user={user}
        onSignOut={handleSignOut}
      />
    );
  }

  return null;
}

export default App;