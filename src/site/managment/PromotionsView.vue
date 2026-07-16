<template>

  <div class="dev-placeholder">
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"
      style="margin-bottom: 1rem; opacity: 0.5;">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
    <span>IN SVILUPPO</span>
  </div>
  <!-- <div class="management-shell page-md">
    <!-- ========== HEADER ========== 
    <div class="page-header">
      <div>
        <small style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:.2em;color:var(--accent-light)">MARKETING</small>
        <h1 class="page-title">Promozioni</h1>
      </div>
      <div class="page-actions">
        <div style="position:relative;flex:1 1 200px;min-width:0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            style="position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--text-muted)">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input v-model="search" placeholder="Cerca promozione…" class="form-control"
            style="padding-left:30px;width:100%;height:34px;font-size:13px" />
        </div>

        <button class="btn btn-ghost btn-sm btn-icon" @click="reloadPage" title="Aggiorna">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>
        </button>
        <button class="btn btn-primary" @click="openAdd">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          <span class="btn-text">Nuova promozione</span>
        </button>
      </div>
    </div>

    <!-- Messaggi 
    <div v-if="msg" class="alert" :class="msgType === 'success' ? 'alert-success' : 'alert-danger'">
      <span>{{ msg }}</span>
      <button class="alert__close" @click="msg = ''">✕</button>
    </div>

    <!-- KPI 
    <div class="kpi-grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr));margin-bottom:20px" v-if="list.length">
      <div class="kpi-card" style="border-left:3px solid var(--blue)">
        <div class="kpi-card__body"><span class="kpi-card__label">Totali</span><span class="kpi-card__value">{{ totalItems }}</span></div>
      </div>
      <div class="kpi-card" style="border-left:3px solid var(--green)">
        <div class="kpi-card__body"><span class="kpi-card__label">Attive</span><span class="kpi-card__value">{{ list.filter(p => isActive(p)).length }}</span></div>
      </div>
      <div class="kpi-card" style="border-left:3px solid var(--yellow)">
        <div class="kpi-card__body"><span class="kpi-card__label">Future</span><span class="kpi-card__value">{{ list.filter(p => new Date(p.data_inizio) > new Date()).length }}</span></div>
      </div>
      <div class="kpi-card" style="border-left:3px solid var(--red)">
        <div class="kpi-card__body"><span class="kpi-card__label">Scadute</span><span class="kpi-card__value">{{ list.filter(p => new Date(p.data_fine) < new Date()).length }}</span></div>
      </div>
    </div>

    <!-- Tabs filtro stato 
    <div class="tab-bar">
      <button class="tab-btn" :class="{ active: tabFilter === 'tutte' }" @click="tabFilter = 'tutte'">Tutte <span class="tab-badge">{{ list.length }}</span></button>
      <button class="tab-btn" :class="{ active: tabFilter === 'attive' }" @click="tabFilter = 'attive'">Attive <span class="tab-badge">{{ list.filter(p => isActive(p)).length }}</span></button>
      <button class="tab-btn" :class="{ active: tabFilter === 'future' }" @click="tabFilter = 'future'">Future</button>
      <button class="tab-btn" :class="{ active: tabFilter === 'scadute' }" @click="tabFilter = 'scadute'">Scadute</button>
    </div>

    <!-- Tabella promozioni 
    <div class="card" style="padding:0;overflow:hidden">
      <div class="table-wrap">
        <table class="table-cards" style="width:100%">
          <thead>
            <tr>
              <th style="padding-left:20px;width:36px">#</th>
              <th>Prodotto / Menu</th>
              <th>Tipo</th>
              <th class="col-num">Valore</th>
              <th>Prezzo finale</th>
              <th>Validità</th>
              <th>Stato</th>
              <th class="text-end">Azioni</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, idx) in filtered" :key="p.id">
              <td style="color:var(--text-subtle);font-family:var(--font-mono);font-size:11px;padding-left:16px;width:36px">
                {{ (currentPage - 1) * perPage + idx + 1 }}
              </td>
              <td>
                <div class="fw-600" style="color:var(--text-primary);font-size:14px">
                  {{ p.nome_prodotto || p.nome_menu || '—' }}
                </div>
                <div v-if="p.nome_prodotto && p.nome_menu" style="font-size:11px;color:var(--text-muted)">Menu: {{ p.nome_menu }}</div>
              </td>
              <td>
                <span class="badge badge-blue">{{ p.tipo === 'percentuale' ? '%' : '€' }}</span>
              </td>
              <td>
                <span class="mono fw-600" :class="p.tipo === 'importo' ? 'text-green' : 'text-yellow'">
                  {{ p.tipo === 'percentuale' ? '-' + p.valore + '%' : '-€' + Number(p.valore).toFixed(2) }}
                </span>
              </td>
              <td>
                <span class="mono fw-600 text-green" v-if="p.prezzo_finale">€{{ Number(p.prezzo_finale).toFixed(2) }}</span>
                <span v-else style="color:var(--text-muted)">—</span>
              </td>
              <td>
                <div class="mono text-white" style="font-size:12px">{{ p.data_inizio }}</div>
                <div class="mono text-white" style="font-size:12px">→ {{ p.data_fine }}</div>
              </td>
              <td>
                <button @click="toggleAttiva(p)" class="badge" :class="p.attiva ? 'badge-green' : 'badge-red'"
                  style="cursor:pointer;border:1px solid;background:none;display:inline-flex;align-items:center;gap:4px;transition:all .15s">
                  <span style="width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0"></span>
                  {{ p.attiva ? 'Attiva' : 'Inattiva' }}
                </button>
              </td>
              <td style="text-align:right;white-space:nowrap;padding-right:16px">
                <div style="display:flex;gap:5px;justify-content:flex-end">
                  <button class="btn btn-ghost btn-sm btn-icon" @click="openEdit(p)" title="Modifica">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button class="btn btn-ghost btn-sm btn-icon" @click="confirmDelete(p)" title="Elimina" style="color:var(--red)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginazione 
      <div v-if="totalPages > 1" class="pagination-container">
        <div class="pagination">
          <button class="page-link" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">« Precedente</button>
          <span class="page-info">Pagina {{ currentPage }} di {{ totalPages }} ({{ totalItems }} promozioni)</span>
          <button class="page-link" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">Successiva »</button>
        </div>
      </div>

      <!-- Empty state 
      <div v-if="!filtered.length && !loading" class="empty-state" style="border:none;border-radius:0">
        <span class="empty-icon">🏷️</span>
        <span>{{ search || tabFilter !== 'tutte' ? 'Nessuna promozione corrisponde ai filtri' : 'Nessuna promozione' }}</span>
        <button v-if="!search && tabFilter === 'tutte'" class="btn btn-primary btn-sm" @click="openAdd">Crea la prima</button>
      </div>
    </div>

    <!-- ========== MODALE CREAZIONE / MODIFICA ========== 
    <div v-if="showForm" class="modal-backdrop" @click.self="closeForm">
      <div class="modal-box modal-box--lg">
        <div class="modal-header">
          <span class="modal-title">{{ editing ? 'Modifica promozione' : 'Nuova promozione' }}</span>
          <button class="modal-close" @click="closeForm"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
        </div>
        <div class="modal-body">
          <!-- Tipo 
          <div class="form-group">
            <label class="form-label">Tipo <span style="color:var(--red)">*</span></label>
            <select v-model="form.tipo" class="form-select" required>
              <option value="">— seleziona —</option>
              <option value="percentuale">% Percentuale</option>
              <option value="importo">€ Importo fisso</option>
            </select>
          </div>

          <!-- Valore 
          <div class="form-group">
            <label class="form-label">Valore <span style="color:var(--red)">*</span></label>
            <input v-model="form.valore" type="number" step="0.01" min="0" class="form-control" required
              :placeholder="form.tipo === 'percentuale' ? 'es. 20' : 'es. 5.00'" />
          </div>

          <!-- Prezzo finale (solo per importo)
          <div class="form-group" v-if="form.tipo === 'importo'">
            <label class="form-label">Prezzo finale (opzionale)</label>
            <input v-model="form.prezzo_finale" type="number" step="0.01" min="0" class="form-control" placeholder="Lascia vuoto per sconto normale" />
          </div>

          <!-- Menu (filtro)
          <div class="form-group">
            <label class="form-label">Menu</label>
            <select v-model="form.menu_id" class="form-select" @change="onMenuChange">
              <option value="">— Nessun menu (promozione su prodotto singolo) —</option>
              <option v-for="m in menus" :key="m.id" :value="m.id">{{ m.nome }}</option>
            </select>
          </div>

          <!-- Prodotto (filtrato in base al menu) 
          <div class="form-group">
            <label class="form-label">Prodotto</label>
            <select v-model="form.prodotto_id" class="form-select" :disabled="!form.menu_id && form.tipo !== ''">
              <option value="">— Seleziona un prodotto —</option>
              <option v-for="prod in filteredProdotti" :key="prod.id" :value="prod.id">
                {{ prod.nome }}
                <span v-if="form.menu_id && selectedMenuName" style="color:var(--text-muted)">(menu: {{ selectedMenuName }})</span>
              </option>
            </select>
            <div v-if="!form.menu_id" style="font-size:11px;color:var(--text-muted);margin-top:4px">
              Seleziona un menu per filtrare i prodotti, oppure lascia vuoto per applicare la promozione a un singolo prodotto (senza menu).
            </div>
          </div>

          <!-- Date validità 
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Data inizio <span style="color:var(--red)">*</span></label>
              <input v-model="form.data_inizio" type="date" class="form-control" required />
            </div>
            <div class="form-group">
              <label class="form-label">Data fine <span style="color:var(--red)">*</span></label>
              <input v-model="form.data_fine" type="date" class="form-control" required />
            </div>
          </div>

          <!-- Attiva 
          <div class="form-group" style="margin-bottom:0">
            <label class="form-check" style="background:var(--bg-raised);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;cursor:pointer" :style="form.attiva ? { borderColor: 'var(--green-dim)' } : {}">
              <input type="checkbox" class="form-check-input" v-model="form.attiva" />
              <span class="form-check-label">Promozione attiva</span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="closeForm">Annulla</button>
          <button class="btn btn-primary" @click="submit" :disabled="saving">{{ saving ? 'Salvo…' : (editing ? 'Salva' : 'Crea') }}</button>
        </div>
      </div>
    </div>

    <!-- ========== MODALE CONFERMA ELIMINAZIONE ========== 
    <div v-if="showDeleteConfirm" class="modal-backdrop" @click.self="showDeleteConfirm = false">
      <div class="modal-box" style="width:400px">
        <div class="modal-header">
          <span class="modal-title">Conferma eliminazione</span>
          <button class="modal-close" @click="showDeleteConfirm = false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
        </div>
        <div class="modal-body">
          <p>Sei sicuro di voler eliminare questa promozione?</p>
          <p style="font-size:12px;color:var(--text-muted)">Questa azione non può essere annullata.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showDeleteConfirm = false">Annulla</button>
          <button class="btn btn-danger" @click="executeDelete">Elimina</button>
        </div>
      </div>
    </div>
  </div> -->
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// ---------- Stato ----------
const list = ref([])
const menus = ref([])
const allProdotti = ref([])
const allProdottiMenu = ref([])
const filteredProdotti = ref([])
const msg = ref('')
const msgType = ref('')
const search = ref('')
const tabFilter = ref('tutte')
const showForm = ref(false)
const editing = ref(null)
const saving = ref(false)
const loading = ref(false)
const showDeleteConfirm = ref(false)
const deletingId = ref(null)
const selectedMenuName = ref('')

