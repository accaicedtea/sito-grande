<template>
  <div class="management-shell page-md">
    <div class="page-header">
      <div>
        <small style="font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:.2em;color:var(--accent-light)">PRENOTAZIONI</small>
        <h1 class="page-title">Gestione prenotazioni</h1>
      </div>
      <div class="page-actions"><RouterLink class="btn btn-ghost btn-sm" to="/prenotazioni">Apri flusso pubblico</RouterLink><button class="btn btn-ghost btn-sm btn-icon" @click="refreshData" title="Aggiorna"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg></button></div>
    </div>

    <div v-if="msg" class="alert" :class="msgType === 'success' ? 'alert-success' : 'alert-danger'"><span>{{ msg }}</span><button class="alert__close" @click="msg = ''">✕</button></div>

    <div class="kpi-grid" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr));margin-bottom:20px"><div class="kpi-card"><div class="kpi-card__body"><span class="kpi-card__label">Prenotazione attiva</span><span class="kpi-card__value">{{ activeReservation ? '1' : '0' }}</span><span class="kpi-card__sub">{{ activeReservation ? activeReservationLabel : 'Nessuna prenotazione salvata' }}</span></div></div><div class="kpi-card"><div class="kpi-card__body"><span class="kpi-card__label">Bozza locale</span><span class="kpi-card__value">{{ draftSummary ? '1' : '0' }}</span><span class="kpi-card__sub">{{ draftSummary || 'Nessuna bozza' }}</span></div></div><div class="kpi-card"><div class="kpi-card__body"><span class="kpi-card__label">Richieste SMS</span><span class="kpi-card__value">{{ notificationRequests.length }}</span><span class="kpi-card__sub">Lista attese / rischio</span></div></div></div>

    <div class="card-grid">
      <section class="card"><div class="card__header"><h2 class="card__title">Prenotazione attiva</h2><div class="d-flex gap-8"><button v-if="activeReservation" class="btn btn-ghost btn-sm" @click="goToPublicBooking">Apri modifica</button><button v-if="activeReservation" class="btn btn-danger btn-sm" @click="removeActiveReservation">Elimina</button></div></div><div v-if="activeReservation" class="reservation-summary"><div class="reservation-summary__row"><span>Nome</span><strong>{{ activeReservation.name }}</strong></div><div class="reservation-summary__row"><span>Data</span><strong>{{ selectedDayLabel }}</strong></div><div class="reservation-summary__row"><span>Orario</span><strong>{{ activeReservation.time }}</strong></div><div class="reservation-summary__row"><span>Persone</span><strong>{{ activeReservation.guests }}</strong></div><div class="reservation-summary__row"><span>Telefono</span><strong>{{ activeReservation.phone }}</strong></div><div class="reservation-summary__row"><span>Stato</span><strong>{{ systemReservationEditable ? 'Modificabile' : 'Bloccata' }}</strong></div><div v-if="cutoffLabel" class="reservation-summary__footnote">Modificabile fino a: {{ cutoffLabel }}</div></div><div v-else class="empty-state" style="border:none;padding:32px 18px"><span class="empty-icon">📅</span><span>Nessuna prenotazione attiva da gestire</span></div></section>
      <section class="card"><div class="card__header"><h2 class="card__title">Bozza salvata</h2><button v-if="draftData" class="btn btn-ghost btn-sm" @click="clearDraft">Svuota bozza</button></div><div v-if="draftData" class="reservation-summary"><div class="reservation-summary__row"><span>Nome</span><strong>{{ draftData.booking?.name || '—' }}</strong></div><div class="reservation-summary__row"><span>Data</span><strong>{{ draftData.selectedDay?.weekday || '—' }} {{ draftData.selectedDay?.dayNumber || '' }}</strong></div><div class="reservation-summary__row"><span>Orario</span><strong>{{ draftData.booking?.time || '—' }}</strong></div><div class="reservation-summary__row"><span>Persone</span><strong>{{ draftData.booking?.guests || '—' }}</strong></div><div class="reservation-summary__row"><span>Note</span><strong>{{ draftData.booking?.notes || 'Nessuna' }}</strong></div></div><div v-else class="empty-state" style="border:none;padding:32px 18px"><span class="empty-icon">📝</span><span>Nessuna bozza locale disponibile</span></div></section>
    </div>

    <section class="card mt-24"><div class="card__header"><h2 class="card__title">Richieste SMS / rischio</h2><button v-if="notificationRequests.length" class="btn btn-ghost btn-sm" @click="clearNotifications">Svuota elenco</button></div><div class="table-wrap" v-if="notificationRequests.length"><table class="table-cards" style="width:100%"><thead><tr><th>Telefono</th><th>Data</th><th>Ora</th><th>Persone</th><th>Occasione</th><th>Stato</th></tr></thead><tbody><tr v-for="request in notificationRequests" :key="request.id"><td class="mono">{{ request.phone }}</td><td>{{ request.service_date }}</td><td class="mono">{{ request.service_time }}</td><td>{{ request.party_size }}</td><td>{{ request.occasion }}</td><td><span class="badge" :class="request.notified ? 'badge-green' : 'badge-yellow'">{{ request.notified ? 'Notificato' : 'In attesa' }}</span></td></tr></tbody></table></div><div v-else class="empty-state" style="border:none;padding:32px 18px"><span class="empty-icon">📨</span><span>Nessuna richiesta registrata</span></div></section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useSystemReservation } from '../../composables/useSystemReservation.js'
