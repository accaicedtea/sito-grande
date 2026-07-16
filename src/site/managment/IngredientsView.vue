<template>
  <div class="management-shell page-md">
    <!-- ========== HEADER ========== -->
    <div class="page-header">
      <div>
        <small style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:.2em;color:var(--accent-light)">CATALOGO</small>
        <h1 class="page-title">Ingredienti</h1>
      </div>
      <div class="page-actions">
        <!-- Ricerca -->
        <div style="position:relative;flex:1 1 180px;min-width:0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            style="position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--text-muted)">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input v-model="search" placeholder="Cerca ingrediente…" class="form-control"
            style="padding-left:30px;width:100%;height:34px;font-size:13px" />
        </div>

        <!-- Filtri disponibilità -->
        <div style="display:flex;gap:2px;background:var(--bg-raised);border:1px solid var(--border);border-radius:var(--radius);padding:3px">
          <button v-for="f in filtri" :key="f.val" class="btn btn-sm"
            style="border:none;border-radius:5px;padding:4px 11px;font-size:12px;transition:all .15s"
            :style="filtroDisp === f.val ? { background: 'var(--bg-overlay)', color: 'var(--text-primary)' } : { background: 'transparent', color: 'var(--text-muted)' }"
            @click="filtroDisp = f.val">{{ f.label }}</button>
        </div>

        <button class="btn btn-ghost btn-sm btn-icon" @click="reloadPage" title="Aggiorna">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>
        </button>
        <button class="btn btn-primary" @click="openAdd">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          <span class="btn-text">Nuovo</span>
        </button>
      </div>
    </div>

    <!-- Messaggi -->
    <div v-if="msg" class="alert" :class="msgType === 'success' ? 'alert-success' : 'alert-danger'">
      <span>{{ msg }}</span>
      <button class="alert__close" @click="msg = ''">✕</button>
    </div>

    <!-- KPI -->
    <div class="kpi-grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr));margin-bottom:20px" v-if="list.length">
      <div class="kpi-card" style="border-left:3px solid var(--blue)">
        <div class="kpi-card__body"><span class="kpi-card__label">Totali</span><span class="kpi-card__value">{{ totalItems }}</span></div>
      </div>
      <div class="kpi-card" style="border-left:3px solid var(--green)">
        <div class="kpi-card__body"><span class="kpi-card__label">Disponibili</span><span class="kpi-card__value">{{ list.filter(i => i.disponibile).length }}</span></div>
      </div>
      <div class="kpi-card" style="border-left:3px solid var(--red)">
        <div class="kpi-card__body"><span class="kpi-card__label">Non disp.</span><span class="kpi-card__value">{{ list.filter(i => !i.disponibile).length }}</span></div>
      </div>
    </div>

    <!-- Tabella ingredienti -->
    <div class="card" style="padding:0;overflow:hidden">
      <div class="table-wrap">
        <table class="table-cards" style="width:100%">
          <thead>
            <tr>
              <th style="padding-left:20px;width:36px">#</th>
              <th>Nome</th>
              <th>Attributi</th>
              <th class="hide-mobile">Allergeni</th>
              <th>Stato</th>
              <th class="text-end">Azioni</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ing, idx) in filtered" :key="ing.id">
              <td style="color:var(--text-subtle);font-family:var(--font-mono);font-size:11px;padding-left:16px;width:36px">
                {{ (currentPage - 1) * perPage + idx + 1 }}
              </td>
              <td>
                <div style="font-size:14px;font-weight:600;color:var(--text-primary)">{{ ing.nome }}</div>
                <div v-if="ing.calorie" style="font-size:11px;color:var(--text-muted);font-family:var(--font-mono);margin-top:2px">{{ ing.calorie }} kcal</div>
              </td>
              <td>
                <div style="display:flex;gap:4px;flex-wrap:wrap">
                  <span v-if="ing.vegan" class="attr-badge attr-vg" title="Vegan">VG</span>
                  <span v-if="ing.vegetariano" class="attr-badge attr-veg" title="Vegetariano">VEG</span>
                  <span v-if="ing.senza_glutine" class="attr-badge attr-gf" title="Senza glutine">GF</span>
                  <span v-if="ing.biologico" class="attr-badge attr-bio" title="Biologico">BIO</span>
                  <span v-if="!ing.vegan && !ing.vegetariano && !ing.senza_glutine && !ing.biologico" style="font-size:11px;color:var(--text-subtle)">—</span>
                </div>
              </td>
              <td class="hide-mobile">
                <div v-if="ing.allergeni?.length" style="display:flex;gap:3px;flex-wrap:wrap">
                  <span v-for="a in ing.allergeni" :key="a.id" class="badge badge-allergene" style="font-size:8px">{{ a.codice || a.nome_it?.slice(0, 6) }}</span>
                </div>
                <span v-else style="font-size:11px;color:var(--text-subtle)">—</span>
              </td>
              <td>
                <button @click="toggleDisp(ing)" :class="['badge', ing.disponibile ? 'badge-green' : 'badge-red']"
                  style="cursor:pointer;font-size:10px;display:inline-flex;align-items:center;gap:3px">
                  <span style="width:5px;height:5px;border-radius:50%;background:currentColor;flex-shrink:0"></span>
                  {{ ing.disponibile ? 'Disp.' : 'Non disp.' }}
                </button>
              </td>
              <td style="text-align:right;white-space:nowrap;padding-right:16px">
                <div style="display:flex;gap:5px;justify-content:flex-end">
                  <button class="btn btn-ghost btn-sm btn-icon" @click="openEdit(ing)" title="Modifica">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  </button>
                  <button class="btn btn-ghost btn-sm btn-icon" @click="confirmDelete(ing)" title="Elimina" style="color:var(--red)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
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
          <button class="page-link" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">« Precedente</button>
          <span class="page-info">Pagina {{ currentPage }} di {{ totalPages }} ({{ totalItems }} ingredienti)</span>
          <button class="page-link" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">Successiva »</button>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="!filtered.length && !loading" class="empty-state" style="border:none;border-radius:0">
        <span class="empty-icon">🧂</span>
        <span>{{ search || filtroDisp !== 'tutti' ? 'Nessun ingrediente corrisponde ai filtri' : 'Nessun ingrediente' }}</span>
        <button v-if="!search && filtroDisp === 'tutti'" class="btn btn-primary btn-sm" @click="openAdd">Aggiungi il primo</button>
      </div>
    </div>

    <!-- ========== MODALE CREAZIONE / MODIFICA ========== -->
    <div v-if="showForm" class="modal-backdrop" @click.self="closeForm">
      <div class="modal-box modal-box--lg">
        <div class="modal-header">
          <span class="modal-title">{{ editing ? 'Modifica ingrediente' : 'Nuovo ingrediente' }}</span>
          <button class="modal-close" @click="closeForm"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Nome <span style="color:var(--red)">*</span></label>
            <input v-model="form.nome" class="form-control" required placeholder="Es. Mozzarella fior di latte" />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Calorie (kcal)</label>
              <input v-model="form.calorie" type="number" min="0" class="form-control" placeholder="Opzionale" />
            </div>
            <div class="form-group">
              <label class="form-label">Peso (grammi)</label>
              <input v-model="form.peso_grammi" type="number" min="0" class="form-control" placeholder="Opzionale" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Attributi dietetici</label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <label v-for="attr in boolAttrs" :key="attr.key" class="form-check"
                style="background:var(--bg-raised);border:1px solid var(--border);border-radius:8px;padding:10px 12px;cursor:pointer;transition:border-color .15s;flex:1 1 calc(33.333% - 8px);min-width:130px;display:flex;align-items:center;gap:8px;box-sizing:border-box"
                :style="form[attr.key] ? { borderColor: attr.color, background: attr.bg } : {}">
                <input type="checkbox" class="form-check-input" v-model="form[attr.key]" style="flex-shrink:0" />
                <span class="form-check-label" :style="form[attr.key] ? { color: attr.color } : {}">{{ attr.label }}</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Disponibilità</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
              <label class="form-check"
                style="background:var(--bg-raised);border:1px solid var(--border);border-radius:var(--radius);padding:11px 14px;cursor:pointer"
                :style="form.disponibile ? { borderColor: 'var(--green-light)', background: 'rgba(63,185,80,.06)' } : {}">
                <input type="checkbox" class="form-check-input" v-model="form.disponibile" />
                <span class="form-check-label">Disponibile</span>
              </label>
              <label class="form-check"
                style="background:var(--bg-raised);border:1px solid var(--border);border-radius:var(--radius);padding:11px 14px;cursor:pointer"
                :style="form.in_evidenza ? { borderColor: 'var(--yellow-light)', background: 'rgba(227,179,65,.06)' } : {}">
                <input type="checkbox" class="form-check-input" v-model="form.in_evidenza" />
                <span class="form-check-label">★ In evidenza</span>
              </label>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">Allergeni presenti</label>
            <div v-if="allergeniList.length" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(175px,1fr));gap:6px">
              <label v-for="a in allergeniList" :key="a.id" class="form-check"
                style="background:var(--bg-raised);border:1px solid var(--border);border-radius:var(--radius-sm);padding:7px 10px;cursor:pointer;font-size:12px;transition:all .15s"
                :style="allergeniSel.includes(a.id) ? { borderColor: 'var(--red-light)', background: 'rgba(248,81,73,.07)' } : {}">
                <input type="checkbox" class="form-check-input" :value="a.id" v-model="allergeniSel" />
                <span class="form-check-label" style="font-size:12px" :style="allergeniSel.includes(a.id) ? { color: 'var(--red-text)' } : {}">{{ a.nome_it || a.codice }}</span>
              </label>
            </div>
            <div v-else style="font-size:12px;color:var(--text-muted)">Nessun allergene disponibile</div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="closeForm">Annulla</button>
          <button class="btn btn-primary" @click="submit" :disabled="saving">{{ saving ? 'Salvo…' : (editing ? 'Salva modifiche' : 'Crea ingrediente') }}</button>
        </div>
      </div>
    </div>

    <!-- ========== MODALE CONFERMA ELIMINAZIONE ========== -->
    <div v-if="showDeleteConfirm" class="modal-backdrop" @click.self="showDeleteConfirm = false">
      <div class="modal-box" style="width:400px">
        <div class="modal-header">
          <span class="modal-title">Conferma eliminazione</span>
          <button class="modal-close" @click="showDeleteConfirm = false"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
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
const allergeniList = ref([])
const msg = ref('')
const msgType = ref('')
const search = ref('')
const filtroDisp = ref('tutti')
const showForm = ref(false)
const editing = ref(null)
const saving = ref(false)
const allergeniSel = ref([])
const loading = ref(false)
const showDeleteConfirm = ref(false)
const deletingId = ref(null)
const deletingName = ref('')

