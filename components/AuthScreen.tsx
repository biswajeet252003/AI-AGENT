import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, User, AlertCircle, Fingerprint } from 'lucide-react';
import { authService } from '../services/authService';
import { User as UserType } from '../types';

interface AuthScreenProps {
  onLogin: (user: UserType) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for effect
    setTimeout(() => {
      try {
        let user;
        if (isLogin) {
          user = authService.login(email, password);
        } else {
          if (!name.trim()) throw new Error("Name is required");
          user = authService.signup(name, email, password);
        }
        onLogin(user);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        setIsLoading(false);
      }
    }, 600);
  };

  const handleGuestLogin = () => {
    try {
      const user = authService.loginAsGuest();
      onLogin(user);
    } catch (err: any) {
      setError("Could not login as guest.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] animate-pulse-slow delay-1000"></div>

      <div className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl relative z-10 animate-fade-in-up">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center mx-auto mb-4 shadow-lg ring-1 ring-white/5">
            <Sparkles className="text-indigo-500" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-zinc-500 text-sm">
            {isLogin ? 'Enter your credentials to access Nox.' : 'Start your journey with Nox AI today.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 animate-pulse">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400 ml-1">Full Name</label>
              <div className="relative group">
                <User size={16} className="absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400 ml-1">Email</label>
            <div className="relative group">
              <Mail size={16} className="absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400 ml-1">Password</label>
            <div className="relative group">
              <Lock size={16} className="absolute left-3 top-3 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg shadow-indigo-500/20"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Sign Up'}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
        
        <div className="my-6 flex items-center justify-center">
            <div className="h-px bg-zinc-800 w-full"></div>
            <span className="px-3 text-xs text-zinc-600 font-medium">OR</span>
            <div className="h-px bg-zinc-800 w-full"></div>
        </div>

        <button 
            onClick={handleGuestLogin}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm border border-zinc-700 hover:border-zinc-600"
        >
            <Fingerprint size={16} />
            Continue as Guest
        </button>

        {/* Footer Toggle */}
        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default AuthScreen;