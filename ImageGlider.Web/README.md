# ImageGlider Web

基于 Vue 3 + Vite + TypeScript + Element Plus 的现代图片处理 Web 应用。

## 功能特性

- 🖼️ **图片裁剪** - 精确裁剪、中心裁剪、按比例裁剪
- 📏 **图片缩放** - 智能缩放、生成缩略图
- 🏷️ **添加水印** - 文字水印、图片水印
- 🔄 **格式转换** - 支持 JPG、PNG、WebP、GIF、BMP、TIFF 等格式
- 🗜️ **图片压缩** - 无损压缩，减小文件体积
- 🎨 **颜色调整** - 亮度、对比度、饱和度、色相调整
- ℹ️ **图片信息** - 查看详细的图片属性和元数据
- 🧹 **元数据处理** - 清理敏感的EXIF、XMP等信息
- 🌙 **主题切换** - 支持亮色/暗色主题切换
- 📱 **响应式设计** - 完美适配桌面和移动端

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 现代前端构建工具
- **TypeScript** - JavaScript 的超集
- **Element Plus** - Vue 3 UI 组件库
- **Axios** - HTTP 客户端
- **Pinia** - Vue 状态管理
- **Vue Router** - 官方路由管理器

## 快速开始

### 环境要求

- Node.js 16.0+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
src/
├── api/              # API 服务层
├── assets/           # 静态资源
├── components/       # 公共组件
├── router/           # 路由配置
├── stores/           # 状态管理
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
├── views/            # 页面组件
├── App.vue           # 根组件
└── main.ts           # 入口文件
```

## API 接口

项目通过 Axios 与后端 ImageGlider API 通信，支持以下功能：

- 图片裁剪 (`/api/crop/*`)
- 图片缩放 (`/api/resize/*`)
- 添加水印 (`/api/watermark/*`)
- 格式转换 (`/api/convert`)
- 图片压缩 (`/api/compress`)
- 颜色调整 (`/api/color/adjust`)
- 图片信息 (`/api/info`)
- 元数据处理 (`/api/metadata/strip`)
- 文件下载 (`/api/downloads/*`)

## 浏览器支持

- Chrome 88+
- Firefox 78+
- Safari 14+
- Edge 88+

## 开源协议

MIT License

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 联系方式

如有问题或建议，请通过 GitHub Issues 联系我们。