import * as React from 'react';
import { cn } from '@/lib/utils';

interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  ({ className, icon, ...props }, ref) => {
    if (icon) {
      return (
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            {icon}
          </div>
          <input
            ref={ref}
            className={cn(
              "admin-input",
              icon && "pl-10",
              className
            )}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={cn("admin-input", className)}
        {...props}
      />
    );
  }
);

AdminInput.displayName = 'AdminInput';
