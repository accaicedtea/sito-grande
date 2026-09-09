<template>
  <div class="management-shell page-md catalog-page">
    <!-- ========== HEADER ========== -->
    <div class="page-header catalog-header">
      <div>
        <small class="catalog-eyebrow">CATALOGO / OFFERTA</small>
        <h1 class="page-title">Prodotti</h1>
        <p class="catalog-subtitle">Gestisci piatti, prezzi, disponibilità e menu associati.</p>
      </div>
      <div class="page-actions catalog-toolbar">
        <!-- Ricerca -->
        <div style="position:relative">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            style="position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--text-muted)">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input v-model="search" placeholder="Cerca prodotto…" class="form-control catalog-search" />
        </div>

        <!-- Dropdown Menu -->
        <select v-model="filterMenu" class="form-select catalog-filter">
          <option value="">Tutti i menu</option>
          <option v-for="m in menus" :key="m.id" :value="m.id">{{ m.nome }}</option>
        </select>

        <!-- Dropdown Categoria -->
        <select v-model="filterCat" class="form-select catalog-filter">
          <option value="">Tutte le categorie</option>
          <option v-for="(name, id) in categories" :key="id" :value="id">{{ name }}</option>
        </select>

        <button class="btn btn-ghost btn-sm btn-icon" @click="reloadPage" title="Aggiorna">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
        </button>
        <button class="btn btn-primary" @click="openAdd">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuovo
        </button>
      </div>
    </div>

    <!-- Messaggi -->
    <div v-if="msg" class="alert" :class="msgType === 'success' ? 'alert-success' : 'alert-danger'">
      <span>{{ msg }}</span>
      <button class="alert__close" @click="msg = ''">✕</button>
    </div>

    <!-- KPI -->
    <div class="kpi-grid catalog-kpis" v-if="prod.length">
      <div class="kpi-card catalog-kpi" v-for="k in kpiCards" :key="k.label" :style="{ borderLeft: '3px solid ' + k.color }">
        <div class="kpi-card__body">
          <span class="kpi-card__label">{{ k.label }}</span>
          <span class="kpi-card__value" :style="{ color: k.color }">{{ k.val }}</span>
        </div>
      </div>
    </div>

    <!-- Tabella prodotti -->
    <div class="card catalog-table-shell">
      <div class="table-wrap">
        <table class="table-cards catalog-table">
          <thead>
            <tr>
              <th style="padding-left:20px;width:36px">#</th>
              <th>Prodotto</th>
              <th>Categoria</th>
              <th class="col-num">Prezzo</th>
              <th>IVA</th>
              <th>Attributi</th>
              <th>Stato</th>
              <th class="text-end">Azioni</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, idx) in filtered" :key="p.id + '-' + (p.menu_id_associato || idx)">
              <td
                style="color:var(--text-subtle);font-family:var(--font-mono);font-size:11px;padding-left:16px;width:36px">
                {{ (currentPage - 1) * perPage + idx + 1 }}
              </td>
              <td class="catalog-primary-cell">
                <div class="fw-600"
                  style="color:var(--text-primary);font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                  {{ p.nome }}</div>
                <div v-if="p.sku" class="mono text-muted" style="font-size:10px">{{ p.sku }}</div>
              </td>
              <td>
                <span class="catalog-tag">
                  {{ p.categoria_nome || '—' }}
                </span>
              </td>
              <td class="text-center">
                <div class="mono fw-600" style="font-size:14px;color:var(--green)">€ {{ Number(p.prezzo).toFixed(2) }}
                </div>
                <div v-if="p.prezzo_promo" class="mono text-yellow"
                  style="font-size:10px;text-decoration:line-through;color:var(--text-muted)">→ €{{
                    Number(p.prezzo_promo).toFixed(2) }}</div>
              </td>
              <td class="text-center mono text-white" style="font-size:12px">{{ p.iva }}%</td>
              <td>
                <div style="display:flex;gap:4px;flex-wrap:wrap">
                  <span v-if="p.vegan == 1 || p.vegan === true" class="attr-badge attr-vg" title="Vegan">VG</span>
                  <span v-if="p.vegetariano == 1 || p.vegetariano === true" class="attr-badge attr-veg"
                    title="Vegetariano">VEG</span>
                  <span v-if="p.senza_glutine == 1 || p.senza_glutine === true" class="attr-badge attr-gf"
                    title="Senza glutine">GF</span>
                  <span v-if="p.biologico == 1 || p.biologico === true" class="attr-badge attr-bio"
                    title="Biologico">BIO</span>
                  <span v-if="Number(p.in_evidenza) === 1" class="attr-badge attr-star" title="In evidenza">★</span>
                  <span
                    v-if="!p.vegan && !p.vegetariano && !p.senza_glutine && !p.biologico && Number(p.in_evidenza) !== 1"
                    style="font-size:11px;color:var(--text-subtle)">—</span>
                </div>
              </td>
              <td>
                <div style="display:flex;flex-direction:column;gap:3px">
                  <button @click="toggleProp(p, 'attivo')" :class="['badge', p.attivo ? 'badge-green' : 'badge-red']"
                    style="cursor:pointer;font-size:10px;display:inline-flex;align-items:center;gap:3px">
                    <span style="width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0"></span>
                    {{ p.attivo ? 'Attivo' : 'Inattivo' }}
                  </button>
                </div>
              </td>
              <td class="catalog-actions-cell">
                <div class="catalog-actions">
                  <!-- Dettagli -->
                  <button class="btn btn-ghost btn-sm btn-icon" @click="viewDetails(p)" title="Dettagli">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </button>
                  <!-- Modifica -->
                  <button class="btn btn-ghost btn-sm btn-icon" @click="openEdit(p)" title="Modifica">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <!-- Elimina -->
                  <button class="btn btn-ghost btn-sm btn-icon" @click="confirmRemove(p.id, p.nome)" title="Elimina"
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
          <span class="page-info">Pagina {{ currentPage }} di {{ totalPages }} ({{ totalItems }} prodotti)</span>
          <button class="page-link" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">Successiva
            »</button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!filtered.length && !loading" class="empty-state" style="border:none;border-radius:0">
        <span class="empty-icon">🍽️</span>
        <span>{{ search || filterCat || filterMenu ? 'Nessun prodotto corrisponde ai filtri' : 'Nessun prodotto'
          }}</span>
        <button v-if="!search && !filterCat && !filterMenu" class="btn btn-primary btn-sm" @click="openAdd">Aggiungi il
          primo</button>
      </div>
    </div>


    <!-- ========== MODALE DI CONFERMA ELIMINAZIONE ========== -->
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
          <button class="btn btn-danger" @click="executeRemove">Elimina</button>
        </div>
      </div>
    </div>


    <!-- ========== MODALE NUOVO / MODIFICA PRODOTTO ========== -->
    <div v-if="showForm" class="modal-backdrop" @click.self="closeForm">
      <div class="modal-box modal-box--lg">
        <div class="modal-header">
          <span class="modal-title">{{ editing ? 'Modifica prodotto' : 'Nuovo prodotto' }}</span>
          <button class="modal-close" @click="closeForm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <!-- Nome + Categoria -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nome <span style="color:var(--red)">*</span></label>
              <input v-model="form.nome" class="form-control" required placeholder="Es. Kumpir Classic" />
            </div>
            <div class="form-group">
              <label class="form-label">Categoria <span style="color:var(--red)">*</span></label>
              <select v-model="form.categoria_id" class="form-select" required>
                <option value="">— seleziona —</option>
                <option v-for="(name, id) in categories" :key="id" :value="id">{{ name }}</option>
              </select>
            </div>
          </div>

          <!-- Descrizione -->
          <div class="form-group">
            <label class="form-label">Descrizione</label>
            <textarea v-model="form.descrizione" class="form-control" rows="2"
              placeholder="Descrizione breve per il totem" />
          </div>

          <!-- Prezzo, IVA, Menu -->
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">Prezzo (€) <span style="color:var(--red)">*</span></label>
              <input v-model="form.prezzo" type="number" step="0.01" min="0" class="form-control" required />
            </div>
            <div class="form-group">
              <label class="form-label">IVA <span style="color:var(--red)">*</span></label>
              <select v-model="form.iva" class="form-select" required>
                <option value="" disabled>— seleziona —</option>
                <option value="4">4%</option>
                <option value="10">10%</option>
                <option value="22">22%</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Menu</label>
              <select v-model="form.menu_id_associato" class="form-select">
                <option value="">— nessun menu —</option>
                <option v-for="m in menus" :key="m.id" :value="String(m.id)">{{ m.nome }}</option>
              </select>
            </div>
          </div>

          <!-- Attributi booleani -->
          <div class="form-group">
            <label class="form-label">Attributi</label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <label v-for="attr in boolAttrs" :key="attr.key" class="form-check" style="
        background: var(--bg-raised);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 10px 14px;
        cursor: pointer;
        transition: border-color 0.15s;
        flex: 1 1 calc(33.333% - 8px);   /* 3 per riga */
        min-width: 130px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-sizing: border-box;
      " :style="form[attr.key] ? { borderColor: 'var(--accent-light)' } : {}">
                <input type="checkbox" class="form-check-input" v-model="form[attr.key]" style="flex-shrink: 0;" />
                <span class="form-check-label"
                  style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ attr.label }}</span>
              </label>
            </div>
          </div>

          <!-- Ingredienti -->
          <div class="form-group">
            <label class="form-label">Ingredienti inclusi nel prezzo</label>
            <div style="
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      max-height: 200px;
      overflow-y: auto;
      padding: 2px;
    ">
              <label v-for="ing in ingredientiList" :key="ing.id" class="form-check" style="
        background: var(--bg-raised);
        border: 1px solid var(--border);
        border-radius: 6px;
        padding: 6px 10px;
        cursor: pointer;
        font-size: 12px;
        transition: border-color 0.15s;
        flex: 1 1 calc(25% - 6px);    /* 4 per riga su desktop */
        min-width: 140px;
        display: flex;
        align-items: center;
        gap: 6px;
        box-sizing: border-box;
      " :style="ingredientiSel.includes(ing.id) ? { borderColor: 'var(--accent-light)' } : {}">
                <input type="checkbox" class="form-check-input" :value="ing.id" v-model="ingredientiSel"
                  style="flex-shrink: 0;" />
                <span class="form-check-label" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  {{ ing.nome }}
                  <span v-if="+ing.prezzo > 0" class="text-muted" style="margin-left: 2px;">+€{{ ing.prezzo }}</span>
                </span>
              </label>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="closeForm">Annulla</button>
          <button class="btn btn-primary" @click="submit" :disabled="saving">{{ saving ? 'Salvo…' : (editing ? 'Salva' :
            'Crea') }}</button>
        </div>
      </div>
    </div>

    <!-- ========== MODALE DETTAGLI PRODOTTO ========== -->
    <div v-if="showDetails" class="modal-backdrop" @click.self="showDetails = false">
      <div class="modal-box modal-box--lg">
        <div class="modal-header">
          <span class="modal-title">{{ selected?.nome }}</span>
          <button class="modal-close" @click="showDetails = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body" v-if="selected">
          <!-- KPI del dettaglio -->
          <div
            style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-bottom:20px">
            <div v-for="k in detailKpi(selected)" :key="k.label"
              style="background:var(--bg-raised);border-radius:8px;padding:12px 14px">
              <div class="text-muted"
                style="font-size:10px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">{{ k.label }}
              </div>
              <div class="mono fw-600" style="font-size:16px" :style="{ color: k.color }">{{ k.val }}</div>
            </div>
          </div>

          <!-- Badge stato -->
          <div class="d-flex gap-4 flex-wrap" style="margin-bottom:16px">
            <span :class="['badge', selected.attivo ? 'badge-green' : 'badge-red']"
              style="display:inline-flex;align-items:center;gap:3px"><span
                style="width:5px;height:5px;border-radius:50%;background:currentColor"></span>{{ selected.attivo ?
                  'Attivo' : 'Inattivo' }}</span>
            <span :class="['badge', selected.disponibile ? 'badge-green' : 'badge-yellow']"
              style="display:inline-flex;align-items:center;gap:3px"><span
                style="width:5px;height:5px;border-radius:50%;background:currentColor"></span>{{ selected.disponibile ?
                  'Disponibile' : 'Esaurito' }}</span>
            <span v-if="selected.vegan == 1" class="badge badge-green">🌱 Vegan</span>
            <span v-if="selected.vegetariano == 1" class="badge badge-green">Vegetariano</span>
            <span v-if="selected.senza_glutine == 1" class="badge badge-yellow">GF</span>
            <span v-if="selected.biologico == 1" class="badge badge-blue">BIO</span>
          </div>

          <!-- Descrizione -->
          <div v-if="selected.descrizione" style="margin-bottom:16px">
            <div class="text-muted"
              style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">Descrizione</div>
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.6">{{ selected.descrizione }}</p>
          </div>

          <!-- Ingredienti -->
          <div v-if="selected.ingredienti?.length" style="margin-bottom:12px">
            <div class="text-muted"
              style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Ingredienti inclusi
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              <div v-for="ing in selected.ingredienti" :key="ing.nome || ing.id"
                style="background:var(--bg-raised);border:1px solid var(--border);border-radius:6px;padding:5px 10px;font-size:12px;color:var(--text-primary)">
                {{ ing.nome }}</div>
            </div>
          </div>

          <!-- Allergeni -->
          <div v-if="selected.allergeni?.length">
            <div class="text-muted"
              style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Allergeni</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              <span v-for="a in selected.allergeni" :key="a.id" class="badge badge-red">{{ a.nome_it }}</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="openEdit(selected); showDetails = false">Modifica</button>
          <button class="btn btn-primary" @click="showDetails = false">Chiudi</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Stato
