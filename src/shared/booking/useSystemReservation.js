import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const SYSTEM_RESERVATION_KEY = 'ristorante-system-reservation'
const LEGACY_SYSTEM_RESERVATION_CODE = 'SYS-20260524-1'

export function useSystemReservation() {
  const systemReservation = ref(null)
  const isEditingSystemReservation = ref(false)
  const clockTick = ref(Date.now())
  let clockTimer = null

  // ── Parsing helpers ──────────────────────────────────────────────────────────

  function parseIsoDate(isoDate) {
    const [year, month, day] = isoDate.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  function parseReservationDateTime(reservation) {
    if (!reservation?.selectedDateIso || !reservation?.time) return null
    const date = parseIsoDate(reservation.selectedDateIso)
    const [hours, minutes] = reservation.time.split(':').map(Number)
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  function getTwoHourCutoff(reservation) {
    const arrival = parseReservationDateTime(reservation)
    if (!arrival) return null
    return new Date(arrival.getTime() - 2 * 60 * 60 * 1000)
  }

  function isReservationEditable(reservation) {
    const cutoff = getTwoHourCutoff(reservation)
    if (!cutoff) return false
    return clockTick.value <= cutoff.getTime()
  }

  // ── Persistence ──────────────────────────────────────────────────────────────

  function loadSystemReservation() {
    try {
      const raw = localStorage.getItem(SYSTEM_RESERVATION_KEY)
      if (!raw) return null
      const reservation = JSON.parse(raw)
      if (reservation?.code === LEGACY_SYSTEM_RESERVATION_CODE) {
        localStorage.removeItem(SYSTEM_RESERVATION_KEY)
        return null
      }
      return reservation
    } catch {
      return null
    }
  }

  function saveSystemReservation(reservation) {
    systemReservation.value = reservation
    try {
      localStorage.setItem(SYSTEM_RESERVATION_KEY, JSON.stringify(reservation))
    } catch {
      // localStorage may be unavailable in private mode; keep in-memory copy.
    }
  }

  function deleteSystemReservation() {
    systemReservation.value = null
    localStorage.removeItem(SYSTEM_RESERVATION_KEY)
    isEditingSystemReservation.value = false
  }

  function saveNotificationRequest({ phone, service_date, service_time, party_size, occasion }) {
    const key = 'notification_requests'
    try {
      const raw = localStorage.getItem(key)
      const items = raw ? JSON.parse(raw) : []
      const entry = {
        id: Date.now(),
        phone,
        service_date,
        service_time,
        party_size,
        occasion,
        channel: 'sms',
        notified: false,
      }
      localStorage.setItem(key, JSON.stringify([...items, entry]))
      return entry
    } catch {
      return null
    }
  }

  // ── Computed ─────────────────────────────────────────────────────────────────

  const activeReservation = computed(() => systemReservation.value ?? null)

  const systemReservationEditable = computed(() =>
    isReservationEditable(systemReservation.value),
  )

  const systemReservationCutoffLabel = computed(() => {
    const cutoff = getTwoHourCutoff(systemReservation.value)
    if (!cutoff) return ''
    return new Intl.DateTimeFormat('it-IT', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(cutoff)
  })

  const systemReservationLabel = computed(() => {
    if (!systemReservation.value) return 'Nessuna prenotazione attiva'
    const { weekday = 'Data', dayNumber = '' } = systemReservation.value.selectedDay ?? {}
    return `${weekday} ${dayNumber}`.trim()
  })

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  onMounted(() => {
    systemReservation.value = loadSystemReservation()
    clockTimer = window.setInterval(() => {
      clockTick.value = Date.now()
    }, 60_000)
  })

  onBeforeUnmount(() => {
    if (clockTimer) window.clearInterval(clockTimer)
  })

  return {
    systemReservation,
    isEditingSystemReservation,
    activeReservation,
    systemReservationEditable,
    systemReservationCutoffLabel,
    systemReservationLabel,
    saveSystemReservation,
    deleteSystemReservation,
    saveNotificationRequest,
    isReservationEditable,
  }
}
