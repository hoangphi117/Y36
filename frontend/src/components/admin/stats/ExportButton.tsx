import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, exportToJSON } from '@/lib/admin/statsUtils';
import { cn } from '@/lib/utils';

interface ExportButtonProps {
  data: any;
  filename?: string;
  disabled?: boolean;
}

export const ExportButton = ({ data, filename = 'stats-export', disabled }: ExportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (type: 'csv' | 'json') => {
    if (type === 'csv') {
      if (data.newUsers) {
        const dates = Object.keys(data.newUsers).sort();
        const csvData = dates.map(date => ({
          date,
          newUsers: data.newUsers[date],
          newGameSessions: data.newGameSessions[date],
          totalPlayTime: data.totalPlayTime[date]
        }));
        exportToCSV(csvData, filename);
      } else {
         exportToCSV(Array.isArray(data) ? data : [data], filename);
      }
    } else {
      exportToJSON(data, filename);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-mono text-sm font-bold",
          "bg-purple-500/20 text-purple-400 border border-purple-500/50",
          "hover:bg-purple-500/30 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <Download className="w-4 h-4" />
        EXPORT
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-32 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-white/5 text-left transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-green-400" />
              CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-white/5 text-left transition-colors"
            >
              <FileJson className="w-4 h-4 text-yellow-400" />
              JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
};