const prod = ref([])
const categories = ref({})
const categoriesFull = ref({})
const menus = ref([])
const ingredientiList = ref([])
const msg = ref('')
const msgType = ref('')
const search = ref('')
const filterCat = ref('')
const filterMenu = ref('')
const showForm = ref(false)
const showDetails = ref(false)
const editing = ref(null)
const saving = ref(false)
const selected = ref(null)
const ingredientiSel = ref([])
const loading = ref(false)

// Conferma eliminazione
const showDeleteConfirm = ref(false)
const deletingId = ref(null)
const deletingName = ref('')


// Paginazione
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const perPage = ref(20)


const form = ref({
  nome: '', descrizione: '', categoria_id: '', prezzo: '', iva: '',
  menu_id_associato: '', sku: '', vegan: false, vegetariano: false,
  senza_glutine: false, biologico: false, attivo: true,
  disponibile: true, in_evidenza: false
})

const boolAttrs = [
  { key: 'attivo', label: '✓ Attivo' },
  { key: 'disponibile', label: '◎ Disponibile' },
  { key: 'vegan', label: '🌱 Vegan' },
  { key: 'vegetariano', label: '🥦 Vegetariano' },
  { key: 'senza_glutine', label: '🌾 Senza glutine' },
  { key: 'biologico', label: '🍃 Biologico' },
  { key: 'in_evidenza', label: '★ In evidenza' }
]

