"use client";

import { useSidebar } from "@/context/SidebarContext";
import { useSafeHavenAuth } from "@/context/SafeHavenAuthContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isLoading, isAuthenticated, user } = useSafeHavenAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Protect admin routes
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log('🚫 Not authenticated, redirecting to login from:', pathname);
      router.push('/auth/login');
    } else if (!isLoading && isAuthenticated && user) {
      // Check if user has admin or lgu_officer role
      if (user.role !== 'admin' && user.role !== 'lgu_officer') {
        console.log('🚫 Insufficient permissions, user role:', user.role);
        router.push('/auth/login');
      } else {
        console.log('✅ Authenticated as:', user.role, user.email);
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Don't render admin content if not authenticated
  if (!isAuthenticated || !user) {
    return <LoadingSpinner />;
  }

  // Don't render if user doesn't have permission
  if (user.role !== 'admin' && user.role !== 'lgu_officer') {
    return <LoadingSpinner />;
  }

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
      </div>
    </div>
  );
}
