<template>
  <div class="blog-editor">
    <div class="editor-header">
      <h1>{{ isEditing ? 'Edit Blog Post' : 'Create Blog Post' }}</h1>
      <button @click="savePost" class="save-button" :disabled="!isValid">
        {{ isEditing ? 'Update' : 'Publish' }}
      </button>
    </div>

    <form @submit.prevent="savePost" class="editor-form">
      <div class="form-group">
        <label for="title">Title</label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="slug">Slug</label>
        <input
          id="slug"
          v-model="form.slug"
          type="text"
          required
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="excerpt">Excerpt</label>
        <textarea
          id="excerpt"
          v-model="form.excerpt"
          rows="3"
          class="form-textarea"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Content</label>
        <QuillEditor
          v-model:content="form.content"
          content-type="html"
          theme="snow"
          class="quill-editor"
        />
      </div>

      <div class="form-group">
        <label for="status">Status</label>
        <select id="status" v-model="form.status" class="form-select">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div class="form-group">
        <label for="publishedAt">Publish Date</label>
        <input
          id="publishedAt"
          v-model="form.publishedAt"
          type="datetime-local"
          class="form-input"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBlogStore, type BlogPost } from '@/stores/blog'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

const route = useRoute()
const router = useRouter()
const blogStore = useBlogStore()

const isEditing = computed(() => !!route.params.id)

const form = ref<BlogPost>({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  status: 'draft' as 'draft' | 'published',
  publishedAt: ''
})

const isValid = computed(() => {
  return form.value.title.trim() && form.value.slug.trim()
})

const savePost = async () => {
  if (!isValid.value) return

  try {
    if (isEditing.value) {
      await blogStore.updatePost(Number(route.params.id), form.value)
    } else {
      await blogStore.createPost(form.value)
    }
    router.push('/blog')
  } catch (error) {
    console.error('Failed to save post:', error)
  }
}

onMounted(() => {
  if (isEditing.value) {
    const post = blogStore.posts.find(p => p.id === Number(route.params.id))
    if (post) {
      form.value = { ...post }
    }
  }
})
</script>

<style scoped>
.blog-editor {
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
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.quill-editor {
  height: 300px;
}
</style>
