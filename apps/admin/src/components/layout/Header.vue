<template>
  <div class="header">
    <div class="header-content">
      <div></div>
      <div class="header-user">
        <button
          @click="showUserMenu = !showUserMenu"
          class="user-menu-button"
        >
          <span>{{ authStore.user?.name || 'Admin' }}</span>
          <ChevronDown />
        </button>
        
        <div v-if="showUserMenu" class="user-menu-dropdown">
          <button @click="handleLogout">Sign out</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronDown } from 'lucide-vue-next';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const showUserMenu = ref(false);

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
