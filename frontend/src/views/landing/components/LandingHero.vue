<template>
    <section class="relative min-h-screen flex items-center pt-24 pb-12 px-4 overflow-hidden">
        <!-- Hero background effects (contained to hero only) -->
        <div class="absolute inset-0 pointer-events-none overflow-hidden">
            <!-- Gradient orbs -->
            <div class="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl animate-float-slow"
                style="background: radial-gradient(circle, rgba(37, 99, 235, 0.4) 0%, transparent 70%)" />
            <div class="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl animate-float-slower"
                style="background: radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, transparent 70%)" />


            <!-- Particles -->
            <div class="particle" style="--x: 5%; --y: 15%; --duration: 8s; --delay: 0s;"></div>
            <div class="particle" style="--x: 12%; --y: 70%; --duration: 10s; --delay: -2s;"></div>
            <div class="particle" style="--x: 22%; --y: 35%; --duration: 9s; --delay: -1s;"></div>
            <div class="particle" style="--x: 35%; --y: 85%; --duration: 11s; --delay: -3s;"></div>
            <div class="particle" style="--x: 45%; --y: 20%; --duration: 8s; --delay: -4s;"></div>
            <div class="particle" style="--x: 55%; --y: 55%; --duration: 12s; --delay: -1s;"></div>
            <div class="particle" style="--x: 68%; --y: 75%; --duration: 9s; --delay: -5s;"></div>
            <div class="particle" style="--x: 78%; --y: 25%; --duration: 10s; --delay: -2s;"></div>
            <div class="particle" style="--x: 88%; --y: 60%; --duration: 8s; --delay: -3s;"></div>
            <div class="particle" style="--x: 95%; --y: 10%; --duration: 11s; --delay: -1s;"></div>
            <div class="particle particle-medium" style="--x: 18%; --y: 45%; --duration: 12s; --delay: -4s;"></div>
            <div class="particle particle-medium" style="--x: 42%; --y: 65%; --duration: 10s; --delay: -2s;"></div>
            <div class="particle particle-medium" style="--x: 72%; --y: 40%; --duration: 11s; --delay: -6s;"></div>
            <div class="particle particle-large" style="--x: 28%; --y: 25%; --duration: 14s; --delay: -3s;"></div>
            <div class="particle particle-large" style="--x: 82%; --y: 50%; --duration: 13s; --delay: -7s;"></div>
        </div>

        <!-- Subtle noise overlay for texture -->
        <div class="noise-overlay"></div>

        <div class="max-w-6xl mx-auto w-full relative z-10">
            <div class="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                <!-- Left: Copy -->
                <div class="text-center lg:text-left animate-fade-in">
                    <!-- Badge -->
                    <div
                        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 badge-border mb-6 mt-8 md:mt-0">
                        <span class="flex h-2 w-2 relative">
                            <span
                                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span class="text-sm text-slate-400">100% Free & Open Source</span>
                    </div>

                    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                        Move fast.
                        <br />
                        <span class="typewriter-container typewriter-gradient">
                            <span v-for="(char, idx) in displayedTagline" :key="taglineKey + '-' + idx"
                                class="typewriter-char" :style="{ animationDelay: `${idx * 30}ms` }">{{ char === ' ' ?
                                '\u00A0' : char }}</span>
                            <span class="typewriter-cursor">|</span>
                        </span>
                    </h1>

                    <p class="text-lg text-slate-400 max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
                        EpiTrello is the visual workspace where teams see work get done.
                        Drag tasks, collaborate in real-time, and ship — all in one place.
                    </p>

                    <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <router-link to="/login?register=true"
                            class="btn-primary-filled text-base py-4 px-8 inline-flex items-center justify-center gap-3 group">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Get Started
                        </router-link>
                        <a href="#demo"
                            class="btn-secondary text-base py-4 px-8 inline-flex items-center justify-center gap-2">
                            See How It Works
                        </a>
                    </div>

                    <!-- Key highlights -->
                    <div class="mt-10 pt-8">
                        <div class="flex flex-wrap items-center gap-6 justify-center lg:justify-start">
                            <div v-for="(highlight, idx) in highlights" :key="highlight"
                                class="flex items-center gap-2 animate-fade-in-up"
                                :style="{ animationDelay: `${idx * 0.1 + 0.5}s` }">
                                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span class="text-sm text-slate-300">{{ highlight }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Hero Visual - Hidden on mobile -->
                <div class="relative animate-fade-in-delayed hidden lg:block">
                    <div class="relative">
                        <!-- Glow behind -->
                        <div
                            class="absolute -inset-4 bg-linear-to-r from-blue-500/20 via-cyan-500/20 to-green-500/20 rounded-3xl blur-3xl opacity-60 animate-pulse-slow" />

                        <!-- Main board preview -->
                        <div class="relative bg-slate-800/50 rounded-2xl card-border p-4 shadow-2xl">
                            <!-- Board header -->
                            <div class="flex items-center justify-between mb-4 pb-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-3 h-3 rounded-full bg-red-500" />
                                    <div class="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div class="w-3 h-3 rounded-full bg-green-500" />
                                    <span class="text-xs text-slate-500 ml-2">Product Launch Board</span>
                                </div>
                            </div>

                            <!-- Kanban columns -->
                            <div class="flex gap-3 overflow-hidden">
                                <!-- Backlog -->
                                <div class="demo-column p-3 flex-1">
                                    <div class="flex items-center justify-between mb-3">
                                        <span
                                            class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Backlog</span>
                                        <span class="text-xs text-slate-600">3</span>
                                    </div>
                                    <div class="space-y-2">
                                        <div class="demo-card p-3 hover-lift">
                                            <span
                                                class="inline-block bg-blue-500 text-white text-[10px] font-medium px-2 py-0.5 rounded mb-2">Research</span>
                                            <p class="text-sm font-medium">User research interviews</p>
                                        </div>
                                        <div class="demo-card p-3 hover-lift">
                                            <span
                                                class="inline-block bg-amber-500 text-white text-[10px] font-medium px-2 py-0.5 rounded mb-2">Strategy</span>
                                            <p class="text-sm font-medium">Competitor analysis</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- In Progress -->
                                <div class="demo-column p-3 flex-1">
                                    <div class="flex items-center justify-between mb-3">
                                        <span class="text-xs font-semibold text-amber-500 uppercase tracking-wider">In
                                            Progress</span>
                                        <span class="text-xs text-slate-600">2</span>
                                    </div>
                                    <div class="space-y-2">
                                        <div class="demo-card demo-card-active p-3 animate-float hover-lift">
                                            <span
                                                class="inline-block bg-blue-500 text-white text-[10px] font-medium px-2 py-0.5 rounded mb-2">Design</span>
                                            <p class="text-sm font-medium">Design system components</p>
                                            <div class="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
                                                <div class="h-full bg-linear-to-r from-blue-500 to-cyan-500 rounded-full animate-progress"
                                                    style="width: 66%;" />
                                            </div>
                                        </div>
                                        <div class="demo-card p-3 hover-lift">
                                            <span
                                                class="inline-block bg-green-500 text-white text-[10px] font-medium px-2 py-0.5 rounded mb-2">Dev</span>
                                            <p class="text-sm font-medium">API integration</p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Done -->
                                <div class="demo-column p-3 flex-1 hidden sm:block">
                                    <div class="flex items-center justify-between mb-3">
                                        <span
                                            class="text-xs font-semibold text-green-500 uppercase tracking-wider">Done</span>
                                        <span class="text-xs text-slate-600">5</span>
                                    </div>
                                    <div class="space-y-2">
                                        <div class="demo-card p-3 opacity-60">
                                            <span
                                                class="inline-block bg-green-500 text-white text-[10px] font-medium px-2 py-0.5 rounded mb-2">Meeting</span>
                                            <p class="text-sm font-medium line-through text-slate-500">Project kickoff
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Floating notification -->
                        <div
                            class="absolute -top-4 -right-4 bg-slate-800/90 card-border rounded-xl p-3 shadow-lg animate-float-slow">
                            <div class="flex items-center gap-2">
                                <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span class="text-sm font-medium">Task completed!</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section transition gradient -->
        <div
            class="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#030712] to-transparent pointer-events-none" />
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Typewriter effect for taglines
const taglines = ['Stay organized.', 'Ship faster.', 'Work smarter.', 'Build together.', 'Stay focused.']
const currentTaglineIndex = ref(0)
const displayedTagline = ref('')
const taglineKey = ref(0)

const highlights = ['Completely Free', 'Real-time Sync', 'Open Source']

let taglineTimeout: ReturnType<typeof setTimeout>

// Typewriter animation function
const typeText = (text: string, displayRef: typeof displayedTagline, keyRef: typeof taglineKey, onComplete: () => void) => {
    let charIndex = 0
    displayRef.value = ''
    keyRef.value++

    const typeNextChar = () => {
        if (charIndex < text.length) {
            displayRef.value = text.slice(0, charIndex + 1)
            charIndex++
            taglineTimeout = setTimeout(typeNextChar, 50)
        } else {
            // Wait before erasing
            taglineTimeout = setTimeout(() => eraseText(displayRef, onComplete), 2000)
        }
    }

    typeNextChar()
}

const eraseText = (displayRef: typeof displayedTagline, onComplete: () => void) => {
    const erase = () => {
        if (displayRef.value.length > 0) {
            displayRef.value = displayRef.value.slice(0, -1)
            taglineTimeout = setTimeout(erase, 30)
        } else {
            onComplete()
        }
    }
    erase()
}

// Start tagline animation cycle
const startTaglineAnimation = () => {
    const animateNext = () => {
        const text = taglines[currentTaglineIndex.value]
        if (text) {
            typeText(text, displayedTagline, taglineKey, () => {
                currentTaglineIndex.value = (currentTaglineIndex.value + 1) % taglines.length
                setTimeout(animateNext, 200)
            })
        }
    }
    animateNext()
}

onMounted(() => {
    startTaglineAnimation()
})

onUnmounted(() => {
    clearTimeout(taglineTimeout)
})
</script>

<style scoped>
.badge-border {
    border: 1px solid rgba(37, 99, 235, 0.2);
}

.card-border {
    border: 1px solid rgba(51, 65, 85, 0.5);
}

/* Animations */
@keyframes float {

    0%,
    100% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-8px);
    }
}

