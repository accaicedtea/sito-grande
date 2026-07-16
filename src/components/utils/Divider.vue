<template>
  <div class="divider" :style="customStyles"></div>
</template>

<script setup>
import { computed } from 'vue';

// Props per personalizzazione opzionale
const props = defineProps({
  // Altezza personalizzata (default gestita dal CSS del tema)
  height: {
    type: String,
    default: null
  },
  // Margine personalizzato
  margin: {
    type: String,
    default: null
  },
  // Opacità personalizzata
  opacity: {
    type: Number,
    default: null
  }
});

// Stili custom opzionali
const customStyles = computed(() => {
  const styles = {};
  
  if (props.height) {
    styles.height = props.height;
  }
  
  if (props.margin) {
    styles.margin = props.margin;
  }
  
  if (props.opacity !== null) {
    styles.opacity = props.opacity;
  }
  
  return styles;
});
</script>

<style scoped>
.divider {
  background: var(--divider-bg);
  border-color: var(--divider-border);
}

.divider {
  height: 2px;
  width: 100%;
  margin: 1.5rem 0;
  border-radius: 1px;
  /* Lo styling del colore e background viene dal tema CSS */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .divider {
    margin: 1rem 0;
    height: 1.5px;
  }
}

@media (max-width: 480px) {
  .divider {
    margin: 0.75rem 0;
    height: 1px;
  }
}
</style>