const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const perPage = ref(20)

const form = ref({
  tipo: '',
  valore: '',
  prezzo_finale: '',
  prodotto_id: '',
  menu_id: '',
  data_inizio: '',
  data_fine: '',
  attiva: true
})

// ---------- Helpers ----------
const isActive = (p) => {
  if (!p.attiva) return false
  const today = new Date().toISOString().slice(0, 10)
  return p.data_inizio <= today && p.data_fine >= today
}

const filtered = computed(() => {
  let r = list.value
  if (search.value.trim()) {
    const s = search.value.toLowerCase()
    r = r.filter(p =>
      (p.nome_prodotto || '').toLowerCase().includes(s) ||
      (p.nome_menu || '').toLowerCase().includes(s)
    )
  }
  if (tabFilter.value === 'attive') r = r.filter(p => isActive(p))
  if (tabFilter.value === 'future') r = r.filter(p => new Date(p.data_inizio) > new Date())
  if (tabFilter.value === 'scadute') r = r.filter(p => new Date(p.data_fine) < new Date())
  return r
})

// ---------- API ----------
async function api(method, path, body) {
  const token = localStorage.getItem('admin_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch('/api' + path, opts)
  return res.json()
}

// ---------- Caricamento dati ----------
async function fetchPromos(page = 1) {
  loading.value = true
  let url = `/admin/promozioni?page=${page}&per_page=${perPage.value}`
  if (tabFilter.value !== 'tutte') url += `&stato=${tabFilter.value}`

  const r = await api('GET', url)
  if (r.data && Array.isArray(r.data)) {
    list.value = r.data
    currentPage.value = r.pagination?.current_page || 1
    totalPages.value = r.pagination?.total_pages || 1
    totalItems.value = r.pagination?.total_items || 0
  } else {
    list.value = []
  }
  loading.value = false
}

async function fetchProdottiMenu() {
  const [prodRes, menuRes, pmRes] = await Promise.all([
    api('GET', '/admin/prodotti?per_page=1000'),
    api('GET', '/admin/menu'),
    api('GET', '/admin/prodotti/menu-associati?per_page=1000')
  ])
  if (prodRes.data) {
    allProdotti.value = prodRes.data
    filteredProdotti.value = prodRes.data // inizialmente tutti
  }
  if (menuRes.data) {
    menus.value = menuRes.data.filter(m => m.attivo == 1)
  }
  if (pmRes.data) {
    allProdottiMenu.value = pmRes.data
  }
}

async function loadAll() {
  await fetchProdottiMenu()
  await fetchPromos(currentPage.value)
}

// ---------- Navigazione paginazione ----------
function reloadPage() {
  fetchPromos(currentPage.value)
}

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  fetchPromos(page)
}

