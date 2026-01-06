<template>
    <div class="min-h-screen w-full flex items-center justify-center overflow-hidden relative auth-page">
        <!-- Animated Gradient Background -->
        <div class="absolute inset-0 z-0">
            <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950" />
            <!-- Floating orbs -->
            <div class="orb orb-1" />
            <div class="orb orb-2" />
            <div class="orb orb-3" />
        </div>

        <!-- Main Container -->
        <div class="relative z-10 w-full max-w-[400px] mx-4">
            <!-- Logo / Brand -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center gap-3 mb-4">
                    <div
                        class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path
                                d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                        </svg>
                    </div>
                    <span class="text-2xl font-bold text-white">EpiTrello</span>
                </div>
                <p class="text-slate-500 text-sm">Organize your work, amplify your productivity</p>
            </div>

            <!-- Card -->
            <div class="animate-fade-in-up">
                <div
                    class="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-cyan-500/20 to-blue-600/20 rounded-2xl blur-xl opacity-70" />

                <div class="relative glass-card rounded-xl p-6">
                    <!-- Welcome Text -->
                    <div class="text-center mb-5">
                        <h2 class="text-xl font-semibold text-white">
                            {{ isLogin ? 'Welcome back' : 'Join EpiTrello' }}
                        </h2>
                        <p class="text-slate-500 text-sm mt-1">
                            {{ isLogin ? 'Sign in to continue to your boards' : 'Create an account to get started' }}
                        </p>
                    </div>
                    <!-- Mode Toggle Pills (inside card) -->
                    <div class="flex justify-center mb-5">
                        <div class="inline-flex p-1 rounded-full bg-slate-800/60 border border-slate-700/50">
                            <button type="button" @click="isLogin = true"
                                :class="isLogin ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'"
                                class="px-8 py-1.5 rounded-full text-sm font-medium transition-all duration-300">
                                Sign In
                            </button>
                            <button type="button" @click="isLogin = false"
                                :class="!isLogin ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'"
                                class="px-8 py-1.5 rounded-full text-sm font-medium transition-all duration-300">
                                Sign Up
                            </button>
                        </div>
                    </div>


                    <!-- Error Alert -->
                    <div v-if="error"
                        class="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 animate-shake">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-400 shrink-0"
                            viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clip-rule="evenodd" />
                        </svg>
                        <span class="text-xs text-red-400">{{ error }}</span>
                    </div>

                    <form @submit.prevent="handleSubmit">
                        <!-- Login Form -->
                        <div v-if="isLogin" class="space-y-4">
                            <div>
                                <label class="input-label">Username or Email</label>
                                <div class="input-group">
                                    <div class="input-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                            fill="currentColor">
                                            <path fill-rule="evenodd"
                                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                    <input v-model="form.identifier" type="text" required class="input-field"
                                        placeholder="Enter username or email" />
                                </div>
                            </div>

                            <div>
                                <label class="input-label">Password</label>
                                <div class="input-group">
                                    <div class="input-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                            fill="currentColor">
                                            <path fill-rule="evenodd"
                                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                                clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                    <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required
                                        class="input-field" placeholder="Enter password" />
                                    <button type="button" @click="showPassword = !showPassword" class="input-toggle">
                                        <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path
                                                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Signup Form -->
                        <div v-else class="space-y-4">
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="input-label">Username</label>
                                    <div class="input-group">
                                        <div class="input-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                                fill="currentColor">
                                                <path fill-rule="evenodd"
                                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                    clip-rule="evenodd" />
                                            </svg>
                                        </div>
                                        <input v-model="form.username" type="text" required minlength="3"
                                            class="input-field" placeholder="Choose username" />
                                    </div>
                                </div>
                                <div>
                                    <label class="input-label">Email</label>
                                    <div class="input-group">
                                        <div class="input-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20"
                                                fill="currentColor">
                                                <path
                                                    d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                            </svg>
                                        </div>
                                        <input v-model="form.email" type="email" required class="input-field"
                                            placeholder="your@email.com" />
                                    </div>
                                </div>
                            </div>

                            <PasswordInput v-model="form.password" @valid="(v) => isPasswordValid = v" />
                        </div>

                        <!-- Submit Button -->
                        <button type="submit" :disabled="loading || (!isLogin && !isPasswordValid)"
                            class="submit-button group mt-6">
                            <span class="relative z-10 flex items-center justify-center gap-2">
                                <svg v-if="loading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg"
                                    fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4" />
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <svg v-else-if="isLogin" xmlns="http://www.w3.org/2000/svg"
                                    class="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path fill-rule="evenodd"
                                        d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z"
                                        clip-rule="evenodd" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg"
                                    class="h-4 w-4 transition-transform group-hover:scale-110" viewBox="0 0 20 20"
                                    fill="currentColor">
                                    <path
                                        d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                </svg>
                                {{ loading ? 'Please wait...' : (isLogin ? 'Continue' : 'Create Account') }}
                            </span>
                            <div
                                class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        </button>
                    </form>
                </div>
            </div>

            <!-- Security Badge -->
            <div class="flex items-center justify-center gap-2 mt-6 text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clip-rule="evenodd" />
                </svg>
                <span class="text-xs">Your data is encrypted and secure</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '@/composables/useAuth'
