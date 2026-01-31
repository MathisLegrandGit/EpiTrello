<script setup lang="ts">
import { ref, computed } from 'vue'
import { type CardAttachment, cardsApi } from '@/services/api'

interface Props {
    attachments: CardAttachment[]
    cardId: string
    isDarkMode: boolean
    canEdit?: boolean
    compactMode?: boolean
    showUploadButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    canEdit: false,
    compactMode: false,
    showUploadButton: true
})

const emit = defineEmits<{
    (e: 'attachmentAdded', attachment: CardAttachment): void
    (e: 'attachmentRemoved', attachmentId: string): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const previewImage = ref<string | null>(null)
const deletingId = ref<string | null>(null)

// Image types that we can preview
const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']

function isImage(attachment: CardAttachment): boolean {
    return imageTypes.includes(attachment.file_type)
}

function getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️'
    if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('archive')) return '🗜️'
    if (fileType.includes('video')) return '🎬'
    if (fileType.includes('audio')) return '🎵'
    if (fileType.includes('text')) return '📃'
    return '📎'
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function triggerFileInput() {
    fileInput.value?.click()
}

async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    isUploading.value = true
    uploadProgress.value = 0

    try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
            if (uploadProgress.value < 90) {
                uploadProgress.value += 10
            }
        }, 100)

        const attachment = await cardsApi.addAttachment(props.cardId, file)
        
        clearInterval(progressInterval)
        uploadProgress.value = 100
        
        emit('attachmentAdded', attachment)
    } catch (err) {
        console.error('Error uploading file:', err)
    } finally {
        isUploading.value = false
        uploadProgress.value = 0
        // Clear the input
        if (fileInput.value) {
            fileInput.value.value = ''
        }
    }
}

async function removeAttachment(attachmentId: string) {
    deletingId.value = attachmentId
    try {
        await cardsApi.removeAttachment(attachmentId)
        emit('attachmentRemoved', attachmentId)
    } catch (err) {
        console.error('Error removing attachment:', err)
    } finally {
        deletingId.value = null
    }
}

function openPreview(url: string) {
    previewImage.value = url
}

function closePreview() {
    previewImage.value = null
}

function downloadAttachment(attachment: CardAttachment) {
    const link = document.createElement('a')
    link.href = attachment.file_url
    link.download = attachment.file_name
    link.target = '_blank'
    link.click()
}

const imageAttachments = computed(() => props.attachments.filter(isImage))
const fileAttachments = computed(() => props.attachments.filter(a => !isImage(a)))
</script>

