<template>
  <div class="management-shell login-page">
    <div class="login-box">
      <span class="login-brand">AccaDASHBOARD</span>
      <h1 class="login-title">Accesso Admin</h1>
      <div class="form-group">
        <label class="form-label">Username</label>
        <input class="form-control" v-model="username" type="email" required placeholder="admin@example.com"
          @keyup.enter="submit" />
      </div>
      <div class="form-group">
        <label class="form-label">Password</label>
        <input class="form-control" v-model="password" type="password" required placeholder="••••••••"
          @keyup.enter="submit" />
      </div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <button class="btn btn-primary btn-block text-center mt-4" :disabled="loading" @click="submit">
        <svg v-if="loading" class="spinner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
        <span>{{ loading ? 'Accesso…' : 'Accedi' }}</span>
      </button>
      <p class="login-footer">Panel v2 — {{ new Date().getFullYear() }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import router from '../../router'
import { onMounted } from 'vue'

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const route = useRoute()

onMounted(() => {
  const token = localStorage.getItem('admin_token') || localStorage.getItem('auth_token')
  if (token && token !== 'null' && token !== 'undefined') {
    // Se l'utente è già autenticato, reindirizza alla dashboard
    router.replace('/gestione')
  }
})

async function submit() {
  if (loading.value) return

  error.value = ''
  loading.value = true
  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value }),
    })

    const payload = await res.json()
    const token = payload?.token || payload?.data?.token

    if (!res.ok || !token) {
      throw new Error('Login non riuscito')
    }

    localStorage.setItem('admin_token', token)
    localStorage.setItem('auth_token', token)
    window.dispatchEvent(new Event('auth-changed'))
    await router.replace((route.query.redirect && String(route.query.redirect)) || '/gestione')
  } catch (e) {
    error.value = e?.message || 'Errore di autenticazione'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg)
  }

  to {
    transform: rotate(360deg)
  }
}
</style>