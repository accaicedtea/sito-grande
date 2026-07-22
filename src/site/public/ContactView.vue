<template>
  <main class="reservation-page" :data-theme="theme">
    <section class="content-grid">
      <div class="booking-card">
        <header class="events__hero">
          <div class="events__hero-content">
            <p class="eyebrow">Osteria Bruno</p>
            <h1 class="events__hero-title">Contatti</h1>
            <p class="events__hero-subtitle hero-text">
              Scrivici, chiamaci o vieni a trovarci: siamo qui per aiutarti a organizzare ogni momento con tranquillità.
            </p>
          </div>
        </header>

        <div class="gfx-card">
          <h2 class="gfx-card__title">Contatti rapidi</h2>
          <div class="gfx-card__body">
            <p class="hero-text">
              Puoi raggiungerci in modo semplice per prenotazioni, informazioni o qualsiasi richiesta speciale.
            </p>
            <div class="hero-actions" style="margin-top: 1rem; flex-direction: column; align-items: flex-start;">
              <a class="primary-link" href="tel:+390212345678">📞 +39 02 1234 5678</a>
              <a class="primary-link" href="mailto:info@lacorte.it">✉️ info@lacorte.it</a>
              <a class="primary-link" href="https://wa.me/390212345678" target="_blank" rel="noopener">💬 WhatsApp</a>
              <a class="primary-link" href="https://www.google.com/maps/search/?api=1&query=Via+Roma+12+Milano" target="_blank" rel="noopener">📍 Via Roma 12, 20100 Milano</a>
            </div>
          </div>
        </div>

        <div class="gfx-card">
          <h2 class="gfx-card__title">Come raggiungerci</h2>
          <div class="gfx-card__body">
            <iframe
              title="Mappa Ristorante La Corte"
              src="https://www.google.com/maps?q=Via+Roma+12+Milano&output=embed"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              style="width: 100%; min-height: 320px; border: 0; border-radius: 14px;"
            ></iframe>
          </div>
        </div>

        <div class="gfx-card">
          <h2 class="gfx-card__title">Domande frequenti</h2>
          <div class="gfx-card__body">
            <details class="contact-faq-item">
              <summary>Accettate gruppi numerosi?</summary>
              <p>Sì, per gruppi oltre le 8 persone ti consigliamo di chiamarci direttamente per organizzare al meglio la sala.</p>
            </details>
            <details class="contact-faq-item">
              <summary>C'è un parcheggio nelle vicinanze?</summary>
              <p>Sì, a 200 metri trovi un parcheggio pubblico convenzionato con tariffa oraria ridotta per i nostri clienti.</p>
            </details>
            <details class="contact-faq-item">
              <summary>Fate anche eventi privati?</summary>
              <p>Sì, organizziamo compleanni, cene aziendali e piccoli eventi su prenotazione. Contattaci per un preventivo.</p>
            </details>
          </div>
        </div>
      </div>

      <aside class="summary-card">
        <ResturantInfo />
      </aside>
    </section>
  </main>
</template>

<script setup>
import { theme } from '../../shared/theme/index.js'
import ResturantInfo from '../../components/reservation/ResturantInfo.vue'
</script>
