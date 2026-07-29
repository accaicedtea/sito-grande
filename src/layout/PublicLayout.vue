<template>
  <div class="app-layout">
    <GfxNavbar />

    <main class="app-layout__main">
      <router-view />
    </main>

    <GfxFooter />
  </div>
</template>

<script setup>
import GfxNavbar from '../components/public/Navbar.vue'
import GfxFooter from '../components/public/Footer.vue'

import '../styles/themes/base.css'
import '../styles/themes/theme-osteria.css'
import '../styles/themes/theme-poster.css'
import '../styles/themes/theme-rock.css'
import '../styles/themes/theme-serra.css'
import '../styles/themes/theme-riviera.css'
</script>


