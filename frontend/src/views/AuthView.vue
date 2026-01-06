<template>
    <div class="min-h-screen w-full flex items-center justify-center bg-slate-900 overflow-hidden relative">
        <!-- Background Effects -->
        <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div
                class="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[100px] animate-pulse-slow" />
            <div
                class="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/20 blur-[100px] animate-pulse-slow animation-delay-2000" />
        </div>

        <!-- Auth Card -->
        <div
            class="relative z-10 w-full max-w-md mx-4 auth-card glass-panel p-8 rounded-2xl border border-slate-700/50 shadow-2xl">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1
                    class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                    {{ isLogin ? 'Welcome Back' : 'Join EpiTrello' }}
                </h1>
                <p class="text-slate-400 text-sm">
                    {{ isLogin ? 'Enter your credentials to access your board' : 'Create an account to start organizing'
                    }}
                </p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <!-- Error Alert -->
                <div v-if="error"
                    class="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm flex items-center gap-2 animate-shake">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clip-rule="evenodd" />
                    </svg>
                    {{ error }}
                </div>

                <div class="space-y-4">
                    <!-- Signup Fields -->
                    <template v-if="!isLogin">
                        <div>
                            <label
                                class="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-1.5 ml-1">Email</label>
                            <input v-model="form.email" type="email" required
                                class="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
                                placeholder="name@example.com" />
                        </div>

                        <div>
                            <label
                                class="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-1.5 ml-1">Username</label>
                            <input v-model="form.username" type="text" required minlength="3"
                                class="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
                                placeholder="username" />
                        </div>
                    </template>

                    <!-- Login Field -->
                    <div v-else>
                        <label
                            class="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-1.5 ml-1">Email
                            or
                            Username</label>
                        <input v-model="form.identifier" type="text" required
                            class="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
                            placeholder="name@example.com or username" />
                    </div>


                    <!-- Confirm Password (hidden in login) -->
                    <div v-if="!isLogin">
                        <PasswordInput v-model="form.password" @valid="(v) => isPasswordValid = v" />
                    </div>

                    <!-- Simple Password Field for Login (no strength meter needed) -->
                    <div v-else>
                        <label
                            class="block text-slate-400 text-xs font-medium uppercase tracking-wider mb-1.5 ml-1">Password</label>
                        <input v-model="form.password" type="password" required
                            class="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-500"
                            placeholder="••••••••" />
                    </div>
                </div>

                <button type="submit" :disabled="loading || (!isLogin && !isPasswordValid)"
                    class="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-medium py-3 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                    <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    {{ loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account') }}
                </button>
            </form>

            <!-- Toggle Mode -->
            <div class="mt-6 text-center">
                <p class="text-slate-400 text-sm">
                    {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
                    <button @click="toggleMode"
                        class="text-blue-400 hover:text-blue-300 font-medium ml-1 transition-colors focus:outline-none focus:underline">
                        {{ isLogin ? 'Sign up' : 'Log in' }}
                    </button>
                </p>
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
const form = reactive({
    email: '',
    username: '',
    password: '',
    identifier: ''
})

function toggleMode() {
    isLogin.value = !isLogin.value
    error.value = null
    form.email = ''
    form.username = ''
    form.password = ''
    form.identifier = ''
}

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
.glass-panel {
    background: rgba(30, 41, 59, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
}

.animate-pulse-slow {
    animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animation-delay-2000 {
    animation-delay: 2s;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 0.2;
        transform: scale(1);
    }

    50% {
        opacity: 0.4;
        transform: scale(1.1);
    }
}

.animate-shake {
    animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both;
}

@keyframes shake {

    10%,
    90% {
        transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
        transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
        transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
        transform: translate3d(4px, 0, 0);
    }
}
</style>
