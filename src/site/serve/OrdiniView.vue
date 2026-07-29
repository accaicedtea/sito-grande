<script setup>
import { ref, computed, onMounted } from 'vue'
import ToggleSwitch from '../../components/utils/ToggleSwitch.vue'
import api from '../../shared/api/client.js'

const activeBookings = ref([])
const deletedBookings = ref([])
const searchQuery = ref('')
const showDeleted = ref(false)
const isLoading = ref(false)
const loadError = ref(null)

const isDark = ref(localStorage.getItem('bookings-dark') === 'true')
const accessKey = ref(localStorage.getItem('booking_access_key') || '')
const showAuthModal = ref(false)
const showCreateModal = ref(false)
const authForm = ref({ email: '', pin: '' })
const authLoading = ref(false)
const authError = ref('')
const createLoading = ref(false)
const createError = ref('')
const createSuccess = ref('')
const createForm = ref({
  name: '',
  phone: '',
  guests: 2,
  time: '20:00',
  note: '',
  tavolo: '',
  date: new Date().toISOString().slice(0, 10),
})

function toggleDarkMode() {
  isDark.value = !isDark.value
  localStorage.setItem('bookings-dark', isDark.value)
}

const selectedDate = ref(new Date().toISOString().slice(0, 10))
const isAuthenticated = computed(() => Boolean(accessKey.value))

function mapBooking(row) {
  return {
    id: row.id,
    name: row.nome_cliente,
    phone: row.telefono,
    email: row.email,
    guests: row.numero_persone,
    time: row.ora?.slice(0, 5),
    date: row.data,
    note: row.note,
    stato: row.stato,
    arrived: row.stato === 'arrivata',
    tavolo: row.tavolo_nome,
  }
}

function setAccessKey(key) {
  const normalized = String(key || '').trim()
  if (!normalized) return null
  accessKey.value = normalized
  localStorage.setItem('booking_access_key', normalized)
  localStorage.setItem('auth_token', normalized)
  return normalized
}

function clearAccessKey() {
  accessKey.value = ''
  localStorage.removeItem('booking_access_key')
  localStorage.removeItem('auth_token')
}

function extractAccessKey(payload) {
  const candidates = [
    payload?.key,
    payload?.token,
    payload?.access_key,
    payload?.accessToken,
    payload?.data?.key,
    payload?.data?.token,
    payload?.data?.access_key,
    payload?.data?.accessToken,
    payload?.data?.data?.key,
    payload?.data?.data?.token,
  ]

  return candidates.find((value) => typeof value === 'string' && value.trim())
}

function isUnauthorized(err) {
  return err?.response?.status === 401
}

function openAuthModal() {
  authError.value = ''
  authForm.value = { email: '', pin: '' }
  showAuthModal.value = true
}

function clearProtectedState() {
  activeBookings.value = []
  deletedBookings.value = []
  searchQuery.value = ''
  showDeleted.value = false
  loadError.value = null
}

function closeAuthModal() {
  showAuthModal.value = false
  authError.value = ''
  authLoading.value = false
}

function openCreateModal() {
  if (!accessKey.value) {
    authError.value = 'Effettua l’accesso prima di aggiungere una prenotazione.'
    showAuthModal.value = true
    return
  }

  createError.value = ''
  createSuccess.value = ''
  createForm.value = {
    name: '',
    phone: '',
    guests: 2,
    time: '20:00',
    note: '',
    tavolo: '',
    date: selectedDate.value,
  }
  showCreateModal.value = true
}

function closeCreateModal() {
  showCreateModal.value = false
  createError.value = ''
  createSuccess.value = ''
  createLoading.value = false
}

async function loginWithPin() {
  if (authLoading.value) return

  const email = authForm.value.email.trim()
  const pin = authForm.value.pin.trim()

  if (!email || !pin) {
    authError.value = 'Inserisci email e pin.'
    return
  }

  authLoading.value = true
  authError.value = ''

  try {
    const res = await api.post('manager/login', { email, pin })
    const key = extractAccessKey(res)

    if (!key) {
      throw new Error('Accesso non riuscito')
    }

    setAccessKey(key)
    closeAuthModal()
    refreshData()
  } catch (err) {
    authError.value = err?.response?.data?.message || err?.message || 'Credenziali non valide.'
  } finally {
    authLoading.value = false
  }
}

