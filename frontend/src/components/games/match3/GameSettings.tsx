import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Clock, Settings2, Target, Trophy } from "lucide-react";

interface GameModeProps {
    gameMode: "endless" | "time" | "rounds";
    setGameMode: (mode:  "endless" | "time" | "rounds") => void;
}

const GameMode = ({gameMode, setGameMode} : GameModeProps) => {
    return (
        <div className="bg-muted/40 backdrop-blur-sm rounded-xl border border-primary/20 p-5 space-y-3">
            <div className="flex items-center gap-2 text-primary font-black uppercase">
            <Settings2 className="w-5 h-5" />
            <span>Chế độ chơi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-muted/60 transition-colors border border-transparent hover:border-primary/20">
                <input 
                type="radio" 
                name="gameMode" 
                value="endless" 
                checked={gameMode === "endless"}
                onChange={(e) => setGameMode(e.target.value as "endless")}
                className="w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                <p className="font-bold text-sm">Chơi tự do</p>
                <p className="text-xs opacity-60">Không giới hạn</p>
                </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-muted/60 transition-colors border border-transparent hover:border-primary/20">
                <input 
                type="radio" 
                name="gameMode" 
                value="time" 
                checked={gameMode === "time"}
                onChange={(e) => setGameMode(e.target.value as "time")}
                className="w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                <p className="font-bold text-sm">Chơi theo thời gian</p>
                <p className="text-xs opacity-60">Ghi điểm cao nhất</p>
                </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl hover:bg-muted/60 transition-colors border border-transparent hover:border-primary/20">
                <input 
                type="radio" 
                name="gameMode" 
                value="rounds" 
                checked={gameMode === "rounds"}
                onChange={(e) => setGameMode(e.target.value as "rounds")}
                className="w-4 h-4 cursor-pointer"
                />
                <div className="flex-1">
                <p className="font-bold text-sm">Chơi theo lần ghép</p>
                <p className="text-xs opacity-60">Hoàn thành mục tiêu</p>
                </div>
            </label>
            </div>
        </div>
    )
}

interface GameBoardConfigProps {
    numCandyTypes: number;
    setNumCandyTypes: (value: number) => void;
    boardSize: number;
    setBoardSize: (value: number) => void;
}

const GameBoardConfig = ({numCandyTypes, setNumCandyTypes, boardSize, setBoardSize} : GameBoardConfigProps) => {
    return (
        <div className="bg-muted/40 backdrop-blur-sm rounded-2xl border border-primary/20 p-5 space-y-4">
            <div className="flex items-center gap-2 text-primary font-black uppercase text-sm">
                <Trophy className="w-4 h-4" />
                Cài đặt bảng
            </div>

            <div className="space-y-4">
                <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-black uppercase opacity-60 tracking-widest">
                    LOẠI KẸO
                </label>
                <div className="flex gap-1.5 flex-wrap">
                    {[5, 6, 7, 8].map((n) => (
                    <button
                        key={n}
                        onClick={() => setNumCandyTypes(n)}
                        className={cn(
                        "w-10 h-10 rounded-md font-black text-sm transition-all border-b-2",
                        numCandyTypes === n 
                            ? "bg-primary text-primary-foreground border-primary-700 shadow-md" 
                            : "bg-background text-muted-foreground border-2"
                        )}
                    >
                        {n}
                    </button>
                    ))}
                </div>
                </div>

                <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase opacity-60 tracking-widest">
                    Kích thước bàn
                </label>
                <div className="flex gap-2">
                    {[6, 7, 8].map((s) => (
                    <button
                        key={s}
                        onClick={() => setBoardSize(s)}
                        className={cn(
                        "flex-1 h-12 rounded-md font-black transition-all border-b-4 relative overflow-hidden",
                        boardSize === s 
                            ? "bg-primary text-primary-foreground border-primary-700" 
                            : "bg-background text-muted-foreground border-2 hover:border-primary/30"
                        )}
                    >
                        {s}x{s}
                    </button>
                    ))}
                </div>
                </div>
            </div>
        </div>
    )
}

