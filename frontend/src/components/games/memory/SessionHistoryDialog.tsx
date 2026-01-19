import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Calendar, X, Play } from 'lucide-react';
import type { IGameSession } from '@/types/gameSession';

// Hàm format thời gian chơi (giây -> phút:giây)
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

// Hàm format ngày tháng (dựa trên updated_at)
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

interface SessionHistoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    sessions: IGameSession[];
    onLoadSession: (session: IGameSession) => void;
}

const SessionHistoryDialog = ({ isOpen, onClose, sessions, onLoadSession }: SessionHistoryDialogProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop mờ phía sau */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Nội dung Dialog */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-card border-2 border-primary/20 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-primary/10 flex justify-between items-center bg-primary/5">
              <div>
                <h2 className="text-2xl font-black text-primary flex items-center gap-2">
                  <Trophy className="text-yellow-500" /> LỊCH SỬ CHƠI
                </h2>
                <p className="text-xs text-muted-foreground font-medium">Lưu trữ các ván đấu gần nhất của bạn</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Danh sách Session */}
            <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-3">
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <motion.div 
                    key={session.id}
                    whileHover={{ x: 5 }}
                    className="group flex items-center gap-4 bg-secondary/30 hover:bg-secondary/60 p-4 rounded-2xl border-2 border-transparent hover:border-primary/20 transition-all"
                  >
                    {/* Chỉ số Score */}
                    <div className="flex flex-col items-center justify-center min-w-[70px] bg-background rounded-xl p-2 border border-primary/10">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Score</span>
                      <span className="text-lg font-black text-primary">{session.score}</span>
                    </div>

                    {/* Thông tin chi tiết */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <Clock size={14} className="text-accent" />
                        <span>{formatTime(session.play_time_seconds)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Calendar size={12} />
                        <span>{formatDate(session.updated_at)}</span>
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onLoadSession(session)}
                        className="p-2 bg-primary text-white rounded-lg hover:scale-110 transition-transform shadow-lg shadow-primary/20"
                        title="Chơi tiếp"
                      >
                        <Play size={18} fill="currentColor" />
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-10 text-center text-muted-foreground">
                  <p>Chưa có dữ liệu ván đấu nào.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-secondary/20 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Memory Game Engine v1.0
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SessionHistoryDialog;