<template>
  <div class="management-shell page-md">
<div class="page-header">
  <div>
    <small class="text-accent" style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:.2em;display:block;margin-bottom:2px">MENU</small>
    <h1 class="page-title">I tuoi menu</h1>
    
    <!-- Contenitore flessibile per i due pulsanti -->
    <div class="mb-3" style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
      <button class="btn text-white btn-primary" @click="$router.back()" title="Torna indietro">
        <!-- Icona freccia sinistra (SVG) -->
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Indietro
      </button>

      <button class="btn text-white" @click="fetchData" title="Aggiorna">
        Aggiorna 
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 4px;">
          <polyline points="23 4 23 10 17 10" />
          <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
        </svg>
      </button>
    </div>
  </div>
</div>

    <!-- Toast elegante (sostituisce il vecchio alert) -->
    <div class="toast-container" aria-live="polite">
      <transition name="toast-fade">
        <div v-if="msg" class="toast" :class="msgType === 'success' ? 'toast--success' : 'toast--error'">
          <div class="toast__icon">
            <svg v-if="msgType === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          </div>
          <div class="toast__content">
            <span class="toast__message">{{ msg }}</span>
          </div>
          <button class="toast__close" @click="msg = ''">✕</button>
        </div>
      </transition>
    </div>

    <!-- Barra delle statistiche -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-value">{{ list.length }}</span>
        <span class="stat-label">Totali</span>
      </div>
      <div class="stat-item">
        <span class="stat-value" style="color: var(--green-text)">{{ list.filter(m => m.attivo).length }}</span>
        <span class="stat-label">Attivi</span>
      </div>
      <div class="stat-item">
        <span class="stat-value" style="color: var(--yellow-text)">{{ totalScans }}</span>
        <span class="stat-label">Scansioni</span>
      </div>
    </div>

    <!-- Pannello creazione nuovo menu -->
    <div v-if="creating" class="inline-editor-panel">
      <div class="inline-editor-panel__header">
        <span class="inline-editor-panel__title">Nuovo menu</span>
        <button class="btn btn-ghost btn-sm btn-icon" @click="cancelCreate">✕</button>
      </div>
      <div class="inline-editor-panel__body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Nome <span style="color:var(--red-text)">*</span></label>
            <input v-model="newForm.nome" class="form-control" required placeholder="Es. Menu principale" />
          </div>
          <div class="form-group">
            <label class="form-label">Slug <span style="color:var(--red-text)">*</span></label>
            <input v-model="newForm.slug" class="form-control" required placeholder="menu-principale" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Descrizione</label>
          <textarea v-model="newForm.descrizione" class="form-control" rows="2" placeholder="Breve descrizione"></textarea>
        </div>
        <div class="form-group" style="margin-bottom:0">
          <label class="form-check" style="background:var(--bg-raised);border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px;cursor:pointer">
            <input type="checkbox" class="form-check-input" v-model="newForm.attivo" />
            <span class="form-check-label">Menu attivo</span>
          </label>
        </div>
      </div>
      <div class="inline-editor-panel__footer">
        <button class="btn btn-ghost btn-sm" @click="cancelCreate">Annulla</button>
        <button class="btn btn-primary btn-sm" @click="submitCreate" :disabled="saving">Crea menu</button>
      </div>
    </div>

    <!-- Griglia menu -->
    <div class="menu-grid">
      <div v-for="m in list" :key="m.id" class="menu-card" :class="{ 'menu-card--inactive': !m.attivo, 'menu-card--editing': editingId === m.id }">
        <!-- Card normale -->
        <template v-if="editingId !== m.id">
          <div class="menu-card__header">
            <h3 class="menu-card__title">{{ m.nome }}</h3>
            <span class="badge" :class="m.attivo ? 'badge-green' : 'badge-red'">{{ m.attivo ? 'Attivo' : 'Inattivo' }}</span>
          </div>
          <div class="menu-card__body">
            <div class="menu-card__slug">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
              <span>{{ m.slug }}</span>
            </div>
            <p class="menu-card__desc" v-if="m.descrizione">{{ m.descrizione }}</p>
          </div>
          <div class="menu-card__actions">
            <button class="btn btn-primary btn-sm menu-card__qr-button" @click="toggleQr(m)" title="QR Code">
              <span>Scarica QR code</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>
            </button>
            <!-- 
            TODO: non disponibile per versione normale
            <button class="btn btn-ghost btn-sm btn-icon" @click="startEdit(m)" title="Modifica">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button> -->
          </div>

          <!-- QR overlay -->
          <div v-if="qrVisibleId === m.id" class="qr-overlay" @click.self="qrVisibleId = null">
            <div class="qr-overlay__inner">
              <img :src="qrUrlFor(m)" class="qr-overlay__image" @click.stop />
              <div class="qr-overlay__info">
                <span class="qr-overlay__scansioni">{{ m.qr_scansioni || 0 }} scansioni</span>
              </div>
              <button class="btn btn-primary btn-sm" @click.stop="downloadStyledQr(m)">
                🎨 Scarica QR personalizzato (SVG)
              </button>
              <button class="qr-overlay__close" @click="qrVisibleId = null">✕</button>
            </div>
          </div>
        </template>

        <!-- Card in modifica -->
        <template v-else>
          <div class="inline-editor-card">
            <div class="inline-editor-card__header">
              <span class="inline-editor-card__title">Modifica menu</span>
              <button class="btn btn-ghost btn-sm btn-icon" @click="cancelEdit">✕</button>
            </div>
            <div class="inline-editor-card__body">
              <div class="form-group">
                <label class="form-label">Nome <span style="color:var(--red-text)">*</span></label>
                <input v-model="editForm.nome" class="form-control" required />
              </div>
              <div class="form-group">
                <label class="form-label">Slug <span style="color:var(--red-text)">*</span></label>
                <input v-model="editForm.slug" class="form-control" required />
              </div>
              <div class="form-group">
                <label class="form-label">Descrizione</label>
                <textarea v-model="editForm.descrizione" class="form-control" rows="2"></textarea>
              </div>
              <div class="form-group" style="margin-bottom:0">
                <label class="form-check" style="background:var(--bg-raised);border:1px solid var(--border);border-radius:var(--radius);padding:10px 14px;cursor:pointer">
                  <input type="checkbox" class="form-check-input" v-model="editForm.attivo" />
                  <span class="form-check-label">Menu attivo</span>
                </label>
              </div>
            </div>
            <div class="inline-editor-card__footer">
              <button class="btn btn-ghost btn-sm" @click="cancelEdit">Annulla</button>
              <button class="btn btn-primary btn-sm" @click="submitEdit(m.id)" :disabled="saving">Salva</button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Stato vuoto -->
    <div v-if="!list.length && !creating" class="empty-state" style="margin-top:20px">
      <span style="font-size:36px">📋</span>
      <span>Nessun menu creato</span>
      <button class="btn btn-primary btn-sm" @click="startNewMenu">Crea il primo</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const list = ref([])
