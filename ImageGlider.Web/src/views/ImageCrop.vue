<template>
  <div class="image-crop-page">
    <div class="page-header">
      <h1 class="page-title">图片裁剪</h1>
      <p class="page-description">支持精确裁剪、中心裁剪和按比例裁剪</p>
    </div>

    <div class="crop-container">
      <!-- 上传区域 -->
      <div class="upload-section custom-card">
        <FileUpload
          ref="fileUploadRef"
          @change="handleFileChange"
          tip="支持 JPG、PNG、GIF、WebP 等格式"
        />
      </div>

      <!-- 裁剪配置 -->
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

          <!-- 右侧：裁剪参数 -->
          <el-col :span="12">
            <div class="params-section custom-card">
              <h3 class="section-title">裁剪参数</h3>
              
              <el-tabs v-model="cropMode" @tab-change="handleTabChange">
                <!-- 精确裁剪 -->
                <el-tab-pane label="精确裁剪" name="exact">
                  <el-form :model="exactCropForm" label-width="80px">
                    <el-form-item label="X坐标">
                      <el-input-number
                        v-model="exactCropForm.x"
                        :min="0"
                        :max="maxX"
                        placeholder="左上角X坐标"
                      />
                    </el-form-item>
                    <el-form-item label="Y坐标">
                      <el-input-number
                        v-model="exactCropForm.y"
                        :min="0"
                        :max="maxY"
                        placeholder="左上角Y坐标"
                      />
                    </el-form-item>
                    <el-form-item label="宽度">
                      <el-input-number
                        v-model="exactCropForm.width"
                        :min="1"
                        :max="maxWidth"
                        placeholder="裁剪宽度"
                      />
                    </el-form-item>
                    <el-form-item label="高度">
                      <el-input-number
                        v-model="exactCropForm.height"
                        :min="1"
                        :max="maxHeight"
                        placeholder="裁剪高度"
                      />
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <!-- 中心裁剪 -->
                <el-tab-pane label="中心裁剪" name="center">
                  <el-form :model="centerCropForm" label-width="80px">
                    <el-form-item label="宽度">
                      <el-input-number
                        v-model="centerCropForm.width"
                        :min="1"
                        :max="imageInfo?.width"
                        placeholder="裁剪宽度"
                      />
                    </el-form-item>
                    <el-form-item label="高度">
                      <el-input-number
                        v-model="centerCropForm.height"
                        :min="1"
                        :max="imageInfo?.height"
                        placeholder="裁剪高度"
                      />
                    </el-form-item>
                  </el-form>
                </el-tab-pane>

                <!-- 按比例裁剪 -->
                <el-tab-pane label="按比例裁剪" name="percent">
                  <el-form :model="percentCropForm" label-width="120px">
                    <el-form-item label="X坐标百分比">
                      <el-input-number
                        v-model="percentCropForm.xPercent"
                        :min="0"
                        :max="100"
                        :precision="1"
                        placeholder="0-100"
                      />
                      <span class="unit">%</span>
                    </el-form-item>
                    <el-form-item label="Y坐标百分比">
                      <el-input-number
                        v-model="percentCropForm.yPercent"
                        :min="0"
                        :max="100"
                        :precision="1"
                        placeholder="0-100"
                      />
                      <span class="unit">%</span>
                    </el-form-item>
                    <el-form-item label="宽度百分比">
                      <el-input-number
                        v-model="percentCropForm.widthPercent"
                        :min="1"
                        :max="100"
                        :precision="1"
                        placeholder="1-100"
                      />
                      <span class="unit">%</span>
                    </el-form-item>
                    <el-form-item label="高度百分比">
                      <el-input-number
                        v-model="percentCropForm.heightPercent"
                        :min="1"
                        :max="100"
                        :precision="1"
                        placeholder="1-100"
                      />
                      <span class="unit">%</span>
                    </el-form-item>
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
                  @click="processCrop"
                  size="large"
                >
                  {{ processing ? '处理中...' : '开始裁剪' }}
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
import type {
  ImageCropRequest,
  ImageCenterCropRequest,
  ImagePercentCropRequest,
  ImageInfo
} from '@/types/api'

