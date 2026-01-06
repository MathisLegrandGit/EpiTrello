import { ref } from 'vue'
import { authApi, type AuthResponse, type UpdateProfileData, type UpdatePasswordData, type User, type Session } from '../services/api'
import { useRouter } from 'vue-router'

const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useAuth() {
    const router = useRouter()

    // Helper to get cookie
    function getCookie(name: string) {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift()
    }

    // Helper to set cookie
    function setCookie(name: string, value: string, days = 7) {
        const date = new Date()
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
        const expires = `expires=${date.toUTCString()}`
        document.cookie = `${name}=${value};${expires};path=/`
    }

    // Helper to remove cookie
    function removeCookie(name: string) {
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
    }

    // Initialize state from cookies
    function init() {
        const storedSession = getCookie('supabase_session')
        const storedUser = getCookie('supabase_user')

        if (storedSession && storedUser) {
            try {
                session.value = JSON.parse(storedSession)
                user.value = JSON.parse(storedUser)
            } catch {
                // Invalid cookie data
                logout()
            }
        }
    }

    async function login(credentials: { identifier: string; password: string }) {
        loading.value = true
        error.value = null
        try {
            const response = await authApi.login(credentials)
            handleAuthResponse(response)
            router.push('/')
        } catch (err: unknown) {
            error.value = err instanceof Error ? err.message : 'Login failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function signup(credentials: { email: string; password: string; username?: string; fullName?: string }) {
        loading.value = true
        error.value = null
        try {
            const response = await authApi.signup(credentials)
            handleAuthResponse(response)
            router.push('/')
        } catch (err: unknown) {
            error.value = err instanceof Error ? err.message : 'Signup failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function logout() {
        try {
            // Try to notify backend but don't block on error
            await authApi.logout().catch(() => { })
        } finally {
            user.value = null
            session.value = null
            removeCookie('supabase_session')
            removeCookie('supabase_user')
            router.push('/login')
        }
    }

    async function updateProfile(data: UpdateProfileData) {
        loading.value = true
        error.value = null
        try {
            if (!user.value?.id) throw new Error('User not authenticated')

            const updatedProfile = await authApi.updateProfile(user.value.id, data)

            // Merge updates into local user state
            // Note: backend returns the profile object, our user object is Supabase Auth user
            // We need to update user_metadata or just the profile fields we track
            user.value = {
                ...user.value,
                user_metadata: {
                    ...user.value.user_metadata,
                    ...data
                }
            }
            // Update cookie
            setCookie('supabase_user', JSON.stringify(user.value))

            return updatedProfile
        } catch (err: unknown) {
            error.value = err instanceof Error ? err.message : 'Profile update failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updatePassword(data: UpdatePasswordData) {
        loading.value = true
        error.value = null
        try {
            if (!user.value?.id) throw new Error('User not authenticated')
            await authApi.updatePassword(user.value.id, data)
        } catch (err: unknown) {
            error.value = err instanceof Error ? err.message : 'Password update failed'
            throw err
        } finally {
            loading.value = false
        }
    }

    function handleAuthResponse(response: AuthResponse) {
        user.value = response.user
        session.value = response.session

        // Persist to cookies
        setCookie('supabase_session', JSON.stringify(response.session))
        setCookie('supabase_user', JSON.stringify(response.user))
    }

    return {
        user,
        session,
        loading,
        error,
        init,
        login,
        signup,
        logout,
        updateProfile,
        updatePassword,
        isAuthenticated: () => !!user.value
    }
}