@keyframes float-slow {

    0%,
    100% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-12px);
    }
}

@keyframes float-slower {

    0%,
    100% {
        transform: translateY(0px) translateX(0px);
    }

    50% {
        transform: translateY(-20px) translateX(10px);
    }
}

@keyframes fade-in {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(30px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse-slow {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}

@keyframes progress {
    0% {
        width: 0%;
    }

    100% {
        width: 66%;
    }
}

@keyframes particle-float {

    0%,
    100% {
        transform: translate(0, 0);
        opacity: 0.4;
    }

    25% {
        transform: translate(10px, -20px);
        opacity: 0.7;
    }

    50% {
        transform: translate(-5px, -40px);
        opacity: 0.5;
    }

    75% {
        transform: translate(15px, -25px);
        opacity: 0.6;
    }
}

.animate-float {
    animation: float 4s ease-in-out infinite;
}

.animate-float-slow {
    animation: float-slow 6s ease-in-out infinite;
}

.animate-float-slower {
    animation: float-slower 10s ease-in-out infinite;
}

.animate-fade-in {
    animation: fade-in 0.6s ease-out;
}

.animate-fade-in-delayed {
    animation: fade-in 0.7s ease-out 0.3s both;
}

.animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out both;
}

.animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
}

.animate-progress {
    animation: progress 2s ease-out forwards;
}

