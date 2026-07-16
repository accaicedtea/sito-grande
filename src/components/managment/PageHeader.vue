<template>
  <div class="page-header">
    <div>
      <small class="page-subtitle">{{ subtitle }}</small>
      <h1 class="page-title">{{ title }}</h1>
    </div>
    <div class="page-actions">
      <!-- Slot sinistro (es. filtri) -->
      <slot name="actions-left" />

      <!-- Pulsante Indietro -->
      <button
        v-if="backTo"
        class="btn btn-secondary"
        @click="goBack"
        title="Torna indietro"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Indietro
      </button>

      <!-- Slot per azioni specifiche (es. "Nuovo menu") -->
      <slot name="actions" />

      <!-- Pulsante Aggiorna -->
      <button
        v-if="showRefresh"
        class="btn btn-ghost btn-sm btn-icon"
        @click="$emit('refresh')"
        title="Aggiorna"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  backTo: { type: [String, Object], default: null },
  showRefresh: { type: Boolean, default: true }
})

defineEmits(['refresh'])

const router = useRouter()
const goBack = () => {
  if (props.backTo) router.push(props.backTo)
  else router.back()
}
</script>