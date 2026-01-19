import api from "@/lib/axios";
import type { IMatch3Game, Match3SessionResponse, Match3SessionSave } from "@/types/match3Game";

const match3Api = {
    getDetail(id: number) {
        return api.get<{data: IMatch3Game}>(`/games/${id}`).then(res => res.data);
    },

    startSession(gameId: number) {
        return api.post<Match3SessionResponse>(`/sessions/start`, { gameId }).then(res => res.data);
    },

    saveSession(id: string, sessionData: Match3SessionSave) {
        return api.put<Match3SessionResponse>(`/sessions/${id}/save`, sessionData).then(res => res.data)
    },

    completeSession(id: string, score: number, play_time_seconds: number) {
        return api.put<Match3SessionResponse>(`/sessions/${id}/complete`, { score, play_time_seconds }).then(res => res.data)
    },

    deleteSession(id: string) {
        return api.delete(`/sessions/${id}`).then(res => res.data);
    }
}

export default match3Api;