function boolValue(v) {
  return v === true || v === 1 || v === '1' || v === 'true'
}

// Filtro locale: mostra tutti i prodotti, inclusi quelli inattivi,
// così la gestione resta allineata a ingredienti.
const filtered = computed(() => {
  let r = prod.value
  if (search.value.trim()) {
    const s = search.value.toLowerCase()
    r = r.filter(p => (p.nome || '').toLowerCase().includes(s))
  }
  if (filterCat.value) {
    r = r.filter(p => String(p.categoria_id) === String(filterCat.value))
  }
  if (filterMenu.value) {
    r = r.filter(p => String(p.menu_id_associato) === String(filterMenu.value))
  }
  return r
})

// KPI calcolati sui dati correnti della pagina (non totali assoluti, ma almeno non sono vuoti)
const kpiCards = computed(() => {
  const data = prod.value
  return [
    { label: 'Totali', val: data.length, color: 'var(--blue)' },
    { label: 'Attivi', val: data.filter(p => Number(p.attivo) === 1).length, color: 'var(--green)' },
    { label: 'In evidenza', val: data.filter(p => Number(p.in_evidenza) === 1).length, color: 'var(--accent-light)' }
  ]
})
function detailKpi(p) {
  return [
    { label: 'Prezzo', val: '€ ' + Number(p.prezzo).toFixed(2), color: 'var(--green)' },
    { label: 'IVA', val: p.iva + '%', color: 'var(--text-primary)' },
    { label: 'Ordini totali', val: p.ordini_totali || 0, color: 'var(--accent-light)' },
    { label: 'Incasso', val: '€ ' + Number(p.incasso_totale || 0).toFixed(0), color: 'var(--green)' }
  ]
}

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

