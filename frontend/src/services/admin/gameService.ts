import apiClient from '@/lib/admin/apiClient';

export interface Game {
  id: number;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
  default_config: Record<string, any>;
  created_at: string;
  rating?: number;
}

export interface GameFilters {
  page?: number;
  limit?: number;
  search?: string;
  is_active?: boolean;
  sort?: string;
}

export interface GamesResponse {
  games: Game[];
  paginate: {
    page: number;
    limit: number;
    totalGames: number;
    totalPages: number;
  };
}

export interface UpdateGamePayload {
  is_active?: boolean;
  default_config?: Record<string, any>;
}

export const gameService = {
  async getGames(params: GameFilters = {}): Promise<GamesResponse> {
    const cleanParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const { data } = await apiClient.get('/admin/games', { params: cleanParams });
    return data;
  },

  async updateGame(id: number, payload: UpdateGamePayload): Promise<Game> {
    const { data } = await apiClient.put(`/admin/games/${id}`, payload);
    return data[0]; // Knex returns array
  },
};