<template>
    <!-- Compact Mode: Just the button -->
    <div v-if="compactMode && canEdit">
        <!-- Hidden file input -->
        <input 
            ref="fileInput"
            type="file"
            class="hidden"
            @change="handleFileUpload"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
        />
        
        <!-- Compact upload button -->
        <button 
            v-if="!isUploading"
            @click="triggerFileInput"
            :class="isDarkMode ? 'border-slate-600 text-slate-400 hover:border-slate-500' : 'border-slate-300 text-slate-500 hover:border-slate-400'"
            class="px-3 h-7 rounded-full text-xs font-medium border border-dashed transition-colors flex items-center gap-1"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add file
        </button>
        
        <!-- Compact uploading state -->
        <div v-else class="flex items-center gap-2 px-3 h-7 rounded-full text-xs font-medium"
            :class="isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'">
            <svg class="h-3.5 w-3.5 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
        </div>
    </div>

    <!-- Full Mode: Show attachments and optionally upload button -->
    <div v-else class="space-y-3">
        <!-- Image Preview Grid -->
        <div v-if="imageAttachments.length > 0" class="grid grid-cols-2 gap-2">
            <div 
                v-for="attachment in imageAttachments" 
                :key="attachment.id"
                class="relative group rounded-xl overflow-hidden aspect-video"
                :class="isDarkMode ? 'bg-slate-800' : 'bg-slate-100'"
            >
                <img 
                    :src="attachment.file_url" 
                    :alt="attachment.file_name"
                    class="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                    @click="openPreview(attachment.file_url)"
                />
                <!-- Overlay on hover -->
                <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                        @click="openPreview(attachment.file_url)"
                        class="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                        title="Preview"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <button 
                        @click="downloadAttachment(attachment)"
                        class="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                        title="Download"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <button 
                        v-if="canEdit"
                        @click="removeAttachment(attachment.id)"
                        :disabled="deletingId === attachment.id"
                        class="p-2 bg-red-500/50 rounded-full hover:bg-red-500/70 transition-colors"
                        title="Delete"
                    >
                        <svg v-if="deletingId !== attachment.id" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        <svg v-else class="h-5 w-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </button>
                </div>
                <!-- File name overlay -->
                <div class="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 to-transparent p-2">
                    <p class="text-xs text-white truncate">{{ attachment.file_name }}</p>
                </div>
            </div>
        </div>

        <!-- File Attachments List -->
        <div v-if="fileAttachments.length > 0" class="space-y-2">
            <div 
                v-for="attachment in fileAttachments" 
                :key="attachment.id"
                :class="isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'"
                class="flex items-center gap-3 p-3 rounded-xl border transition-colors group"
            >
                <!-- File Icon -->
                <div 
                    :class="isDarkMode ? 'bg-slate-700' : 'bg-slate-200'"
                    class="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                >
                    {{ getFileIcon(attachment.file_type) }}
                </div>
                
                <!-- File Info -->
                <div class="flex-1 min-w-0">
                    <p :class="isDarkMode ? 'text-white' : 'text-slate-800'" class="text-sm font-medium truncate">
                        {{ attachment.file_name }}
                    </p>
                    <p :class="isDarkMode ? 'text-slate-400' : 'text-slate-500'" class="text-xs">
                        {{ formatFileSize(attachment.file_size) }}
                    </p>
                </div>

                <!-- Actions -->
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        @click="downloadAttachment(attachment)"
                        :class="isDarkMode ? 'hover:bg-slate-600 text-slate-400' : 'hover:bg-slate-200 text-slate-500'"
                        class="p-2 rounded-lg transition-colors"
                        title="Download"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                    <button 
                        v-if="canEdit"
                        @click="removeAttachment(attachment.id)"
                        :disabled="deletingId === attachment.id"
                        :class="isDarkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'"
                        class="p-2 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <svg v-if="deletingId !== attachment.id" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        <svg v-else class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Upload Button / Drop Zone -->
        <div v-if="canEdit && showUploadButton">
            <!-- Hidden file input -->
            <input 
                ref="fileInput"
                type="file"
                class="hidden"
                @change="handleFileUpload"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
            />

            <!-- Upload progress -->
            <div v-if="isUploading" class="relative">
                <div 
                    :class="isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'"
                    class="p-3 rounded-xl border"
                >
                    <div class="flex items-center gap-3">
                        <svg class="h-4 w-4 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span :class="isDarkMode ? 'text-slate-300' : 'text-slate-600'" class="text-xs">
                            Uploading...
                        </span>
                    </div>
                    <div class="mt-2 h-1 rounded-full overflow-hidden" :class="isDarkMode ? 'bg-slate-700' : 'bg-slate-200'">
                        <div 
                            class="h-full bg-blue-500 transition-all duration-300"
                            :style="{ width: uploadProgress + '%' }"
                        />
                    </div>
                </div>
            </div>
        </div>

        <!-- Image Preview Modal -->
        <Teleport to="body">
            <div 
                v-if="previewImage" 
                class="fixed inset-0 z-200 flex items-center justify-center bg-black/90"
                @click="closePreview"
            >
                <button 
                    @click="closePreview"
                    class="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
                <img 
                    :src="previewImage" 
                    class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    @click.stop
                />
            </div>
        </Teleport>
    </div>
</template>
