<script setup>
import { onMounted } from 'vue'
import ReservationCalendar from '../../components/reservation/ReservationCalendar.vue'
import ReservationForm     from '../../components/reservation/ReservationForm.vue'
import ResturantInfo  from '../../components/reservation/ResturantInfo.vue'
import ReservationConfirm  from '../../components/reservation/ReservationConfirm.vue'
import AppModal            from '../../components/reservation/AppModal.vue'
import { useBooking }            from '../../shared/booking/useBooking.js'
import { useSystemReservation }  from '../../shared/booking/useSystemReservation.js'
import { theme } from '../../shared/theme/index.js'
const {
  currentStep, selectedDateIso, selectedDay, confirmation,
  reservationCode, restorePrompt, pendingDraft, booking,
  modalState, selectedDaySummary, windowPressure,
  selectDay, clearCalendarSelection, backToCalendar, resetBooking,
  editConfirmedReservation, applySystemReservationToEditor,
  loadDraft,
  openModal, openChoiceModal, openConfirmModal,
  closeModal, handleModalConfirm, setModalRiskChecked,
  OCCASION_OPTIONS, STEP_LABELS,
} = useBooking()

const {
  systemReservation, isEditingSystemReservation, activeReservation,
  systemReservationEditable, systemReservationCutoffLabel,
  saveSystemReservation, deleteSystemReservation, saveNotificationRequest,
} = useSystemReservation()

function submitBooking(payload) {
  const bookedDay = payload?.selectedDay ?? selectedDay.value
  const available = Boolean(payload?.available)

  if (!bookedDay || bookedDay.isDisabled) return

  if (!booking.time) {
    openModal('Orario mancante', 'Seleziona un orario valido per procedere.')
    return
  }

  if (available) {
    const savedReservation = {
      ...systemReservation.value,
      id:   systemReservation.value?.id   ?? `SYS-${Date.now()}`,
      code: systemReservation.value?.code ?? `SYS-${Date.now()}`,
      name: booking.name, phone: booking.phone, guests: booking.guests,
      occasion: booking.occasion, time: booking.time, cake: booking.cake,
      risky: booking.risky, notes: booking.notes,
      selectedDateIso: selectedDateIso.value,
      selectedDay: selectedDay.value ? { ...selectedDay.value } : bookedDay,
    }
    saveSystemReservation(savedReservation)
    isEditingSystemReservation.value = false
    currentStep.value = 3
    confirmation.value = true
    reservationCode.value = savedReservation.code
    localStorage.removeItem('ristorante-prenotazione-draft')
    return
  }

  if (booking.risky) {
    const saved = saveNotificationRequest({
      phone: booking.phone, service_date: selectedDateIso.value,
      service_time: booking.time, party_size: booking.guests, occasion: booking.occasion,
    })
    const code = saved ? `WL-${String(saved.id).slice(-6)}` : `WL-${Date.now().toString().slice(-6)}`
    saveSystemReservation({
      ...systemReservation.value,
      id: systemReservation.value?.id ?? `WL-${Date.now()}`, code,
      name: booking.name, phone: booking.phone, guests: booking.guests,
      occasion: booking.occasion, time: booking.time, cake: booking.cake,
      risky: true, notes: booking.notes,
      selectedDateIso: selectedDateIso.value,
      selectedDay: selectedDay.value ? { ...selectedDay.value } : bookedDay,
    })
    isEditingSystemReservation.value = false
    currentStep.value = 3
    confirmation.value = true
    reservationCode.value = code
    localStorage.removeItem('ristorante-prenotazione-draft')
    return
  }

  openChoiceModal(
    'Orario non disponibile',
    "Puoi cambiare subito l'orario oppure spuntare il rischio: se si libera un posto ti inviamo un SMS di conferma.",
  )
}

function confirmRiskBooking() {
  if (!booking.risky) return
  closeModal()
  submitBooking({ selectedDay: selectedDay.value, available: false })
}

function beginEditSystemReservation() {
  if (!systemReservation.value || !systemReservationEditable.value) return
  isEditingSystemReservation.value = true
  currentStep.value = 1
  confirmation.value = false
  restorePrompt.value = false
  pendingDraft.value = null
  applySystemReservationToEditor(systemReservation.value)
}