async function submitCreateBooking() {
  if (createLoading.value) return
  if (!isAuthenticated.value) {
    createError.value = 'Devi autenticarti prima di creare una prenotazione.'
    return
  }

  const name = createForm.value.name.trim()
  const phone = createForm.value.phone.trim()

  if (!name || !phone || !createForm.value.time) {
    createError.value = 'Nome, telefono e orario sono obbligatori.'
    return
  }

  createLoading.value = true
  createError.value = ''
  createSuccess.value = ''

  const payload = {
    nome_cliente: name,
    telefono: phone,
    numero_persone: Number(createForm.value.guests) || 1,
    ora: createForm.value.time,
    data: createForm.value.date,
    note: createForm.value.note.trim(),
    stato: 'confermata',
    tavolo_nome: createForm.value.tavolo.trim(),
  }

  try {
    await api.post('/admin/prenotazioni', payload)
    createSuccess.value = 'Prenotazione aggiunta con successo.'
    closeCreateModal()
    refreshData()
  } catch (err) {
    if (isUnauthorized(err)) {
      clearAccessKey()
      clearProtectedState()
      createError.value = 'Sessione scaduta. Effettua nuovamente l’accesso.'
      showAuthModal.value = true
    } else {
      createError.value = err?.response?.data?.message || err?.message || 'Errore nella creazione della prenotazione.'
    }
  } finally {
    createLoading.value = false
  }
}

async function fetchBookings() {
  if (!isAuthenticated.value) {
    clearProtectedState()
    return
  }

  isLoading.value = true
  loadError.value = null
  try {
    const res = await api.get('/admin/prenotazioni', { params: { data: selectedDate.value } })
    activeBookings.value = (res.data?.data || []).map(mapBooking)
  } catch (err) {
    if (isUnauthorized(err)) {
      clearAccessKey()
      clearProtectedState()
      showAuthModal.value = true
    } else {
      loadError.value = 'Errore nel caricamento delle prenotazioni.'
      console.error(err)
      activeBookings.value = []
    }
  } finally {
    isLoading.value = false
  }
}

async function fetchDeleted() {
  if (!isAuthenticated.value) {
    deletedBookings.value = []
    return
  }

  try {
    const res = await api.get('/admin/prenotazioni/eliminate', { params: { data: selectedDate.value } })
    deletedBookings.value = (res.data?.data || []).map(mapBooking)
  } catch (err) {
    if (isUnauthorized(err)) {
      clearAccessKey()
      clearProtectedState()
      showAuthModal.value = true
    } else {
      console.error(err)
      deletedBookings.value = []
    }
  }
}

function refreshData() {
  if (!isAuthenticated.value) {
    clearProtectedState()
    return
  }

  searchQuery.value = ''
  showDeleted.value = false
  fetchBookings()
  fetchDeleted()
}

const filteredActive = computed(() => {
  if (!searchQuery.value.trim()) return activeBookings.value
  const query = searchQuery.value.toLowerCase()
  return activeBookings.value.filter(b =>
    b.name?.toLowerCase().includes(query) ||
    b.phone?.includes(query)
  )
})

const groupedActive = computed(() => {
  const groups = {}
  filteredActive.value.forEach(booking => {
    if (!groups[booking.time]) groups[booking.time] = []
    groups[booking.time].push(booking)
  })
  return Object.keys(groups).sort().reduce((acc, time) => {
    acc[time] = groups[time]
    return acc
  }, {})
})

const groupedDeleted = computed(() => {
  const groups = {}
  deletedBookings.value.forEach(booking => {
    if (!groups[booking.time]) groups[booking.time] = []
    groups[booking.time].push(booking)
  })
  return Object.keys(groups).sort().reduce((acc, time) => {
    acc[time] = groups[time]
    return acc
  }, {})
})

const totalGuests = computed(() => filteredActive.value.reduce((sum, b) => sum + (b.guests || 0), 0))
const arrivedCount = computed(() => filteredActive.value.filter(b => b.arrived).length)

