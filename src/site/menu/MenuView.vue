<template>
  <button class="scroll-top-btn" @click="scrollToTop" aria-label="Torna su">
    <font-awesome-icon :icon="['fas', 'arrow-up']" />
  </button>
  <div class="menu-container">
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-warning" role="status">
        <span class="visually-hidden">Caricamento menu...</span>
      </div>
      <p class="mt-3 text-warning">Caricamento menu dalle API...</p>
    </div>

    <div v-else>
      <MenuHeader />
      <MenuNav :active-category="selectedCategory" @select-category="handleSelectCategory" />
      <Divider />
      <MenuCategory
        v-for="category in categoriesWithItems"
        :key="category.id"
        :category="category"
      />
      <Divider />
      <AllergenKey />
      <MenuFooter />
      <Divider />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import MenuHeader from '../../components/menu/MenuHeader.vue'
import MenuNav from '../../components/menu/MenuNav.vue'
import MenuCategory from '../../components/menu/MenuCategory.vue'
import AllergenKey from '../../components/menu/AllergenKey.vue'
import MenuFooter from '../../components/menu/MenuFooter.vue'
import Divider from '../../components/utils/Divider.vue'
import { loadAllMenuData, categoriesWithItems, isLoading } from '../../stores/menuStore.js'

const selectedCategory = ref('all')

onMounted(async () => {
  await loadAllMenuData('menu-principale', 'it')
})

function handleSelectCategory(catId) {
  selectedCategory.value = catId
  nextTick(() => {
    const el = document.getElementById(catId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  })
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.menu-container {
  min-height: 100vh;
  position: relative;
  width: 100%;
  background-image: v-bind('backgroundImage');
  background-size: v-bind('backgroundSize');
  background-position: v-bind('backgroundPosition');
  background-repeat: v-bind('backgroundRepeat');
  padding: 1.5rem;
}

.category {
  scroll-margin-top: 190px;
}

.scroll-top-btn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
  background: var(--scroll-btn-bg, linear-gradient(135deg, #e08f00, #ffc459));
  color: var(--scroll-btn-color, #2c2c2c);
  border: none;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px var(--scroll-btn-shadow, rgba(255, 196, 89, 0.4));
}

.scroll-top-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px var(--scroll-btn-shadow, rgba(255, 196, 89, 0.6));
}

@media (max-width: 768px) {
  .menu-container {
    padding: 1rem;
  }

  .scroll-top-btn {
    width: 45px;
    height: 45px;
    right: 15px;
    bottom: 15px;
  }
}
</style>