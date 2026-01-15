import { motion } from "framer-motion";
import PairSelector from "./PairSelector";
import { Clock, Infinity as InfynityIcon, Layers } from "lucide-react";
import { useState } from "react";

interface Card {
  id: number;
  iconIndex: number;
  isFlipped: boolean;
  isMatched: boolean;
}

interface SettingDialogProps {
    setFreePairs: (pairs: number) => void;
    setFreeTime: (time: number) => void;
    setFreeTimeLeft: (time: number) => void;
    setFreeCards: (cards: Card[]) => void;
    setFreeFlipped: (flipped: number[]) => void;
    setFreeMatched: (matched: number[]) => void;
    setFreeGameStatus: (status: "playing" | "completed" | "lost") => void;
    setIsConfigDialogOpen: (isOpen: boolean) => void;
    setIsStarted: (isStarted: boolean) => void;
    generateCards: (pairs: number) => Card[];
    freePairs?: number;
    freeTime?: number;
}

export default function SettingDialog({ setFreePairs, setFreeTime, setFreeTimeLeft, setFreeCards, setFreeFlipped, setFreeMatched, setFreeGameStatus, setIsConfigDialogOpen, setIsStarted, generateCards, freePairs, freeTime }: SettingDialogProps) {
  const timeOptions = [30, 60, 90, 120, 180, 0]; 

  const [configPairs, setConfigPairs] = useState<number>(freePairs || 6);
  const [configTime, setConfigTime] = useState<number>(freeTime || 60);
  return (
    <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        <motion.div
            className="bg-card rounded-2xl p-6 sm:p-8 shadow-2xl border-2 border-accent/20 max-w-sm w-full space-y-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
        >
        {/* Configuration header */}
        <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-black text-primary mb-2">Cấu hình trò chơi</h2>
        </div>

        {/* Pair selector */}
        <div>
            <div className="flex items-center gap-2 text-foreground font-bold text-xs sm:text-sm">
            <Layers size={16} className="text-primary" />
            <label>Số lượng cặp thẻ:</label>
            </div>
            <PairSelector value={configPairs} onChange={setConfigPairs} />
        </div>

        {/* Time selector */}
        <div>
            <div className="flex items-center gap-2 mb-3 text-foreground font-bold text-xs sm:text-sm">
            <Clock size={16} className="text-accent" />
            <label>Thời gian giới hạn:</label>
            </div>
            <div className="flex flex-wrap gap-2">
            {timeOptions.map((t) => (
                <button
                key={t}
                onClick={() => setConfigTime(t)}
                className={`flex-1 min-w-[55px] py-2 rounded-lg text-xs sm:text-sm font-bold transition-all border-2 flex items-center justify-center gap-1 ${
                    configTime === t
                    ? "bg-accent border-accent text-white shadow-[0_0_15px_rgba(var(--accent),0.4)]"
                    : "bg-secondary/50 border-transparent hover:border-accent/50"
                }`}
                >
                {t === 0 ? <InfynityIcon size={18} strokeWidth={3} /> : `${t}s`}
                </button>
            ))}
            </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
            <button
                onClick={() => setIsConfigDialogOpen(false)}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-muted-foreground text-muted-foreground font-bold hover:bg-muted transition-colors"
            >
                Hủy
            </button>
            <motion.button
                onClick={() => {
                    setFreePairs(configPairs);
                    setFreeTime(configTime);
                    setFreeTimeLeft(configTime);
                    setIsConfigDialogOpen(false);
                    setIsStarted(false);
                    const newCards = generateCards(configPairs);
                    setFreeCards(newCards);
                    setFreeFlipped([]);
                    setFreeMatched([]);
                    setFreeGameStatus("playing");
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-6 py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent/90 transition-colors shadow-lg"
            >
            Áp dụng
            </motion.button>
        </div>
        </motion.div>
    </motion.div>
  )
}
