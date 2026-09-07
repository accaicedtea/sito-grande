<template>
  <div class="management-shell page-md">
    <PageHeader
      title="Profilo"
      subtitle="Il tuo account"
      :show-refresh="true"
      @refresh="loadProfile"
    />

    <!-- Alert globale (successo/errore) -->
    <transition name="fade">
      <div v-if="banner.message" class="alert mb-24" :class="'alert-' + banner.type">
        <svg v-if="banner.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>{{ banner.message }}</span>
      </div>
    </transition>

    <div class="profile-grid">
      <!-- ── DATI ACCOUNT ─────────────────────────────────── -->
      <section class="card">
        <header class="card__header">
          <div>
            <div class="card__title">Dati account</div>
            <div class="card__subtitle">Nome, email e ruolo</div>
          </div>
          <span class="badge" :class="roleBadgeClass">{{ roleLabel }}</span>
        </header>

        <form class="card__body" @submit.prevent="saveProfile">
          <div class="profile-avatar-row">
            <span class="avatar avatar-lg">{{ initials }}</span>
            <div>
              <div class="profile-name">{{ form.name || 'Utente' }}</div>
              <div class="profile-email-muted">{{ original.email }}</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Nome visualizzato</label>
            <input
              v-model.trim="form.name"
              type="text"
              class="form-control"
              placeholder="Es. Marco Rossi"
              maxlength="60"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              v-model.trim="form.email"
              type="email"
              class="form-control"
              placeholder="nome@esempio.it"
              required
            />
            <div class="form-hint">Usata per l'accesso e le notifiche amministrative.</div>
          </div>

          <div class="d-flex gap-8" style="justify-content:flex-end">
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              :disabled="!profileDirty || savingProfile"
              @click="resetProfile"
            >
              Annulla modifiche
            </button>
            <button
              type="submit"
              class="btn btn-primary btn-sm"
              :disabled="!profileDirty || savingProfile"
            >
              <span v-if="savingProfile" class="spinner" aria-hidden="true"></span>
              {{ savingProfile ? 'Salvataggio…' : 'Salva modifiche' }}
            </button>
          </div>
        </form>
      </section>

      <!-- ── CAMBIO PASSWORD ─────────────────────────────── -->
      <section class="card">
        <header class="card__header">
          <div>
            <div class="card__title">Password</div>
            <div class="card__subtitle">Aggiorna la password di accesso</div>
          </div>
        </header>

        <form class="card__body" @submit.prevent="changePassword">
          <div class="form-group">
            <label class="form-label">Password attuale</label>
            <div class="input-group">
              <input
                v-model="pwd.current"
                :type="show.current ? 'text' : 'password'"
                class="form-control"
                autocomplete="current-password"
                required
              />
              <span class="input-group__addon" style="cursor:pointer" @click="show.current = !show.current">
                {{ show.current ? 'Nascondi' : 'Mostra' }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Nuova password</label>
            <div class="input-group">
              <input
                v-model="pwd.next"
                :type="show.next ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': pwd.next && !passwordStrongEnough }"
                autocomplete="new-password"
                required
              />
              <span class="input-group__addon" style="cursor:pointer" @click="show.next = !show.next">
                {{ show.next ? 'Nascondi' : 'Mostra' }}
              </span>
            </div>
            <div class="form-hint" v-if="!pwd.next">Minimo 8 caratteri, con almeno un numero.</div>
            <div class="form-error" v-else-if="!passwordStrongEnough">
              Troppo corta o priva di numeri: usa almeno 8 caratteri con un numero.
            </div>

            <!-- indicatore forza password -->
            <div class="progress mt-24" v-if="pwd.next" style="margin-top:8px">
              <div
                class="progress-bar"
                :style="{ width: strengthPercent + '%', background: strengthColor }"
              ></div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Conferma nuova password</label>
            <input
              v-model="pwd.confirm"
              :type="show.next ? 'text' : 'password'"
              class="form-control"
              :class="{ 'is-invalid': pwd.confirm && pwd.confirm !== pwd.next }"
              autocomplete="new-password"
              required
            />
            <div class="form-error" v-if="pwd.confirm && pwd.confirm !== pwd.next">
              Le password non coincidono.
            </div>
          </div>

          <div class="d-flex gap-8" style="justify-content:flex-end">
            <button
              type="submit"
              class="btn btn-primary btn-sm"
              :disabled="!canChangePassword || savingPassword"
            >
              <span v-if="savingPassword" class="spinner" aria-hidden="true"></span>
              {{ savingPassword ? 'Aggiornamento…' : 'Aggiorna password' }}
            </button>
          </div>
        </form>
      </section>

      <!-- ── SESSIONE ─────────────────────────────────────── -->
      <section class="card profile-session-card">
        <header class="card__header">
          <div>
            <div class="card__title">Sessione</div>
            <div class="card__subtitle">Accesso corrente</div>
          </div>
        </header>
        <div class="card__body">
          <div class="session-row">
            <span class="form-label" style="margin-bottom:0">Ultimo accesso</span>
            <span class="gfx-mono-value">{{ lastLoginLabel }}</span>
          </div>
          <div class="session-row">
            <span class="form-label" style="margin-bottom:0">Stato</span>
            <span class="badge badge-success badge--dot">Attivo</span>
          </div>
        </div>
        <footer class="card__footer">
          <button class="btn btn-danger btn-sm" @click="logoutEverywhere">
            Esci da tutti i dispositivi
          </button>
        </footer>
      </section>
    </div>

    <!-- ── STATO CARICAMENTO INIZIALE ───────────────────────── -->
    <div v-if="loading" class="empty-state">
      <span class="spinner" style="width:24px;height:24px;margin-bottom:16px"></span>
      <div class="empty-state__title">Caricamento profilo…</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import PageHeader from '../../components/managment/PageHeader.vue'

/* ── API helper (stesso pattern usato nella dashboard) ────── */
async function api(method, path, body) {
  const token = localStorage.getItem('admin_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = 'Bearer ' + token
  const res = await fetch('/api' + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = null
  try { data = await res.json() } catch { /* risposta vuota */ }
  if (!res.ok) {
    // Estrai il messaggio di errore gestendo vari formati comunemente restituiti
    let message = null
    if (data) {
      if (typeof data === 'string') {
        message = data
      } else if (data.messages) {
        // supporta { messages: { error: '...' } } o { messages: '...' }
        if (typeof data.messages === 'string') {
          message = data.messages
        } else if (data.messages.error) {
          message = data.messages.error
        } else if (data.messages.message) {
          message = data.messages.message
        } else {
          const vals = Object.values(data.messages).flat?.() || Object.values(data.messages)
          const firstStr = Array.isArray(vals) ? vals.find(v => typeof v === 'string') : vals
          if (firstStr) message = firstStr
        }
      } else if (data.message) {
        message = data.message
      } else if (data.error) {
        message = data.error
      }
    }
    // fallback: mostra codice e testo di stato se non abbiamo un messaggio leggibile
    if (!message) message = `Errore ${res.status} ${res.statusText || ''}`.trim()
    // assicurati che sia una stringa
    if (typeof message !== 'string') message = String(message)
    throw new Error(message)
  }
  return data
}

/* ── Stato pagina ──────────────────────────────────────────── */
const loading = ref(true)
const savingProfile = ref(false)
const savingPassword = ref(false)

const banner = reactive({ type: 'success', message: '' })
let bannerTimer = null
function flash(type, message) {
  banner.type = type
  banner.message = message
  clearTimeout(bannerTimer)
  // mostra gli errori (danger) più a lungo
  const timeout = type === 'danger' ? 8000 : 4500
  bannerTimer = setTimeout(() => { banner.message = '' }, timeout)
}

/* ── Dati profilo ──────────────────────────────────────────── */
const original = reactive({ name: '', email: '', role: 'admin', lastLogin: null })
const form = reactive({ name: '', email: '' })

const profileDirty = computed(() =>
  form.name !== original.name || form.email !== original.email
)

const initials = computed(() => {
  const src = (form.name || original.email || '?').trim()
  if (!src) return '?'
  const parts = src.split(/\s+/).filter(Boolean)
  const letters = parts.length > 1
    ? parts[0][0] + parts[1][0]
    : src.slice(0, 2)
  return letters.toUpperCase()
})

const roleLabel = computed(() => {
  const map = { admin: 'Amministratore', staff: 'Staff', owner: 'Titolare' }
  return map[original.role] || original.role
})
const roleBadgeClass = computed(() => {
  const map = { admin: 'badge-info', owner: 'badge-warning', staff: 'badge-neutral' }
  return map[original.role] || 'badge-neutral'
})

const lastLoginLabel = computed(() => {
  if (!original.lastLogin) return '—'
  try {
    return new Date(original.lastLogin).toLocaleString('it-IT', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return original.lastLogin }
})

async function loadProfile() {
  loading.value = true
  try {
    const res = await api('GET', '/admin/profile')
    const p = res?.profile || res || {}
    original.name = p.name || ''
    original.email = p.email || ''
    original.role = p.role || 'admin'
    original.lastLogin = p.lastLogin || null
    resetProfile()
  } catch (e) {
    flash('danger', e.message || 'Impossibile caricare il profilo.')
  } finally {
    loading.value = false
  }
}

function resetProfile() {
  form.name = original.name
  form.email = original.email
}

async function saveProfile() {
  if (!profileDirty.value) return
  savingProfile.value = true
  try {
    await api('PUT', '/admin/profile', { name: form.name, email: form.email })
    original.name = form.name
    original.email = form.email
    flash('success', 'Profilo aggiornato correttamente.')
  } catch (e) {
    flash('danger', e.message || 'Impossibile salvare le modifiche.')
  } finally {
    savingProfile.value = false
  }
}

/* ── Cambio password ───────────────────────────────────────── */
const pwd = reactive({ current: '', next: '', confirm: '' })
const show = reactive({ current: false, next: false })

const passwordStrongEnough = computed(() =>
  pwd.next.length >= 8 && /\d/.test(pwd.next)
)

const strengthPercent = computed(() => {
  let score = 0
  if (pwd.next.length >= 8) score += 34
  if (pwd.next.length >= 12) score += 20
  if (/\d/.test(pwd.next)) score += 23
  if (/[A-Z]/.test(pwd.next)) score += 12
  if (/[^A-Za-z0-9]/.test(pwd.next)) score += 11
  return Math.min(100, score)
})
const strengthColor = computed(() => {
  if (strengthPercent.value < 40) return 'linear-gradient(90deg, var(--red), var(--red-light))'
  if (strengthPercent.value < 75) return 'linear-gradient(90deg, var(--yellow), var(--yellow-light))'
  return 'linear-gradient(90deg, var(--green), var(--green-light))'
})

const canChangePassword = computed(() =>
  pwd.current.length > 0 &&
  passwordStrongEnough.value &&
  pwd.confirm === pwd.next
)

async function changePassword() {
  if (!canChangePassword.value) return
  savingPassword.value = true
  try {
    await api('PUT', '/admin/profile/password', {
      currentPassword: pwd.current,
      newPassword: pwd.next,
    })
    pwd.current = ''
    pwd.next = ''
    pwd.confirm = ''
    flash('success', 'Password aggiornata correttamente.')
  } catch (e) {
    flash('danger', e.message || 'Password attuale errata o richiesta non valida.')
  } finally {
    savingPassword.value = false
  }
}

async function logoutEverywhere() {
  try {
    await api('POST', '/admin/profile/logout-all')
    localStorage.removeItem('admin_token')
    window.location.href = '/gestione/login'
  } catch (e) {
    flash('danger', e.message || 'Impossibile terminare le sessioni.')
  }
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
  align-items: start;
}

.profile-session-card {
  grid-column: 1 / -1;
}
@media (min-width: 860px) {
  .profile-session-card {
    grid-column: auto;
  }
}

.profile-avatar-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.profile-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.profile-email-muted {
  font-size: 12px;
  color: var(--text-muted);
}

.session-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}
.session-row:last-child {
  border-bottom: none;
}

.gfx-mono-value {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--text-secondary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>