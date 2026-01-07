import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unauthorized Access | TailAdmin",
  description: "You don't have permission to access this page",
};

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 bg-white dark:bg-gray-900">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">403</h1>
          <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">
            Access Denied
          </h2>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            You don't have permission to access this page.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/signin"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}