<template>
  <div class="order-system">
    <h3>Il tuo ordine: #{{ orderCode }}</h3>
    
    <div class="products-list">
      <div v-for="product in availableProducts" :key="product.id" class="product">
        {{ product.name }} - {{ product.price }}€
        <button @click="addProduct(product)">+</button>
      </div>
    </div>
    
    <div class="selected-items">
      <h4>Prodotti selezionati:</h4>
      <div v-for="product in selectedProducts" :key="product.id" class="selected-item">
        {{ product.name }}
        <button @click="removeProduct(product.id)">×</button>
      </div>
    </div>
    
    <button @click="finalizeOrder" class="submit-btn">
      Comunica ordine al cameriere: #{{ orderCode }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useOrderSystem } from '../../config/orderCodeGenerator.js';

const { orderCode, selectedProducts, addProduct, removeProduct, submitOrder } = useOrderSystem();

const availableProducts = ref([
  { id: 1, name: 'Pizza Margherita', price: 7.50 },
  { id: 2, name: 'Pizza Diavola', price: 9.00 },
  { id: 3, name: 'Spaghetti Carbonara', price: 11.00 },
  // altri prodotti...
]);

function finalizeOrder() {
  const order = submitOrder();
  console.log('Ordine inviato:', order);
  // Qui potrebbe esserci una chiamata API per inviare l'ordine
  alert(`Ordine #${order.code} inviato al cameriere!`);
}
</script>