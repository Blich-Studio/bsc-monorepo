<template>
  <div class="media-library">
    <div class="library-header">
      <h1>Media Library</h1>
      <button @click="openUploadModal" class="upload-button">
        Upload Media
      </button>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label for="type">Type:</label>
        <select id="type" v-model="filterType" @change="applyFilters">
          <option value="">All</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
        </select>
      </div>

      <div class="search-group">
        <input
          v-model="searchQuery"
          @input="applyFilters"
          type="text"
          placeholder="Search media..."
          class="search-input"
        />
      </div>
    </div>

    <div v-if="loading" class="loading">
      Loading media...
    </div>

    <div v-else-if="filteredMedia.length === 0" class="empty-state">
      <p>No media found.</p>
    </div>

    <div v-else class="media-grid">
      <div
        v-for="item in filteredMedia"
        :key="item.id"
        class="media-item"
        @click="selectMedia(item)"
      >
        <div class="media-preview">
          <img
            v-if="item.type === 'image'"
            :src="item.url"
            :alt="item.name"
            class="media-image"
          />
          <div v-else class="media-icon">
            <FileText v-if="item.type === 'document'" />
            <Video v-else />
          </div>
        </div>
        <div class="media-info">
          <p class="media-name">{{ item.name }}</p>
          <p class="media-size">{{ formatFileSize(item.size) }}</p>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click="closeUploadModal">
      <div class="modal-content" @click.stop>
        <h2>Upload Media</h2>
        <div class="upload-area" @drop="handleDrop" @dragover.prevent>
          <input
            ref="fileInput"
            type="file"
            multiple
            @change="handleFileSelect"
            class="file-input"
          />
          <div class="upload-prompt">
            <Upload class="upload-icon" />
            <p>Drag & drop files here or <button @click="triggerFileInput" class="link-button">browse</button></p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeUploadModal" class="cancel-button">Cancel</button>
          <button @click="uploadFiles" :disabled="!selectedFiles.length" class="upload-button">
            Upload {{ selectedFiles.length }} file(s)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { FileText, Video, Upload } from 'lucide-vue-next'

interface MediaItem {
  id: number
  name: string
  url: string
  type: 'image' | 'video' | 'document'
  size: number
  uploadedAt: string
}

const media = ref<MediaItem[]>([])
const loading = ref(false)
const filterType = ref('')
const searchQuery = ref('')
const showUploadModal = ref(false)
const selectedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement>()

const filteredMedia = computed(() => {
  return media.value.filter(item => {
    const matchesType = !filterType.value || item.type === filterType.value
    const matchesSearch = !searchQuery.value ||
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesType && matchesSearch
  })
})

const applyFilters = () => {
  // Filters are applied reactively through computed property
}

const selectMedia = (item: MediaItem) => {
  // TODO: Handle media selection (e.g., for inserting into content)
  console.log('Selected media:', item)
}

const openUploadModal = () => {
  showUploadModal.value = true
  selectedFiles.value = []
}

const closeUploadModal = () => {
  showUploadModal.value = false
  selectedFiles.value = []
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = Array.from(target.files)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files) {
    selectedFiles.value = Array.from(event.dataTransfer.files)
  }
}

const uploadFiles = async () => {
  if (!selectedFiles.value.length) return

  try {
    // TODO: Implement file upload
    console.log('Uploading files:', selectedFiles.value)
    closeUploadModal()
    // Refresh media list after upload
  } catch (error) {
    console.error('Upload failed:', error)
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  // TODO: Load media from API
  // For now, using mock data
  media.value = [
    {
      id: 1,
      name: 'hero-image.jpg',
      url: '/uploads/hero-image.jpg',
      type: 'image',
      size: 245760,
      uploadedAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'gameplay.mp4',
      url: '/uploads/gameplay.mp4',
      type: 'video',
      size: 5242880,
      uploadedAt: '2024-01-14'
    }
  ]
})
</script>

<style scoped>
.media-library {
  padding: 2rem;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.library-header h1 {
  margin: 0;
  color: #1f2937;
}

.upload-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 500;
}

.upload-button:hover {
  background: #2563eb;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  width: 250px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.media-item {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.media-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.media-preview {
  height: 150px;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-icon {
  color: #6b7280;
  font-size: 2rem;
}

.media-info {
  padding: 0.75rem;
}

.media-name {
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: #1f2937;
}

.media-size {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.loading, .empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 500px;
  max-width: 90vw;
}

.upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  margin: 1rem 0;
  position: relative;
}

.upload-prompt {
  color: #6b7280;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  color: #d1d5db;
}

.link-button {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  text-decoration: underline;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.cancel-button {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
}

.cancel-button:hover {
  background: #e5e7eb;
}
</style>