import { useBooking } from '../../composables/useBooking.js'

const router = useRouter()
const msg = ref('')
const msgType = ref('')
const draftData = ref(null)
const notificationRequests = ref([])

const { activeReservation, deleteSystemReservation, systemReservationEditable, systemReservationCutoffLabel } = useSystemReservation()
const { loadDraft } = useBooking()

const activeReservationLabel = computed(() => { if (!activeReservation.value) return ''; const day = activeReservation.value.selectedDay; return day ? `${day.weekday || 'Data'} ${day.dayNumber || ''}`.trim() : 'Data non disponibile' })
const selectedDayLabel = computed(() => activeReservationLabel.value || '—')
const draftSummary = computed(() => { if (!draftData.value) return ''; const booking = draftData.value.booking || {}; const day = draftData.value.selectedDay || {}; return [booking.name, day.weekday, day.dayNumber, booking.time].filter(Boolean).join(' · ') })

function readNotificationRequests() { try { const raw = localStorage.getItem('notification_requests'); return raw ? JSON.parse(raw) : [] } catch { return [] } }
function refreshData() { draftData.value = loadDraft(); notificationRequests.value = readNotificationRequests() }
function goToPublicBooking() { router.push('/prenotazioni') }
function removeActiveReservation() { if (!confirm('Eliminare la prenotazione attiva?')) return; deleteSystemReservation(); refreshData(); msg.value = 'Prenotazione attiva eliminata'; msgType.value = 'success' }
function clearDraft() { localStorage.removeItem('ristorante-prenotazione-draft'); refreshData(); msg.value = 'Bozza eliminata'; msgType.value = 'success' }
function clearNotifications() { localStorage.removeItem('notification_requests'); refreshData(); msg.value = 'Elenco richieste svuotato'; msgType.value = 'success' }
function handleStorageChange(event) { if (!event.key || ['notification_requests', 'ristorante-prenotazione-draft', 'ristorante-system-reservation'].includes(event.key)) { refreshData() } }

onMounted(() => { refreshData(); window.addEventListener('storage', handleStorageChange) })
onBeforeUnmount(() => { window.removeEventListener('storage', handleStorageChange) })
</script>




<style scoped>
.reservation-summary { display: grid; gap: 10px; }
.reservation-summary__row { display: flex; justify-content: space-between; gap: 16px; padding: 10px 12px; border-radius: 10px; background: var(--bg-raised); border: 1px solid var(--border); }
.reservation-summary__row span { color: var(--text-muted); }
.reservation-summary__row strong { color: var(--text-primary); text-align: right; }
.reservation-summary__footnote { font-size: 12px; color: var(--text-muted); }
</style>