/* Floating particles */
.particles-container {
    position: absolute;
    inset: 0;
}

.particle {
    position: absolute;
    left: var(--x);
    top: var(--y);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    box-shadow: 0 0 10px 2px rgba(147, 197, 253, 0.4);
    animation: particle-float var(--duration) ease-in-out infinite;
    animation-delay: var(--delay);
}

.particle-large {
    width: 6px;
    height: 6px;
    background: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 15px 4px rgba(99, 102, 241, 0.3);
}

/* Subtle noise texture overlay */
.noise-overlay {
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    pointer-events: none;
}

/* Typewriter text */
.typewriter-container {
    display: inline-block;
    min-width: 280px;
    text-align: left;
}

.typewriter-gradient {
    color: #3b82f6;
}

.typewriter-gradient .typewriter-char {
    background: linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.typewriter-char {
    display: inline-block;
    animation: typewriter-pop 0.1s ease-out forwards;
    opacity: 0;
}

@keyframes typewriter-pop {
    0% {
        opacity: 0;
        transform: translateY(10px);
    }

    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

.typewriter-cursor {
    display: inline-block;
    animation: cursor-blink 0.8s ease-in-out infinite;
    margin-left: 2px;
    font-weight: 300;
    color: rgba(37, 99, 235, 0.8);
}

@keyframes cursor-blink {

    0%,
    50% {
        opacity: 1;
    }

    51%,
    100% {
        opacity: 0;
    }
}

/* Buttons */
.btn-primary {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 14px 28px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.5);
}

/* Filled primary button - like Download for macOS style */
.btn-primary-filled {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: white;
    border: none;
    border-radius: 9999px;
    padding: 16px 32px;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 
        0 4px 15px rgba(59, 130, 246, 0.4),
        0 0 0 1px rgba(59, 130, 246, 0.1) inset,
        0 1px 0 rgba(255, 255, 255, 0.1) inset;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
}

.btn-primary-filled:hover {
    transform: translateY(-2px);
    box-shadow: 
        0 8px 25px rgba(59, 130, 246, 0.5),
        0 0 0 1px rgba(59, 130, 246, 0.2) inset,
        0 1px 0 rgba(255, 255, 255, 0.15) inset;
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
}

/* Secondary button - outlined style with visible border like Lockar */
.btn-secondary {
    background: rgba(30, 41, 59, 0.6) !important;
    color: white !important;
    border: 1px solid rgba(71, 85, 105, 0.8) !important;
    border-radius: 9999px !important;
    padding: 16px 32px !important;
    font-weight: 600 !important;
    font-size: 16px !important;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}

.btn-secondary:hover {
    background: rgba(59, 130, 246, 0.15) !important;
    border-color: rgba(59, 130, 246, 0.8) !important;
    transform: translateY(-1px);
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
}

/* Demo board styles */
.demo-column {
    background: rgba(15, 23, 42, 0.6);
    border-radius: 12px;
}

.demo-card {
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(51, 65, 85, 0.3);
    border-radius: 10px;
    transition: all 0.2s ease;
}

.demo-card:hover {
    border-color: rgba(37, 99, 235, 0.4);
}

.demo-card-active {
    border-color: rgba(37, 99, 235, 0.5);
    box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.2);
}

.hover-lift {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}
</style>
