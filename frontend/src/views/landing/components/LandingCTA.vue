<template>
  <!-- CTA Section -->
  <section class="relative py-16 px-4">
    <div class="max-w-6xl mx-auto">
      <div class="relative">
        <!-- Background gradient -->
        <div class="absolute inset-0 bg-linear-to-br from-blue-500/10 via-cyan-500/5 to-transparent rounded-3xl" />
        
        <!-- Card -->
        <div class="relative bg-slate-800/30 card-border rounded-3xl p-6 sm:p-8 lg:p-10 overflow-hidden">
          <!-- Decorative elements -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-blue-500/10 to-transparent rounded-full blur-3xl animate-pulse-slow" />
          <div class="absolute bottom-0 left-0 w-48 h-48 bg-linear-to-tr from-cyan-500/10 to-transparent rounded-full blur-3xl animate-pulse-slow" style="animation-delay: 1s;" />

          <!-- Content - horizontal layout on desktop -->
          <div class="relative flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-8">
            <!-- Left: Text content -->
            <div class="lg:flex-1 text-center lg:text-left">
              <!-- Badge -->
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 badge-border mb-4">
                <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <span class="text-sm font-medium text-blue-400">100% Free Forever</span>
              </div>

              <!-- Heading -->
              <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">
                Ready to see your <span class="text-gradient">work come together?</span>
              </h2>

              <!-- Benefits inline -->
              <div class="flex flex-wrap justify-center lg:justify-start gap-x-4 gap-y-2">
                <div v-for="benefit in ctaBenefits" :key="benefit" class="flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-sm text-slate-400">{{ benefit }}</span>
                </div>
              </div>
            </div>

            <!-- Right: CTA Button - aligned with heading -->
            <div class="flex flex-col items-center lg:items-center gap-2 lg:shrink-0 lg:pt-10">
              <router-link to="/login?register=true" class="btn-primary-filled text-base py-3.5 px-7 inline-flex items-center gap-2 group whitespace-nowrap">
                Get Started Now
                <svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </router-link>
              <p class="text-xs text-slate-500 text-center">
                Free forever • No credit card
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const ctaBenefits = ['Unlimited boards', 'Real-time collaboration', 'Works anywhere']
</script>

<style scoped>
.card-border {
  border: 1px solid rgba(51, 65, 85, 0.5);
}

.badge-border {
  border: 1px solid rgba(37, 99, 235, 0.2);
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

/* Text gradient */
.text-gradient {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Buttons - pill style matching hero */
.btn-primary-filled {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 9999px;
  padding: 14px 28px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 4px 15px rgba(59, 130, 246, 0.4),
    0 0 0 1px rgba(59, 130, 246, 0.1) inset,
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.btn-primary-filled:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(59, 130, 246, 0.5),
    0 0 0 1px rgba(59, 130, 246, 0.2) inset,
    0 1px 0 rgba(255, 255, 255, 0.15) inset;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}
</style>
