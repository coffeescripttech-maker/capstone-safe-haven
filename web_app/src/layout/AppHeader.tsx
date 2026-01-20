"use client";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import { useSafeHavenAuth } from "@/context/SafeHavenAuthContext";
import AppLogo from "@/components/common/AppLogo";
import { Menu, X } from "lucide-react";
import React, { useState } from "react";

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { user } = useSafeHavenAuth();
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  return (
    <header className="sticky top-0 flex w-full bg-white border-b border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 lg:justify-normal lg:px-0 lg:py-4">
          {/* Sidebar Toggle Button */}
          <button
            className="flex items-center justify-center w-10 h-10 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300 transition-all duration-200 z-99999 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 lg:h-11 lg:w-11 shadow-sm hover:shadow-md"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Mobile Logo */}
          <div className="lg:hidden">
            <AppLogo variant="full" />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-brand-50 hover:text-brand-600 hover:border-brand-300 transition-all duration-200 z-99999 dark:text-gray-400 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 lg:hidden shadow-sm hover:shadow-md"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z"
                fill="currentColor"
              />
            </svg>
          </button>

          {/* Desktop Search - Hidden for now */}
          <div className="hidden lg:block">
            {/* Search can be added here if needed */}
          </div>
        </div>

        {/* Right Side - User Menu */}
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex lg:justify-end lg:px-0 border-t border-gray-200 dark:border-gray-800 lg:border-t-0`}
        >
          <div className="flex items-center gap-3">
            {/* User Info - Desktop Only */}
            
            
            {/* User Dropdown */}
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
