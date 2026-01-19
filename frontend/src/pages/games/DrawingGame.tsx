import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { GameHeader } from "@/components/games/GameHeader";
import { Palette, Download, Trash2, Save, Undo, Redo, History, Pencil, Square, Circle, Loader2, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import { RoundButton } from "@/components/ui/round-button";
import { useGameSession } from "@/hooks/useGameSession";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoadGameDialog } from "@/components/dialogs/LoadGameDialog";
import { Slider } from "@/components/ui/slider"
import axiosClient from "@/lib/axios";
import { toast } from "react-hot-toast";
import { GameLayout } from "@/components/layouts/GameLayout";

const GAME_ID = 7; // Drawing game ID

// Predefined colors
const COLORS = [
  "#000000", // Black
  "#FF3B30", // Red
  "#FF9500", // Orange
  "#FFCC00", // Yellow
  "#34C759", // Green
  "#007AFF", // Blue
  "#AF52DE", // Purple
  "#FF2D55", // Pink
  "#8E8E93", // Gray
  "#FFFFFF", // White
];

interface Point {
  x: number;
  y: number;
}

interface Path {
  color: string;
  size: number;
  points: Point[];
  type?: 'pen' | 'rectangle' | 'circle' | 'eraser';
  startPoint?: Point;
  endPoint?: Point;
}

interface DrawingBoardState {
  paths: Path[];
}

interface CanvasConfig {
  canvas_width: number;
  canvas_height: number;
  background_color: string;
}

