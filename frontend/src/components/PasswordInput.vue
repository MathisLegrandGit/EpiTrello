<template>
    <div class="space-y-4">
        <!-- Main Password Field -->
        <div class="input-group">
            <label class="input-label">Password</label>
            <div class="relative">
                <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <input :value="modelValue" @input="onInput" :type="showPassword ? 'text' : 'password'"
                    class="input-field pr-10" :class="isValid ? '' : (modelValue ? 'border-red-500/30' : '')"
                    placeholder="Enter password" />
                <button type="button" tabindex="-1" @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors">
                    <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <path
                            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                </button>
            </div>

            <!-- Strength Meter -->
            <div class="mt-3 h-1 w-full bg-slate-800/80 rounded-full overflow-hidden">
                <div class="h-full transition-all duration-300 ease-out rounded-full" :class="strengthColor"
                    :style="{ width: `${strengthScore}%` }"></div>
            </div>

            <!-- Requirements Chips (inline) -->
            <div v-if="modelValue && !isValid" class="mt-2 flex flex-wrap gap-1.5">
                <span v-if="!hasLength" class="requirement-chip">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clip-rule="evenodd" />
                    </svg>
                    6+ characters
                </span>
                <span v-if="!hasUpper" class="requirement-chip">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clip-rule="evenodd" />
                    </svg>
                    Uppercase
                </span>
                <span v-if="!hasLower" class="requirement-chip">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clip-rule="evenodd" />
                    </svg>
                    Lowercase
                </span>
                <span v-if="!hasNumber" class="requirement-chip">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clip-rule="evenodd" />
                    </svg>
                    Number/Symbol
                </span>
            </div>
        </div>

        <!-- Confirm Password Field -->
        <div class="input-group">
            <label class="input-label">Confirm Password</label>
            <div class="relative">
                <div class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                    class="input-field pr-10" :class="passwordsMatch ? '' : 'border-red-500/30'"
                    placeholder="Confirm password" />
                <button type="button" tabindex="-1" @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400 transition-colors">
                    <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2">
                        <path
                            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                </button>
            </div>

            <!-- Match indicator bar -->
            <div class="mt-3 h-1 w-full bg-slate-800/80 rounded-full overflow-hidden">
                <div class="h-full transition-all duration-300 ease-out rounded-full"
                    :class="confirmPassword ? (passwordsMatch && confirmPassword === modelValue ? 'bg-emerald-500' : 'bg-red-500') : 'bg-transparent'"
                    :style="{ width: confirmPassword ? '100%' : '0%' }"></div>
            </div>

            <p v-if="confirmPassword && !passwordsMatch" class="mt-2 text-xs text-red-400 ml-1">
                Passwords do not match
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
    modelValue: string
}>()

const emit = defineEmits(['update:modelValue', 'valid'])

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const confirmPassword = ref('')

// --- Validation Logic ---
const hasLength = computed(() => props.modelValue.length >= 6)
const hasUpper = computed(() => /[A-Z]/.test(props.modelValue))
const hasLower = computed(() => /[a-z]/.test(props.modelValue))
const hasNumber = computed(() => /[\d\W]/.test(props.modelValue)) // Number OR Symbol

const isValid = computed(() =>
    hasLength.value && hasUpper.value && hasLower.value && hasNumber.value
)

const passwordsMatch = computed(() =>
    !confirmPassword.value || props.modelValue === confirmPassword.value
)

// --- Strength Logic ---
const strengthScore = computed(() => {
    if (!props.modelValue) return 0
    let score = 0
    if (hasLength.value) score += 25
    if (hasUpper.value) score += 25
    if (hasLower.value) score += 25
    if (hasNumber.value) score += 25
    return score
})

const strengthColor = computed(() => {
    if (strengthScore.value <= 25) return 'bg-red-500'
    if (strengthScore.value <= 50) return 'bg-orange-500'
    if (strengthScore.value <= 75) return 'bg-amber-500'
    return 'bg-emerald-500'
})

function onInput(e: Event) {
    emit('update:modelValue', (e.target as HTMLInputElement).value)
}

// Watch validation status and emit upward
watch([isValid, passwordsMatch, () => props.modelValue, confirmPassword], () => {
    // Only valid if strong enough AND passwords match AND confirm is filled
    const isComplete = isValid.value && passwordsMatch.value && !!confirmPassword.value
    emit('valid', isComplete)
}, { immediate: true })
</script>

<style scoped>
.input-group {
    position: relative;
}

.input-label {
    display: block;
    color: rgb(148, 163, 184);
    font-size: 0.6875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.375rem;
    margin-left: 0.25rem;
}

.input-field {
    width: 100%;
    background: rgba(30, 27, 50, 0.6);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 0.75rem;
    padding: 0.75rem 0.875rem 0.75rem 2.5rem;
    color: rgb(226, 232, 240);
    font-size: 0.875rem;
    transition: all 0.2s ease;
}

.input-field::placeholder {
    color: rgb(100, 116, 139);
}

.input-field:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow:
        0 0 0 3px rgba(59, 130, 246, 0.1),
        0 0 20px rgba(59, 130, 246, 0.1);
}

.input-field:hover:not(:focus) {
    border-color: rgba(59, 130, 246, 0.3);
}

.requirement-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.625rem;
    background: rgba(30, 27, 50, 0.8);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 0.5rem;
    font-size: 0.6875rem;
    font-weight: 500;
    color: rgb(203, 213, 225);
    transition: all 0.2s ease;
}

.requirement-chip:hover {
    border-color: rgba(59, 130, 246, 0.4);
    background: rgba(59, 130, 246, 0.1);
}
</style>
