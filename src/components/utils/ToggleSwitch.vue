<template>
    <div class="toggle-wrapper">
        <span class="toggle-label">{{ label }}</span>
        <span class="toggle-status" :class="{ on: isOn }">{{ isOn ? onLabel : offLabel }}</span>
        <div class="track" :class="{ on: isOn }" :style="{ background: isOn ? props.onBgColor : props.offBgColor }" @click="toggle">
            <div class="thumb" ref="thumbRef"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { animate } from 'animejs'

// How to use this component 
/* With correct import 
<ToggleSwitch />

---------------------------------------

You can add props to decorate de switch

<ToggleSwitch
    label="Bluetooth"
    v-model="bluetooth"
    onColor="#00bfff"
    offColor="#ff6600"
    onBgColor="#FFFFFF"
/>

---------------------------------------

You can monitor the switch status


const bluetooth  = ref(false)

const stato = computed(() => ({
  bluetooth: bluetooth.value,
}))

//print the status on console

<ToggleSwitch
    label="Bluetooth"
    v-model="bluetooth"
    onColor="#00bfff"
    offColor="#ff6600"
    onBgColor="#FFFFFF"
    @update:modelValue="onWifiChange"
/>

function onBTChange(val) {
  console.log('Bluetooth:', val)
}

// Acces value

<p v-if="stato.bluetooth === true">bluetoooooth attivoo</p>
<p v-else-if="stato.bluetooth === false">bluetoooooth non attivoo</p>

*/

const props = defineProps({
    label: { type: String, default: '' },
    
    //on Setting
    onLabel: { type: String, default: 'ON' },
    onColor: { type: String, default: '#7fff00' },
    onBgColor: {type:String, default: '#1a2a1a'},

    //off Settings
    offLabel: { type: String, default: 'OFF' },
    offColor: { type: String, default: '#dc143c' },
    offBgColor: {type:String, default: '#1a1a1a'},

    //animation Settings
    duration: { type: Number, default: 650 },
    modelValue: { type: Boolean, default: true },

    //look here to see other animations 
    //https://animejs.com/easing-editor/spring/default
    animationType: { type: String, default: "inOutBounce" },
})

const emit = defineEmits(['update:modelValue'])

const thumbRef = ref(null)
const isOn = ref(props.modelValue)
let anim = null

onMounted(() => {
    // posiziona subito il thumb in base allo stato iniziale
    animate(thumbRef.value, {
        x: isOn.value ? '30px' : '0px',
        background: isOn.value ? props.onColor : props.offColor,
        duration: 0,
    })

    anim = animate(thumbRef.value, {
        x: ['0px', '30px'],
        background: [props.offColor, props.onColor],
        duration: props.duration,
        ease: props.animationType,
        autoplay: false,
    })

    // se parte ON porta l'animazione alla fine
    if (isOn.value) anim.seek(props.duration)
})

function toggle() {
    isOn.value = !isOn.value
    isOn.value ? anim.play() : anim.reverse()
    emit('update:modelValue', isOn.value)
}

defineExpose({ isOn })
</script>

<style scoped>
.toggle-wrapper {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    user-select: none;
}

.toggle-label {
    font-size: 14px;
    color: #999;
    min-width: 80px;
}

.track {
    width: 70px;
    height: 36px;
    border-radius: 4px;
    padding: 4px;
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.thumb {
    width: 28px;
    height: 28px;
    border-radius: 3px;
    flex-shrink: 0;
}

.toggle-status {
    font-size: 13px;
    font-weight: 600;
    min-width: 60px;
    color: #dc143c;
    transition: color 650ms;
}

.toggle-status.on {
    color: #7fff00;
}
</style>