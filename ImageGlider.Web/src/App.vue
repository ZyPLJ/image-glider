<template>
  <el-config-provider :locale="locale">
    <div id="app">
      <el-container class="app-container">
        <!-- 顶部导航 -->
        <el-header class="app-header">
          <div class="header-content">
            <div class="logo-section">
              <el-icon :size="32" class="logo-icon">
                <Picture />
              </el-icon>
              <h1 class="app-title">ImageGlider</h1>
            </div>
            
            <div class="header-actions">
              <el-button
                :icon="themeIcon"
                circle
                @click="toggleTheme"
                :title="themeTitle"
              />
            </div>
          </div>
        </el-header>
        
        <!-- 主体内容 -->
        <el-container class="main-container">
          <!-- 侧边栏 -->
          <el-aside width="250px" class="app-aside">
            <el-menu
              :default-active="$route.name as string"
              router
              class="nav-menu"
            >
              <el-menu-item index="Home">
                <el-icon><House /></el-icon>
                <span>首页</span>
              </el-menu-item>
              
              <el-sub-menu index="tools">
                <template #title>
                  <el-icon><Tools /></el-icon>
                  <span>图片处理工具</span>
                </template>
                
                <el-menu-item index="ImageCrop">
                  <el-icon><Crop /></el-icon>
                  <span>图片裁剪</span>
                </el-menu-item>
                
                <el-menu-item index="ImageResize">
                  <el-icon><FullScreen /></el-icon>
                  <span>图片缩放</span>
                </el-menu-item>
                
                <el-menu-item index="ImageWatermark">
                  <el-icon><Stamp /></el-icon>
                  <span>添加水印</span>
                </el-menu-item>
                
                <el-menu-item index="ImageConvert">
                  <el-icon><Switch /></el-icon>
                  <span>格式转换</span>
                </el-menu-item>
                
                <el-menu-item index="ImageCompress">
                  <el-icon><Compressed /></el-icon>
                  <span>图片压缩</span>
                </el-menu-item>
                
                <el-menu-item index="ImageColor">
                  <el-icon><Brush /></el-icon>
                  <span>颜色调整</span>
                </el-menu-item>
              </el-sub-menu>
              
              <el-sub-menu index="info">
                <template #title>
                  <el-icon><InfoFilled /></el-icon>
                  <span>图片信息</span>
                </template>
                
                <el-menu-item index="ImageInfo">
                  <el-icon><View /></el-icon>
                  <span>查看信息</span>
                </el-menu-item>
                
                <el-menu-item index="ImageMetadata">
                  <el-icon><Document /></el-icon>
                  <span>元数据处理</span>
                </el-menu-item>
              </el-sub-menu>
            </el-menu>
          </el-aside>
          
          <!-- 内容区域 -->
          <el-main class="app-main">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </el-main>
        </el-container>
      </el-container>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import {
  Picture,
  House,
  Tools,
  Crop,
  FullScreen,
  Stamp,
  Switch,
  Compressed,
  Brush,
  InfoFilled,
  View,
  Document,
  Sunny,
  Moon,
  Monitor
} from '@element-plus/icons-vue'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const themeStore = useThemeStore()
const locale = zhCn

const themeIcon = computed(() => {
  switch (themeStore.mode) {
    case 'light':
      return Sunny
    case 'dark':
      return Moon
    default:
      return Monitor
  }
})

const themeTitle = computed(() => {
  switch (themeStore.mode) {
    case 'light':
      return '切换到暗色主题'
    case 'dark':
      return '切换到自动主题'
    default:
      return '切换到亮色主题'
  }
})

const toggleTheme = () => {
  themeStore.toggleTheme()
}

onMounted(() => {
  themeStore.loadTheme()
})
</script>

<style scoped>
.app-container {
  min-height: 100vh;
}

.app-header {
  background-color: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  padding: 0;
}

.header-content {
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  color: var(--color-primary);
}

.app-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-container {
  height: calc(100vh - 60px);
}

.app-aside {
  background-color: var(--color-bg);
  border-right: 1px solid var(--color-border);
}

.nav-menu {
  border: none;
  background-color: transparent;
}

.app-main {
  background-color: var(--color-bg-page);
  padding: 24px;
  overflow-y: auto;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  color: var(--color-text-primary);
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: var(--color-border-light);
}

:deep(.el-menu-item.is-active) {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}
</style>