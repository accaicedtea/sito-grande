<template>
  <div class="management-shell page-md catalog-page">
    <!-- ========== HEADER ========== -->
    <div class="page-header catalog-header">
      <div>
        <small class="catalog-eyebrow">CATALOGO / STRUTTURA</small>
        <h1 class="page-title">Categorie</h1>
        <p class="catalog-subtitle">Organizza l'offerta e definisci l'ordine di visualizzazione.</p>
      </div>
      <div class="page-actions catalog-toolbar">
        <!-- Ricerca -->
        <div style="position:relative">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            style="position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--text-muted)">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input v-model="search" placeholder="Cerca categoria…" class="form-control catalog-search" />
        </div>

        <!-- Dropdown Menu -->
        <select v-model="filterMenu" class="form-select catalog-filter">
          <option value="">Tutti i menu</option>
          <option v-for="m in menus" :key="m.id" :value="m.id">{{ m.nome }}</option>
        </select>

        <button class="btn btn-ghost btn-sm btn-icon" @click="reloadPage" title="Aggiorna">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
        </button>
        <button class="btn btn-primary" @click="openModal(null)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuova categoria
        </button>
      </div>
    </div>

    <!-- Messaggi -->
    <div v-if="msg" class="alert" :class="msgType === 'success' ? 'alert-success' : 'alert-danger'">
      <span>{{ msg }}</span>
      <button class="alert__close" @click="msg = ''">✕</button>
    </div>

    <!-- KPI -->
    <div class="kpi-grid catalog-kpis" v-if="list.length">
      <div class="kpi-card catalog-kpi" style="border-left:3px solid var(--blue)">
        <div class="kpi-card__body"><span class="kpi-card__label">Totali</span><span class="kpi-card__value">{{
            totalItems }}</span></div>
      </div>
      <div class="kpi-card catalog-kpi" style="border-left:3px solid var(--green)">
        <div class="kpi-card__body"><span class="kpi-card__label">Visibili</span><span class="kpi-card__value">{{
          list.filter(c => c.visibile).length }}</span></div>
      </div>
      <div class="kpi-card catalog-kpi" style="border-left:3px solid var(--red)">
        <div class="kpi-card__body"><span class="kpi-card__label">Nascoste</span><span class="kpi-card__value">{{
          list.filter(c => !c.visibile).length }}</span></div>
      </div>
    </div>

    <!-- Tabella categorie -->
    <div class="card catalog-table-shell">
      <div class="table-wrap">
        <table class="table-cards catalog-table">
          <thead>
            <tr>
              <th style="padding-left:20px;width:36px">#</th>
              <th>Nome</th>
              <th>Ordine</th>
              <th>Stato</th>
              <th class="text-end">Azioni</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(c, idx) in filtered" :key="c.id">
              <td
                style="color:var(--text-subtle);font-family:var(--font-mono);font-size:11px;padding-left:16px;width:36px">
                {{ (currentPage - 1) * perPage + idx + 1 }}
              </td>
              <td class="catalog-primary-cell">
                <div class="category-name-cell">
                  <div v-if="c.colore"
                    :style="{ width: '12px', height: '12px', borderRadius: '50%', background: c.colore, flexShrink: 0 }" />
                  <div>
                    <div style="font-size:14px;font-weight:600;color:var(--text-primary);line-height:1.3">{{ c.nome ||
                      '(senza nome)' }}</div>
                    <div v-if="c.descrizione" style="font-size:12px;color:var(--text-muted);margin-top:2px">{{
                      c.descrizione.length > 70 ? c.descrizione.slice(0, 70) + '…' : c.descrizione }}</div>
                  </div>
                </div>
              </td>
              <td>
                <span class="catalog-order">{{
                    c.ordine ?? 0 }}</span>
              </td>
              <td>
                <button @click="toggleVisibile(c)" :class="['badge', c.visibile ? 'badge-green' : 'badge-red']"
                  style="cursor:pointer;border:1px solid;background:transparent;display:inline-flex;align-items:center;gap:4px;transition:all .15s">
                  <span style="width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0"></span>
                  {{ c.visibile ? 'Visibile' : 'Nascosta' }}
                </button>
              </td>
              <td class="catalog-actions-cell">
                <div class="catalog-actions">
                  <button class="btn btn-ghost btn-sm btn-icon" @click="openModal(c)" title="Modifica">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button class="btn btn-ghost btn-sm btn-icon" @click="confirmDelete(c)" title="Elimina"
                    style="color:var(--red)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginazione -->
      <div v-if="totalPages > 1" class="pagination-container">
        <div class="pagination">
          <button class="page-link" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">«
            Precedente</button>
          <span class="page-info">Pagina {{ currentPage }} di {{ totalPages }} ({{ totalItems }} categorie)</span>
          <button class="page-link" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">Successiva
            »</button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!filtered.length && !loading" class="empty-state" style="border:none;border-radius:0">
        <span class="empty-icon">📂</span>
        <span>{{ search || filterMenu ? 'Nessuna categoria corrisponde ai filtri' : 'Nessuna categoria' }}</span>
        <button v-if="!search && !filterMenu" class="btn btn-primary btn-sm" @click="openModal(null)">Crea la
          prima</button>
      </div>
    </div>

    <!-- ========== MODALE CREAZIONE / MODIFICA ========== -->
    <div v-if="showModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">{{ editing ? 'Modifica categoria' : 'Nuova categoria' }}</span>
          <button class="modal-close" @click="closeModal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Nome <span style="color:var(--red)">*</span></label>
            <input v-model="form.nome" class="form-control" required placeholder="Es. Antipasti" />
          </div>
          <div class="form-group">
            <label class="form-label">Descrizione</label>
            <textarea v-model="form.descrizione" class="form-control" rows="2"
              placeholder="Breve descrizione (opzionale)" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Ordine di visualizzazione</label>
              <input v-model.number="form.ordine" type="number" class="form-control" min="0" />
            </div>
            <div class="form-group">
              <label class="form-label">Colore</label>
              <input v-model="form.colore" type="color" class="form-control"
                style="height:42px;padding:4px 6px;cursor:pointer" />
            </div>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-check"
              style="background:var(--bg-raised);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;cursor:pointer;transition:border-color .15s"
              :style="form.visibile ? { borderColor: 'var(--green)' } : {}">
              <input type="checkbox" class="form-check-input" v-model="form.visibile" />
              <span class="form-check-label">Visibile nel menu</span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="closeModal">Annulla</button>
          <button class="btn btn-primary" @click="submit" :disabled="saving">{{ saving ? 'Salvo…' : (editing ? 'Salva   modifiche' : 'Crea categoria') }}</button>
        </div>
      </div>
    </div>

    <!-- ========== MODALE CONFERMA ELIMINAZIONE ========== -->
    <div v-if="showDeleteConfirm" class="modal-backdrop" @click.self="showDeleteConfirm = false">
      <div class="modal-box" style="width:400px">
        <div class="modal-header">
          <span class="modal-title">Conferma eliminazione</span>
          <button class="modal-close" @click="showDeleteConfirm = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <p>Sei sicuro di voler eliminare <strong>{{ deletingName }}</strong>?</p>
          <p style="font-size:12px;color:var(--text-muted)">Questa azione non può essere annullata.</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="showDeleteConfirm = false">Annulla</button>
          <button class="btn btn-danger" @click="executeDelete">Elimina</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>