watch(tabFilter, () => { fetchPromos(1) })

// ---------- Gestione menu/prodotti nel form ----------
function onMenuChange() {
  const menuId = form.value.menu_id
  if (!menuId) {
    filteredProdotti.value = allProdotti.value
    selectedMenuName.value = ''
    form.value.prodotto_id = ''
    return
  }
  const id = Number(menuId)
  const prodottiIds = allProdottiMenu.value
    .filter(pm => Number(pm.menu_id) === id)
    .map(pm => Number(pm.prodotto_id))
  filteredProdotti.value = allProdotti.value.filter(p => prodottiIds.includes(Number(p.id)))
  const menu = menus.value.find(m => m.id == id)
  selectedMenuName.value = menu ? menu.nome : ''
  form.value.prodotto_id = ''
}

watch(() => form.value.menu_id, onMenuChange)

// ---------- Modale ----------
function resetForm() {
  form.value = {
    tipo: '',
    valore: '',
    prezzo_finale: '',
    prodotto_id: '',
    menu_id: '',
    data_inizio: '',
    data_fine: '',
    attiva: true
  }
  filteredProdotti.value = allProdotti.value
  selectedMenuName.value = ''
  editing.value = null
}

function openAdd() {
  resetForm()
  showForm.value = true
}

function openEdit(p) {
  editing.value = p.id
  let menuId = ''
  let prodottoId = p.prodotto_id || ''

  if (p.prodotti_menu_id) {
    const pm = allProdottiMenu.value.find(pm => pm.id == p.prodotti_menu_id)
    if (pm) {
      menuId = pm.menu_id
      prodottoId = pm.prodotto_id
    }
  }

  form.value = {
    tipo: p.tipo || '',
    valore: p.valore || '',
    prezzo_finale: p.prezzo_finale || '',
    prodotto_id: prodottoId,
    menu_id: menuId,
    data_inizio: p.data_inizio || '',
    data_fine: p.data_fine || '',
    attiva: !!p.attiva
  }

  // Forza l'aggiornamento dei prodotti filtrati in base al menu
  onMenuChange()
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  resetForm()
}