async function toggleArrived(booking) {
  if (!isAuthenticated.value) return

  const nuovoStato = booking.arrived ? 'confermata' : 'arrivata'
  try {
    await api.put(`/admin/prenotazioni/${booking.id}`, { stato: nuovoStato })
    booking.arrived = !booking.arrived
    booking.stato = nuovoStato
  } catch (err) {
    if (isUnauthorized(err)) {
      clearAccessKey()
      clearProtectedState()
      showAuthModal.value = true
    } else {
      console.error('Errore aggiornamento stato:', err)
    }
  }
}

async function deleteBooking(booking) {
  if (!isAuthenticated.value) return

  try {
    await api.delete(`/admin/prenotazioni/${booking.id}`)
    const index = activeBookings.value.findIndex(b => b.id === booking.id)
    if (index !== -1) {
      const removed = activeBookings.value.splice(index, 1)[0]
      deletedBookings.value.push(removed)
    }
  } catch (err) {
    if (isUnauthorized(err)) {
      clearAccessKey()
      clearProtectedState()
      showAuthModal.value = true
    } else {
      console.error('Errore eliminazione:', err)
    }
  }
}

async function restoreBooking(booking) {
  if (!isAuthenticated.value) return

  try {
    await api.post(`/admin/prenotazioni/${booking.id}/ripristina`)
    const index = deletedBookings.value.findIndex(b => b.id === booking.id)
    if (index !== -1) {
      const restored = deletedBookings.value.splice(index, 1)[0]
      activeBookings.value.push(restored)
      activeBookings.value.sort((a, b) => a.id - b.id)
    }
  } catch (err) {
    if (isUnauthorized(err)) {
      clearAccessKey()
      clearProtectedState()
      showAuthModal.value = true
    } else {
      console.error('Errore ripristino:', err)
    }
  }
}

onMounted(() => {
  if (!isAuthenticated.value) {
    clearProtectedState()
    showAuthModal.value = true
  } else {
    fetchBookings()
    fetchDeleted()
  }
})
</script>

