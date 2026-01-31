<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'

interface Props {
    modelValue: string | null
    isDarkMode: boolean
    disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string | null): void
    (e: 'confirmed'): void
}>()

const isOpen = ref(false)
const currentMonth = ref(new Date())
const selectedDate = ref<Date | null>(null)
const selectedHour = ref(12)
const selectedMinute = ref(0)
const triggerRef = ref<HTMLElement | null>(null)
const calendarRef = ref<HTMLElement | null>(null)
const calendarPosition = ref({ top: 0, left: 0, openUpward: false })

// Parse initial value
watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        const date = new Date(newVal)
        selectedDate.value = date
        selectedHour.value = date.getHours()
        selectedMinute.value = date.getMinutes()
        currentMonth.value = new Date(date.getFullYear(), date.getMonth(), 1)
    } else {
        selectedDate.value = null
        selectedHour.value = 12
        selectedMinute.value = 0
    }
}, { immediate: true })

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const currentMonthName = computed(() => {
    return `${monthNames[currentMonth.value.getMonth()]} ${currentMonth.value.getFullYear()}`
})

const calendarDays = computed(() => {
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean }[] = []

    // Add days from previous month
    const startDay = firstDay.getDay()
    for (let i = startDay - 1; i >= 0; i--) {
        const date = new Date(year, month, -i)
        days.push({
            date,
            isCurrentMonth: false,
            isToday: isToday(date),
            isSelected: isSelected(date)
        })
    }

    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i)
        days.push({
            date,
            isCurrentMonth: true,
            isToday: isToday(date),
            isSelected: isSelected(date)
        })
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(year, month + 1, i)
        days.push({
            date,
            isCurrentMonth: false,
            isToday: isToday(date),
            isSelected: isSelected(date)
        })
    }

    return days
})

function isToday(date: Date): boolean {
    const today = new Date()
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
}

function isSelected(date: Date): boolean {
    if (!selectedDate.value) return false
    return date.getDate() === selectedDate.value.getDate() &&
        date.getMonth() === selectedDate.value.getMonth() &&
        date.getFullYear() === selectedDate.value.getFullYear()
}

function previousMonth() {
    currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
}

function nextMonth() {
    currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
}

function selectDate(date: Date, event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    selectedDate.value = new Date(date)
}

function emitValue() {
    if (selectedDate.value) {
        const date = new Date(selectedDate.value)
        date.setHours(selectedHour.value, selectedMinute.value, 0, 0)
        emit('update:modelValue', date.toISOString())
    }
}

function clearDate() {
    selectedDate.value = null
    emit('update:modelValue', null)
    emit('confirmed')
    isOpen.value = false
}

function confirmDate() {
    emitValue()
    isOpen.value = false
    emit('confirmed')
}

function handleHourInput(event: Event) {
    const input = event.target as HTMLInputElement
    const value = input.value.replace(/\D/g, '')
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 0 && num <= 23) {
        selectedHour.value = num
    }
}

function handleMinuteInput(event: Event) {
    const input = event.target as HTMLInputElement
    const value = input.value.replace(/\D/g, '')
    const num = parseInt(value, 10)
    if (!isNaN(num) && num >= 0 && num <= 59) {
        selectedMinute.value = num
    }
}

function validateHour() {
    if (selectedHour.value < 0) selectedHour.value = 0
    if (selectedHour.value > 23) selectedHour.value = 23
}

function validateMinute() {
    if (selectedMinute.value < 0) selectedMinute.value = 0
    if (selectedMinute.value > 59) selectedMinute.value = 59
}

const formattedDate = computed(() => {
    if (!props.modelValue) return null
    const date = new Date(props.modelValue)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
})

const isPastDue = computed(() => {
    if (!props.modelValue) return false
    return new Date(props.modelValue) < new Date()
})

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement
    if (!target.closest('.date-picker-container') && !target.closest('.date-picker-calendar')) {
        // Emit the current value if a date was selected before closing
        if (selectedDate.value) {
            emitValue()
            emit('confirmed')
        }
        isOpen.value = false
    }
}

// Calculate calendar position to keep it in viewport
function updateCalendarPosition() {
    if (!triggerRef.value) return

    const triggerRect = triggerRef.value.getBoundingClientRect()
    const calendarHeight = 400 // Approximate calendar height
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const calendarWidth = 288 // w-72 = 18rem = 288px

    // Check if there's enough space below
    const spaceBelow = viewportHeight - triggerRect.bottom
    const spaceAbove = triggerRect.top
    const openUpward = spaceBelow < calendarHeight && spaceAbove > spaceBelow

    let top: number
    if (openUpward) {
        top = triggerRect.top - calendarHeight - 8
    } else {
        top = triggerRect.bottom + 8
    }

    // Ensure it doesn't go off screen vertically
    top = Math.max(8, Math.min(top, viewportHeight - calendarHeight - 8))

    // Calculate left position and ensure it stays in viewport
    let left = triggerRect.left
    if (left + calendarWidth > viewportWidth - 8) {
        left = viewportWidth - calendarWidth - 8
    }
    left = Math.max(8, left)

    calendarPosition.value = { top, left, openUpward }
}

