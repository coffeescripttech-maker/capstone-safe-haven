import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  containerClassName = '',
  className = '',
  disabled,
  ...props
}: InputProps) {
  const baseInputStyles = 'px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50';
  
  const stateStyles = error
    ? 'border-error-300 focus:border-error-500 focus:ring-error-500/20 bg-error-50/30'
    : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500/20 bg-white dark:bg-gray-900 dark:border-gray-700';

  const iconPaddingStyles = leftIcon ? 'pl-11' : rightIcon ? 'pr-11' : '';
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          className={`${baseInputStyles} ${stateStyles} ${iconPaddingStyles} ${widthStyles} ${className}`}
          disabled={disabled}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-error-600 dark:text-error-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  containerClassName?: string;
}

export function Textarea({
  label,
  error,
  helperText,
  fullWidth = false,
  containerClassName = '',
  className = '',
  disabled,
  ...props
}: TextareaProps) {
  const baseStyles = 'px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 resize-none';
  
  const stateStyles = error
    ? 'border-error-300 focus:border-error-500 focus:ring-error-500/20 bg-error-50/30'
    : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500/20 bg-white dark:bg-gray-900 dark:border-gray-700';

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {props.required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        className={`${baseStyles} ${stateStyles} ${widthStyles} ${className}`}
        disabled={disabled}
        {...props}
      />

      {error && (
        <p className="mt-1.5 text-sm text-error-600 dark:text-error-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
