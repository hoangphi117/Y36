import { RoundButton } from "@/components/ui/round-button";
import { motion } from "framer-motion";
import { ChevronRight, RefreshCcw } from "lucide-react";

interface GameStatusOverlayProps {
    totalScore: number;
    gameStatus?: "completed" | "lost" | "playing" | string;
    action: () => void;
    currentLevel?: number;
}

const GameStatusOverlay = ({ totalScore, gameStatus, action, currentLevel }: GameStatusOverlayProps) => {
    return (
        <motion.div
            className="bg-card rounded-2xl p-6 sm:p-12 text-center shadow-lg border-2 border-primary/20 mb-4 sm:mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            {gameStatus === "completed" && (
                <>
                    {currentLevel !== undefined && currentLevel < 5 && (
                        <p className="text-xl sm:text-3xl font-black text-primary mb-2">Level {currentLevel + 1} Hoàn thành! 🎉</p>
                    )}
                    {currentLevel === 5 && (
                        <p className="text-xl sm:text-3xl font-black text-primary mb-2">Chúc mừng! Bạn đã hoàn thành tất cả 6 cấp độ! 🏆</p>
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
                {gameStatus === "completed" ? "Màn tiếp theo" : "Chơi lại"}
                {gameStatus === "completed" ? <ChevronRight className="w-4 h-4" /> : <RefreshCcw className="w-4 h-4" />}
            </RoundButton>

        </motion.div>
    )
}

export {GameStatusOverlay};