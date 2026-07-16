<template>
    <div class="menu" :data-theme="theme">
        <div class="menu__grain"></div>

        <header class="menu__hero">
            <p class="menu__kicker">Trattoria &amp; Osteria — Milano</p>
            <h1 class="menu__title-main">
                Bruno<span class="menu__title-sub">Cucina di famiglia dal 1962</span>
            </h1>
            <p class="menu__subtitle">Ricette tramandate, ingredienti di stagione, dal 1962.</p>
            <!-- SWITCHER LINGUA -->
            <div class="menu__lang-switcher" role="group" aria-label="Cambia lingua">
                <button v-for="lang in LANGUAGES" :key="lang.code" class="menu__lang-btn"
                    :class="{ 'is-active': selectedLang === lang.code }" :aria-pressed="selectedLang === lang.code"
                    :title="lang.label" @click="changeLang(lang.code)">
                    <span aria-hidden="true">{{ lang.flag }}</span>
                    <span class="menu__lang-code">{{ lang.code.toUpperCase() }}</span>
                </button>
            </div>
        </header>

        <!-- NOVITÀ -->
        <section class="menu__whatsnew" v-if="newItems.length" aria-label="Novità">
            <h3 class="menu__whatsnew-title">Novità</h3>
            <ul class="menu__whatsnew-list">
                <li class="menu__whatsnew-item" v-for="item in newItems" :key="item.id">
                    <span class="menu__whatsnew-name">{{ item.name }}</span>
                    <span class="menu__whatsnew-price">{{ formatPrice(item.prezzo) }}</span>
                </li>
            </ul>
        </section>

        <nav class="menu__nav" aria-label="Categorie del menu">
            <button class="menu__nav-btn" :class="{ 'is-active': selectedCategory === 'all' }"
                @click="selectedCategory = 'all'">Tutti</button>
            <button v-for="cat in categoriesWithItems" :key="cat.id" class="menu__nav-btn"
                :class="{ 'is-active': selectedCategory === cat.id }" @click="selectedCategory = cat.id">{{ cat.title
                }}</button>
        </nav>

        <main class="menu__main">

            <div v-if="isLoading" class="menu__state">Stiamo preparando il menu…</div>
            <div v-else-if="error" class="menu__state">
                <p>Si è verificato un problema: {{ error }}</p>
            </div>
            <div v-else-if="!visibleCategories.length" class="menu__state">Il menu non è disponibile.</div>
            <TransitionGroup v-else name="cat-fade" tag="div" class="menu__categories">
                <section v-for="cat in visibleCategories" :key="cat.id" :id="cat.id" class="menu__category"
                    :style="theme === 'poster' ? { '--cat-accent': colorFor(catIndex(cat.id)) } : {}">
                    <div class="menu__category-head">
                        <span class="menu__category-eyebrow">Set {{ String(catIndex(cat.id) + 1).padStart(2, '0')
                        }}</span>
                        <h2 class="menu__category-title">{{ cat.title }}</h2>
                        <span class="menu__category-meta">{{ cat.items.length }} {{ cat.items.length === 1 ? 'piatto' :
                            'piatti' }}</span>
                    </div>

                    <ul class="menu__items">
                        <li v-for="(item, i) in cat.items" :key="item.id" class="menu__item"
                            :style="{ animationDelay: (i % 6) * 55 + 'ms' }">
                            <div class="menu__item-row">
                                <span class="menu__item-badge" v-if="item.in_evidenza">In evidenza</span>
                                <span class="menu__item-name">{{ item.name }}</span>
                                <span class="menu__item-leader" aria-hidden="true"></span>
                                <span class="menu__item-price">{{ formatPrice(item.prezzo) }}</span>
                            </div>

                            <p class="menu__item-desc" v-if="item.description">{{ item.description }}</p>

                            <div class="menu__item-tags"
                                v-if="dishTags(item).length || item.piccante_livello || (item.allergens && item.allergens.length) || item.note">
                                <span class="menu__tag" v-for="t in dishTags(item)" :key="t">{{ t }}</span>
                                <span class="menu__tag menu__tag--spicy" v-if="item.piccante_livello">
                                    {{ 'PICCANTE ' + '●'.repeat(Math.min(item.piccante_livello, 3)) }}
                                </span>
                                <span class="menu__allergens" v-if="item.allergens && item.allergens.length">
                                    <span class="menu__allergens-label">Allergeni:</span>
                                    <span class="menu__allergen" v-for="a in item.allergens" :key="a.id"
                                        :title="a.nome">{{ abbreviate(a.nome) }}</span>
                                </span>
                                <span class="menu__item-note" v-if="item.note">{{ item.note }}</span>
                            </div>
                        </li>
                    </ul>
                </section>
            </TransitionGroup>
        </main>


        <!-- LEGENDA ALLERGENI -->
        <section class="menu__allergen-key" id="allergeni" v-if="allergens.length">
            <h3 class="menu__allergen-key-title">Legenda Allergeni</h3>
            <div class="menu__allergen-key-list">
                <div class="menu__allergen-key-item" v-for="a in allergens" :key="a.id" :data-allergen="a.name">
                    <div class="menu__allergen-key-icon">{{ a.icon }}</div>
                    <div class="menu__allergen-key-label">{{ a.name }}</div>
                </div>
            </div>
        </section>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { theme } from '../../shared/theme/index.js'
import { loadAllMenuData, categoriesWithItems, isLoading, error, allergens, currentLang } from '../../stores/menuStore.js'

const selectedCategory = ref('all')
const selectedLang = ref(currentLang.value || 'it')

const LANGUAGES = [
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
  { code: 'zh', label: '中文',      flag: '🇨🇳' },
]

async function changeLang(code) {
  if (code === selectedLang.value) return
  selectedLang.value = code
  const prevCategory = selectedCategory.value   
  selectedCategory.value = 'all'
  await loadAllMenuData('menu-principale', code)
  if (prevCategory !== 'all' && categoriesWithItems.value.some(c => c.id === prevCategory)) {
    selectedCategory.value = prevCategory
  }
}

onMounted(async () => {
  await loadAllMenuData('menu-principale', selectedLang.value)
})

const visibleCategories = computed(() => {
  if (selectedCategory.value === 'all') return categoriesWithItems.value
  return categoriesWithItems.value.filter(cat => cat.id === selectedCategory.value)
})

const newItems = computed(() => {
  return categoriesWithItems.value
    .flatMap(cat => cat.items)
    .filter(item => item.novita || item.is_new)
})

function catIndex(id) {
  return categoriesWithItems.value.findIndex(c => c.id === id)
}

const PALETTE = ['#e4572e', '#74822c', '#e8a33d', '#2b6e6b', '#7b3f61', '#2c4a7c']
function colorFor(idx) {
  return PALETTE[((idx % PALETTE.length) + PALETTE.length) % PALETTE.length]
}

function formatPrice(prezzo) {
  const n = Number(prezzo)
  if (Number.isNaN(n)) return '—'
  return (n % 1 === 0 ? n.toFixed(0) : n.toFixed(2).replace('.', ',')) + ' €'
}

function dishTags(item) {
  const tags = []
  if (item.vegan) tags.push('Vegan')
  else if (item.vegetariano) tags.push('Veg')
  if (item.senzaGlutine) tags.push('Senza glutine')
  if (item.biologico) tags.push('Bio')
  return tags
}

function abbreviate(name) {
  return name.replace(/[^\p{L}]/gu, '').slice(0, 3).toUpperCase()
}
</script>