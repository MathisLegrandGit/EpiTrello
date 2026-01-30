<template>
  <section id="features" class="relative py-24 px-4">
    <!-- Top gradient blend -->
    <div class="absolute top-0 left-0 right-0 h-32 bg-linear-to-b from-[#030712] to-transparent pointer-events-none" />
    
    <div class="max-w-6xl mx-auto relative">
      <!-- Section header -->
      <div class="text-center mb-16">
        <span class="text-sm font-semibold text-blue-500 uppercase tracking-wider animate-fade-in-up">Features</span>
        <h2 class="text-3xl sm:text-4xl font-bold mt-3 mb-4 animate-fade-in-up" style="animation-delay: 0.1s;">
          Everything your team needs
        </h2>
        <p class="text-lg text-slate-400 max-w-2xl mx-auto mb-8 animate-fade-in-up" style="animation-delay: 0.2s;">
          Powerful features that help you manage projects, not software. 
          Simple enough to start in minutes, powerful enough to scale.
        </p>

        <!-- Highlight badges -->
        <div class="flex flex-wrap justify-center gap-3">
          <div v-for="(badge, idx) in featureBadges" :key="badge.text" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 badge-border animate-fade-in-up" :style="{ animationDelay: `${0.3 + idx * 0.1}s` }">
            <component :is="badge.icon" class="w-4 h-4 text-blue-500" />
            <span class="text-sm font-medium">{{ badge.text }}</span>
          </div>
        </div>
      </div>

      <!-- Features grid -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="(feature, index) in features" :key="feature.title" 
          class="group animate-fade-in-up" 
          :class="{ 'hidden md:block': index >= 4 }"
          :style="{ animationDelay: `${0.4 + index * 0.1}s` }">
          <div class="card spotlight-card p-6 h-full">
            <!-- Icon -->
            <div :class="`w-12 h-12 rounded-xl bg-linear-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`">
              <component :is="feature.icon" class="w-6 h-6 text-white" />
            </div>

            <!-- Content -->
            <h3 class="text-lg font-semibold mb-2">{{ feature.title }}</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Section transition gradient -->
    <div class="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-slate-900/50 to-transparent pointer-events-none" />
  </section>
</template>

<script setup lang="ts">
import { h } from 'vue'

// Feature badges with icons
const ZapIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 10V3L4 14h7v7l9-11h-7z' })
])
const UsersSmallIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
])
const LayoutSmallIcon = () => h('svg', { class: 'w-4 h-4', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' })
])

const featureBadges = [
  { icon: ZapIcon, text: 'Instant sync' },
  { icon: UsersSmallIcon, text: 'Team collaboration' },
  { icon: LayoutSmallIcon, text: 'Clean design' },
]

// Feature icons
const WorkflowIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' })
])
const UsersIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
])
const MoveIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 9l4-4 4 4m0 6l-4 4-4-4' })
])
const TagIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' })
])
const LayoutIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z' })
])
const GlobeIcon = () => h('svg', { class: 'w-6 h-6', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9' })
])

const features = [
  { icon: WorkflowIcon, title: 'Flexible Boards', description: 'Create custom boards and columns that match how your team actually works. Organize tasks your way.', color: 'from-blue-500 to-blue-600' },
  { icon: UsersIcon, title: 'Real-time Collaboration', description: 'See changes instantly as your team works together. Updates and assignments sync in real-time.', color: 'from-sky-500 to-cyan-500' },
  { icon: MoveIcon, title: 'Drag & Drop', description: 'Intuitive drag and drop interface. Move cards between columns effortlessly to update task status.', color: 'from-emerald-500 to-teal-500' },
  { icon: TagIcon, title: 'Labels & Priority', description: 'Organize cards with colorful labels and set priorities to keep your team focused on what matters.', color: 'from-amber-500 to-orange-500' },
  { icon: LayoutIcon, title: 'Clean Interface', description: 'A beautiful, distraction-free workspace designed for productivity. Focus on your work, not the tool.', color: 'from-violet-500 to-purple-500' },
  { icon: GlobeIcon, title: 'Access Anywhere', description: 'Web-based application accessible from any device. Your boards are always just a click away.', color: 'from-rose-500 to-pink-500' },
]
</script>

<style scoped>
.badge-border {
  border: 1px solid rgba(37, 99, 235, 0.2);
}

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

.spotlight-card {
  position: relative;
  overflow: hidden;
}

.spotlight-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.05), transparent);
  transition: left 0.5s ease;
}

.spotlight-card:hover::before {
  left: 100%;
}
</style>
