'use client';

// SafeHaven Admin Login Page - Enhanced Professional Version

import React, { useState } from 'react';
import { useSafeHavenAuth } from '@/context/SafeHavenAuthContext';
import Link from 'next/link';
import AppLogo from '@/components/common/AppLogo';
import { Button, Input, Alert, Card, CardContent } from '@/components/ui';
import { Mail, Lock, ArrowRight, Eye, EyeOff, Shield, Zap, Users } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-brand-50/30 to-gray-50 px-4 py-12 animate-fade-in">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding & Features */}
        <div className="hidden lg:block space-y-8 animate-slide-up">
          {/* Logo & Title */}
          <div>
            <div className="mb-6">
              <AppLogo variant="full" href="#" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              Emergency Response<br />
              <span className="gradient-text">Management System</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Empowering communities with real-time disaster management and emergency response coordination.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="space-y-4">
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Secure & Reliable"
              description="Enterprise-grade security protecting your data 24/7"
              gradient="from-brand-500 to-brand-600"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Real-time Alerts"
              description="Instant notifications for emergency situations"
              gradient="from-emergency-500 to-emergency-600"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Community Focused"
              description="Connecting responders and citizens seamlessly"
              gradient="from-storm-500 to-storm-600"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200">
            <StatItem value="24/7" label="Monitoring" />
            <StatItem value="100%" label="Uptime" />
            <StatItem value="Secure" label="Platform" />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="mb-4">
              <AppLogo variant="icon" href="#" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to SafeHaven
            </h1>
            <p className="text-gray-600">
              Sign in to access the admin dashboard
            </p>
          </div>

          {/* Login Card */}
          <Card variant="elevated" padding="lg" className="backdrop-blur-sm">
            <CardContent>
              {/* Header */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sign In
                </h2>
                <p className="text-sm text-gray-600">
                  Enter your credentials to access your account
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 animate-slide-down">
                  <Alert
                    variant="error"
                    title="Authentication Failed"
                    description={error}
                    dismissible
                    onDismiss={() => setError('')}
                  />
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@safehaven.ph"
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                  disabled={isLoading}
                  fullWidth
                />

                {/* Password Field */}
                <div>
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        disabled={isLoading}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    }
                    required
                    disabled={isLoading}
                    fullWidth
                  />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                      Remember me
                    </span>
                  </label>
                  <Link
                    href="/reset-password"
                    className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
                  fullWidth
                  className="mt-6"
                >
                  {isLoading ? 'Signing in...' : 'Sign in to Dashboard'}
                </Button>
              </form>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-center text-gray-500">
                  Need access? Contact your system administrator
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
              <Shield className="w-3 h-3" />
              Secured by SafeHaven • Your data is protected
            </p>
          </div>

          {/* Copyright */}
          <p className="text-center text-xs text-gray-500 mt-4">
            © 2026 SafeHaven. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, gradient }: any) {
  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all duration-200 hover-lift">
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

// Stat Item Component
function StatItem({ value, label }: any) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-brand-600 mb-1">{value}</div>
      <div className="text-xs text-gray-600 uppercase tracking-wide">{label}</div>
    </div>
  );
}
