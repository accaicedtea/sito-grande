<template>
  <header class="gfx-navbar" :data-theme="theme" ref="rootEl">
    <a class="gfx-navbar__brand" :href="brandHref">{{ brand }}</a>

    <button
      class="gfx-navbar__toggle"
      :class="{ 'is-open': open }"
      type="button"
      :aria-expanded="open ? 'true' : 'false'"
      aria-controls="gfx-navbar-panel"
      :aria-label="open ? 'Chiudi menu' : 'Apri menu'"
      @click="toggle"
    >
      <span class="gfx-navbar__bar"></span>
      <span class="gfx-navbar__bar"></span>
      <span class="gfx-navbar__bar"></span>
    </button>

    <nav
      id="gfx-navbar-panel"
      class="gfx-navbar__panel"
      :class="{ 'is-open': open }"
      aria-label="Navigazione principale"
    >
      <ul class="gfx-navbar__links">
        <li v-for="link in links" :key="link.href">
          <a
            class="gfx-navbar__link"
            :class="{ 'is-active': link.href === currentPath }"
            :href="link.href"
            @click="close"
          >{{ link.label }}</a>
        </li>
      </ul>

      <div class="gfx-navbar__extra">
        <div class="menu__theme-switcher" v-if="showThemeSwitcher" role="group" aria-label="Cambia stile">
          <button
            v-for="t in themes"
            :key="t.id"
            class="menu__theme-btn"
            :class="{ 'is-active': theme === t.id }"
            @click="theme = t.id"
          >{{ t.label }}</button>
        </div>

        <a v-if="ctaLabel" class="gfx-btn gfx-btn--primary gfx-btn--sm" :href="ctaHref" @click="close">
          {{ ctaLabel }}
        </a>

        <slot />
      </div>
    </nav>
  </header>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { theme, themes } from '../../shared/theme/index.js'

const props = defineProps({
  brand: { type: String, default: 'Osteria Bruno' },
  brandHref: { type: String, default: '/' },
  links: {
    type: Array,
    default: () => ([
      { label: 'Menu', href: '/menu' },
      { label: 'Eventi', href: '/eventi' },
      { label: 'Contatti', href: '/contatti' },
    ]),
  },
  ctaLabel: { type: String, default: 'Prenota' },
  ctaHref: { type: String, default: '/prenotazioni' },
  currentPath: { type: String, default: '' },
  showThemeSwitcher: { type: Boolean, default: true },
})

const open = ref(false)
const rootEl = ref(null)

function toggle() { open.value = !open.value }
function close() { open.value = false }

function onKeydown(e) {
  if (e.key === 'Escape') close()
}
function onClickOutside(e) {
  if (open.value && rootEl.value && !rootEl.value.contains(e.target)) close()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  document.addEventListener('click', onClickOutside)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.removeEventListener('click', onClickOutside)
  document.body.style.overflow = ''
})

/* blocca lo scroll della pagina mentre il pannello mobile è aperto */
watch(open, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})
</script>

