import { defineStore } from 'pinia';
import { ref } from 'vue';
import { gamesApi } from '../api/admin-client';

export interface Game {
  id?: number;
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  screenshots?: string[];
  trailerUrl?: string;
  status: 'in-development' | 'released' | 'early-access';
  platforms?: string[];
  releaseDate?: string;
  links?: {
    steam?: string;
    itch?: string;
    website?: string;
    discord?: string;
  };
  published: boolean;
}

export const useGamesStore = defineStore('games', () => {
  const games = ref<Game[]>([]);
  const currentGame = ref<Game | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchGames() {
    loading.value = true;
    error.value = null;

    try {
      const response = await gamesApi.getAll();
      games.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch games';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchGame(id: number) {
    loading.value = true;
    error.value = null;

    try {
      const response = await gamesApi.getById(id);
      currentGame.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch game';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createGame(gameData: Game) {
    loading.value = true;
    error.value = null;

    try {
      const response = await gamesApi.create(gameData);
      games.value.push(response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create game';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateGame(id: number, gameData: Partial<Game>) {
    loading.value = true;
    error.value = null;

    try {
      const response = await gamesApi.update(id, gameData);
      const index = games.value.findIndex(g => g.id === id);
      if (index !== -1) {
        games.value[index] = response.data;
      }
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update game';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteGame(id: number) {
    loading.value = true;
    error.value = null;

    try {
      await gamesApi.delete(id);
      games.value = games.value.filter(g => g.id !== id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete game';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    games,
    currentGame,
    loading,
    error,
    fetchGames,
    fetchGame,
    createGame,
    updateGame,
    deleteGame,
  };
});
