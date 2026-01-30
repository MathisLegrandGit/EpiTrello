<template>
  <!-- Use Cases Section -->
  <section id="use-cases" class="relative py-24 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Section header -->
      <div class="text-center mb-12">
        <span class="text-sm font-semibold text-blue-500 uppercase tracking-wider">Use Cases</span>
        <h2 class="text-3xl sm:text-4xl font-bold mt-3 mb-4">
          Built for every team
        </h2>
        <p class="text-lg text-slate-400 max-w-2xl mx-auto">
          Whether you're a solo creator or part of a team, EpiTrello adapts to how you work.
        </p>
      </div>

      <!-- Use cases grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(useCase, idx) in useCases" :key="useCase.title" 
          class="group animate-fade-in-up" 
          :class="{ 'hidden md:block': idx >= 4 }"
          :style="{ animationDelay: `${idx * 0.1}s` }">
          <div class="card p-5 h-full flex flex-col">
            <!-- Header -->
            <div class="flex items-start gap-3 mb-3">
              <div :class="`w-10 h-10 rounded-xl ${useCase.color} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`">
                <component :is="useCase.icon" class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="text-base font-semibold">{{ useCase.title }}</h3>
              </div>
            </div>

            <!-- Description -->
            <p class="text-slate-400 text-sm leading-relaxed mb-3">
              {{ useCase.description }}
            </p>

            <!-- Benefits list -->
            <div class="mt-auto pt-3">
              <ul class="space-y-1.5">
                <li v-for="benefit in useCase.benefits" :key="benefit" class="flex items-center gap-2 text-sm">
                  <div :class="`w-1.5 h-1.5 rounded-full ${useCase.color}`" />
                  <span class="text-slate-300">{{ benefit }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { h } from 'vue'

// Use case icons
const CodeIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' })
])
const PaletteIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' })
])
const RocketIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 10V3L4 14h7v7l9-11h-7z' })
])
const UsersGroupIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' })
])
const GraduationIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l9-5-9-5-9 5 9 5z' }),
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' })
])
const BriefcaseIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
])

const useCases = [
  { icon: CodeIcon, title: 'Development Teams', description: 'Sprint planning, bug tracking, and feature development. Keep your dev team organized and shipping.', color: 'bg-blue-500', benefits: ['Sprint boards', 'Task assignments', 'Team visibility'] },
  { icon: PaletteIcon, title: 'Creative Teams', description: 'Design sprints, feedback cycles, and project management. Bring creative visions to life together.', color: 'bg-pink-500', benefits: ['Visual workflow', 'Feedback tracking', 'Project stages'] },
  { icon: RocketIcon, title: 'Product Teams', description: 'Roadmap planning, feature prioritization, and launch coordination all in one place.', color: 'bg-cyan-500', benefits: ['Roadmap boards', 'Priority columns', 'Release planning'] },
  { icon: UsersGroupIcon, title: 'Remote Teams', description: 'Stay connected with real-time updates. Perfect for distributed teams working across time zones.', color: 'bg-amber-500', benefits: ['Real-time sync', 'Async friendly', 'Clear ownership'] },
  { icon: GraduationIcon, title: 'Students & Education', description: 'Manage assignments, group projects, and academic planning with visual boards.', color: 'bg-emerald-500', benefits: ['Assignment boards', 'Group projects', 'Study planning'] },
  { icon: BriefcaseIcon, title: 'Personal Projects', description: 'From side projects to life admin — organize everything that matters to you.', color: 'bg-purple-500', benefits: ['Flexible setup', 'Personal boards', 'Goal tracking'] },
]
</script>

<style scoped>
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in-up { animation: fade-in-up 0.6s ease-out both; }

/* Cards */
.card {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(51, 65, 85, 0.3);
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.card:hover {
  border-color: rgba(37, 99, 235, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12), 0 0 40px rgba(37, 99, 235, 0.05);
  transform: translateY(-4px);
}
</style>
