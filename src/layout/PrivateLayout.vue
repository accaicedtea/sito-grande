<template>
  <div class="management-shell">
    <header class="app-header">
      <div class="app-header__inner">
        <!-- Hamburger mobile -->
        <button
          class="nav-hamburger"
          type="button"
          aria-label="Apri menu"
          @click="drawerOpen = !drawerOpen"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <RouterLink class="app-header__brand" to="/gestione">GESTIONE</RouterLink>

        <!-- Nav desktop -->
        <nav class="app-nav">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            class="app-nav__link"
            :to="link.to"
          >
            {{ link.label }}
          </RouterLink>
        </nav>

        <div class="app-header__actions">
          <RouterLink class="btn btn-ghost btn-sm" to="/" title="Vai al sito pubblico">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px">
              <path d="M3 12l9-9 9 9" />
              <path d="M9 21V12h6v9" />
            </svg>
            Sito
          </RouterLink>
          <button class="btn btn-danger btn-sm" type="button" @click="logout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Drawer mobile -->
    <div class="nav-drawer-overlay" v-if="drawerOpen" @click="drawerOpen = false" />
    <div class="nav-drawer" :class="{ open: drawerOpen }">
      <ul class="nav-drawer__list">
        <li v-for="link in links" :key="link.to">
          <RouterLink class="nav-drawer__link" :to="link.to" @click="drawerOpen = false">
            {{ link.label }}
          </RouterLink>
        </li>
      </ul>
    </div>

    <main class="management-layout__main">
      <RouterView />
    </main>

    <footer class="app-footer">
      Pannello di gestione — Osteria &copy; {{ new Date().getFullYear() }}
    </footer>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import '../styles/managment/style.css'

const router = useRouter()
const route = useRoute()
const drawerOpen = ref(false)

// Chiudi il drawer ogni volta che cambia rotta
watch(() => route.fullPath, () => {
  drawerOpen.value = false
})

const links = [
  { to: '/gestione', label: 'Dashboard' },
  { to: '/gestione/prodotti', label: 'Prodotti' },
  { to: '/gestione/categorie', label: 'Categorie' },
  { to: '/gestione/ingredienti', label: 'Ingredienti' },
  { to: '/gestione/menu', label: 'Menu' },
  { to: '/gestione/eventi', label: 'Eventi' },
  { to: '/gestione/prenotazioni', label: 'Prenotazioni' },
  { to: '/gestione/promozioni', label: 'Promozioni' },
]

function logout() {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('auth_token')
  window.dispatchEvent(new Event('auth-changed'))
  router.push('/gestione/login')
}
</script>

<style scoped>
.management-layout__main {
  flex: 1;
  width: 100%;
}
</style>