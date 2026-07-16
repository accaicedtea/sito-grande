<template>
  <div class="management-shell page-md">
    <!-- Header -->
    <div class="page-header">
      <div>
        <small class="text-accent"
          style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:.2em;display:block;margin-bottom:2px">PROGRAMMAZIONE</small>
        <h1 class="page-title">Eventi</h1>
      </div>
      <div class="page-actions">
        <div class="month-nav">
          <button type="button" class="month-nav__btn" @click="prevMonth" title="Mese precedente">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
              stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span class="month-nav__label">{{ monthLabel }}</span>
          <button type="button" class="month-nav__btn" @click="nextMonth" title="Mese successivo">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
              stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        <button type="button" class="today-btn" @click="goToday">Oggi</button>
      </div>
    </div>

    <div v-if="msg" class="alert" :class="msgType === 'success' ? 'alert-success' : 'alert-danger'">
      <span>{{ msg }}</span>
      <button class="alert__close" @click="msg = ''">✕</button>
    </div>

    <!-- KPI del mese visibile -->
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px">
      <div class="kpi-card">
        <div class="kpi-card__icon" style="background:rgba(35,134,54,.12);color:var(--green-text)"><svg width="18"
            height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg></div>
        <div class="kpi-card__body"><span class="kpi-card__label">Pubblicati</span><span class="kpi-card__value">{{
          counts.published }}</span></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon" style="background:rgba(227,179,65,.14);color:var(--yellow-text)"><svg width="18"
            height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg></div>
        <div class="kpi-card__body"><span class="kpi-card__label">Da pubblicare</span><span class="kpi-card__value">{{
          counts.pending }}</span></div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__icon" style="background:rgba(218,54,51,.12);color:var(--red-text)"><svg width="18"
            height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg></div>
        <div class="kpi-card__body"><span class="kpi-card__label">Chiusi</span><span class="kpi-card__value">{{
          counts.closed }}</span></div>
      </div>
    </div>

    <p class="hint-line">
      Clic su un giorno per modificarlo · clic sull'icona <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.5" style="vertical-align:-1px">
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="7" x2="12" y2="12" />
      </svg> per chiudere/riaprire in un click
    </p>

    <!-- Intestazione giorni della settimana -->
    <div class="weekday-header">
      <span v-for="wd in weekdayHeaders" :key="wd">{{ wd }}</span>
    </div>

    <!-- Calendario: una riga per settimana, editor inline sotto la riga giusta -->
    <div class="calendar">
      <template v-for="week in monthWeeks" :key="week[0].date">
        <div class="week-row">
          <!-- FIX: day-cell e quick-toggle erano un <button> dentro un <button>,
               HTML non valido: il browser chiudeva anticipatamente il bottone esterno
               e i confini cliccabili delle celle si sfalsavano, facendo aprire
               il giorno sbagliato. Ora sono elementi fratelli dentro .day-cell-wrap. -->
          <div v-for="cell in week" :key="cell.date" class="day-cell-wrap">
            <button type="button" class="day-cell" :class="{
              'is-outside': !cell.inMonth,
              'is-today': cell.isToday,
              'is-closed': cell.data.is_closed,
              'is-active': editing && editing.date === cell.date,
            }" :style="cellBackground(cell.data)" @click="toggleDay(cell)">
              <span class="day-cell__num">{{ cell.dayNum }}</span>
              <span class="day-cell__dot" :class="statusOf(cell.data).cls"
                v-if="cell.inMonth && (cell.data.is_closed || cell.data.event_name)"></span>
              <span class="day-cell__name" v-if="cell.inMonth && cell.data.event_name && !cell.data.is_closed">{{
                cell.data.event_name }}</span>
              <span class="day-cell__name day-cell__name--closed"
                v-else-if="cell.inMonth && cell.data.is_closed">Chiuso</span>
            </button>

            <button v-if="cell.inMonth" type="button" class="quick-toggle"
              :class="{ 'is-on': cell.data.is_closed, 'is-busy': quickToggling === cell.date }"
              :title="cell.data.is_closed ? 'Riapri questo giorno' : 'Segna come chiuso'"
              @click="quickToggleClosed(cell, $event)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="7" x2="12" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Editor inline: appare subito sotto la settimana del giorno selezionato -->
        <div v-if="editing && weekContains(week, editing.date)" class="inline-editor" ref="editorRef">
          <div class="inline-editor__arrow" :style="arrowOffset"></div>

          <div class="inline-editor__col inline-editor__col--identity">
            <div class="inline-editor__weekday">{{ editingWeekday }}</div>
            <div class="inline-editor__date">{{ editing.date }}</div>
          </div>

          <div class="inline-editor__col inline-editor__col--main">
            <!-- Selettore di stato unico: sostituisce switch multipli con un'unica scelta chiara -->
            <div class="status-picker">
              <button type="button" class="status-pill" :class="{ active: editing.mode === 'draft' }"
                @click="setMode('draft')">Bozza</button>
              <button type="button" class="status-pill status-pill--green"
                :class="{ active: editing.mode === 'publish' }" @click="setMode('publish')">Pubblica ora</button>
              <button type="button" class="status-pill status-pill--yellow"
                :class="{ active: editing.mode === 'schedule' }" @click="setMode('schedule')">Programma</button>
              <button type="button" class="status-pill status-pill--red" :class="{ active: editing.mode === 'closed' }"
                @click="setMode('closed')">Chiuso</button>
            </div>

            <template v-if="editing.mode !== 'closed'">
              <div class="inline-editor__row">
                <input ref="nameInputRef" v-model="editing.event_name" placeholder="Nome evento (es. Serata jazz)"
                  class="form-control" @keydown.enter="saveDay" @keydown.esc="closeDay" />
                <input v-model="editing.image_url" placeholder="URL immagine (opzionale)" class="form-control" />
                <img v-if="editing.image_url" :src="editing.image_url" class="inline-editor__thumb"
                  @error="editing.image_url = ''" />
              </div>
              <input v-if="editing.mode === 'schedule'" type="datetime-local" v-model="editing.scheduled_at"
                class="form-control inline-editor__schedule" />
            </template>
            <div v-else class="inline-editor__closed-msg">Il locale sarà segnato come chiuso in questo giorno.</div>
          </div>

          <div class="inline-editor__col inline-editor__col--actions">
            <button class="btn btn-ghost btn-sm" @click="clearDay" title="Svuota i campi senza salvare">Svuota</button>
            <button class="btn btn-ghost btn-sm" @click="closeDay">Annulla</button>
            <button class="btn btn-primary btn-sm" @click="saveDay"
              :disabled="savingDay || (editing.mode !== 'closed' && !editing.event_name.trim())">
              {{ savingDay ? 'Salvando…' : 'Salva' }}
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