const fileUploadRef = ref()
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const processing = ref(false)
const processedFileName = ref<string>('')
const cropMode = ref<'exact' | 'center' | 'percent'>('exact')
const quality = ref(90)
const imageInfo = ref<ImageInfo | null>(null)

// 表单数据
const exactCropForm = ref({
  x: 0,
  y: 0,
  width: 200,
  height: 200
})

const centerCropForm = ref({
  width: 200,
  height: 200
})

const percentCropForm = ref({
  xPercent: 0,
  yPercent: 0,
  widthPercent: 50,
  heightPercent: 50
})

// 计算属性
const maxX = computed(() => {
  if (!imageInfo.value) return 0
  return Math.max(0, imageInfo.value.width - exactCropForm.value.width)
})

const maxY = computed(() => {
  if (!imageInfo.value) return 0
  return Math.max(0, imageInfo.value.height - exactCropForm.value.height)
})

const maxWidth = computed(() => {
  if (!imageInfo.value) return 0
  return imageInfo.value.width - exactCropForm.value.x
})

const maxHeight = computed(() => {
  if (!imageInfo.value) return 0
  return imageInfo.value.height - exactCropForm.value.y
})

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
    
    // 设置默认裁剪参数
    if (imageInfo.value) {
      exactCropForm.value = {
        x: 0,
        y: 0,
        width: Math.min(200, imageInfo.value.width),
        height: Math.min(200, imageInfo.value.height)
      }
      centerCropForm.value = {
        width: Math.min(200, imageInfo.value.width),
        height: Math.min(200, imageInfo.value.height)
      }
    }
  } catch (error) {
    console.error('获取图片信息失败:', error)
  }
  
  processedFileName.value = ''
}

// 处理裁剪
const processCrop = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择图片文件')
    return
  }

  processing.value = true
  
  try {
    let response
    
    switch (cropMode.value) {
      case 'exact':
        const exactParams: ImageCropRequest = {
          file: selectedFile.value,
          x: exactCropForm.value.x,
          y: exactCropForm.value.y,
          width: exactCropForm.value.width,
          height: exactCropForm.value.height,
          quality: quality.value
        }
        response = await imageApi.cropImage(exactParams)
        break
        
      case 'center':
        const centerParams: ImageCenterCropRequest = {
          file: selectedFile.value,
          width: centerCropForm.value.width,
          height: centerCropForm.value.height,
          quality: quality.value
        }
        response = await imageApi.cropImageCenter(centerParams)
        break
        
      case 'percent':
        const percentParams: ImagePercentCropRequest = {
          file: selectedFile.value,
          xPercent: percentCropForm.value.xPercent,
          yPercent: percentCropForm.value.yPercent,
          widthPercent: percentCropForm.value.widthPercent,
          heightPercent: percentCropForm.value.heightPercent,
          quality: quality.value
        }
        response = await imageApi.cropImageByPercent(percentParams)
        break
        
      default:
        throw new Error('未知的裁剪模式')
    }
    
    processedFileName.value = response.data
    ElMessage.success(response.message || '裁剪成功')
  } catch (error) {
    console.error('裁剪失败:', error)
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
    exactCropForm.value = {
      x: 0,
      y: 0,
      width: Math.min(200, imageInfo.value.width),
      height: Math.min(200, imageInfo.value.height)
    }
    centerCropForm.value = {
      width: Math.min(200, imageInfo.value.width),
      height: Math.min(200, imageInfo.value.height)
    }
  }
  percentCropForm.value = {
    xPercent: 0,
    yPercent: 0,
    widthPercent: 50,
    heightPercent: 50
  }
  quality.value = 90
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
.image-crop-page {
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

.crop-container {
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
}
</style>