<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop with blur -->
        <div class="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" @click="$emit('close')"></div>

        <!-- Modal Content -->
        <div class="relative w-full max-w-[400px] animate-fade-in-up">
            <!-- Glow effect -->
            <div
                class="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-blue-600/20 rounded-2xl blur-xl opacity-70" />

            <div class="relative glass-card rounded-xl overflow-hidden">
                <!-- Header with user info -->
                <div class="p-5 flex items-center gap-4">
                    <!-- Avatar (display only) -->
                    <div v-if="avatarUrl"
                        class="w-12 h-12 rounded-full overflow-hidden shadow-lg shadow-blue-500/30 flex-shrink-0">
                        <img :src="avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
                    </div>
                    <div v-else
                        class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-lg font-bold text-white shadow-lg shadow-blue-500/30 flex-shrink-0">
                        {{ getUserInitials() }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-slate-100 truncate">{{ user?.user_metadata?.full_name ||
                            user?.user_metadata?.username || 'User' }}</p>
                        <p class="text-xs text-slate-500 truncate">{{ user?.email }}</p>
                    </div>
                    <button @click="$emit('close')"
                        class="p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>

                <!-- Content -->
                <div class="px-5 pb-5 space-y-2">
                    <!-- Alerts -->
                    <div v-if="error"
                        class="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-400 shrink-0"
                            viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clip-rule="evenodd" />
                        </svg>
                        <span class="text-xs text-red-400">{{ error }}</span>
                    </div>

                    <div v-if="successMessage"
                        class="mb-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400 shrink-0"
                            viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        <span class="text-xs text-emerald-400">{{ successMessage }}</span>
                    </div>

                    <!-- Edit Profile -->
                    <button @click="openSection = openSection === 'profile' ? null : 'profile'" class="settings-item">
                        <div class="settings-icon bg-blue-500/20 text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                    clip-rule="evenodd" />
                            </svg>
                        </div>
                        <span class="flex-1 text-left">Edit Profile</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500 transition-transform"
                            :class="openSection === 'profile' ? 'rotate-180' : ''" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>

                    <!-- Profile Expandable - FULL WIDTH -->
                    <div v-if="openSection === 'profile'" class="settings-expand">
                        <form @submit.prevent="handleProfileUpdate" class="space-y-4">
                            <!-- Change Photo -->
                            <div class="flex items-center gap-4 pb-3 border-b border-slate-700/50">
                                <div class="relative">
                                    <div v-if="avatarUrl" class="w-14 h-14 rounded-full overflow-hidden">
                                        <img :src="avatarUrl" alt="Avatar" class="w-full h-full object-cover" />
                                    </div>
                                    <div v-else
                                        class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xl font-bold text-white">
                                        {{ getUserInitials() }}
                                    </div>
                                </div>
                                <button type="button" @click="triggerAvatarUpload" class="change-photo-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                        fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                                            clip-rule="evenodd" />
                                    </svg>
                                    Change Photo
                                </button>
                                <input ref="avatarInput" type="file" accept="image/*" class="hidden"
                                    @change="handleAvatarChange" />
                            </div>

                            <div>
                                <label class="input-label">Username</label>
                                <input v-model="profileForm.username" type="text" placeholder="Enter username"
                                    class="input-field" />
                            </div>
                            <div>
                                <label class="input-label">Full Name</label>
                                <input v-model="profileForm.fullName" type="text" placeholder="Enter full name"
                                    class="input-field" />
                            </div>
                            <button type="submit" :disabled="loading" class="submit-button-sm">
                                {{ loading ? 'Saving...' : 'Save Changes' }}
                            </button>
                        </form>
                    </div>

                    <!-- Change Password -->
                    <button @click="openSection = openSection === 'security' ? null : 'security'" class="settings-item">
                        <div class="settings-icon bg-amber-500/20 text-amber-400">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                    clip-rule="evenodd" />
                            </svg>
                        </div>
                        <span class="flex-1 text-left">Change Password</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500 transition-transform"
                            :class="openSection === 'security' ? 'rotate-180' : ''" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>

                    <!-- Security Expandable - FULL WIDTH -->
                    <div v-if="openSection === 'security'" class="settings-expand">
                        <form @submit.prevent="handlePasswordUpdate" class="space-y-3">
                            <PasswordInput v-model="passwordForm.password" @valid="(v) => isPasswordValid = v" />
                            <button type="submit" :disabled="loading || !isPasswordValid" class="submit-button-sm">
                                {{ loading ? 'Updating...' : 'Update Password' }}
                            </button>
                        </form>
                    </div>

                    <!-- Theme Toggle -->
                    <button @click="emit('toggle-dark-mode')" class="settings-item">
                        <div class="settings-icon bg-violet-500/20 text-violet-400">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                            </svg>
                        </div>
                        <span class="flex-1 text-left">{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
                        <div class="w-10 h-5 rounded-full transition-colors relative"
                            :class="isDarkMode ? 'bg-violet-500/30' : 'bg-slate-600'">
                            <span class="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
                                :class="isDarkMode ? 'left-5 bg-violet-400' : 'left-0.5 bg-slate-400'"></span>
                        </div>
                    </button>

                    <!-- Sign Out -->
                    <button @click="handleLogout" class="settings-item hover:bg-red-500/10">
                        <div class="settings-icon bg-red-500/20 text-red-400">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                                    clip-rule="evenodd" />
                            </svg>
                        </div>
                        <span class="flex-1 text-left text-red-400">Sign Out</span>
                    </button>
                </div>
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

const emit = defineEmits(['close', 'toggle-dark-mode'])

const { user, updateProfile, updatePassword, uploadAvatar, logout, loading, error: authError } = useAuth()

const avatarInput = ref<HTMLInputElement | null>(null)
const openSection = ref<string | null>(null)
const localError = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const isPasswordValid = ref(false)

const error = computed(() => localError.value || authError.value)
const avatarUrl = computed(() => user.value?.user_metadata?.avatar_url || null)

const profileForm = reactive({
    username: '',
    fullName: ''
})

const passwordForm = reactive({
    password: ''
})

onMounted(() => {
    if (user.value) {
        profileForm.username = user.value.user_metadata?.username || ''
        profileForm.fullName = user.value.user_metadata?.full_name || ''
    }
})

function getUserInitials() {
    if (!user.value) return '??'
    const name = user.value.user_metadata?.full_name || user.value.user_metadata?.username || user.value.email || 'User'
    return name.slice(0, 2).toUpperCase()
}

function triggerAvatarUpload() {
    avatarInput.value?.click()
}

async function handleAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    localError.value = null
    successMessage.value = null
    try {
        await uploadAvatar(file)
        successMessage.value = 'Avatar updated!'
    } catch {
        // Error handled in useAuth
    }
    // Reset input
    input.value = ''
}

