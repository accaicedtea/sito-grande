<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  open:                { type: Boolean, required: true },
  title:               { type: String,  required: true },
  message:             { type: String,  required: true },
  variant:             { type: String,  default: 'default' }, // 'default' | 'danger'
  primaryButtonLabel:  { type: String,  default: 'Conferma' },
  secondaryButtonLabel:{ type: String,  default: '' },
  showRiskOption:      { type: Boolean, default: false },
  riskChecked:         { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'secondary', 'confirm', 'confirm-risk', 'update:riskChecked'])

function onClose()     { emit('close') }
function onSecondary() { emit('secondary') }
function onConfirmRisk() { emit('confirm-risk') }

function onPrimary() {
  if (props.showRiskOption) { onConfirmRisk(); return }
  emit('confirm')
  onClose()
}

function onKey(e) {
  if (props.open && e.key === 'Escape') onClose()
}

function updateRiskChecked(e) {
  emit('update:riskChecked', e.target.checked)
}

onMounted(()       => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="open"
        class="modal-backdrop"
        role="presentation"
        @click.self="onClose"
      >
        <div
          class="modal-sheet"
          role="dialog"
          aria-modal="true"
          :aria-label="title"
        >
          <!-- Header -->
          <div class="modal-header">
            <div class="modal-icon" :class="`modal-icon-${variant}`">
              <!-- Info icon -->
              <svg v-if="variant === 'default'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <!-- Danger icon -->
              <svg v-else-if="variant === 'danger'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              <!-- Warning icon -->
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>

            <button type="button" class="modal-close" @click="onClose" aria-label="Chiudi">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <h3 class="modal-title">{{ title }}</h3>
            <p class="modal-message">{{ message }}</p>

            <label v-if="showRiskOption" class="modal-risk-option">
              <input type="checkbox" :checked="riskChecked" @change="updateRiskChecked" />
              <span>Spunta il rischio: se si libera un posto ti inviamo un SMS di conferma</span>
            </label>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button
              v-if="secondaryButtonLabel"
              type="button"
              class="ghost-button modal-btn"
              @click="onSecondary"
            >
              {{ secondaryButtonLabel }}
            </button>
            <button
              type="button"
              class="modal-btn modal-btn-primary"
              :class="variant === 'danger' ? 'danger-button' : 'primary-button'"
              :disabled="showRiskOption && !riskChecked"
              @click="onPrimary"
            >
              {{ primaryButtonLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>