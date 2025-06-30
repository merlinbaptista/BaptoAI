import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, Shield, Zap, DollarSign, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';

interface AuthPageProps {
  onSignIn: (email: string, password: string) => Promise<boolean>;
  onSignUp: (name: string, email: string, password: string) => Promise<boolean>;
  isLoading: boolean;
  onViewPricing?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSignIn, onSignUp, isLoading, onViewPricing }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isEmailAlreadyRegistered, setIsEmailAlreadyRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsEmailAlreadyRegistered(false);

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (isSignUp && !formData.name) {
      setError('Please enter your full name');
      return;
    }

    const success = isSignUp 
      ? await onSignUp(formData.name, formData.email, formData.password)
      : await onSignIn(formData.email, formData.password);

    if (!success) {
      // The error will be set by the auth hook based on the webhook response
      // Check if it's an "email already registered" error
      setTimeout(() => {
        // This will be updated by the auth hook, but we can check for the specific error
        if (error.toLowerCase().includes('email already registered')) {
          setIsEmailAlreadyRegistered(true);
        }
      }, 100);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) {
      setError('');
      setIsEmailAlreadyRegistered(false);
    }
  };

  const handleSwitchToSignIn = () => {
    setIsSignUp(false);
    setError('');
    setIsEmailAlreadyRegistered(false);
    setFormData({ name: '', email: formData.email, password: '' }); // Keep email but clear other fields
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full mix-blend-screen filter blur-xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/3 rounded-full mix-blend-screen filter blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white/4 rounded-full mix-blend-screen filter blur-xl animate-float" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Animated particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-white/25 rounded-full animate-ping" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Pricing Link - Top Right */}
      {onViewPricing && (
        <button
          onClick={onViewPricing}
          className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 hover:scale-105 border border-white/20 backdrop-blur-sm"
        >
          <DollarSign className="w-4 h-4" />
          View Pricing
        </button>
      )}

      {/* Service Status Indicator */}
      <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm border text-sm bg-green-900/20 border-green-500/30 text-green-300">
        <CheckCircle className="w-4 h-4" />
        <span>Service Ready</span>
      </div>

      <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-center lg:text-left space-y-8 animate-slide-in-left">
          <div className="flex items-center justify-center lg:justify-start gap-4">
            <div className="relative animate-logo-glow">
              <img 
                src="/Untitled design (7).png" 
                alt="Bapto AI Logo"
                className="w-20 h-20 object-contain animate-pulse-subtle rounded-2xl shadow-lg"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white animate-text-glow">Bapto AI</h1>
              <p className="text-gray-400 animate-fade-in-delayed">Powered by ChatGPT 4o-mini</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight animate-slide-in-up">
              Transform Your
              <span className="gradient-text-bw block animate-shimmer"> Screen Experience</span>
            </h2>
            
            <p className="text-xl text-gray-300 leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Experience the future of screen interaction with ChatGPT 4o-mini powered guidance, 
              real-time analysis, and intelligent automation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="glass-effect-bw rounded-xl p-4 animate-slide-in-up hover:scale-105 hover:bg-white/10 transition-all duration-300 group" style={{ animationDelay: '0.4s' }}>
                <Sparkles className="w-6 h-6 text-purple-400 mb-2 group-hover:animate-spin transition-all duration-300" />
                <h3 className="font-semibold text-white mb-1">ChatGPT Vision</h3>
                <p className="text-sm text-gray-400">Advanced multimodal AI</p>
              </div>
              
              <div className="glass-effect-bw rounded-xl p-4 animate-slide-in-up hover:scale-105 hover:bg-white/10 transition-all duration-300 group" style={{ animationDelay: '0.5s' }}>
                <Shield className="w-6 h-6 text-white mb-2 group-hover:animate-pulse transition-all duration-300" />
                <h3 className="font-semibold text-white mb-1">Secure</h3>
                <p className="text-sm text-gray-400">Privacy-first approach</p>
              </div>
              
              <div className="glass-effect-bw rounded-xl p-4 animate-slide-in-up hover:scale-105 hover:bg-white/10 transition-all duration-300 group" style={{ animationDelay: '0.6s' }}>
                <Zap className="w-6 h-6 text-white mb-2 group-hover:animate-bounce transition-all duration-300" />
                <h3 className="font-semibold text-white mb-1">Intelligent</h3>
                <p className="text-sm text-gray-400">Smart automation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md mx-auto animate-slide-in-right">
          <div className="glass-effect-bw rounded-2xl p-8 shadow-2xl animate-form-glow border border-white/10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-2 animate-text-glow">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h3>
              <p className="text-gray-400">
                {isSignUp ? 'Join thousands of users already using Bapto AI' : 'Sign in to continue to your AI assistant'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <div className="animate-slide-in-up">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors duration-300" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all hover:bg-white/10 hover:border-white/30"
                      placeholder="Enter your full name"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div className="animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors duration-300" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all hover:bg-white/10 hover:border-white/30"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-white transition-colors duration-300" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all hover:bg-white/10 hover:border-white/30"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className={`rounded-lg p-3 animate-slide-in-up ${
                  isEmailAlreadyRegistered 
                    ? 'bg-blue-900/20 border border-blue-500/30' 
                    : 'bg-red-900/20 border border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {isEmailAlreadyRegistered ? (
                      <UserPlus className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={`text-sm ${isEmailAlreadyRegistered ? 'text-blue-300' : 'text-red-400'}`}>
                        {error}
                      </p>
                      {isEmailAlreadyRegistered && (
                        <button
                          type="button"
                          onClick={handleSwitchToSignIn}
                          className="mt-2 text-blue-400 hover:text-blue-300 text-sm font-medium underline transition-colors"
                        >
                          Switch to Sign In
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 animate-button-glow"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isSignUp ? 'Create Account' : 'Sign In'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setIsEmailAlreadyRegistered(false);
                    setFormData({ name: '', email: '', password: '' });
                  }}
                  className="ml-2 text-white hover:text-gray-300 font-medium transition-colors hover:underline"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {!isSignUp && (
              <div className="mt-4 text-center">
                <button className="text-gray-400 hover:text-white text-sm transition-colors hover:underline">
                  Forgot your password?
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            By continuing, you agree to our{' '}
            <a href="#" className="text-gray-300 hover:text-white transition-colors hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-gray-300 hover:text-white transition-colors hover:underline">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
};