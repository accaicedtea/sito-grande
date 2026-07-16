<template>
  <div class="category mb-5" :id="category.id">
    <h2 class="category-title text-center mb-4"><font-awesome-icon :icon="['fas', category.icon.replace('fa-', '')]" /> {{ category.title }}</h2>
    
    <div v-if="category.isSpecial">
        <div v-for="(item, index) in category.items" :key="index" class="menu-highlight mb-4">
            <div class="name text-center h4">{{ item.name }}</div>
            <div class="item-description" v-html="item.description"></div>
            <div v-if="item.note" class="menu-note mt-3">{{ item.note }}</div>
            <div v-if="item.price" class="item-price text-center h5 mt-3">{{ item.price }}</div>
            <div v-if="item.subItems" class="menu-items mt-3">
                <MenuItem v-for="(subItem, subIndex) in item.subItems" :key="subIndex" :item="subItem" />
            </div>
        </div>
    </div>

    <div v-else class="menu-items">
      <MenuItem v-for="(item, index) in category.items" :key="index" :item="item" />
    </div>

    <div v-if="category.note" class="sauces-note mt-4 p-3">
      <strong>{{ category.note }}</strong>
    </div>
  </div>
</template>

<script setup>
import MenuItem from './MenuItem.vue';

defineProps({
  category: Object,
});
</script>

<style scoped>
.category {
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: var(--category-bg);
  border-radius: 10px;
  border: 1px solid var(--category-border);
  transition: box-shadow 0.3s, background 0.3s, border-color 0.3s, transform 0.3s;
}

.category:hover {
  transform: translateY(-5px);
  border-color: var(--accent-color);
  background: var(--category-hover-bg);
}

.category-title {
  font: 700 1.2rem var(--font-family);
  color: var(--category-title);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 3px double var(--accent-color);
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0px 1px 2px rgba(87, 235, 136, 0.507);
}

.sauces-note, .menu-note {
  background: var(--category-note-bg);
  color: var(--category-title);
  border-radius: 0 5px 5px 0;
  box-shadow: var(--shadow-light);
  margin-top: 1.5rem;
}
.sauces-note {
  font-style: italic;
  border-left: 4px solid var(--accent-color);
  padding: 1rem;
}
.menu-note {
  font-size: 0.95rem;
  border-left: 3px solid var(--category-title);
  padding: 12px;
  margin-top: 1rem;
  border-radius: 5px;
}

.menu-highlight {
  background: var(--menu-highlight-bg);
  padding: 20px;
  border: 1px solid var(--accent-color);
  border-radius: 8px;
  box-shadow: var(--shadow-light);
  margin-bottom: 1.5rem;
}
.menu-highlight .name {
  font-size: 1.3rem;
  color: var(--category-title);
  margin-bottom: 10px;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
}
</style>
