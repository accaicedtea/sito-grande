// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Importa le icone che intendi utilizzare (esempi)
import { 
  faHome, 
  faUtensils, 
  faCalendarAlt, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt,
  faUser,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons'

import { 
  faFacebook, 
  faInstagram, 
  faTwitter 
} from '@fortawesome/free-brands-svg-icons'

// Aggiungi le icone alla libreria globale
library.add(
  faHome, 
  faUtensils, 
  faCalendarAlt, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt,
  faUser,
  faSignOutAlt,
  faFacebook, 
  faInstagram, 
  faTwitter
)

const app = createApp(App)

// Registra il componente FontAwesomeIcon globalmente
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(router)
app.mount('#app')