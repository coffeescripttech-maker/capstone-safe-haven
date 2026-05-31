"use client";

// SafeHaven Password Reset Page - Enhanced Professional Version

import React, { useState } from "react";
import Link from "next/link";
import AppLogo from "@/components/common/AppLogo";
import { Button, Input, Alert, Card, CardContent } from "@/components/ui";
import { 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  Shield, 
  Lock, 
  RefreshCw,
  AlertCircle,
  Send
} from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setEmail("");
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-brand-50/30 to-gray-50 px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to sign in
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <AppLogo variant="icon" href="#" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSubmitted ? 'Check Your Email' : 'Reset Password'}
          </h1>
          <p className="text-gray-600">
            {isSubmitted
              ? 'We sent you reset instructions'
              : 'Enter your email to receive reset instructions'}
          </p>
        </div>

        {/* Main Card */}
        <Card variant="elevated" padding="lg" className="backdrop-blur-sm">
          <CardContent>
            {!isSubmitted ? (
              <>
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Lock className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="mb-6 animate-slide-down">
                    <Alert
                      variant="error"
                      title="Error"
                      description={error}
                      dismissible
                      onDismiss={() => setError('')}
                    />
                  </div>
                )}

                {/* Reset Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
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
                    helperText="We'll send password reset instructions to this email"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    rightIcon={!isLoading && <Send className="w-4 h-4" />}
                    fullWidth
                    className="mt-6"
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                  </Button>
                </form>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-info-50 border border-info-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-info-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-info-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-info-900 mb-1">
                        Password Reset Process
                      </p>
                      <p className="text-xs text-info-700">
                        You'll receive an email with a secure link to reset your password. The link expires in 1 hour.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center">
                  {/* Success Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-once">
                      <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
                    </div>
                  </div>

                  {/* Success Message */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Email Sent Successfully!
                    </h3>
                    <p className="text-gray-600 mb-4">
                      We've sent password reset instructions to:
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 border border-brand-200 rounded-lg">
                      <Mail className="w-4 h-4 text-brand-600" />
                      <span className="font-semibold text-brand-900">{email}</span>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="p-4 bg-success-50 border border-success-200 rounded-lg text-left mb-6">
                    <p className="text-sm text-success-900 font-semibold mb-2">
                      Next Steps:
                    </p>
                    <ol className="text-sm text-success-800 space-y-2 list-decimal list-inside">
                      <li>Check your email inbox</li>
                      <li>Click the reset link in the email</li>
                      <li>Create your new password</li>
                      <li>Sign in with your new password</li>
                    </ol>
                  </div>

                  {/* Didn't Receive */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700 mb-3">
                      Didn't receive the email?
                    </p>
                    <div className="space-y-2 text-xs text-gray-600">
                      <p>• Check your spam or junk folder</p>
                      <p>• Make sure you entered the correct email</p>
                      <p>• Wait a few minutes for the email to arrive</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleTryAgain}
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                      fullWidth
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link 
              href="/signin" 
              className="font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
          
          {/* Security Notice */}
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
  );
}
