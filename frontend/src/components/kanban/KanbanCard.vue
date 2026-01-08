<script setup lang="ts">
import type { Card, Label } from '@/services/api'

defineProps<{
    card: Card
    isDarkMode: boolean
    labels: Label[]
    columnId: string
}>()

const emit = defineEmits<{
    (e: 'mousedown', event: MouseEvent): void
}>()

function getLabelById(labelId: string | null | undefined, labels: Label[]): Label | undefined {
    if (!labelId) return undefined
    return labels.find(l => l.id === labelId)
}
</script>

<template>
    <div @mousedown="emit('mousedown', $event)" :data-card-id="card.id"
        :class="isDarkMode ? 'bg-slate-700/80 border-slate-600/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5' : 'bg-slate-50 border-slate-300 hover:border-blue-300 hover:shadow-md'"
        class="p-4 rounded-xl border cursor-grab active:cursor-grabbing transition-all duration-200 group">
        <!-- Label Tags -->
        <div v-if="card.label_ids && card.label_ids.length > 0" class="flex flex-wrap gap-1.5 mb-3">
            <span v-for="labelId in card.label_ids" :key="labelId" class="px-2 py-0.5 text-xs font-medium rounded-full"
                :style="{
                    backgroundColor: getLabelById(labelId, labels)?.color || '#64748b',
                    color: 'white'
                }">
                {{ getLabelById(labelId, labels)?.name || 'Label' }}
            </span>
        </div>

        <p :class="isDarkMode ? 'text-slate-200' : 'text-slate-800'" class="text-sm font-medium leading-relaxed">
            {{ card.title }}
        </p>

        <p v-if="card.description" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'"
            class="text-xs mt-2 line-clamp-2">
            {{ card.description }}
        </p>
    </div>
</template>
