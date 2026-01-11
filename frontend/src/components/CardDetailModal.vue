<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { type Card, type Label, labelsApi } from '@/services/api'

interface Props {
    isOpen: boolean
    card: Card | null
    columnTitle: string
    labels: Label[]
    isDarkMode: boolean
    boardId: string | null
    canEdit?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'save', data: { title: string; description: string; labelIds: string[] }): void
    (e: 'delete'): void
    (e: 'labelCreated', label: Label): void
    (e: 'refresh'): void
}>()

// Local state
const title = ref('')
const description = ref('')
const selectedLabelIds = ref<string[]>([])
const menuOpen = ref(false)
const labelDropdownOpen = ref(false)
const activeLabelMenuId = ref<string | null>(null)
const isCreatingLabel = ref(false)
const newLabelName = ref('')
const newLabelColor = ref('#3b82f6')


const labelColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981',
    '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
]

// Original values to detect changes
const originalTitle = ref('')
const originalDescription = ref('')
const originalLabelIds = ref<string[]>([])

// Sync with props when card changes
watch(() => props.card, (newCard) => {
    if (newCard) {
        title.value = newCard.title
        description.value = newCard.description || ''
        selectedLabelIds.value = [...(newCard.label_ids || [])]
        // Store original values
        originalTitle.value = newCard.title
        originalDescription.value = newCard.description || ''
        originalLabelIds.value = [...(newCard.label_ids || [])]
    }
}, { immediate: true })

// Check if any changes were made
const hasChanges = computed(() => {
    const labelIdsChanged = JSON.stringify([...selectedLabelIds.value].sort()) !== JSON.stringify([...originalLabelIds.value].sort())
    return title.value !== originalTitle.value ||
        description.value !== originalDescription.value ||
        labelIdsChanged
})

function handleDelete() {
    menuOpen.value = false
    emit('delete')
}

function handleClose() {
    // Auto-save if changes were made and title is not empty (only for editors)
    if (props.canEdit && hasChanges.value && title.value.trim()) {
        emit('save', {
            title: title.value,
            description: description.value,
            labelIds: selectedLabelIds.value
        })
    } else {
        emit('close')
    }
}

async function createLabel() {
    if (!newLabelName.value.trim()) return

    try {
        if (!props.boardId) {
            console.error('Cannot create label: boardId is null')
            return
        }
        const newLabel = await labelsApi.create({
            board_id: props.boardId,
            name: newLabelName.value,
            color: newLabelColor.value,
        })
        emit('labelCreated', newLabel)
        selectedLabelIds.value.push(newLabel.id!)
        isCreatingLabel.value = false
        newLabelName.value = ''
    } catch (err) {
        console.error('Error creating label:', err)
    }
}

function toggleLabel(labelId: string) {
    const index = selectedLabelIds.value.indexOf(labelId)
    if (index >= 0) {
        selectedLabelIds.value.splice(index, 1)
    } else {
        selectedLabelIds.value.push(labelId)
    }
}

async function startDeletingLabel(labelId: string) {
    console.log('Deleting label with ID:', labelId)
    activeLabelMenuId.value = null
    try {
        await labelsApi.delete(labelId)
        console.log('Label deleted successfully, refreshing...')
        // Remove from selected if present
        const index = selectedLabelIds.value.indexOf(labelId)
        if (index >= 0) {
            selectedLabelIds.value.splice(index, 1)
        }
        // Emit event to refresh labels in parent
        emit('refresh')
    } catch (err) {
        console.error('Error deleting label:', err)
    }
}
</script>

