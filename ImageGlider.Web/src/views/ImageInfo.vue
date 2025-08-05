<template>
  <div class="image-info-page">
    <div class="page-header">
      <h1 class="page-title">图片信息</h1>
      <p class="page-description">查看图片的详细信息和元数据</p>
    </div>

    <div class="info-container">
      <!-- 上传区域 -->
      <div class="upload-section custom-card">
        <FileUpload
          ref="fileUploadRef"
          @change="handleFileChange"
          tip="支持 JPG、PNG、GIF、WebP 等格式"
        />
      </div>

      <!-- 信息显示 -->
      <div v-if="selectedFile && imageInfo" class="info-section">
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
            </div>
          </el-col>

          <!-- 右侧：详细信息 -->
          <el-col :span="12">
            <div class="details-section custom-card">
              <h3 class="section-title">详细信息</h3>
              
              <div class="info-group">
                <h4 class="group-title">基本信息</h4>
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="文件名">
                    {{ selectedFile.name }}
                  </el-descriptions-item>
                  <el-descriptions-item label="文件大小">
                    {{ formatFileSize(selectedFile.size) }}
                  </el-descriptions-item>
                  <el-descriptions-item label="文件类型">
                    {{ selectedFile.type }}
                  </el-descriptions-item>
                  <el-descriptions-item label="最后修改">
                    {{ formatDate(selectedFile.lastModified) }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>

              <div class="info-group">
                <h4 class="group-title">图像属性</h4>
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="图片尺寸">
                    {{ imageInfo.width }} × {{ imageInfo.height }} 像素
                  </el-descriptions-item>
                  <el-descriptions-item label="宽高比">
                    {{ aspectRatio }}
                  </el-descriptions-item>
                  <el-descriptions-item label="总像素">
                    {{ totalPixels.toLocaleString() }} 像素
                  </el-descriptions-item>
                  <el-descriptions-item label="图片格式">
                    {{ imageInfo.format?.toUpperCase() }}
                  </el-descriptions-item>
                  <el-descriptions-item 
                    v-if="imageInfo.colorDepth"
                    label="颜色深度"
                  >
                    {{ imageInfo.colorDepth }} 位
                  </el-descriptions-item>
                  <el-descriptions-item 
                    v-if="imageInfo.hasAlpha !== undefined"
                    label="透明通道"
                  >
                    {{ imageInfo.hasAlpha ? '是' : '否' }}
                  </el-descriptions-item>
                  <el-descriptions-item 
                    v-if="imageInfo.dpi"
                    label="分辨率"
                  >
                    {{ imageInfo.dpi }} DPI
                  </el-descriptions-item>
                </el-descriptions>
              </div>

              <div class="info-group">
                <h4 class="group-title">文件分析</h4>
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="压缩比">
                    {{ compressionRatio }}
                  </el-descriptions-item>
                  <el-descriptions-item label="平均色彩深度">
                    {{ avgBytesPerPixel }} 字节/像素
                  </el-descriptions-item>
                  <el-descriptions-item label="适用场景">
                    {{ suitableUseCase }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-section">
        <el-card>
          <div style="text-align: center; padding: 40px;">
            <el-icon class="is-loading" :size="32">
              <Loading />
            </el-icon>
            <p style="margin-top: 16px;">正在分析图片信息...</p>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import FileUpload from '@/components/FileUpload.vue'
import { imageApi } from '@/api/imageApi'
import { createImagePreview, revokeImagePreview, formatFileSize } from '@/utils/file'
import type { ImageInfo } from '@/types/api'

const fileUploadRef = ref()
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const imageInfo = ref<ImageInfo | null>(null)
const loading = ref(false)

// 计算属性
const aspectRatio = computed(() => {
  if (!imageInfo.value) return ''
  const { width, height } = imageInfo.value
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
  const divisor = gcd(width, height)
  return `${width / divisor}:${height / divisor}`
})

const totalPixels = computed(() => {
  if (!imageInfo.value) return 0
  return imageInfo.value.width * imageInfo.value.height
})

const compressionRatio = computed(() => {
  if (!selectedFile.value || !imageInfo.value) return ''
  const uncompressedSize = totalPixels.value * 3 // RGB 每像素3字节
  const ratio = (uncompressedSize / selectedFile.value.size).toFixed(1)
  return `${ratio}:1`
})

const avgBytesPerPixel = computed(() => {
  if (!selectedFile.value || !imageInfo.value) return ''
  const avgBytes = (selectedFile.value.size / totalPixels.value).toFixed(2)
  return avgBytes
})

const suitableUseCase = computed(() => {
  if (!selectedFile.value || !imageInfo.value) return ''
  
  const { format } = imageInfo.value
  const fileSize = selectedFile.value.size
  const megapixels = totalPixels.value / 1000000
  
  if (format?.toLowerCase() === 'jpeg' || format?.toLowerCase() === 'jpg') {
    if (megapixels > 5) return '高分辨率照片、印刷'
    return '网页照片、社交媒体'
  } else if (format?.toLowerCase() === 'png') {
    if (imageInfo.value.hasAlpha) return '图标、Logo、透明图像'
    return '无损保存、图表、截图'
  } else if (format?.toLowerCase() === 'webp') {
    return '现代网页、移动应用'
  } else if (format?.toLowerCase() === 'gif') {
    return '简单动画、表情包'
  }
  
  return '通用用途'
})

// 格式化日期
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

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
  loading.value = true
  try {
    const response = await imageApi.getImageInfo(file)
    imageInfo.value = response.data
    ElMessage.success('图片信息获取成功')
  } catch (error) {
    console.error('获取图片信息失败:', error)
    imageInfo.value = null
  } finally {
    loading.value = false
  }
}

// 清理资源
onUnmounted(() => {
  if (previewUrl.value) {
    revokeImagePreview(previewUrl.value)
  }
})
</script>

<style scoped>
.image-info-page {
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

.info-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-section {
  padding: 24px;
}

.info-section {
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
}

.preview-image {
  max-width: 100%;
  max-height: 500px;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.details-section {
  padding: 24px;
}

.info-group {
  margin-bottom: 32px;
}

.info-group:last-child {
  margin-bottom: 0;
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-primary);
  display: inline-block;
}

.loading-section {
  margin-top: 24px;
}

:deep(.el-descriptions__body) {
  background-color: var(--color-bg);
}

:deep(.el-descriptions__label) {
  background-color: var(--color-bg-page);
  color: var(--color-text-regular);
  font-weight: 600;
}

:deep(.el-descriptions__content) {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-section :deep(.el-col) {
    margin-bottom: 24px;
  }
  
  .info-group {
    margin-bottom: 24px;
  }
  
  :deep(.el-descriptions) {
    font-size: 14px;
  }
}
</style>