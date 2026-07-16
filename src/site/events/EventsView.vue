<template>
  <div class="events" :data-theme="theme">

    <header class="events__hero">
      <div class="events__hero-content">
        <h1 class="events__hero-title">I Nostri Eventi</h1>
        <p class="events__hero-subtitle">Scopri cosa succede questa settimana</p>
        <div class="events__hero-dates">{{ weekRange }}</div>
      </div>
    </header>

    <transition-group
      tag="ul"
      class="events__list"
      name="events-fade"
      v-if="!loading && events.length > 0"
      appear
    >
      <li
        v-for="(event, index) in events"
        :key="event.id"
        class="events__list-item"
        :style="{ animationDelay: (index % 8) * 60 + 'ms' }"
      >
        <article class="events__card">
          <div class="events__card-ribbon">
            <span class="events__card-month">{{ month(event.event_date) }}</span>
            <span class="events__card-day">{{ dayNumber(event.event_date) }}</span>
          </div>

          <div class="events__card-badges">
            <span class="events__badge events__badge--today" v-if="isToday(event.event_date)">Oggi</span>
            <span class="events__badge events__badge--finished" v-if="isPastDay(event.event_date)">Finito</span>
          </div>

          <div class="events__card-image" v-if="event.image_url">
            <img :src="event.image_url" :alt="event.event_name" loading="lazy" />
          </div>
          <div class="events__card-image events__card-image--placeholder" v-else>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>

          <div class="events__card-body">
            <h2 class="events__card-title">{{ event.event_name }}</h2>
            <time class="events__card-date">{{ formatDate(event) }}</time>
          </div>
        </article>
      </li>
    </transition-group>

    <div class="events__empty" v-else-if="!loading">
      <div class="events__empty-icon">🎉</div>
      <h2 class="events__empty-title">Nessun evento in programma</h2>
      <p class="events__empty-text">Resta sintonizzato per i prossimi appuntamenti!</p>
    </div>

    <div class="events__loader" v-else>
      <div class="events__spinner"></div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { theme } from '../../shared/theme/index.js'

const events = ref([])
const loading = ref(true)

const TENANT_ID = 1

function getCurrentWeekRange() {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const monday = new Date(now)
  monday.setDate(now.getDate() + diffToMonday)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  const fmt = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  return { start: fmt(monday), end: fmt(sunday) }
}

const weekRange = computed(() => {
  const { start, end } = getCurrentWeekRange()
  const from = new Date(start + 'T00:00:00')
  const to = new Date(end + 'T00:00:00')
  const opt = { day: 'numeric', month: 'short' }
  return `${from.toLocaleDateString('it-IT', opt)} – ${to.toLocaleDateString('it-IT', opt)}`
})

function month(dateString) {
  return new Date(dateString).toLocaleDateString('it-IT', { month: 'short' })
}
function dayNumber(dateString) {
  return new Date(dateString).getDate()
}
function formatDate(ev) {
  const d = new Date(ev.event_date)
  const day = d.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
  if (ev.publish_at) {
    const time = new Date(ev.publish_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    return `${day} | ${time}`
  }
  return day
}

function isPastDay(dateString) {
  const eventDate = new Date(dateString)
  const today = new Date()
  return (
    eventDate.getFullYear() < today.getFullYear() ||
    (eventDate.getFullYear() === today.getFullYear() && eventDate.getMonth() < today.getMonth()) ||
    (eventDate.getFullYear() === today.getFullYear() && eventDate.getMonth() === today.getMonth() && eventDate.getDate() < today.getDate())
  )
}
function isToday(dateString) {
  const eventDate = new Date(dateString)
  const today = new Date()
  return (
    eventDate.getFullYear() === today.getFullYear() &&
    eventDate.getMonth() === today.getMonth() &&
    eventDate.getDate() === today.getDate()
  )
}

async function fetchPublicEvents() {
  const { start, end } = getCurrentWeekRange()
  try {
    const res = await fetch(`/api/eventi-pubblici?tenant_id=${TENANT_ID}&start=${start}&end=${end}`)
    const json = await res.json()
    const rawEvents = json?.data || []
    events.value = rawEvents.filter(ev => ev.event_name && Number(ev.is_closed) === 0)
  } catch (err) {
    console.error('Errore nel recupero eventi:', err)
    events.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchPublicEvents)
</script>