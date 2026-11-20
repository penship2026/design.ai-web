// 系统配置文件
// 管理AI模型参数、系统设置、导出格式等

export const aiConfig = {
  // AI模型配置
  model: 'mock-model', // 当前使用的AI模型
  responseDelay: 1500, // AI响应延迟时间（毫秒）
  maxHistory: 100, // 最大历史记录数
  enableAutoSave: true // 是否自动保存历史记录
}

export const exportConfig = {
  // 导出配置
  defaultFormat: 'html', // 默认导出格式
  formats: ['html', 'vue', 'zip'], // 支持的导出格式
  zipFilename: 'design-export', // ZIP导出文件名前缀
  htmlFilename: 'index', // HTML导出文件名前缀
  vueFilename: 'DesignComponent' // Vue组件导出文件名前缀
}

export const previewConfig = {
  // 预览配置
  defaultSize: 'desktop', // 默认预览尺寸
  sizes: {
    mobile: { width: '375px', height: '667px', name: '移动端' },
    tablet: { width: '768px', height: '1024px', name: '平板端' },
    desktop: { width: '100%', height: '100%', name: '桌面端' }
  },
  backgroundColor: '#f5f5f5', // 预览背景色
  enableResponsive: true // 是否启用响应式预览
}

export const systemConfig = {
  // 系统配置
  appName: '前端设计系统', // 应用名称
  version: '1.0.0', // 版本号
  enableLocalStorage: true, // 是否启用本地存储
  storagePrefix: 'design-system_', // 本地存储前缀
  debug: true // 是否启用调试模式
}