interface TimeAndRoundsConfigProps {
    gameMode: "time" | "rounds" | "endless";
    setTimeLimit: (value: number) => void;
    setTargetMatches: (value: number) => void;
    timeLimit: number;
    targetMatches: number;
    defaultTimeOptions?: number[];
    defaultRoundOptions?: number[];
    defaultTimeLimit?: number;
    defaultTargetMatches?: number;
}

const TimeAndRoundsConfig = ({
    gameMode, 
    setTimeLimit, 
    setTargetMatches, 
    timeLimit, 
    targetMatches,
    defaultTimeOptions = [30, 60, 180],
    defaultRoundOptions = [5, 10, 20],
    defaultTimeLimit,
    defaultTargetMatches
} : TimeAndRoundsConfigProps) => {
    // Tạo mảng thời gian bao gồm giá trị mặc định và giá trị hiện tại (lọc bỏ giá trị 0)
    const allTimeOptions = [...new Set([
        ...defaultTimeOptions, 
        ...(defaultTimeLimit && defaultTimeLimit > 0 ? [defaultTimeLimit] : []),
        ...(timeLimit > 0 ? [timeLimit] : [])
    ])].sort((a, b) => a - b);
    
    // Tạo mảng rounds bao gồm giá trị mặc định và giá trị hiện tại (lọc bỏ giá trị 0)
    const allRoundOptions = [...new Set([
        ...defaultRoundOptions,
        ...(defaultTargetMatches && defaultTargetMatches > 0 ? [defaultTargetMatches] : []),
        ...(targetMatches > 0 ? [targetMatches] : [])
    ])].sort((a, b) => a - b);
    
    const formatTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (remainingSeconds === 0) {
            return `${minutes}p`;
        }
        return `${minutes}p${remainingSeconds.toString().padStart(2, '0')}s`;
    };

    return (
        <>
          {gameMode === "time" && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-muted/40 backdrop-blur-sm rounded-2xl border border-primary/20 p-5"
            >
                <div className="flex items-center gap-2 text-primary font-black uppercase mb-4 text-sm">
                    <Clock className="w-4 h-4" />
                    Thời gian
                </div>
                <div className="grid grid-cols-3 gap-2">
                {allTimeOptions.map((time) => (
                    <button
                        key={time}
                        onClick={() => setTimeLimit(time)}
                        className={cn(
                        "py-3 px-2 rounded-lg font-bold text-sm transition-all border",
                        timeLimit === time || (timeLimit === 0 && time === allTimeOptions[0])
                        ? "bg-primary text-primary-foreground border-primary shadow-lg"
                        : "bg-muted border-primary/20 hover:bg-muted/80"
                    )}
                    >
                    {formatTime(time)}
                    </button>
                ))}
                </div>
            </motion.div>
            )}

            {/* Rounds Settings */}
            {gameMode === "rounds" && (
            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="bg-muted/40 backdrop-blur-sm rounded-2xl border border-primary/20 p-5"
            >
                <div className="flex items-center gap-2 text-primary font-black uppercase mb-4 text-sm">
                <Target className="w-4 h-4" />
                Lần ghép mục tiêu
                </div>
                <div className="grid grid-cols-3 gap-2">
                {allRoundOptions.map((rounds) => (
                    <button
                    key={rounds}
                    onClick={() => setTargetMatches(rounds)}
                    className={cn(
                        "py-3 px-2 rounded-lg font-bold text-sm transition-all border",
                        targetMatches === rounds || (targetMatches === 0 && rounds === allRoundOptions[0])
                        ? "bg-primary text-primary-foreground border-primary shadow-lg"
                        : "bg-muted border-primary/20 hover:bg-muted/80"
                    )}
                    >
                    {rounds}
                    </button>
                ))}
                </div>
            </motion.div>
            )}
        </>
    )
}


export {GameMode, GameBoardConfig, TimeAndRoundsConfig}