const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Types matching backend interfaces
export interface Card {
    id?: string;
    list_id: string;
    title: string;
    description?: string;
    position: number;
    label_ids?: string[];
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
    name: string;
    created_at?: string;
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

// Generic fetch wrapper with error handling
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
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
        const response = await fetch(`${API_BASE_URL}/auth/avatar/${userId}`, {
            method: 'POST',
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