<template>
  <div class="bookings-page" :class="{ 'is-dark': isDark }">
    <div v-if="isAuthenticated" class="page-header">
      <div class="page-title-block">
        <div class="title-row">
          <span class="step-badge">Gestione sala</span>
          <div class="header-tools">
            <button class="action-btn secondary" @click="openAuthModal" :title="accessKey ? 'Accesso attivo' : 'Accedi'">
              <span v-if="accessKey" class="access-badge">Accesso attivo</span>
              <span v-else>Accedi</span>
            </button>
            <button class="theme-toggle-btn" @click="toggleDarkMode" :aria-label="isDark ? 'Tema chiaro' : 'Tema scuro'">
              <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
          </div>
        </div>
        <h1>Prenotazioni del giorno</h1>
        <p class="subtitle">Raggruppate per orario – segna gli arrivi</p>
      </div>

      <div class="top-actions">
        <div class="action-group">
          <button class="action-btn primary-action add-btn" @click="openCreateModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Aggiungi
          </button>
          <button class="refresh-btn icon-only" @click="refreshData" :aria-label="'Aggiorna'">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>

        <div class="stats">
          <div class="stat-card">
            <span class="stat-label">Totale coperti</span>
            <strong class="stat-value">{{ totalGuests }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">Arrivati</span>
            <strong class="stat-value">{{ arrivedCount }}</strong>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isAuthenticated">
      <div class="date-bar">
        <label>
          Data
          <input type="date" v-model="selectedDate" @change="refreshData" />
        </label>
      </div>

      <div class="search-bar">
        <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" v-model="searchQuery" placeholder="Cerca per nome o telefono..." class="search-input" />
      </div>

      <div v-if="isLoading" class="empty-state">
        <p>Caricamento prenotazioni…</p>
      </div>
      <div v-else-if="loadError" class="empty-state error-state">
        <p>{{ loadError }}</p>
      </div>

      <div v-else class="time-groups">
      <div v-for="(bookingsGroup, time) in groupedActive" :key="time" class="time-group">
        <div class="time-header">
          <span class="time-badge">{{ time }}</span>
          <span class="group-count">{{ bookingsGroup.length }} prenotazioni</span>
        </div>
        <div class="bookings-list">
          <div v-for="booking in bookingsGroup" :key="booking.id" class="booking-card"
            :class="{ arrived: booking.arrived }">
            <div class="booking-info">
              <div class="booking-name">
                <strong>{{ booking.name }}</strong>
                <span class="booking-guests">{{ booking.guests }} ospiti</span>
                <span class="booking-table" v-if="booking.tavolo">Tavolo {{ booking.tavolo }}</span>
              </div>
              <div class="booking-details">
                <span class="booking-phone">{{ booking.phone }}</span>
                <span class="booking-note" v-if="booking.note">{{ booking.note }}</span>
              </div>
            </div>
            <div class="booking-actions">
              <ToggleSwitch
                :modelValue="booking.arrived"
                @update:modelValue="() => toggleArrived(booking)"
                label=""
                onColor="#6bf178"
                offColor="#ff5964"
                offLabel="NON ARRIVATO"
                onBgColor="#e6e8e6"
                onLabel="ARRIVATO"
                animation-type="inOutBounce"
              />
              <button class="delete-btn" @click="deleteBooking(booking)">Elimina</button>
            </div>
          </div>
        </div>
      </div>
    </div>

      <div v-if="!isLoading && !loadError && Object.keys(groupedActive).length === 0 && !searchQuery" class="empty-state">
        <p>Nessuna prenotazione per questa data</p>
      </div>
      <div v-else-if="!isLoading && Object.keys(groupedActive).length === 0 && searchQuery" class="empty-state">
        <p>Nessuna prenotazione trovata per "{{ searchQuery }}"</p>
      </div>

      <div class="deleted-toggle" @click="showDeleted = !showDeleted">
        <span class="toggle-icon">{{ showDeleted ? '▼' : '▶' }}</span>
        <span>Cestino ({{ deletedBookings.length }} prenotazioni eliminate)</span>
      </div>

      <div v-if="showDeleted && deletedBookings.length > 0" class="deleted-section">
        <div class="time-groups">
          <div v-for="(bookingsGroup, time) in groupedDeleted" :key="time" class="time-group deleted-group">
            <div class="time-header">
              <span class="time-badge">{{ time }}</span>
              <span class="group-count">{{ bookingsGroup.length }} eliminate</span>
            </div>
            <div class="bookings-list">
              <div v-for="booking in bookingsGroup" :key="booking.id" class="booking-card deleted-card">
                <div class="booking-info">
                  <div class="booking-name">
                    <strong>{{ booking.name }}</strong>
                    <span class="booking-guests">{{ booking.guests }} ospiti</span>
                  </div>
                  <div class="booking-details">
                    <span class="booking-phone">{{ booking.phone }}</span>
                  </div>
                </div>
                <div class="booking-actions">
                  <button class="restore-btn" @click="restoreBooking(booking)">Ripristina</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="showDeleted && deletedBookings.length === 0" class="empty-state">
        <p>Cestino vuoto</p>
      </div>
    </div>
    <div v-else class="locked-state">
      <div class="locked-card">
        <div class="locked-icon">🔐</div>
        <h2>Area riservata</h2>
        <p>Per visualizzare e gestire le prenotazioni devi effettuare l’accesso con email e pin.</p>
        <button class="primary-btn" @click="openAuthModal">Accedi</button>
      </div>
    </div>

    <div v-if="showAuthModal" class="modal-backdrop" @click.self="closeAuthModal">
      <div class="modal-shell">
        <div class="modal-header">
          <h3>Accesso con email e pin</h3>
          <button class="modal-close" @click="closeAuthModal">×</button>
        </div>
        <div class="modal-body">
          <p class="modal-helper">Inserisci le credenziali presenti nel database per ottenere la chiave di accesso.</p>
          <label class="field">
            <span>Email</span>
            <input v-model="authForm.email" type="email" placeholder="nome@esempio.it" />
          </label>
          <label class="field">
            <span>Pin</span>
            <input v-model="authForm.pin" type="password" placeholder="Inserisci il pin" @keyup.enter="loginWithPin" />
          </label>
          <p v-if="authError" class="modal-error">{{ authError }}</p>
        </div>
        <div class="modal-footer">
          <button class="secondary-btn" @click="closeAuthModal">Annulla</button>
          <button class="primary-btn" @click="loginWithPin" :disabled="authLoading">
            {{ authLoading ? 'Accesso…' : 'Accedi' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="showCreateModal" class="modal-backdrop" @click.self="closeCreateModal">
      <div class="modal-shell modal-shell--wide">
        <div class="modal-header">
          <h3>Nuova prenotazione</h3>
          <button class="modal-close" @click="closeCreateModal">×</button>
        </div>
        <div class="modal-body modal-grid">
          <label class="field">
            <span>Nome</span>
            <input v-model="createForm.name" type="text" placeholder="Nome cliente" />
          </label>
          <label class="field">
            <span>Telefono</span>
            <input v-model="createForm.phone" type="tel" placeholder="Telefono" />
          </label>
          <label class="field">
            <span>Persone</span>
            <input v-model.number="createForm.guests" type="number" min="1" max="20" />
          </label>
          <label class="field">
            <span>Data</span>
            <input v-model="createForm.date" type="date" />
          </label>
          <label class="field">
            <span>Orario</span>
            <input v-model="createForm.time" type="time" />
          </label>
          <label class="field field--full">
            <span>Tavolo</span>
            <input v-model="createForm.tavolo" type="text" placeholder="Es. 12 / Patio" />
          </label>
          <label class="field field--full">
            <span>Note</span>
            <textarea v-model="createForm.note" rows="3" placeholder="Note aggiuntive"></textarea>
          </label>
          <p v-if="createError" class="modal-error field--full">{{ createError }}</p>
          <p v-if="createSuccess" class="modal-success field--full">{{ createSuccess }}</p>
        </div>
        <div class="modal-footer">
          <button class="secondary-btn" @click="closeCreateModal">Annulla</button>
          <button class="primary-btn" @click="submitCreateBooking" :disabled="createLoading">
            {{ createLoading ? 'Salvataggio…' : 'Salva prenotazione' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bookings-page {
  --bg-page: transparent;
  --bg-card: rgba(255, 255, 255, 0.6);
  --bg-card-solid: rgba(255, 255, 255, 0.7);
  --bg-input: rgba(255, 255, 255, 0.8);
  --text-primary: #3d302a;
  --text-secondary: #7a6a62;
  --text-muted: #9a8985;
  --border-soft: rgba(200, 190, 185, 0.5);
  --accent: #bc706b;
  --accent-soft: rgba(232, 180, 176, 0.2);
  --accent-border: rgba(232, 180, 176, 0.3);
  --green: #5a7a5a;
  --green-soft: rgba(168, 213, 168, 0.2);

  width: 100%;
  min-height: 100vh;
  max-width: none;
  margin: 0;
  padding: 1rem 1rem 2rem;
  transition: color 0.25s ease;
  box-sizing: border-box;
}

.bookings-page.is-dark {
  --bg-card: rgba(35, 32, 30, 0.7);
  --bg-card-solid: rgba(40, 37, 34, 0.85);
  --bg-input: rgba(45, 42, 39, 0.8);
  --text-primary: #f0e9e4;
  --text-secondary: #b8aca4;
  --text-muted: #8a7d75;
  --border-soft: rgba(255, 255, 255, 0.1);
  --accent: #e6a3a0;
  --accent-soft: rgba(230, 163, 160, 0.15);
  --accent-border: rgba(230, 163, 160, 0.3);
  --green: #8fd18f;
  --green-soft: rgba(143, 209, 143, 0.15);

  background: #16130f;
  border-radius: 0;
  padding: 1rem 1rem 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--accent-border);
  border-radius: 0;
  background: transparent;
}
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.header-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.top-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}
.action-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  align-items: center;
  width: 100%;
}
.add-btn {
  flex: 5 1 auto;
  justify-content: center;
}
.refresh-btn.icon-only {
  flex: 1 0 42px;
  justify-content: center;
  padding: 10px;
  min-width: 42px;
}
.step-badge {
  display: inline-block;
  background: var(--green-soft);
  color: var(--green);
  padding: 4px 12px;
  border-radius: 40px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}
h1 { font-size: 2rem; margin: 8px 0 4px; color: var(--text-primary); font-weight: 600; }
.subtitle { color: var(--text-secondary); font-size: 0.9rem; }

.stats { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
.stat-card {
  background: var(--bg-card-solid);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  padding: 10px 14px;
  text-align: center;
  border: 1px solid var(--accent-border);
  min-width: 92px;
  flex: 0 0 auto;
}
.stat-label { display: block; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); }
.stat-value { font-size: 1.8rem; font-weight: 700; color: var(--text-primary); line-height: 1; }

.theme-toggle-btn,
.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-soft);
  border: 1px solid var(--accent-border);
  padding: 10px 14px;
  border-radius: 40px;
  font-weight: 600;
  color: var(--accent);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}
