<template>
  <div class="management-shell page-lg">
    <div class="page-header">
      <div>
        <small class="page-eyebrow">Panoramica</small>
        <h2 class="page-title">Pannello di controllo</h2>
      </div>
      <div class="page-actions">
        <button class="btn btn-ghost text-light btn-sm" @click="refresh">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
          Aggiorna
        </button>
      </div>
    </div>

    <!-- Due indicatori principali -->
    <div class="hero-row">
      <router-link to="/gestione/menu" class="hero-card">
        <div class="hero-card__icon" style="background:var(--accent-dim);color:var(--accent-text)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
          </svg>
        </div>
        <div class="hero-card__body">
          <span class="hero-card__label">Menu attivi</span>
          <span class="hero-card__value">{{ stats.menu }}</span>
        </div>
        <span class="hero-card__go">Gestisci →</span>
      </router-link>

      <router-link to="/gestione/prenotazioni" class="hero-card">
        <div class="hero-card__icon" style="background:var(--teal-dim);color:var(--teal-text)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <div class="hero-card__body">
          <span class="hero-card__label">Prenotazioni</span>
          <span class="hero-card__value">{{ stats.prenotazioni }}</span>
        </div>
        <span class="hero-card__go">Vedi tutte →</span>
      </router-link>
    </div>

    <!-- Griglia sezioni -->
    <div class="sections-grid">
      <router-link to="/gestione/prodotti" class="section-card" style="--accent-bar:var(--green)">
        <span class="section-card__icon">🍽️</span>
        <div class="section-card__info">
          <div class="section-card__title">Prodotti</div>
          <div class="section-card__stat">{{ stats.prodottiAttivi }} <small>attivi</small></div>
        </div>
      </router-link>

      <router-link to="/gestione/categorie" class="section-card" style="--accent-bar:var(--accent)">
        <span class="section-card__icon">📂</span>
        <div class="section-card__info">
          <div class="section-card__title">Categorie</div>
          <div class="section-card__stat">{{ stats.categorie }} <small>totali</small></div>
        </div>
      </router-link>

      <router-link to="/gestione/ingredienti" class="section-card" style="--accent-bar:var(--yellow)">
        <span class="section-card__icon">🧂</span>
        <div class="section-card__info">
          <div class="section-card__title">Ingredienti</div>
          <div class="section-card__stat">{{ stats.ingredienti }} <small>disponibili</small></div>
        </div>
      </router-link>

      <router-link to="/gestione/allergeni" class="section-card" style="--accent-bar:var(--red)">
        <span class="section-card__icon">⚠️</span>
        <div class="section-card__info">
          <div class="section-card__title">Allergeni</div>
          <div class="section-card__stat">{{ stats.allergeni }} <small>registrati</small></div>
        </div>
      </router-link>

      <router-link to="/gestione/eventi" class="section-card" style="--accent-bar:var(--teal)">
        <span class="section-card__icon">🎉</span>
        <div class="section-card__info">
          <div class="section-card__title">Eventi</div>
          <div class="section-card__stat">{{ stats.eventi }} <small>in programma</small></div>
        </div>
      </router-link>

      <router-link to="/gestione/promozioni" class="section-card" style="--accent-bar:var(--accent-light)">
        <span class="section-card__icon">🏷️</span>
        <div class="section-card__info">
          <div class="section-card__title">Promozioni</div>
          <div class="section-card__stat">{{ stats.promozioni }} <small>attive</small></div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({
  menu: 0,
  prodottiAttivi: 0,
  categorie: 0,
  ingredienti: 0,
  allergeni: 0,
  eventi: 0,
  prenotazioni: 0,
  promozioni: 0,
})

async function api(method, path) {
  const token = localStorage.getItem('admin_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch('/api' + path, { method, headers })
  return res.json()
}

async function loadStats() {
  try {
    const res = await api('GET', '/admin/dashboard')
    if (res && res.stats) {
      stats.value = {
        menu: res.stats.menuAttivi || 0,
        prodottiAttivi: res.stats.prodottiAttivi || 0,
        categorie: res.stats.categorie || 0,
        ingredienti: res.stats.ingredienti || 0,
        allergeni: res.stats.allergeni || 0,
        eventi: res.stats.eventi || 0,
        prenotazioni: res.stats.prenotazioni || 0,
        promozioni: res.stats.promozioniAttive || 0,
      }
    }
  } catch (e) {
    console.error('Errore statistiche', e)
  }
}

const refresh = () => loadStats()
onMounted(loadStats)
</script>

<style scoped>
.hero-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
  margin-bottom: 26px;
}

.hero-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 20px;
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  text-decoration: none;
  color: inherit;
  transition: transform var(--transition), border-color var(--transition), box-shadow var(--transition);
}

.hero-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-muted);
  box-shadow: var(--shadow);
}

.hero-card__icon {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.hero-card__label {
  font-size: 12px;
  color: var(--text-muted);
}

.hero-card__value {
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1;
}

.hero-card__go {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--accent-text);
  white-space: nowrap;
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 12px;
}

.section-card {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 17px 16px;
  border-radius: var(--radius);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent-bar, var(--accent));
  text-decoration: none;
  color: inherit;
  transition: transform var(--transition), border-color var(--transition);
}

.section-card:hover {
  transform: translateY(-1px);
  border-color: var(--border-muted);
  border-left-color: var(--accent-bar, var(--accent));
}

.section-card__icon {
  font-size: 24px;
  width: 34px;
  text-align: center;
  flex-shrink: 0;
}

.section-card__title {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 3px;
}

.section-card__stat {
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
}

.section-card__stat small {
  font-family: var(--font-sans);
  font-size: 10.5px;
  font-weight: 400;
  color: var(--text-muted);
}
</style>