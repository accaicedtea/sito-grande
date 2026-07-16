// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import PublicLayout from '../layout/PublicLayout.vue'
import PrivateLayout from '../layout/PrivateLayout.vue'

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import(/* webpackChunkName: "home" */ '../site/public/HomeView.vue'),
        meta: { title: 'Home', guest: true }
      },
      {
        path: 'menu',
        name: 'menu',
        component: () => import(/* webpackChunkName: "menu" */ '../site/menu/MenuA.vue'),
        meta: { title: 'Menu' }
      },

      {
        path: 'eventi',
        name: 'eventi',
        component: () => import(/* webpackChunkName: "eventi" */ '../site/events/EventsView.vue'),
        meta: { title: 'Eventi' }
      },
      {
        path: 'prenotazioni',
        name: 'prenota',
        component: () => import(/* webpackChunkName: "prenota" */ '../site/booking/ReservationView.vue'),

      }
    ]
  },
  {
    path: '/',
    component: PrivateLayout,
    children: [
      {
        path: '/accamanagment/login',
        name: 'login',
        component: () => import(/* webpackChunkName: "login" */ '../site/managment/LoginView.vue'),
        meta: { title: 'Accedi', guest: true }
      }
    ]
  },
  {
    path: '/dashboard',
    component: PrivateLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ '../site/managment/DashboardView.vue'),
        meta: { title: 'Dashboard' }
      }
    ]
  },
  // Rotta 404
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../site/errors/NotFoundView.vue'),
    meta: { title: 'Pagina non trovata' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, left: 0 }
  }
})

// Guard globale: titolo e controllo autenticazione (senza next())
router.beforeEach((to, from) => {
  document.title = to.meta.title ? `Osteria | ${to.meta.title}` : 'Osteria'

  const isAuthenticated = localStorage.getItem('token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Reindirizza al login con il path originale in query
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guest && isAuthenticated) {
    // Se già autenticato, vai alla dashboard
    return { name: 'dashboard' }
  }
  // Consenti la navigazione
  return true
})

// Prefetch dei chunk delle pagine pubbliche principali nei momenti di
// inattività del browser, in modo che quando l'utente clicca su un link
// il JS della pagina sia già scaricato e la navigazione risulti istantanea.
// Non blocca nulla: parte solo dopo che la navigazione iniziale è completa
// e solo quando il browser non ha altro da fare.
function prefetchPublicRoutes() {
  const loaders = [
    () => import('../site/menu/MenuA.vue'),
    () => import('../site/events/EventsView.vue'),
    () => import('../site/booking/ReservationView.vue'),
  ]

  loaders.forEach((load) => {
    // Ogni import viene lanciato singolarmente per non saturare la rete
    // tutto in una volta; se uno fallisce (es. offline) non blocca gli altri.
    load().catch(() => {})
  })
}

router.isReady().then(() => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(prefetchPublicRoutes, { timeout: 3000 })
  } else {
    // Fallback per browser senza requestIdleCallback (es. Safari)
    setTimeout(prefetchPublicRoutes, 1500)
  }
})

export default router