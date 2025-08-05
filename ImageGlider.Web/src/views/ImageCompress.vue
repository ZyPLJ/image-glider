<template>
  <div class="image-compress-page">
    <div class="page-header">
      <h1 class="page-title">图片压缩</h1>
      <p class="page-description">优化图片文件大小，减少存储空间</p>
    </div>

    <div class="compress-container">
      <div class="upload-section custom-card">
        <FileUpload
          ref="fileUploadRef"
          @change="handleFileChange"
          tip="支持 JPG、PNG、GIF、WebP 等格式"
        />
      </div>

      <div v-if="selectedFile" class="config-section">
        <el-row :gutter="24">
          <el-col :span="12">
            <div class="preview-section custom-card">
              <h3 class="section-title">图片预览</h3>
              <div class="image-preview">
                <img :src="previewUrl" alt="预览图片" class="preview-image" />
              </div>
              <div class="image-info">
                <span>文件大小: {{ formatFileSize(selectedFile.size) }}</span>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="params-section custom-card">
              <h3 class="section-title">压缩设置</h3>
              
              <el-form :model="compressForm" label-width="120px">
                <el-form-item label="压缩级别">
                  <el-select v-model="compressForm.compressionLevel">
                    <el-option label="轻度压缩" :value="1" />
                    <el-option label="中度压缩" :value="5" />
                    <el-option label="高度压缩" :value="9" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-checkbox v-model="compressForm.preserveMetadata">
                    保留元数据
                  </el-checkbox>
                </el-form-item>
              </el-form>

              <div class="actions">
                <el-button
                  type="primary"
                  :loading="processing"
                  @click="processCompress"
                  size="large"
                >
                  {{ processing ? '压缩中...' : '开始压缩' }}
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div v-if="processedFileName" class="result-section custom-card">
        <h3 class="section-title">压缩结果</h3>
        <div class="result-actions">
          <el-button type="success" @click="downloadResult" size="large">
            下载结果
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import FileUpload from '@/components/FileUpload.vue'
import { imageApi } from '@/api/imageApi'
import { createImagePreview, revokeImagePreview, downloadFile, formatFileSize } from '@/utils/file'
import type { ImageCompressRequest } from '@/types/api'

const fileUploadRef = ref()
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const processing = ref(false)
const processedFileName = ref<string>('')

const compressForm = ref({
  compressionLevel: 5,
  preserveMetadata: false
})

const handleFileChange = async (files: File[]) => {
  if (files.length === 0) {
    selectedFile.value = null
    previewUrl.value = ''
    return
  }

  const file = files[0]
  selectedFile.value = file
  
  if (previewUrl.value) {
    revokeImagePreview(previewUrl.value)
  }
  
  previewUrl.value = createImagePreview(file)
  processedFileName.value = ''
}

const processCompress = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择图片文件')
    return
  }

  processing.value = true
  
  try {
    const params: ImageCompressRequest = {
      file: selectedFile.value,
      compressionLevel: compressForm.value.compressionLevel,
      preserveMetadata: compressForm.value.preserveMetadata
    }
    
    const response = await imageApi.compressImage(params)
    processedFileName.value = response.data
    ElMessage.success(response.message || '压缩成功')
  } catch (error) {
    console.error('压缩失败:', error)
  } finally {
    processing.value = false
  }
}

const downloadResult = async () => {
  if (!processedFileName.value) return
  
  try {
    const blob = await imageApi.downloadImage(processedFileName.value)
    downloadFile(blob, processedFileName.value)
  } catch (error) {
    ElMessage.error('下载失败')
  }
}

onUnmounted(() => {
  if (previewUrl.value) {
    revokeImagePreview(previewUrl.value)
  }
})
</script>

<style scoped>
.image-compress-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.page-description {
  font-size: 16px;
  color: var(--color-text-regular);
  margin: 0;
}

.compress-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-section, .preview-section, .params-section, .result-section {
  padding: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

.image-preview {
  text-align: center;
  margin-bottom: 16px;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.image-info {
  font-size: 14px;
  color: var(--color-text-secondary);
  text-align: center;
}

.actions {
  margin-top: 32px;
  display: flex;
  gap: 12px;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}
</style>