// Stato del tema condiviso da tutta l'app: Header, Menu, e qualsiasi altro
// componente che usi il framework grafico (styles/themes/*). Un'unica fonte
// di verità — cambiare `theme` da un punto qualsiasi aggiorna tutto il resto.
import { ref } from 'vue'

export const theme = ref('osteria')

export const themes = [
  { id: 'osteria', label: 'Osteria' },
  { id: 'poster', label: 'Poster' },
  { id: 'rock', label: 'Rock' },
  { id: 'serra', label: 'Serra'},
  { id: 'riviera', label: 'Riviera'},
]
