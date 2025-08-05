import http from './http'
import type {
  ApiResponse,
  ImageCropRequest,
  ImageCenterCropRequest,
  ImagePercentCropRequest,
  ImageResizeRequest,
  ThumbnailRequest,
  TextWatermarkRequest,
  ImageWatermarkRequest,
  ImageColorRequest,
  ImageCompressRequest,
  ImageConvertRequest,
  ImageMetadataRequest,
  ImageInfo
} from '@/types/api'

// 创建FormData的辅助函数
function createFormData(data: Record<string, any>): FormData {
  const formData = new FormData()
  
  Object.keys(data).forEach(key => {
    const value = data[key]
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append(key, value)
      } else {
        formData.append(key, String(value))
      }
    }
  })
  
  return formData
}

export const imageApi = {
  // 图片裁剪
  async cropImage(params: ImageCropRequest): Promise<ApiResponse<string>> {
    const formData = createFormData(params)
    const response = await http.post('/crop', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async cropImageCenter(params: ImageCenterCropRequest): Promise<ApiResponse<string>> {
    const formData = createFormData(params)
    const response = await http.post('/crop/center', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async cropImageByPercent(params: ImagePercentCropRequest): Promise<ApiResponse<string>> {
    const formData = createFormData(params)
    const response = await http.post('/crop/percent', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // 图片缩放
  async resizeImage(params: ImageResizeRequest): Promise<ApiResponse<string>> {
    const formData = createFormData(params)
    const response = await http.post('/resize', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async generateThumbnail(params: ThumbnailRequest): Promise<ApiResponse<string>> {
    const formData = createFormData(params)
    const response = await http.post('/resize/thumbnail', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // 水印
  async addTextWatermark(params: TextWatermarkRequest): Promise<ApiResponse<string>> {
    const formData = createFormData(params)
    const response = await http.post('/watermark/text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async addImageWatermark(params: ImageWatermarkRequest): Promise<ApiResponse<string>> {
    const formData = createFormData(params)
    const response = await http.post('/watermark/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // 颜色调整
  async adjustColor(params: ImageColorRequest): Promise<ApiResponse<string>> {
    const formData = createFormData(params)
    const response = await http.post('/color/adjust', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // 压缩
  async compressImage(params: ImageCompressRequest): Promise<ApiResponse<string>> {
    const formData = createFormData(params)
    const response = await http.post('/compress', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // 格式转换
  async convertImage(params: ImageConvertRequest): Promise<ApiResponse<string>> {
    const formData = createFormData(params)
    const response = await http.post('/convert', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // 元数据处理
  async stripMetadata(params: ImageMetadataRequest): Promise<ApiResponse<string>> {
    const formData = createFormData(params)
    const response = await http.post('/metadata/strip', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // 获取图片信息
  async getImageInfo(file: File): Promise<ApiResponse<ImageInfo>> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await http.post('/info', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  // 下载处理后的图片
  async downloadImage(fileName: string): Promise<Blob> {
    const response = await http.post(`/downloads/${fileName}`, {}, {
      responseType: 'blob'
    })
    return response.data
  }
}