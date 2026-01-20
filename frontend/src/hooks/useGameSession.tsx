import { useState, useEffect, useCallback, useRef } from "react";
import axiosClient from "@/lib/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { type GameSession } from "@/types/game";
import { useAuthStore } from "@/stores/useAuthStore";
import { triggerWinEffects } from "@/lib/fireworks";
import { useAchievementStore } from "@/stores/useAchievementStore";
import { useGameSound } from "@/hooks/useGameSound";

interface UseGameSessionProps {
  gameId: number;
  getBoardState: () => any;
  isPaused?: boolean;
  autoCreate?: boolean;
}

export function useGameSession({
  gameId,
  getBoardState,
  autoCreate = true,
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

  const addAchievement = useAchievementStore((s) => s.addAchievement);

  const { playSound } = useGameSound();

  useEffect(() => {
    sessionRef.current = session;

    if (session) {
      startTimeRef.current = Date.now() - session.play_time_seconds * 1000;
      setCurrentPlayTime(session.play_time_seconds);
    }
  }, [session]);

  useEffect(() => {
    if (isPaused) {
      pauseStartTimeRef.current = Date.now();
    } else {
      if (pauseStartTimeRef.current) {
        const pauseDuration = Date.now() - pauseStartTimeRef.current;

        startTimeRef.current += pauseDuration;
        pauseStartTimeRef.current = null;
      }
    }
  }, [isPaused]);

  useEffect(() => {
    let intervalId: number;

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
    pauseStartTimeRef.current = null;
  }, []);

  const getCurrentTimeForApi = () => {
    if (!startTimeRef.current) return 0;

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

  const startGame = useCallback(
    async (customConfig?: any) => {
      try {
        setIsLoading(true);

        const payload = customConfig
          ? { gameId, session_config: customConfig }
          : { gameId };

        const res = await axiosClient.post("/sessions/start", payload);
        const newSession = res.data.session;

        setSession(newSession);
        setShowLoadDialog(false);
        pauseStartTimeRef.current = null;
      } catch (error: any) {
        toast.error("Lỗi tạo game: " + error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [gameId],
  );

  const loadGame = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get(`/sessions/${sessionId}/load`);
      const loadedSession = res.data.session;

      setSession(loadedSession);
      setShowLoadDialog(false);
      startTimeRef.current =
        Date.now() - loadedSession.play_time_seconds * 1000;
      pauseStartTimeRef.current = null;
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
          payload,
        );

        const updatedSession = res.data.session;

        if (manual) {
          updatedSession.status = "playing";
        }

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
    [getBoardState, fetchSavedSessions, isPaused],
  );

  const completeGame = useCallback(
    async (score: number) => {
      if (!sessionRef.current) return;
      try {
        const playTime = getCurrentTimeForApi();
        const res = await axiosClient.put(
          `/sessions/${sessionRef.current.id}/complete`,
          {
            score,
            play_time_seconds: playTime,
          },
        );
        const newAchievements = res.data.newAchievements;
        if (newAchievements && newAchievements.length > 0) {
          newAchievements.forEach((ach: any) => {
            addAchievement(ach);
            playSound("steam");
          });
          triggerWinEffects();
        }
        setSession(null);
      } catch (error) {
        console.error("Complete error", error);
      }
    },
    [isPaused],
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
      let savedList = [];

      try {
        savedList = await fetchSavedSessions();

        if (savedList.length > 0) {
          setShowLoadDialog(true);
        } else {
          if (autoCreate) {
            await startGame();
          } else {
            setIsLoading(false);
          }
        }
      } catch (e) {
        console.error("Init error", e);

        if (autoCreate) await startGame();
      } finally {
        if (!autoCreate && savedList.length === 0) {
          setIsLoading(false);
        }

        if (savedList.length > 0) {
          setIsLoading(false);
        }
      }
    };

    init();
  }, [gameId, autoCreate]);

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
