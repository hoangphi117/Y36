import { useState } from 'react';
import { cn } from '@/lib/utils';

interface GameToggleProps {
  isActive: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const GameToggle = ({ isActive, onToggle, disabled }: GameToggleProps) => {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isActive ? 'bg-primary' : 'bg-muted'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          isActive ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
};
