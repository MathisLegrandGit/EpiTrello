<template>
  <header class="fixed top-0 left-0 right-0 z-50 px-4 pt-6 pb-4">
    <nav class="max-w-6xl mx-auto animate-slide-down">
      <div class="flex items-center justify-between px-5 py-3 rounded-2xl bg-slate-900/80 backdrop-blur-xl shadow-lg shadow-black/5 nav-border">
        <router-link to="/" class="flex items-center gap-2.5 group">
          <img src="/EpiTrello%20Logo.png" alt="EpiTrello Logo" class="w-9 h-9 transition-transform group-hover:scale-105 group-hover:rotate-3" />
          <span class="font-bold text-lg tracking-tight">EpiTrello</span>
        </router-link>

        <!-- Desktop Nav -->
        <div class="hidden md:flex items-center gap-1">
          <a href="#features" class="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50">
            Features
          </a>
          <a href="#demo" class="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50">
            Live Preview
          </a>
          <a href="#use-cases" class="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50">
            Use Cases
          </a>
        </div>

        <!-- Desktop CTA -->
        <div class="hidden md:flex items-center gap-3">
          <router-link to="/login" class="btn-signin text-sm font-medium">
            Sign in
          </router-link>
        </div>

        <!-- Mobile Menu Button -->
        <button class="md:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors" @click="mobileMenuOpen = !mobileMenuOpen">
          <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <Transition name="slide-fade">
        <div v-if="mobileMenuOpen" class="md:hidden mt-2 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl nav-border">
          <div class="flex flex-col gap-1">
            <a href="#features" class="px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors" @click="mobileMenuOpen = false">Features</a>
            <a href="#demo" class="px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors" @click="mobileMenuOpen = false">Live Preview</a>
            <a href="#use-cases" class="px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-colors" @click="mobileMenuOpen = false">Use Cases</a>
            <div class="my-2 h-px bg-linear-to-r from-transparent via-slate-700/50 to-transparent" />
            <router-link to="/login" class="px-4 py-3 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-slate-800/50 rounded-xl transition-colors" @click="mobileMenuOpen = false">Sign in</router-link>
          </div>
        </div>
      </Transition>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const mobileMenuOpen = ref(false)
</script>

<style scoped>
.nav-border {
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.btn-signin {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 9999px;
  padding: 8px 18px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 10px rgba(59, 130, 246, 0.3),
    0 0 0 1px rgba(59, 130, 246, 0.1) inset;
}

.btn-signin:hover {
  transform: translateY(-1px);
  box-shadow: 
    0 4px 15px rgba(59, 130, 246, 0.4),
    0 0 0 1px rgba(59, 130, 246, 0.2) inset;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.5);
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-down { animation: slide-down 0.5s ease-out; }

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
