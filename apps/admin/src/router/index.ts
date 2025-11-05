import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/components/layout/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
        },
        // Games routes
        {
          path: 'games',
          name: 'GamesList',
          component: () => import('@/views/games/GamesList.vue'),
        },
        {
          path: 'games/create',
          name: 'GameCreate',
          component: () => import('@/views/games/GameEditor.vue'),
        },
        {
          path: 'games/:id/edit',
          name: 'GameEdit',
          component: () => import('@/views/games/GameEditor.vue'),
        },
        // Blog routes
        {
          path: 'blog',
          name: 'BlogList',
          component: () => import('@/views/blog/BlogList.vue'),
        },
        {
          path: 'blog/create',
          name: 'BlogCreate',
          component: () => import('@/views/blog/BlogEditor.vue'),
        },
        {
          path: 'blog/:id/edit',
          name: 'BlogEdit',
          component: () => import('@/views/blog/BlogEditor.vue'),
        },
        // Studio route
        {
          path: 'studio',
          name: 'StudioEditor',
          component: () => import('@/views/studio/StudioEditor.vue'),
        },
        // Media library
        {
          path: 'media',
          name: 'MediaLibrary',
          component: () => import('@/views/media/MediaLibrary.vue'),
        },
      ],
    },
  ],
});

// Navigation guard
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth !== false;

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
