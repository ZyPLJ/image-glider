<template>
  <div class="image-color-page">
    <div class="page-header">
      <h1 class="page-title">颜色调整</h1>
      <p class="page-description">调整图片的亮度、对比度、饱和度等颜色属性</p>
    </div>

    <div class="color-container">
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
              <h3 class="section-title">颜色调整</h3>
              
              <el-form :model="colorForm" label-width="100px">
                <el-form-item label="亮度">
                  <el-slider v-model="colorForm.brightness" :min="-100" :max="100" show-input />
                </el-form-item>
                <el-form-item label="对比度">
                  <el-slider v-model="colorForm.contrast" :min="-100" :max="100" show-input />
                </el-form-item>
                <el-form-item label="饱和度">
                  <el-slider v-model="colorForm.saturation" :min="-100" :max="100" show-input />
                </el-form-item>
                <el-form-item label="色相">
                  <el-slider v-model="colorForm.hue" :min="-180" :max="180" show-input />
                </el-form-item>
              </el-form>

              <div class="actions">
                <el-button
                  type="primary"
                  :loading="processing"
                  @click="processColor"
                  size="large"
                >
                  {{ processing ? '处理中...' : '开始调整' }}
                </el-button>
                <el-button @click="resetForm" size="large">重置</el-button>
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
import type { ImageColorRequest } from '@/types/api'

const fileUploadRef = ref()
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const processing = ref(false)
const processedFileName = ref<string>('')

const colorForm = ref({
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  gamma: 1.0
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

const processColor = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择图片文件')
    return
  }

  processing.value = true
  
  try {
    const params: ImageColorRequest = {
      file: selectedFile.value,
      brightness: colorForm.value.brightness,
      contrast: colorForm.value.contrast,
      saturation: colorForm.value.saturation,
      hue: colorForm.value.hue,
      gamma: colorForm.value.gamma,
      quality: 90
    }
    
    const response = await imageApi.adjustColor(params)
    processedFileName.value = response.data
    ElMessage.success(response.message || '颜色调整成功')
  } catch (error) {
    console.error('颜色调整失败:', error)
  } finally {
    processing.value = false
  }
}

const resetForm = () => {
  colorForm.value = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    gamma: 1.0
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
.image-color-page {
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

.color-container {
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