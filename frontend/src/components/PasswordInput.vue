<template>
    <div class="space-y-4">
        <!-- Main Password Field -->
        <div>
            <label
                class="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-1.5 ml-1">Password</label>
            <div class="relative">
                <input :value="modelValue" @input="onInput" :type="showPassword ? 'text' : 'password'"
                    class="w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
                    :class="isValid ? 'border-slate-700' : (modelValue ? 'border-red-500/50' : 'border-slate-700')"
                    placeholder="••••••••" />
                <button type="button" @click="showPassword = !showPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                            clip-rule="evenodd" />
                        <path
                            d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fill-rule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>

            <!-- Strength Meter -->
            <div class="mt-2 h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden flex">
                <div class="h-full transition-all duration-300 ease-out" :class="strengthColor"
                    :style="{ width: `${strengthScore}%` }"></div>
            </div>

            <!-- Requirements Chips -->
            <div v-if="modelValue && !isValid" class="mt-3 flex flex-wrap gap-2">
                <span v-if="!hasLength"
                    class="px-3 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-xs font-medium text-slate-300 shadow-sm">
                    Add 6+ characters
                </span>
                <span v-if="!hasUpper"
                    class="px-3 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-xs font-medium text-slate-300 shadow-sm">
                    Add uppercase letter
                </span>
                <span v-if="!hasLower"
                    class="px-3 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-xs font-medium text-slate-300 shadow-sm">
                    Add lowercase letter
                </span>
                <span v-if="!hasNumber"
                    class="px-3 py-1.5 bg-slate-800 border border-slate-600/50 rounded-lg text-xs font-medium text-slate-300 shadow-sm">
                    Add number or symbol
                </span>
            </div>
        </div>

        <!-- Confirm Password Field -->
        <div>
            <label class="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-1.5 ml-1">Confirm
                Password</label>
            <div class="relative">
                <input v-model="confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                    class="w-full bg-slate-800/50 border rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
                    :class="passwordsMatch ? 'border-slate-700' : 'border-red-500/50'" placeholder="••••••••" />
                <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
                        viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                            clip-rule="evenodd" />
                        <path
                            d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                        fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fill-rule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>

            <!-- Confirm Strength Meter (Visual Consistency) -->
            <div class="mt-2 h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden flex">
                <div class="h-full transition-all duration-300 ease-out" :class="confirmStrengthColor"
                    :style="{ width: `${confirmStrengthScore}%` }"></div>
            </div>

            <p v-if="confirmPassword && !passwordsMatch" class="mt-1 text-xs text-red-400 ml-1">
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

// --- Strength Logic (Main) ---
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
    if (strengthScore.value <= 75) return 'bg-yellow-500'
    return 'bg-green-500'
})

// --- Strength Logic (Confirm - Mirrored) ---
// We calculate strength for the confirm box based on its OWN input so the bar reacts as you type
const confirmStrengthScore = computed(() => {
    if (!confirmPassword.value) return 0
    let score = 0
    if (confirmPassword.value.length >= 6) score += 25
    if (/[A-Z]/.test(confirmPassword.value)) score += 25
    if (/[a-z]/.test(confirmPassword.value)) score += 25
    if (/[\d\W]/.test(confirmPassword.value)) score += 25
    return score
})

const confirmStrengthColor = computed(() => {
    if (confirmStrengthScore.value <= 25) return 'bg-red-500'
    if (confirmStrengthScore.value <= 50) return 'bg-orange-500'
    if (confirmStrengthScore.value <= 75) return 'bg-yellow-500'
    return 'bg-green-500'
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