function handleDeleteSystemReservation() {
  openConfirmModal(
    'Elimina prenotazione',
    'Sei sicuro di voler eliminare la prenotazione confermata? Questa azione è irreversibile.',
    () => {
      deleteSystemReservation()
      confirmation.value = false
      reservationCode.value = ''
      resetBooking()
    },
    { primaryLabel: 'Elimina', variant: 'danger' },
  )
}

function handleDeleteConfirmedReservation() {
  openConfirmModal(
    'Elimina prenotazione',
    'Vuoi eliminare questa prenotazione?',
    () => { resetBooking(); confirmation.value = false },
    { primaryLabel: 'Elimina', variant: 'danger' },
  )
}

function scrollToForm() {
  document.querySelector('.request-form')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
  const draft = loadDraft()
  if (draft) { pendingDraft.value = draft; restorePrompt.value = true }
})
</script>

<template>
  <main class="reservation-page" :data-theme="theme">
    <template v-if="activeReservation && !isEditingSystemReservation">
      <section class="confirmed-page">
        <ReservationConfirm
          :confirmation="true"
          :reservationCode="activeReservation.code"
          :selectedDay="activeReservation.selectedDay"
          :booking="activeReservation"
          mode="system"
          :canEdit="systemReservationEditable"
          :canDelete="true"
          :cutoffLabel="systemReservationCutoffLabel"
          :locationName="activeReservation.locationName"
          :address="activeReservation.address"
          :mapUrl="activeReservation.mapUrl"
          @edit="beginEditSystemReservation"
          @delete="handleDeleteSystemReservation"
        />
      </section>
    </template>

    <template v-else>
      <section class="content-grid" id="prenotazione">
        <div class="booking-card">
          <div class="step-rail">
            <span
              v-for="step in STEP_LABELS" :key="step.step"
              class="step-pill"
              :class="{ active: currentStep === step.step, done: currentStep > step.step }"
            >{{ step.step }} · {{ step.label }}</span>
          </div>

          <template v-if="currentStep === 1">
            <ReservationCalendar v-model="selectedDateIso" @select="selectDay" @clear-selection="clearCalendarSelection">
              <template #footnote>
                <div class="calendar-footnote">
                  <p>Usa le frecce per cambiare mese o torna subito a oggi.</p>
                </div>
              </template>
            </ReservationCalendar>
            <div class="calendar-tip">Seleziona un giorno per passare al riepilogo e inserire i dati.</div>
          </template>

          <template v-else-if="currentStep === 2">
            <ReservationForm
              :booking="booking"
              :selectedDateIso="selectedDateIso"
              :selectedDay="selectedDay"
              :occasionOptions="OCCASION_OPTIONS"
              @submit="submitBooking"
              @back="backToCalendar"
            />
          </template>

          <template v-else>
            <ReservationConfirm
              :confirmation="confirmation"
              :reservationCode="reservationCode"
              :selectedDay="selectedDay"
              :booking="booking"
              mode="confirmed"
              :canEdit="true"
              :canDelete="true"
              @edit="editConfirmedReservation"
              @delete="handleDeleteConfirmedReservation"
            />
          </template>
        </div>

        <aside v-if="currentStep < 3" class="summary-card">
          <ResturantInfo
            :booking="booking"
            :selectedDay="selectedDay"
            :selectedDaySummary="selectedDaySummary"
            :windowPressure="windowPressure"
            :stepLabels="STEP_LABELS"
            @back-to-calendar="backToCalendar"
            @insert-data="scrollToForm"
            @reset="resetBooking"
          />
        </aside>
      </section>
    </template>

    <AppModal
      :open="modalState.open"
      :variant="modalState.variant"
      :title="modalState.title"
      :message="modalState.message"
      :primaryButtonLabel="modalState.primaryButtonLabel"
      :secondaryButtonLabel="modalState.secondaryButtonLabel"
      :showRiskOption="modalState.showRiskOption"
      :riskChecked="modalState.riskChecked"
      @close="closeModal"
      @secondary="closeModal"
      @confirm="handleModalConfirm"
      @confirm-risk="confirmRiskBooking"
      @update:riskChecked="setModalRiskChecked"
    />
  </main>
</template>