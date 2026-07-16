<template>
  <div class="footer text-center p-4 mt-5">
    <p>Il menu potrebbe subire variazioni. Informate il personale di eventuali allergie o intolleranze.</p>
    <p>Servizio al tavolo - Tutti i prezzi includono IVA</p>
  </div>
</template>

<script setup>

</script>

<style scoped>

.footer {
  background: var(--footer-bg);
  border-top: 5px solid var(--footer-border);
  font-size: 0.95rem;
  color: var(--footer-text);
  padding: 1.5rem !important;
  border-radius: 0 0 10px 10px;
  box-shadow: var(--shadow-light);
}

.footer p:first-child {
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}
</style>