import { ref, computed, onMounted, watch } from 'vue'

// Stato
const list = ref([])
const menus = ref([])
const msg = ref('')
const msgType = ref('')
const search = ref('')
const filterMenu = ref('')
const showModal = ref(false)
const editing = ref(null)
const saving = ref(false)
const loading = ref(false)
const showDeleteConfirm = ref(false)
const deletingId = ref(null)
const deletingName = ref('')

// Paginazione
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const perPage = ref(20)

const form = ref({
  nome: '',
  descrizione: '',
  ordine: 0,
  colore: '#1a4b9b',
  visibile: true
})

function boolValue(v) {
  return v === true || v === 1 || v === '1' || v === 'true'
}

// Filtro locale: mostra tutte le categorie, anche quelle nascoste,
// così la gestione resta allineata a ingredienti e si possono verificare
// anche gli item non disponibili/non visibili.
const filtered = computed(() => {
  let r = list.value

  if (search.value.trim()) {
    const s = search.value.toLowerCase()
    r = r.filter(c => (c.nome || '').toLowerCase().includes(s))
  }
  if (filterMenu.value) {
    r = r.filter(c => String(c.menu_id) === String(filterMenu.value))
  }
  return r
})

// API helper
async function api(method, path, body) {
  const token = localStorage.getItem('admin_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch('/api' + path, opts)
  return res.json()
}

// Caricamento menu (per dropdown)
async function loadMenus() {
  const r = await api('GET', '/admin/menu')
  if (r.data && Array.isArray(r.data)) {
    menus.value = r.data
  }
}

// Caricamento categorie con paginazione
async function fetchCats(page = 1) {
  loading.value = true
  let url = `/admin/categorie?page=${page}&per_page=${perPage.value}`
  if (filterMenu.value) url += `&menu_id=${filterMenu.value}`

  const r = await api('GET', url)
  if (r.data && Array.isArray(r.data)) {
    list.value = r.data.map(c => ({
      ...c,
      visibile: boolValue(c.visibile)
    }))
    currentPage.value = r.pagination?.current_page || 1
    totalPages.value = r.pagination?.total_pages || 1
    totalItems.value = r.pagination?.total_items || 0
  } else {
    list.value = []
    console.warn('Risposta API categorie inattesa:', r)
  }
  loading.value = false
}

async function loadAll() {
  await loadMenus()
  await fetchCats(currentPage.value)
}

function reloadPage() {
  fetchCats(currentPage.value)
}

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  fetchCats(page)
}

