import { computed, reactive, ref } from 'vue'

/**
 * Centralizes all reservation state management
 * States: idle, draft (suspended), confirmed
 */

const STORAGE_KEY = 'ristorante-reservation-store'

function createEmptyReservation() {
  return {
    id: null,
    code: null,
    state: 'idle', // 'idle' | 'draft' | 'confirmed'
    createdAt: null,
    confirmedAt: null,
    // Booking data
    name: '',
    phone: '',
    guests: 2,
    occasion: 'Cena romantica',
    time: '',
    cake: false,
    risky: false,
    notes: '',
    // Calendar data
    selectedDateIso: '',
    selectedDay: null,
  }
}

// ─── SINGLETON STATE ───────────────────────────────────────────────────────
const store = reactive(createEmptyReservation())

// ─── PERSISTENCE ──────────────────────────────────────────────────────────
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return data
  } catch {
    return null
  }
}

function saveToStorage(reservation) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservation))
  } catch {
    // localStorage may be unavailable in private mode
  }
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY)
}

// ─── COMPUTED ───────────────────────────────────────────────────────────
const isDraft = computed(() => store.state === 'draft')
const isConfirmed = computed(() => store.state === 'confirmed')
const isIdle = computed(() => store.state === 'idle')

const hasPendingData = computed(() =>
  isDraft.value && (
    store.name.trim() !== '' ||
    store.phone.trim() !== '' ||
    store.selectedDateIso !== '' ||
    store.time !== '' ||
    store.notes.trim() !== '' ||
    store.cake === true ||
    store.risky === true
  )
)

const orderCardMode = computed(() => {
  if (isConfirmed.value) return 'active' // Show active order if confirmed
  if (hasPendingData.value) return 'restore' // Show restore prompt if draft exists
  return 'none' // Hide card
})

const selectedDaySummary = computed(() =>
  store.selectedDay
    ? `${store.selectedDay.weekday} ${store.selectedDay.dayNumber}`
    : 'Nessun giorno selezionato'
)

// ─── EXPORT ───────────────────────────────────────────────────────────────
export function useReservationStore() {

  // ── Initialization ─────────────────────────────────────────────────────
  function initializeFromStorage() {
    const saved = loadFromStorage()
    if (saved) {
      Object.assign(store, saved)
    }
  }

  // ── Draft management ──────────────────────────────────────────────────
  function saveDraft(bookingData) {
    store.state = 'draft'
    store.createdAt = store.createdAt || new Date().toISOString()
    Object.assign(store, bookingData)
    saveToStorage({ ...store })
  }

  function loadDraft() {
    return loadFromStorage()
  }

  function resumeDraft() {
    // Load from storage is already done by initializeFromStorage
    // Just ensure state is 'draft'
    if (store.state !== 'confirmed') {
      store.state = 'draft'
    }
  }

  function discardDraft() {
    clearStorage()
    Object.assign(store, createEmptyReservation())
  }

  // ── Confirmation ──────────────────────────────────────────────────────
  function confirmReservation(code) {
    store.state = 'confirmed'
    store.code = code || `SYS-${Date.now()}`
    store.id = store.id || `RES-${Date.now()}`
    store.confirmedAt = new Date().toISOString()
    saveToStorage({ ...store })
  }

  function cancelReservation() {
    clearStorage()
    Object.assign(store, createEmptyReservation())
  }

  // ── Edit confirmed reservation ────────────────────────────────────────
  function editConfirmedReservation() {
    // Keep the confirmed data but mark for editing
    store.state = 'editing'
  }

  function revertToConfirmed() {
    store.state = 'confirmed'
  }

  // ── Reset ─────────────────────────────────────────────────────────────
  function reset() {
    discardDraft()
  }

  // ── Update specific fields ────────────────────────────────────────────
  function updateBookingData(data) {
    Object.assign(store, data)
    if (store.state === 'draft') {
      saveToStorage({ ...store })
    }
  }

  return {
    // State
    store,
    isDraft,
    isConfirmed,
    isIdle,
    hasPendingData,
    orderCardMode,
    selectedDaySummary,
    
    // Methods
    initializeFromStorage,
    saveDraft,
    loadDraft,
    resumeDraft,
    discardDraft,
    confirmReservation,
    cancelReservation,
    editConfirmedReservation,
    revertToConfirmed,
    updateBookingData,
    reset,
  }
}
