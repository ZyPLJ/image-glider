<template>
  <div class="image-metadata-page">
    <div class="page-header">
      <h1 class="page-title">元数据处理</h1>
      <p class="page-description">清理图片中的敏感元数据信息</p>
    </div>

    <div class="metadata-container">
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
            </div>
          </el-col>
          <el-col :span="12">
            <div class="params-section custom-card">
              <h3 class="section-title">元数据清理</h3>
              
              <el-form :model="metadataForm" label-width="120px">
                <el-form-item>
                  <el-checkbox v-model="metadataForm.stripAll">
                    清理所有元数据
                  </el-checkbox>
                </el-form-item>
                <el-form-item>
                  <el-checkbox v-model="metadataForm.stripExif" :disabled="metadataForm.stripAll">
                    清理EXIF信息
                  </el-checkbox>
                </el-form-item>
                <el-form-item>
                  <el-checkbox v-model="metadataForm.stripIcc" :disabled="metadataForm.stripAll">
                    清理ICC配置文件
                  </el-checkbox>
                </el-form-item>
                <el-form-item>
                  <el-checkbox v-model="metadataForm.stripXmp" :disabled="metadataForm.stripAll">
                    清理XMP信息
                  </el-checkbox>
                </el-form-item>
              </el-form>

              <div class="actions">
                <el-button
                  type="primary"
                  :loading="processing"
                  @click="processMetadata"
                  size="large"
                >
                  {{ processing ? '处理中...' : '开始清理' }}
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <div v-if="processedFileName" class="result-section custom-card">
        <h3 class="section-title">处理结果</h3>
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
import { createImagePreview, revokeImagePreview, downloadFile } from '@/utils/file'
import type { ImageMetadataRequest } from '@/types/api'

const fileUploadRef = ref()
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const processing = ref(false)
const processedFileName = ref<string>('')

const metadataForm = ref({
  stripAll: true,
  stripExif: false,
  stripIcc: false,
  stripXmp: false
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

const processMetadata = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择图片文件')
    return
  }

  processing.value = true
  
  try {
    const params: ImageMetadataRequest = {
      file: selectedFile.value,
      stripAll: metadataForm.value.stripAll,
      stripExif: metadataForm.value.stripExif,
      stripIcc: metadataForm.value.stripIcc,
      stripXmp: metadataForm.value.stripXmp,
      quality: 90
    }
    
    const response = await imageApi.stripMetadata(params)
    processedFileName.value = response.data
    ElMessage.success(response.message || '元数据清理成功')
  } catch (error) {
    console.error('元数据清理失败:', error)
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
.image-metadata-page {
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

.metadata-container {
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