// ---------- stato di navigazione ----------
const anchor = ref(startOfMonth(new Date()))
const eventsByDate = reactive({})    // "YYYY-MM-DD" -> record dal backend (o assente)
const msg = ref('')
const msgType = ref('success')

// ---------- stato editor inline ----------
const editing = ref(null)
const editingColumnIndex = ref(0)    // 0-6, per posizionare la freccia sopra il giorno giusto
const savingDay = ref(false)
const quickToggling = ref(null)      // data (YYYY-MM-DD) in corso di toggle rapido, per lo stato "busy"
const nameInputRef = ref(null)

// ---------- helper data ----------
function pad2(n) { return String(n).padStart(2, '0') }
// IMPORTANTE: niente toISOString() qui. toISOString() converte in UTC, e in Italia
// (UTC+1/+2) la mezzanotte locale del giorno D corrisponde ancora al giorno D-1 in UTC:
// questo faceva sì che la cella "2" portasse con sé la data "1", e l'editor si aprisse
// sul giorno sbagliato. Costruendo la stringa dai componenti locali della data si resta
// sempre coerenti con quello che l'utente vede a schermo.
function fmt(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` }
function nowLocalDatetimeInput() {
  const d = new Date()
  return `${fmt(d)}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}
function startOfMonth(d) { const x = new Date(d); x.setDate(1); x.setHours(0, 0, 0, 0); return x }
function endOfMonth(d) { const x = new Date(d); x.setMonth(x.getMonth() + 1); x.setDate(0); x.setHours(0, 0, 0, 0); return x }
function getMonday(d) {
  const date = new Date(d)
  const day = date.getDay()
  date.setDate(date.getDate() - day + (day === 0 ? -6 : 1))
  date.setHours(0, 0, 0, 0)
  return date
}
function isSameDay(a, b) { return fmt(a) === fmt(b) }
function toLocalInput(mysqlDatetime) {
  if (!mysqlDatetime) return ''
  return mysqlDatetime.replace(' ', 'T').slice(0, 16)
}
function toMysqlDatetime(localInput) {
  if (!localInput) return null
  return localInput.replace('T', ' ') + ':00'
}
function emptyDayRecord() {
  return { event_name: '', image_url: '', is_closed: false, publish_at: null }
}
function dataFor(dateStr) {
  return eventsByDate[dateStr] || emptyDayRecord()
}