import PasswordInput from '@/components/PasswordInput.vue'

const { login, signup, loading, error } = useAuth()

const isLogin = ref(true)
const isPasswordValid = ref(false)
const showPassword = ref(false)

const form = reactive({
    email: '',
    username: '',
    password: '',
    identifier: ''
})

async function handleSubmit() {
    if (isLogin.value) {
        await login({
            identifier: form.identifier,
            password: form.password
        })
    } else {
        await signup({
            email: form.email,
            username: form.username,
            password: form.password
        })
    }
}
</script>

<style scoped>
.auth-page {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.glass-card {
    background: linear-gradient(135deg, rgba(30, 27, 45, 0.95) 0%, rgba(20, 18, 35, 0.98) 100%);
    border: 1px solid rgba(59, 130, 246, 0.15);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(20px);
}

.orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.5;
}

.orb-1 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%);
    top: -10%;
    right: -5%;
    animation: float 12s ease-in-out infinite;
}

.orb-2 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%);
    bottom: -15%;
    left: -10%;
    animation: float 15s ease-in-out infinite reverse;
}

.orb-3 {
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(99, 179, 237, 0.3) 0%, transparent 70%);
    top: 40%;
    left: 50%;
    animation: float 10s ease-in-out infinite;
}

.input-group {
    position: relative;
    display: flex;
    align-items: center;
}

.input-icon {
    position: absolute;
    left: 0.875rem;
    color: rgb(100, 116, 139);
    pointer-events: none;
    z-index: 1;
}

.input-label {
    display: block;
    color: rgb(148, 163, 184);
    font-size: 0.6875rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.375rem;
    margin-left: 0.125rem;
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

.input-toggle {
    position: absolute;
    right: 0.875rem;
    color: rgb(100, 116, 139);
    transition: color 0.2s ease;
}

.input-toggle:hover {
    color: rgb(59, 130, 246);
}

.submit-button {
    position: relative;
    width: 100%;
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, rgb(59, 130, 246) 0%, rgb(14, 165, 233) 50%, rgb(56, 189, 248) 100%);
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    border-radius: 0.75rem;
    border: none;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow:
        0 4px 15px rgba(59, 130, 246, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

.submit-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow:
        0 8px 25px rgba(59, 130, 246, 0.5),
        0 0 0 1px rgba(255, 255, 255, 0.15) inset;
}

.submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

@keyframes float {

    0%,
    100% {
        transform: translate(0, 0);
    }

    50% {
        transform: translate(30px, -30px);
    }
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
    animation: fade-in-up 0.5s ease-out;
}

@keyframes shake {

    0%,
    100% {
        transform: translateX(0);
    }

    25% {
        transform: translateX(-5px);
    }

    75% {
        transform: translateX(5px);
    }
}

.animate-shake {
    animation: shake 0.3s ease-in-out;
}
</style>
