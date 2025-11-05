import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Asset {
  id?: number;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  alt?: string;
  caption?: string;
}

export const useAssetsStore = defineStore('assets', () => {
  const assets = ref<Asset[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchAssets() {
    loading.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual API call
      // const response = await assetsApi.getAll();
      // assets.value = response.data;

      // Mock data for now
      assets.value = [
        {
          id: 1,
          name: 'hero-image.jpg',
          type: 'image',
          url: '/uploads/hero-image.jpg',
          size: 245760,
          mimeType: 'image/jpeg',
          uploadedAt: '2024-01-15T10:00:00Z',
          alt: 'Hero image',
          caption: 'Main hero image for the website'
        }
      ];
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch assets';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function uploadAsset(file: File, metadata?: { alt?: string; caption?: string }) {
    loading.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual API call
      // const formData = new FormData();
      // formData.append('file', file);
      // if (metadata) {
      //   Object.entries(metadata).forEach(([key, value]) => {
      //     if (value) formData.append(key, value);
      //   });
      // }
      // const response = await assetsApi.upload(formData);
      // assets.value.push(response.data);
      // return response.data;

      // Mock implementation
      const newAsset: Asset = {
        id: Date.now(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' :
              file.type.startsWith('video/') ? 'video' :
              file.type.startsWith('audio/') ? 'audio' : 'document',
        url: `/uploads/${file.name}`,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        ...metadata
      };
      assets.value.push(newAsset);
      return newAsset;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to upload asset';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteAsset(id: number) {
    loading.value = true;
    error.value = null;

    try {
      // TODO: Replace with actual API call
      // await assetsApi.delete(id);
      // assets.value = assets.value.filter(a => a.id !== id);

      // Mock implementation
      assets.value = assets.value.filter(a => a.id !== id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete asset';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    assets,
    loading,
    error,
    fetchAssets,
    uploadAsset,
    deleteAsset,
  };
});
