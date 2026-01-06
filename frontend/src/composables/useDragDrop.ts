import { ref, computed } from 'vue'
import type { Card } from '@/services/api'

const DRAG_THRESHOLD = 5 // Pixels to move before considering it a drag

// Drag state
const isDragging = ref(false)
const hasDragStarted = ref(false)
const draggedCard = ref<Card | null>(null)
const draggedFromColumnId = ref<string | null>(null)
const mouseX = ref(0)
const mouseY = ref(0)
const mouseStartX = ref(0)
const mouseStartY = ref(0)
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)
const smoothedRotation = ref(0)

export function useDragDrop(options: {
    onDragStart?: (card: Card, columnId: string) => void
    onDragEnd?: (card: Card, sourceColumnId: string, targetColumnId: string | null, event: MouseEvent) => void
    onCardClick?: (card: Card, columnId: string) => void
}) {
    function onCardMouseDown(event: MouseEvent, card: Card, columnId: string) {
        // Ignore if clicking on buttons
        if ((event.target as HTMLElement).closest('button')) return

        event.preventDefault()

        const cardElement = event.currentTarget as HTMLElement
        const rect = cardElement.getBoundingClientRect()

        // Store offset from mouse to card top-left
        dragOffsetX.value = event.clientX - rect.left
        dragOffsetY.value = event.clientY - rect.top

        // Store initial mouse position
        mouseStartX.value = event.clientX
        mouseStartY.value = event.clientY
        mouseX.value = event.clientX
        mouseY.value = event.clientY

        // Prepare for potential drag (but don't start yet)
        isDragging.value = true
        hasDragStarted.value = false
        draggedCard.value = card
        draggedFromColumnId.value = columnId
        smoothedRotation.value = 0
    }

    function onMouseMove(event: MouseEvent) {
        if (!isDragging.value) return

        // Check if we've moved past threshold to start actual drag
        if (!hasDragStarted.value) {
            const deltaX = Math.abs(event.clientX - mouseStartX.value)
            const deltaY = Math.abs(event.clientY - mouseStartY.value)

            if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
                hasDragStarted.value = true

                // Notify drag start
                if (options.onDragStart && draggedCard.value && draggedFromColumnId.value) {
                    options.onDragStart(draggedCard.value, draggedFromColumnId.value)
                }
            } else {
                return // Don't update position until drag actually starts
            }
        }

        // Calculate raw velocity
        const rawVelocity = event.clientX - mouseX.value

        // Smooth the rotation with dampening
        const targetRotation = Math.abs(rawVelocity) > 2
            ? Math.max(-12, Math.min(12, rawVelocity * 0.6))
            : 0

        smoothedRotation.value += (targetRotation - smoothedRotation.value) * 0.15

        if (Math.abs(smoothedRotation.value) < 0.5) {
            smoothedRotation.value = 0
        }

        mouseX.value = event.clientX
        mouseY.value = event.clientY
    }

    function onMouseUp(event: MouseEvent) {
        if (!isDragging.value || !draggedCard.value || !draggedFromColumnId.value) return

        const card = draggedCard.value
        const sourceColumnId = draggedFromColumnId.value

        // If drag never actually started (no movement), it's a click
        if (!hasDragStarted.value) {
            isDragging.value = false
            hasDragStarted.value = false
            if (options.onCardClick) {
                options.onCardClick(card, sourceColumnId)
            }
            draggedCard.value = null
            draggedFromColumnId.value = null
            return
        }

        // Find which column we're dropping on
        let targetColumnId: string | null = null
        const columnElements = document.querySelectorAll('[data-column-id]')

        for (const colEl of columnElements) {
            const rect = colEl.getBoundingClientRect()
            if (
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom
            ) {
                targetColumnId = colEl.getAttribute('data-column-id')
                break
            }
        }

        // Notify drag end
        if (options.onDragEnd) {
            options.onDragEnd(card, sourceColumnId, targetColumnId, event)
        }

        // Reset drag state
        isDragging.value = false
        hasDragStarted.value = false
        draggedCard.value = null
        draggedFromColumnId.value = null
    }

    // Computed style for floating card with swing rotation
    const floatingCardStyle = computed(() => {
        return {
            left: `${mouseX.value - dragOffsetX.value}px`,
            top: `${mouseY.value - dragOffsetY.value}px`,
            transform: `rotate(${smoothedRotation.value.toFixed(1)}deg)`,
            transition: 'transform 0.1s ease-out',
        }
    })

    // Setup and cleanup event listeners
    function setupListeners() {
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    function cleanupListeners() {
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
    }

    return {
        // State
        isDragging,
        hasDragStarted,
        draggedCard,
        draggedFromColumnId,
        floatingCardStyle,
        // Functions
        onCardMouseDown,
        setupListeners,
        cleanupListeners,
    }
}
