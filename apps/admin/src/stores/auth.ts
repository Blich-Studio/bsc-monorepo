import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api/admin-client';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('admin_token'));
  const user = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await authApi.login(email, password);
      token.value = response.data.token;
      user.value = response.data.user;
      localStorage.setItem('admin_token', response.data.token);
      return true;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Login failed';
      return false;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem('admin_token');
    }
  }

  async function checkAuth() {
    if (!token.value) return false;
    
    try {
      const response = await authApi.me();
      user.value = response.data;
      return true;
    } catch (err) {
      logout();
      return false;
    }
  }

  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };
});
