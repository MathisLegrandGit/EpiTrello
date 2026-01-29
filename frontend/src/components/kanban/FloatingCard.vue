<script setup lang="ts">
import type { Card, Label } from '@/services/api'
import type { CSSProperties } from 'vue'

defineProps<{
    card: Card
    style: CSSProperties
    isDarkMode: boolean
    labels: Label[]
}>()

function getLabelById(labelId: string | null | undefined, labels: Label[]): Label | undefined {
    if (!labelId) return undefined
    return labels.find(l => l.id === labelId)
}
</script>

<template>
    <div :style="style" :class="isDarkMode ? 'bg-slate-700 border-slate-500' : 'bg-white border-slate-300'"
        class="fixed z-100 w-[280px] p-4 rounded-xl border-2 shadow-2xl pointer-events-none opacity-90">
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

        <p :class="isDarkMode ? 'text-slate-200' : 'text-slate-800'" class="text-sm font-medium">
            {{ card.title }}
        </p>
    </div>
</template>
