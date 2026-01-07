"use client";
import React, { useState, useEffect } from "react";
import { User } from "@/lib/d1-users";

interface UserFormProps {
  user: User | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export default function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'user',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 100) return 'Name must be less than 100 characters';
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    // Password is only required for new users
    if (!user && !password) return 'Password is required for new users';
    if (password && password.length < 8) return 'Password must be at least 8 characters';
    if (password && !/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (password && !/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (password && !/[0-9]/.test(password)) return 'Password must contain at least one number';
    return undefined;
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setTouched({ ...touched, [field]: true });

    // Validate on change
    let error: string | undefined;
    if (field === 'name') error = validateName(value);
    if (field === 'email') error = validateEmail(value);
    if (field === 'password') error = validatePassword(value);

    setErrors({ ...errors, [field]: error });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (nameError || emailError || passwordError) {
      setErrors({
        name: nameError,
        email: emailError,
        password: passwordError,
      });
      setTouched({
        name: true,
        email: true,
        password: true,
      });
      return;
    }

    setIsSubmitting(true);

    // Prepare data (only include password if it's set)
    const submitData: any = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role as 'admin' | 'user',
    };

    if (formData.password) {
      submitData.password = formData.password;
    }

    await onSubmit(submitData);
    setIsSubmitting(false);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {user ? 'Edit User' : 'Create New User'}
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {user ? 'Update user information and permissions' : 'Add a new user to the system'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onBlur={() => setTouched({ ...touched, name: true })}
            className={`w-full px-4 py-3 text-sm border rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
              touched.name && errors.name
                ? 'border-red-500 focus:ring-red-500'
                : touched.name && !errors.name
                ? 'border-green-500 focus:ring-green-500'
                : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
            }`}
            placeholder="Enter full name"
          />
          {touched.name && errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
          {touched.name && !errors.name && formData.name && (
            <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Looks good!
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            onBlur={() => setTouched({ ...touched, email: true })}
            className={`w-full px-4 py-3 text-sm border rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
              touched.email && errors.email
                ? 'border-red-500 focus:ring-red-500'
                : touched.email && !errors.email
                ? 'border-green-500 focus:ring-green-500'
                : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
            }`}
            placeholder="user@example.com"
          />
          {touched.email && errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
          {touched.email && !errors.email && formData.email && (
            <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Valid email format
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Password {!user && <span className="text-red-500">*</span>}
            {user && <span className="text-gray-500 text-xs">(leave blank to keep current)</span>}
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleFieldChange('password', e.target.value)}
            onBlur={() => setTouched({ ...touched, password: true })}
            className={`w-full px-4 py-3 text-sm border rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 ${
              touched.password && errors.password
                ? 'border-red-500 focus:ring-red-500'
                : touched.password && !errors.password && formData.password
                ? 'border-green-500 focus:ring-green-500'
                : 'border-gray-300 dark:border-gray-700 focus:ring-blue-500'
            }`}
            placeholder={user ? "Leave blank to keep current password" : "Enter password"}
          />
          {touched.password && errors.password && (
            <p className="mt-1 text-xs text-red-500">{errors.password}</p>
          )}
          {touched.password && !errors.password && formData.password && (
            <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Strong password
            </p>
          )}
          {!user && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Must be 8+ characters with uppercase, lowercase, and number
            </p>
          )}
        </div>

        {/* Role Field */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
            className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="user">👤 User - Limited access</option>
            <option value="admin">👑 Admin - Full access</option>
          </select>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.role === 'admin' 
              ? 'Admins have full access to all features including user management'
              : 'Users have limited access to view and manage content'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !!(errors.name || errors.email || errors.password)}
            className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}
