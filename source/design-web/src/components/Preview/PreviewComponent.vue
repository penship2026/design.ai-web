<template>
  <div class="preview-container">
    <div class="preview-header">
      <h3>设计预览</h3>
      <div class="preview-controls">
        <el-radio-group v-model="currentSize" size="small">
          <el-radio-button label="mobile">移动端</el-radio-button>
          <el-radio-button label="tablet">平板端</el-radio-button>
          <el-radio-button label="desktop">桌面端</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div class="preview-content">
      <div 
        class="preview-frame"
        :class="currentSize"
        :style="{ width: previewSizes[currentSize].width }"
      >
        <iframe 
          ref="previewIframe"
          :style="{ height: previewSizes[currentSize].height }"
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useChatStore } from '../../stores/chat'
import { ElMessage } from 'element-plus'
import { previewConfig } from '../../config/config'

const chatStore = useChatStore()
const currentSize = ref(previewConfig.defaultSize)
const previewIframe = ref(null)

// 预览尺寸配置
const previewSizes = computed(() => previewConfig.sizes)

// 监听设计数据变化，更新预览
watch(() => chatStore.currentDesign, (newDesign) => {
  if (newDesign) {
    updatePreview(newDesign)
  }
}, { immediate: true, deep: true })

// 监听预览尺寸变化
watch(currentSize, () => {
  if (chatStore.currentDesign) {
    updatePreview(chatStore.currentDesign)
  }
})

// 创建HTML页面内容
const createHtmlContent = (designData) => {
  // 使用字符串连接，将HTML标签拆分为更小的部分，避免Vue模板解析问题
  let html = ''
  
  // DOCTYPE和html标签
  html += '<!DOCTYPE html>' + '\n'
  html += '<' + 'html lang="zh-CN">' + '\n'
  
  // head部分
  html += '<' + 'head>' + '\n'
  html += '  <' + 'meta charset="UTF-8">' + '\n'
  html += '  <' + 'meta name="viewport" content="width=device-width, initial-scale=1.0">' + '\n'
  html += '  <' + 'title>设计预览<' + '/title>' + '\n'
  html += '  <' + 'style>' + designData.css + '<' + '/style>' + '\n'
  html += '<' + '/head>' + '\n'
  
  // body部分
  html += '<' + 'body>' + '\n'
  html += designData.html + '\n'
  html += '  <' + 'script>' + designData.js + '<' + '/script>' + '\n'
  html += '<' + '/body>' + '\n'
  html += '<' + '/html>' + '\n'
  
  return html
}

// 更新预览内容
const updatePreview = (designData) => {
  if (!previewIframe.value || !designData) return

  try {
    const iframeDoc = previewIframe.value.contentDocument || previewIframe.value.contentWindow.document
    
    const fullHtml = createHtmlContent(designData)
    
    // 更新iframe内容
    iframeDoc.open()
    iframeDoc.write(fullHtml)
    iframeDoc.close()
    
  } catch (error) {
    console.error('预览更新失败:', error)
    ElMessage.error('预览更新失败，请检查设计代码')
  }
}

// 创建占位符HTML内容
const createPlaceholderHtml = () => {
  let html = ''
  
  // DOCTYPE和html标签
  html += '<!DOCTYPE html>' + '\n'
  html += '<' + 'html lang="zh-CN">' + '\n'
  
  // head部分
  html += '<' + 'head>' + '\n'
  html += '  <' + 'meta charset="UTF-8">' + '\n'
  html += '  <' + 'meta name="viewport" content="width=device-width, initial-scale=1.0">' + '\n'
  html += '  <' + 'title>设计预览<' + '/title>' + '\n'
  html += '  <' + 'style>' + '\n'
  html += '    body {' + '\n'
  html += '      display: flex;' + '\n'
  html += '      justify-content: center;' + '\n'
  html += '      align-items: center;' + '\n'
  html += '      height: 100vh;' + '\n'
  html += '      margin: 0;' + '\n'
  html += '      background-color: #f5f5f5;' + '\n'
  html += '      font-family: Arial, sans-serif;' + '\n'
  html += '      color: #666;' + '\n'
  html += '    }' + '\n'
  html += '    .placeholder {' + '\n'
  html += '      text-align: center;' + '\n'
  html += '      padding: 2rem;' + '\n'
  html += '      border: 2px dashed #ddd;' + '\n'
  html += '      border-radius: 8px;' + '\n'
  html += '      background-color: white;' + '\n'
  html += '    }' + '\n'
  html += '  <' + '/style>' + '\n'
  html += '<' + '/head>' + '\n'
  
  // body部分
  html += '<' + 'body>' + '\n'
  html += '  <' + 'div class="placeholder">' + '\n'
  html += '    <' + 'h3>请在左侧输入设计需求<' + '/h3>' + '\n'
  html += '    <' + 'p>AI将为您生成设计方案，右侧将实时显示预览效果<' + '/p>' + '\n'
  html += '  <' + '/div>' + '\n'
  html += '<' + '/body>' + '\n'
  html += '<' + '/html>' + '\n'
  
  return html
}

// 初始化预览
onMounted(() => {
  if (chatStore.currentDesign) {
    updatePreview(chatStore.currentDesign)
  } else {
    // 显示提示信息
    if (previewIframe.value) {
      const iframeDoc = previewIframe.value.contentDocument || previewIframe.value.contentWindow.document
      
      const placeholderHtml = createPlaceholderHtml()
      
      iframeDoc.open()
      iframeDoc.write(placeholderHtml)
      iframeDoc.close()
    }
  }
})
</script>

<style scoped>
.preview-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e0e0e0;
  overflow: hidden;
}

.preview-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.preview-content {
  flex: 1;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: auto;
  background-color: #f9f9f9;
}

.preview-frame {
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-width: 100%;
  transition: width 0.3s ease;
}

.preview-frame.mobile {
  width: 375px;
  height: 667px;
  margin-top: 2rem;
}

.preview-frame.tablet {
  width: 768px;
  height: 1024px;
  margin-top: 2rem;
}

.preview-frame.desktop {
  width: 100%;
  height: 100%;
}

.preview-frame iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}
</style>
