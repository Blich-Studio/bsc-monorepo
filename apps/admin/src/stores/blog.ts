import { defineStore } from 'pinia';
import { ref } from 'vue';
import { blogApi } from '@/api/admin-client';

export interface BlogPost {
  id?: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  tags?: string[];
  status: 'draft' | 'published';
  publishedAt?: string;
}

export const useBlogStore = defineStore('blog', () => {
  const posts = ref<BlogPost[]>([]);
  const currentPost = ref<BlogPost | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchPosts() {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await blogApi.getAll();
      posts.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch posts';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchPost(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await blogApi.getById(id);
      currentPost.value = response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch post';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createPost(postData: BlogPost) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await blogApi.create(postData);
      posts.value.push(response.data);
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create post';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updatePost(id: number, postData: Partial<BlogPost>) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await blogApi.update(id, postData);
      const index = posts.value.findIndex(p => p.id === id);
      if (index !== -1) {
        posts.value[index] = response.data;
      }
      return response.data;
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update post';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deletePost(id: number) {
    loading.value = true;
    error.value = null;
    
    try {
      await blogApi.delete(id);
      posts.value = posts.value.filter(p => p.id !== id);
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete post';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    posts,
    currentPost,
    loading,
    error,
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost,
  };
});
