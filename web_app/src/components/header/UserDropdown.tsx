"use client";
import React, { useState } from "react";
import { useSafeHavenAuth } from "@/context/SafeHavenAuthContext";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { 
  User, 
  Settings, 
  HelpCircle, 
  LogOut, 
  ChevronDown,
  Shield,
  Crown
} from "lucide-react";

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useSafeHavenAuth();

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleSignOut = () => {
    logout();
  };
  
  // Get user's initial for avatar
  const getUserInitial = () => {
    if (!user?.firstName) return "U";
    return user.firstName.charAt(0).toUpperCase();
  };

  const getUserName = () => {
    if (!user) return "User";
    return `${user.firstName} ${user.lastName}`;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown} 
        className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200 group"
      >
        {/* Dynamic Avatar with User Initial */}
        <span className="flex items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-gradient-to-br from-brand-500 to-brand-600 shadow-md group-hover:shadow-lg transition-shadow">
          <span className="text-base font-bold text-white">
            {getUserInitial()}
          </span>
        </span>

        <span className="hidden lg:block font-medium text-sm text-gray-900 dark:text-white">
          {getUserName()}
        </span>

        <ChevronDown 
          className={`hidden lg:block w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-3 flex w-[280px] flex-col rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
      >
        {/* User Info Header */}
        <div className="flex items-start gap-3 p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-900/20 dark:to-brand-800/10 rounded-t-xl">
          {/* Avatar in dropdown */}
          <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg">
            <span className="text-xl font-bold text-white">
              {getUserInitial()}
            </span>
          </div>
          
          <div className="flex-1 min-w-0">
            <span className="block font-semibold text-gray-900 truncate dark:text-white">
              {getUserName()}
            </span>
            <span className="block mt-0.5 text-xs text-gray-600 dark:text-gray-400 truncate">
              {user?.email || "user@example.com"}
            </span>
            {user?.role && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 mt-2 text-xs font-semibold rounded-full ${
                isAdmin 
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' 
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {isAdmin ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                {isAdmin ? 'Administrator' : 'User'}
              </span>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <ul className="flex flex-col p-2">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 px-3 py-2.5 font-medium text-gray-700 rounded-lg group hover:bg-brand-50 hover:text-brand-700 dark:text-gray-400 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-all duration-200"
            >
              <User className="w-5 h-5 text-gray-500 group-hover:text-brand-600 dark:text-gray-400 dark:group-hover:text-brand-400 transition-colors" />
              <span className="text-sm">Edit Profile</span>
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 px-3 py-2.5 font-medium text-gray-700 rounded-lg group hover:bg-brand-50 hover:text-brand-700 dark:text-gray-400 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-all duration-200"
            >
              <Settings className="w-5 h-5 text-gray-500 group-hover:text-brand-600 dark:text-gray-400 dark:group-hover:text-brand-400 transition-colors" />
              <span className="text-sm">Account Settings</span>
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              href="/profile"
              className="flex items-center gap-3 px-3 py-2.5 font-medium text-gray-700 rounded-lg group hover:bg-brand-50 hover:text-brand-700 dark:text-gray-400 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-all duration-200"
            >
              <HelpCircle className="w-5 h-5 text-gray-500 group-hover:text-brand-600 dark:text-gray-400 dark:group-hover:text-brand-400 transition-colors" />
              <span className="text-sm">Support</span>
            </DropdownItem>
          </li>
        </ul>

        {/* Sign Out Button */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full gap-3 px-3 py-2.5 font-medium text-error-600 rounded-lg group hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-900/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 text-error-500 group-hover:text-error-600 dark:text-error-400 dark:group-hover:text-error-300 transition-colors" />
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </Dropdown>
    </div>
  );
}
