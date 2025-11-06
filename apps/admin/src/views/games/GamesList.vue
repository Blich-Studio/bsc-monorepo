<template>
  <div>
    <div class="page-header">
      <div class="page-title">
        <h1>Games</h1>
        <p>Manage your game showcase</p>
      </div>
      <div class="page-actions">
        <router-link to="/games/create"
class="btn btn-primary">
          Add Game
        </router-link>
      </div>
    </div>

    <div v-if="gamesStore.loading"
class="loading">
      <p>Loading games...</p>
    </div>

    <div v-else
class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Published</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="game in gamesStore.games"
:key="game.id">
            <td>{{ game.title }}</td>
            <td>
              <span :class="['status-badge', `status-${game.status}`]">
                {{ game.status }}
              </span>
            </td>
            <td>
              <span :class="game.published ? 'text-success' : 'text-danger'">
                {{ game.published ? "Yes" : "No" }}
              </span>
            </td>
            <td>
              <div class="table-actions">
                <router-link :to="`/games/${game.id}/edit`" class="action-edit">
                  Edit
                </router-link>
                <button
class="action-delete" @click="handleDelete(game.id!)"
>
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useGamesStore } from "@/stores/games";

const gamesStore = useGamesStore();

onMounted(() => {
  gamesStore.fetchGames();
});

const handleDelete = async (id: number) => {
  if (confirm("Are you sure you want to delete this game?")) {
    await gamesStore.deleteGame(id);
  }
};
</script>
