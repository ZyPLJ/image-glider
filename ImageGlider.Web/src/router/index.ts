import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/crop',
    name: 'ImageCrop',
    component: () => import('@/views/ImageCrop.vue'),
    meta: { title: '图片裁剪' }
  },
  {
    path: '/resize',
    name: 'ImageResize', 
    component: () => import('@/views/ImageResize.vue'),
    meta: { title: '图片缩放' }
  },
  {
    path: '/watermark',
    name: 'ImageWatermark',
    component: () => import('@/views/ImageWatermark.vue'),
    meta: { title: '添加水印' }
  },
  {
    path: '/convert',
    name: 'ImageConvert',
    component: () => import('@/views/ImageConvert.vue'),
    meta: { title: '格式转换' }
  },
  {
    path: '/compress',
    name: 'ImageCompress',
    component: () => import('@/views/ImageCompress.vue'),
    meta: { title: '图片压缩' }
  },
  {
    path: '/color',
    name: 'ImageColor',
    component: () => import('@/views/ImageColor.vue'),
    meta: { title: '颜色调整' }
  },
  {
    path: '/info',
    name: 'ImageInfo',
    component: () => import('@/views/ImageInfo.vue'),
    meta: { title: '图片信息' }
  },
  {
    path: '/metadata',
    name: 'ImageMetadata',
    component: () => import('@/views/ImageMetadata.vue'),
    meta: { title: '元数据处理' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 设置页面标题
router.beforeEach((to) => {
  document.title = to.meta?.title ? `${to.meta.title} - ImageGlider` : 'ImageGlider'
})

export default router