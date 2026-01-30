<template>
  <div class="landing-page min-h-screen bg-[#030712] text-white overflow-x-hidden" style="background-color: #030712;">
    <!-- Cursor Follower -->
    <div
      v-if="!isMobile"
      class="fixed pointer-events-none z-9999 hidden md:block"
      :style="{
        left: mousePos.x + 'px',
        top: mousePos.y + 'px',
        transform: 'translate(-50%, -50%)',
        opacity: mouseVisible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }"
    >
      <div
        class="w-64 h-64 rounded-full"
        style="
          background: radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, rgba(14, 165, 233, 0.04) 40%, transparent 70%);
          filter: blur(30px);
        "
      />
    </div>

    <!-- Background Grid (subtle, entire page) -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div
        class="absolute inset-0 opacity-20"
        style="
          background-image: linear-gradient(rgba(37, 99, 235, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(37, 99, 235, 0.02) 1px, transparent 1px);
          background-size: 80px 80px;
        "
      />
    </div>

    <!-- Navigation -->
    <LandingNavbar />

    <!-- Hero Section -->
    <LandingHero />

    <!-- Features Section -->
    <LandingFeatures />

    <!-- Live Demo Section -->
    <LandingLiveDemo />

    <!-- Use Cases Section -->
    <LandingUseCases />

    <!-- CTA Section -->
    <LandingCTA />

    <!-- Footer -->
    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import LandingNavbar from './components/LandingNavbar.vue'
import LandingHero from './components/LandingHero.vue'
import LandingFeatures from './components/LandingFeatures.vue'
import LandingLiveDemo from './components/LandingLiveDemo.vue'
import LandingUseCases from './components/LandingUseCases.vue'
import LandingCTA from './components/LandingCTA.vue'
import LandingFooter from './components/LandingFooter.vue'

// Mouse tracking for cursor follower
const mousePos = ref({ x: 0, y: 0 })
const mouseVisible = ref(false)

const isMobile = computed(() => {
  if (typeof window === 'undefined') return true
  return window.innerWidth < 768
})

const handleMouseMove = (e: MouseEvent) => {
  mousePos.value = { x: e.clientX, y: e.clientY }
  if (!mouseVisible.value) mouseVisible.value = true
}

const handleMouseLeave = () => {
  mouseVisible.value = false
}

const handleMouseEnter = () => {
  mouseVisible.value = true
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  document.body.addEventListener('mouseleave', handleMouseLeave)
  document.body.addEventListener('mouseenter', handleMouseEnter)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  document.body.removeEventListener('mouseleave', handleMouseLeave)
  document.body.removeEventListener('mouseenter', handleMouseEnter)
})
</script>

<style scoped>
/* Reset global borders */
.landing-page,
.landing-page * {
  border-color: transparent;
}
</style>
