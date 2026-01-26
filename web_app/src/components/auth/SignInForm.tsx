"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { Shield, Mail, Lock, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

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
    <div className="flex flex-col flex-1 lg:w-1/2 w-full min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-brand-600 font-medium"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 pb-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl shadow-xl mb-6">
            <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
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
                  <span className="font-medium">Admin:</span> admin@example.com / admin123
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
              <Label className="text-gray-700 font-medium mb-2">
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
                  className="h-11 w-full rounded-lg border bg-white pl-12 pr-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 text-gray-900 border-gray-300 focus:border-brand-500 focus:ring-brand-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <Label className="text-gray-700 font-medium mb-2">
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
                  className="h-11 w-full rounded-lg border bg-white pl-12 pr-12 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 text-gray-900 border-gray-300 focus:border-brand-500 focus:ring-brand-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {showPassword ? (
                    <EyeIcon className="w-5 h-5 fill-gray-500" />
                  ) : (
                    <EyeCloseIcon className="w-5 h-5 fill-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <span className="text-sm font-medium text-gray-700">
                  Keep me logged in
                </span>
              </div>
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
      </div>
    </div>
  );
}
