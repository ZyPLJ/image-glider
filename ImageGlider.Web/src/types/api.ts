// API响应基础结构
export interface ApiResponse<T = any> {
  statusCode: number
  successful: boolean
  message?: string
  data?: T
}

// 图片处理基础请求
export interface ImageProcessingRequest {
  file: File
  quality?: number
}

// 图片裁剪请求
export interface ImageCropRequest extends ImageProcessingRequest {
  x: number
  y: number
  width: number
  height: number
}

export interface ImageCenterCropRequest extends ImageProcessingRequest {
  width: number
  height: number
}

export interface ImagePercentCropRequest extends ImageProcessingRequest {
  xPercent: number
  yPercent: number
  widthPercent: number
  heightPercent: number
}

// 图片缩放请求
export interface ImageResizeRequest extends ImageProcessingRequest {
  width?: number
  height?: number
  resizeMode: ResizeMode
}

export interface ThumbnailRequest extends ImageProcessingRequest {
  maxSize: number
}

// 水印请求
export interface TextWatermarkRequest extends ImageProcessingRequest {
  text: string
  position: WatermarkPosition
  opacity: number
  fontSize: number
  fontColor: string
}

export interface ImageWatermarkRequest extends ImageProcessingRequest {
  watermarkFile: File
  position: WatermarkPosition
  opacity: number
  scale: number
}

// 图片颜色调整请求
export interface ImageColorRequest extends ImageProcessingRequest {
  brightness: number
  contrast: number
  saturation: number
  hue: number
  gamma: number
}

// 图片压缩请求
export interface ImageCompressRequest extends ImageProcessingRequest {
  compressionLevel: number
  preserveMetadata: boolean
}

// 图片格式转换请求
export interface ImageConvertRequest extends ImageProcessingRequest {
  fileExt: string
}

// 图片元数据处理请求
export interface ImageMetadataRequest extends ImageProcessingRequest {
  stripAll: boolean
  stripExif: boolean
  stripIcc: boolean
  stripXmp: boolean
}

// 枚举类型
export enum ResizeMode {
  Stretch = 0,
  KeepAspectRatio = 1,
  Crop = 2
}

export enum WatermarkPosition {
  TopLeft = 0,
  TopCenter = 1,
  TopRight = 2,
  MiddleLeft = 3,
  Center = 4,
  MiddleRight = 5,
  BottomLeft = 6,
  BottomCenter = 7,
  BottomRight = 8
}

// 图片信息
export interface ImageInfo {
  width: number
  height: number
  format: string
  fileSize: number
  colorDepth?: number
  hasAlpha?: boolean
  dpi?: number
}