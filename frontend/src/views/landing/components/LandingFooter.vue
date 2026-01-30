<template>
  <!-- Footer -->
  <footer class="bg-slate-900/90 border-t border-slate-800/50">
    <div class="max-w-6xl mx-auto px-4 py-12">
      <div class="flex flex-col md:flex-row items-center justify-between gap-8">
        <!-- Brand -->
        <div class="flex flex-col items-center md:items-start gap-4">
          <router-link to="/" class="flex items-center gap-2.5">
            <img src="/EpiTrello%20Logo.png" alt="EpiTrello Logo" class="w-9 h-9" />
            <span class="font-bold text-lg tracking-tight">EpiTrello</span>
          </router-link>
          <p class="text-sm text-slate-500 text-center md:text-left max-w-xs">
            The visual workspace where teams see work get done.
          </p>
        </div>

        <!-- Links -->
        <div class="flex items-center gap-8">
          <a href="#features" class="text-sm text-slate-500 hover:text-white transition-colors">Features</a>
          <a href="#demo" class="text-sm text-slate-500 hover:text-white transition-colors">Live Preview</a>
          <a href="#use-cases" class="text-sm text-slate-500 hover:text-white transition-colors">Use Cases</a>
          <a href="https://github.com/MathisLegrandGit/EpiTrello" target="_blank" rel="noopener noreferrer" class="w-9 h-9 rounded-lg bg-slate-800/50 badge-border flex items-center justify-center text-slate-500 hover:text-blue-500 hover:border-blue-500/50 transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-sm text-slate-500">© {{ new Date().getFullYear() }} EpiTrello</p>
        <p class="text-sm text-slate-500">Made with ❤️ for productive teams</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>

<style scoped>
.badge-border {
  border: 1px solid rgba(37, 99, 235, 0.2);
}
</style>
