<script setup>
const props = defineProps({
  day: { type: Object, required: true },
  selectedIso: { type: String, required: false },
})

const emit = defineEmits(['select'])

function onClick() {
  if (props.day.isDisabled) return
  emit('select', props.day)
}
</script>

<template>
  <div v-if="day.empty" class="calendar-empty" aria-hidden="true"></div>

  <button
    v-else
    type="button"
    class="calendar-day"
    :class="[
      `status-${day.status}`,
      { selected: day.iso === selectedIso, today: day.isToday, 'is-past': day.isPast },
    ]"
    :disabled="day.isDisabled"
    :aria-pressed="day.iso === selectedIso"
    :aria-current="day.isToday ? 'date' : undefined"
    @click="onClick"
  >
    <span class="day-head">
      <strong>{{ day.dayNumber }}</strong>
      <em>{{ day.weekday }}</em>
    </span>

    <span
      class="day-status"
      :class="day.isPast ? 'status-dot-past' : `status-dot-${day.status}`"
      aria-hidden="true"
    ></span>

    <template v-if="!day.isPast">
      <span class="day-stats">{{ day.covers }}/{{ day.capacity }} coperti</span>

      <span class="day-bar" aria-hidden="true">
        <span :style="{ width: `${day.load}%` }"></span>
      </span>
    </template>
  </button>
</template>
