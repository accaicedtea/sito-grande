<script setup>
import { ref, onMounted } from 'vue'
import { useReservationStore } from '../../composables/useReservationStore.js'

defineProps({
  selectedDay: { type: Object, default: null },
})

defineEmits(['resume', 'discard', 'back-to-calendar'])

const {
  store,
  isDraft,
  isConfirmed,
  hasPendingData,
  orderCardMode: storeOrderCardMode,
  selectedDaySummary,
  initializeFromStorage,
} = useReservationStore()

const isOpen = ref(true)

onMounted(() => {
  initializeFromStorage()
})

const closeCard = () => {
  isOpen.value = false
}

const reopenCard = () => {
  isOpen.value = true
}

// Determine what to show
const shouldShowCard = () => {
  return storeOrderCardMode.value !== 'none' && isOpen.value
}

const shouldShowToggle = () => {
  return storeOrderCardMode.value !== 'none' && !isOpen.value
}

</script>

<template>
  <div v-if="shouldShowCard()" class="order-card-wrapper">
    <section class="order-card order-card-compact" :class="`order-card-${storeOrderCardMode}`">
      <div class="order-card-content">
        <div class="order-card-info">
          <strong v-if="isDraft">Ordine sospeso</strong>
          <strong v-else-if="isConfirmed">Prenotazione confermata</strong>
          <strong v-else>{{ selectedDaySummary }}</strong>
          <span v-if="isConfirmed" class="order-card-meta">
            Codice: {{ store.code }}
          </span>
          <span v-else-if="store.selectedDay" class="order-card-meta">
            {{ store.selectedDay.weekday }} {{ store.selectedDay.dayNumber }} · {{ store.guests }} ospiti
          </span>
        </div>
        <button type="button" class="order-card-close" @click="closeCard" aria-label="Chiudi">✕</button>
      </div>
      <div class="order-card-actions">
        <button v-if="isDraft" type="button" class="action-btn primary" @click="$emit('resume')">Riprendi</button>
        <button v-if="isDraft" type="button" class="action-btn secondary" @click="$emit('discard')">Nuova</button>
        <button v-if="isConfirmed" type="button" class="action-btn secondary" @click="$emit('back-to-calendar')">Modifica</button>
      </div>
    </section>
  </div>
  <button v-else-if="shouldShowToggle()" type="button" class="order-card-toggle" @click="reopenCard" aria-label="Mostra ordine">
    <img src="/notification-4.svg" alt="Mostra ordine" class="order-card-icon" />
  </button>
</template>