<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2>Game Studio CMS</h2>
        <p>Sign in to your admin account</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="form-input"
            placeholder="Enter your email"
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="form-input"
            placeholder="Enter your password"
          />
        </div>

        <div v-if="authStore.error" class="form-error">
          {{ authStore.error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="btn btn-primary btn-block"
        >
          {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push('/');
  }
};
</script>

<style scoped lang="scss">
@use '@/assets/styles/variables' as vars;

.login-container {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: vars.$color-gray-50;
  padding: vars.$space-4;
}

.login-card {
  width: 100%;
  max-width: 28rem;
  background: vars.$color-white;
  border-radius: vars.$radius-lg;
  box-shadow: vars.$shadow-lg;
  padding: vars.$space-8;
}

.login-header {
  text-align: center;
  margin-bottom: vars.$space-8;

  h2 {
    font-size: vars.$font-size-3xl;
    font-weight: vars.$font-weight-bold;
    color: vars.$color-gray-900;
    margin-bottom: vars.$space-2;
  }

  p {
    font-size: vars.$font-size-sm;
    color: vars.$color-gray-600;
    margin-bottom: 0;
  }
}

.login-form {
  .form-group:last-of-type {
    margin-bottom: vars.$space-6;
  }
}
</style>