.theme-toggle-btn:hover, .refresh-btn:hover {
  background: var(--accent-border);
  transform: translateY(-1px);
}
.primary-action {
  background: var(--accent);
  color: #fff;
  box-shadow: 0 8px 18px rgba(188, 112, 107, 0.24);
  padding: 12px 18px;
  font-size: 1rem;
  border-radius: 999px;
}
.primary-action:hover {
  background: var(--accent);
  filter: brightness(1.03);
}
.access-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--green-soft);
  color: var(--green);
  font-size: 0.78rem;
  font-weight: 700;
}

.date-bar{
  margin-bottom: 1.2rem;
  display:flex;
}
.date-bar label{
  display:flex;
  align-items:center;
  gap:0.6rem;
  font-size:0.85rem;
  color: var(--text-secondary);
}
.date-bar input[type="date"]{
  padding:0.5rem 0.8rem;
  border-radius:12px;
  border:1px solid var(--border-soft);
  background: var(--bg-input);
  color: var(--text-primary);
}

.search-bar { position: relative; margin-bottom: 24px; width: 100%; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
.search-input {
  width: 100%;
  padding: 12px 14px 12px 44px;
  border-radius: 999px;
  border: 1px solid var(--border-soft);
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 0.95rem;
  transition: all 0.2s;
  box-sizing: border-box;
}
.search-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }

