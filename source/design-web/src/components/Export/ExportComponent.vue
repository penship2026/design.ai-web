<template>
  <div class="export-container">
    <div class="export-header">
      <h3>代码导出</h3>
    </div>
    <div class="export-content">
      <el-alert
        :title="exportTips"
        type="info"
        :closable="false"
        :show-icon="true"
      ></el-alert>
      
      <div class="export-formats">
        <el-radio-group v-model="selectedFormat" size="medium">
          <el-radio-button label="html">导出HTML文件</el-radio-button>
          <el-radio-button label="vue">导出Vue组件</el-radio-button>
          <el-radio-button label="zip">导出ZIP包</el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="export-options" v-if="selectedFormat !== 'html'">
        <el-form label-position="left" label-width="80px" size="small">
          <el-form-item label="文件名：">
            <el-input 
              v-model="fileName" 
              placeholder="请输入文件名" 
              clearable
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="export-action">
        <el-button 
          type="primary" 
          size="large"
          @click="exportCode"
          :loading="isExporting"
          :disabled="!chatStore.currentDesign"
        >
          <el-icon><Download /></el-icon>
          {{ exportButtonText }}
        </el-button>
        
        <el-button 
          size="large"
          @click="copyCode"
          :loading="isCopying"
          :disabled="!chatStore.currentDesign"
        >
          <el-icon><DocumentCopy /></el-icon>
          复制代码
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useChatStore } from '../../stores/chat'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, DocumentCopy } from '@element-plus/icons-vue'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import { exportConfig } from '../../config/config'

const chatStore = useChatStore()
const selectedFormat = ref(exportConfig.defaultFormat)
const fileName = ref('')
const isExporting = ref(false)
const isCopying = ref(false)

// 导出提示信息
const exportTips = computed(() => {
  if (!chatStore.currentDesign) {
    return '请先生成设计方案，然后再进行导出操作'
  }
  return '选择导出格式，点击导出按钮获取代码'
})

// 导出按钮文本
const exportButtonText = computed(() => {
  const formatText = {
    html: '导出HTML文件',
    vue: '导出Vue组件',
    zip: '导出ZIP包'
  }
  return formatText[selectedFormat.value] || '导出代码'
})

// 监听导出格式变化，更新默认文件名
watch(selectedFormat, (newFormat) => {
  updateDefaultFileName(newFormat)
})

// 更新默认文件名
const updateDefaultFileName = (format) => {
  const prefixes = {
    html: exportConfig.htmlFilename,
    vue: exportConfig.vueFilename,
    zip: exportConfig.zipFilename
  }
  const extensions = {
    html: '.html',
    vue: '.vue',
    zip: '.zip'
  }
  fileName.value = `${prefixes[format]}${extensions[format]}`
}

// 导出代码
const exportCode = async () => {
  if (!chatStore.currentDesign) {
    ElMessage.warning('请先生成设计方案')
    return
  }

  if (!fileName.value.trim()) {
    ElMessage.warning('请输入文件名')
    return
  }

  isExporting.value = true

  try {
    const designData = chatStore.currentDesign
    const format = selectedFormat.value

    switch (format) {
      case 'html':
        await exportAsHtml(designData, fileName.value)
        break
      case 'vue':
        await exportAsVue(designData, fileName.value)
        break
      case 'zip':
        await exportAsZip(designData, fileName.value)
        break
      default:
        ElMessage.error('不支持的导出格式')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  } finally {
    isExporting.value = false
  }
}

// 导出为HTML文件
const exportAsHtml = (designData, filename) => {
  // 使用字符串连接，将HTML标签拆分为更小的部分，避免Vue模板解析问题
  let fullHtml = ''
  
  fullHtml += '<!DOCTYPE html>' + '\n'
  fullHtml += '<' + 'html lang="zh-CN">' + '\n'
  fullHtml += '<' + 'head>' + '\n'
  fullHtml += '  <' + 'meta charset="UTF-8">' + '\n'
  fullHtml += '  <' + 'meta name="viewport" content="width=device-width, initial-scale=1.0">' + '\n'
  fullHtml += '  <' + 'title>设计导出<' + '/title>' + '\n'
  fullHtml += '  <' + 'style>' + '\n'
  fullHtml += '    ' + designData.css + '\n'
  fullHtml += '  <' + '/style>' + '\n'
  fullHtml += '<' + '/head>' + '\n'
  fullHtml += '<' + 'body>' + '\n'
  fullHtml += '  ' + designData.html + '\n'
  fullHtml += '  <' + 'script>' + '\n'
  fullHtml += '    ' + designData.js + '\n'
  fullHtml += '  <' + '/script>' + '\n'
  fullHtml += '<' + '/body>' + '\n'
  fullHtml += '<' + '/html>' + '\n'

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
  saveAs(blob, filename)
  ElMessage.success('HTML文件导出成功')
}

// 导出为Vue组件
const exportAsVue = (designData, filename) => {
  // 使用字符串连接，将Vue模板标签拆分为更小的部分，避免Vue模板解析问题
  let vueComponent = ''
  
  vueComponent += '<' + 'template>' + '\n'
  vueComponent += '  <' + 'div class="design-component">' + '\n'
  vueComponent += '    ' + designData.html + '\n'
  vueComponent += '  <' + '/div>' + '\n'
  vueComponent += '<' + '/template>' + '\n\n'
  
  vueComponent += '<' + 'script setup>' + '\n'
  vueComponent += '// Vue组件逻辑' + '\n'
  vueComponent += 'import { onMounted } from \'vue\'' + '\n\n'
  vueComponent += 'onMounted(() => {' + '\n'
  vueComponent += '  ' + designData.js.replace('document.addEventListener(\'DOMContentLoaded\', () => {', '').replace('});', '') + '\n'
  vueComponent += '})' + '\n'
  vueComponent += '<' + '/script>' + '\n\n'
  
  vueComponent += '<' + 'style scoped>' + '\n'
  vueComponent += designData.css + '\n'
  vueComponent += '<' + '/style>' + '\n'

  const blob = new Blob([vueComponent], { type: 'text/vue;charset=utf-8' })
  saveAs(blob, filename)
  ElMessage.success('Vue组件导出成功')
}

// 导出为ZIP包
const exportAsZip = async (designData, filename) => {
  const zip = new JSZip()
  
  // 使用字符串连接，将HTML标签拆分为更小的部分，避免Vue模板解析问题
  let htmlContent = ''
  htmlContent += '<!DOCTYPE html>' + '\n'
  htmlContent += '<' + 'html lang="zh-CN">' + '\n'
  htmlContent += '<' + 'head>' + '\n'
  htmlContent += '  <' + 'meta charset="UTF-8">' + '\n'
  htmlContent += '  <' + 'meta name="viewport" content="width=device-width, initial-scale=1.0">' + '\n'
  htmlContent += '  <' + 'title>设计导出<' + '/title>' + '\n'
  htmlContent += '  <' + 'link rel="stylesheet" href="styles.css">' + '\n'
  htmlContent += '<' + '/head>' + '\n'
  htmlContent += '<' + 'body>' + '\n'
  htmlContent += '  ' + designData.html + '\n'
  htmlContent += '  <' + 'script src="script.js"><' + '/script>' + '\n'
  htmlContent += '<' + '/body>' + '\n'
  htmlContent += '<' + '/html>' + '\n'
  
  // 添加HTML文件
  zip.file('index.html', htmlContent)
  
  // 添加CSS文件
  zip.file('styles.css', designData.css)
  
  // 添加JS文件
  zip.file('script.js', designData.js)
  
  // 生成ZIP并下载
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, filename)
  ElMessage.success('ZIP包导出成功')
}

