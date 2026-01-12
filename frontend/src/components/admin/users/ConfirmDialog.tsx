interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConfirmDialog = ({ isOpen, title, message, type, onConfirm, onCancel, isLoading }: ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md p-6 bg-card border border-border rounded-2xl shadow-2xl scale-in-95 animate-in zoom-in-95 duration-200">
        <h3 className={`text-xl font-bold mb-2 ${type === 'danger' ? 'text-destructive' : 'text-accent'}`}>
          {title}
        </h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-bold rounded-xl hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-bold rounded-xl text-white shadow-lg transition-all
              ${type === 'danger' 
                ? 'bg-destructive hover:bg-destructive/90 shadow-destructive/20' 
                : 'bg-accent hover:bg-accent/90 shadow-accent/20 text-accent-foreground'
              }
              ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
            `}
          >
            {isLoading ? 'Processing...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};
