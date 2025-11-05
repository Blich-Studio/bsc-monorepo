import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../stores/auth';

const cmsApiClient = axios.create({
  baseURL: import.meta.env.VITE_CMS_API_URL || 'http://localhost:3001/api/cms',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
cmsApiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// Response interceptor - handle errors
cmsApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    cmsApiClient.post('/auth/login', { email, password }),
  logout: () => cmsApiClient.post('/auth/logout'),
  me: () => cmsApiClient.get('/auth/me'),
};

export const gamesApi = {
  getAll: () => cmsApiClient.get('/admin/games'),
  getById: (id: number) => cmsApiClient.get(`/admin/games/${id}`),
  create: (data: any) => cmsApiClient.post('/admin/games', data),
  update: (id: number, data: any) => cmsApiClient.put(`/admin/games/${id}`, data),
  delete: (id: number) => cmsApiClient.delete(`/admin/games/${id}`),
};

export const blogApi = {
  getAll: () => cmsApiClient.get('/admin/blog'),
  getById: (id: number) => cmsApiClient.get(`/admin/blog/${id}`),
  create: (data: any) => cmsApiClient.post('/admin/blog', data),
  update: (id: number, data: any) => cmsApiClient.put(`/admin/blog/${id}`, data),
  delete: (id: number) => cmsApiClient.delete(`/admin/blog/${id}`),
};

export const studioApi = {
  get: () => cmsApiClient.get('/admin/studio'),
  update: (data: any) => cmsApiClient.put('/admin/studio', data),
};

export const mediaApi = {
  upload: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    
    return cmsApiClient.post('/admin/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getAll: () => cmsApiClient.get('/admin/media'),
  delete: (id: number) => cmsApiClient.delete(`/admin/media/${id}`),
};

export default cmsApiClient;
