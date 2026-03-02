'use client';

// Protected Route - Role-based page protection for Next.js

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { Role } from '@/types/safehaven';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: Role[];
  redirectTo?: string;
  showError?: boolean;
}

/**
 * ProtectedRoute component for Next.js pages.
 * Checks user role and redirects or shows error if unauthorized.
 * 
 * Usage in page component:
 * 
 * export default function AdminPage() {
 *   return (
 *     <ProtectedRoute requiredRole={['admin', 'super_admin']}>
 *       <AdminPanelContent />
 *     </ProtectedRoute>
 *   );
 * }
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/dashboard',
  showError = true,
}) => {
  const { canAccess, isLoading, role } = useRole();
  const router = useRouter();

  useEffect(() => {
    // Don't check while loading
    if (isLoading) return;

    // Check if user has required role
    if (requiredRole && !canAccess(requiredRole)) {
      console.log(`Access denied: User role '${role}' not in required roles [${requiredRole.join(', ')}]`);
      
      // Redirect to specified route
      router.push(redirectTo);
    }
  }, [isLoading, requiredRole, canAccess, role, router, redirectTo]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authorization
  if (requiredRole && !canAccess(requiredRole)) {
    if (showError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-gray-500">
              Your role: <span className="font-semibold">{role || 'None'}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  // User is authorized
  return <>{children}</>;
};