const weekdayHeaders = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

// ---------- griglia del mese, raggruppata per settimana ----------
const monthWeeks = computed(() => {
  const first = startOfMonth(anchor.value)
  const last = endOfMonth(anchor.value)
  const gridStart = getMonday(first)
  const gridEnd = new Date(last)
  const trailing = (7 - ((gridEnd.getDay() + 6) % 7 + 1)) % 7
  gridEnd.setDate(gridEnd.getDate() + trailing)

  const today = new Date()
  const weeks = []
  let currentWeek = []
  const cursor = new Date(gridStart)
  while (cursor <= gridEnd) {
    const dateStr = fmt(cursor)
    currentWeek.push({
      date: dateStr,
      dayNum: cursor.getDate(),
      inMonth: cursor.getMonth() === first.getMonth(),
      isToday: isSameDay(cursor, today),
      data: dataFor(dateStr),
    })
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return weeks
})

const rangeStart = computed(() => startOfMonth(anchor.value))
const rangeEnd = computed(() => endOfMonth(anchor.value))

const monthLabel = computed(() => anchor.value.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }))

function prevMonth() { const d = new Date(anchor.value); d.setMonth(d.getMonth() - 1); anchor.value = d; closeDay() }
function nextMonth() { const d = new Date(anchor.value); d.setMonth(d.getMonth() + 1); anchor.value = d; closeDay() }
function goToday() { anchor.value = startOfMonth(new Date()); closeDay() }

function cellBackground(data) {
  if (data.image_url && !data.is_closed) {
    return { backgroundImage: `linear-gradient(180deg, rgba(13,17,23,.45), rgba(13,17,23,.9)), url(${data.image_url})` }
  }
  return {}
}

function weekContains(week, dateStr) {
  return week.some(c => c.date === dateStr)
}

// posiziona la piccola freccia dell'editor sopra la colonna del giorno cliccato
const arrowOffset = computed(() => {
  const pct = (editingColumnIndex.value + 0.5) * (100 / 7)
  return { left: `calc(${pct}% - 6px)` }
})

// ---------- stato derivato per badge/dot ----------
function statusOf(data) {
  if (data.is_closed) return { label: 'Chiuso', cls: 'dot-red' }
  if (!data.event_name) return { label: '—', cls: 'dot-grey' }
  if (!data.publish_at) return { label: 'Bozza', cls: 'dot-grey' }
  const when = new Date(data.publish_at.replace(' ', 'T'))
  if (when.getTime() <= Date.now()) return { label: 'Pubblicato', cls: 'dot-green' }
  return { label: 'Programmato', cls: 'dot-yellow' }
}

const counts = computed(() => {
  let published = 0, pending = 0, closed = 0
  monthWeeks.value.forEach(week => {
    week.forEach(c => {
      if (!c.inMonth) return
      const d = c.data
      if (d.is_closed) { closed++; return }
      if (!d.event_name) return
      const s = statusOf(d)
      if (s.label === 'Pubblicato') published++
      else if (s.label === 'Bozza' || s.label === 'Programmato') pending++
    })
  })
  return { published, pending, closed }
})