// Caricamento dati
async function loadMenus() {
  const r = await api('GET', '/admin/menu')
  if (r.data && Array.isArray(r.data)) {
    menus.value = r.data
  }
}

async function loadCategories() {
  const r = await api('GET', '/admin/categorie?per_page=1000')
  const list = r.data || []
  if (list.length) {
    const map = {}
    const full = {}
    list.forEach(c => {
      map[String(c.id)] = c.nome || ''
      full[String(c.id)] = c
    })
    categories.value = map
    categoriesFull.value = full
  }
}

async function loadIngredients() {
  const r = await api('GET', '/admin/ingredienti?per_page=1000')
  const list = r.data || []
  ingredientiList.value = list
}

async function loadProducts(page = 1) {
  loading.value = true
  let url = `/admin/prodotti?page=${page}&per_page=${perPage.value}`
  if (filterMenu.value) url += `&menu_id=${filterMenu.value}`

  const r = await api('GET', url)
  if (r.data && Array.isArray(r.data)) {
    prod.value = r.data.map(item => ({
      ...item,
      attivo: boolValue(item.attivo),
      disponibile: boolValue(item.disponibile),
      vegan: boolValue(item.vegan),
      vegetariano: boolValue(item.vegetariano),
      senza_glutine: boolValue(item.senza_glutine),
      biologico: boolValue(item.biologico),
      in_evidenza: boolValue(item.in_evidenza)
    }))

    const unique = new Map()
    for (const item of prod.value) {
      if (!unique.has(item.id)) unique.set(item.id, item)
    }
    prod.value = Array.from(unique.values())
    
    currentPage.value = r.pagination?.current_page || 1
    totalPages.value = r.pagination?.total_pages || 1
    totalItems.value = r.pagination?.total_items || 0
  } else {
    prod.value = []
    console.warn('Risposta API inattesa:', r)
  }
  loading.value = false
}

