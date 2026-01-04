const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Types matching backend interfaces
export interface Card {
    id?: string;
    list_id: string;
    title: string;
    description?: string;
    position: number;
    label_id?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface List {
    id?: string;
    board_id: string;
    title: string;
    position: number;
    created_at?: string;
}

export interface Board {
    id?: string;
    name: string;
    created_at?: string;
}

export interface Label {
    id?: string;
    board_id: string;
    name: string;
    color: string;
    created_at?: string;
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
    getAll: () => fetchApi<Board[]>('/boards'),
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
