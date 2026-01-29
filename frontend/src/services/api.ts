const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Types matching backend interfaces
export interface CardMember {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
}

export interface Card {
    id?: string;
    list_id: string;
    title: string;
    description?: string;
    position: number;
    label_ids?: string[];
    member_ids?: string[];
    members?: CardMember[];
    created_at?: string;
    updated_at?: string;
}

export interface UpdateProfileData {
    username?: string;
    fullName?: string;
    avatarUrl?: string;
}

export interface UpdatePasswordData {
    password: string;
}

export interface List {
    id?: string;
    board_id: string;
    title: string;
    position: number;
    color?: string;
    created_at?: string;
}

export interface Board {
    id?: string;
    user_id?: string;
    title: string;
    description?: string;
    color?: string;
    created_at?: string;
    updated_at?: string;
    last_opened_at?: string;
}

// ... (skipping Label to keep context small, careful here)
export interface Label {
    id?: string;
    board_id: string;
    name: string;
    color: string;
    created_at?: string;
}

export interface User {
    id: string;
    email?: string;
    user_metadata?: {
        username?: string;
        full_name?: string;
        avatar_url?: string;
        [key: string]: unknown;
    };
}

export interface Session {
    access_token: string;
    refresh_token?: string;
    expires_at?: number;
}

export interface AuthResponse {
    user: User;
    session: Session;
}

/**
 * Get the access token from the stored session cookie.
 * This is used to authenticate requests to the backend.
 */
function getAccessToken(): string | null {
    const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('supabase_session='));
    
    if (!cookieValue) return null;
    
    try {
        const cookieParts = cookieValue.split('=');
        const sessionValue = cookieParts[1];
        if (!sessionValue) return null;
        const session = JSON.parse(decodeURIComponent(sessionValue));
        return session?.access_token || null;
    } catch {
        return null;
    }
}

// Generic fetch wrapper with error handling
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Get the access token and add Authorization header if available
    const accessToken = getAccessToken();
    const authHeaders: Record<string, string> = {};
    if (accessToken) {
        authHeaders['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    // Handle empty responses (like DELETE)
    const text = await response.text();
    if (!text) {
        return undefined as T;
    }
    return JSON.parse(text);
}

// Boards API
export const boardsApi = {
    getAll: (userId?: string) => fetchApi<Board[]>(userId ? `/boards?userId=${userId}` : '/boards'),
    getOne: (id: string) => fetchApi<Board>(`/boards/${id}`),
    create: (board: Partial<Board>) => fetchApi<Board>('/boards', {
        method: 'POST',
        body: JSON.stringify(board),
    }),
    update: (id: string, board: Partial<Board>) => fetchApi<Board>(`/boards/${id}`, {
        method: 'PUT',
        body: JSON.stringify(board),
    }),
    delete: (id: string) => fetchApi<void>(`/boards/${id}`, { method: 'DELETE' }),
};

// Lists API
export const listsApi = {
    getAll: (boardId?: string) => fetchApi<List[]>(boardId ? `/lists?boardId=${boardId}` : '/lists'),
    getOne: (id: string) => fetchApi<List>(`/lists/${id}`),
    create: (list: Partial<List>) => fetchApi<List>('/lists', {
        method: 'POST',
        body: JSON.stringify(list),
    }),
    update: (id: string, list: Partial<List>) => fetchApi<List>(`/lists/${id}`, {
        method: 'PUT',
        body: JSON.stringify(list),
    }),
    delete: (id: string) => fetchApi<void>(`/lists/${id}`, { method: 'DELETE' }),
};

// Cards API
export const cardsApi = {
    getAll: (listId?: string) => fetchApi<Card[]>(listId ? `/cards?listId=${listId}` : '/cards'),
    getOne: (id: string) => fetchApi<Card>(`/cards/${id}`),
    create: (card: Partial<Card>) => fetchApi<Card>('/cards', {
        method: 'POST',
        body: JSON.stringify(card),
    }),
    update: (id: string, card: Partial<Card>) => fetchApi<Card>(`/cards/${id}`, {
        method: 'PUT',
        body: JSON.stringify(card),
    }),
    delete: (id: string) => fetchApi<void>(`/cards/${id}`, { method: 'DELETE' }),
};

// Labels API
export const labelsApi = {
    getAll: (boardId?: string) => fetchApi<Label[]>(boardId ? `/labels?boardId=${boardId}` : '/labels'),
    getOne: (id: string) => fetchApi<Label>(`/labels/${id}`),
    create: (label: Partial<Label>) => fetchApi<Label>('/labels', {
        method: 'POST',
        body: JSON.stringify(label),
    }),
    update: (id: string, label: Partial<Label>) => fetchApi<Label>(`/labels/${id}`, {
        method: 'PUT',
        body: JSON.stringify(label),
    }),
    delete: (id: string) => fetchApi<void>(`/labels/${id}`, { method: 'DELETE' }),
};

// Auth API
export const authApi = {
    signup: (credentials: { email: string; password: string; username?: string; fullName?: string }) => fetchApi<AuthResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    login: (credentials: { identifier: string; password: string }) => fetchApi<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    }),
    logout: () => fetchApi<void>('/auth/logout', { method: 'POST' }),
    updateProfile: (id: string, data: UpdateProfileData) => fetchApi<User>(`/auth/profile/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    updatePassword: (id: string, data: UpdatePasswordData) => fetchApi<void>(`/auth/password/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),
    uploadAvatar: async (userId: string, file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('avatar', file);
        
        // Add Authorization header if available
        const accessToken = getAccessToken();
        const headers: Record<string, string> = {};
        if (accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }
        
        const response = await fetch(`${API_BASE_URL}/auth/avatar/${userId}`, {
            method: 'POST',
            headers,
            body: formData,
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to upload avatar');
        }
        const data = await response.json();
        return data.avatarUrl;
    },
};

