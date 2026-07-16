<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  booking: { type: Object, required: true },
  selectedDateIso: { type: String, required: false },
  selectedDay: { type: Object, required: false },
  occasionOptions: { type: Array, required: true },
})

const emit = defineEmits(['back', 'success'])

const occasionOptions = ["Normale", "Compleanno", "Evento"]

const isSubmitting = ref(false)
const submitError = ref('')
const submitSuccess = ref(null)

onMounted(() => {
  if (!props.booking.occasion) {
    props.booking.occasion = 'Normale'
  }
})

function parseIsoDate(isoDate) {
  if (!isoDate) return null
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function calculateDemandForSlot(date, time) {
  if (!date || !time) return null

  const dayNumber = date.getDate()
  const weekday = date.getDay()
  const month = date.getMonth() + 1
  let load = (18 + dayNumber * 11 + weekday * 17 + month * 7) % 48

  if (weekday === 0 || weekday === 6) load += 12
  if ([5, 12, 20, 24, 31].includes(dayNumber)) load += 18
  if (dayNumber % 5 === 0) load += 9

  const hour = Number.parseInt(time.slice(0, 2), 10)
  const shift = hour < 15 ? 'lunch' : 'dinner'
  const capacity = shift === 'lunch' ? 60 : 80
  const offset = hour < 14 ? -5 : hour < 18 ? 10 : 20
  const covers = Math.min(capacity, 10 + load + offset)
  const remaining = Math.max(0, capacity - covers)
  const normalizedLoad = Math.min(100, Math.round((covers / capacity) * 100))
  const status = remaining === 0 ? 'full' : normalizedLoad >= 70 ? 'hot' : normalizedLoad >= 40 ? 'medium' : 'green'

  return { capacity, covers, remaining, load: normalizedLoad, status, isFull: remaining === 0 }
}

function isSlotAvailable(dateIso, time, partySize) {
  const demand = calculateDemandForSlot(parseIsoDate(dateIso), time)
  if (!demand) return false
  return !demand.isFull && demand.remaining >= partySize
}

const selectedDate = computed(() => parseIsoDate(props.selectedDateIso))
const slotDemand = computed(() => calculateDemandForSlot(selectedDate.value, props.booking.time))
const slotAvailable = computed(() => isSlotAvailable(props.selectedDateIso, props.booking.time, props.booking.guests))

async function onSubmit(e) {
  e.preventDefault()

  if (!props.booking || !props.selectedDateIso) {
    submitError.value = 'Dati prenotazione mancanti, torna indietro e riprova.'
    return
  }

  submitError.value = ''
  submitSuccess.value = null
  isSubmitting.value = true

  const body = {
    nome_cliente: props.booking.name,
    telefono: props.booking.phone,
    numero_persone: props.booking.guests,
    occasione: props.booking.occasion,
    ora: props.booking.time,
    note: props.booking.notes,
    data: props.selectedDateIso,
  }

  try {
    const res = await fetch('/api/prenotazioni-pubbliche', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.messages?.error || 'Errore nella prenotazione, riprova.')
    }

    const result = await res.json()
    submitSuccess.value = result

    emit('success', {
      booking: { ...props.booking },
      selectedDateIso: props.selectedDateIso,
      selectedDay: props.selectedDay,
      slotDemand: slotDemand.value,
      result,
    })
  } catch (err) {
    submitError.value = err.message || 'Errore imprevisto, riprova.'
  } finally {
    isSubmitting.value = false
  }
}

function goBack() {
  emit('back')
}
</script>

<template>
  <div class="recap-screen">
    <div class="card-heading">
      <p class="eyebrow">Step 2</p>
      <h3 class="pb-1">Riepilogo prenotazione</h3>
    </div>

    <div class="selected-day-banner">
      <div class="banner-cell left">
        <div class="banner-date">
          <span class="label">Data</span>
          <strong class="date-value">{{ selectedDay ? `${selectedDay.weekday} ${selectedDay.dayNumber}` : 'Nessuna'
            }}</strong>
        </div>
      </div>

      <div class="banner-cell right">
        <div class="banner-actions">
          <button type="button" class="ghost-button" @click="goBack" :disabled="isSubmitting">Modifica data</button>
        </div>
      </div>
    </div>

    <form class="request-form" @submit="onSubmit">
      <div class="form-grid">
        <label>
          Nome e cognome
          <input v-model="booking.name" type="text" placeholder="Mario Rossi" required :disabled="isSubmitting" />
        </label>

        <label>
          Telefono
          <input v-model="booking.phone" type="tel" placeholder="+39 333 1234567" required :disabled="isSubmitting" />
        </label>

        <label>
          Numero ospiti
          <input id="guests-input" v-model.number="booking.guests" type="number" min="1" max="12" required
            :disabled="isSubmitting" />
        </label>

        <label>
          Occasione
          <select v-model="booking.occasion" :disabled="isSubmitting">
            <option v-for="option in occasionOptions" :key="option" :value="option">{{ option }}</option>
          </select>
        </label>

        <label>
          Orario
          <select v-model="booking.time" required :disabled="isSubmitting">
            <option value="">Seleziona orario</option>
            <option value="12:00">12:00</option>
            <option value="12:30">12:30</option>
            <option value="13:00">13:00</option>
            <option value="18:30">18:30</option>
            <option value="19:00">19:00</option>
            <option value="19:30">19:30</option>
            <option value="20:00">20:00</option>
            <option value="20:30">20:30</option>
          </select>

          <div v-if="booking.time" class="slot-availability">
            <small v-if="slotDemand">
              Disponibilità stimata: <strong>{{ slotDemand.status }}</strong>
              · posti stimati: {{ slotDemand.remaining }}
            </small>

            <label v-if="!slotAvailable" class="risky-field">
              <input type="checkbox" v-model="booking.risky" :disabled="isSubmitting" />
              Prenota comunque e richiedi notifica SMS se si libera un posto
            </label>
          </div>
        </label>

        <label v-if="booking.occasion === 'Compleanno'" class="cake-field">
          <input type="checkbox" v-model="booking.cake" :disabled="isSubmitting" />
          Vuoi la torta di compleanno?
        </label>
      </div>

      <label class="notes-field">
        Richieste particolari
        <textarea v-model="booking.notes" rows="4" placeholder="Allergie, seggiolone, torta di compleanno o altre note"
          :disabled="isSubmitting"></textarea>
      </label>

      <p v-if="submitError" class="form-error">{{ submitError }}</p>

      <p v-if="submitSuccess" class="form-success">
        <span v-if="submitSuccess.stato === 'in_attesa'">
          Prenotazione ricevuta, in attesa di conferma tavolo.
        </span>
        <span v-else>
          Prenotazione confermata, tavolo assegnato.
        </span>
      </p>

      <div class="booking-footer">
        <button type="button" class="ghost-button" @click="goBack" :disabled="isSubmitting">Modifica data</button>
        <button class="confirm-reservation" type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Invio in corso…' : 'Conferma prenotazione' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.confirm-reservation {
  background: var(--green-darker);  
}

.confirm-reservation:disabled,
.ghost-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-error {
  color: #b3261e;
  font-size: 14px;
  margin: 0.5rem 0;
}

.form-success {
  color: #146c2e;
  font-size: 14px;
  margin: 0.5rem 0;
}
</style>