import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'emergency' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      dot = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';
    
    const variants = {
      default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      success: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
      error: 'bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400',
      warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
      info: 'bg-info-100 text-info-700 dark:bg-info-900/30 dark:text-info-400',
      emergency: 'bg-emergency-100 text-emergency-700 dark:bg-emergency-900/30 dark:text-emergency-400',
      outline: 'bg-transparent border-2 border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
    };
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-1 text-xs gap-1.5',
      lg: 'px-3 py-1.5 text-sm gap-2',
    };
    
    const dotSizes = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    };

    return (
      <span
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {dot && (
          <span className={`${dotSizes[size]} rounded-full bg-current opacity-75`} />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
