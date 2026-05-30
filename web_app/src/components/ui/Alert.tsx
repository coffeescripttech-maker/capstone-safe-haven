import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  description?: string;
  children?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({
  variant = 'info',
  title,
  description,
  children,
  dismissible = false,
  onDismiss,
  className = ''
}: AlertProps) {
  const variantStyles = {
    info: {
      container: 'bg-info-50 border-info-200 dark:bg-info-900/20 dark:border-info-800',
      icon: 'text-info-600 dark:text-info-400',
      title: 'text-info-900 dark:text-info-300',
      description: 'text-info-700 dark:text-info-400',
      IconComponent: Info
    },
    success: {
      container: 'bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800',
      icon: 'text-success-600 dark:text-success-400',
      title: 'text-success-900 dark:text-success-300',
      description: 'text-success-700 dark:text-success-400',
      IconComponent: CheckCircle2
    },
    warning: {
      container: 'bg-warning-50 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800',
      icon: 'text-warning-600 dark:text-warning-400',
      title: 'text-warning-900 dark:text-warning-300',
      description: 'text-warning-700 dark:text-warning-400',
      IconComponent: AlertTriangle
    },
    error: {
      container: 'bg-error-50 border-error-200 dark:bg-error-900/20 dark:border-error-800',
      icon: 'text-error-600 dark:text-error-400',
      title: 'text-error-900 dark:text-error-300',
      description: 'text-error-700 dark:text-error-400',
      IconComponent: AlertCircle
    }
  };

  const styles = variantStyles[variant];
  const IconComponent = styles.IconComponent;

  return (
    <div className={`rounded-lg border p-4 ${styles.container} ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${styles.icon}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className={`text-sm font-semibold mb-1 ${styles.title}`}>
              {title}
            </h3>
          )}
          
          {description && (
            <p className={`text-sm ${styles.description}`}>
              {description}
            </p>
          )}
          
          {children && (
            <div className={`text-sm ${styles.description}`}>
              {children}
            </div>
          )}
        </div>

        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 p-1 rounded-md hover:bg-black/5 transition-colors ${styles.icon}`}
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
