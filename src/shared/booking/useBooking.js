import { computed, reactive, ref, watch } from 'vue'

const STORAGE_KEY = 'ristorante-prenotazione-draft'

export const OCCASION_OPTIONS = [ /* ... invariato ... */]
export const STEP_LABELS = [ /* ... invariato ... */]

function createBookingState() {
  return {
    name: '', phone: '', guests: 2,
    occasion: 'Cena romantica', time: '',
    cake: false, risky: false, notes: '',
  }
}

// ─── STATO SINGLETON (fuori dalla funzione) ───────────────────────────────────
const currentStep = ref(1)
const selectedDateIso = ref('')
const selectedDay = ref(null)
const confirmation = ref(false)
const reservationCode = ref('')
const restorePrompt = ref(false)
const pendingDraft = ref(null)
const booking = reactive(createBookingState())

const _emptyModal = () => ({
  open: false, variant: 'default', title: '', message: '',
  primaryButtonLabel: 'Conferma', secondaryButtonLabel: '',
  showRiskOption: false, riskChecked: false, _onConfirm: null,
})
const modalState = ref(_emptyModal())

// ─── COMPUTED SINGLETON ───────────────────────────────────────────────────────
const selectedDaySummary = computed(() =>
  selectedDay.value
    ? `${selectedDay.value.weekday} ${selectedDay.value.dayNumber}`
    : 'Nessun giorno selezionato',
)

const orderCardMode = computed(() => {
  if (currentStep.value !== 1) return 'none'
  if (restorePrompt.value && pendingDraft.value) return 'restore'
  if (selectedDateIso.value) return 'active'
  return 'none'
})

const windowPressure = computed(() => {
  const load = selectedDay.value?.load ?? 0
  return [
    { label: 'Pranzo', range: '12:00 - 14:30', pressure: Math.min(100, load), color: 'green' },
    { label: 'Aperitivo', range: '18:00 - 19:30', pressure: Math.min(100, load + 10), color: 'amber' },
    { label: 'Cena', range: '19:45 - 22:30', pressure: Math.min(100, load + 20), color: 'red' },
  ]
})

// ─── DRAFT WATCHER (una sola volta, a livello modulo) ────────────────────────
function hasDraftContent() {
  return (
    currentStep.value > 1 || selectedDateIso.value !== '' ||
    booking.name.trim() !== '' || booking.phone.trim() !== '' ||
    booking.notes.trim() !== '' || booking.time !== '' ||
    booking.cake === true || booking.risky === true
  )
}

function saveDraft() {
  if (!hasDraftContent()) { localStorage.removeItem(STORAGE_KEY); return }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: 1,
    currentStep: currentStep.value,
    selectedDateIso: selectedDateIso.value,
    selectedDay: selectedDay.value ? { ...selectedDay.value } : null,
    booking: { ...booking },
    reservationCode: reservationCode.value,
  }))
}

watch([currentStep, selectedDateIso, selectedDay, booking], () => {
  if (!restorePrompt.value) saveDraft()
}, { deep: true })

// ─── EXPORT ───────────────────────────────────────────────────────────────────
export function useBooking() {

  // ── Modal ──────────────────────────────────────────────────────────────────
  function closeModal() { modalState.value = _emptyModal() }

  function openModal(title, message, buttonLabel = 'Chiudi') {
    modalState.value = { ..._emptyModal(), open: true, title, message, primaryButtonLabel: buttonLabel }
  }

  function openChoiceModal(title, message) {
    modalState.value = {
      ..._emptyModal(), open: true, title, message,
      primaryButtonLabel: 'Prenota con rischio',
      secondaryButtonLabel: 'Cambia orario',
      showRiskOption: true, riskChecked: booking.risky,
    }
  }

  function openConfirmModal(title, message, onConfirm, { primaryLabel = 'Conferma', variant = 'default' } = {}) {
    modalState.value = {
      ..._emptyModal(), open: true, variant, title, message,
      primaryButtonLabel: primaryLabel,
      secondaryButtonLabel: 'Annulla',
      _onConfirm: onConfirm,
    }
  }

  function handleModalConfirm() {
    const cb = modalState.value._onConfirm
    closeModal()
    if (typeof cb === 'function') cb()
  }

  function setModalRiskChecked(checked) {
    modalState.value.riskChecked = checked
    booking.risky = checked
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  function selectDay(day) {
    if (!day || day.isDisabled) return
    selectedDateIso.value = day.iso
    selectedDay.value = day
    currentStep.value = 2
    confirmation.value = false
    restorePrompt.value = false
  }

  function clearCalendarSelection() {
    selectedDateIso.value = ''
    selectedDay.value = null
    currentStep.value = 1
    confirmation.value = false
  }

  function backToCalendar() { currentStep.value = 1 }

  function resetBooking() {
    currentStep.value = 1
    selectedDateIso.value = ''
    selectedDay.value = null
    confirmation.value = false
    reservationCode.value = ''
    Object.assign(booking, createBookingState())
    localStorage.removeItem(STORAGE_KEY)
  }

  function editConfirmedReservation() {
    if (!selectedDateIso.value) return
    confirmation.value = false
    currentStep.value = 2
  }

  function applySystemReservationToEditor(reservation) {
    if (!reservation) return
    selectedDateIso.value = reservation.selectedDateIso
    selectedDay.value = reservation.selectedDay ? { ...reservation.selectedDay } : null
    Object.assign(booking, createBookingState(), {
      name: reservation.name, phone: reservation.phone,
      guests: reservation.guests, occasion: reservation.occasion,
      time: reservation.time, cake: reservation.cake,
      risky: reservation.risky, notes: reservation.notes,
    })
  }

  // ── Draft ──────────────────────────────────────────────────────────────────
  function loadDraft() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
  }

  function applyDraft(draft) {
    if (!draft) return
    selectedDateIso.value = typeof draft.selectedDateIso === 'string' ? draft.selectedDateIso : ''
    currentStep.value = typeof draft.currentStep === 'number' ? draft.currentStep : 1
    reservationCode.value = typeof draft.reservationCode === 'string' ? draft.reservationCode : ''
    selectedDay.value = draft.selectedDay && typeof draft.selectedDay === 'object' ? draft.selectedDay : null
    if (draft.booking && typeof draft.booking === 'object') {
      Object.assign(booking, createBookingState(), draft.booking)
    }
  }

  function resumeDraft() { applyDraft(pendingDraft.value); restorePrompt.value = false; pendingDraft.value = null }
  function discardDraft() { localStorage.removeItem(STORAGE_KEY); restorePrompt.value = false; pendingDraft.value = null }

  return {
    currentStep, selectedDateIso, selectedDay, confirmation,
    reservationCode, restorePrompt, pendingDraft, booking,
    modalState, selectedDaySummary, orderCardMode, windowPressure,
    selectDay, clearCalendarSelection, backToCalendar, resetBooking,
    editConfirmedReservation, applySystemReservationToEditor,
    resumeDraft, discardDraft, loadDraft,
    openModal, openChoiceModal, openConfirmModal,
    closeModal, handleModalConfirm, setModalRiskChecked,
    OCCASION_OPTIONS, STEP_LABELS,
  }
}