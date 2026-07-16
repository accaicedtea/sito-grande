<script setup>
import { computed } from 'vue'
import ResturantInfo from './ResturantInfo.vue'
const props = defineProps({
  confirmation:    { type: Boolean, required: true },
  reservationCode: { type: String,  required: false },
  selectedDay:     { type: Object,  required: false },
  booking:         { type: Object,  required: false },
  mode:            { type: String,  default: 'confirmed' }, // 'confirmed' | 'system'
  canEdit:         { type: Boolean, default: false },
  canDelete:       { type: Boolean, default: true },
  cutoffLabel:     { type: String,  required: false },
  locationName:    { type: String,  required: false },
  address:         { type: String,  required: false },
  mapUrl:          { type: String,  required: false },
})

const emit = defineEmits(['edit', 'delete'])

const mapsHref = computed(() => {
  if (props.mapUrl) return props.mapUrl
  const query = [
    props.locationName || 'Ristorante La Corte',
    props.address      || 'Via Roma 12, Milano',
  ].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
})

const dateLabel = computed(() => {
  if (!props.selectedDay) return '—'
  return `${props.selectedDay.weekday} ${props.selectedDay.dayNumber}`
})
</script>

<template>
  <section v-if="confirmation" class="confirmation-screen">

    <!-- ── Banner principale ─────────────────────────────────── -->
    <div
      class="confirmation-banner"
      :class="mode === 'system' ? 'confirmation-banner-system' : ''"
    >
      <!-- Testa: titolo + bottone mappa -->
      <div class="confirmation-banner-head">
        <div>
          <p class="eyebrow">Prenotazione confermata</p>
          <h3>{{ booking?.name || 'La tua prenotazione' }}</h3>
        </div>

        <a
          :href="mapsHref"
          class="primary-button confirmation-action confirmation-map-button"
          target="_blank"
          rel="noreferrer"
          aria-label="Apri il ristorante nelle mappe"
        >
          <svg class="map-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z"/>
          </svg>
          Apri nelle mappe
        </a>
      </div>

      <!-- Codice prenotazione -->
      <strong class="confirmation-code">{{ dateLabel }} · {{ booking?.time || '—' }}</strong>
      
      <!-- Azioni modifica / elimina -->
      <div class="confirmation-banner-actions">
        <button
          v-if="canEdit"
          type="button"
          class="ghost-button confirmation-action"
          @click="emit('edit')"
        >
          Modifica prenotazione
        </button>
        <button
          v-if="canDelete"
          type="button"
          class="danger-button confirmation-action"
          @click="emit('delete')"
        >
          Elimina prenotazione
        </button>
      </div>

      <!-- Nota finestra di modifica (solo mode system) -->
      <p v-if="mode === 'system' && !canEdit" class="confirmation-note">
        Modifica non consentita: la finestra si chiude a {{ cutoffLabel || "2 ore prima dell'arrivo" }}.
      </p>
      <p v-if="mode === 'system' && canEdit" class="confirmation-note">
        ✏️ Puoi modificare fino a {{ cutoffLabel }}.
      </p>
    </div>

    <!-- ── Griglia riepilogo ──────────────────────────────────── -->
    <div
      class="confirmation-summary"
      :class="mode === 'system' ? 'confirmation-summary-system' : ''"
    >
      <div>
        <span>Coperti</span>
        <strong>{{ booking?.guests ?? '—' }}</strong>
      </div>
      <div>
        <span>Occasione</span>
        <strong>{{ booking?.occasion || '—' }}</strong>
      </div>
      <div>
        <span>Codice</span>
        <strong>{{ reservationCode || '—' }}</strong>
      </div>
      <div v-if="mode !== 'system'">
        <span>Telefono</span>
        <strong>{{ booking?.phone || '—' }}</strong>
      </div>
      <div>
        <span>Note</span>
        <strong>{{ booking?.notes?.trim() || 'Nessuna nota' }}</strong>
      </div>
    </div>
  </section>

  <section class="separator"></section>

  <section>
    <ResturantInfo></ResturantInfo>
  </section>
</template>                       