async function handleProfileUpdate() {
    localError.value = null
    successMessage.value = null
    try {
        await updateProfile({
            username: profileForm.username,
            fullName: profileForm.fullName
        })
        successMessage.value = 'Profile updated!'
        openSection.value = null
    } catch {
        // Error handled in useAuth
    }
}

async function handlePasswordUpdate() {
    localError.value = null
    successMessage.value = null
    try {
        await updatePassword({
            password: passwordForm.password
        })
        successMessage.value = 'Password updated!'
        passwordForm.password = ''
        openSection.value = null
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
.glass-card {
    background: linear-gradient(135deg, rgba(30, 27, 45, 0.95) 0%, rgba(20, 18, 35, 0.98) 100%);
    border: 1px solid rgba(59, 130, 246, 0.15);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(20px);
}

.settings-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: rgb(226, 232, 240);
    transition: all 0.15s ease;
}

.settings-item:hover {
    background: rgba(59, 130, 246, 0.1);
}

.settings-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.settings-expand {
    padding: 1rem;
    background: rgba(30, 27, 50, 0.5);
    border-radius: 0.75rem;
    border: 1px solid rgba(59, 130, 246, 0.1);
}

.input-label {
    display: block;
    color: rgb(148, 163, 184);
    font-size: 0.6875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.375rem;
}

.input-field {
    width: 100%;
    background: rgba(30, 27, 50, 0.6);
    border: 1px solid rgba(59, 130, 246, 0.2);
    border-radius: 0.5rem;
    padding: 0.625rem 0.75rem;
    color: rgb(226, 232, 240);
    font-size: 0.8125rem;
    transition: all 0.2s ease;
}

.input-field:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.input-field::placeholder {
    color: rgb(100, 116, 139);
}

.submit-button-sm {
    width: 100%;
    padding: 0.625rem 1rem;
    background: linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(14, 165, 233) 100%);
    color: white;
    font-weight: 600;
    font-size: 0.8125rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
}

.submit-button-sm:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.submit-button-sm:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.change-photo-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    background: rgba(59, 130, 246, 0.15);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 0.5rem;
    color: rgb(96, 165, 250);
    font-size: 0.8125rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.change-photo-btn:hover {
    background: rgba(59, 130, 246, 0.25);
    border-color: rgba(59, 130, 246, 0.5);
}

@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fade-in-up 0.3s ease-out;
}
</style>