async function submit() {
  if (!form.value.tipo || form.value.valore === '' || (!form.value.prodotto_id && !form.value.menu_id)) {
    msg.value = 'Seleziona almeno un prodotto o un menu'
    msgType.value = 'danger'
    return
  }
  saving.value = true

  let prodottoId = form.value.prodotto_id ? Number(form.value.prodotto_id) : null
  let prodottiMenuId = null

  if (form.value.menu_id && form.value.prodotto_id) {
    const menuId = Number(form.value.menu_id)
    const prodId = Number(form.value.prodotto_id)
    const pm = allProdottiMenu.value.find(
      pm => Number(pm.menu_id) === menuId && Number(pm.prodotto_id) === prodId
    )
    if (pm) {
      prodottiMenuId = pm.id
    } else {
      msg.value = 'Il prodotto selezionato non appartiene al menu scelto'
      msgType.value = 'danger'
      saving.value = false
      return
    }
  }

  const payload = {
    tipo: form.value.tipo,
    valore: parseFloat(form.value.valore),
    prezzo_finale: form.value.prezzo_finale ? parseFloat(form.value.prezzo_finale) : null,
    prodotto_id: prodottoId,
    prodotti_menu_id: prodottiMenuId,
    data_inizio: form.value.data_inizio,
    data_fine: form.value.data_fine,
    attiva: form.value.attiva ? 1 : 0
  }

  const r = editing.value
    ? await api('PUT', `/admin/promozioni/${editing.value}`, payload)
    : await api('POST', '/admin/promozioni', payload)

  saving.value = false

  if (r.ok) {
    closeForm()
    reloadPage()
    msg.value = editing.value ? 'Promozione aggiornata' : 'Promozione creata'
    msgType.value = 'success'
  } else {
    msg.value = r.messaggio || r.message || 'Errore'
    msgType.value = 'danger'
  }
}

