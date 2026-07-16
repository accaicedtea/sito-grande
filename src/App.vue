<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade" mode="in-out">
      <keep-alive :max="10">
        <component :is="Component" :key="route.name" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<style>
.fade-enter-active {
  transition: opacity 0.12s ease;
}
.fade-leave-active {
  transition: opacity 0.08s ease;
  position: absolute;
  width: 100%;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>