// Watchers
watch(filterMenu, () => { fetchCats(1) })

// Azioni modale categoria
function openModal(c) {
  editing.value = c?.id || null
  form.value = c
    ? {
      nome: c.nome || '',
      descrizione: c.descrizione || '',
      ordine: c.ordine || 0,
      colore: c.colore || '#1a4b9b',
      visibile: !!c.visibile
    }
    : { nome: '', descrizione: '', ordine: 0, colore: '#1a4b9b', visibile: true }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editing.value = null
}

async function submit() {
  if (!form.value.nome.trim()) {
    msg.value = 'Il nome è obbligatorio'
    msgType.value = 'danger'
    return
  }
  msg.value = ''
  saving.value = true
  const payload = { ...form.value, visibile: form.value.visibile ? 1 : 0 }
  const r = editing.value
    ? await api('PUT', `/admin/categorie/${editing.value}`, payload)
    : await api('POST', '/admin/categorie', payload)
  saving.value = false
  if (r.ok) {
    closeModal()
    reloadPage()
    msg.value = editing.value ? 'Categoria aggiornata' : 'Categoria creata'
    msgType.value = 'success'
  } else {
    msg.value = r.messaggio || r.message || 'Errore durante il salvataggio'
    msgType.value = 'danger'
  }
}

// Eliminazione
function confirmDelete(c) {
  deletingId.value = c.id
  deletingName.value = c.nome || 'questa categoria'
  showDeleteConfirm.value = true
}

async function executeDelete() {
  if (!deletingId.value) return
  const r = await api('DELETE', `/admin/categorie/${deletingId.value}`)
  showDeleteConfirm.value = false
  if (r.ok) {
    reloadPage()
    msg.value = 'Categoria eliminata'
    msgType.value = 'success'
  } else {
    msg.value = r.messaggio || 'Errore durante l\'eliminazione'
    msgType.value = 'danger'
  }
  deletingId.value = null
  deletingName.value = ''
}

// Toggle visibilità
async function toggleVisibile(c) {
  const newValue = c.visibile ? 0 : 1
  const r = await api('PUT', `/admin/categorie/${c.id}`, { ...c, visibile: newValue })
  if (r.ok) {
    c.visibile = newValue
  } else {
    msg.value = r.messaggio || 'Errore aggiornamento'
    msgType.value = 'danger'
  }
}

onMounted(loadAll)
</script>

<style scoped>
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