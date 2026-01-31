<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Card, Label } from '@/services/api'
import UserAvatar from '@/components/ui/UserAvatar.vue'

interface Column {
    id: string
    title: string
    color?: string
}

const props = defineProps<{
    card: Card
    isDarkMode: boolean
    labels: Label[]
    columnId: string
    allColumns?: Column[]
    canEdit?: boolean
}>()

const emit = defineEmits<{
    (e: 'mousedown', event: MouseEvent): void
    (e: 'move-to-column', targetColumnId: string): void
    (e: 'click'): void
}>()

const isMobile = ref(false)
const menuOpen = ref(false)

function checkMobile() {
    isMobile.value = window.matchMedia('(max-width: 640px)').matches
}

onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
})

function getLabelById(labelId: string | null | undefined, labels: Label[]): Label | undefined {
    if (!labelId) return undefined
    return labels.find(l => l.id === labelId)
}

// Show max 3 member avatars, with overflow indicator
const visibleMembers = computed(() => props.card.members?.slice(0, 3) || [])
const overflowCount = computed(() => Math.max(0, (props.card.members?.length || 0) - 3))

// Other columns (exclude current)
const otherColumns = computed(() => {
    return (props.allColumns || []).filter(c => c.id !== props.columnId)
})

const menuButtonRef = ref<HTMLElement | null>(null)
const menuPosition = ref({ top: 0, right: 0 })

function toggleMenu(event: Event) {
    event.stopPropagation()
    event.preventDefault()

    // Calculate position before opening
    if (!menuOpen.value && menuButtonRef.value) {
        const rect = menuButtonRef.value.getBoundingClientRect()
        menuPosition.value = {
            top: rect.bottom + 4, // 4px below button
            right: window.innerWidth - rect.right // align right edge
        }
    }
    menuOpen.value = !menuOpen.value
}

function handleMoveToColumn(targetColumnId: string) {
    menuOpen.value = false
    emit('move-to-column', targetColumnId)
}

function closeMenu() {
    menuOpen.value = false
}
</script>

<template>
    <div @mousedown="!isMobile && emit('mousedown', $event)" @click="isMobile && !menuOpen && emit('click')"
        :data-card-id="card.id"
        :class="isDarkMode ? 'bg-slate-700/80 border-slate-600/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5' : 'bg-slate-50 border-slate-300 hover:border-blue-300 hover:shadow-md'"
        class="p-4 rounded-xl border transition-all duration-200 group relative select-none max-w-full overflow-hidden"
        :style="{ cursor: isMobile ? 'pointer' : 'grab' }">

        <!-- Mobile Menu Button (only on mobile, for editors) -->
        <div v-if="isMobile && canEdit && otherColumns.length > 0" ref="menuButtonRef"
            class="absolute top-2 right-2 z-10">
            <button @click="toggleMenu" @touchstart.stop class="p-1.5 rounded-lg transition-colors" :class="isDarkMode
                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-600/50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200'">
                <!-- Switch/Move arrows icon -->
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
            </button>
        </div>

        <!-- Dropdown Menu (teleported for proper stacking) -->
        <Teleport to="body">
            <!-- Backdrop to close menu -->
            <div v-if="menuOpen" class="fixed inset-0 z-99" @click="closeMenu" />

            <!-- Dropdown (positioned near button) -->
            <div v-if="menuOpen" class="fixed z-100 w-44 rounded-xl shadow-2xl overflow-hidden"
                :class="isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'"
                :style="{ top: menuPosition.top + 'px', right: menuPosition.right + 'px' }" @click.stop>
                <div class="px-3 py-2 border-b"
                    :class="isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'">
                    <span class="text-xs font-medium uppercase tracking-wide">Move to</span>
                </div>
                <div class="max-h-60 overflow-y-auto">
                    <button v-for="col in otherColumns" :key="col.id" @click="handleMoveToColumn(col.id)"
                        class="w-full px-3 py-2.5 text-left text-sm font-medium flex items-center gap-2.5 transition-colors"
                        :class="isDarkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'">
                        <div class="w-3 h-3 rounded-full shrink-0"
                            :style="{ backgroundColor: col.color || '#64748b' }" />
                        {{ col.title }}
                    </button>
                </div>
            </div>
        </Teleport>

        <!-- Label Tags -->
        <div v-if="card.label_ids && card.label_ids.length > 0" class="flex flex-wrap gap-1.5 mb-3 pr-6">
            <span v-for="labelId in card.label_ids" :key="labelId" class="px-2 py-0.5 text-xs font-medium rounded-full"
                :style="{
                    backgroundColor: getLabelById(labelId, labels)?.color || '#64748b',
                    color: 'white'
                }">
                {{ getLabelById(labelId, labels)?.name || 'Label' }}
            </span>
        </div>

        <p :class="isDarkMode ? 'text-slate-200' : 'text-slate-800'" class="text-sm font-medium leading-relaxed"
            :style="{ paddingRight: isMobile && canEdit ? '1.5rem' : '0' }">
            {{ card.title }}
        </p>

        <p v-if="card.description" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'"
            class="text-xs mt-2 line-clamp-2">
            {{ card.description }}
        </p>

        <!-- Member Avatars -->
        <div v-if="card.members && card.members.length > 0" class="flex items-center mt-3 -space-x-2">
            <div v-for="member in visibleMembers" :key="member.id" class="border-2 rounded-full"
                :class="isDarkMode ? 'border-slate-700' : 'border-white'" :title="member.full_name || member.username">
                <UserAvatar :avatarUrl="member.avatar_url" :name="member.full_name || member.username" size="xs"
                    :isDarkMode="isDarkMode" />
            </div>
            <div v-if="overflowCount > 0"
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-medium shrink-0"
                :class="isDarkMode ? 'border-slate-700 bg-slate-600 text-slate-300' : 'border-white bg-slate-300 text-slate-600'">
                +{{ overflowCount }}
            </div>
        </div>
    </div>
</template>