<template>
    <!-- Backdrop -->
    <Teleport to="body">
        <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center" @click="handleClose">
            <!-- Overlay -->
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            <!-- Modal -->
            <div @click.stop="labelDropdownOpen = false; menuOpen = false; activeLabelMenuId = null"
                :class="isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'"
                class="relative w-full max-w-xl mx-4 rounded-2xl border shadow-2xl animate-scale-in">
                <!-- Header with column indicator -->
                <div :class="isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'"
                    class="px-6 py-4 border-b flex items-center justify-between rounded-t-2xl">
                    <div class="flex items-center gap-3">
                        <div class="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
                        <span :class="isDarkMode ? 'text-slate-300' : 'text-slate-600'" class="text-sm font-medium">
                            {{ columnTitle }}
                        </span>
                    </div>

                    <div class="flex items-center gap-2">
                        <!-- Menu button (only for editors) -->
                        <div v-if="canEdit" class="relative" @click.stop>
                            <button @click="menuOpen = !menuOpen"
                                :class="isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'"
                                class="p-2 rounded-lg transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path
                                        d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                </svg>
                            </button>

                            <!-- Dropdown -->
                            <div v-if="menuOpen"
                                :class="isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
                                class="absolute right-0 top-full mt-1 w-44 rounded-xl border shadow-lg overflow-hidden z-50">
                                <button @click="handleDelete"
                                    :class="isDarkMode ? 'text-red-400 hover:bg-red-500/20' : 'text-red-500 hover:bg-red-50'"
                                    class="w-full px-4 py-2.5 text-sm text-left flex items-center gap-2 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                        fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    Delete card
                                </button>
                            </div>
                        </div>

                        <!-- Close button -->
                        <button @click="handleClose"
                            :class="isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'"
                            class="p-2 rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Content -->
                <div class="p-6 space-y-6">
                    <!-- Title -->
                    <div class="space-y-3">
                        <label :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'"
                            class="text-sm font-medium flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path
                                    d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                <path fill-rule="evenodd"
                                    d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                    clip-rule="evenodd" />
                            </svg>
                            Title
                        </label>
                        <input v-model="title" :readonly="!canEdit" :class="[
                            isDarkMode
                                ? 'bg-slate-800 text-white border-slate-700 placeholder-slate-500'
                                : 'bg-slate-50 text-slate-900 border-slate-200 placeholder-slate-400',
                            !canEdit ? 'cursor-default' : ''
                        ]" class="w-full px-4 py-3 text-xl font-semibold rounded-xl border transition-colors"
                            placeholder="Card title..." />
                    </div>

                    <!-- Labels -->
                    <div class="space-y-3">
                        <label :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'"
                            class="text-sm font-medium flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                                    clip-rule="evenodd" />
                            </svg>
                            Labels
                        </label>
                        <div class="flex flex-wrap items-center gap-2">
                            <template v-for="(labelId, idx) in selectedLabelIds" :key="idx">
                                <span v-if="labels.find(l => l.id === labelId)"
                                    class="px-4 py-1.5 rounded-full text-sm font-medium text-white"
                                    :style="{ backgroundColor: labels.find(l => l.id === labelId)?.color }">
                                    {{labels.find(l => l.id === labelId)?.name}}
                                </span>
                            </template>

                            <!-- Add Labels Button + Dropdown (only for editors) -->
                            <div v-if="canEdit" class="relative" @click.stop>
                                <button @click="labelDropdownOpen = !labelDropdownOpen; isCreatingLabel = false"
                                    :class="isDarkMode ? 'border-slate-600 text-slate-400 hover:border-slate-500' : 'border-slate-300 text-slate-500 hover:border-slate-400'"
                                    class="px-4 py-1.5 rounded-full text-sm font-medium border border-dashed transition-colors flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                        fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    Add label
                                </button>

                                <!-- Dropdown -->
                                <div v-if="labelDropdownOpen"
                                    :class="isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
                                    class="absolute left-0 top-full mt-2 w-56 rounded-xl border shadow-lg overflow-hidden z-50">

                                    <!-- Create Label Form (inside dropdown) -->
                                    <div v-if="isCreatingLabel" class="p-3 space-y-3">
                                        <input v-model="newLabelName" :class="isDarkMode
                                            ? 'bg-slate-700 text-white border-slate-600 placeholder-slate-400'
                                            : 'bg-slate-50 text-slate-900 border-slate-200 placeholder-slate-400'"
                                            class="w-full px-3 py-2 text-sm rounded-lg border"
                                            placeholder="Label name..." />
                                        <div class="grid grid-cols-7 gap-2 justify-items-center">
                                            <button v-for="color in labelColors" :key="color"
                                                @click="newLabelColor = color"
                                                :class="newLabelColor === color ? 'ring-2 ring-offset-1 ring-blue-500 scale-110' : ''"
                                                class="w-5 h-5 rounded-full transition-transform"
                                                :style="{ backgroundColor: color }" />
                                        </div>
                                        <button @click="createLabel"
                                            class="w-full px-3 py-1.5 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                                            Create
                                        </button>
                                    </div>

                                    <!-- Label list (when not creating) -->
                                    <template v-else>
                                        <div class="p-1.5 space-y-1">
                                            <!-- Existing labels -->
                                            <div v-for="label in labels" :key="label.id" @click="toggleLabel(label.id!)"
                                                :class="[
                                                    isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-50',
                                                    selectedLabelIds.includes(label.id!) ? (isDarkMode ? 'bg-slate-700' : 'bg-slate-100') : ''
                                                ]"
                                                class="w-full px-2.5 py-2 text-sm text-left flex items-center gap-3 transition-colors cursor-pointer group rounded-lg relative">

                                                <span class="w-4 h-4 rounded-full flex-shrink-0"
                                                    :style="{ backgroundColor: label.color }" />
                                                <span :class="isDarkMode ? 'text-slate-200' : 'text-slate-700'"
                                                    class="flex-1 truncate">{{ label.name }}</span>

                                                <!-- Right Action Area -->
                                                <div class="relative ml-auto h-5 w-5 flex items-center justify-center"
                                                    @click.stop>
                                                    <!-- If selected: Checkmark (default) / Kebab (hover) -->
                                                    <template v-if="selectedLabelIds.includes(label.id!)">
                                                        <!-- Checkmark (visible by default, hidden on hover) -->
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                            class="h-4 w-4 text-blue-500 flex-shrink-0 group-hover:hidden transition-opacity"
                                                            viewBox="0 0 20 20" fill="currentColor">
                                                            <path fill-rule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clip-rule="evenodd" />
                                                        </svg>

                                                        <!-- Kebab (hidden by default, visible on hover) -->
                                                        <button
                                                            @click="activeLabelMenuId = activeLabelMenuId === label.id ? null : label.id!"
                                                            :class="isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'"
                                                            class="hidden group-hover:flex p-1 rounded transition-all items-center justify-center absolute inset-0"
                                                            :style="activeLabelMenuId === label.id ? 'display: flex !important' : ''">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                                                viewBox="0 0 20 20" fill="currentColor">
                                                                <path
                                                                    d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                            </svg>
                                                        </button>
                                                    </template>

                                                    <!-- If NOT selected: Kebab (always visible) -->
                                                    <template v-else>
                                                        <button
                                                            @click="activeLabelMenuId = activeLabelMenuId === label.id ? null : label.id!"
                                                            :class="isDarkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'"
                                                            class="p-1 rounded transition-all flex items-center justify-center w-full h-full"
                                                            :style="activeLabelMenuId === label.id ? 'opacity: 1' : ''">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                                                viewBox="0 0 20 20" fill="currentColor">
                                                                <path
                                                                    d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                            </svg>
                                                        </button>
                                                    </template>

                                                    <!-- Popup (Shared for both cases) -->
                                                    <div v-if="activeLabelMenuId === label.id"
                                                        :class="isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
                                                        class="absolute right-0 top-full mt-1 w-32 rounded-lg shadow-xl border z-50 overflow-hidden">
                                                        <button @click="startDeletingLabel(label.id!)"
                                                            class="w-full px-3 py-2 text-sm text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                                                viewBox="0 0 20 20" fill="currentColor">
                                                                <path fill-rule="evenodd"
                                                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                                    clip-rule="evenodd" />
                                                            </svg>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- New Label option - highlighted button -->
                                            <button @click="isCreatingLabel = true"
                                                :class="isDarkMode ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border-blue-500/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200'"
                                                class="w-full px-2.5 py-2 text-sm text-left flex items-center gap-3 transition-colors rounded-lg border">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                                    viewBox="0 0 20 20" fill="currentColor">
                                                    <path fill-rule="evenodd"
                                                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                                        clip-rule="evenodd" />
                                                </svg>
                                                Create new label
                                            </button>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="space-y-3">
                        <label :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'"
                            class="text-sm font-medium flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v2H7V5zm6 4H7v2h6V9zm-6 4h6v2H7v-2z"
                                    clip-rule="evenodd" />
                            </svg>
                            Description
                        </label>
                        <textarea v-model="description" :readonly="!canEdit" :class="[
                            isDarkMode
                                ? 'bg-slate-800 text-white border-slate-700 placeholder-slate-500'
                                : 'bg-slate-50 text-slate-900 border-slate-200 placeholder-slate-400',
                            !canEdit ? 'cursor-default' : ''
                        ]" class="w-full px-4 py-3 rounded-xl border resize-none transition-colors" rows="4"
                            placeholder="Add a more detailed description..." />
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>
