<template>
  <div class="image-resize-page">
    <div class="page-header">
      <h1 class="page-title">图片缩放</h1>
      <p class="page-description">智能调整图片尺寸，支持多种缩放模式和缩略图生成</p>
    </div>

    <div class="resize-container">
      <!-- 上传区域 -->
      <div class="upload-section custom-card">
        <FileUpload
          ref="fileUploadRef"
          @change="handleFileChange"
          tip="支持 JPG、PNG、GIF、WebP 等格式"
        />
      </div>

      <!-- 配置区域 -->
      <div v-if="selectedFile" class="config-section">
        <el-row :gutter="24">
          <!-- 左侧：图片预览 -->
          <el-col :span="12">
            <div class="preview-section custom-card">
              <h3 class="section-title">图片预览</h3>
              <div class="image-preview">
                <img
                  :src="previewUrl"
                  alt="预览图片"
                  class="preview-image"
                />
              </div>
              <div class="image-info">
                <span>原始尺寸: {{ imageInfo?.width }} × {{ imageInfo?.height }}</span>
              </div>
            </div>
          </el-col>

          <!-- 右侧：缩放参数 -->
          <el-col :span="12">
            <div class="params-section custom-card">
              <h3 class="section-title">缩放参数</h3>
              
              <el-tabs v-model="resizeMode" @tab-change="handleTabChange">
                <!-- 图片缩放 -->
                <el-tab-pane label="图片缩放" name="resize">
                  <el-form :model="resizeForm" label-width="100px">
                    <el-form-item label="目标宽度">
                      <el-input-number
                        v-model="resizeForm.width"
                        :min="1"
                        :max="5000"
                        placeholder="像素"
                        @change="handleWidthChange"
                      />
                      <span class="unit">px</span>
                    </el-form-item>
                    
                    <el-form-item label="目标高度">
                      <el-input-number
                        v-model="resizeForm.height"
                        :min="1"
                        :max="5000"
                        placeholder="像素"
                        @change="handleHeightChange"
                      />
                      <span class="unit">px</span>
                    </el-form-item>
                    
                    <el-form-item label="缩放模式">
                      <el-select v-model="resizeForm.resizeMode" placeholder="选择缩放模式">
                        <el-option
                          v-for="mode in resizeModes"
                          :key="mode.value"
                          :label="mode.label"
                          :value="mode.value"
                        />
                      </el-select>
                    </el-form-item>
                    
                    <el-form-item>
                      <el-checkbox v-model="keepAspectRatio">
                        保持宽高比
                      </el-checkbox>
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <!-- 缩略图生成 -->
                <el-tab-pane label="缩略图生成" name="thumbnail">
                  <el-form :model="thumbnailForm" label-width="100px">
                    <el-form-item label="最大边长">
                      <el-input-number
                        v-model="thumbnailForm.maxSize"
                        :min="50"
                        :max="800"
                        placeholder="像素"
                      />
                      <span class="unit">px</span>
                    </el-form-item>
                    <div class="thumbnail-presets">
                      <span class="preset-label">常用尺寸:</span>
                      <el-button-group>
                        <el-button
                          v-for="preset in thumbnailPresets"
                          :key="preset"
                          size="small"
                          @click="thumbnailForm.maxSize = preset"
                        >
                          {{ preset }}px
                        </el-button>
                      </el-button-group>
                    </div>
                  </el-form>
                </el-tab-pane>
              </el-tabs>

              <!-- 质量设置 -->
              <el-form-item label="JPEG质量" label-width="100px">
                <el-slider
                  v-model="quality"
                  :min="1"
                  :max="100"
                  show-input
                />
              </el-form-item>

              <!-- 操作按钮 -->
              <div class="actions">
                <el-button
                  type="primary"
                  :loading="processing"
                  @click="processResize"
                  size="large"
                >
                  {{ processing ? '处理中...' : '开始缩放' }}
                </el-button>
                <el-button @click="resetForm" size="large">重置</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 结果显示 -->
      <div v-if="processedFileName" class="result-section custom-card">
        <h3 class="section-title">处理结果</h3>
        <div class="result-actions">
          <el-button
            type="success"
            :icon="Download"
            @click="downloadResult"
            size="large"
          >
            下载结果
          </el-button>
          <el-button @click="processAnother" size="large">
            继续处理
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import FileUpload from '@/components/FileUpload.vue'
import { imageApi } from '@/api/imageApi'
import { createImagePreview, revokeImagePreview, downloadFile } from '@/utils/file'
import { ResizeMode } from '@/types/api'
import type {
  ImageResizeRequest,
  ThumbnailRequest,
  ImageInfo
} from '@/types/api'

const fileUploadRef = ref()
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const processing = ref(false)
const processedFileName = ref<string>('')
const resizeMode = ref<'resize' | 'thumbnail'>('resize')
const quality = ref(90)
const imageInfo = ref<ImageInfo | null>(null)
const keepAspectRatio = ref(true)

