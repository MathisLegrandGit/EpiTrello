<template>
  <!-- Live Demo Section -->
  <section id="demo" class="relative py-24 px-4 bg-linear-to-b from-slate-900/50 via-slate-900/30 to-transparent">
    <div class="max-w-6xl mx-auto">
      <!-- Section header -->
      <div class="text-center mb-12">
        <span class="text-sm font-semibold text-blue-500 uppercase tracking-wider">Live Preview</span>
        <h2 class="text-3xl sm:text-4xl font-bold mt-3 mb-4">
          Your workflow, <br class="sm:hidden" /><span class="hidden sm:inline"> </span><span class="typewriter-container typewriter-small typewriter-gradient"><span v-for="(char, idx) in displayedDemoWord" :key="demoWordKey + '-' + idx" class="typewriter-char" :style="{ animationDelay: `${idx * 40}ms` }">{{ char === ' ' ? '\u00A0' : char }}</span></span>
        </h2>
        <p class="text-lg text-slate-400 max-w-2xl mx-auto">
          Drag cards between columns and keep your team aligned. 
          This is what your workspace could look like.
        </p>
      </div>

      <!-- Board -->
      <div class="relative">
        <!-- Board container -->
        <div class="bg-slate-800/50 rounded-2xl card-border p-4 sm:p-6 overflow-hidden">
          <!-- Board header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-4">
              <h3 class="font-semibold">Sprint 24 — Product Launch</h3>
              <div class="hidden sm:flex items-center gap-2">
                <div class="flex -space-x-2">
                  <div class="w-7 h-7 rounded-full bg-indigo-500 border-2 border-slate-800 text-white text-xs flex items-center justify-center">A</div>
                  <div class="w-7 h-7 rounded-full bg-cyan-500 border-2 border-slate-800 text-white text-xs flex items-center justify-center">B</div>
                  <div class="w-7 h-7 rounded-full bg-emerald-500 border-2 border-slate-800 text-white text-xs flex items-center justify-center">C</div>
                  <div class="w-7 h-7 rounded-full bg-slate-700 border-2 border-slate-800 text-xs flex items-center justify-center text-slate-400">+3</div>
                </div>
              </div>
            </div>
            <button class="p-2 rounded-lg hover:bg-slate-700/50 transition-colors">
              <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </div>

          <!-- Columns -->
          <div class="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
            <!-- To Do -->
            <div class="demo-column p-3" style="min-width: 260px;">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full bg-slate-500" />
                  <span class="text-sm font-semibold text-slate-400">To Do</span>
                </div>
                <span class="text-xs text-slate-600 bg-slate-700/50 px-2 py-0.5 rounded">3</span>
              </div>
              <div class="space-y-3">
                <div class="demo-card p-3 hover-lift">
                  <span class="inline-block bg-sky-500 text-white text-[10px] font-medium px-2 py-0.5 rounded mb-2">Docs</span>
                  <p class="text-sm font-medium mb-2">Write documentation</p>
                  <div class="flex items-center gap-3 text-slate-500 text-xs">
                    <span class="flex items-center gap-1">💬 3</span>
                  </div>
                </div>
                <div class="demo-card p-3 hover-lift">
                  <span class="inline-block bg-rose-500 text-white text-[10px] font-medium px-2 py-0.5 rounded mb-2">DevOps</span>
                  <p class="text-sm font-medium mb-2">Setup CI/CD pipeline</p>
                  <div class="flex items-center gap-3 text-slate-500 text-xs">
                    <span class="flex items-center gap-1">📅 Tomorrow</span>
                  </div>
                </div>
                <div class="demo-card p-3 hover-lift">
                  <div class="flex gap-1 mb-2">
                    <span class="inline-block bg-violet-500 text-white text-[10px] font-medium px-2 py-0.5 rounded">Design</span>
                    <span class="inline-block bg-amber-500 text-white text-[10px] font-medium px-2 py-0.5 rounded">UX</span>
                  </div>
                  <p class="text-sm font-medium">Design onboarding flow</p>
                </div>
                <button class="add-card-btn w-full text-left px-3 py-2 text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add card
                </button>
              </div>
            </div>

            <!-- In Progress -->
            <div class="demo-column p-3" style="min-width: 260px;">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span class="text-sm font-semibold text-amber-500">In Progress</span>
                </div>
                <span class="text-xs text-slate-600 bg-slate-700/50 px-2 py-0.5 rounded">2</span>
              </div>
              <div class="space-y-3">
                <div class="demo-card demo-card-active p-3 hover-lift">
                  <span class="inline-block bg-indigo-500 text-white text-[10px] font-medium px-2 py-0.5 rounded mb-2">Backend</span>
                  <p class="text-sm font-medium mb-2">Implement user auth</p>
                  <div class="flex items-center gap-3 text-slate-500 text-xs mb-2">
                    <span>💬 8</span>
                    <span>📎 2</span>
                  </div>
                  <div class="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full w-3/4 bg-linear-to-r from-blue-500 to-cyan-500 rounded-full animate-pulse-slow" />
                  </div>
                </div>
                <div class="demo-card p-3 hover-lift">
                  <span class="inline-block bg-emerald-500 text-white text-[10px] font-medium px-2 py-0.5 rounded mb-2">Frontend</span>
                  <p class="text-sm font-medium">Create landing page</p>
                </div>
                <button class="add-card-btn w-full text-left px-3 py-2 text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add card
                </button>
              </div>
            </div>

            <!-- Review -->
            <div class="demo-column p-3" style="min-width: 260px;">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span class="text-sm font-semibold text-blue-500">Review</span>
                </div>
                <span class="text-xs text-slate-600 bg-slate-700/50 px-2 py-0.5 rounded">1</span>
              </div>
              <div class="space-y-3">
                <div class="demo-card p-3 hover-lift">
                  <span class="inline-block bg-orange-500 text-white text-[10px] font-medium px-2 py-0.5 rounded mb-2">QA</span>
                  <p class="text-sm font-medium mb-2">API endpoints testing</p>
                  <div class="flex items-center gap-3 text-slate-500 text-xs">
                    <span>💬 5</span>
                  </div>
                </div>
                <button class="add-card-btn w-full text-left px-3 py-2 text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add card
                </button>
              </div>
            </div>

            <!-- Done -->
            <div class="demo-column p-3" style="min-width: 260px;">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span class="text-sm font-semibold text-green-500">Done</span>
                </div>
                <span class="text-xs text-slate-600 bg-slate-700/50 px-2 py-0.5 rounded">2</span>
              </div>
              <div class="space-y-3">
                <div class="demo-card p-3 opacity-70">
                  <span class="inline-block bg-indigo-500 text-white text-[10px] font-medium px-2 py-0.5 rounded mb-2">Backend</span>
                  <p class="text-sm font-medium line-through text-slate-500">Database schema design</p>
                </div>
                <div class="demo-card p-3 opacity-70">
                  <span class="inline-block bg-slate-500 text-white text-[10px] font-medium px-2 py-0.5 rounded mb-2">Setup</span>
                  <p class="text-sm font-medium line-through text-slate-500">Project setup</p>
                </div>
                <button class="add-card-btn w-full text-left px-3 py-2 text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add card
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Typewriter effect for demo section
const demoWords = ['visualized', 'simplified', 'organized', 'streamlined', 'perfected']
const currentDemoWordIndex = ref(0)
const displayedDemoWord = ref('')
const demoWordKey = ref(0)

