<template>
  <div class="image-convert-page">
    <div class="page-header">
      <h1 class="page-title">图片格式转换</h1>
      <p class="page-description">支持多种图片格式之间的相互转换</p>
    </div>

    <div class="convert-container">
      <!-- 上传区域 -->
      <div class="upload-section custom-card">
        <FileUpload
          ref="fileUploadRef"
          @change="handleFileChange"
          tip="支持 JPG、PNG、GIF、WebP、BMP、TIFF 等格式"
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
                <p>原始格式: {{ originalFormat }}</p>
                <p>文件大小: {{ formatFileSize(selectedFile.size) }}</p>
                <p>图片尺寸: {{ imageInfo?.width }} × {{ imageInfo?.height }}</p>
              </div>
            </div>
          </el-col>

          <!-- 右侧：转换参数 -->
          <el-col :span="12">
            <div class="params-section custom-card">
              <h3 class="section-title">转换设置</h3>
              
              <el-form :model="convertForm" label-width="100px">
                <el-form-item label="目标格式">
                  <el-select 
                    v-model="convertForm.fileExt" 
                    placeholder="选择目标格式"
                    size="large"
                  >
                    <el-option
                      v-for="format in supportedFormats"
                      :key="format.value"
                      :label="format.label"
                      :value="format.value"
                      :disabled="format.value === originalFormat"
                    >
                      <div class="format-option">
                        <span class="format-name">{{ format.label }}</span>
                        <span class="format-desc">{{ format.description }}</span>
                      </div>
                    </el-option>
                  </el-select>
                </el-form-item>
                
                <!-- JPEG质量设置（仅在目标格式为JPEG时显示） -->
                <el-form-item 
                  v-if="convertForm.fileExt === '.jpg' || convertForm.fileExt === '.jpeg'"
                  label="JPEG质量"
                >
                  <el-slider
                    v-model="quality"
                    :min="1"
                    :max="100"
                    show-input
                    :format-tooltip="(val) => `${val}%`"
                  />
                  <div class="quality-tips">
                    <span class="tip-item">
                      <span class="tip-range">90-100:</span>
                      <span class="tip-desc">最高质量，文件较大</span>
                    </span>
                    <span class="tip-item">
                      <span class="tip-range">70-89:</span>
                      <span class="tip-desc">高质量，推荐使用</span>
                    </span>
                    <span class="tip-item">
                      <span class="tip-range">50-69:</span>
                      <span class="tip-desc">中等质量，文件较小</span>
                    </span>
                  </div>
                </el-form-item>
              </el-form>

              <!-- 格式特性说明 -->
              <div v-if="selectedFormatInfo" class="format-info">
                <h4>格式特性:</h4>
                <ul>
                  <li v-for="feature in selectedFormatInfo.features" :key="feature">
                    {{ feature }}
                  </li>
                </ul>
              </div>

              <!-- 操作按钮 -->
              <div class="actions">
                <el-button
                  type="primary"
                  :loading="processing"
                  @click="processConvert"
                  :disabled="!convertForm.fileExt"
                  size="large"
                >
                  {{ processing ? '转换中...' : '开始转换' }}
                </el-button>
                <el-button @click="resetForm" size="large">重置</el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 结果显示 -->
      <div v-if="processedFileName" class="result-section custom-card">
        <h3 class="section-title">转换结果</h3>
        <div class="result-info">
          <p>转换成功！新格式: {{ convertForm.fileExt.toUpperCase().substring(1) }}</p>
        </div>
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
            继续转换
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
import { createImagePreview, revokeImagePreview, downloadFile, formatFileSize } from '@/utils/file'
import type {
  ImageConvertRequest,
  ImageInfo
} from '@/types/api'

const fileUploadRef = ref()
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const processing = ref(false)
const processedFileName = ref<string>('')
const quality = ref(90)
const imageInfo = ref<ImageInfo | null>(null)

// 表单数据
const convertForm = ref({
  fileExt: ''
})

