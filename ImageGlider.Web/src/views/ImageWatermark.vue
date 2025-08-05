<template>
  <div class="image-watermark-page">
    <div class="page-header">
      <h1 class="page-title">添加水印</h1>
      <p class="page-description">为图片添加文字或图片水印</p>
    </div>

    <div class="watermark-container">
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
              <h3 class="section-title">水印设置</h3>
              
              <el-tabs v-model="watermarkMode">
                <el-tab-pane label="文字水印" name="text">
                  <el-form :model="textForm" label-width="100px">
                    <el-form-item label="水印文字">
                      <el-input v-model="textForm.text" placeholder="请输入水印文字" />
                    </el-form-item>
                    <el-form-item label="位置">
                      <el-select v-model="textForm.position">
                        <el-option label="右下角" :value="8" />
                        <el-option label="右上角" :value="2" />
                        <el-option label="左下角" :value="6" />
                        <el-option label="左上角" :value="0" />
                      </el-select>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>
              </el-tabs>

              <div class="actions">
                <el-button
                  type="primary"
                  :loading="processing"
                  @click="processWatermark"
                  size="large"
                >
                  {{ processing ? '处理中...' : '添加水印' }}
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
import type { TextWatermarkRequest } from '@/types/api'

const fileUploadRef = ref()
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const processing = ref(false)
const processedFileName = ref<string>('')
const watermarkMode = ref<'text'>('text')

const textForm = ref({
  text: '水印文字',
  position: 8,
  opacity: 50,
  fontSize: 24,
  fontColor: '#FFFFFF'
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

const processWatermark = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择图片文件')
    return
  }

  processing.value = true
  
  try {
    const params: TextWatermarkRequest = {
      file: selectedFile.value,
      text: textForm.value.text,
      position: textForm.value.position,
      opacity: textForm.value.opacity,
      fontSize: textForm.value.fontSize,
      fontColor: textForm.value.fontColor,
      quality: 90
    }
    
    const response = await imageApi.addTextWatermark(params)
    processedFileName.value = response.data
    ElMessage.success(response.message || '水印添加成功')
  } catch (error) {
    console.error('水印添加失败:', error)
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
.image-watermark-page {
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

.watermark-container {
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