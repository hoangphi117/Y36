import { motion } from 'framer-motion';
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
        'relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isActive
          ? 'bg-green-500 focus:ring-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]'
          : 'bg-muted focus:ring-muted-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]'
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          'inline-block h-5 w-5 transform rounded-full transition-transform',
          'shadow-lg',
          isActive
            ? 'translate-x-8 bg-white'
            : 'translate-x-1 bg-foreground/30'
        )}
      />
    </button>
  );
};
