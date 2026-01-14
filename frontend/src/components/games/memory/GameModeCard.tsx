import { BoxButton } from "@/components/ui/box-button";
import { motion } from "framer-motion";
import { Clock, Layers, Play, Star, Trophy } from "lucide-react";

interface LevelModeCardProps {
    startLevelMode: () => void;
}
const LevelModeCard = ({ startLevelMode }: LevelModeCardProps) => {
    return (
        <motion.div
            className="bg-card rounded-2xl p-4 sm:p-8 shadow-lg border-2 border-primary/10 mb-4 sm:mb-8 hover:border-primary"
            whileHover={{ scale: 1.02 }}
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

export { LevelModeCard };