// ---------- API ----------
async function api(method, path, body) {
  const token = localStorage.getItem('admin_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)
  const res = await fetch('/api' + path, options)
  return res.json()
}

async function fetchMonth() {
  const start = fmt(rangeStart.value)
  const end = fmt(rangeEnd.value)
  const res = await api('GET', `/admin/events?start=${start}&end=${end}`)

  // Estrai l'array eventi in modo flessibile
  const events = Array.isArray(res) ? res : (res?.data || res?.events || [])

  if (Array.isArray(events)) {
    events.forEach(ev => {
      eventsByDate[ev.event_date] = {
        event_name: ev.event_name || '',
        image_url: ev.image_url || '',
        // Converte esplicitamente la stringa in numero
        is_closed: Number(ev.is_closed) === 1,
        publish_at: ev.publish_at || null,
      }
    })
  }
}

watch(anchor, fetchMonth)
onMounted(fetchMonth)

// ---------- editor inline ----------
const editingWeekday = computed(() => editing.value ? new Date(editing.value.date).toLocaleDateString('it-IT', { weekday: 'long' }) : '')

function modeFor(data) {
  if (data.is_closed) return 'closed'
  if (!data.publish_at) return 'draft'
  const when = new Date(data.publish_at.replace(' ', 'T'))
  return when.getTime() <= Date.now() ? 'publish' : 'schedule'
}

function toggleDay(cell) {
  if (!cell.inMonth) return
  if (editing.value && editing.value.date === cell.date) {
    closeDay()
    return
  }
  const existing = cell.data
  const mode = modeFor(existing)
  editing.value = {
    date: cell.date,
    event_name: existing.event_name,
    image_url: existing.image_url,
    mode,
    scheduled_at: mode === 'schedule' ? toLocalInput(existing.publish_at) : '',
  }
  editingColumnIndex.value = new Date(cell.date).getDay() === 0 ? 6 : new Date(cell.date).getDay() - 1
  focusNameSoon()
}
function closeDay() { editing.value = null }

function clearDay() {
  if (!editing.value) return
  editing.value.event_name = ''
  editing.value.image_url = ''
  editing.value.mode = 'draft'
  editing.value.scheduled_at = ''
  focusNameSoon()
}

function focusNameSoon() {
  nextTick(() => {
    if (editing.value && editing.value.mode !== 'closed') {
      const el = Array.isArray(nameInputRef.value) ? nameInputRef.value[0] : nameInputRef.value
      el?.focus?.()
    }
  })
}

// un'unica scelta sostituisce switch "chiuso" + switch "pubblica" + link "programma"
function setMode(mode) {
  if (!editing.value) return
  editing.value.mode = mode
  if (mode === 'schedule') {
    if (!editing.value.scheduled_at) {
      const d = new Date(editing.value.date + 'T12:00')
      editing.value.scheduled_at = fmt(d) + 'T12:00'
    }
  } else {
    editing.value.scheduled_at = ''
  }
  if (mode !== 'closed') focusNameSoon()
}

function scheduledLabel(day) {
  if (!day.scheduled_at) return ''
  const when = new Date(day.scheduled_at)
  return when.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' }) + ' ' + when.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
}

function payloadFor(date, event_name, image_url, mode, scheduled_at) {
  const is_closed = mode === 'closed'
  let publish_at = null
  if (!is_closed) {
    if (mode === 'schedule' && scheduled_at) publish_at = toMysqlDatetime(scheduled_at)
    else if (mode === 'publish') publish_at = toMysqlDatetime(new Date().toISOString().slice(0, 16))
  }
  return {
    event_date: date,
    event_name: is_closed ? null : event_name,
    image_url: is_closed ? null : image_url,
    is_closed: is_closed ? 1 : 0,
    publish_at,
  }
}

async function saveDay() {
  if (!editing.value) return
  if (editing.value.mode !== 'closed' && !editing.value.event_name.trim()) return
  savingDay.value = true
  const d = editing.value
  const payload = payloadFor(d.date, d.event_name, d.image_url, d.mode, d.scheduled_at)

  try {
    const res = await api('POST', '/admin/events/bulk', { events: [payload] })
    if (res?.ok) {
      // Ricarica i dati del mese dal server (così siamo sicuri di avere lo stato reale)
      await fetchMonth()
      msg.value = '✅ Giorno salvato'
      msgType.value = 'success'
      closeDay()
    } else {
      msg.value = res?.messaggio || '❌ Errore durante il salvataggio'
      msgType.value = 'danger'
    }
  } catch (e) {
    msg.value = '❌ Errore di rete'
    msgType.value = 'danger'
  } finally {
    savingDay.value = false
  }
}

// ---------- toggle rapido "chiuso" direttamente dalla cella, senza aprire l'editor ----------
async function quickToggleClosed(cell, evt) {
  evt.stopPropagation()
  if (!cell.inMonth || quickToggling.value) return
  quickToggling.value = cell.date
  const current = cell.data
  const nextMode = current.is_closed ? 'draft' : 'closed'
  const payload = payloadFor(cell.date, current.event_name, current.image_url, nextMode, '')

  try {
    const res = await api('POST', '/admin/events/bulk', { events: [payload] })
    if (res?.ok) {
      // Ricarica i dati del mese dal server
      await fetchMonth()
      if (editing.value?.date === cell.date) closeDay()
    } else {
      msg.value = res?.messaggio || '❌ Errore durante il salvataggio'
      msgType.value = 'danger'
    }
  } catch (e) {
    msg.value = '❌ Errore di rete'
    msgType.value = 'danger'
  } finally {
    quickToggling.value = null
  }
}

// ---------- chiusura editor con click fuori / tasto Esc ----------
function onWindowClick(e) {
  if (!editing.value) return
  if (e.target.closest('.inline-editor') || e.target.closest('.day-cell-wrap')) return
  closeDay()
}
function onWindowKeydown(e) {
  if (e.key === 'Escape' && editing.value) closeDay()
}
onMounted(() => {
  document.addEventListener('click', onWindowClick, true)
  document.addEventListener('keydown', onWindowKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onWindowClick, true)
  document.removeEventListener('keydown', onWindowKeydown)
})
</script>

<style scoped>
/* ===== fallback autosufficiente: non dipende da classi globali esterne ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid transparent;
  border-radius: var(--radius);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition), background var(--transition), border-color var(--transition), color var(--transition), opacity var(--transition);
}

.btn-sm {
  height: 30px;
  padding: 0 12px;
  font-size: 12px;
}

.btn-ghost {
  background: transparent;
  border-color: var(--border-muted);
  color: var(--text-secondary);
}

.btn-ghost:hover {
  border-color: var(--accent-light);
  color: var(--accent-light);
  background: var(--bg-raised);
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent-light), var(--accent));
  color: var(--text-on-color);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: .55;
  cursor: not-allowed;
  transform: none;
}

.form-control {
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--border-muted);
  border-radius: var(--radius);
  background: var(--bg-raised);
  color: var(--text-primary);
  font: inherit;
  font-size: 13px;
  transition: border-color var(--transition), background var(--transition);
}

.form-control:focus {
  outline: none;
  border-color: var(--accent-light);
  background: var(--bg-surface);
}

.form-control::placeholder {
  color: var(--text-subtle);
}

.alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius);
  border: 1px solid transparent;
  font-size: 13px;
  margin-bottom: 16px;
}

.alert-success {
  background: rgba(63, 185, 80, .12);
  border-color: rgba(63, 185, 80, .3);
  color: var(--green-text);
}

.alert-danger {
  background: rgba(218, 54, 51, .12);
  border-color: rgba(218, 54, 51, .3);
  color: var(--red-light);
}

.alert__close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  opacity: .7;
  line-height: 1;
}

.alert__close:hover {
  opacity: 1;
}

/* ===== header pagina ===== */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 22px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.page-title {
  font-family: var(--font-sans);
  font-size: 26px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -.01em;
  line-height: 1.1;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.month-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  background: var(--bg-surface);
  border: 1px solid var(--border-muted);
  border-radius: 999px;
  padding: 4px;
}

.month-nav__btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: none;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition), color var(--transition);
}

