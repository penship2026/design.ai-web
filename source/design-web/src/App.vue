<template>
  <div class="app-container">
    <header class="app-header">
      <h1>前端设计系统</h1>
    </header>
    <main class="app-main">
      <div class="left-panel">
        <chat-component />
      </div>
      <div class="right-panel">
        <preview-component />
        <export-component />
      </div>
    </main>
  </div>
</template>

<script setup>
import ChatComponent from './components/Chat/ChatComponent.vue'
import PreviewComponent from './components/Preview/PreviewComponent.vue'
import ExportComponent from './components/Export/ExportComponent.vue'
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
}

.app-header {
  background-color: #1a73e8;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel {
  width: 35%;
  border-right: 1px solid #e0e0e0;
  overflow: hidden;
}

.right-panel {
  width: 65%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>