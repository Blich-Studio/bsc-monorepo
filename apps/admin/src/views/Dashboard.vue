<template>
  <div>
    <h1 class="mb-6">Dashboard</h1>

    <div class="dashboard-grid">
      <div class="card">
        <h3 class="mb-2">Games</h3>
        <p class="text-muted">Manage your game showcase</p>
        <router-link to="/games"
class="btn btn-primary mt-4">
          View Games
        </router-link>
      </div>

      <div class="card">
        <h3 class="mb-2">Blog Posts</h3>
        <p class="text-muted">Create and edit blog content</p>
        <router-link to="/blog"
class="btn btn-primary mt-4">
          View Posts
        </router-link>
      </div>

      <div class="card">
        <h3 class="mb-2">Studio Info</h3>
        <p class="text-muted">Update studio information</p>
        <router-link to="/studio"
class="btn btn-primary mt-4">
          Edit Studio
        </router-link>
      </div>

      <div class="card">
        <h3 class="mb-2">Media Library</h3>
        <p class="text-muted">Manage media assets</p>
        <router-link to="/media"
class="btn btn-primary mt-4">
          View Media
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
