<template>
  <div>
    <h1 class="mb-6">{{ isEdit ? 'Edit Game' : 'Create Game' }}</h1>

    <form @submit.prevent="handleSubmit" class="card">
      <div class="form-group">
        <label class="form-label">Title</label>
        <input
          v-model="form.title"
          @input="generateSlug"
          type="text"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Slug</label>
        <input
          v-model="form.slug"
          type="text"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea
          v-model="form.description"
          required
          class="form-textarea"
          rows="4"
        ></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">Status</label>
        <select v-model="form.status" class="form-select">
          <option value="in-development">In Development</option>
          <option value="early-access">Early Access</option>
          <option value="released">Released</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label mb-2">Platforms</label>
        <div class="checkbox-group">
          <label v-for="platform in availablePlatforms" :key="platform">
            <input
              type="checkbox"
              :value="platform"
              v-model="form.platforms"
              class="form-checkbox"
            />
            <span>{{ platform }}</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Cover Image URL</label>
        <input
          v-model="form.coverImage"
          type="text"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label class="form-label">Trailer URL</label>
        <input
          v-model="form.trailerUrl"
          type="text"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label class="flex items-center gap-2">
          <input
            v-model="form.published"
            type="checkbox"
            class="form-checkbox"
          />
          <span class="form-label" style="margin-bottom: 0;">Published</span>
        </label>
      </div>

      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="gamesStore.loading"
          class="btn btn-primary"
        >
          {{ gamesStore.loading ? 'Saving...' : 'Save Game' }}
        </button>
        <router-link to="/games" class="btn btn-secondary">
          Cancel
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGamesStore, type Game } from '@/stores/games';

const route = useRoute();
const router = useRouter();
const gamesStore = useGamesStore();

const isEdit = computed(() => !!route.params.id);

const availablePlatforms = ['PC', 'Steam', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile'];

const form = reactive<Game>({
  title: '',
  slug: '',
  description: '',
  status: 'in-development',
  platforms: [],
  published: false,
});

onMounted(async () => {
  if (isEdit.value) {
    const id = Number(route.params.id);
    await gamesStore.fetchGame(id);
    if (gamesStore.currentGame) {
      Object.assign(form, gamesStore.currentGame);
    }
  }
});

const generateSlug = () => {
  if (!isEdit.value) {
    form.slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
};

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await gamesStore.updateGame(Number(route.params.id), form);
    } else {
      await gamesStore.createGame(form);
    }
    router.push('/games');
  } catch (error) {
    console.error('Failed to save game:', error);
  }
};
</script>
