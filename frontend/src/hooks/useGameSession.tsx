import { useState, useEffect, useCallback, useRef } from "react";
import axiosClient from "@/lib/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { type GameSession } from "@/types/game";
import { useAuthStore } from "@/stores/useAuthStore";

interface UseGameSessionProps {
  gameId: number;
  getBoardState: () => any;
  isPaused?: boolean; // [MỚI] Nhận trạng thái pause từ game
}

export function useGameSession({
  gameId,
  getBoardState,
  isPaused,
}: UseGameSessionProps) {
  const navigate = useNavigate();
  const [session, setSession] = useState<GameSession | null>(null);
  const [savedSessions, setSavedSessions] = useState<GameSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  const sessionRef = useRef<GameSession | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number | null>(null);

  const [currentPlayTime, setCurrentPlayTime] = useState(0);

  useEffect(() => {
    sessionRef.current = session;

    if (session) {
      startTimeRef.current = Date.now() - session.play_time_seconds * 1000;
      setCurrentPlayTime(session.play_time_seconds);
    }
  }, [session]);

  useEffect(() => {
    if (isPaused) {
      // Bắt đầu pause: ghi lại thời điểm
      pauseStartTimeRef.current = Date.now();
    } else {
      // Kết thúc pause: tính khoảng thời gian đã nghỉ
      if (pauseStartTimeRef.current) {
        const pauseDuration = Date.now() - pauseStartTimeRef.current;
        // Dời thời gian bắt đầu về phía sau tương ứng với thời gian nghỉ
        // Để công thức (now - startTime) vẫn ra kết quả đúng
        startTimeRef.current += pauseDuration;
        pauseStartTimeRef.current = null;
      }
    }
  }, [isPaused]);

  useEffect(() => {
    let intervalId: number;

    // [SỬA] Chỉ chạy timer khi playing VÀ không bị pause
    if (session?.status === "playing" && !isPaused) {
      intervalId = window.setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        setCurrentPlayTime(elapsed);
      }, 1000);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [session?.status, session?.id, isPaused]);

  const resetTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setCurrentPlayTime(0);
    pauseStartTimeRef.current = null; // Reset cả pause ref
  }, []);

  const getCurrentTimeForApi = () => {
    if (!startTimeRef.current) return 0;

    // Nếu đang pause khi save, phải trừ thời gian pause hiện tại ra
    let adjustment = 0;
    if (isPaused && pauseStartTimeRef.current) {
      adjustment = Date.now() - pauseStartTimeRef.current;
    }

    return Math.floor((Date.now() - startTimeRef.current - adjustment) / 1000);
  };

  const fetchSavedSessions = useCallback(async () => {
    try {
      const res = await axiosClient.get("/sessions/history", {
        params: { gameId, status: "saved", limit: 10 },
      });
      setSavedSessions(res.data.data || []);
      return res.data.data || [];
    } catch (error) {
      console.error("Lỗi lấy lịch sử:", error);
      return [];
    }
  }, [gameId]);

  const startGame = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.post("/sessions/start", { gameId });
      const newSession = res.data.session;

      setSession(newSession);
      setShowLoadDialog(false);
      // Reset pause state khi start game mới
      pauseStartTimeRef.current = null;
    } catch (error: any) {
      toast.error("Lỗi tạo game: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  const loadGame = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get(`/sessions/${sessionId}/load`);
      const loadedSession = res.data.session;

      setSession(loadedSession);
      setShowLoadDialog(false);
      startTimeRef.current =
        Date.now() - loadedSession.play_time_seconds * 1000;
      pauseStartTimeRef.current = null; // Reset pause state
      toast.success("Đã tải lại ván game!", { duration: 1500 });
    } catch (error: any) {
      toast.error("Lỗi tải game: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveGame = useCallback(
    async (manual = false) => {
      if (!sessionRef.current) return;
      try {
        if (manual) setIsSaving(true);
        const currentBoard = getBoardState();
        const playTime = getCurrentTimeForApi();

        const payload: any = {
          board_state: currentBoard,
          play_time_seconds: playTime,
        };

        if (manual) {
          payload.status = "saved";
        }

        const res = await axiosClient.put(
          `/sessions/${sessionRef.current.id}/save`,
          payload
        );

        setSession(res.data.session);

        if (manual) {
          toast.success("Đã lưu game thành công!", {
            duration: 1500,
          });
          fetchSavedSessions();
        }
      } catch (error: any) {
        console.error("Save error", error);
        if (manual) toast.error("Lỗi lưu game");
      } finally {
        if (manual) setIsSaving(false);
      }
    },
    [getBoardState, fetchSavedSessions, isPaused] // Thêm isPaused
  );

  const completeGame = useCallback(
    async (score: number) => {
      if (!sessionRef.current) return;
      try {
        const playTime = getCurrentTimeForApi();
        await axiosClient.put(`/sessions/${sessionRef.current.id}/complete`, {
          score,
          play_time_seconds: playTime,
        });
        setSession(null);
      } catch (error) {
        console.error("Complete error", error);
      }
    },
    [isPaused]
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sessionRef.current && sessionRef.current.status === "playing") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handlePageHide = () => {
      if (sessionRef.current && sessionRef.current.status === "playing") {
        const sessionId = sessionRef.current.id;
        const url = `${
          import.meta.env.VITE_API_BASE_URL
        }/sessions/${sessionId}/save`;

        const data = JSON.stringify({ status: "abandoned" });

        const token = useAuthStore.getState().token;
        const apiKey = import.meta.env.VITE_API_KEY;

        fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-api-key": apiKey,
          },
          body: data,
          keepalive: true,
        }).catch((err) => console.error("Abandon request failed:", err));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  const quitGame = async () => {
    if (sessionRef.current && sessionRef.current.status === "playing") {
      try {
        await axiosClient.put(`/sessions/${sessionRef.current.id}/save`, {
          status: "abandoned",
        });
      } catch (e) {}
      setSession(null);
      navigate("/");
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const savedList = await fetchSavedSessions();

        if (savedList.length > 0) {
          setShowLoadDialog(true);
        } else {
          await startGame();
        }
      } catch (e) {
        console.error("Init error", e);
        await startGame();
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [gameId]);

  return {
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
  };
}