const msg = ref('')
const msgType = ref('success')
const creating = ref(false)
const editingId = ref(null)
const saving = ref(false)
const qrVisibleId = ref(null)

const newForm = ref({ nome: '', slug: '', descrizione: '', attivo: true })
const editForm = ref({ nome: '', slug: '', descrizione: '', attivo: true })

const publicBaseUrl = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin

function qrUrlFor(menu) {
  const url = `${publicBaseUrl}/menu/${menu.slug}`
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`
}

const totalScans = computed(() => list.value.reduce((sum, m) => sum + (m.qr_scansioni || 0), 0))

// Toast auto-dismissione
watch(msg, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      msg.value = ''
    }, 4000)
  }
})

// API helper
async function api(m, p, b) {
  const token = localStorage.getItem('admin_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const opts = { method: m, headers }
  if (b) opts.body = JSON.stringify(b)
  return (await fetch('/api' + p, opts)).json()
}

async function fetchData() {
  const r = await api('GET', '/admin/menu')
  if (r?.data) list.value = r.data
}

// --- Nuovo menu inline ---
function startNewMenu() {
  newForm.value = { nome: '', slug: '', descrizione: '', attivo: true }
  creating.value = true
}
function cancelCreate() {
  creating.value = false
}
async function submitCreate() {
  if (!newForm.value.nome.trim() || !newForm.value.slug.trim()) return
  saving.value = true
  const payload = { ...newForm.value, attivo: newForm.value.attivo ? 1 : 0 }
  const r = await api('POST', '/admin/menu', payload)
  saving.value = false
  if (r?.ok) {
    creating.value = false
    await fetchData()
    msg.value = 'Menu creato'
    msgType.value = 'success'
  } else {
    msg.value = r?.messages?.nome || r?.message || 'Errore durante la creazione'
    msgType.value = 'danger'
  }
}

// --- Modifica menu inline ---
function startEdit(menu) {
  editingId.value = menu.id
  editForm.value = {
    nome: menu.nome,
    slug: menu.slug,
    descrizione: menu.descrizione || '',
    attivo: !!menu.attivo
  }
}
function cancelEdit() {
  editingId.value = null
}
async function submitEdit(id) {
  if (!editForm.value.nome.trim() || !editForm.value.slug.trim()) return
  saving.value = true
  const payload = { ...editForm.value, attivo: editForm.value.attivo ? 1 : 0 }
  const r = await api('PUT', `/admin/menu/${id}`, payload)
  saving.value = false
  if (r?.ok) {
    editingId.value = null
    await fetchData()
    msg.value = 'Menu aggiornato'
    msgType.value = 'success'
  } else {
    msg.value = r?.messages?.nome || r?.message || 'Errore durante la modifica'
    msgType.value = 'danger'
  }
}

// --- QR ---
function toggleQr(menu) {
  qrVisibleId.value = qrVisibleId.value === menu.id ? null : menu.id
}

async function downloadStyledQr(menu) {
  try {
    const response = await fetch(qrUrlFor(menu))
    const blob = await response.blob()
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })

    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="2" dy="4" stdDeviation="4" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="600" height="800" fill="url(#bgGrad)" rx="12" />
  <rect x="15" y="15" width="570" height="770" rx="10" fill="none" stroke="#e3b341" stroke-width="6" />
  <text x="300" y="90" font-family="'IBM Plex Sans', sans-serif" font-size="36" font-weight="bold" fill="#ffffff" text-anchor="middle" filter="url(#shadow)">${menu.nome}</text>
  <text x="300" y="140" font-family="'IBM Plex Sans', sans-serif" font-size="20" fill="#e3b341" text-anchor="middle" font-weight="500">Scannerizza il QR per il menu digitale</text>
  <rect x="150" y="200" width="300" height="300" rx="8" fill="#ffffff" />
  <image href="${base64}" x="175" y="225" width="250" height="250" />
  <text x="300" y="760" font-family="'IBM Plex Mono', monospace" font-size="14" fill="#e3b341" text-anchor="middle">${publicBaseUrl}/menu/${menu.slug}</text>
</svg>`.trim()

    const blobSvg = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blobSvg)
    const a = document.createElement('a')
    a.href = url
    a.download = `menu-${menu.slug}-qr.svg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Errore durante la generazione del QR SVG:', err)
    msg.value = 'Errore nel download del QR code'
    msgType.value = 'danger'
  }
}

onMounted(fetchData)
</script>

<style scoped>
/* Statistiche */
.stats-bar {
  display: flex;
  gap: 1px;
  margin-bottom: 24px;
  background: var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.stat-item {
  flex: 1;
  background: var(--bg-surface);
  padding: 12px 16px;
  text-align: center;
}

.stat-item:first-child { border-radius: var(--radius) 0 0 var(--radius); }
.stat-item:last-child { border-radius: 0 var(--radius) var(--radius) 0; }

.stat-value {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--text-muted);
}

/* Griglia menu */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.menu-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}

.menu-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
}

.menu-card--inactive {
  opacity: 0.7;
}

.menu-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.menu-card__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.menu-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.menu-card__slug {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
}

.menu-card__desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

.menu-card__actions {
  display: flex;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
  margin-top: auto;
}

.menu-card__qr-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  white-space: normal;
  text-align: center;
  line-height: 1.2;
  background: linear-gradient(135deg, rgba(117, 92, 255, 0.95), rgba(55, 120, 255, 0.9));
  border: 1px solid rgba(117, 92, 255, 0.9);
  box-shadow: 0 8px 18px rgba(82, 99, 255, 0.28);
  color: #fff;
  font-weight: 600;
  transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
}

.menu-card__qr-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 22px rgba(82, 99, 255, 0.34);
  filter: brightness(1.05);
}

.menu-card__qr-button span {
  display: inline-block;
}

/* QR overlay */
.qr-overlay {
  position: absolute;
  inset: 0;
  background: rgba(13,17,23,0.92);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.qr-overlay__inner {
  text-align: center;
  color: var(--text-primary);
}

.qr-overlay__image {
  width: 140px;
  height: 140px;
  background: white;
  padding: 8px;
  border-radius: var(--radius);
  margin-bottom: 8px;
}

.qr-overlay__info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;
}

.qr-overlay__scansioni {
  font-size: 12px;
  color: var(--text-muted);
}

.qr-overlay__close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--bg-overlay);
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

/* Pannello creazione */
.inline-editor-panel {
  background: var(--bg-surface);
  border: 1px solid var(--accent-light);
  border-radius: var(--radius-lg);
  margin-bottom: 20px;
  padding: 16px 20px;
}

.inline-editor-panel__header,
.inline-editor-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.inline-editor-panel__title,
.inline-editor-card__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.inline-editor-panel__body,
.inline-editor-card__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.form-row .form-group {
  flex: 1;
}

.inline-editor-panel__footer,
.inline-editor-card__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.menu-card--editing {
  border-color: var(--accent-light);
}

/* Toast */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 380px;
  width: 100%;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: var(--radius);
  background: var(--bg-surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
}

.toast--success {
  border-left: 4px solid var(--green);
  background: linear-gradient(135deg, rgba(35,134,54,0.12), rgba(35,134,54,0.02));
}

.toast--error {
  border-left: 4px solid var(--red);
  background: linear-gradient(135deg, rgba(218,54,51,0.12), rgba(218,54,51,0.02));
}

.toast__icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast--success .toast__icon {
  color: var(--green-text);
  background: rgba(35,134,54,0.15);
}

.toast--error .toast__icon {
  color: var(--red-text);
  background: rgba(218,54,51,0.15);
}

.toast__content {
  flex: 1;
  min-width: 0;
}

.toast__message {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.4;
}

.toast__close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  opacity: 0.7;
  transition: opacity 0.15s;
  flex-shrink: 0;
}

.toast__close:hover {
  opacity: 1;
  color: var(--text-primary);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.25s ease;
}

.toast-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