// User profile type
export interface UserProfile {
    id: string;
    username: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
}

export interface Notification {
    id: string;
    user_id: string;
    type: 'board_invite' | 'board_removed';
    data: {
        from_user_id?: string;
        [key: string]: unknown;
    };
    read: boolean;
    created_at: string;
}

// Users API - for searching and getting user profiles
export const usersApi = {
    search: (query: string, excludeUserId?: string) =>
        fetchApi<UserProfile[]>(`/users/search?q=${encodeURIComponent(query)}${excludeUserId ? `&excludeUserId=${excludeUserId}` : ''}`),

    getProfile: (userId: string) =>
        fetchApi<UserProfile | null>(`/users/profile/${userId}`),
};

// Notifications API
export const notificationsApi = {
    getAll: (userId: string) =>
        fetchApi<Notification[]>(`/notifications/${userId}`),

    getUnreadCount: (userId: string) =>
        fetchApi<{ count: number }>(`/notifications/${userId}/unread-count`),

    markAsRead: (notificationId: string) =>
        fetchApi<Notification>(`/notifications/${notificationId}/read`, { method: 'PATCH' }),

    markAllAsRead: (userId: string) =>
        fetchApi<void>(`/notifications/${userId}/read-all`, { method: 'PATCH' }),

    delete: (notificationId: string) =>
        fetchApi<void>(`/notifications/${notificationId}`, { method: 'DELETE' }),
};

// Board Collaborators types and API
export interface BoardCollaborator {
    id: string;
    board_id: string;
    user_id: string;
    role: 'owner' | 'editor' | 'viewer';
    status: 'pending' | 'accepted';
    invited_by?: string;
    created_at: string;
    user?: UserProfile;
}

export interface SharedBoard {
    id: string;
    title: string;
    description?: string;
    color?: string;
    created_at: string;
    last_opened_at?: string;
    owner?: UserProfile;
    role: string;
    status: 'pending' | 'accepted';
}

export const collaboratorsApi = {
    getCollaborators: (boardId: string) =>
        fetchApi<BoardCollaborator[]>(`/boards/${boardId}/collaborators`),

    addCollaborator: (boardId: string, userId: string, invitedBy: string, role: string = 'editor') =>
        fetchApi<BoardCollaborator>(`/boards/${boardId}/collaborators`, {
            method: 'POST',
            body: JSON.stringify({ userId, invitedBy, role }),
        }),

    removeCollaborator: (boardId: string, userId: string, requesterId: string) =>
        fetchApi<void>(`/boards/${boardId}/collaborators/${userId}`, {
            method: 'DELETE',
            body: JSON.stringify({ requesterId }),
        }),

    getSharedBoards: (userId: string) =>
        fetchApi<SharedBoard[]>(`/boards/shared/${userId}`),

    respondToInvitation: (boardId: string, userId: string, accept: boolean) =>
        fetchApi<void>(`/boards/${boardId}/collaborators/respond`, {
            method: 'POST',
            body: JSON.stringify({ userId, accept }),
        }),

    updateCollaboratorRole: (boardId: string, userId: string, role: string, requesterId: string) =>
        fetchApi<void>(`/boards/${boardId}/collaborators/${userId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role, requesterId }),
        }),
};