.month-nav__btn:hover {
  background: var(--bg-raised);
  color: var(--accent-light);
}

.month-nav__label {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-primary);
  padding: 0 10px;
  min-width: 118px;
  text-align: center;
  text-transform: capitalize;
}

.today-btn {
  padding: 7px 16px;
  border-radius: 999px;
  border: 1px solid var(--border-muted);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color var(--transition), color var(--transition);
}

.today-btn:hover {
  border-color: var(--accent-light);
  color: var(--accent-light);
}

/* ===== KPI ===== */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.kpi-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
}

.kpi-card__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-card__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.kpi-card__label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: var(--text-subtle);
}

.kpi-card__value {
  font-family: var(--font-mono);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

@media (max-width: 640px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    align-items: flex-start;
  }
}

.hint-line {
  font-size: 12px;
  color: var(--text-subtle);
  margin: -8px 0 12px;
}

/* ===== intestazione giorni ===== */
.weekday-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 6px;
}

.weekday-header span {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: var(--text-subtle);
  text-align: center;
}

/* ===== calendario ===== */
.calendar {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.week-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

/* FIX: il wrap è ora il contenitore posizionato e dimensionato dalla griglia;
   day-cell e quick-toggle sono fratelli al suo interno, non più uno dentro l'altro. */
.day-cell-wrap {
  position: relative;
  aspect-ratio: 1 / 0.8;
}

.day-cell {
  position: absolute;
  inset: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  cursor: pointer;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  transition: border-color var(--transition), transform var(--transition);
  text-align: left;
}

.day-cell:hover {
  border-color: var(--accent-light);
}

.day-cell.is-outside {
  opacity: 0.35;
  cursor: default;
}

.day-cell.is-today {
  box-shadow: 0 0 0 1px var(--accent-light) inset;
}

.day-cell.is-closed {
  background: var(--bg-raised);
}

.day-cell.is-active {
  border-color: var(--accent-light);
  border-width: 2px;
}

.day-cell__num {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-secondary);
}