// 表单数据
const resizeForm = ref({
  width: 800,
  height: 600,
  resizeMode: ResizeMode.KeepAspectRatio
})

const thumbnailForm = ref({
  maxSize: 150
})

// 缩放模式选项
const resizeModes = [
  { label: '拉伸模式', value: ResizeMode.Stretch },
  { label: '保持宽高比', value: ResizeMode.KeepAspectRatio },
  { label: '裁剪模式', value: ResizeMode.Crop }
]

// 缩略图预设尺寸
const thumbnailPresets = [100, 150, 200, 300, 400]

// 处理文件选择
const handleFileChange = async (files: File[]) => {
  if (files.length === 0) {
    selectedFile.value = null
    previewUrl.value = ''
    imageInfo.value = null
    return
  }

  const file = files[0]
  selectedFile.value = file
  
  // 清理之前的预览URL
  if (previewUrl.value) {
    revokeImagePreview(previewUrl.value)
  }
  
  previewUrl.value = createImagePreview(file)
  
  // 获取图片信息
  try {
    const response = await imageApi.getImageInfo(file)
    imageInfo.value = response.data
    
    // 设置默认缩放参数
    if (imageInfo.value) {
      resizeForm.value.width = Math.min(800, imageInfo.value.width)
      resizeForm.value.height = Math.min(600, imageInfo.value.height)
    }
  } catch (error) {
    console.error('获取图片信息失败:', error)
  }
  
  processedFileName.value = ''
}

// 处理宽度变化
const handleWidthChange = (value: number | undefined) => {
  if (keepAspectRatio.value && imageInfo.value && value) {
    const ratio = imageInfo.value.height / imageInfo.value.width
    resizeForm.value.height = Math.round(value * ratio)
  }
}

// 处理高度变化
const handleHeightChange = (value: number | undefined) => {
  if (keepAspectRatio.value && imageInfo.value && value) {
    const ratio = imageInfo.value.width / imageInfo.value.height
    resizeForm.value.width = Math.round(value * ratio)
  }
}

// 处理缩放
const processResize = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择图片文件')
    return
  }

  processing.value = true
  
  try {
    let response
    
    if (resizeMode.value === 'resize') {
      const params: ImageResizeRequest = {
        file: selectedFile.value,
        width: resizeForm.value.width,
        height: resizeForm.value.height,
        resizeMode: resizeForm.value.resizeMode,
        quality: quality.value
      }
      response = await imageApi.resizeImage(params)
    } else {
      const params: ThumbnailRequest = {
        file: selectedFile.value,
        maxSize: thumbnailForm.value.maxSize,
        quality: quality.value
      }
      response = await imageApi.generateThumbnail(params)
    }
    
    processedFileName.value = response.data
    ElMessage.success(response.message || '缩放成功')
  } catch (error) {
    console.error('缩放失败:', error)
  } finally {
    processing.value = false
  }
}

// 下载结果
const downloadResult = async () => {
  if (!processedFileName.value) return
  
  try {
    const blob = await imageApi.downloadImage(processedFileName.value)
    downloadFile(blob, processedFileName.value)
  } catch (error) {
    ElMessage.error('下载失败')
    console.error('下载失败:', error)
  }
}

// 继续处理
const processAnother = () => {
  processedFileName.value = ''
  fileUploadRef.value?.clear()
  selectedFile.value = null
  previewUrl.value = ''
  imageInfo.value = null
}

// 重置表单
const resetForm = () => {
  if (imageInfo.value) {
    resizeForm.value.width = Math.min(800, imageInfo.value.width)
    resizeForm.value.height = Math.min(600, imageInfo.value.height)
  }
  resizeForm.value.resizeMode = ResizeMode.KeepAspectRatio
  thumbnailForm.value.maxSize = 150
  quality.value = 90
  keepAspectRatio.value = true
}

// 标签页切换
const handleTabChange = () => {
  // 可以在这里添加切换逻辑
}

// 清理资源
onUnmounted(() => {
  if (previewUrl.value) {
    revokeImagePreview(previewUrl.value)
  }
})
</script>

<style scoped>
.image-resize-page {
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

.resize-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-section {
  padding: 24px;
}

.config-section {
  margin-top: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

.preview-section {
  padding: 24px;
  height: fit-content;
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

.params-section {
  padding: 24px;
}

.unit {
  margin-left: 8px;
  color: var(--color-text-secondary);
}

.thumbnail-presets {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.preset-label {
  font-size: 14px;
  color: var(--color-text-regular);
}

.actions {
  margin-top: 32px;
  display: flex;
  gap: 12px;
}

.result-section {
  padding: 24px;
  text-align: center;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-tabs__content) {
  padding-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .config-section :deep(.el-col) {
    margin-bottom: 24px;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .result-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .thumbnail-presets {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>