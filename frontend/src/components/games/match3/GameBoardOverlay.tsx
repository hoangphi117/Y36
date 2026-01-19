import { RoundButton } from '@/components/ui/round-button';
import { motion } from 'framer-motion';
import { ArrowLeft, Pause, Play, RotateCcw, Star, ChevronLeft } from 'lucide-react';

interface CandyType {
    id: string;
    icon: string;
}

interface GameStartOverlayProps {
  activeCandies: CandyType[];
  startGame: () => void;
}

const GameStartOverlay = ({ activeCandies, startGame }: GameStartOverlayProps) => {
    return (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] rounded-[2.3rem] p-4 sm:p-6 text-center">
            <div className="mb-4 sm:mb-6">
              <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-primary mb-3 sm:mb-4 opacity-80">Các loại kẹo sẽ xuất hiện:</p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {activeCandies.map((candy) => (
                  <motion.div 
                    key={candy.id}
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="w-10 h-10 sm:w-12 sm:h-12 bg-card rounded-2xl p-2 shadow-lg border border-primary/20 flex items-center justify-center"
                  >
                    <img src={candy.icon} className="w-full h-full object-contain" alt="candy" />
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={startGame}
              className="group relative flex flex-col items-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.5)] mb-2 group-hover:bg-primary/90 transition-colors">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground ml-1 fill-current" />
              </div>
              <span className="font-black text-primary text-lg sm:text-xl uppercase italic">Bắt đầu ngay</span>
            </motion.button>
          </div>
    )
}

interface GamePauseOverlayProps {
    resetToSetup: () => void;
}

const GamePauseOverlay = ({ resetToSetup }: GamePauseOverlayProps) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm rounded-[2.3rem] p-6"
            >
            <div className="text-center">
                <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mb-6"
                >
                <Pause className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-2xl font-black uppercase text-primary">Tạm dừng</p>
                </motion.div>
                
                <RoundButton 
                size="small" 
                variant="danger"
                onClick={resetToSetup}
                >
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại cài đặt
                </RoundButton>
            </div>
        </motion.div>
    )
}

interface GameOverOverlayProps {
    score: number;
    targetScore: number;
    onRestart: () => void;
    onExit: () => void;
}

const GameOverOverlay = ({ score, targetScore, onRestart, onExit }: GameOverOverlayProps) => {
  const calculateStars = (score: number, targetScore: number) => {
    if (score < targetScore) return 0
    if (score >= targetScore * 2.5) return 3
    if (score >= targetScore * 1.5) return 2
    return 1
  }

  const starsEarned = calculateStars(score, targetScore)
  const isWin = score >= targetScore
  const scoreRatio = Math.min((score / targetScore) * 100, 100)

  const starVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: (i: number) => ({
      scale: 1,
      rotate: 0,
      transition: { delay: i * 0.15, type: "spring" as const, stiffness: 100 },
    }),
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 15 },
    },
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="relative w-11/12 max-w-sm rounded-3xl p-4 sm:p-8 shadow-2xl border-2 overflow-hidden backdrop-blur-md bg-card border-primary/30"
      >
        {/* Background Animated Elements - Card Level */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className={`absolute top-0 right-0 w-40 h-40 ${isWin ? 'bg-primary' : 'bg-primary'}/10 rounded-full blur-2xl -mr-20 -mt-20`}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          className={`absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl -ml-16 -mb-16`}
        />

        {/* Header: Win/Lose Status */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8 relative z-10"
        >
          <h2 className={`text-5xl font-black mb-2 ${isWin ? "text-primary" : "text-destructive"} drop-shadow-lg`}>
            {isWin ? "CHIẾN THẮNG!" : "😔 THẤT BẠI"}
          </h2>
        </motion.div>

        {/* Stars Section */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-3 mb-8 relative z-10"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              custom={i}
              variants={starVariants}
              initial="hidden"
              animate={i < starsEarned ? "visible" : { scale: 1, rotate: 0 }}
              className="text-5xl drop-shadow-lg"
            >
              {i < starsEarned ? (
                <Star className="w-12 h-12 sm:w-15 sm:h-15 fill-yellow-400 text-yellow-400" />
              ) : (
                <Star className="w-12 h-12 sm:w-15 sm:h-15 text-gray-400/50" />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Score Section - Enhanced */}
        <motion.div
          variants={itemVariants}
          className="relative z-10 mb-8"
        >
          <div className="bg-muted/40 backdrop-blur-sm rounded-2xl p-6 border border-primary/20">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-black uppercase text-primary opacity-60">Điểm của bạn</p>
                <p className="text-xs font-black uppercase text-muted-foreground opacity-60">Mục tiêu</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <motion.p 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-black text-accent drop-shadow-lg"
                  >
                    {score}
                  </motion.p>
                </div>
                <div className="text-2xl text-muted-foreground opacity-40">/</div>
                <div className="flex-1 text-right">
                  <p className="text-3xl font-black text-primary drop-shadow-lg">{targetScore}</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full h-3 bg-muted/60 rounded-full overflow-hidden border border-primary/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scoreRatio}%` }}
                  transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  className={`h-full transition-colors ${isWin ? 'bg-linear-to-r from-primary to-primary/80' : 'bg-linear-to-r from-destructive to-destructive/80'}`}
                />
              </div>
              <p className="text-center text-xs font-bold mt-2 text-muted-foreground">
                {isWin ? (
                  <span className="text-primary text-sm">+{score - targetScore} điểm vượt mục tiêu! 🚀</span>
                ) : (
                  <span className="text-destructive">Cần {targetScore - score} điểm nữa ❌</span>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex gap-3 justify-center flex-wrap relative z-10"
        >
          <RoundButton
            onClick={onRestart}
          >
            <RotateCcw className="w-5 h-5" />
            Chơi lại
          </RoundButton>
          <RoundButton
            variant="danger"
            onClick={onExit}
          >
            <ChevronLeft/>
            về trang chủ
          </RoundButton>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
export { GameStartOverlay, GamePauseOverlay, GameOverOverlay };