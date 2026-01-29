import { ref } from 'vue'
import { listsApi, cardsApi, labelsApi, boardsApi, type Card, type Label } from '@/services/api'
import { useAuth } from '@/composables/useAuth'

export interface Column {
    id: string
    title: string
    position: number
    color?: string
    cards: Card[]
}

// Shared state (singleton pattern)
const columns = ref<Column[]>([])
const labels = ref<Label[]>([])
const currentBoardId = ref<string | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

export function useBoard() {
    const { user } = useAuth()

    // Fetch data from API - optionally pass a specific boardId
    async function fetchData(boardId?: string) {
        try {
            isLoading.value = true
            error.value = null
            
            // Clear stale data immediately to prevent showing wrong board's content
            columns.value = []
            labels.value = []

            if (!user.value) return

            let targetBoardId: string

            if (boardId) {
                // Use the provided board ID
                targetBoardId = boardId
            } else {
                // Fallback: Fetch user's boards and use first one
                const userBoards = await boardsApi.getAll(user.value.id)

                if (!userBoards || userBoards.length === 0) {
                    // Create default board if none exists
                    const newBoard = await boardsApi.create({
                        title: 'My First Board',
                        user_id: user.value.id
                    })
                    if (!newBoard || !newBoard.id) throw new Error('Failed to create default board')
                    targetBoardId = newBoard.id

                    // Create default columns for new board
                    const defaultColumns = [
                        { title: 'To Do', position: 1, color: '#3b82f6' },
                        { title: 'In Progress', position: 2, color: '#f97316' },
                        { title: 'Done', position: 3, color: '#22c55e' }
                    ]

                    await Promise.all(
                        defaultColumns.map(col =>
                            listsApi.create({ board_id: targetBoardId, title: col.title, position: col.position, color: col.color })
                        )
                    )
                } else {
                    targetBoardId = userBoards[0]!.id!
                }
            }

            currentBoardId.value = targetBoardId

            // 2. Fetch Lists and Cards
            const [lists, cards] = await Promise.all([
                listsApi.getAll(targetBoardId),
                cardsApi.getAll()
            ])

            // Load correct labels for this board
            const boardLabels = await labelsApi.getAll(targetBoardId)
            labels.value = boardLabels

            columns.value = lists
                .sort((a, b) => a.position - b.position)
                .map(list => ({
                    id: list.id!,
                    title: list.title,
                    position: list.position,
                    color: list.color,
                    cards: cards
                        .filter(card => card.list_id === list.id)
                        .sort((a, b) => a.position - b.position)
                }))
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to load data'
            console.error('Error fetching data:', err)
        } finally {
            isLoading.value = false
        }
    }


    async function fetchLabels() {
        if (!currentBoardId.value) return
        try {
            labels.value = await labelsApi.getAll(currentBoardId.value)
        } catch (err) {
            console.error('Error fetching labels:', err)
        }
    }

    function getLabelById(labelId: string | null | undefined): Label | undefined {
        if (!labelId) return undefined
        return labels.value.find(l => l.id === labelId)
    }

    // Column operations
    async function addColumn(title: string) {
        if (!title.trim() || !currentBoardId.value) return

        try {
            const maxPosition = columns.value.length > 0
                ? Math.max(...columns.value.map(c => c.position))
                : 0

            const newList = await listsApi.create({
                board_id: currentBoardId.value,
                title,
                position: maxPosition + 1,
            })

            columns.value.push({
                id: newList.id!,
                title: newList.title,
                position: newList.position,
                cards: [],
            })
        } catch (err) {
            console.error('Error creating column:', err)
            error.value = err instanceof Error ? err.message : 'Failed to create column'
        }
    }

    async function updateColumn(columnId: string, updates: { title?: string; color?: string }) {
        try {
            await listsApi.update(columnId, updates)
            const column = columns.value.find(c => c.id === columnId)
            if (column) {
                if (updates.title) column.title = updates.title
                if (updates.color) column.color = updates.color
            }
        } catch (err) {
            console.error('Error updating column:', err)
            error.value = err instanceof Error ? err.message : 'Failed to update column'
        }
    }

    async function deleteColumn(columnId: string) {
        const originalColumns = [...columns.value]
        columns.value = columns.value.filter(c => c.id !== columnId)

        try {
            await listsApi.delete(columnId)
        } catch (err) {
            console.error('Error deleting column:', err)
            error.value = err instanceof Error ? err.message : 'Failed to delete column'
            columns.value = originalColumns
        }
    }

    // Card operations
    async function addCard(columnId: string, title: string) {
        if (!title.trim()) return

        try {
            const column = columns.value.find(c => c.id === columnId)
            const maxPosition = column ? Math.max(0, ...column.cards.map(c => c.position)) : 0

            const newCard = await cardsApi.create({
                list_id: columnId,
                title,
                position: maxPosition + 1,
            })

            if (column) {
                column.cards.push(newCard)
            }
        } catch (err) {
            console.error('Error saving card:', err)
            error.value = err instanceof Error ? err.message : 'Failed to save card'
        }
    }

    async function updateCard(cardId: string, updates: { title?: string; description?: string; label_ids?: string[]; member_ids?: string[]; list_id?: string; position?: number }) {
        try {
            const updatedCard = await cardsApi.update(cardId, updates)

            // Find and update the card in columns
            for (const column of columns.value) {
                const cardIndex = column.cards.findIndex(c => c.id === cardId)
                if (cardIndex >= 0) {
                    column.cards[cardIndex] = updatedCard
                    break
                }
            }

            return updatedCard
        } catch (err) {
            console.error('Error updating card:', err)
            error.value = err instanceof Error ? err.message : 'Failed to update card'
            throw err
        }
    }

    async function deleteCard(cardId: string, columnId: string) {
        const column = columns.value.find(c => c.id === columnId)
        if (!column) return

        try {
            await cardsApi.delete(cardId)
            column.cards = column.cards.filter(c => c.id !== cardId)
        } catch (err) {
            console.error('Error deleting card:', err)
            error.value = err instanceof Error ? err.message : 'Failed to delete card'
        }
    }

    async function moveCard(card: Card, sourceColumnId: string, targetColumnId: string, position: number) {
        const sourceColumn = columns.value.find(c => c.id === sourceColumnId)
        const targetColumn = columns.value.find(c => c.id === targetColumnId)

        if (!sourceColumn || !targetColumn) return

        // Remove from source
        sourceColumn.cards = sourceColumn.cards.filter(c => c.id !== card.id)

        // Add to target
        targetColumn.cards.push({ ...card, list_id: targetColumnId, position })

        // Sync with backend
        if (targetColumnId !== sourceColumnId) {
            try {
                await cardsApi.update(card.id!, {
                    list_id: targetColumnId,
                    position,
                })
            } catch (err) {
                console.error('Error moving card:', err)
                error.value = err instanceof Error ? err.message : 'Failed to move card'
                fetchData() // Refresh to get correct state
            }
        }
    }

    return {
        // State
        columns,
        labels,
        currentBoardId,
        isLoading,
        error,
        // Functions
        fetchData,
        fetchLabels,
        getLabelById,
        addColumn,
        updateColumn,
        deleteColumn,
        addCard,
        updateCard,
        deleteCard,
        moveCard,
    }
}
