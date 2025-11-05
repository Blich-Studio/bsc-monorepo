<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <h1 class="sidebar-logo">Game Studio CMS</h1>
    </div>
    
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li v-for="item in navigation" :key="item.name" class="nav-item">
          <router-link
            :to="item.href"
            :class="{ active: isActive(item.href) }"
          >
            <component :is="item.icon" />
            {{ item.name }}
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import {
  LayoutDashboard,
  Gamepad2,
  FileText,
  Building2,
  Image,
} from 'lucide-vue-next';

const route = useRoute();

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Games', href: '/games', icon: Gamepad2 },
  { name: 'Blog', href: '/blog', icon: FileText },
  { name: 'Studio', href: '/studio', icon: Building2 },
  { name: 'Media', href: '/media', icon: Image },
];

const isActive = (href: string) => {
  if (href === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(href);
};
</script>
