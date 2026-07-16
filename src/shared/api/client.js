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
      localStorage.removeItem('auth_token')
      localStorage.removeItem('admin_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
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