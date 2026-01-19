import api from "@/lib/axios";
import type { IMemoryGame, MemorySessionResponse, MemorySessionSave } from "@/types/memoryGame";

const memoryApi = {
    getDetail(code = "memory") {
        return api.get<IMemoryGame>(`/games/${code}`).then(res => res.data);
    },

    startSession(gameId: number) {
        return api.post<MemorySessionResponse>(`/sessions/start`, { gameId }).then(res => res.data);
    },

    saveSession(id: string, sessionData: MemorySessionSave) {
        return api.put<MemorySessionResponse>(`/sessions/${id}/save`, sessionData).then(res => res.data);
    },

    deleteSession(id: string) {
        return api.delete<void>(`/sessions/${id}`).then(res => res.data);
    }
}

 

export default memoryApi;