export default function DrawingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'rectangle' | 'circle' | 'eraser'>('pen');
  const [currentColor, setCurrentColor] = useState(COLORS[6]); // Purple
  const [currentSize, setCurrentSize] = useState(4);
  const [tempSize, setTempSize] = useState(4); // Temporary size for slider
  const [paths, setPaths] = useState<Path[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>({
    canvas_width: 800,
    canvas_height: 600,
    background_color: "#ffffff",
  });
  const [history, setHistory] = useState<Path[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isInitializing, setIsInitializing] = useState(true);

  // Get board state for session
  const getBoardState = useCallback((): DrawingBoardState => {
    return { paths };
  }, [paths]);

  // useGameSession hook
  const {
    session,
    savedSessions,
    fetchSavedSessions,
    isLoading,
    isSaving,
    showLoadDialog,
    setShowLoadDialog,
    startGame: startGameSession,
    saveGame: saveGameSession,
    loadGame: loadGameSession,
    completeGame: completeGameSession,
  } = useGameSession({
    gameId: GAME_ID,
    getBoardState,
    autoCreate: false,
  });

  // Scroll to top and initial loading delay
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Start new game session
  useEffect(() => {
    startGameSession();
  }, []);

  // Debounce slider size updates
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSize(tempSize);
    }, 50);
    return () => clearTimeout(timer);
  }, [tempSize]);

  // Handle session load/create
  useEffect(() => {
    if (!session) {
      return;
    }

    try {
      // Get config
      const rawConfig = session.session_config;
      const config = rawConfig.default_config || rawConfig;

      if (config.canvas_width && config.canvas_height) {
        setCanvasConfig({
          canvas_width: config.canvas_width,
          canvas_height: config.canvas_height,
          background_color: config.background_color || "#ffffff",
        });
      }

      // Restore board state if exists
      const boardState = session.board_state as DrawingBoardState | null;
      if (boardState && boardState.paths && boardState.paths.length > 0) {
        setPaths(boardState.paths);
        setHistory([boardState.paths]);
        setHistoryIndex(0);
      }
    } catch (error) {
      console.error("Error loading session:", error);
    }
  }, [session, isLoading]);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = canvasConfig.background_color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all paths
    paths.forEach((path) => {
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (path.type === 'rectangle' && path.startPoint && path.endPoint) {
        const width = path.endPoint.x - path.startPoint.x;
        const height = path.endPoint.y - path.startPoint.y;
        ctx.strokeRect(path.startPoint.x, path.startPoint.y, width, height);
      } else if (path.type === 'circle' && path.startPoint && path.endPoint) {
        const centerX = (path.startPoint.x + path.endPoint.x) / 2;
        const centerY = (path.startPoint.y + path.endPoint.y) / 2;
        const radiusX = Math.abs(path.endPoint.x - path.startPoint.x) / 2;
        const radiusY = Math.abs(path.endPoint.y - path.startPoint.y) / 2;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (path.points.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);
        for (let i = 1; i < path.points.length; i++) {
          ctx.lineTo(path.points[i].x, path.points[i].y);
        }
        ctx.stroke();
      }
    });

    // Draw current path/shape
    ctx.strokeStyle = currentTool === 'eraser' ? canvasConfig.background_color : currentColor;
    ctx.lineWidth = currentTool === 'eraser' ? currentSize * 2 : currentSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if ((currentTool === 'pen' || currentTool === 'eraser') && currentPath.length > 0) {
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();
    } else if (currentTool === 'rectangle' && startPoint && currentPath.length > 0) {
      const endPoint = currentPath[currentPath.length - 1];
      const width = endPoint.x - startPoint.x;
      const height = endPoint.y - startPoint.y;
      ctx.strokeRect(startPoint.x, startPoint.y, width, height);
    } else if (currentTool === 'circle' && startPoint && currentPath.length > 0) {
      const endPoint = currentPath[currentPath.length - 1];
      const centerX = (startPoint.x + endPoint.x) / 2;
      const centerY = (startPoint.y + endPoint.y) / 2;
      const radiusX = Math.abs(endPoint.x - startPoint.x) / 2;
      const radiusY = Math.abs(endPoint.y - startPoint.y) / 2;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }, [paths, currentPath, canvasConfig, currentColor, currentSize, currentTool, startPoint]);

  // Get mouse position relative to canvas
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  };

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getMousePos(e);
    setStartPoint(pos);
    setCurrentPath([pos]);
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);
    if (currentTool === 'pen' || currentTool === 'eraser') {
      setCurrentPath((prev) => [...prev, pos]);
    } else {
      // For shapes, only keep start and current point
      setCurrentPath([pos]);
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (!isDrawing || currentPath.length === 0 || !startPoint) {
      setIsDrawing(false);
      setStartPoint(null);
      return;
    }

    let newPath: Path;
    
    if (currentTool === 'pen' || currentTool === 'eraser') {
      newPath = {
        color: currentTool === 'eraser' ? canvasConfig.background_color : currentColor,
        size: currentTool === 'eraser' ? currentSize * 2 : currentSize,
        points: currentPath,
        type: currentTool,
      };
    } else {
      const endPoint = currentPath[currentPath.length - 1];
      newPath = {
        color: currentColor,
        size: currentSize,
        points: [],
        type: currentTool,
        startPoint: startPoint,
        endPoint: endPoint,
      };
    }

    const newPaths = [...paths, newPath];
    setPaths(newPaths);
    
    // Update history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPaths);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    setCurrentPath([]);
    setStartPoint(null);
    setIsDrawing(false);
  };

  // Clear canvas
  const handleClear = () => {
    setPaths([]);
    setHistory([[]]);
    setHistoryIndex(0);
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPaths(history[historyIndex - 1]);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPaths(history[historyIndex + 1]);
    }
  };

  // Save drawing
  const handleSave = async () => {
    await saveGameSession(true);
  };

  // Download as image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Load game
  const handleLoadGame = async (sessionId: string) => {
    await loadGameSession(sessionId);
  };

  // Delete game
  const handleDeleteGame = async (sessionId: string) => {
    if(!sessionId) return;
    await axiosClient.delete(`/sessions/${sessionId}`);
    await fetchSavedSessions();
    toast.success("Đã xóa bản vẽ!");
  };

  // Save current session
  const handleSaveCurrentSession = async () => {
    if (session) {
      await saveGameSession(true);
    }
  };

  // Auto-save before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session && session.status === "playing") {
        const currentBoard = getBoardState();
        const url = `${import.meta.env.VITE_API_BASE_URL}/sessions/${session.id}/save`;

        const token = useAuthStore.getState().token;
        const apiKey = import.meta.env.VITE_API_KEY;

        fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-api-key": apiKey,
          },
          body: JSON.stringify({
            board_state: currentBoard,
            status: "saved",
          }),
          keepalive: true,
        }).catch((err) => console.error("Auto-save failed:", err));
      }
    };

    window.addEventListener("pagehide", handleBeforeUnload);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("pagehide", handleBeforeUnload);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [session, paths]);

  // Loading screen
  if (isInitializing || isLoading) {
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
    <GameLayout gameId={7}>
      <GameHeader />
      <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 pt-16 sm:pt-20 bg-gradient-to-br from-background via-background to-accent/5">
        <motion.div
          className="w-full max-w-6xl px-2 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-primary mb-1 sm:mb-2">
              VẼ TỰ DO
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Thể hiện sáng tạo của bạn</p>
          </div>

          {/* Toolbar */}
          <div className="bg-card rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-lg border-2 border-primary/10 mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              {/* Color picker */}
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCurrentColor(color)}
                      className={cn(
                        "w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-all",
                        currentColor === color
                          ? "border-primary scale-110"
                          : "border-border hover:scale-105"
                      )}
                      style={{
                        backgroundColor: color,
                        border: color === "#FFFFFF" ? "2px solid #e5e7eb" : undefined,
                      }}
                      title={color}
                    />
                  ))}
                  <label 
                    className="relative w-6 h-6 sm:w-8 sm:h-8 rounded-full cursor-pointer border-2 border-border hover:scale-105 transition-all overflow-hidden group"
                    title="Chọn màu tùy chỉnh"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 via-green-500 via-blue-500 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Palette className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow-md relative z-10" />
                    </div>
                    <input
                      type="color"
                      onChange={(e) => setCurrentColor(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      value={currentColor}
                    />
                  </label>
                </div>
              </div>

              {/* Tool selection */}
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Công cụ:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCurrentTool('pen')}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      currentTool === 'pen'
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted hover:bg-muted/80"
                    )}
                    title="Bút vẽ"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentTool('rectangle')}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      currentTool === 'rectangle'
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted hover:bg-muted/80"
                    )}
                    title="Hình vuông"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentTool('circle')}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      currentTool === 'circle'
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted hover:bg-muted/80"
                    )}
                    title="Hình tròn"
                  >
                    <Circle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentTool('eraser')}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      currentTool === 'eraser'
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted hover:bg-muted/80"
                    )}
                    title="Tẩy xóa"
                  >
                    <Eraser className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Brush size */}
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <span className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">
                  Kích cỡ: <span className="font-bold text-primary">{tempSize}px</span>
                </span>
                <div className="w-32 sm:w-40">
                  <Slider 
                    value={[tempSize]}
                    min={2}
                    max={30}
                    step={1}
                    onValueChange={(value) => setTempSize(value[0])}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center sm:justify-start">
                <RoundButton
                  size="small"
                  variant="neutral"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="rounded-md px-2 sm:px-3"
                  title="Hoàn tác"
                >
                  <Undo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </RoundButton>
                <RoundButton
                  size="small"
                  variant="neutral"
                  onClick={handleRedo}
                  disabled={historyIndex >= history.length - 1}
                  className="rounded-md px-2 sm:px-3"
                  title="Làm lại"
                >
                  <Redo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </RoundButton>
                <RoundButton
                  size="small"
                  variant="accent"
                  onClick={handleClear}
                  className="rounded-md px-2 sm:px-3"
                  title="Xóa tất cả"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline ml-1.5">Xóa</span>
                </RoundButton>
                <RoundButton
                  size="small"
                  variant="primary"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-md px-2 sm:px-3"
                  title="Lưu"
                >
                  <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline ml-1.5">Lưu</span>
                  {isSaving && <span className="ml-1">...</span>}
                </RoundButton>
                <RoundButton
                  size="small"
                  variant="neutral"
                  onClick={handleDownload}
                  className="rounded-md px-2 sm:px-3"
                  title="Tải về"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline ml-1.5">Tải về</span>
                </RoundButton>
                <LoadGameDialog
                  open={showLoadDialog}
                  onOpenChange={setShowLoadDialog}
                  sessions={savedSessions}
                  currentSessionId={session?.id}
                  onLoadSession={handleLoadGame}
                  onDeleteSession={handleDeleteGame}
                  onSaveSession={handleSaveCurrentSession}
                >
                  <RoundButton
                    size="small"
                    variant="neutral"
                    onClick={() => {
                      fetchSavedSessions();
                      setShowLoadDialog(true);
                    }}
                    className="rounded-md px-2 sm:px-3"
                    title="Tải bản vẽ"
                  >
                    <History />
                    <span className="hidden sm:inline ml-1.5">Lịch sử</span>
                  </RoundButton>
                </LoadGameDialog>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <motion.div
            className="bg-card rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-lg border-2 border-primary/10 flex justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="relative" style={{ maxWidth: '100%' }}>
              <canvas
                ref={canvasRef}
                width={canvasConfig.canvas_width}
                height={canvasConfig.canvas_height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={cn(
                  "border-2 border-border rounded-lg max-w-full h-auto block",
                  currentTool === 'eraser' ? "cursor-cell" : "cursor-crosshair"
                )}
                style={{ 
                  backgroundColor: canvasConfig.background_color,
                  touchAction: 'none'
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </GameLayout>
  );
}
