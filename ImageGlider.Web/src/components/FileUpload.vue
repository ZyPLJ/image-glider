<template>
  <div class="file-upload">
    <div
      class="upload-area drag-area"
      :class="{ 'drag-over': isDragOver }"
      @click="triggerFileInput"
      @drop="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        :multiple="multiple"
        @change="handleFileSelect"
        style="display: none"
      />
      
      <div class="upload-content">
        <el-icon :size="48" class="upload-icon">
          <Upload />
        </el-icon>
        <div class="upload-text">
          <p class="primary-text">点击或拖拽文件到此区域上传</p>
          <p class="secondary-text">{{ tip }}</p>
        </div>
      </div>
    </div>
    
    <!-- 文件列表 -->
    <div v-if="fileList.length > 0" class="file-list">
      <div
        v-for="(file, index) in fileList"
        :key="index"
        class="file-item"
      >
        <div class="file-info">
          <el-icon class="file-icon">
            <Picture />
          </el-icon>
          <div class="file-details">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-size">{{ formatFileSize(file.size) }}</div>
          </div>
        </div>
        <el-button
          type="danger"
          size="small"
          circle
          @click="removeFile(index)"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Upload, Picture, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { isValidImageType, formatFileSize } from '@/utils/file'

interface Props {
  accept?: string
  multiple?: boolean
  maxSize?: number // MB
  tip?: string
}

interface Emits {
  (e: 'change', files: File[]): void
  (e: 'remove', index: number): void
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/*',
  multiple: false,
  maxSize: 10,
  tip: '支持 JPG、PNG、GIF、WebP 等格式，文件大小不超过 10MB'
})

const emit = defineEmits<Emits>()

const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const fileList = ref<File[]>([])

const validateFile = (file: File): boolean => {
  // 检查文件类型
  if (!isValidImageType(file)) {
    ElMessage.error(`不支持的文件格式: ${file.name}`)
    return false
  }
  
  // 检查文件大小
  const maxBytes = props.maxSize * 1024 * 1024
  if (file.size > maxBytes) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB: ${file.name}`)
    return false
  }
  
  return true
}

const handleFiles = (files: FileList | File[]) => {
  const validFiles: File[] = []
  
  Array.from(files).forEach(file => {
    if (validateFile(file)) {
      validFiles.push(file)
    }
  })
  
  if (validFiles.length > 0) {
    if (props.multiple) {
      fileList.value.push(...validFiles)
    } else {
      fileList.value = [validFiles[0]]
    }
    emit('change', fileList.value)
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    handleFiles(target.files)
    target.value = '' // 清空input，允许重新选择相同文件
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
  
  if (event.dataTransfer?.files) {
    handleFiles(event.dataTransfer.files)
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const removeFile = (index: number) => {
  fileList.value.splice(index, 1)
  emit('remove', index)
  emit('change', fileList.value)
}

// 暴露方法给父组件
defineExpose({
  clear: () => {
    fileList.value = []
    emit('change', [])
  },
  getFiles: () => fileList.value
})
</script>

<style scoped>
.file-upload {
  width: 100%;
}

.upload-area {
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  color: var(--color-text-secondary);
  transition: color 0.3s;
}

.upload-area:hover .upload-icon {
  color: var(--color-primary);
}

.upload-text .primary-text {
  font-size: 16px;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.upload-text .secondary-text {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.file-list {
  margin-top: 16px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--border-radius);
  background-color: var(--color-bg);
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-light);
}

.file-item:last-child {
  border-bottom: none;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.file-icon {
  color: var(--color-primary);
  font-size: 20px;
}

.file-details {
  flex: 1;
}

.file-name {
  font-size: 14px;
  color: var(--color-text-primary);
  word-break: break-all;
}

.file-size {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}
</style>