.day-cell__dot {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.day-cell__name {
  font-size: 11px;
  color: var(--text-primary);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: auto;
}

.day-cell__name--closed {
  color: var(--red-text);
}

.dot-red {
  background: var(--red);
}

.dot-green {
  background: var(--green);
}

.dot-yellow {
  background: var(--yellow);
}

.dot-grey {
  background: var(--text-subtle);
}

/* toggle rapido "chiuso": ora fratello di .day-cell, posizionato rispetto a .day-cell-wrap */
.quick-toggle {
  position: absolute;
  top: 6px;
  left: 6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid var(--border-muted);
  background: var(--bg-overlay);
  color: var(--text-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: .45;
  cursor: pointer;
  transition: opacity var(--transition), color var(--transition), border-color var(--transition), background var(--transition);
  z-index: 2;
}

.day-cell-wrap:hover .quick-toggle {
  opacity: 1;
}

.quick-toggle:hover {
  border-color: var(--accent-light);
  color: var(--accent-light);
}

.quick-toggle.is-on {
  opacity: 1;
  color: var(--red-text);
  border-color: var(--red);
  background: rgba(218, 54, 51, .14);
}

.quick-toggle.is-busy {
  opacity: .6;
  pointer-events: none;
}

/* ===== editor inline, attaccato alla settimana ===== */
.inline-editor {
  position: relative;
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 20px;
  align-items: start;
  background: var(--bg-overlay);
  border: 1px solid var(--accent-light);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  margin: -2px 0 4px;
  animation: drop-in .12s ease;
}

@keyframes drop-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.inline-editor__arrow {
  position: absolute;
  top: -7px;
  width: 12px;
  height: 12px;
  background: var(--bg-overlay);
  border-left: 1px solid var(--accent-light);
  border-top: 1px solid var(--accent-light);
  transform: rotate(45deg);
}

.inline-editor__col {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.inline-editor__col--identity {
  border-right: 1px solid var(--border);
  padding-right: 16px;
  padding-top: 2px;
}

.inline-editor__weekday {
  font-size: 14px;
  font-weight: 600;
  text-transform: capitalize;
  color: var(--text-primary);
}

.inline-editor__date {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
}

/* selettore di stato unico: un click cambia lo stato del giorno */
.status-picker {
  display: inline-flex;
  gap: 4px;
  background: var(--bg-base);
  border: 1px solid var(--border-muted);
  border-radius: 999px;
  padding: 3px;
  width: fit-content;
}

.status-pill {
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 500;
  padding: 5px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: background var(--transition), color var(--transition);
  white-space: nowrap;
}

.status-pill:hover {
  color: var(--text-primary);
}

.status-pill.active {
  background: var(--bg-raised);
  color: var(--text-primary);
}

.status-pill--green.active {
  background: rgba(63, 185, 80, .18);
  color: var(--green-text);
}

.status-pill--yellow.active {
  background: rgba(227, 179, 65, .18);
  color: var(--yellow-text);
}

.status-pill--red.active {
  background: rgba(218, 54, 51, .18);
  color: var(--red-text);
}

.inline-editor__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.inline-editor__row .form-control {
  flex: 1;
  min-width: 0;
}

.inline-editor__thumb {
  width: 30px;
  height: 30px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.inline-editor__schedule {
  max-width: 220px;
}

.inline-editor__closed-msg {
  font-size: 13px;
  color: var(--text-muted);
  font-style: italic;
}

.inline-editor__col--actions {
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 2px;
}

/* ===== responsive ===== */
@media (max-width: 720px) {
  .day-cell__name {
    display: none;
  }

  .inline-editor {
    grid-template-columns: 1fr;
  }

  .inline-editor__col--identity {
    border-right: none;
    border-bottom: 1px solid var(--border);
    padding-right: 0;
    padding-bottom: 10px;
    flex-direction: row;
    align-items: baseline;
    gap: 8px;
  }

  .inline-editor__col--actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .inline-editor__row {
    flex-wrap: wrap;
  }
}
</style>

