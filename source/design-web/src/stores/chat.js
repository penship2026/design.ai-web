import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    currentDesign: null,
    history: []
  }),
  actions: {
    addMessage(message) {
      this.messages.push(message)
      this.saveToLocalStorage()
    },
    clearMessages() {
      this.messages = []
      this.saveToLocalStorage()
    },
    setCurrentDesign(designData) {
      this.currentDesign = designData
      if (designData) {
        this.history.unshift({
          id: Date.now().toString(),
          name: `设计方案 ${new Date().toLocaleString()}`,
          designData: designData,
          createdAt: Date.now()
        })
        if (this.history.length > 10) {
          this.history.pop()
        }
        this.saveToLocalStorage()
      }
    },
    loadFromHistory(designId) {
      const design = this.history.find(item => item.id === designId)
      if (design) {
        this.currentDesign = design.designData
      }
    },
    deleteFromHistory(designId) {
      this.history = this.history.filter(item => item.id !== designId)
      this.saveToLocalStorage()
    },
    saveToLocalStorage() {
      try {
        localStorage.setItem('chatMessages', JSON.stringify(this.messages))
        localStorage.setItem('currentDesign', JSON.stringify(this.currentDesign))
        localStorage.setItem('designHistory', JSON.stringify(this.history))
      } catch (error) {
        console.error('保存到本地存储失败:', error)
      }
    },
    loadFromLocalStorage() {
      try {
        const messages = localStorage.getItem('chatMessages')
        const currentDesign = localStorage.getItem('currentDesign')
        const designHistory = localStorage.getItem('designHistory')

        if (messages) {
          this.messages = JSON.parse(messages)
        }
        if (currentDesign) {
          this.currentDesign = JSON.parse(currentDesign)
        }
        if (designHistory) {
          this.history = JSON.parse(designHistory)
        }
      } catch (error) {
        console.error('从本地存储加载失败:', error)
      }
    }
  }
})