.time-groups { display: flex; flex-direction: column; gap: 32px; }
.time-group {
  background: var(--bg-card);
  backdrop-filter: blur(4px);
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid var(--accent-border);
}
.time-header {
  background: linear-gradient(135deg, var(--accent-soft), var(--green-soft));
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid var(--accent-border);
}
.time-badge { font-size: 1.3rem; font-weight: 700; color: var(--accent); }
.group-count {
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--bg-card-solid);
  padding: 4px 10px;
  border-radius: 30px;
}
.bookings-list { padding: 8px 0; }
.booking-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-soft);
  transition: background 0.2s;
}
.booking-card:last-child { border-bottom: none; }
.booking-card.arrived { background: var(--green-soft); }
.booking-info { flex: 1; }
.booking-name { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; margin-bottom: 6px; }
.booking-name strong { font-size: 1.1rem; color: var(--text-primary); }
.booking-guests {
  font-size: 0.8rem;
  background: var(--accent-soft);
  padding: 2px 8px;
  border-radius: 20px;
  color: var(--accent);
}
.booking-table{
  font-size: 0.8rem;
  color: var(--text-secondary);
}
.booking-details { display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-secondary); flex-wrap:wrap; }
.booking-note{ font-style: italic; }
.booking-actions { display: flex; align-items: center; gap: 16px; }
.delete-btn, .restore-btn {
  background: transparent;
  border: 1px solid var(--accent-border);
  padding: 6px 12px;
  border-radius: 40px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-primary);
}
.delete-btn:hover { background: var(--accent-soft); border-color: var(--accent); }
.restore-btn { border-color: var(--green-soft); color: var(--green); }
.restore-btn:hover { background: var(--green-soft); }
.deleted-card { opacity: 0.8; background: var(--bg-card); }
.deleted-group .time-header { background: var(--bg-card); }
.deleted-group .time-badge { color: var(--text-muted); }
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-card);
  border-radius: 32px;
  color: var(--text-muted);
  margin-top: 24px;
}
.error-state{ color: #d9645a; }
.deleted-toggle {
  margin: 24px 0 16px;
  padding: 10px 14px;
  background: var(--bg-card);
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 600;
  color: var(--green);
  border: 1px solid var(--green-soft);
  transition: 0.2s;
  max-width: 100%;
  flex-wrap: wrap;
  white-space: normal;
}
.deleted-toggle:hover { background: var(--green-soft); }
.toggle-icon { font-size: 0.8rem; }
.locked-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 280px;
  padding: 1rem 0 2rem;
}
.locked-card {
  width: min(100%, 540px);
  background: var(--bg-card);
  border: 1px solid var(--accent-border);
  border-radius: 28px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.12);
}
.locked-card h2 {
  margin: 0.4rem 0 0.5rem;
  color: var(--text-primary);
}
.locked-card p { color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem; }
.locked-icon { font-size: 2rem; }

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-soft);
  border: 1px solid var(--accent-border);
  padding: 10px 14px;
  border-radius: 40px;
  font-weight: 600;
  color: var(--accent);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
}
.action-btn.secondary {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  background: transparent;
  border-color: var(--border-soft);
  color: var(--text-secondary);
}
.action-btn:hover { background: var(--accent-border); transform: translateY(-1px); }
.action-btn.secondary { color: var(--green); background: var(--green-soft); border-color: var(--green-soft); }
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(14, 10, 8, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}
.modal-shell {
  width: min(100%, 480px);
  max-height: calc(100dvh - 2rem);
  background: var(--bg-card-solid);
  border: 1px solid var(--border-soft);
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  box-sizing: border-box;
}
.modal-shell--wide { width: min(100%, 720px); }
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.15rem;
  border-bottom: 1px solid var(--border-soft);
}
.modal-header h3 { margin: 0; color: var(--text-primary); font-size: 1.05rem; }
.modal-close {
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
}
.modal-body {
  padding: 0.9rem 1rem;
  max-height: calc(100dvh - 10rem);
  overflow-y: auto;
}
.modal-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
  min-width: 0;
}
.field span { font-weight: 600; color: var(--text-primary); }
.field--full { grid-column: 1 / -1; }
.field input,
.field textarea {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--border-soft);
  background: var(--bg-input);
  color: var(--text-primary);
  font: inherit;
  box-sizing: border-box;
}
.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--accent);
}
.field textarea { resize: vertical; min-height: 90px; }
.modal-helper { margin-bottom: 0.7rem; color: var(--text-secondary); line-height: 1.4; font-size: 0.9rem; }
.modal-error { color: #d35b53; margin: 0; }
.modal-success { color: var(--green); margin: 0; }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.35rem 1.2rem;
  border-top: 1px solid var(--border-soft);
}
.primary-btn,
.secondary-btn {
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  font-weight: 600;
  cursor: pointer;
}
.primary-btn {
  background: var(--accent);
  color: #fff;
}
.secondary-btn {
  background: var(--bg-input);
  color: var(--text-primary);
  border: 1px solid var(--border-soft);
}
.primary-btn:disabled { opacity: 0.7; cursor: wait; }

@media (max-width: 700px) {
  .bookings-page { padding: 0 0.75rem 1.25rem; }
  .page-header { flex-direction: column; align-items: stretch; padding: 14px; }
  .top-actions { align-items: stretch; }
  .action-group { justify-content: stretch; }
  .action-group > * { flex: 1 1 calc(50% - 5px); justify-content: center; }
  .booking-card { flex-direction: column; align-items: flex-start; gap: 12px; }
  .booking-actions { align-self: flex-end; flex-wrap: wrap; justify-content: flex-end; }
  .stats { width: 100%; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
  .stat-card { flex: 1 1 calc(50% - 5px); text-align: center; min-width: 0; }
  .deleted-toggle { width: 100%; justify-content: center; box-sizing: border-box; }
  .refresh-btn, .theme-toggle-btn, .action-btn { padding: 8px 14px; font-size: 0.8rem; }
  .search-input { font-size: 0.9rem; }
  .modal-grid { grid-template-columns: 1fr; }
  .modal-shell { width: min(100%, 560px); }
  .modal-body { padding: 0.85rem 0.9rem; }
  .modal-footer { flex-direction: column-reverse; }
  .modal-footer .primary-btn,
  .modal-footer .secondary-btn { width: 100%; }
}
</style>