watch(isOpen, async (newVal) => {
    if (newVal) {
        document.addEventListener('click', handleClickOutside)
        await nextTick()
        updateCalendarPosition()
        window.addEventListener('scroll', updateCalendarPosition, true)
        window.addEventListener('resize', updateCalendarPosition)
    } else {
        document.removeEventListener('click', handleClickOutside)
        window.removeEventListener('scroll', updateCalendarPosition, true)
        window.removeEventListener('resize', updateCalendarPosition)
    }
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('scroll', updateCalendarPosition, true)
    window.removeEventListener('resize', updateCalendarPosition)
})
</script>

<template>
    <div class="date-picker-container relative" ref="triggerRef" @click.stop>
        <!-- Trigger Button -->
        <button v-if="!modelValue" @click="isOpen = !isOpen" :disabled="disabled" :class="[
            isDarkMode
                ? 'border-slate-600 text-slate-400 hover:border-slate-500'
                : 'border-slate-300 text-slate-500 hover:border-slate-400',
            disabled ? 'opacity-50 cursor-not-allowed' : ''
        ]"
            class="px-3 h-7 rounded-full text-xs font-medium border border-dashed transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clip-rule="evenodd" />
            </svg>
            Set date
        </button>

        <!-- Date Badge -->
        <div v-else @click="!disabled && (isOpen = !isOpen)" :class="[
            isPastDue
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : (isDarkMode ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-600 border-blue-200'),
            disabled ? 'cursor-default' : 'cursor-pointer hover:opacity-80'
        ]" class="inline-flex items-center gap-2 px-3 h-7 rounded-full text-xs font-medium border transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clip-rule="evenodd" />
            </svg>
            <span>{{ formattedDate }}</span>
            <button v-if="!disabled" @click.stop="clearDate" class="ml-1 hover:opacity-70 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clip-rule="evenodd" />
                </svg>
            </button>
        </div>

        <!-- Calendar Dropdown -->
        <Teleport to="body">
            <div v-if="isOpen" ref="calendarRef"
                :class="isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
                class="date-picker-calendar fixed z-100 w-72 rounded-xl border shadow-2xl overflow-hidden" :style="{
                    top: calendarPosition.top + 'px',
                    left: calendarPosition.left + 'px'
                }" @click.stop>
                <!-- Header -->
                <div :class="[isDarkMode ? 'bg-slate-700/50 border-slate-700' : 'bg-slate-50 border-slate-200']"
                    class="px-4 py-2 flex items-center justify-between border-b">
                    <button @click="previousMonth"
                        :class="isDarkMode ? 'hover:bg-slate-600 text-slate-300' : 'hover:bg-slate-200 text-slate-600'"
                        class="p-1 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                    <span :class="isDarkMode ? 'text-white' : 'text-slate-800'" class="font-semibold">
                        {{ currentMonthName }}
                    </span>
                    <button @click="nextMonth"
                        :class="isDarkMode ? 'hover:bg-slate-600 text-slate-300' : 'hover:bg-slate-200 text-slate-600'"
                        class="p-1 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>

                <!-- Day Names -->
                <div class="grid grid-cols-7 gap-0 px-2 pt-2">
                    <div v-for="day in dayNames" :key="day" :class="isDarkMode ? 'text-slate-500' : 'text-slate-400'"
                        class="h-8 flex items-center justify-center text-xs font-medium">
                        {{ day }}
                    </div>
                </div>

                <!-- Calendar Grid -->
                <div class="grid grid-cols-7 gap-0 px-2 pb-2">
                    <button v-for="(day, idx) in calendarDays" :key="idx" @click="selectDate(day.date, $event)" :class="[
                        'h-8 w-8 mx-auto flex items-center justify-center text-sm rounded-full transition-all',
                        day.isSelected
                            ? 'bg-blue-500 text-white font-semibold'
                            : day.isToday
                                ? (isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-800')
                                : day.isCurrentMonth
                                    ? (isDarkMode ? 'text-slate-200 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100')
                                    : (isDarkMode ? 'text-slate-600 hover:bg-slate-700' : 'text-slate-400 hover:bg-slate-50')
                    ]">
                        {{ day.date.getDate() }}
                    </button>
                </div>

                <!-- Time Picker + Done Button -->
                <div :class="isDarkMode ? 'bg-slate-700/50 border-slate-700' : 'bg-slate-50 border-slate-200'"
                    class="px-4 py-2 border-t flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg"
                            :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'" class="h-4 w-4"
                            viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clip-rule="evenodd" />
                        </svg>
                        <div class="flex items-center gap-1">
                            <input type="text" :value="String(selectedHour).padStart(2, '0')" @input="handleHourInput"
                                @blur="validateHour" maxlength="2"
                                :class="isDarkMode ? 'bg-slate-800 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'"
                                class="w-10 px-2 py-1 rounded-lg border text-sm text-center" />
                            <span :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">:</span>
                            <input type="text" :value="String(selectedMinute).padStart(2, '0')"
                                @input="handleMinuteInput" @blur="validateMinute" maxlength="2"
                                :class="isDarkMode ? 'bg-slate-800 text-white border-slate-600' : 'bg-white text-slate-800 border-slate-300'"
                                class="w-10 px-2 py-1 rounded-lg border text-sm text-center" />
                        </div>
                    </div>
                    <button @click="confirmDate"
                        class="px-4 py-1 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
                        Done
                    </button>
                </div>
            </div>
        </Teleport>
    </div>
</template>
