import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 focus:ring-brand-500 shadow-md hover:shadow-lg active:scale-95',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-md hover:shadow-lg active:scale-95',
    success: 'bg-success-500 text-white hover:bg-success-600 focus:ring-success-500 shadow-md hover:shadow-lg active:scale-95',
    danger: 'bg-emergency-500 text-white hover:bg-emergency-600 focus:ring-emergency-500 shadow-md hover:shadow-lg active:scale-95',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500 shadow-md hover:shadow-lg active:scale-95',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300 dark:text-gray-300 dark:hover:bg-gray-800',
    outline: 'bg-transparent border-2 border-brand-500 text-brand-600 hover:bg-brand-50 focus:ring-brand-500'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
