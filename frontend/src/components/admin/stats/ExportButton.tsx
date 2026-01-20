import { useState, useRef, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportButtonProps {
  onExportCSV: () => void;
  onExportJSON: () => void;
  disabled?: boolean;
}

export const ExportButton = memo(({ onExportCSV, onExportJSON, disabled }: ExportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickInsideButton = buttonRef.current?.contains(target);
      const isClickInsideMenu = menuRef.current?.contains(target);

      if (!isClickInsideButton && !isClickInsideMenu) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right
      });
    }
    setIsOpen(!isOpen);
  };

  const handleExport = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-sm transition-all cursor-pointer',
          'bg-accent/20 border border-accent/40 text-accent',
          'hover:bg-accent/30 hover:border-accent/60',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <Download className="w-4 h-4" />
        Xuất dữ liệu
      </button>

      {/* Dropdown Menu - Portal */}
      {isOpen && createPortal(
        <div
          ref={menuRef}
          style={{
            position: 'absolute',
            top: `${position.top}px`,
            right: `${position.right}px`,
          }}
          className={cn(
            'w-48 py-2 rounded-lg',
            'admin-surface shadow-lg border border-border/50',
            'z-[9999]',
            'animate-in fade-in slide-in-from-top-2 duration-200'
          )}
        >
          <button
            onClick={() => handleExport(onExportCSV)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer',
              'text-left font-mono text-sm text-foreground',
              'hover:bg-muted transition-colors duration-150'
            )}
          >
            <FileSpreadsheet className="w-4 h-4 text-green-500" />
            Xuất file CSV
          </button>

          <button
            onClick={() => handleExport(onExportJSON)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer',
              'text-left font-mono text-sm text-foreground',
              'hover:bg-muted transition-colors duration-150'
            )}
          >
            <FileJson className="w-4 h-4 admin-primary" />
            Xuất file JSON
          </button>
        </div>,
        document.body
      )}
    </div>
  );
});

ExportButton.displayName = 'ExportButton';
