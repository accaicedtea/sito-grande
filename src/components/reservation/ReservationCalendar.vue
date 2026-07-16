<script setup>
import { computed, ref } from 'vue'
import CalendarDay from './CalendarDay.vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'select', 'clear-selection'])

const weekdays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']
const today = startOfDay(new Date())
const monthOffset = ref(getInitialMonthOffset(props.modelValue))

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function toIsoDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseIsoDate(isoDate) {
  if (!isoDate) {
    return null
  }

  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function mondayIndex(date) {
  return (date.getDay() + 6) % 7
}

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getInitialMonthOffset(isoDate) {
  const parsed = parseIsoDate(isoDate)

  if (!parsed) {
    return 0
  }

  return (parsed.getFullYear() - today.getFullYear()) * 12 + (parsed.getMonth() - today.getMonth())
}

function calculateDemand(date) {
  const dayNumber = date.getDate()
  const weekday = date.getDay()
  const month = date.getMonth() + 1
  let load = (18 + dayNumber * 11 + weekday * 17 + month * 7) % 48

  if (weekday === 0 || weekday === 6) {
    load += 12
  }

  if ([5, 12, 20, 24, 31].includes(dayNumber)) {
    load += 18
  }

  if (dayNumber % 5 === 0) {
    load += 9
  }

  const capacity = 80
  const covers = Math.min(capacity, 10 + load)
  const remaining = Math.max(0, capacity - covers)
  const normalizedLoad = Math.min(100, Math.round((covers / capacity) * 100))
  const status = remaining === 0 ? 'full' : normalizedLoad >= 70 ? 'hot' : normalizedLoad >= 40 ? 'medium' : 'green'

  return {
    capacity,
    covers,
    remaining,
    load: normalizedLoad,
    status,
    isFull: remaining === 0,
  }
}

function buildMonthDaysFor(monthDate) {
  const totalDays = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  const todayStart = startOfDay(today)

  return Array.from({ length: totalDays }, (_, index) => {
    const dayNumber = index + 1
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayNumber)
    const iso = toIsoDate(date)
    const demand = calculateDemand(date)
    const isPast = date < todayStart

    return {
      key: iso,
      dayNumber,
      iso,
      weekday: weekdays[mondayIndex(date)],
      isPast,
      isToday: iso === toIsoDate(today),
      isDisabled: isPast || demand.isFull,
      ...demand,
    }
  })
}

function buildCalendarGrid(days, monthDate) {
  const leadingBlanks = mondayIndex(getMonthStart(monthDate))
  const totalCells = Math.ceil((leadingBlanks + days.length) / 7) * 7

  return Array.from({ length: totalCells }, (_, index) => {
    const dayIndex = index - leadingBlanks

    if (dayIndex < 0 || dayIndex >= days.length) {
      return { empty: true, key: `empty-${index}` }
    }

    return days[dayIndex]
  })
}

function createDayForDate(date) {
  const demand = calculateDemand(date)
  const iso = toIsoDate(date)

  return {
    key: iso,
    dayNumber: date.getDate(),
    iso,
    weekday: weekdays[mondayIndex(date)],
    isPast: date < startOfDay(today),
    isToday: iso === toIsoDate(today),
    isDisabled: date < startOfDay(today) || demand.isFull,
    ...demand,
  }
}

const currentMonthDate = computed(() => new Date(today.getFullYear(), today.getMonth() + monthOffset.value, 1))
const monthLabel = computed(() =>
  new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric' }).format(currentMonthDate.value),
)
const days = computed(() => buildMonthDaysFor(currentMonthDate.value))
const calendarGrid = computed(() => buildCalendarGrid(days.value, currentMonthDate.value))
const canGoPrev = computed(() => monthOffset.value > 0)
const canGoNext = computed(() => true)

function selectDay(day) {
  if (day.isDisabled) {
    return
  }

  emit('update:modelValue', day.iso)
  emit('select', day)
}

function goToPrevMonth() {
  if (!canGoPrev.value) {
    return
  }

  monthOffset.value -= 1
  emit('update:modelValue', '')
  emit('clear-selection')
}

function goToNextMonth() {
  monthOffset.value += 1
  emit('update:modelValue', '')
  emit('clear-selection')
}

function goToToday() {
  monthOffset.value = 0
  emit('update:modelValue', '')
  emit('clear-selection')
}
</script>

<template>
  <section class="calendar-shell">
    <div class="calendar-toolbar">
      <div>
        <p class="eyebrow">Calendario disponibilità</p>
        <h2>{{ monthLabel }}</h2>
      </div>

      <div class="calendar-toolbar-actions">
        <div class="calendar-nav" aria-label="Navigazione mesi">
          <button type="button" class="calendar-nav-button arrow" :disabled="!canGoPrev" @click="goToPrevMonth">
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" class="calendar-nav-button arrow" :disabled="!canGoNext" @click="goToNextMonth">
            <span aria-hidden="true">›</span>
          </button>
          <button type="button" class="calendar-nav-button today" @click="goToToday">
            <span aria-hidden="true">●</span>
            <span class="today-label">Oggi</span>
          </button>
        </div>

        <div class="calendar-legend" aria-label="Legenda del calendario">
          <span class="status-swatch status-swatch-green" aria-hidden="true"></span>
          <span class="status-swatch status-swatch-amber" aria-hidden="true"></span>
          <span class="status-swatch status-swatch-red" aria-hidden="true"></span>
        </div>
      </div>
    </div>

    <div class="weekday-row" role="row" aria-label="Giorni della settimana">
      <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
    </div>

    <div class="calendar-grid" role="grid" aria-label="Calendario prenotazioni">
      <CalendarDay
        v-for="cell in calendarGrid"
        :key="cell.key"
        :day="cell"
        :selectedIso="modelValue"
        @select="selectDay"
      />
    </div>

    <div class="calendar-footnote">
      <slot name="footnote">
        <p>Seleziona un giorno verde o caldo; i giorni pieni risultano disabilitati.</p>
      </slot>
    </div>
  </section>
</template>
