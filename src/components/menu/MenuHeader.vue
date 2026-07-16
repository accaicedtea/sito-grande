<template>
  <div class="header text-center text-white p-5">
    <h1 class="display-3">Kirby's menù</h1>

    <!-- Bootstrap 5 Carousel -->
    <div id="menuCarousel" class="d-none carousel slide mt-2" data-bs-ride="carousel">
      <div class="carousel-inner">
        <div v-for="(item, idx) in carouselItems" :key="idx" :class="['carousel-item', { active: idx === 0 }]">
          <img :src="item.image" class="d-block w-100" :alt="item.caption">
          <div class="carousel-caption d-none d-md-block">
            <h5>{{ item.caption }}</h5>
            <p>{{ item.description }}</p>
          </div>
        </div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#menuCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#menuCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const carouselItems = ref([
  {
    caption: 'Birra Artigianale',
    description: 'Scopri la nostra selezione di birre artigianali.'
  },
  {
    caption: 'Specialità della Casa',
    description: 'Piatti tipici preparati con ingredienti freschi.'
  }
]);

</script>

<style scoped>
/* MenuHeader Styles */
.header {
  background: --accent-color;
  font-family: var(--font-family);
  position: relative;
  padding: 3rem 1rem;
  border-bottom: 3px solid var(--header-border);
  box-shadow: var(--shadow-heavy);
  color: var(--header-text);
}

.header h1 {
  font-family: 'Rye', serif;
  color: var(--header-title);
  font-size: 3rem;
  font-weight: normal;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 10px rgba(212, 180, 131, 0.4);
  margin-bottom: 1rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.header p {
  color: var(--header-text);
  font-family: var(--font-family);
  font-size: 1.2rem;
  margin: 0.25rem 0;
  letter-spacing: 1px;
  opacity: 0.9;
}

</style>