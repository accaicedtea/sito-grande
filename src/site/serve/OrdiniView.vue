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

function toggleDarkMode() {
  isDark.value = !isDark.value
  localStorage.setItem('bookings-dark', isDark.value)
}

const selectedDate = ref(new Date().toISOString().slice(0, 10))

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

async function fetchBookings() {
  isLoading.value = true
  loadError.value = null
  try {
    const res = await api.get('/admin/prenotazioni', { params: { data: selectedDate.value } })
    activeBookings.value = (res.data?.data || []).map(mapBooking)
  } catch (err) {
    loadError.value = 'Errore nel caricamento delle prenotazioni.'
    console.error(err)
    activeBookings.value = []
  } finally {
    isLoading.value = false
  }
}

async function fetchDeleted() {
  try {
    const res = await api.get('/admin/prenotazioni/eliminate', { params: { data: selectedDate.value } })
    deletedBookings.value = (res.data?.data || []).map(mapBooking)
  } catch (err) {
    console.error(err)
    deletedBookings.value = []
  }
}

function refreshData() {
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
  const nuovoStato = booking.arrived ? 'confermata' : 'arrivata'
  try {
    await api.put(`/admin/prenotazioni/${booking.id}`, { stato: nuovoStato })
    booking.arrived = !booking.arrived
    booking.stato = nuovoStato
  } catch (err) {
    console.error('Errore aggiornamento stato:', err)
  }
}

async function deleteBooking(booking) {
  try {
    await api.delete(`/admin/prenotazioni/${booking.id}`)
    const index = activeBookings.value.findIndex(b => b.id === booking.id)
    if (index !== -1) {
      const removed = activeBookings.value.splice(index, 1)[0]
      deletedBookings.value.push(removed)
    }
  } catch (err) {
    console.error('Errore eliminazione:', err)
  }
}

async function restoreBooking(booking) {
  try {
    await api.post(`/admin/prenotazioni/${booking.id}/ripristina`)
    const index = deletedBookings.value.findIndex(b => b.id === booking.id)
    if (index !== -1) {
      const restored = deletedBookings.value.splice(index, 1)[0]
      activeBookings.value.push(restored)
      activeBookings.value.sort((a, b) => a.id - b.id)
    }
  } catch (err) {
    console.error('Errore ripristino:', err)
  }
}

onMounted(() => {
  fetchBookings()
  fetchDeleted()
})
</script>

<template>
  <div class="bookings-page" :class="{ 'is-dark': isDark }">
    <div class="page-header">
      <div>
        <span class="step-badge">Gestione sala</span>
        <h1>Prenotazioni del giorno</h1>
        <p class="subtitle">Raggruppate per orario – segna gli arrivi</p>
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
        <button class="theme-toggle-btn" @click="toggleDarkMode" :aria-label="isDark ? 'Tema chiaro' : 'Tema scuro'">
          <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
        <button class="refresh-btn" @click="refreshData">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          Aggiorna
        </button>
      </div>
    </div>

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

  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 1rem;
  transition: color 0.25s ease;
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
  border-radius: 24px;
  padding: 1.5rem 1rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 32px;
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

.stats { display: flex; gap: 16px; align-items: center; }
.stat-card {
  background: var(--bg-card-solid);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  padding: 12px 20px;
  text-align: center;
  border: 1px solid var(--accent-border);
  min-width: 100px;
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

.search-bar { position: relative; margin-bottom: 32px; }
.search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
.search-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border-radius: 48px;
  border: 1px solid var(--border-soft);
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s;
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
  margin: 32px 0 16px;
  padding: 12px 16px;
  background: var(--bg-card);
  border-radius: 48px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 600;
  color: var(--green);
  border: 1px solid var(--green-soft);
  transition: 0.2s;
}
.deleted-toggle:hover { background: var(--green-soft); }
.toggle-icon { font-size: 0.8rem; }

@media (max-width: 700px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .booking-card { flex-direction: column; align-items: flex-start; gap: 12px; }
  .booking-actions { align-self: flex-end; flex-wrap: wrap; justify-content: flex-end; }
  .stats { width: 100%; justify-content: space-between; flex-wrap: wrap; }
  .stat-card { flex: 1; text-align: center; }
  .deleted-toggle { width: 100%; justify-content: center; }
  .refresh-btn, .theme-toggle-btn { padding: 8px 14px; font-size: 0.8rem; }
}
</style>