async function loadAll() {
  await Promise.all([loadMenus(), loadCategories(), loadIngredients()])
  await loadProducts(currentPage.value)
}

function reloadPage() {
  loadProducts(currentPage.value)
}

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  loadProducts(page)
}

// Watchers
watch(filterMenu, () => { loadProducts(1) })
watch(filterCat, () => { loadProducts(1) })

// Utility
function bool(v) {
  return v === true || v === 1 || v === '1'
}

function resetForm() {
  form.value = {
    nome: '', descrizione: '', categoria_id: '', prezzo: '', iva: '',
    menu_id_associato: '', sku: '', vegan: false, vegetariano: false,
    senza_glutine: false, biologico: false, attivo: true,
    disponibile: true, in_evidenza: false
  }
  ingredientiSel.value = []
  editing.value = null
}

// ---- Azioni modale ----
function openAdd() {
  resetForm()
  showForm.value = true
}

function openEdit(p) {
  editing.value = p.id
  const catId = p.categoria_id ? String(p.categoria_id) : ''

  form.value = {
    nome: p.nome || '',
    descrizione: p.descrizione || '',
    categoria_id: catId,
    prezzo: p.prezzo || '',
    iva: String(p.iva || ''),
    menu_id_associato: p.menu_id_associato != null && p.menu_id_associato !== '' ? String(p.menu_id_associato) : '',
    sku: p.sku || '',
    vegan: bool(p.vegan),
    vegetariano: bool(p.vegetariano),
    senza_glutine: bool(p.senza_glutine),
    biologico: bool(p.biologico),
    attivo: bool(p.attivo),
    disponibile: bool(p.disponibile),
    in_evidenza: bool(p.in_evidenza)
  }

  // Estrazione ingredienti già associati
  if (Array.isArray(p.ingredienti)) {
    ingredientiSel.value = p.ingredienti
      .map(i => (typeof i === 'object' ? i.id : i))
      .map(Number)
      .filter(id => !isNaN(id) && id > 0)
  } else {
    ingredientiSel.value = []
  }

  if (!ingredientiList.value.length) {
    loadIngredients().then(() => { showForm.value = true })
    return
  }
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  resetForm()
}

