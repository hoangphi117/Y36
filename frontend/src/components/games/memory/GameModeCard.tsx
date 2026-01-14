import { BoxButton } from "@/components/ui/box-button";
import { motion } from "framer-motion";
import { Clock, Infinity as InfinityIcon, Layers, Play, Star, Trophy } from "lucide-react";
import PairSelector from "./PairSelector";

interface LevelModeCardProps {
    startLevelMode: () => void;
}

const LevelModeCard = ({ startLevelMode }: LevelModeCardProps) => {
    return (
        <motion.div
            className="bg-card rounded-2xl p-4 sm:p-8 shadow-lg border-2 border-primary/10 mb-4 sm:mb-8 hover:border-primary"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              <h2 className="text-lg sm:text-2xl font-black text-primary">Chơi thử thách</h2>
            </div>
            <p className="text-sm sm:text-base text-foreground mb-3 sm:mb-4 leading-relaxed">
                Chinh phục chuỗi 5 thử thách kịch tính với quy mô bàn chơi mở rộng và độ khó tăng dần qua từng màn. 
                Hãy chạy đua với thời gian để giành lấy Bonus tuyệt đối và tích lũy điểm số cao nhất!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {/* Levels Card */}
            <div className="bg-secondary/20 p-4 rounded-2xl border border-primary/10 flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mb-3 text-primary">
                    <Layers size={20} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Cấp độ</span>
                <span className="flex flex-wrap justify-center gap-1 font-black text-foreground">
                    6
                </span>
            </div>

            {/* Time Card */}
            <div className="bg-secondary/20 p-4 rounded-2xl border border-accent/10 flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center mb-3 text-accent">
                    <Clock size={20} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Thời gian</span>
                <p className="font-black text-foreground">90s <span className="text-accent/40 px-1">~</span> 240s</p>
            </div>

            {/* Scoring Card */}
            <div className="bg-secondary/20 p-4 rounded-2xl border border-yellow-500/10 flex flex-col items-center text-center">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center mb-3 text-yellow-500">
                <Star size={20} fill="currentColor" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Điểm số</span>
                <p className="font-black text-foreground">100 <span className="text-[10px] font-normal text-muted-foreground">pts/level</span></p>
                <p className="text-[10px] text-yellow-600 font-bold mt-1">+ Thưởng thời gian</p>
            </div>
            </div>
            <BoxButton onClick={startLevelMode} variant="primary" size="medium" className="w-full gap-2">
              <Play className="fill-current w-4 h-4 sm:w-5 sm:h-5" /> BẮT ĐẦU 
            </BoxButton>
        </motion.div>
    );
}

interface FreeModeCardProps {
    startFreeMode: () => void;
    freePairs: number;
    setFreePairs: (pairs: number) => void;
    freeTime: number;
    setFreeTime: (time: number) => void;
}

const FreeModeCard = ({ startFreeMode, freePairs, setFreePairs, freeTime, setFreeTime }: FreeModeCardProps) => {
    const timeOptions = [30, 60, 90, 120, 180, 0]; // 0 đại diện cho Không giới hạn

    return (
        <motion.div
            className="bg-card rounded-3xl p-4 sm:p-8 shadow-2xl border-2 border-accent/10 mb-4 sm:mb-8 overflow-hidden relative hover:border-accent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h2 className="text-xl sm:text-3xl font-black text-accent mb-1 sm:mb-2 flex items-center gap-2">
              <Play fill="currentColor" size={20} className="sm:w-6 sm:h-6" /> Chơi tự do
            </h2>
            <p className="text-xs sm:text-base text-muted-foreground mb-4 sm:mb-8">Tùy chỉnh thử thách theo cách của bạn</p>

            <div className="space-y-4 sm:space-y-8">
              {/* pair selector */}
              <div>
                <div className="flex items-center gap-2 text-foreground font-bold text-sm sm:text-base">
                  <Layers size={16} className="sm:w-[18px] sm:h-[18px] text-primary" />
                  <label>Số lượng cặp thẻ:</label>
                  <span className="text-primary text-lg sm:text-xl">{freePairs}</span>
                </div>
                <PairSelector value={freePairs} onChange={setFreePairs} />
              </div>

              {/* time selector */}
              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-4 text-foreground font-bold text-sm sm:text-base">
                  <Clock size={16} className="sm:w-[18px] sm:h-[18px] text-accent" />
                  <label>Thời gian giới hạn:</label>
                  <span className="text-accent text-lg sm:text-xl">
                    {freeTime === 0 ? "Không giới hạn" : `${freeTime}s`}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {timeOptions.map((t) => (
                        <button
                            key={t}
                            onClick={() => setFreeTime(t)}
                            className={`flex-1 min-w-[60px] sm:min-w-[70px] py-2 sm:py-3 rounded-xl text-xs sm:text-base font-bold transition-all border-2 flex items-center justify-center gap-1 ${
                                freeTime === t
                                ? "bg-accent border-accent text-white shadow-[0_0_15px_rgba(var(--accent),0.4)]"
                                : "bg-secondary/50 border-transparent hover:border-accent/50"
                            }`}
                        >
                        {t === 0 ? <InfinityIcon size={18} className="sm:w-5 sm:h-5" /> : `${t}s`}
                        </button>
                    ))}
                </div>
              </div>
            </div>

            <BoxButton 
                onClick={startFreeMode} 
                variant="accent" 
                size="medium" 
                className="w-full mt-6 sm:mt-10 py-4 sm:py-6 text-sm sm:text-lg font-black shadow-lg gap-2"
            >
                <Play className="fill-current w-4 h-4 sm:w-5 sm:h-5" /> BẮT ĐẦU 
            </BoxButton>
        </motion.div>
    )
}

export { LevelModeCard, FreeModeCard };
