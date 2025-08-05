<template>
  <div class="home-page">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">欢迎使用 ImageGlider</h1>
        <p class="welcome-description">
          功能强大的在线图片处理工具，支持裁剪、缩放、水印、格式转换等多种操作
        </p>
      </div>
      <div class="welcome-image">
        <el-icon :size="120" class="hero-icon">
          <Picture />
        </el-icon>
      </div>
    </div>

    <!-- 功能卡片区域 -->
    <div class="features-section">
      <h2 class="section-title">主要功能</h2>
      <div class="features-grid">
        <div
          v-for="feature in features"
          :key="feature.name"
          class="feature-card custom-card"
          @click="navigateTo(feature.route)"
        >
          <div class="feature-icon">
            <el-icon :size="48">
              <component :is="feature.icon" />
            </el-icon>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </div>

    <!-- 特色亮点 -->
    <div class="highlights-section">
      <h2 class="section-title">为什么选择 ImageGlider</h2>
      <div class="highlights-grid">
        <div
          v-for="highlight in highlights"
          :key="highlight.title"
          class="highlight-item"
        >
          <el-icon :size="32" class="highlight-icon">
            <component :is="highlight.icon" />
          </el-icon>
          <h3 class="highlight-title">{{ highlight.title }}</h3>
          <p class="highlight-description">{{ highlight.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  Picture,
  Crop,
  FullScreen,
  Stamp,
  Switch,
  Compressed,
  Brush,
  View,
  Document,
  Lightning,
  Lock,
  CloudUpload,
  Tools
} from '@element-plus/icons-vue'

const router = useRouter()

const features = [
  {
    name: 'crop',
    title: '图片裁剪',
    description: '精确裁剪、中心裁剪、按比例裁剪',
    icon: Crop,
    route: 'ImageCrop'
  },
  {
    name: 'resize',
    title: '图片缩放',
    description: '智能缩放、生成缩略图',
    icon: FullScreen,
    route: 'ImageResize'
  },
  {
    name: 'watermark',
    title: '添加水印',
    description: '文字水印、图片水印',
    icon: Stamp,
    route: 'ImageWatermark'
  },
  {
    name: 'convert',
    title: '格式转换',
    description: '支持多种图片格式互转',
    icon: Switch,
    route: 'ImageConvert'
  },
  {
    name: 'compress',
    title: '图片压缩',
    description: '无损压缩，减小文件体积',
    icon: Compressed,
    route: 'ImageCompress'
  },
  {
    name: 'color',
    title: '颜色调整',
    description: '亮度、对比度、饱和度调整',
    icon: Brush,
    route: 'ImageColor'
  },
  {
    name: 'info',
    title: '图片信息',
    description: '查看图片详细信息',
    icon: View,
    route: 'ImageInfo'
  },
  {
    name: 'metadata',
    title: '元数据处理',
    description: '清理敏感的元数据信息',
    icon: Document,
    route: 'ImageMetadata'
  }
]

const highlights = [
  {
    title: '高性能处理',
    description: '基于高效的图像处理引擎，快速完成各种操作',
    icon: Lightning
  },
  {
    title: '数据安全',
    description: '所有处理在服务器端完成，保护您的隐私数据',
    icon: Lock
  },
  {
    title: '简单易用',
    description: '直观的界面设计，拖拽上传，一键处理',
    icon: CloudUpload
  },
  {
    title: '功能丰富',
    description: '涵盖图片处理的各种常用功能，满足不同需求',
    icon: Tools
  }
]

const navigateTo = (routeName: string) => {
  router.push({ name: routeName })
}
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 60px;
  padding: 40px 0;
}

.welcome-content {
  flex: 1;
  padding-right: 40px;
}

.welcome-title {
  font-size: 48px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 20px;
  line-height: 1.2;
}

.welcome-description {
  font-size: 18px;
  color: var(--color-text-regular);
  line-height: 1.6;
  margin-bottom: 0;
}

.welcome-image {
  flex-shrink: 0;
}

.hero-icon {
  color: var(--color-primary);
  opacity: 0.8;
}

.section-title {
  font-size: 32px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: center;
  margin-bottom: 40px;
}

.features-section {
  margin-bottom: 80px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.feature-card {
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  margin-bottom: 20px;
}

.feature-icon .el-icon {
  color: var(--color-primary);
}

.feature-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.feature-description {
  font-size: 14px;
  color: var(--color-text-regular);
  line-height: 1.5;
  margin: 0;
}

.highlights-section {
  margin-bottom: 60px;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
}

.highlight-item {
  text-align: center;
  padding: 24px;
}

.highlight-icon {
  color: var(--color-primary);
  margin-bottom: 16px;
}

.highlight-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.highlight-description {
  font-size: 14px;
  color: var(--color-text-regular);
  line-height: 1.5;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    text-align: center;
  }
  
  .welcome-content {
    padding-right: 0;
    margin-bottom: 40px;
  }
  
  .welcome-title {
    font-size: 36px;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .highlights-grid {
    grid-template-columns: 1fr;
  }
}
</style>