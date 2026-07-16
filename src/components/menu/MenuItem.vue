<template>
  <div class="menu-item d-flex justify-content-between border-bottom pb-3 mb-3">
    <div class="item-name">
      <div class="name fw-bold" v-html="cleanHtml(item.name)"></div>
      <div v-if="item.description" class="item-description text-muted fst-italic" v-html="cleanHtml(item.description)"></div>
      <div v-if="item.allergens" class="allergens d-flex gap-2 mt-2">
        <button 
          v-for="allergen in item.allergens" 
          :key="allergen" 
          class="allergen-icon-btn" 
          :title="allergen"
          @click="scrollToAllergen(allergen)"
        >
          <font-awesome-icon :icon="['fas', allergenIcon(allergen)]" />
        </button>
      </div>
    </div>
    <div class="item-price fw-bold fs-5 text-end">{{ formatPrice(item.price) }}</div>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { allergens } from '../../stores/menuStore.js';

defineProps({
  item: Object,
});

const allergenIcon = (allergen) => {
  // Controlla se allergens è caricato e è un array
  if (!allergens.value || !Array.isArray(allergens.value) || allergens.value.length === 0) {
    return 'question-circle';
  }
  const found = allergens.value.find(a => a && a.name === allergen);
  return found ? found.icon : 'question-circle';
};

// Funzione per formattare il prezzo aggiungendo € se manca
const formatPrice = (price) => {
  if (!price) return '';
  
  const priceStr = String(price);
  
  // Se il prezzo contiene già il simbolo €, lo restituisce così com'è
  if (priceStr.includes('€')) {
    return priceStr;
  }
  
  // Altrimenti aggiunge € all'inizio
  return `€${priceStr}`;
};

// Funzione per pulire i tag HTML dal testo
const cleanHtml = (text) => {
  if (!text) return '';
  
  // Converte i tag HTML comuni in testo formattato
  return text
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '<br>')
    .replace(/<br\s*\/?>/gi, '<br>')
    .replace(/<strong>/gi, '<strong>')
    .replace(/<\/strong>/gi, '</strong>')
    .replace(/<em>/gi, '<em>')
    .replace(/<\/em>/gi, '</em>')
    .replace(/<i>/gi, '<em>')
    .replace(/<\/i>/gi, '</em>')
    .replace(/<b>/gi, '<strong>')
    .replace(/<\/b>/gi, '</strong>')
    // Rimuove eventuali tag rimanenti non supportati
    .replace(/<[^>]*>/g, '');
};

// Funzione per scrollare alla sezione allergeni
const scrollToAllergen = (allergenName) => {
  const allergenSection = document.querySelector('.allergen-key');
  if (allergenSection) {
    allergenSection.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
    
    // Evidenzia brevemente l'allergene specifico
    const allergenItem = document.querySelector(`[data-allergen="${allergenName}"]`);
    if (allergenItem) {
      allergenItem.classList.add('highlight-allergen');
      setTimeout(() => {
        allergenItem.classList.remove('highlight-allergen');
      }, 2000);
    }
  }
};
</script>

<style>
.menu-item {
  border-bottom: 1px dashed var(--menu-item-border) !important;
  padding: 1rem 0.5rem;
  transition: box-shadow 0.3s, background 0.3s, border-color 0.3s, transform 0.3s;
}
.menu-item:hover {
  background: var(--menu-item-hover);
  transform: translateX(5px);
  border-bottom: 1px dashed var(--accent-color) !important;
}
.item-name .name {
  color: var(--item-name);
  letter-spacing: 1px;
  font-weight: 600;
  text-shadow: 1px 1px 1px rgba(81, 85, 62, 0.8);
}
.item-description {
  font-size: 0.95rem;
  color: var(--item-description) !important;
  font-style: italic;
  margin-top: 0.3rem;
}
.item-price {
  color: var(--item-price);
  min-width: 80px;
  font-weight: bold;
  font-size: 1.1rem;
  text-shadow: 1px 1px 1px rgba(100, 45, 45, 0.8);
}
.allergen-icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--allergen-circle-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  border: 2px solid var(--allergen-circle-border);
  transition: box-shadow 0.3s, background 0.3s, border-color 0.3s, transform 0.3s;
  color: var(--allergen-circle-color, var(--item-name));
  margin-right: 5px;
  cursor: pointer;
}
.allergen-icon-btn:hover {
  transform: scale(1.15);
  background: var(--allergen-circle-hover-bg, var(--accent-color));
  border-color: var(--allergen-circle-hover-border, var(--accent-color));
  color: var(--allergen-circle-hover-color, #fff);
  box-shadow: 0 0 10px var(--accent-color);
}

:global(.highlight-allergen) {
  animation: highlightPulse 2s ease-in-out;
  background-color: var(--highlight-bg) !important;
  color: var(--highlight-text) !important;
  border-radius: 8px !important;
  padding: 4px 8px !important;
}

@keyframes highlightPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}
</style>
