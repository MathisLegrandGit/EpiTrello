<script setup lang="ts">
import { ref, nextTick } from 'vue'

defineProps<{
    isDarkMode: boolean
}>()

const emit = defineEmits<{
    (e: 'add-column', title: string): void
}>()

const isAdding = ref(false)
const newColumnTitle = ref('')

function startAdding() {
    isAdding.value = true
    newColumnTitle.value = ''
    nextTick(() => {
        const input = document.querySelector('input[data-add-column]') as HTMLInputElement
        if (input) input.focus()
    })
}

function addColumn() {
    if (newColumnTitle.value.trim()) {
        emit('add-column', newColumnTitle.value)
    }
    cancel()
}

function cancel() {
    isAdding.value = false
    newColumnTitle.value = ''
}
</script>

<template>
    <!-- Add Column Form (just input, no buttons) -->
    <div v-if="isAdding" :class="isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white/60 border-slate-200/60'"
        class="rounded-2xl p-5 border shadow-sm min-w-[320px] shrink-0 animate-scale-in">
        <input v-model="newColumnTitle" type="text" placeholder="Column title..." data-add-column
            :class="isDarkMode ? 'bg-transparent text-slate-100 placeholder-slate-400' : 'bg-transparent text-slate-800 placeholder-slate-400'"
            class="w-full text-lg font-semibold outline-none" @keyup.enter="addColumn" @keyup.escape="cancel"
            @blur="addColumn" />
    </div>

    <!-- Add Column Button -->
    <button v-else @click="startAdding"
        :class="isDarkMode ? 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 hover:border-blue-500/50' : 'bg-white/40 border-slate-200/60 text-slate-500 hover:bg-white/60 hover:text-slate-700 hover:border-blue-300'"
        class="min-w-[320px] shrink-0 p-5 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-md group">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 transition-transform group-hover:scale-110"
            viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd" />
        </svg>
        <span class="font-medium">Add Column</span>
    </button>
</template>
