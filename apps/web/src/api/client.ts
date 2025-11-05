import axios from 'axios';

// API Gateway (NestJS) - for game operations
export const gameApiClient = axios.create({
  baseURL: import.meta.env.VITE_GAME_API_URL || 'http://localhost:3000/api',
});

// CMS Backend (AdonisJS) - for admin operations
export const cmsApiClient = axios.create({
  baseURL: import.meta.env.VITE_CMS_API_URL || 'http://localhost:3001/api/cms',
});

// Public content API (through Gateway)
export const contentApi = {
  // Get content from CMS via Gateway
  getGames: () => gameApiClient.get('/content/games'),
  getGame: (slug: string) => gameApiClient.get(`/content/games/${slug}`),
  getBlog: () => gameApiClient.get('/content/blog'),
  getBlogPost: (slug: string) => gameApiClient.get(`/content/blog/${slug}`),
};

// Game-specific API (NestJS Gateway only)
export const gameApi = {
  getStats: (slug: string) => gameApiClient.get(`/games/${slug}/stats`),
  getAnalytics: (slug: string) => gameApiClient.get(`/games/${slug}/analytics`),
  getFullGame: (slug: string) => gameApiClient.get(`/games/${slug}/full`),
  recordSession: (slug: string, playtime: number) => 
    gameApiClient.post(`/games/${slug}/session`, { playtime }),
};

// Leaderboard API (NestJS Gateway only)
export const leaderboardApi = {
  get: (gameId: string, limit?: number) => 
    gameApiClient.get(`/leaderboard/${gameId}`, { params: { limit } }),
  submitScore: (gameId: string, playerId: string, playerName: string, score: number) =>
    gameApiClient.post(`/leaderboard/${gameId}`, { playerId, playerName, score }),
  getPlayerRank: (gameId: string, playerId: string) =>
    gameApiClient.get(`/leaderboard/${gameId}/player/${playerId}`),
};

// Admin API (direct to AdonisJS CMS)
export const adminApi = {
  login: (email: string, password: string) => 
    cmsApiClient.post('/auth/login', { email, password }),
  
  // Blog management
  createBlog: (data: any) => cmsApiClient.post('/admin/blog', data),
  updateBlog: (id: number, data: any) => cmsApiClient.put(`/admin/blog/${id}`, data),
  deleteBlog: (id: number) => cmsApiClient.delete(`/admin/blog/${id}`),
  
  // Game management
  createGame: (data: any) => cmsApiClient.post('/admin/games', data),
  updateGame: (id: number, data: any) => cmsApiClient.put(`/admin/games/${id}`, data),
  deleteGame: (id: number) => cmsApiClient.delete(`/admin/games/${id}`),
};
