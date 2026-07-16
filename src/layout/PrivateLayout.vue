<template>
  <div class="management-layout">
    <header class="app-header">
      <div class="app-header__inner">
        <RouterLink class="app-header__brand" to="/gestione">GESTIONE</RouterLink>
        <button class="btn btn-danger btn-sm" type="button" @click="logout">Logout</button>
      </div>
    </header>

    <main class="management-layout__main">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, useRouter } from 'vue-router'

import '../styles/managment/style.css'

const router = useRouter()

function logout() {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('auth_token')
  window.dispatchEvent(new Event('auth-changed'))
  router.push('/gestione/login')
}
</script>
