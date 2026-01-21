import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoundButton } from "@/components/ui/round-button";
import {
  Loader2,
  Volume2,
  VolumeX,
  Upload,
  Download,
  Clock,
  LogOut,
  User,
  Bot,
  Zap,
  Settings,
  Pause,
  PlayCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useGameSound } from "@/hooks/useGameSound";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import { useGameSession } from "@/hooks/useGameSession";
import { LoadGameDialog } from "@/components/dialogs/LoadGameDialog";
import { GameInstructions } from "@/components/games/GameInstructions";
import { GameResultOverlay } from "@/components/games/GameResultOverlay";
import { PauseMenu } from "@/components/games/memory/PauseMenu";

import {
  GameSettingsDialog,
  type Difficulty,
} from "@/components/dialogs/GameSettingsDialog";
import { getTimeOptions, getBoardSizeOptions } from "@/config/gameConfigs";

import {
  checkWin,
  getEasyMove,
  getMediumMove,
  getHardMove,
} from "@/lib/AI/caroAI";

import formatTime from "@/utils/formatTime";
import axiosClient from "@/lib/axios";
import { toast } from "sonner";
import { GameLayout } from "@/components/layouts/GameLayout";

interface CaroGameProps {
  gameId: number;
  winCondition: number;
  onBack?: () => void;
}

const getDefaultSize = (gameId: number) => {
  if (gameId === 2) return 12;
  return 15;
};

const getCellTextSize = (size: number) => {
  if (size >= 20) return "text-[10px] sm:text-xs";
  if (size >= 16) return "text-xs sm:text-sm";
  if (size >= 12) return "text-sm sm:text-lg";
  return "text-lg sm:text-xl";
};