let demoWordTimeout: ReturnType<typeof setTimeout>

// Start demo word animation cycle
const startDemoWordAnimation = () => {
  const animateNext = () => {
    let charIndex = 0
    const text = demoWords[currentDemoWordIndex.value]
    if (!text) return
    displayedDemoWord.value = ''
    demoWordKey.value++
    
    const typeNextChar = () => {
      if (charIndex < text.length) {
        displayedDemoWord.value = text.slice(0, charIndex + 1)
        charIndex++
        demoWordTimeout = setTimeout(typeNextChar, 60)
      } else {
        // Wait before erasing
        demoWordTimeout = setTimeout(() => {
          const erase = () => {
            if (displayedDemoWord.value.length > 0) {
              displayedDemoWord.value = displayedDemoWord.value.slice(0, -1)
              demoWordTimeout = setTimeout(erase, 40)
            } else {
              currentDemoWordIndex.value = (currentDemoWordIndex.value + 1) % demoWords.length
              setTimeout(animateNext, 300)
            }
          }
          erase()
        }, 2500)
      }
    }
    
    typeNextChar()
  }
  animateNext()
}

onMounted(() => {
  startDemoWordAnimation()
})

onUnmounted(() => {
  clearTimeout(demoWordTimeout)
})
</script>

<style scoped>
.card-border {
  border: 1px solid rgba(51, 65, 85, 0.5);
}

/* Demo column/card styles */
.demo-column {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(51, 65, 85, 0.3);
  border-radius: 12px;
}

.demo-card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(51, 65, 85, 0.3);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.demo-card:hover {
  border-color: rgba(51, 65, 85, 0.5);
}

.demo-card-active {
  border-color: rgba(37, 99, 235, 0.3);
  background: rgba(37, 99, 235, 0.05);
}

.hover-lift {
  cursor: pointer;
}

.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Add card button */
.add-card-btn {
  cursor: pointer;
  border: 1px dashed rgba(51, 65, 85, 0.4);
  background: transparent;
}

.add-card-btn:hover {
  border-color: rgba(51, 65, 85, 0.6);
  background: rgba(30, 41, 59, 0.3);
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}

/* Typewriter styles */
.typewriter-container {
  display: inline-block;
}

.typewriter-small {
  font-size: inherit;
}

.typewriter-gradient .typewriter-char {
  background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.typewriter-char {
  display: inline-block;
  animation: typewriter-pop 0.1s ease-out forwards;
  opacity: 0;
}

@keyframes typewriter-pop {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
