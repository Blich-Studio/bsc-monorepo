<template>
  <div class="studio-editor">
    <div class="editor-header">
      <h1>{{ isEditing ? 'Edit Studio' : 'Create Studio' }}</h1>
      <button @click="saveStudio" class="save-button" :disabled="!isValid">
        {{ isEditing ? 'Update' : 'Save' }}
      </button>
    </div>

    <form @submit.prevent="saveStudio" class="editor-form">
      <div class="form-group">
        <label for="name">Studio Name</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea
          id="description"
          v-model="form.description"
          rows="4"
          class="form-textarea"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="website">Website</label>
        <input
          id="website"
          v-model="form.website"
          type="url"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="foundedYear">Founded Year</label>
        <input
          id="foundedYear"
          v-model.number="form.foundedYear"
          type="number"
          min="1900"
          :max="new Date().getFullYear()"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="headquarters">Headquarters</label>
        <input
          id="headquarters"
          v-model="form.headquarters"
          type="text"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="logo">Logo URL</label>
        <input
          id="logo"
          v-model="form.logo"
          type="url"
          class="form-input"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isEditing = computed(() => !!route.params.id)

const form = ref({
  name: '',
  description: '',
  website: '',
  foundedYear: null as number | null,
  headquarters: '',
  logo: ''
})

const isValid = computed(() => {
  return form.value.name.trim()
})

const saveStudio = async () => {
  if (!isValid.value) return

  try {
    // TODO: Implement studio API calls
    console.log('Saving studio:', form.value)
    router.push('/studio')
  } catch (error) {
    console.error('Failed to save studio:', error)
  }
}

onMounted(() => {
  if (isEditing.value) {
    // TODO: Load existing studio data
    console.log('Loading studio:', route.params.id)
  }
})
</script>

<style scoped>
.studio-editor {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.editor-header h1 {
  margin: 0;
  color: #1f2937;
}

.save-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}

.save-button:hover:not(:disabled) {
  background: #2563eb;
}

.save-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}
</style>