// 复制代码到剪贴板
const copyCode = async () => {
  if (!chatStore.currentDesign) {
    ElMessage.warning('请先生成设计方案')
    return
  }

  isCopying.value = true

  try {
    const designData = chatStore.currentDesign
    let copyContent = ''

    switch (selectedFormat.value) {
      case 'html':
        // 使用字符串连接，将HTML标签拆分为更小的部分，避免Vue模板解析问题
        copyContent = ''
        copyContent += '<!DOCTYPE html>' + '\n'
        copyContent += '<' + 'html lang="zh-CN">' + '\n'
        copyContent += '<' + 'head>' + '\n'
        copyContent += '  <' + 'meta charset="UTF-8">' + '\n'
        copyContent += '  <' + 'meta name="viewport" content="width=device-width, initial-scale=1.0">' + '\n'
        copyContent += '  <' + 'title>设计导出<' + '/title>' + '\n'
        copyContent += '  <' + 'style>' + '\n'
        copyContent += designData.css + '\n'
        copyContent += '  <' + '/style>' + '\n'
        copyContent += '<' + '/head>' + '\n'
        copyContent += '<' + 'body>' + '\n'
        copyContent += designData.html + '\n'
        copyContent += '  <' + 'script>' + '\n'
        copyContent += designData.js + '\n'
        copyContent += '  <' + '/script>' + '\n'
        copyContent += '<' + '/body>' + '\n'
        copyContent += '<' + '/html>' + '\n'
        break
      case 'vue':
        // 使用字符串连接，将Vue模板标签拆分为更小的部分，避免Vue模板解析问题
        copyContent = ''
        copyContent += '<' + 'template>' + '\n'
        copyContent += '  <' + 'div class="design-component">' + '\n'
        copyContent += designData.html + '\n'
        copyContent += '  <' + '/div>' + '\n'
        copyContent += '<' + '/template>' + '\n\n'
        copyContent += '<' + 'script setup>' + '\n'
        copyContent += '// Vue组件逻辑' + '\n'
        copyContent += 'import { onMounted } from \'vue\'' + '\n\n'
        copyContent += 'onMounted(() => {' + '\n'
        copyContent += '  ' + designData.js.replace('document.addEventListener(\'DOMContentLoaded\', () => {', '').replace('});', '') + '\n'
        copyContent += '})' + '\n'
        copyContent += '<' + '/script>' + '\n\n'
        copyContent += '<' + 'style scoped>' + '\n'
        copyContent += designData.css + '\n'
        copyContent += '<' + '/style>' + '\n'
        break
      default:
        copyContent = 'HTML:\n'
        copyContent += designData.html + '\n\n'
        copyContent += 'CSS:\n'
        copyContent += designData.css + '\n\n'
        copyContent += 'JavaScript:\n'
        copyContent += designData.js
    }

    // 使用Clipboard API复制
    await navigator.clipboard.writeText(copyContent)
    ElMessage.success('代码已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败，请手动复制')
  } finally {
    isCopying.value = false
  }
}

// 初始化默认文件名
updateDefaultFileName(selectedFormat.value)
</script>

<style scoped>
.export-container {
  height: 200px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.export-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa;
}

.export-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.export-content {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
}

.export-formats {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}

.export-options {
  padding: 0.5rem 0;
}

.export-action {
  margin-top: auto;
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 0.5rem 0;
}

.el-alert {
  margin-bottom: 0;
}
</style>
