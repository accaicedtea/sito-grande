// src/stores/menuStore.js
import { ref, computed } from 'vue';
import api from '../shared/api/client.js';

export const categories = ref([]);
export const items = ref([]);
export const allergens = ref([]);
export const isLoading = ref(false);
export const isLoaded = ref(false);
export const error = ref(null);
export const currentLang = ref('fr');

/* fallback solo se il backend non fornisce un'icona per l'allergene */
const ALLERGEN_ICON_FALLBACK = {
  'Glutine': '🌾', 'Crostacei': '🦐', 'Uova': '🥚', 'Pesce': '🐟',
  'Arachidi': '🥜', 'Soia': '🌱', 'Latte e derivati': '🥛', 'Frutta a guscio': '🌰',
  'Sedano': '🥬', 'Senape': '🟡', 'Semi di sesamo': '⚪',
  'Anidride solforosa e solfiti': '🍷', 'Lupini': '🫘', 'Molluschi': '🐚',
  'Gluten': '🌾', 'Crustacés': '🦐', 'Œufs': '🥚', 'Poisson': '🐟',
  'Arachides': '🥜', 'Soja': '🌱', 'Lait': '🥛', 'Fruits à coque': '🌰',
  'Céleri': '🥬', 'Moutarde': '🟡', 'Graines de sésame': '⚪',
  'Sulfites': '🍷', 'Lupin': '🫘', 'Mollusques': '🐚',
  'Krebstiere': '🦐', 'Eier': '🥚', 'Fisch': '🐟', 'Erdnüsse': '🥜',
  'Milch': '🥛', 'Schalenfrüchte': '🌰', 'Sellerie': '🥬', 'Senf': '🟡',
  'Sesamsamen': '⚪', 'Sulfite': '🍷', 'Lupinen': '🫘', 'Weichtiere': '🐚',
};

function mapCategoryIcon(nome) {
  const map = {
    'Pizze': 'pizza-slice',
    'Paste': 'utensils',
    'Antipasti': 'utensils',
    'Insalate': 'leaf',
    'Dessert': 'cake-candles',
    'Bevande': 'glass-water',
    'Birre': 'beer',
    'Vini': 'wine-glass-alt',
    'Cocktail': 'cocktail',
    'Analcolici': 'glass-whiskey'
  };
  return map[nome] || 'utensils';
}

export async function loadAllMenuData(menuSlug = 'menu-principale', lang = 'fr') {
  if (isLoaded.value && lang === currentLang.value) return;

  isLoading.value = true;
  error.value = null;

  try {
    const response = await api.get(`/menu/pubblici/${menuSlug}`, { params: { lang } });
    const menuData = response.data?.menu || response.data;

    if (!menuData) throw new Error('Struttura menu non valida');
    if (!Array.isArray(menuData.categorie)) {
      console.error('menuData.categorie non è un array:', menuData);
      throw new Error('Il menu non contiene categorie valide.');
    }

    categories.value = [];
    items.value = [];
    allergens.value = [];

    const cats = [];
    const allItems = [];
    const allergenMapById = new Map();

    menuData.categorie.forEach((cat, catIdx) => {
      const catId = `cat_${catIdx}_${cat.nome.replace(/\s+/g, '_').toLowerCase()}`;
      cats.push({
        id: catId,
        title: cat.nome,
        nome: cat.nome,
        icon: mapCategoryIcon(cat.nome),
        ordine: parseInt(cat.ordine) || catIdx
      });

      cat.prodotti.forEach((prod, prodIdx) => {
        // il backend ora restituisce un array di oggetti { id, codice, nome, icona }
        const allergeniArray = Array.isArray(prod.allergeni) ? prod.allergeni : [];

        const item = {
          id: `${catId}_${prodIdx}`,
          category_id: catId,
          name: prod.nome,
          description: prod.descrizione,
          price: `€${Number(prod.prezzo).toFixed(2)}`,
          prezzo: prod.prezzo,
          allergens: allergeniArray, // array di oggetti { id, codice, nome, icona }
          vegan: prod.vegan,
          vegetariano: prod.vegetariano,
          senzaGlutine: prod.senza_glutine,
          biologico: prod.biologico,
          piccante_livello: prod.piccante_livello,
          in_evidenza: prod.in_evidenza,
          note: prod.note || ''
        };
        allItems.push(item);

        allergeniArray.forEach(a => {
          if (a && a.id != null && !allergenMapById.has(a.id)) {
            allergenMapById.set(a.id, a);
          }
        });
      });
    });

    allergens.value = Array.from(allergenMapById.values())
      .filter(a => a.nome && a.nome.trim() !== '')
      .sort((a, b) => a.nome.localeCompare(b.nome))
      .map(a => ({
        id: a.id,
        codice: a.codice,
        name: a.nome,
        icon: a.icona || ALLERGEN_ICON_FALLBACK[a.nome] || '❔',
      }));

    categories.value = cats;
    items.value = allItems;

    currentLang.value = lang;
    isLoaded.value = true;
  } catch (err) {
    error.value = err.message || 'Errore sconosciuto';
    categories.value = [];
    items.value = [];
    allergens.value = [];
    console.error('Errore nel caricamento del menu:', err);
  } finally {
    isLoading.value = false;
  }
}

export const categoriesWithItems = computed(() => {
  return categories.value
    .filter(cat => items.value.some(item => item.category_id === cat.id))
    .sort((a, b) => a.ordine - b.ordine)
    .map(cat => ({
      ...cat,
      items: items.value.filter(item => item.category_id === cat.id)
    }));
});

export const navLinks = computed(() => {
  return categoriesWithItems.value.map(cat => ({
    id: cat.id,
    target: `#${cat.id}`,
    icon: cat.icon,
    text: cat.title
  }));
});

export function filteredCategories(selectedCategory) {
  if (selectedCategory === 'all') return categoriesWithItems.value;
  return categoriesWithItems.value.filter(cat => cat.id === selectedCategory);
}