export default function CaroGame({ gameId, winCondition, onBack }: CaroGameProps) {
  useDocumentTitle(`Cờ Caro (${winCondition} ô)`);

  const initialSize = getDefaultSize(gameId);

  const [boardSize, setBoardSize] = useState(initialSize);
  const [board, setBoard] = useState<(string | null)[]>(
    Array(initialSize * initialSize).fill(null),
  );

  const [playerPiece, setPlayerPiece] = useState<"X" | "O">("X");
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isManualStartRef = useRef(false);

  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [timeLimit, setTimeLimit] = useState(0);
  const [turnTimeLimit, setTurnTimeLimit] = useState(0);
  const [currentTurnCountdown, setCurrentTurnCountdown] = useState(0);

  const [isTimeOut, setIsTimeOut] = useState(false);
  const [timeOutReason, setTimeOutReason] = useState<"total" | "turn" | null>(
    null,
  );

  const [isManualPaused, setIsManualPaused] = useState(false);
  const isGamePaused = isManualPaused || isSettingsOpen;

  const boardRef = useRef(board);
  const boardSizeRef = useRef(boardSize);
  const playerPieceRef = useRef(playerPiece);
  const isPlayerTurnRef = useRef(isPlayerTurn);
  const winnerRef = useRef(winner);

  const ignoreConfigSyncRef = useRef(false);

  useEffect(() => {
    boardRef.current = board;
    boardSizeRef.current = boardSize;
    playerPieceRef.current = playerPiece;
    isPlayerTurnRef.current = isPlayerTurn;
    winnerRef.current = winner;
  }, [board, boardSize, playerPiece, isPlayerTurn, winner]);

  const getBoardState = useCallback(() => {
    return {
      board: boardRef.current,
      boardSize: boardSizeRef.current,
      playerPiece: playerPieceRef.current,
      isPlayerTurn: isPlayerTurnRef.current,
      winner: winnerRef.current,
    };
  }, []);

  const {
    session,
    currentPlayTime,
    savedSessions,
    isLoading,
    isSaving,
    showLoadDialog,
    setShowLoadDialog,
    startGame,
    loadGame,
    saveGame,
    completeGame,
    quitGame,
    fetchSavedSessions,
    resetTimer,
  } = useGameSession({
    gameId,
    getBoardState,
    isPaused: isGamePaused || !!winner || isTimeOut,
    autoCreate: false,
    onQuit: onBack,
  });

  const timeOptions = getTimeOptions(gameId);
  const boardSizeOptions = getBoardSizeOptions(gameId);
  const isBoardEmpty = board.every((c) => c === null);

  useEffect(() => {
    if (!isLoading && !session && !showLoadDialog) {
      setIsSettingsOpen(true);
    }
  }, [isLoading, session, showLoadDialog]);

  useEffect(() => {
    if (!session) return;

    if (session.session_config && !ignoreConfigSyncRef.current) {
      if (session.session_config.time_limit !== undefined)
        setTimeLimit(Number(session.session_config.time_limit));
      if (session.session_config.turn_time !== undefined)
        setTurnTimeLimit(Number(session.session_config.turn_time));
    }

    if (session.board_state && !ignoreConfigSyncRef.current) {
      const state = session.board_state as any;

      if (state.boardSize) {
        setBoardSize(state.boardSize);
        boardSizeRef.current = state.boardSize;
      }

      if (state.board)
        setBoard(
          state.board ?? Array(state.boardSize * state.boardSize).fill(null),
        );

      if (state.playerPiece) setPlayerPiece(state.playerPiece);
      if (state.isPlayerTurn !== undefined) setIsPlayerTurn(state.isPlayerTurn);

      setWinner(null);
      setWinningLine([]);
    }
  }, [session]);

  useEffect(() => {
    let interval: number;

    if (
      (session?.status === "playing" || session?.status === "saved") &&
      !winner &&
      !isTimeOut &&
      turnTimeLimit > 0 &&
      !isGamePaused
    ) {
      interval = window.setInterval(() => {
        setCurrentTurnCountdown((prev) => {
          if (prev <= 1) {
            setIsTimeOut(true);
            setTimeOutReason("turn");
            playSound("lose");
            completeGame(-1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [session?.status, winner, isTimeOut, turnTimeLimit, isGamePaused]);

  useEffect(() => {
    if (turnTimeLimit > 0) setCurrentTurnCountdown(turnTimeLimit);
  }, [isPlayerTurn, turnTimeLimit]);

  const { playSound: originalPlaySound } = useGameSound();
  const playSound = (type: string) =>
    soundEnabled && originalPlaySound(type as any);

  const botPiece = playerPiece === "X" ? "O" : "X";

  const handleSaveSettings = (
    newDifficulty: Difficulty,
    newTimeLimit: number,
    newTurnTime: number,
    newBoardSize: number,
  ) => {
    setDifficulty(newDifficulty);
    setTimeLimit(newTimeLimit);
    setTurnTimeLimit(newTurnTime);
    setBoardSize(newBoardSize);
    boardSizeRef.current = newBoardSize;

    setBoard(Array(newBoardSize * newBoardSize).fill(null));
    setPlayerPiece("X");
    setIsPlayerTurn(true);
    setWinner(null);
    setWinningLine([]);
    setIsTimeOut(false);
    setTimeOutReason(null);
    resetTimer();

    ignoreConfigSyncRef.current = true;
    isManualStartRef.current = true;

    const newConfig = {
      time_limit: newTimeLimit,
      turn_time: newTurnTime,
      difficulty: newDifficulty,
    };

    startGame(newConfig);

    setIsSettingsOpen(false);
  };

  const handleSwitchSide = (p: "X" | "O") => {
    playSound("button");
    setPlayerPiece(p);
    setBoard(Array(boardSizeRef.current ** 2).fill(null));
    setWinner(null);
    setWinningLine([]);
    setIsPlayerTurn(true);
    setIsTimeOut(false);
    resetTimer();
  };

  const handleUserClick = (index: number) => {
    // Block clicks if:
    // 1. Not player's turn
    // 2. Game ended (winner/draw)
    // 3. Game paused/settings open
    if (!isPlayerTurn || winner || isTimeOut || isSettingsOpen) return;
    
    // Also block if cell is taken - though handleMove checks this, checking here saves a call
    if (board[index]) return;

    handleMove(index, playerPiece);
  };

  const handleMove = useCallback(
    (index: number, piece: string) => {
      if (
        board[index] ||
        winner ||
        isTimeOut ||
        isTimeOut ||
        (session?.status !== "playing" && session?.status !== "saved") ||
        isSettingsOpen
      )
        return;

      playSound("pop");
      const newBoard = [...board];
      newBoard[index] = piece;
      setBoard(newBoard);

      const winLine = checkWin(
        newBoard,
        index,
        winCondition,
        boardSizeRef.current,
      );

      if (winLine) {
        setWinner(piece);
        setWinningLine(winLine);
      } else {
        setIsPlayerTurn(piece !== playerPiece);
      }
    },
    [
      board,
      winner,
      isTimeOut,
      playerPiece,
      winCondition,
      session?.status,
      isSettingsOpen,
    ],
  );

  useEffect(() => {
    if (
      !session ||
      (session.status !== "playing" && session.status !== "saved") ||
      winner ||
      isTimeOut ||
      isGamePaused
    )
      return;

    const xCount = board.filter((c) => c === "X").length;
    const oCount = board.filter((c) => c === "O").length;
    const currentTurn = xCount === oCount ? "X" : "O";

    if (currentTurn === botPiece) {
      const timer = setTimeout(() => {
        let move = -1;

        if (difficulty === "easy")
          move = getEasyMove(board, boardSizeRef.current);
        else if (difficulty === "medium")
          move = getMediumMove(
            board,
            winCondition,
            botPiece,
            playerPiece,
            boardSizeRef.current,
          );
        else
          move = getHardMove(
            board,
            winCondition,
            botPiece,
            playerPiece,
            boardSizeRef.current,
          );

        if (move !== -1) handleMove(move, botPiece);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [
    board,
    difficulty,
    winCondition,
    botPiece,
    playerPiece,
    winner,
    session,
    isTimeOut,
    isSettingsOpen,
  ]);

  useEffect(() => {
    if ((session?.status === "playing" || session?.status === "saved") && !isTimeOut) {
      if (winner) {
        if (winner === playerPiece) {
          playSound("win");
          completeGame(1);
        } else {
          playSound("lose");
          completeGame(-1);
        }
      } else if (board.length > 0 && board.every((c) => c !== null)) {
        playSound("draw");
        completeGame(0);
      }
    }
  }, [winner, board, playerPiece, session?.status, isTimeOut]);

  const handleManualSave = () => saveGame(true);

  const handleOpenSavedGames = async () => {
    await fetchSavedSessions();
    setShowLoadDialog(true);
  };

  const handleDeleteGame = async (sessionId: string) => {
    try {
      await axiosClient.delete(`/sessions/${sessionId}`);
      await fetchSavedSessions();
      toast.success("Đã xóa ván chơi!");
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("Xóa thất bại");
    }
  };

  const handleRestart = async (sizeOverride?: number) => {
    const sizeToUse = sizeOverride ?? boardSizeRef.current;
    setBoard(Array(sizeToUse * sizeToUse).fill(null));
    setWinner(null);
    setWinningLine([]);
    setIsPlayerTurn(true);
    setPlayerPiece("X");
    setIsTimeOut(false);
    setTimeOutReason(null);
    setIsManualPaused(false);
    resetTimer();
    if (turnTimeLimit > 0) setCurrentTurnCountdown(turnTimeLimit);

    setIsSettingsOpen(true);
  };

  const handleStandardNewGame = async () => {
    setIsSettingsOpen(true);
  };

  const handleSaveAndExit = async () => {
    setIsManualPaused(false);
    await saveGame(true);
    if (onBack) onBack();
  };



  const isInitialSetup =
    (!session || (session.play_time_seconds === 0 && !session.board_state)) &&
    isSettingsOpen;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="animate-pulse font-medium text-muted-foreground">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  return (
    <GameLayout gameId={gameId}>
      <div className="flex flex-col items-center min-h-screen bg-background text-foreground transition-colors duration-300">
        <div className="flex flex-col items-center justify-center pt-2 px-4 w-full max-w-4xl relative">
          
          <div className="w-full flex items-center justify-center mb-2">
             <div className="flex flex-col items-center">
                {/* Header Removed */}
                
                {/* TIMERS & STATUS ROW */}
                <div className="h-8 flex items-center justify-center gap-4 mt-1">
                  
                  {/* Total Timer */}
                  <div
                    className={cn(
                      "font-mono text-sm font-bold flex items-center gap-2 px-3 py-1 rounded-full border transition-colors",
                      timeLimit > 0 && currentPlayTime > timeLimit * 0.8
                        ? "bg-red-100 text-red-600 border-red-300 animate-pulse"
                        : "bg-primary/10 text-primary border-primary/20",
                    )}
                  >
                    <Clock className="w-3 h-3" /> {formatTime(currentPlayTime)}
                    {timeLimit > 0 && (
                      <span className="text-xs opacity-70">
                        / {formatTime(timeLimit)}
                      </span>
                    )}
                  </div>

                  {/* Turn Timer */}
                  {turnTimeLimit > 0 && !winner && !isTimeOut && (
                    <div
                      className={cn(
                        "font-mono text-sm font-bold flex items-center gap-2 px-3 py-1 rounded-full border transition-colors",
                        currentTurnCountdown <= 5
                          ? "bg-red-500 text-white animate-ping"
                          : "bg-orange-100 text-orange-600 border-orange-300",
                      )}
                    >
                      <Zap className="w-3 h-3 fill-current" />{" "}
                      {currentTurnCountdown}s
                    </div>
                  )}

                  <div className="w-[1px] h-6 bg-border"></div>
                  
                  {/* Status Text */}
                  {winner ? (
                    <span
                      className={cn(
                        "text-sm font-bold animate-bounce",
                        winner === playerPiece
                          ? "text-primary"
                          : "text-destructive",
                      )}
                    >
                      {winner === playerPiece ? "🎉 BẠN THẮNG!" : "🤖 BOT THẮNG!"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm font-medium animate-pulse">
                      {(board.filter((c) => c !== null).length % 2 === 0 &&
                        playerPiece === "X") ||
                      (board.filter((c) => c !== null).length % 2 !== 0 &&
                        playerPiece === "O")
                        ? "Lượt của bạn..."
                        : `Bot (${difficulty}) đang tính...`}
                    </span>
                  )}
                </div>
             </div>
          </div>



          {/* CONTROLS */}
          <div className="flex flex-wrap gap-4 mb-6 justify-center items-center relative z-20">
            <RoundButton
              onClick={handleManualSave}
              disabled={isSaving || !!winner || (session?.status !== "playing" && session?.status !== "saved")}
              variant="primary"
              className="flex items-center gap-2 px-4"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}{" "}
              Lưu
            </RoundButton>

            <LoadGameDialog
              open={showLoadDialog}
              onOpenChange={setShowLoadDialog}
              sessions={savedSessions}
              currentSessionId={session?.id}
              onLoadSession={loadGame}
              onNewGame={handleStandardNewGame}
              onDeleteSession={handleDeleteGame}
              onBack={onBack}
            >
              <RoundButton
                variant="neutral"
                className="flex items-center gap-2 px-4"
                onClick={handleOpenSavedGames}
              >
                <Download className="w-4 h-4" /> Tải
              </RoundButton>
            </LoadGameDialog>

            <RoundButton
              size="small"
              variant="neutral"
              onClick={() => setIsManualPaused(!isManualPaused)}
              disabled={!!winner || isTimeOut}
              className="flex items-center gap-2 px-4"
            >
              {isManualPaused ? (
                <>
                  <PlayCircle className="w-4 h-4" /> 
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" /> 
                </>
              )}
            </RoundButton>


            {/* Switch Side */}
            {isBoardEmpty && (session?.status === "playing" || session?.status === "saved") && (
              <div className="flex bg-muted p-1 rounded-full border border-border">
                <button
                  onClick={() => handleSwitchSide("X")}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold transition-all",
                    playerPiece === "X"
                      ? "bg-white text-primary shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  <User className="w-3 h-3" /> X
                </button>
                <button
                  onClick={() => handleSwitchSide("O")}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold transition-all",
                    playerPiece === "O"
                      ? "bg-white text-primary shadow-sm"
                      : "text-muted-foreground",
                  )}
                >
                  <Bot className="w-3 h-3" /> O
                </button>
              </div>
            )}

            <RoundButton
              size="small"
              variant="neutral"
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </RoundButton>

            <GameInstructions gameType="caro"/>

            <RoundButton
              size="small"
              variant="neutral"
              onClick={() => setIsSettingsOpen(true)}
              title="Cài đặt"
              disabled={!!winner || isTimeOut}
            >
              <Settings className="w-4 h-4" />
            </RoundButton>
            <RoundButton
              size="small"
              variant="neutral"
              onClick={quitGame}
              title="Thoát"
            >
              <LogOut className="w-4 h-4" />
            </RoundButton>
          </div>

          {/* BOARD */}
          <div className="w-full flex justify-center">
            <div className="relative w-full max-w-[90vmin] sm:max-w-[600px] p-2 bg-[var(--board-bg)] rounded-[1.5rem] shadow-2xl border-4 border-primary/30 overflow-hidden">
              <div
                className="grid w-full bg-border gap-[1px] border-2 border-border"
                style={{
                  gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
                }}
              >
                {board.map((cell, index) => (
                  <button
                    key={index}
                    disabled={
                      !!cell ||
                      !!winner ||
                      isTimeOut ||
                      !isPlayerTurn ||
                      (session?.status !== "playing" && session?.status !== "saved")
                    }
                    onClick={() => handleUserClick(index)}
                    className={cn(
                      "aspect-square w-full flex items-center justify-center",
                      "bg-[var(--board-bg)] hover:bg-[var(--cell-hover)]",
                      "font-black leading-none select-none",
                      getCellTextSize(boardSize),
                      winningLine.includes(index) &&
                        "bg-accent/80 animate-pulse",
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {cell && (
                        <motion.span
                          key={cell}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className={cn(
                            "drop-shadow-sm",
                            cell === playerPiece
                              ? "text-[var(--game-x)]"
                              : "text-[var(--game-o)]",
                          )}
                        >
                          {cell}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {(winner || isTimeOut || (board.every((c) => c !== null) && !winner)) && (
                  <GameResultOverlay
                    status={
                      isTimeOut
                        ? "timeout"
                        : winner === playerPiece
                          ? "win"
                          : winner
                            ? "lose"
                            : "draw"
                    }
                    winner={winner === playerPiece ? "user" : "bot"}
                    gameType="caro"
                    onRestart={() => handleRestart()}
                    onQuit={quitGame}
                    reason={timeOutReason}
                    playTime={currentPlayTime}
                  />
                )}
              </AnimatePresence>

              {/* Settings Dialog (inline mode) */}
              {!winner && !isTimeOut && (
                <GameSettingsDialog
                  open={isSettingsOpen}
                  onOpenChange={setIsSettingsOpen}
                  currentDifficulty={difficulty}
                  currentTimeLimit={timeLimit}
                  currentTurnTime={turnTimeLimit}
                  currentBoardSize={boardSize}
                  timeOptions={timeOptions}
                  boardSizeOptions={boardSizeOptions}
                  onSave={handleSaveSettings}
                  disabled={session?.status !== "playing" && session?.status !== "saved"}
                  preventClose={isInitialSetup}
                  inline
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pause Menu */}
      {isManualPaused && !winner && !isTimeOut && (
        <PauseMenu
          onContinue={() => setIsManualPaused(false)}
          onSaveAndExit={handleSaveAndExit}
          onRestart={() => handleRestart()}
        />
      )}
    </GameLayout>
  );
}
