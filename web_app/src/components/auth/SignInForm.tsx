"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Shield, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("🔐 Starting sign in process...");
      
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/",
      });

      console.log("🔐 Sign in result:", {
        ok: result?.ok,
        error: result?.error,
        status: result?.status,
        url: result?.url,
      });

      if (result?.error) {
        console.error("❌ Sign in error:", result.error);
        setError("Invalid email or password");
        setIsLoading(false);
      } else if (result?.ok) {
        console.log("✅ Sign in successful, redirecting to dashboard...");
        // Use window.location for a full page reload to ensure session is established
        window.location.href = "/";
      } else {
        console.warn("⚠️ Unexpected sign in result:", result);
        setError("Authentication failed. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("❌ Sign in exception:", error);
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Back Button */}
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400 font-medium"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 pb-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-lg mb-6">
            <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to SafeHaven
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          {/* Demo Credentials Banner */}
          <div className="mb-6 p-4 bg-gradient-to-r from-info-50 to-brand-50 border border-info-200 dark:border-info-800 rounded-xl dark:from-info-900/20 dark:to-brand-900/20">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-info-100 dark:bg-info-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-info-600 dark:text-info-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-info-900 dark:text-info-300 mb-1">
                  Demo Credentials
                </p>
                <p className="text-xs text-info-700 dark:text-info-400">
                  <span className="font-medium">Admin:</span> admin@example.com / admin123
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl dark:bg-error-900/20 dark:border-error-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-error-100 dark:bg-error-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-error-900 dark:text-error-300 mb-1">
                    Authentication Failed
                  </p>
                  <p className="text-xs text-error-700 dark:text-error-400">
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
              <Label className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                Email Address <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border bg-white dark:bg-gray-900 pl-12 pr-4 py-3 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 text-gray-900 border-gray-300 focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-brand-400 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <Label className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 w-full rounded-xl border bg-white dark:bg-gray-900 pl-12 pr-12 py-3 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 text-gray-900 border-gray-300 focus:border-brand-500 focus:ring-brand-500/20 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-brand-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {showPassword ? (
                    <EyeIcon className="w-5 h-5 fill-gray-500 dark:fill-gray-400" />
                  ) : (
                    <EyeCloseIcon className="w-5 h-5 fill-gray-500 dark:fill-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Keep me logged in
                </span>
              </div>
              <Link
                href="/reset-password"
                className="text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 inline-flex items-center justify-center font-semibold gap-2 rounded-xl transition-all px-6 py-3 text-sm bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg hover:shadow-xl hover:from-brand-600 hover:to-brand-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Sign in to Dashboard
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Need access? Contact your system administrator
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            🔒 Secured by SafeHaven • Your data is protected
          </p>
        </div>
      </div>
    </div>
  );
}
