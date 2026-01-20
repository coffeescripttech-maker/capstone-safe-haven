import React from 'react';

export const Card = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
};
