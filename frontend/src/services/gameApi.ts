import axiosClient from "@/lib/axios";
import type { Game } from "@/types/game";

export const gameApi = {
  getAllGames: async (): Promise<Game[]> => {
    try {
      const response = await axiosClient.get("/games");
      // API backend trả về { total: number, data: Game[] }
      return response.data.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách game:", error);
      throw error;
    }
  },

  getGameById: async (id: number): Promise<Game> => {
    try {
      const response = await axiosClient.get(`/games/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy game có id ${id}:`, error);
      throw error;
    }
  },
};
