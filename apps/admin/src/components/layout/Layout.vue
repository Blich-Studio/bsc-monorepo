<template>
  <div class="app-container">
    <Sidebar />

    <div class="main-content">
      <Header />

      <main class="page-container">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from "./Sidebar.vue";
import Header from "./Header.vue";
</script>
