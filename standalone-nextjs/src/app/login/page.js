'use client';

import React, { useState } from 'react';
import { auth } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, Chrome, UserPlus, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (err) {
      setError(isSignUp ? 'Sign up failed. Try a different email.' : 'Invalid email or password. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err) {
      setError('Google Sign-In failed.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main flex font-inter">
      {/* Left Side: Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-transparent relative z-10">
        <button 
          onClick={() => router.push('/')}
          className="absolute top-8 left-8 flex items-center gap-2 text-text-muted hover:text-text-main transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>

        <div className="w-full max-w-[450px] space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="text-3xl font-outfit font-bold text-text-main tracking-tight">
              {isSignUp ? 'Create an Account' : 'Welcome Back'}
            </h1>
            <p className="text-text-muted mt-2">
              {isSignUp ? 'Join Form-Fit to support your learners.' : 'Sign in to your Form-Fit Dashboard.'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-muted ml-1" htmlFor="email">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="email" 
                  id="email" 
                  placeholder="name@example.com" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-12 text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-muted ml-1" htmlFor="password">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  type="password" 
                  id="password" 
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-12 text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary/50 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm py-3 px-4 rounded-xl text-center font-medium animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-xl bg-white text-bg-main font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-bg-main px-4 text-text-muted font-bold tracking-widest">OR</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-text-main font-semibold flex items-center justify-center gap-3 hover:bg-white/10 active:scale-[0.98] transition-all"
          >
            <Chrome size={20} />
            Continue with Google
          </button>

          <p className="text-center text-text-muted">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"} 
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-brand-primary font-bold ml-2 hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>

      {/* Right Side: Visual */}
      <div className="hidden lg:block flex-[1.5] relative overflow-hidden bg-bg-card border-l border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 via-brand-secondary/5 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[80%] aspect-video glass-card p-2 transform rotate-2 hover:rotate-0 transition-transform duration-700">
             <img src="/hero-african.png" alt="App Preview" className="w-full h-full object-cover rounded-2xl opacity-80" />
          </div>
        </div>
        {/* Animated Background shapes */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-primary/10 blur-[100px] rounded-full animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-brand-secondary/10 blur-[100px] rounded-full animate-pulse delay-1000"></div>
      </div>
    </div>
  );
}
