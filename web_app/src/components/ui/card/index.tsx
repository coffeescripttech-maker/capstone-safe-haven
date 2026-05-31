import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export function Card({ 
  children, 
  variant = 'default', 
  padding = 'md',
  className = '',
  onClick 
}: CardProps) {
  const baseStyles = 'rounded-xl transition-all duration-200';
  
  const variantStyles = {
    default: 'bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800',
    elevated: 'bg-white shadow-lg border border-gray-100 hover:shadow-xl dark:bg-gray-900 dark:border-gray-800',
    outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-700',
    ghost: 'bg-gray-50 dark:bg-gray-800/50'
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const clickableStyles = onClick ? 'cursor-pointer hover:border-brand-300 hover:shadow-md' : '';

  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-xl font-bold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>
      {children}
    </p>
  );
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-6 pt-4 border-t border-gray-200 dark:border-gray-800 ${className}`}>
      {children}
    </div>
  );
}
