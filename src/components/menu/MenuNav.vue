<template>
  <nav class="menu-nav-container">
    <div class="nav-scroller">
      <template v-for="(link, index) in navLinks" :key="link.id">
        <a :href="link.target"
           class="nav-link fw-bold text-uppercase d-flex align-items-center"
           :class="{ active: activeCategory === link.id }"
           @click.prevent="$emit('select-category', link.id)">
          <font-awesome-icon :icon="['fas', link.icon.replace('fa-', '')]" class="me-2" />
          {{ link.text }}
        </a>
        <div v-if="index < navLinks.length - 1" class="nav-separator"></div>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { navLinks } from '../../stores/menuStore.js';

defineProps({
  activeCategory: String
});
</script>

<style scoped>
.menu-nav-container {
  position: sticky;
  top: 70px;
  z-index: 10;
  margin-bottom: 1rem;
  padding: 0.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  backdrop-filter: blur(10px);
  background: var(--nav-bg, rgba(247, 215, 189, 0.95));
  border: 1px solid var(--nav-border, rgba(0, 0, 0, 0.1));
  border-radius: 15px;
  box-shadow: var(--shadow-heavy, 0 5px 20px rgba(0, 0, 0, 0.1));
}

.nav-scroller {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.5rem;
  min-width: max-content;
  padding: 0.5rem 0;
}

.nav-separator {
  width: 1px;
  height: 2rem;
  background: linear-gradient(to bottom, transparent, currentColor, transparent);
  opacity: 0.3;
  flex-shrink: 0;
  margin: 0 0.25rem;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  text-decoration: none;
  border-radius: 25px;
  white-space: nowrap;
  text-align: center;
  flex-shrink: 0;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  min-height: 2.5rem;
  position: relative;
  border: 2px solid transparent;
  background: var(--secondary-bg);
  filter: brightness(1.5);
  color: var(--text-primary, #333);
  box-shadow: var(--shadow-light, 0 2px 4px rgba(0, 0, 0, 0.1));
  transition: box-shadow 0.3s, background 0.3s, border-color 0.3s, color 0.3s, transform 0.3s;
}

.nav-link:hover {
  background: var(--nav-link-hover, #e9ecef);
  color: var(--text-primary, #333);
  transform: translateY(-2px) scale(1.02);
  text-decoration: none;
  box-shadow: var(--shadow-light, 0 4px 8px rgba(0, 0, 0, 0.15));
}

.nav-link.active {
  background: var(--nav-link-active, linear-gradient(135deg, #007bff, #0056b3));
  color: #fff;
  border-color: var(--accent-color, #007bff);
  box-shadow: var(--shadow-medium, 0 4px 12px rgba(0, 0, 0, 0.2));
  font-weight: 700;
  transform: translateY(-2px) scale(1.05);
}

.fas {
  color: var(--accent-color);
}

/* Responsive */
@media (max-width: 991.98px) {
  .menu-nav-container {
    top: 80px;
  }
}

@media (max-width: 768px) {
  .menu-nav-container {
    top: 85px;
    padding: 0.25rem;
  }

  .nav-scroller {
    gap: 0.25rem;
    padding: 0.25rem 0;
  }

  .nav-separator {
    height: 1.8rem;
    margin: 0 0.15rem;
  }

  .nav-link {
    padding: 0.5rem 1rem;
    font-size: 0.969696969696rem;
    min-height: 2.2rem;
  }

  .nav-link .me-2 {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .menu-nav-container {
    top: 90px;
  }

  .nav-separator {
    height: 1.6rem;
    margin: 0 0.1rem;
  }

  .nav-link {
    padding: 0.4rem 0.8rem;
    min-height: 2rem;
  }

  .nav-link .me-2 {
    font-size: 0.7rem;
  }
}
</style>
