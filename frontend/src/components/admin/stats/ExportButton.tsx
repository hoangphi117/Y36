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
          'flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-sm',
          'bg-purple-500/20 border border-purple-500/40 text-purple-300',
          'hover:bg-purple-500/30 hover:border-purple-500/60',
          'hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]',
          'transition-all duration-200',
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
            'bg-black/90 backdrop-blur-xl border border-border/50',
            'shadow-[0_0_30px_rgba(0,0,0,0.5)]',
            'z-50'
          )}
        >
          <button
            onClick={() => handleExport(onExportCSV)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5',
              'text-left font-mono text-sm text-foreground',
              'hover:bg-green-500/20 hover:text-green-300',
              'transition-colors duration-150'
            )}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Xuất file CSV
          </button>

          <button
            onClick={() => handleExport(onExportJSON)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2.5',
              'text-left font-mono text-sm text-foreground',
              'hover:bg-cyan-500/20 hover:text-cyan-300',
              'transition-colors duration-150'
            )}
          >
            <FileJson className="w-4 h-4" />
            Xuất file JSON
          </button>
        </div>
      )}
    </div>
  );
};
