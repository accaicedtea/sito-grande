<template>
  <div class="allergen-key" id="allergeni">
    <h3>Legenda Allergeni</h3>
    <div class="allergen-list">
      <div v-for="allergen in allergens" :key="allergen.name" class="allergen-item" :data-allergen="allergen.name">
        <div class="allergen-icon-lg">
          <font-awesome-icon :icon="['fas', allergen.icon]" />
        </div>
        <div>{{ allergen.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { allergens } from '../../stores/menuStore.js';
</script>

<style scoped>
.allergen-key {
  background: var(--allergen-bg);
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-heavy);
  border: 1px solid var(--allergen-border);
}

.allergen-key h3 {
  font: 700 1.8rem var(--font-family);
  text-align: center;
  color: var(--allergen-title);
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.allergen-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 1.2rem;
  justify-items: center;
}

.allergen-item {
  background: var(--allergen-item-bg);
  border-radius: 10px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--allergen-text);
  width: 100%;
  aspect-ratio: 1/1;
  transition: box-shadow 0.3s, background 0.3s, border-color 0.3s, transform 0.3s;
  box-shadow: var(--shadow-light);
  border: 1px solid rgba(212,180,131,0.3);
  font-weight: 600;
}

.allergen-item:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: var(--shadow-medium);
  background: var(--allergen-item-hover);
  border-color: var(--allergen-border);
}

.allergen-icon-lg {
  font-size: 2rem;
  margin-bottom: 0.75rem;
  color: var(--allergen-icon);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
}
</style>