// ---------- Eliminazione ----------
function confirmDelete(p) {
  deletingId.value = p.id
  showDeleteConfirm.value = true
}

async function executeDelete() {
  if (!deletingId.value) return
  const r = await api('DELETE', `/admin/promozioni/${deletingId.value}`)
  showDeleteConfirm.value = false
  if (r.ok) {
    reloadPage()
    msg.value = 'Promozione eliminata'
    msgType.value = 'success'
  } else {
    msg.value = r.messaggio || 'Errore'
    msgType.value = 'danger'
  }
  deletingId.value = null
}

// ---------- Toggle attiva ----------
async function toggleAttiva(p) {
  const newVal = p.attiva ? 0 : 1
  const r = await api('PUT', `/admin/promozioni/${p.id}`, { attiva: newVal })
  if (r.ok) {
    p.attiva = newVal
  } else {
    msg.value = r.messaggio || 'Errore aggiornamento'
    msgType.value = 'danger'
  }
}

onMounted(loadAll)
</script>

<style scoped>
/* Stile per il placeholder "IN SVILUPPO" */
.dev-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  /* occupa buona parte dell’area visibile */
  font-family: var(--font-mono);
  /* coerenza con il design system */
  font-size: clamp(2rem, 8vw, 5rem);
  font-weight: 700;
  letter-spacing: 0.15em;
  color: var(--text-muted);
  text-transform: uppercase;
  user-select: none;
  opacity: 0.6;
}

.pagination-container {
  padding: 16px 20px;
  border-top: 1px solid var(--border);
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.page-link {
  background: var(--bg-raised);
  border: 1px solid var(--border-muted);
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: var(--radius);
  font-size: 13px;
  cursor: pointer;
  transition: background var(--transition), color var(--transition);
}

.page-link:hover:not(:disabled) {
  background: var(--bg-overlay);
  color: var(--text-primary);
}

.page-link:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
</style>