// 支持的格式
const supportedFormats = [
  {
    value: '.jpg',
    label: 'JPEG',
    description: '有损压缩，适合照片',
    features: [
      '有损压缩，文件小',
      '广泛支持',
      '适合照片和复杂图像',
      '不支持透明度'
    ]
  },
  {
    value: '.png',
    label: 'PNG',
    description: '无损压缩，支持透明度',
    features: [
      '无损压缩',
      '支持透明度',
      '适合图标和简单图像',
      '文件相对较大'
    ]
  },
  {
    value: '.webp',
    label: 'WebP',
    description: '现代格式，压缩率高',
    features: [
      '现代图像格式',
      '优秀的压缩率',
      '支持有损和无损压缩',
      '支持透明度和动画'
    ]
  },
  {
    value: '.gif',
    label: 'GIF',
    description: '支持动画，256色',
    features: [
      '支持动画',
      '256色限制',
      '支持透明度',
      '适合简单动画'
    ]
  },
  {
    value: '.bmp',
    label: 'BMP',
    description: '位图格式，无压缩',
    features: [
      '无压缩',
      '文件较大',
      '兼容性好',
      '适合编辑处理'
    ]
  },
  {
    value: '.tiff',
    label: 'TIFF',
    description: '专业格式，高质量',
    features: [
      '专业图像格式',
      '支持多种压缩',
      '高质量保存',
      '适合印刷和专业用途'
    ]
  }
]

// 原始格式
const originalFormat = computed(() => {
  if (!selectedFile.value) return ''
  const ext = selectedFile.value.name.split('.').pop()?.toLowerCase()
  return ext ? `.${ext}` : ''
})

// 选中格式信息
const selectedFormatInfo = computed(() => {
  return supportedFormats.find(f => f.value === convertForm.value.fileExt)
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
  } catch (error) {
    console.error('获取图片信息失败:', error)
  }
  
  // 重置转换设置
  convertForm.value.fileExt = ''
  processedFileName.value = ''
}

// 处理转换
const processConvert = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择图片文件')
    return
  }
  
  if (!convertForm.value.fileExt) {
    ElMessage.warning('请选择目标格式')
    return
  }

  processing.value = true
  
  try {
    const params: ImageConvertRequest = {
      file: selectedFile.value,
      fileExt: convertForm.value.fileExt,
      quality: quality.value
    }
    
    const response = await imageApi.convertImage(params)
    processedFileName.value = response.data
    ElMessage.success(response.message || '转换成功')
  } catch (error) {
    console.error('转换失败:', error)
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
  convertForm.value.fileExt = ''
}

// 重置表单
const resetForm = () => {
  convertForm.value.fileExt = ''
  quality.value = 90
}

// 清理资源
onUnmounted(() => {
  if (previewUrl.value) {
    revokeImagePreview(previewUrl.value)
  }
})
</script>

<style scoped>
.image-convert-page {
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

.convert-container {
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

.image-info p {
  margin: 4px 0;
}

.params-section {
  padding: 24px;
}

.format-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.format-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.format-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.quality-tips {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tip-item {
  display: flex;
  gap: 8px;
  font-size: 12px;
}

.tip-range {
  color: var(--color-primary);
  font-weight: 600;
  min-width: 60px;
}

.tip-desc {
  color: var(--color-text-secondary);
}

.format-info {
  margin-top: 24px;
  padding: 16px;
  background-color: var(--color-bg-page);
  border-radius: var(--border-radius);
}

.format-info h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: var(--color-text-primary);
}

.format-info ul {
  margin: 0;
  padding-left: 20px;
}

.format-info li {
  font-size: 13px;
  color: var(--color-text-regular);
  margin-bottom: 4px;
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

.result-info {
  margin-bottom: 20px;
}

.result-info p {
  font-size: 16px;
  color: var(--color-text-primary);
  margin: 0;
}

.result-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-select) {
  width: 100%;
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
  
  .quality-tips {
    font-size: 11px;
  }
}
</style>