async function submit() {
  if (!form.value.nome.trim()) {
    msg.value = 'Il nome è obbligatorio'
    msgType.value = 'danger'
    return
  }
  saving.value = true
  const payload = {
    ...form.value,
    categoria_id: form.value.categoria_id ? String(form.value.categoria_id) : '',
    menu_id_associato: form.value.menu_id_associato ? String(form.value.menu_id_associato) : '',
    iva: parseFloat(form.value.iva) || 0,
    prezzo: parseFloat(form.value.prezzo) || 0,
    vegan: form.value.vegan ? 1 : 0,
    vegetariano: form.value.vegetariano ? 1 : 0,
    senza_glutine: form.value.senza_glutine ? 1 : 0,
    biologico: form.value.biologico ? 1 : 0,
    attivo: form.value.attivo ? 1 : 0,
    disponibile: form.value.disponibile ? 1 : 0,
    in_evidenza: form.value.in_evidenza ? 1 : 0,
    ingredienti: JSON.stringify(ingredientiSel.value.filter(Boolean))
  }
  const r = editing.value
    ? await api('PUT', `/admin/prodotti/${editing.value}`, payload)
    : await api('POST', '/admin/prodotti', payload)
  saving.value = false
  if (r.ok) {
    closeForm()
    reloadPage()
    msg.value = editing.value ? 'Prodotto aggiornato' : 'Prodotto creato'
    msgType.value = 'success'
  } else {
    msg.value = r.messaggio || r.message || 'Errore'
    msgType.value = 'danger'
  }
}

// Dettagli, eliminazione, toggle (invariati)
async function viewDetails(p) {
  const r = await api('GET', `/admin/prodotti/${p.id}`)
  if (r && r.id) {
    selected.value = r
    showDetails.value = true
  } else if (r && r.data && r.data.id) {
    selected.value = r.data
    showDetails.value = true
  } else {
    msg.value = r?.messaggio || 'Errore caricamento dettagli'
    msgType.value = 'danger'
  }
}

function confirmRemove(id, nome) {
  deletingId.value = id
  deletingName.value = nome || 'questo prodotto'
  showDeleteConfirm.value = true
}

async function executeRemove() {
  if (!deletingId.value) return
  const r = await api('DELETE', `/admin/prodotti/${deletingId.value}`)
  showDeleteConfirm.value = false
  if (r && r.ok) {
    reloadPage()
    msg.value = 'Prodotto eliminato'
    msgType.value = 'success'
  } else {
    msg.value = r?.messaggio || 'Errore durante l\'eliminazione'
    msgType.value = 'danger'
  }
  deletingId.value = null
  deletingName.value = ''
}

async function toggleProp(p, prop) {
  const nextValue = boolValue(p[prop]) ? 0 : 1
  const payload = { [prop]: nextValue }
  const r = await api('PUT', `/admin/prodotti/${p.id}`, payload)
  if (r && r.ok) {
    p[prop] = boolValue(nextValue)
  }
}


onMounted(loadAll)
</script>

<style scoped>
/* Stili per la paginazione */
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