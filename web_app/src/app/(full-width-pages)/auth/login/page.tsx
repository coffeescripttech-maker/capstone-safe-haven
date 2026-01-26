'use client';

// SafeHaven Admin Login Page

import React, { useState } from 'react';
import { useSafeHavenAuth } from '@/context/SafeHavenAuthContext';
import Link from 'next/link';
import AppLogo from '@/components/common/AppLogo';
import { Mail, Lock, AlertCircle, CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useSafeHavenAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      await login(email, password);
      // Redirect handled in login function
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <AppLogo variant="icon" href="#" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to SafeHaven
          </h1>
          <p className="text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
          {/* Demo Credentials Banner */}
          {/* <div className="mb-6 p-4 bg-brand-50 border border-brand-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-900 mb-1">
                  Demo Credentials
                </p>
                <p className="text-xs text-brand-700">
                  <span className="font-medium">Email:</span> admin@safehaven.ph
                </p>
                <p className="text-xs text-brand-700">
                  <span className="font-medium">Password:</span> admin123
                </p>
              </div>
            </div>
          </div> */}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-error-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-error-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-error-900 mb-1">
                    Authentication Failed
                  </p>
                  <p className="text-xs text-error-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@safehaven.ph"
                  required
                  disabled={isLoading}
                  className="h-11 w-full rounded-lg border bg-white pl-12 pr-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 text-gray-900 border-gray-300 focus:border-brand-500 focus:ring-brand-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password <span className="text-error-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  className="h-11 w-full rounded-lg border bg-white pl-12 pr-12 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 text-gray-900 border-gray-300 focus:border-brand-500 focus:ring-brand-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                />
                <span className="text-sm font-medium text-gray-700">Remember me</span>
              </label>
              <Link
                href="/reset-password"
                className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 inline-flex items-center justify-center font-semibold gap-2 rounded-lg transition-all px-6 py-2.5 text-sm bg-gradient-to-r from-brand-600 to-brand-800 text-white shadow-md hover:shadow-lg hover:from-brand-700 hover:to-brand-900 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-center text-gray-500">
              Need access? Contact your system administrator
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Secured by SafeHaven • Your data is protected
          </p>
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-gray-500 mt-4">
          © 2026 SafeHaven. All rights reserved.
        </p>
      </div>
    </div>
  );
}
