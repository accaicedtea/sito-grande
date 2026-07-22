<template>
  <main class="reservation-page" :data-theme="theme">
    <section class="content-grid">
      <div class="booking-card">
        <header class="events__hero">
          <div class="events__hero-content">
            <p class="eyebrow">Osteria Bruno</p>
            <h1 class="events__hero-title">Il luogo giusto per ogni occasione</h1>
            <p class="events__hero-subtitle hero-text">
              Dai pranzi informali alle cene più speciali, il nostro ristorante unisce menu curato, atmosfera accogliente e un servizio pensato per te.
            </p>
            <div class="hero-actions">
              <router-link class="primary-link" :to="{ name: 'prenota' }">Prenota un tavolo</router-link>
              <router-link class="primary-link" :to="{ name: 'menu' }">Scopri il menu</router-link>
            </div>
          </div>
        </header>

        <div class="gfx-card mb-3">
          <div class="gfx-card__body">
            <div class="home-carousel">
              <div class="home-carousel__header">
                <div>
                  <p class="eyebrow">In evidenza</p>
                  <h2 class="gfx-card__title">Scopri il nostro mondo</h2>
                </div>
                <div class="home-carousel__nav">
                  <button class="home-carousel__button" type="button" @click="prevSlide" aria-label="Slide precedente">‹</button>
                  <button class="home-carousel__button" type="button" @click="nextSlide" aria-label="Slide successiva">›</button>
                </div>
              </div>

              <div class="home-carousel__viewport">
                <transition name="home-slide" mode="out-in">
                  <div v-if="currentHighlight" :key="currentHighlight.title" class="home-carousel__card">
                    <div class="home-carousel__card-copy">
                      <p class="eyebrow">{{ currentHighlight.kicker }}</p>
                      <h3>{{ currentHighlight.title }}</h3>
                      <p>{{ currentHighlight.description }}</p>
                    </div>
                    <router-link class="primary-link" :to="{ name: currentHighlight.route }">{{ currentHighlight.cta }}</router-link>
                  </div>
                </transition>
              </div>

              <div class="home-carousel__dots" role="tablist" aria-label="Seleziona una sezione">
                <button
                  v-for="(item, index) in highlights"
                  :key="item.title"
                  class="home-carousel__dot"
                  :class="{ 'home-carousel__dot--active': index === currentSlide }"
                  type="button"
                  :aria-label="`Vai alla slide ${index + 1}`"
                  @click="currentSlide = index"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="gfx-card mb-3">
          <h2 class="gfx-card__title">Le occasioni perfette</h2>
          <div class="gfx-card__body">
            <div class="home-service-grid">
              <div class="home-service-card">
                <h3>Pranzo elegante</h3>
                <p>Un ambiente raffinato per pause di lavoro, incontri e momenti di relax.</p>
              </div>
              <div class="home-service-card">
                <h3>Cena romantica</h3>
                <p>Atmosfera intima, piatti curati e servizio discreto per ogni occasione.</p>
              </div>
              <div class="home-service-card">
                <h3>Eventi speciali</h3>
                <p>Compleanni, feste e serate private con una gestione attenta e personalizzata.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="gfx-card">
          <h2 class="gfx-card__title">Ti aspettiamo</h2>
          <div class="gfx-card__body">
            <p class="hero-text">
              Se vuoi vivere un momento in relax, scoprire i nostri piatti o organizzare una serata speciale, siamo pronti ad accoglierti.
            </p>
            <div class="hero-actions">
              <router-link class="primary-link" :to="{ name: 'prenota' }">Prenota ora</router-link>
              <router-link class="primary-link" :to="{ name: 'menu' }">Vedi il menu</router-link>
            </div>
          </div>
        </div>
      </div>

      <aside class="summary-card">
        <div class="gfx-card">
          <h2 class="gfx-card__title">Accesso rapido</h2>
          <div class="gfx-card__body">
            <div class="hero-actions" style="flex-direction: column; align-items: flex-start;">
              <router-link class="primary-link" :to="{ name: 'prenota' }">Prenotazione</router-link>
              <router-link class="primary-link" :to="{ name: 'menu' }">Menu</router-link>
              <router-link class="primary-link" :to="{ name: 'eventi' }">Eventi</router-link>
              <router-link class="primary-link" :to="{ name: 'contatti' }">Contatti</router-link>
            </div>
          </div>
        </div>

        <div class="gfx-card" style="margin-top: 1rem;">
          <h2 class="gfx-card__title">Orari & servizi</h2>
          <div class="gfx-card__body">
            <ul class="legend-list">
              <li class="legend-item">Lunedì – Domenica: 12:00 – 23:00</li>
              <li class="legend-item">Prenotazioni rapide anche online</li>
              <li class="legend-item">Servizio per cene private e gruppi</li>
            </ul>
          </div>
        </div>
      </aside>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { theme } from '../../shared/theme/index.js'

const highlights = [
  {
    kicker: 'Prenotazioni',
    title: 'Prenota il tuo tavolo in pochi secondi',
    description: 'Scegli giorno, orario e occasioni con un processo semplice e veloce.',
    cta: 'Vai alla prenotazione',
    route: 'prenota'
  },
  {
    kicker: 'Menu',
    title: 'Scopri i piatti del giorno e le specialità',
    description: 'Un menu pensato per stupire con gusto, qualità e cura dei dettagli.',
    cta: 'Apri il menu',
    route: 'menu'
  },
  {
    kicker: 'Eventi',
    title: 'Segui le serate e le iniziative speciali',
    description: 'Ti teniamo aggiornato su eventi, degustazioni e momenti da vivere in sala.',
    cta: 'Vedi gli eventi',
    route: 'eventi'
  }
]

const currentSlide = ref(0)
const currentHighlight = computed(() => highlights[currentSlide.value])

function prevSlide() {
  currentSlide.value = (currentSlide.value - 1 + highlights.length) % highlights.length
}

function nextSlide() {
  currentSlide.value = (currentSlide.value + 1) % highlights.length
}

let intervalId
onMounted(() => {
  intervalId = window.setInterval(nextSlide, 4500)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})
</script>
