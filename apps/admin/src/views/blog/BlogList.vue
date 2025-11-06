<template>
  <div>
    <div class="page-header">
      <div class="page-title">
        <h1>Blog Posts</h1>
        <p>Manage your blog content</p>
      </div>
      <div class="page-actions">
        <router-link to="/blog/create"
class="btn btn-primary">
          New Post
        </router-link>
      </div>
    </div>

    <div v-if="blogStore.loading"
class="loading">
      <p>Loading posts...</p>
    </div>

    <div v-else
class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Published Date</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in blogStore.posts"
:key="post.id">
            <td>{{ post.title }}</td>
            <td>
              <span :class="['status-badge', `status-${post.status}`]">
                {{ post.status }}
              </span>
            </td>
            <td>
              {{
                post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString()
                  : "-"
              }}
            </td>
            <td>
              <div class="table-actions">
                <router-link :to="`/blog/${post.id}/edit`" class="action-edit">
                  Edit
                </router-link>
                <button
class="action-delete" @click="handleDelete(post.id!)"
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
import { useBlogStore } from "@/stores/blog";

const blogStore = useBlogStore();

onMounted(() => {
  blogStore.fetchPosts();
});

const handleDelete = async (id: number) => {
  if (confirm("Are you sure you want to delete this post?")) {
    await blogStore.deletePost(id);
  }
};
</script>
