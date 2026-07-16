<template>
  <button class="scroll-top-btn" @click="scrollToTop" aria-label="Torna su">
    <font-awesome-icon :icon="['fas', 'arrow-up']" />
  </button>
  <MenuHeader />
  <div class="menu-slide-container bg-light">
    <div v-if="selectedCategory" class="nav-header bg-dark">
      <h2 class="current-category-title">
        <font-awesome-icon :icon="['fas', currentCategoryData?.icon?.replace('fa-', '') || 'utensils']" />
        {{ currentCategoryData?.title }}
      </h2>
      <button @click="goBack" class="back-btn">
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
        <span>Indietro</span>
      </button>
    </div>

    <div v-if="isLoading" class="loading-container">
      <div class="spinner-border text-warning" role="status">
        <span class="visually-hidden">Caricamento menu...</span>
      </div>
      <p class="mt-3 text-warning">Caricamento menu...</p>
    </div>

    <div v-else class="content-container">
      <Transition name="slide-level" mode="out-in">
        <div v-if="!selectedCategory" key="categories" class="categories-level">
          <div class="categories-list">
            <div v-for="category in allCategories" :key="category.id" @click="selectCategory(category.id)" class="category-item">
              <div class="category-icon">
                <font-awesome-icon :icon="['fas', category.icon.replace('fa-', '')]" />
              </div>
              <div class="category-info">
                <h3 class="category-name">{{ category.title }}</h3>
                <p class="category-count">{{ getItemCount(category) }} elementi</p>
              </div>
              <div class="category-arrow">
                <font-awesome-icon :icon="['fas', 'chevron-right']" />
              </div>
            </div>
          </div>
        </div>

        <div v-else :key="selectedCategory" class="products-level">
          <div class="products-list">
            <MenuCategory :category="currentCategoryData" />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadAllMenuData, categoriesWithItems, isLoading } from '../../stores/menuStore.js'
import { getBackgroundConfig } from '../../shared/theme/index.js'
import MenuCategory from '../../components/menu/MenuCategory.vue'
import MenuHeader from '../../components/menu/MenuHeader.vue'

const selectedCategory = ref(null)
const allCategories = ref([])
const bgConfig = getBackgroundConfig()

const backgroundImage = computed(() => {
  if (!bgConfig.enabled) return 'none'
  if (bgConfig.showGrid) {
    return `url('./bg.webp'), linear-gradient(rgba(255, 255, 255, ${bgConfig.gridOpacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, ${bgConfig.gridOpacity}) 1px, transparent 1px)`
  }
  return `url('./bg.webp')`
})

const backgroundSize = computed(() => {
  if (!bgConfig.enabled) return 'auto'
  if (bgConfig.showGrid) {
    return `cover, ${bgConfig.gridSize}px ${bgConfig.gridSize}px, ${bgConfig.gridSize}px ${bgConfig.gridSize}px`
  }
  return 'cover'
})

const backgroundPosition = computed(() => {
  if (!bgConfig.enabled) return 'initial'
  if (bgConfig.showGrid) return 'center center, 0 0, 0 0'
  return 'center center'
})

const backgroundRepeat = computed(() => {
  if (!bgConfig.enabled) return 'initial'
  if (bgConfig.showGrid) return 'no-repeat, repeat, repeat'
  return 'no-repeat'
})

onMounted(async () => {
  await loadAllMenuData()
  allCategories.value = [...categoriesWithItems.value]
})

const currentCategoryData = computed(() => allCategories.value.find(cat => cat.id === selectedCategory.value))

function selectCategory(categoryId) {
  selectedCategory.value = categoryId
}

function goBack() {
  selectedCategory.value = null
}

function getItemCount(category) {
  return category.items?.length || 0
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.menu-slide-container {
  min-height: 100vh;
  position: relative;
  width: 100%;
  background-image: v-bind('backgroundImage');
  background-size: v-bind('backgroundSize');
  background-position: v-bind('backgroundPosition');
  background-repeat: v-bind('backgroundRepeat');
  -webkit-backdrop-filter: var(--view-container-backdrop, blur(8px) brightness(1.1) saturate(1.2));
  backdrop-filter: var(--view-container-backdrop, blur(8px) brightness(1.1) saturate(1.2));
  color: var(--view-container-color, #f9e9c3);
  padding: 1.5rem;
}

.menu-slide-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.menu-slide-container > * {
  position: relative;
  z-index: 2;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  gap: 1rem;
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--back-btn-bg, rgba(224, 143, 0, 0.15));
  border: 2px solid var(--back-btn-border, rgba(255, 196, 89, 0.3));
  border-radius: 8px;
  color: var(--view-container-color, #f9e9c3);
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: var(--back-btn-hover-bg, rgba(224, 143, 0, 0.3));
  border-color: var(--nav-link-active, #ffc459);
  transform: translateX(-2px);
}

.current-category-title {
  color: var(--header-title, #ffd980);
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
}

.content-container {
  min-height: 60vh;
  position: relative;
}

.categories-level,
.products-level {
  width: 100%;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--category-item-bg, rgba(61, 40, 18, 0.8));
  border-radius: 15px;
  border: 2px solid var(--category-border, rgba(255, 196, 89, 0.2));
  cursor: pointer;
  transition: box-shadow 0.4s, background 0.4s, border-color 0.4s, transform 0.4s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.category-item:hover {
  transform: translateX(10px) scale(1.02);
  border-color: var(--nav-link-active, #ffc459);
  box-shadow: 0 10px 25px rgba(255, 196, 89, 0.3);
  background: var(--nav-link-hover, rgba(224, 143, 0, 0.15));
}

.category-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: var(--category-icon-bg, linear-gradient(135deg, #e08f00, #ffc459));
  border-radius: 50%;
  color: var(--text-primary, #2c2c2c);
  font-size: 1.5rem;
  box-shadow: 0 5px 15px rgba(255, 196, 89, 0.3);
  flex-shrink: 0;
}

.category-info { flex-grow: 1; }
.category-name {
  color: var(--header-title, #ffd980);
  font-size: 1.3rem;
  font-weight: bold;
  margin: 0 0 0.25rem 0;
  letter-spacing: 1px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.category-count {
  color: var(--nav-link-active, #ffc459);
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.8;
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

</style>