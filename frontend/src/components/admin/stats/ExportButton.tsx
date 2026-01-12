import { useState, useRef, useEffect } from 'react';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExportButtonProps {
  onExportCSV: () => void;
  onExportJSON: () => void;
  disabled?: boolean;
}

export const ExportButton = ({ onExportCSV, onExportJSON, disabled }: ExportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-sm transition-all',
          'bg-accent/20 border border-accent/40 text-accent',
          'hover:bg-accent/30 hover:border-accent/60',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        <Download className="w-4 h-4" />
        Xuất dữ liệu
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute right-0 mt-2 w-48 py-2 rounded-lg',
            'admin-surface shadow-lg',
            'z-50'
          )}
        >
          <button
            onClick={() => handleExport(onExportCSV)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5',
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
              'w-full flex items-center gap-3 px-4 py-2.5',
              'text-left font-mono text-sm text-foreground',
              'hover:bg-muted transition-colors duration-150'
            )}
          >
            <FileJson className="w-4 h-4 admin-primary" />
            Xuất file JSON
          </button>
        </div>
      )}
    </div>
  );
};
