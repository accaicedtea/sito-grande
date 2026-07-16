<template>
  <footer class="footer" :data-theme="theme">
    <p class="footer__stub">Admit One</p>
    <div class="footer__grid">
      <div>
        <p class="footer__label">Indirizzo</p>
        <p>Via delle Botteghe Oscure 14, Milano</p>
      </div>
      <div>
        <p class="footer__label">Orari</p>
        <p>Mar–Dom, 12:30–15:00 · 19:30–23:00</p>
      </div>
      <div>
        <p class="footer__label">Prenotazioni</p>
        <p>02 1234 5678</p>
      </div>
    </div>
    <p class="footer__note">I prezzi sono espressi in euro, IVA inclusa</p>
  </footer>
</template>

<script setup>
import { theme } from '../../shared/theme/index.js'
</script>