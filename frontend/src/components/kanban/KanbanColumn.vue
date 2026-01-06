<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { Card, Label } from '@/services/api'
import KanbanCard from './KanbanCard.vue'

interface Column {
    id: string
    title: string
    position: number
    color?: string
    cards: Card[]
}

const props = defineProps<{
    column: Column
    isDarkMode: boolean
    labels: Label[]
    menuOpen: boolean
    colorPickerOpen: boolean
    editingTitle: boolean
    columnColors: string[]
}>()

const emit = defineEmits<{
    (e: 'toggle-menu'): void
    (e: 'toggle-color-picker'): void
    (e: 'update-color', color: string): void
    (e: 'delete'): void
    (e: 'start-adding-card'): void
    (e: 'add-card', title: string): void
    (e: 'start-editing-title'): void
    (e: 'save-title', title: string): void
    (e: 'cancel-editing'): void
    (e: 'card-mousedown', event: MouseEvent, card: Card): void
}>()

const isAddingCard = ref(false)
const newCardTitle = ref('')
const editingColumnTitle = ref(props.column.title)

function startAddingCard() {
    isAddingCard.value = true
    newCardTitle.value = ''
    nextTick(() => {
        const input = document.querySelector(`input[data-add-card="${props.column.id}"]`) as HTMLInputElement
        if (input) input.focus()
    })
}

function addCard() {
    if (newCardTitle.value.trim()) {
        emit('add-card', newCardTitle.value)
    }
    cancelAddingCard()
}

function cancelAddingCard() {
    isAddingCard.value = false
    newCardTitle.value = ''
}

function startEditingTitle() {
    editingColumnTitle.value = props.column.title
    emit('start-editing-title')
    nextTick(() => {
        const input = document.querySelector(`input[data-column-edit="${props.column.id}"]`) as HTMLInputElement
        if (input) input.focus()
    })
}

function saveTitle() {
    if (editingColumnTitle.value.trim()) {
        emit('save-title', editingColumnTitle.value)
    }
    emit('cancel-editing')
}
</script>

<template>
    <div :data-column-id="column.id"
        :class="isDarkMode ? 'bg-slate-800/50 border-slate-700/50 backdrop-blur-sm' : 'bg-white/60 border-slate-200/60 backdrop-blur-sm'"
        class="flex flex-col rounded-2xl p-5 border shadow-sm min-w-[320px] flex-shrink-0 transition-all duration-200 hover:shadow-md animate-slide-up">
        <!-- Column Header -->
        <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                    :style="{ backgroundColor: column.color || '#64748b' }" />

                <!-- Inline title editing -->
                <input v-if="editingTitle" v-model="editingColumnTitle" :data-column-edit="column.id"
                    :class="isDarkMode ? 'bg-transparent text-slate-100' : 'bg-transparent text-slate-800'"
                    class="text-lg font-semibold outline-none flex-1 min-w-0" @blur="saveTitle" @keyup.enter="saveTitle"
                    @keyup.escape="emit('cancel-editing')" />
                <h2 v-else
                    :class="isDarkMode ? 'text-slate-100 hover:text-blue-400' : 'text-slate-800 hover:text-blue-600'"
                    class="text-lg font-semibold cursor-pointer transition-colors duration-200 truncate"
                    @click="startEditingTitle">
                    {{ column.title }}
                </h2>

                <span :class="isDarkMode ? 'text-slate-400 bg-slate-700/60' : 'text-slate-500 bg-slate-100'"
                    class="text-xs font-medium rounded-full px-2.5 py-1 flex-shrink-0">
                    {{ column.cards.length }}
                </span>
            </div>

            <!-- Column Menu -->
            <div class="relative" @click.stop>
                <button @click="emit('toggle-menu')"
                    :class="isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'"
                    class="p-1.5 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                </button>

                <!-- Dropdown Menu -->
                <div v-if="menuOpen" @click.stop
                    :class="isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
                    class="absolute right-0 top-full mt-1 w-44 rounded-lg shadow-xl border z-50 overflow-hidden">
                    <button @click="startAddingCard"
                        :class="isDarkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'"
                        class="w-full px-3 py-2 text-sm text-left flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                clip-rule="evenodd" />
                        </svg>
                        Add card
                    </button>

                    <!-- Color Picker Toggle -->
                    <button @click="emit('toggle-color-picker')"
                        :class="isDarkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'"
                        class="w-full px-3 py-2 text-sm text-left flex items-center gap-2 transition-colors">
                        <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: column.color || '#64748b' }" />
                        Change color
                    </button>

                    <!-- Color Picker Grid -->
                    <div v-if="colorPickerOpen" class="px-3 py-2 grid grid-cols-4 gap-1.5">
                        <button v-for="color in columnColors" :key="color" @click="emit('update-color', color)"
                            class="w-6 h-6 rounded-full transition-all hover:scale-110"
                            :class="column.color === color ? 'ring-2 ring-offset-2' : ''"
                            :style="{ backgroundColor: color }" :title="color" />
                    </div>

                    <button @click="emit('delete')" :class="[
                        colorPickerOpen ? 'border-t' : '',
                        isDarkMode ? 'text-red-400 hover:bg-red-900/30 border-slate-700' : 'text-red-500 hover:bg-red-50 border-slate-200'
                    ]" class="w-full px-3 py-2 text-sm text-left flex items-center gap-2 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clip-rule="evenodd" />
                        </svg>
                        Delete column
                    </button>
                </div>
            </div>
        </div>

        <!-- Cards Container -->
        <div class="flex-1 space-y-3 min-h-[80px]">
            <!-- Empty State with dotted border (only when no cards AND not adding) -->
            <div v-if="column.cards.length === 0 && !isAddingCard"
                :class="isDarkMode ? 'border-slate-600/50 text-slate-500' : 'border-slate-300 text-slate-400'"
                class="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 min-h-[80px]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 opacity-50" viewBox="0 0 20 20"
                    fill="currentColor">
                    <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                    <path fill-rule="evenodd"
                        d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"
                        clip-rule="evenodd" />
                </svg>
                <p class="text-sm font-medium">Drop cards here</p>
            </div>

            <!-- Inline Add Card Input (replaces empty state when adding) -->
            <input v-if="isAddingCard" v-model="newCardTitle" type="text" placeholder="Enter card title..."
                :data-add-card="column.id"
                :class="isDarkMode ? 'bg-slate-700/60 border-slate-600 text-slate-100 placeholder-slate-400' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'"
                class="w-full p-3 text-sm rounded-xl border shadow-sm outline-none" @keyup.enter="addCard"
                @keyup.escape="cancelAddingCard" @blur="addCard" />

            <!-- Existing Cards -->
            <KanbanCard v-for="card in column.cards" :key="card.id" :card="card" :isDarkMode="isDarkMode"
                :labels="labels" :columnId="column.id" @mousedown="emit('card-mousedown', $event, card)" />
        </div>

        <!-- Add Card Button (always visible) -->
        <button @click="startAddingCard"
            :class="isDarkMode ? 'bg-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200'"
            class="mt-4 w-full p-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clip-rule="evenodd" />
            </svg>
            Add card
        </button>
    </div>
</template>
