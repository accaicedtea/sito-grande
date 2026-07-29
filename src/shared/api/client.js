import axios from 'axios'

const API_BASE_URL = '/api/'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('admin_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data
    }

    if (Array.isArray(response.data)) {
      return { data: response.data }
    }

    return { data: response.data }
  },
  (error) => {
    if (error.response?.status === 401) {
      // Non facciamo più un redirect "duro" e incondizionato qui.
      // Motivi:
      // 1) window.location.href forza una ricarica completa della pagina,
      //    che interrompe eventuali import() dinamici di Vite ancora in
      //    corso (da cui gli errori "Caricamento non riuscito per il
      //    modulo" su chunk come PublicLayout, MenuA, EventsView, ecc.).
      // 2) La rotta corretta dell'area gestionale è "/gestione/login",
      //    non "/login": redirigere a "/login" finiva sulla 404.
      // 3) Non tutte le pagine che usano `api` appartengono all'area
      //    gestionale protetta da "admin_token" (es. OrdiniView usa un
      //    proprio "booking_access_key" con la sua modale di login
      //    in-pagina): forzare un redirect globale rompe quel flusso.
      //
      // Ora ci limitiamo a ripulire i token scaduti/non validi.
      // È responsabilità di ogni chiamante (o di un router guard mirato
      // sull'area /gestione) decidere se e dove reindirizzare l'utente.
      localStorage.removeItem('auth_token')
      localStorage.removeItem('admin_token')
      localStorage.removeItem('user')
    }

    console.error('API Error:', error)
    throw error
  },
)

export const menuAPI = {
  categories: {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
  },
  items: {
    getAll: () => api.get('/items'),
    getById: (id) => api.get(`/items/${id}`),
    getByCategory: (categoryId) => api.get(`/items?category=${categoryId}`),
  },
  allergens: {
    getAll: () => api.get('/allergens'),
    getById: (id) => api.get(`/allergens/${id}`),
  },
}

export default api