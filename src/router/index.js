// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const PublicLayout = () => import(/* webpackChunkName: "public-layout" */ '../layout/PublicLayout.vue')
const PrivateLayout = () => import(/* webpackChunkName: "private-layout" */ '../layout/PrivateLayout.vue')

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
        meta: { title: 'Prenota' }
      },
      {
        path: 'contatti',
        name: 'contatti',
        component: () => import('../site/public/ContactView.vue'),
        meta: { title: 'Contatti' }
      }
    ]
  },
  {
    path: '/servi',
    children: [
      {
        path: 'ordini',
        name: 'ordini',
        component: () => import('../site/serve/OrdiniView.vue'),
        meta: { title: 'Gestione ordinazioni' }
      }
    ]
  },
  {
    // Tutta l'area gestionale vive sotto /gestione: il layout privato,
    // il suo header/nav e ogni sotto-sezione condividono lo stesso prefisso
    // usato già dai link nei componenti (RouterLink a "/gestione",
    // "/gestione/menu", "/gestione/prenotazioni", ecc.).
    path: '/gestione',
    component: PrivateLayout,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "login" */ '../site/managment/LoginView.vue'),
        meta: { title: 'Accedi', guest: true }
      },
      {
        path: '',
        name: 'dashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ '../site/managment/DashboardView.vue'),
        meta: { title: 'Dashboard', requiresAuth: true }
      },
      {
        path: 'prodotti',
        name: 'prodotti',
        component: () => import(/* webpackChunkName: "prodotti" */ '../site/managment/ProductsView.vue'),
        meta: { title: 'Prodotti', requiresAuth: true }
      },
      {
        path: 'categorie',
        name: 'categorie',
        component: () => import(/* webpackChunkName: "categorie" */ '../site/managment/CategoriesView.vue'),
        meta: { title: 'Categorie', requiresAuth: true }
      },
      {
        path: 'ingredienti',
        name: 'ingredienti',
        component: () => import(/* webpackChunkName: "ingredienti" */ '../site/managment/IngredientsView.vue'),
        meta: { title: 'Ingredienti', requiresAuth: true }
      },
      {
        path: 'menu',
        name: 'gestione-menu',
        component: () => import(/* webpackChunkName: "gestione-menu" */ '../site/managment/MenuView.vue'),
        meta: { title: 'Gestione menu', requiresAuth: true }
      },
      {
        path: 'eventi',
        name: 'gestione-eventi',
        component: () => import(/* webpackChunkName: "gestione-eventi" */ '../site/managment/EventsView.vue'),
        meta: { title: 'Gestione eventi', requiresAuth: true }
      },
      {
        path: 'prenotazioni',
        name: 'gestione-prenotazioni',
        component: () => import(/* webpackChunkName: "gestione-prenotazioni" */ '../site/managment/ReservationsView.vue'),
        meta: { title: 'Gestione prenotazioni', requiresAuth: true }
      },
      {
        path: 'promozioni',
        name: 'promozioni',
        component: () => import(/* webpackChunkName: "promozioni" */ '../site/managment/PromotionsView.vue'),
        meta: { title: 'Promozioni', requiresAuth: true }
      },
      {
        path: 'profilo',
        name: 'profilo',
        component: () => import(/* webpackChunkName: "promozioni" */ '../site/managment/ProfileView.vue'),
        meta: { title: 'Profile', requiresAuth: true }
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

  // Stessa chiave usata da LoginView per salvare il token e da
  // PrivateLayout per rimuoverlo al logout.
  const isAuthenticated = !!localStorage.getItem('admin_token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guest && isAuthenticated && to.name === 'login') {
    return { name: 'dashboard' }
  }
  return true
})

// Prefetch dei chunk delle pagine pubbliche principali nei momenti di
// inattività del browser, in modo che quando l'utente clicca su un link
// il JS della pagina sia già scaricato e la navigazione risulti istantanea.
function prefetchPublicRoutes() {
  const loaders = [
    () => import('../layout/PublicLayout.vue'),
    () => import('../site/menu/MenuA.vue'),
    () => import('../site/events/EventsView.vue'),
    () => import('../site/booking/ReservationView.vue'),
  ]

  loaders.forEach((load) => {
    load().catch(() => { })
  })
}

router.isReady().then(() => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(prefetchPublicRoutes, { timeout: 3000 })
  } else {
    setTimeout(prefetchPublicRoutes, 1500)
  }
})

export default router