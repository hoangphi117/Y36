import { RoundButton } from "@/components/ui/round-button";
import { motion } from "framer-motion";
import { ChevronRight, RefreshCcw } from "lucide-react";

interface GameStatusOverlayProps {
    totalScore: number;
    gameStatus?: "completed" | "lost" | "playing" | string;
    action: () => void;
    currentLevel?: number;
    totalLevels?: number;
}

const GameStatusOverlay = ({ totalScore, gameStatus, action, currentLevel, totalLevels = 6 }: GameStatusOverlayProps) => {
    return (
        <motion.div
            className="bg-card rounded-2xl p-4 sm:p-12 text-center shadow-lg border-2 border-primary/20 mb-3 mt-3 sm:mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {gameStatus === "completed" && (
                <>
                    {currentLevel !== undefined && currentLevel < totalLevels - 1 && (
                        <p className="text-xl sm:text-3xl font-black text-primary mb-2">Level {currentLevel + 1} Hoàn thành! 🎉</p>
                    )}
                    {currentLevel === totalLevels - 1 && (
                        <>
                            <p className="text-xl sm:text-3xl font-black text-primary mb-2">Hoàn thành! 🏆</p>
                            <p className="text-sm sm:text-base text-muted-foreground mb-2">Đã vượt qua {totalLevels} cấp độ</p>
                        </>
                    )}
                </>
            )}

            {gameStatus === "freeCompleted" && (
                <p className="text-xl sm:text-3xl font-black text-primary mb-2">Chiến thắng</p>
            )}

            {gameStatus === "lost" && (
                <p className="text-xl sm:text-3xl font-black text-destructive mb-2">Thất bại 😞</p>
            )}
            <p className="text-foreground text-xl">Tổng điểm: <span className="font-bold text-primary text-xl">{totalScore}</span></p>

            <RoundButton size="small" variant="primary" className="mt-3 rounded-sm text-sm" onClick={action} >
                {gameStatus === "completed" && currentLevel !== undefined && currentLevel < totalLevels - 1 ? "Màn tiếp theo" : "Chơi lại"}
                {gameStatus === "completed" && currentLevel !== undefined && currentLevel < totalLevels - 1 ? <ChevronRight className="w-4 h-4" /> : <RefreshCcw className="w-4 h-4" />}
            </RoundButton>

        </motion.div>
    )
}

export {GameStatusOverlay};