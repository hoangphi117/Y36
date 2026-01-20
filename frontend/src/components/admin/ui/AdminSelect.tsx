import * as React from 'react';
import { cn } from '@/lib/utils';

interface AdminSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const AdminSelect = React.forwardRef<HTMLSelectElement, AdminSelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn("admin-input cursor-pointer", className)}
        {...props}
      >
        {children}
      </select>
    );
  }
);

AdminSelect.displayName = 'AdminSelect';