// Paginazione
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const perPage = ref(20)

const filtri = [
  { val: 'tutti', label: 'Tutti' },
  { val: 'disponibili', label: 'Disponibili' },
  { val: 'non-disp', label: 'Non disp.' }
]

const boolAttrs = [
  { key: 'vegan', label: '🌱 Vegan', color: '#3fb950', bg: 'rgba(63,185,80,.08)' },
  { key: 'vegetariano', label: '🥦 Vegetariano', color: '#56d364', bg: 'rgba(86,211,100,.08)' },
  { key: 'senza_glutine', label: '🌾 Senza glutine', color: '#e3b341', bg: 'rgba(227,179,65,.08)' },
  { key: 'biologico', label: '🍃 Biologico', color: '#79c0ff', bg: 'rgba(121,192,255,.08)' }
]

const form = ref({
  nome: '', calorie: '', peso_grammi: '',
  vegan: false, vegetariano: false, senza_glutine: false, biologico: false,
  disponibile: true, in_evidenza: false
})

// Filtri locali
const filtered = computed(() => {
  let r = list.value
  if (search.value.trim()) {
    const s = search.value.toLowerCase()
    r = r.filter(i => i.nome.toLowerCase().includes(s))
  }
  if (filtroDisp.value === 'disponibili') r = r.filter(i => i.disponibile)
  if (filtroDisp.value === 'non-disp') r = r.filter(i => !i.disponibile)
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

// Caricamento dati
async function fetchItems(page = 1) {
  loading.value = true
  const url = `/admin/ingredienti?page=${page}&per_page=${perPage.value}`
  const r = await api('GET', url)
  if (r.data && Array.isArray(r.data)) {
    list.value = r.data.map(i => ({
      ...i,
      disponibile: i.disponibile == 1 || i.disponibile === true,
      vegan: i.vegan == 1,
      vegetariano: i.vegetariano == 1,
      senza_glutine: i.senza_glutine == 1,
      biologico: i.biologico == 1,
      in_evidenza: i.in_evidenza == 1 || i.in_evidenza === true,
      allergeni: Array.isArray(i.allergeni) ? i.allergeni : []
    }))
    currentPage.value = r.pagination?.current_page || 1
    totalPages.value = r.pagination?.total_pages || 1
    totalItems.value = r.pagination?.total_items || 0
  } else {
    list.value = []
  }
  loading.value = false
}

async function fetchAllergeni() {
  const r = await api('GET', '/admin/allergeni')
  if (r.data && Array.isArray(r.data)) {
    allergeniList.value = r.data
  }
}

async function loadAll() {
  await fetchAllergeni()
  await fetchItems(currentPage.value)
}

function reloadPage() {
  fetchItems(currentPage.value)
}

function goToPage(page) {
  if (page < 1 || page > totalPages.value) return
  fetchItems(page)
}

// Watchers
watch(filtroDisp, () => { fetchItems(1) })

// Utility
function resetForm() {
  form.value = {
    nome: '', calorie: '', peso_grammi: '',
    vegan: false, vegetariano: false, senza_glutine: false, biologico: false,
    disponibile: true, in_evidenza: false
  }
  allergeniSel.value = []
  editing.value = null
}

// Azioni modale
function openAdd() {
  resetForm()
  showForm.value = true
}

function openEdit(ing) {
  editing.value = ing.id
  form.value = {
    nome: ing.nome || '',
    calorie: ing.calorie || '',
    peso_grammi: ing.peso_grammi || '',
    vegan: !!ing.vegan,
    vegetariano: !!ing.vegetariano,
    senza_glutine: !!ing.senza_glutine,
    biologico: !!ing.biologico,
    disponibile: !!ing.disponibile,
    in_evidenza: !!ing.in_evidenza
  }
  allergeniSel.value = (ing.allergeni || []).map(a => (typeof a === 'object' ? a.id : a)).map(Number).filter(id => !isNaN(id))
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  resetForm()
}

async function submit() {
  if (!form.value.nome.trim()) {
    msg.value = 'Nome obbligatorio'
    msgType.value = 'danger'
    return
  }
  saving.value = true
  const payload = {
    nome: form.value.nome,
    calorie: form.value.calorie ? parseInt(form.value.calorie) : null,
    peso_grammi: form.value.peso_grammi ? parseInt(form.value.peso_grammi) : null,
    vegan: form.value.vegan ? 1 : 0,
    vegetariano: form.value.vegetariano ? 1 : 0,
    senza_glutine: form.value.senza_glutine ? 1 : 0,
    biologico: form.value.biologico ? 1 : 0,
    disponibile: form.value.disponibile ? 1 : 0,
    in_evidenza: form.value.in_evidenza ? 1 : 0,
    allergeni: allergeniSel.value.filter(Boolean).map(Number)
  }
  const r = editing.value
    ? await api('PUT', `/admin/ingredienti/${editing.value}`, payload)
    : await api('POST', '/admin/ingredienti', payload)
  saving.value = false
  if (r.ok) {
    closeForm()
    reloadPage()
    msg.value = editing.value ? 'Ingrediente aggiornato' : 'Ingrediente creato'
    msgType.value = 'success'
  } else {
    msg.value = r.messaggio || r.message || 'Errore durante il salvataggio'
    msgType.value = 'danger'
  }
}

// Eliminazione
function confirmDelete(ing) {
  deletingId.value = ing.id
  deletingName.value = ing.nome || 'questo ingrediente'
  showDeleteConfirm.value = true
}

async function executeDelete() {
  if (!deletingId.value) return
  const r = await api('DELETE', `/admin/ingredienti/${deletingId.value}`)
  showDeleteConfirm.value = false
  if (r.ok) {
    reloadPage()
    msg.value = 'Ingrediente eliminato'
    msgType.value = 'success'
  } else {
    msg.value = r.messaggio || 'Errore durante l\'eliminazione'
    msgType.value = 'danger'
  }
  deletingId.value = null
  deletingName.value = ''
}

// Toggle disponibilità
async function toggleDisp(ing) {
  const payload = { disponibile: ing.disponibile ? 0 : 1 }
  const r = await api('PUT', `/admin/ingredienti/${ing.id}`, payload)
  if (r.ok) {
    ing.disponibile = !ing.disponibile
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
@media (max-width: 860px) {
  .hide-mobile { display: none; }
}
</style>