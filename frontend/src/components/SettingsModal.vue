<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('close')"></div>

        <!-- Modal Content -->
        <div :class="isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'"
            class="relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]">

            <!-- Header -->
            <div class="px-6 py-4 border-b flex items-center justify-between shrink-0"
                :class="isDarkMode ? 'border-slate-700' : 'border-slate-200'">
                <h2 class="text-xl font-bold" :class="isDarkMode ? 'text-white' : 'text-slate-900'">Settings</h2>
                <button @click="$emit('close')" class="p-2 rounded-lg transition-colors"
                    :class="isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </button>
            </div>

            <!-- Tabs -->
            <div class="flex border-b shrink-0" :class="isDarkMode ? 'border-slate-700' : 'border-slate-200'">
                <button v-for="tab in ['Profile', 'Security']" :key="tab" @click="activeTab = tab"
                    class="flex-1 py-3 text-sm font-medium border-b-2 transition-colors"
                    :class="activeTab === tab
                        ? 'border-blue-500 text-blue-500'
                        : (isDarkMode ? 'border-transparent text-slate-400 hover:text-slate-200' : 'border-transparent text-slate-500 hover:text-slate-700')">
                    {{ tab }}
                </button>
            </div>

            <!-- Content -->
            <div class="p-6 overflow-y-auto custom-scrollbar">

                <!-- Error Alert -->
                <div v-if="error"
                    class="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 shrink-0 mt-0.5"
                        viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm text-red-500 font-medium">{{ error }}</span>
                </div>

                <!-- Success Alert -->
                <div v-if="successMessage"
                    class="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 shrink-0 mt-0.5"
                        viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm text-green-500 font-medium">{{ successMessage }}</span>
                </div>

                <!-- PROFLE TAB -->
                <div v-if="activeTab === 'Profile'" class="space-y-6">
                    <div class="flex flex-col items-center mb-6">
                        <div
                            class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white mb-3 shadow-lg">
                            {{ getUserInitials() }}
                        </div>
                        <p class="text-sm font-medium" :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">{{
                            user?.email }}</p>
                    </div>

                    <form @submit.prevent="handleProfileUpdate" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider mb-1.5"
                                :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">Username</label>
                            <input v-model="profileForm.username" type="text"
                                class="w-full px-4 py-2.5 rounded-xl border bg-transparent transition-all focus:ring-2 focus:ring-blue-500/20 outline-none"
                                :class="isDarkMode
                                    ? 'border-slate-600 text-white focus:border-blue-500'
                                    : 'border-slate-200 text-slate-800 focus:border-blue-500'" />
                        </div>

                        <div>
                            <label class="block text-xs font-bold uppercase tracking-wider mb-1.5"
                                :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'">Full Name</label>
                            <input v-model="profileForm.fullName" type="text"
                                class="w-full px-4 py-2.5 rounded-xl border bg-transparent transition-all focus:ring-2 focus:ring-blue-500/20 outline-none"
                                :class="isDarkMode
                                    ? 'border-slate-600 text-white focus:border-blue-500'
                                    : 'border-slate-200 text-slate-800 focus:border-blue-500'" />
                        </div>

                        <div class="pt-2">
                            <button type="submit" :disabled="loading"
                                class="w-full py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20">
                                {{ loading ? 'Saving...' : 'Save Changes' }}
                            </button>
                        </div>
                    </form>
                </div>

                <!-- SECURITY TAB -->
                <div v-if="activeTab === 'Security'" class="space-y-6">
                    <form @submit.prevent="handlePasswordUpdate" class="space-y-4">
                        <div>
                            <!-- New Password Component -->
                            <PasswordInput v-model="passwordForm.password" @valid="(v) => isPasswordValid = v" />
                        </div>

                        <div class="pt-2">
                            <button type="submit" :disabled="loading || !isPasswordValid"
                                class="w-full py-2.5 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-lg shadow-blue-500/20">
                                {{ loading ? 'Updating...' : 'Update Password' }}
                            </button>
                        </div>
                    </form>
                </div>

            </div>

            <!-- Footer / Logout -->
            <div class="p-6 border-t bg-slate-50/5"
                :class="isDarkMode ? 'border-slate-700' : 'border-slate-200 bg-slate-50'">
                <button @click="handleLogout"
                    class="w-full py-2.5 rounded-xl font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-all flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                            clip-rule="evenodd" />
                    </svg>
                    Sign Out
                </button>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import PasswordInput from '@/components/PasswordInput.vue'

defineProps<{
    isOpen: boolean
    isDarkMode: boolean
}>()

const emit = defineEmits(['close'])

const { user, updateProfile, updatePassword, logout, loading, error: authError } = useAuth()

const activeTab = ref('Profile')
const localError = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const isPasswordValid = ref(false)

// Compute an aggregated error from hook or local validation
const error = computed(() => localError.value || authError.value)

const profileForm = reactive({
    username: '',
    fullName: ''
})

const passwordForm = reactive({
    password: ''
})

// Initialize form data when valid user is present
onMounted(() => {
    if (user.value) {
        // Checking both possible locations for data (metadata or top-level if we mapped it)
        // Adjust based on your actual user object structure from Supabase
        profileForm.username = user.value.user_metadata?.username || ''
        profileForm.fullName = user.value.user_metadata?.full_name || ''
    }
})

function getUserInitials() {
    if (!user.value) return '??'
    const name = user.value.user_metadata?.full_name || user.value.user_metadata?.username || user.value.email || 'User'
    return name.slice(0, 2).toUpperCase()
}

async function handleProfileUpdate() {
    localError.value = null
    successMessage.value = null
    try {
        await updateProfile({
            username: profileForm.username,
            fullName: profileForm.fullName
        })
        successMessage.value = 'Profile updated successfully!'
    } catch {
        // Error handled in useAuth but we can add local specifics if needed
    }
}

async function handlePasswordUpdate() {
    localError.value = null
    successMessage.value = null
    try {
        await updatePassword({
            password: passwordForm.password
        })
        successMessage.value = 'Password updated! Please login again.'
        passwordForm.password = ''
        // Optional: Logout user after password change? 
        // Usually good practice, but not strictly required if session tokens are handled well.
    } catch {
        // Error handled
    }
}

async function handleLogout() {
    await logout()
    emit('close')
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 20px;
}
</style>
