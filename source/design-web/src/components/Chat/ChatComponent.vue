<template>
  <div class="chat-container">
    <div class="chat-header">
      <h3>设计助手</h3>
    </div>
    <div class="chat-messages" ref="messagesContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message-item', message.type]"
      >
        <div class="message-content">{{ message.content }}</div>
        <div class="message-time">{{ formatTime(message.timestamp) }}</div>
      </div>
    </div>
    <div class="chat-input-area">
      <el-input
        v-model="inputContent"
        type="textarea"
        placeholder="请输入您的设计需求..."
        :rows="3"
        @keyup.enter.ctrl="sendMessage"
      ></el-input>
      <el-button type="primary" @click="sendMessage" :loading="isSending">
        发送
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useChatStore } from '../../stores/chat'
import { ElMessage } from 'element-plus'

const chatStore = useChatStore()
const inputContent = ref('')
const isSending = ref(false)
const messagesContainer = ref(null)

const messages = ref([
  {
    id: '1',
    type: 'ai',
    content: '您好！我是您的设计助手。请告诉我您的设计需求，我将为您生成设计方案。',
    timestamp: Date.now()
  }
])

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString()
}

const sendMessage = async () => {
  if (!inputContent.value.trim()) {
    ElMessage.warning('请输入设计需求')
    return
  }

  const userMessage = {
    id: Date.now().toString(),
    type: 'user',
    content: inputContent.value.trim(),
    timestamp: Date.now()
  }

  messages.value.push(userMessage)
  chatStore.addMessage(userMessage)
  inputContent.value = ''
  scrollToBottom()

  isSending.value = true

  await new Promise(resolve => setTimeout(resolve, 1500))

  const aiResponse = generateAIResponse(userMessage.content)
  messages.value.push(aiResponse)
  chatStore.addMessage(aiResponse)
  chatStore.setCurrentDesign(aiResponse.designData)

  isSending.value = false
  scrollToBottom()
}

// 设计风格模板库
const designTemplates = {
  modern: {
    name: '现代风格',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#ec4899',
      background: '#f9fafb',
      text: '#1f2937',
      textLight: '#6b7280',
      border: '#e5e7eb',
      darkBackground: '#111827',
      darkText: '#f9fafb'
    },
    fonts: {
      body: 'Inter, system-ui, sans-serif',
      heading: 'Montserrat, system-ui, sans-serif'
    },
    description: '现代风格设计，采用鲜明的色彩对比和流畅的动画效果，适合创意类网站。'
  },
  minimalist: {
    name: '简约风格',
    colors: {
      primary: '#14b8a6',
      secondary: '#0f766e',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#111827',
      textLight: '#6b7280',
      border: '#f3f4f6',
      darkBackground: '#111827',
      darkText: '#f9fafb'
    },
    fonts: {
      body: 'Helvetica Neue, Arial, sans-serif',
      heading: 'Helvetica Neue, Arial, sans-serif'
    },
    description: '简约风格设计，注重留白和内容的层次感，适合内容导向型网站。'
  },
  business: {
    name: '商务风格',
    colors: {
      primary: '#0f172a',
      secondary: '#334155',
      accent: '#3b82f6',
      background: '#ffffff',
      text: '#1e293b',
      textLight: '#64748b',
      border: '#e2e8f0',
      darkBackground: '#030712',
      darkText: '#f9fafb'
    },
    fonts: {
      body: 'Roboto, system-ui, sans-serif',
      heading: 'Roboto Slab, system-ui, sans-serif'
    },
    description: '商务风格设计，采用专业的配色方案和清晰的信息层级，适合企业官网。'
  },
  creative: {
    name: '创意风格',
    colors: {
      primary: '#ec4899',
      secondary: '#8b5cf6',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#111827',
      textLight: '#6b7280',
      border: '#f3f4f6',
      darkBackground: '#111827',
      darkText: '#f9fafb'
    },
    fonts: {
      body: 'Poppins, system-ui, sans-serif',
      heading: 'Playfair Display, system-ui, serif'
    },
    description: '创意风格设计，采用大胆的色彩搭配和独特的排版，适合艺术、设计类网站。'
  },
  tech: {
    name: '科技风格',
    colors: {
      primary: '#06b6d4',
      secondary: '#3b82f6',
      accent: '#10b981',
      background: '#0f172a',
      text: '#f8fafc',
      textLight: '#94a3b8',
      border: '#334155',
      darkBackground: '#030712',
      darkText: '#f9fafb'
    },
    fonts: {
      body: 'Space Grotesk, system-ui, sans-serif',
      heading: 'Space Mono, system-ui, monospace'
    },
    description: '科技风格设计，采用深色背景和荧光色调，营造未来科技感，适合科技公司和软件产品网站。'
  },
  retro: {
    name: '复古风格',
    colors: {
      primary: '#e63946',
      secondary: '#457b9d',
      accent: '#f1faee',
      background: '#f1faee',
      text: '#1d3557',
      textLight: '#457b9d',
      border: '#a8dadc',
      darkBackground: '#1d3557',
      darkText: '#f1faee'
    },
    fonts: {
      body: 'Merriweather, serif',
      heading: 'Playfair Display, serif'
    },
    description: '复古风格设计，采用经典的配色和优雅的排版，营造怀旧氛围，适合传统品牌和文化类网站。'
  }
}

// 分析用户输入，提取设计需求关键词
const analyzeUserInput = (userInput) => {
  const requirements = {
    style: 'modern',
    hasHero: true,
    hasFeatures: true,
    hasServices: false,
    hasAbout: false,
    hasContact: false,
    hasFooter: true,
    hasTestimonials: false,
    hasPortfolio: false,
    hasTeam: false,
    hasBlog: false,
    responsive: true,
    animation: false,
    darkMode: false,
    colorScheme: null,
    targetAudience: null
  }

  const lowerInput = userInput.toLowerCase()

  // 检测风格关键词
  if (lowerInput.includes('简约') || lowerInput.includes('简洁') || lowerInput.includes('minimalist')) {
    requirements.style = 'minimalist'
  } else if (lowerInput.includes('商务') || lowerInput.includes('企业') || lowerInput.includes('business') || lowerInput.includes('corporate')) {
    requirements.style = 'business'
  } else if (lowerInput.includes('创意') || lowerInput.includes('creative') || lowerInput.includes('艺术')) {
    requirements.style = 'creative'
  } else if (lowerInput.includes('科技') || lowerInput.includes('tech') || lowerInput.includes('科技感')) {
    requirements.style = 'tech'
  } else if (lowerInput.includes('现代') || lowerInput.includes('modern')) {
    requirements.style = 'modern'
  } else if (lowerInput.includes('复古') || lowerInput.includes('retro') || lowerInput.includes('怀旧')) {
    requirements.style = 'retro'
  }

  // 检测组件需求
  if (lowerInput.includes('服务') || lowerInput.includes('services') || lowerInput.includes('products') || lowerInput.includes('产品')) {
    requirements.hasServices = true
  }
  if (lowerInput.includes('关于') || lowerInput.includes('about') || lowerInput.includes('公司') || lowerInput.includes('企业介绍')) {
    requirements.hasAbout = true
  }
  if (lowerInput.includes('联系') || lowerInput.includes('contact') || lowerInput.includes('联系方式')) {
    requirements.hasContact = true
  }
  if (lowerInput.includes('动画') || lowerInput.includes('动效') || lowerInput.includes('animation') || lowerInput.includes('transition')) {
    requirements.animation = true
  }
  if (lowerInput.includes('响应式') || lowerInput.includes('responsive') || lowerInput.includes('适配') || lowerInput.includes('多设备')) {
    requirements.responsive = true
  }
  if (lowerInput.includes('深色') || lowerInput.includes('dark') || lowerInput.includes('暗色')) {
    requirements.darkMode = true
  }
  if (lowerInput.includes('用户评价') || lowerInput.includes('testimonials') || lowerInput.includes('客户反馈')) {
    requirements.hasTestimonials = true
  }
  if (lowerInput.includes('作品集') || lowerInput.includes('portfolio') || lowerInput.includes('案例')) {
    requirements.hasPortfolio = true
  }
  if (lowerInput.includes('团队') || lowerInput.includes('team') || lowerInput.includes('成员')) {
    requirements.hasTeam = true
  }
  if (lowerInput.includes('博客') || lowerInput.includes('blog') || lowerInput.includes('文章')) {
    requirements.hasBlog = true
  }
  if (lowerInput.includes('无响应式') || lowerInput.includes('固定布局')) {
    requirements.responsive = false
  }

  // 检测配色方案需求
  if (lowerInput.includes('蓝色') || lowerInput.includes('blue')) {
    requirements.colorScheme = 'blue'
  } else if (lowerInput.includes('绿色') || lowerInput.includes('green')) {
    requirements.colorScheme = 'green'
  } else if (lowerInput.includes('红色') || lowerInput.includes('red')) {
    requirements.colorScheme = 'red'
  } else if (lowerInput.includes('紫色') || lowerInput.includes('purple')) {
    requirements.colorScheme = 'purple'
  }

  // 检测目标受众
  if (lowerInput.includes('年轻人') || lowerInput.includes('青年') || lowerInput.includes('young')) {
    requirements.targetAudience = 'young'
  } else if (lowerInput.includes('企业') || lowerInput.includes('business') || lowerInput.includes('corporate')) {
    requirements.targetAudience = 'business'
  } else if (lowerInput.includes('儿童') || lowerInput.includes('kids') || lowerInput.includes('child')) {
    requirements.targetAudience = 'kids'
  } else if (lowerInput.includes('高端') || lowerInput.includes('luxury') || lowerInput.includes('premium')) {
    requirements.targetAudience = 'luxury'
  }

  // 根据目标受众调整设计风格
  if (requirements.targetAudience && !userInput.includes('风格') && !userInput.includes('style')) {
    if (requirements.targetAudience === 'young') {
      requirements.style = 'creative'
    } else if (requirements.targetAudience === 'business') {
      requirements.style = 'business'
    } else if (requirements.targetAudience === 'kids') {
      requirements.style = 'creative'
      requirements.animation = true
    } else if (requirements.targetAudience === 'luxury') {
      requirements.style = 'modern'
    }
  }

  return requirements
}

// 生成HTML代码
const generateHtml = (template, requirements) => {
  const { hasHero, hasFeatures, hasServices, hasAbout, hasContact, hasFooter, hasTestimonials, hasPortfolio, hasTeam, hasBlog, darkMode } = requirements
  let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI生成设计方案</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${template.fonts.body.split(',')[0].replace(/\s+/g, '+')}&family=${template.fonts.heading.split(',')[0].replace(/\s+/g, '+')}:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body class="${darkMode ? 'dark-mode' : ''}">
  <header class="header">
    <div class="container">
      <h1 class="logo">网站标题</h1>
      <nav class="nav">
        <a href="#" class="nav-link">首页</a>
        ${hasAbout ? '<a href="#about" class="nav-link">关于我们</a>' : ''}
        ${hasServices ? '<a href="#services" class="nav-link">服务</a>' : ''}
        ${hasFeatures ? '<a href="#features" class="nav-link">功能</a>' : ''}
        ${hasPortfolio ? '<a href="#portfolio" class="nav-link">作品</a>' : ''}
        ${hasTeam ? '<a href="#team" class="nav-link">团队</a>' : ''}
        ${hasBlog ? '<a href="#blog" class="nav-link">博客</a>' : ''}
        ${hasContact ? '<a href="#contact" class="nav-link">联系我们</a>' : ''}
        ${darkMode ? '<button class="theme-toggle" id="themeToggle">🌙</button>' : ''}
      </nav>
    </div>
  </header>

  <main class="main">`

  if (hasHero) {
    html += `
    <section class="hero">
      <div class="container">
        <h2 class="hero-title">欢迎来到我们的网站</h2>
        <p class="hero-subtitle">这是一个由AI生成的响应式设计方案</p>
        <button class="btn btn-primary" id="cta-btn">了解更多</button>
        ${hasPortfolio ? '<button class="btn btn-secondary" id="portfolioBtn">查看作品</button>' : ''}
      </div>
    </section>`
  }

  if (hasFeatures) {
    html += `
    <section class="features" id="features">
      <div class="container">
        <h3 class="section-title">核心功能</h3>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h4 class="feature-title">精准定位</h4>
            <p class="feature-description">基于用户需求的精准设计方案，满足各种业务场景。</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🚀</div>
            <h4 class="feature-title">快速响应</h4>
            <p class="feature-description">响应式设计，确保在各种设备上都能完美展示。</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h4 class="feature-title">精美设计</h4>
            <p class="feature-description">专业的设计团队，打造视觉冲击力强的界面。</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💡</div>
            <h4 class="feature-title">创新思维</h4>
            <p class="feature-description">不断创新的设计理念，引领行业潮流。</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔧</div>
            <h4 class="feature-title">专业技术</h4>
            <p class="feature-description">使用最先进的技术栈，确保网站性能卓越。</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🤝</div>
            <h4 class="feature-title">优质服务</h4>
            <p class="feature-description">完善的售后服务，让您无后顾之忧。</p>
          </div>
        </div>
      </div>
    </section>`
  }

  if (hasServices) {
    html += `
    <section class="services" id="services">
      <div class="container">
        <h3 class="section-title">我们的服务</h3>
        <div class="services-grid">
          <div class="service-card">
            <div class="service-icon">🌐</div>
            <h4 class="service-title">网站设计</h4>
            <p class="service-description">专业的网站设计服务，打造符合品牌形象的网站。</p>
          </div>
          <div class="service-card">
            <div class="service-icon">📱</div>
            <h4 class="service-title">移动端开发</h4>
            <p class="service-description">响应式网站和移动应用开发，满足多平台需求。</p>
          </div>
          <div class="service-card">
            <div class="service-icon">🎨</div>
            <h4 class="service-title">UI/UX设计</h4>
            <p class="service-description">用户体验设计，提升产品易用性和用户满意度。</p>
          </div>
          <div class="service-card">
            <div class="service-icon">🔍</div>
            <h4 class="service-title">SEO优化</h4>
            <p class="service-description">搜索引擎优化，提高网站在搜索引擎中的排名。</p>
          </div>
          <div class="service-card">
            <div class="service-icon">📊</div>
            <h4 class="service-title">数据分析</h4>
            <p class="service-description">网站数据分析，帮助您了解用户行为和需求。</p>
          </div>
          <div class="service-card">
            <div class="service-icon">🛡️</div>
            <h4 class="service-title">网站维护</h4>
            <p class="service-description">网站维护和更新服务，确保网站安全稳定运行。</p>
          </div>
        </div>
      </div>
    </section>`
  }

  if (hasAbout) {
    html += `
    <section class="about" id="about">
      <div class="container">
        <h3 class="section-title">关于我们</h3>
        <div class="about-content">
          <div class="about-text">
            <p>我们是一家专业的设计开发团队，致力于为客户提供高质量的解决方案。</p>
            <p>自成立以来，我们已经为数百名客户提供了优质的服务，涵盖各个行业。</p>
            <p>我们拥有丰富的行业经验和专业的技术团队，可以满足您的各种需求。</p>
            <p>我们的使命是通过创新的设计和技术，帮助客户实现业务增长和价值最大化。</p>
          </div>
          <div class="about-stats">
            <div class="stat-item">
              <div class="stat-number">5+</div>
              <div class="stat-label">年经验</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">100+</div>
              <div class="stat-label">客户</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">200+</div>
              <div class="stat-label">项目</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">95%</div>
              <div class="stat-label">满意度</div>
            </div>
          </div>
        </div>
      </div>
    </section>`
  }

  if (hasPortfolio) {
    html += `
    <section class="portfolio" id="portfolio">
      <div class="container">
        <h3 class="section-title">精选作品</h3>
        <div class="portfolio-grid">
          <div class="portfolio-item">
            <div class="portfolio-image">
              <div class="image-placeholder">🎨</div>
            </div>
            <div class="portfolio-info">
              <h4 class="portfolio-title">品牌网站</h4>
              <p class="portfolio-category">企业官网</p>
            </div>
          </div>
          <div class="portfolio-item">
            <div class="portfolio-image">
              <div class="image-placeholder">📱</div>
            </div>
            <div class="portfolio-info">
              <h4 class="portfolio-title">移动应用</h4>
              <p class="portfolio-category">UI/UX设计</p>
            </div>
          </div>
          <div class="portfolio-item">
            <div class="portfolio-image">
              <div class="image-placeholder">🌐</div>
            </div>
            <div class="portfolio-info">
              <h4 class="portfolio-title">电商平台</h4>
              <p class="portfolio-category">在线商城</p>
            </div>
          </div>
          <div class="portfolio-item">
            <div class="portfolio-image">
              <div class="image-placeholder">🎭</div>
            </div>
            <div class="portfolio-info">
              <h4 class="portfolio-title">创意设计</h4>
              <p class="portfolio-category">品牌设计</p>
            </div>
          </div>
          <div class="portfolio-item">
            <div class="portfolio-image">
              <div class="image-placeholder">📊</div>
            </div>
            <div class="portfolio-info">
              <h4 class="portfolio-title">数据分析平台</h4>
              <p class="portfolio-category">企业应用</p>
            </div>
          </div>
          <div class="portfolio-item">
            <div class="portfolio-image">
              <div class="image-placeholder">🎮</div>
            </div>
            <div class="portfolio-info">
              <h4 class="portfolio-title">游戏网站</h4>
              <p class="portfolio-category">娱乐平台</p>
            </div>
          </div>
        </div>
      </div>
    </section>`
  }

  if (hasTestimonials) {
    html += `
    <section class="testimonials" id="testimonials">
      <div class="container">
        <h3 class="section-title">客户评价</h3>
        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="testimonial-content">
              <p class="testimonial-text">"团队非常专业，设计的网站超出了我们的预期。沟通顺畅，服务周到，强烈推荐！"</p>
            </div>
            <div class="testimonial-author">
              <div class="author-avatar">👤</div>
              <div class="author-info">
                <h5 class="author-name">张三</h5>
                <p class="author-role">某公司CEO</p>
              </div>
            </div>
          </div>
          <div class="testimonial-card">
            <div class="testimonial-content">
              <p class="testimonial-text">"设计的网站既美观又实用，用户体验非常好。团队响应迅速，解决问题及时，值得信赖！"</p>
            </div>
            <div class="testimonial-author">
              <div class="author-avatar">👤</div>
              <div class="author-info">
                <h5 class="author-name">李四</h5>
                <p class="author-role">产品经理</p>
              </div>
            </div>
          </div>
          <div class="testimonial-card">
            <div class="testimonial-content">
              <p class="testimonial-text">"与他们合作非常愉快，团队专业高效，设计的网站帮助我们提升了品牌形象和业务增长。"</p>
            </div>
            <div class="testimonial-author">
              <div class="author-avatar">👤</div>
              <div class="author-info">
                <h5 class="author-name">王五</h5>
                <p class="author-role">市场总监</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`
  }

  if (hasTeam) {
    html += `
    <section class="team" id="team">
      <div class="container">
        <h3 class="section-title">我们的团队</h3>
        <div class="team-grid">
          <div class="team-card">
            <div class="team-avatar">👨‍💼</div>
            <div class="team-info">
              <h4 class="team-name">张经理</h4>
              <p class="team-role">CEO & 创始人</p>
              <p class="team-bio">拥有10年+行业经验，带领团队实现多次创新突破。</p>
            </div>
          </div>
          <div class="team-card">
            <div class="team-avatar">👨‍🎨</div>
            <div class="team-info">
              <h4 class="team-name">李设计师</h4>
              <p class="team-role">设计总监</p>
              <p class="team-bio">专注于用户体验设计，作品曾获得多项行业奖项。</p>
            </div>
          </div>
          <div class="team-card">
            <div class="team-avatar">👨‍💻</div>
            <div class="team-info">
              <h4 class="team-name">王开发</h4>
              <p class="team-role">技术总监</p>
              <p class="team-bio">全栈开发专家，精通各种现代前端技术栈。</p>
            </div>
          </div>
          <div class="team-card">
            <div class="team-avatar">👩‍💼</div>
            <div class="team-info">
              <h4 class="team-name">赵运营</h4>
              <p class="team-role">运营总监</p>
              <p class="team-bio">丰富的数字营销经验，帮助客户实现业务增长。</p>
            </div>
          </div>
        </div>
      </div>
    </section>`
  }

  if (hasBlog) {
    html += `
    <section class="blog" id="blog">
      <div class="container">
        <h3 class="section-title">最新博客</h3>
        <div class="blog-grid">
          <div class="blog-card">
            <div class="blog-image">
              <div class="image-placeholder">📝</div>
            </div>
            <div class="blog-info">
              <div class="blog-date">2025-01-15</div>
              <h4 class="blog-title">现代网页设计趋势分析</h4>
              <p class="blog-excerpt">了解2025年最新的网页设计趋势，提升您的网站竞争力...</p>
              <a href="#" class="blog-link">阅读更多 →</a>
            </div>
          </div>
          <div class="blog-card">
            <div class="blog-image">
              <div class="image-placeholder">💻</div>
            </div>
            <div class="blog-info">
              <div class="blog-date">2025-01-10</div>
              <h4 class="blog-title">响应式设计最佳实践</h4>
              <p class="blog-excerpt">学习响应式设计的最佳实践，确保您的网站在所有设备上都能完美展示...</p>
              <a href="#" class="blog-link">阅读更多 →</a>
            </div>
          </div>
          <div class="blog-card">
            <div class="blog-image">
              <div class="image-placeholder">🎨</div>
            </div>
            <div class="blog-info">
              <div class="blog-date">2025-01-05</div>
              <h4 class="blog-title">色彩心理学在设计中的应用</h4>
              <p class="blog-excerpt">了解色彩心理学如何影响用户体验和品牌认知...</p>
              <a href="#" class="blog-link">阅读更多 →</a>
            </div>
          </div>
        </div>
      </div>
    </section>`
  }

  if (hasContact) {
    html += `
    <section class="contact" id="contact">
      <div class="container">
        <h3 class="section-title">联系我们</h3>
        <div class="contact-content">
          <div class="contact-info">
            <div class="contact-item">
              <div class="contact-icon">📍</div>
              <div class="contact-text">北京市朝阳区科技园区88号</div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">📞</div>
              <div class="contact-text">400-123-4567</div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">📧</div>
              <div class="contact-text">info@example.com</div>
            </div>
            <div class="contact-item">
              <div class="contact-icon">⏰</div>
              <div class="contact-text">周一至周五 9:00-18:00</div>
            </div>
          </div>
          <form class="contact-form">
            <div class="form-group">
              <label for="name">姓名</label>
              <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
              <label for="email">邮箱</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="phone">电话</label>
              <input type="tel" id="phone" name="phone">
            </div>
            <div class="form-group">
              <label for="subject">主题</label>
              <input type="text" id="subject" name="subject" required>
            </div>
            <div class="form-group">
              <label for="message">留言</label>
              <textarea id="message" name="message" rows="5" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">提交</button>
          </form>
        </div>
      </div>
    </section>`
  }

  html += `
  </main>`

  if (hasFooter) {
    html += `
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-section">
          <h4 class="footer-title">关于我们</h4>
          <p class="footer-text">专业的设计开发团队，致力于为客户提供高质量的解决方案。</p>
        </div>
        <div class="footer-section">
          <h4 class="footer-title">快速链接</h4>
          <ul class="footer-links">
            ${hasAbout ? '<li><a href="#about">关于我们</a></li>' : ''}
            ${hasServices ? '<li><a href="#services">服务</a></li>' : ''}
            ${hasFeatures ? '<li><a href="#features">功能</a></li>' : ''}
            ${hasPortfolio ? '<li><a href="#portfolio">作品</a></li>' : ''}
            ${hasBlog ? '<li><a href="#blog">博客</a></li>' : ''}
          </ul>
        </div>
        <div class="footer-section">
          <h4 class="footer-title">联系方式</h4>
          <ul class="footer-links">
            <li>📍 北京市朝阳区科技园区88号</li>
            <li>📞 400-123-4567</li>
            <li>📧 info@example.com</li>
          </ul>
        </div>
        <div class="footer-section">
          <h4 class="footer-title">社交媒体</h4>
          <div class="social-links">
            <a href="#" class="social-link">🐦</a>
            <a href="#" class="social-link">📘</a>
            <a href="#" class="social-link">📸</a>
            <a href="#" class="social-link">🔗</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 网站名称. 保留所有权利.</p>
      </div>
    </div>
  </footer>`
  }

  html += `
  <script src="script.js"></script>
</body>
</html>`

  return html
}

// 生成CSS代码
const generateCss = (template, requirements) => {
  const { colors, fonts } = template
  const { responsive, animation, darkMode } = requirements

  let css = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: ${fonts.body};
  line-height: 1.6;
  color: ${colors.text};
  background-color: ${colors.background};
  transition: background-color 0.3s ease, color 0.3s ease;
}

${darkMode ? `
body.dark-mode {
  color: ${colors.darkText};
  background-color: ${colors.darkBackground};
}` : ''}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Header */
.header {
  background-color: ${colors.background};
  border-bottom: 1px solid ${colors.border};
  position: sticky;
  top: 0;
  z-index: 100;
  ${animation ? 'transition: all 0.3s ease;' : ''}
}

${darkMode ? `
body.dark-mode .header {
  background-color: ${colors.darkBackground};
  border-bottom-color: rgba(255, 255, 255, 0.1);
}` : ''}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.logo {
  font-family: ${fonts.heading};
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colors.primary};
}

.nav {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: ${colors.text};
  text-decoration: none;
  font-weight: 500;
  ${animation ? 'transition: color 0.3s ease;' : ''}
}

.nav-link:hover {
  color: ${colors.primary};
}

${darkMode ? `
body.dark-mode .nav-link {
  color: ${colors.darkText};
}

body.dark-mode .nav-link:hover {
  color: ${colors.primary};
}` : ''}

/* Hero Section */
.hero {
  background-color: ${colors.background};
  padding: 6rem 0;
  text-align: center;
}

.hero-title {
  font-family: ${fonts.heading};
  font-size: 3rem;
  font-weight: 800;
  color: ${colors.text};
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: ${colors.textLight};
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 0.875rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  ${animation ? 'transition: all 0.3s ease;' : ''}
  text-decoration: none;
  text-align: center;
}

.btn-primary {
  background-color: ${colors.primary};
  color: white;
}

.btn-primary:hover {
  background-color: ${colors.secondary};
  ${animation ? 'transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);' : ''}
}

/* Section Styles */
.section-title {
  font-family: ${fonts.heading};
  font-size: 2.5rem;
  font-weight: 700;
  color: ${colors.text};
  text-align: center;
  margin-bottom: 3rem;
}

/* Features Section */
.features {
  padding: 6rem 0;
  background-color: ${colors.background};
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  ${animation ? 'transition: all 0.3s ease;' : ''}
}

${darkMode ? `
body.dark-mode .feature-card {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}` : ''}

.feature-card:hover {
  ${animation ? 'transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);' : ''}
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-title {
  font-family: ${fonts.heading};
  font-size: 1.25rem;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: 1rem;
}

.feature-description {
  color: ${colors.textLight};
}

/* Services Section */
.services {
  padding: 6rem 0;
  background-color: ${colors.background};
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.service-card {
  background-color: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${colors.primary};
}

${darkMode ? `
body.dark-mode .service-card {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}` : ''}

.service-title {
  font-family: ${fonts.heading};
  font-size: 1.25rem;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: 1rem;
}

.service-description {
  color: ${colors.textLight};
}

/* About Section */
.about {
  padding: 6rem 0;
  background-color: ${colors.background};
}

.about-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  color: ${colors.textLight};
  font-size: 1.125rem;
}

.about-content p {
  margin-bottom: 1.5rem;
}

/* Contact Section */
.contact {
  padding: 6rem 0;
  background-color: ${colors.background};
}

.contact-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: ${colors.text};
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${colors.border};
  border-radius: 0.5rem;
  font-family: ${fonts.body};
  font-size: 1rem;
  color: ${colors.text};
  background-color: white;
}

${darkMode ? `
body.dark-mode .form-group input,
body.dark-mode .form-group textarea {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  color: ${colors.darkText};
}

body.dark-mode .form-group label {
  color: ${colors.darkText};
}` : ''}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: ${colors.primary};
  ${animation ? 'box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);' : ''}
}

/* Footer */
.footer {
  background-color: ${colors.text};
  color: white;
  text-align: center;
  padding: 2rem 0;
}

.footer p {
  margin: 0;
  color: ${colors.textLight};
}`

  // 添加Portfolio组件样式
  css += `
/* Portfolio Section */
.portfolio {
  padding: 6rem 0;
  background-color: ${colors.background};
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.portfolio-item {
  background-color: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  ${animation ? 'transition: all 0.3s ease;' : ''}
}

${darkMode ? `
body.dark-mode .portfolio-item {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}` : ''}

.portfolio-item:hover {
  ${animation ? 'transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);' : ''}
}

.portfolio-image {
  height: 200px;
  background-color: ${colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  font-size: 4rem;
}

.portfolio-info {
  padding: 1.5rem;
}

.portfolio-title {
  font-family: ${fonts.heading};
  font-size: 1.25rem;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: 0.5rem;
}

.portfolio-category {
  color: ${colors.textLight};
  font-size: 0.875rem;
}

/* Testimonials Section */
.testimonials {
  padding: 6rem 0;
  background-color: ${colors.background};
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background-color: white;
  padding: 2rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  ${animation ? 'transition: all 0.3s ease;' : ''}
}

${darkMode ? `
body.dark-mode .testimonial-card {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}` : ''}

.testimonial-card:hover {
  ${animation ? 'transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);' : ''}
}

.testimonial-text {
  font-size: 1.125rem;
  font-style: italic;
  color: ${colors.text};
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  font-size: 3rem;
}

.author-name {
  font-family: ${fonts.heading};
  font-size: 1rem;
  font-weight: 700;
  color: ${colors.text};
  margin: 0;
}

.author-role {
  font-size: 0.875rem;
  color: ${colors.textLight};
  margin: 0;
}

/* Team Section */
.team {
  padding: 6rem 0;
  background-color: ${colors.background};
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.team-card {
  background-color: white;
  padding: 2rem;
  border-radius: 0.75rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  ${animation ? 'transition: all 0.3s ease;' : ''}
}

${darkMode ? `
body.dark-mode .team-card {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}` : ''}

.team-card:hover {
  ${animation ? 'transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);' : ''}
}

.team-avatar {
  font-size: 5rem;
  margin-bottom: 1rem;
}

.team-name {
  font-family: ${fonts.heading};
  font-size: 1.25rem;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: 0.5rem;
}

.team-role {
  font-size: 0.875rem;
  color: ${colors.primary};
  margin-bottom: 1rem;
  font-weight: 600;
}

.team-bio {
  color: ${colors.textLight};
  font-size: 0.95rem;
}

/* Blog Section */
.blog {
  padding: 6rem 0;
  background-color: ${colors.background};
}

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.blog-card {
  background-color: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  ${animation ? 'transition: all 0.3s ease;' : ''}
}

${darkMode ? `
body.dark-mode .blog-card {
  background-color: rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}` : ''}

.blog-card:hover {
  ${animation ? 'transform: translateY(-5px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);' : ''}
}

.blog-image {
  height: 180px;
  background-color: ${colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
}

.blog-info {
  padding: 1.5rem;
}

.blog-date {
  font-size: 0.875rem;
  color: ${colors.textLight};
  margin-bottom: 0.75rem;
}

.blog-title {
  font-family: ${fonts.heading};
  font-size: 1.25rem;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: 0.75rem;
  line-height: 1.4;
}

.blog-excerpt {
  color: ${colors.textLight};
  margin-bottom: 1rem;
  font-size: 0.95rem;
  line-height: 1.6;
}

.blog-link {
  color: ${colors.primary};
  font-weight: 600;
  text-decoration: none;
  ${animation ? 'transition: color 0.3s ease;' : ''}
}

.blog-link:hover {
  color: ${colors.secondary};
}

/* Theme Toggle */
.theme-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  ${animation ? 'transition: all 0.3s ease;' : ''}
}

.theme-toggle:hover {
  background-color: ${colors.border};
}

/* Footer */
.footer {
  background-color: ${colors.background};
  border-top: 1px solid ${colors.border};
  padding: 4rem 0 2rem;
}

${darkMode ? `
body.dark-mode .footer {
  background-color: ${colors.darkBackground};
  border-top-color: rgba(255, 255, 255, 0.1);
}` : ''}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.footer-title {
  font-family: ${fonts.heading};
  font-size: 1.25rem;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: 1rem;
}

.footer-text {
  color: ${colors.textLight};
  line-height: 1.6;
}

.footer-links {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: ${colors.textLight};
  text-decoration: none;
  ${animation ? 'transition: color 0.3s ease;' : ''}
}

.footer-links a:hover {
  color: ${colors.primary};
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: ${colors.border};
  border-radius: 50%;
  color: ${colors.text};
  text-decoration: none;
  font-size: 1.25rem;
  ${animation ? 'transition: all 0.3s ease;' : ''}
}

.social-link:hover {
  background-color: ${colors.primary};
  color: white;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid ${colors.border};
}

${darkMode ? `
body.dark-mode .footer-bottom {
  border-top-color: rgba(255, 255, 255, 0.1);
}` : ''}

.footer-bottom p {
  color: ${colors.textLight};
  margin: 0;
}

/* Dark Mode Text Colors */
${darkMode ? `
body.dark-mode .hero-title,
body.dark-mode .section-title,
body.dark-mode .feature-title,
body.dark-mode .service-title,
body.dark-mode .portfolio-title,
body.dark-mode .testimonial-text,
body.dark-mode .author-name,
body.dark-mode .team-name,
body.dark-mode .blog-title,
body.dark-mode .footer-title {
  color: ${colors.darkText};
}

body.dark-mode .hero-subtitle,
body.dark-mode .feature-description,
body.dark-mode .service-description,
body.dark-mode .portfolio-category,
body.dark-mode .author-role,
body.dark-mode .team-role,
body.dark-mode .team-bio,
body.dark-mode .blog-date,
body.dark-mode .blog-excerpt,
body.dark-mode .footer-text,
body.dark-mode .footer-links a,
body.dark-mode .social-link {
  color: ${colors.textLight};
}
}` : ''}

// 生成JS代码
const generateJs = (requirements) => {
  const { hasContact, animation, darkMode } = requirements
  
  let js = `document.addEventListener('DOMContentLoaded', () => {
  // CTA按钮点击事件
  const ctaBtn = document.getElementById('cta-btn');
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      alert('按钮被点击了！您可以在这里添加更多交互逻辑。');
    });
  }
`

${darkMode ? `
  // 深色模式切换
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      themeToggle.textContent = document.body.classList.contains('dark-mode') ? '🌞' : '🌙';
    });
  }
` : ''}

  // 平滑滚动
  if (animation) {
    js += `
  // 平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });`
  }

  // 联系表单提交
  if (hasContact) {
    js += `
  // 联系表单提交
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // 获取表单数据
      const formData = new FormData(contactForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const message = formData.get('message');
      
      // 简单的表单验证
      if (name && email && message) {
        alert('表单提交成功！\n\n姓名: ' + name + '\n邮箱: ' + email + '\n留言: ' + message);
        contactForm.reset();
      } else {
        alert('请填写所有必填字段');
      }
    });
  }`
  }

  // 添加动画效果
  if (animation) {
    js += `
  // 页面滚动动画
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // 为卡片元素添加动画
  document.querySelectorAll('.feature-card, .service-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
  });`
  }

  js += `
});`

  return js
}

// 生成AI响应
const generateAIResponse = (userInput) => {
  // 分析用户输入
  const requirements = analyzeUserInput(userInput)
  
  // 选择设计模板
  const template = designTemplates[requirements.style]
  
  // 生成设计代码
  const designData = {
    html: generateHtml(template, requirements),
    css: generateCss(template, requirements),
    js: generateJs(requirements)
  }

  // 构建组件列表
  const components = []
  if (requirements.hasHero) components.push('英雄区域')
  if (requirements.hasFeatures) components.push('功能展示')
  if (requirements.hasServices) components.push('服务介绍')
  if (requirements.hasAbout) components.push('关于我们')
  if (requirements.hasContact) components.push('联系表单')
  if (requirements.hasTestimonials) components.push('客户评价')
  if (requirements.hasPortfolio) components.push('作品集')
  if (requirements.hasTeam) components.push('团队介绍')
  if (requirements.hasBlog) components.push('博客文章')

  // 根据用户需求生成个性化开场白
  let opening = `您好！我已根据您的需求生成了一个${requirements.responsive ? '响应式' : '固定布局'}的设计方案。`
  
  // 根据风格添加不同的个性化描述
  let styleDescription = ''
  switch(requirements.style) {
    case 'modern':
      styleDescription = '这套现代风格设计采用了简洁明快的线条和鲜明的色彩对比，适合展现品牌的时尚感和专业性。'
      break
    case 'minimalist':
      styleDescription = '这套简约风格设计注重留白和内容层次，通过精简的元素传达核心信息，营造清爽舒适的视觉体验。'
      break
    case 'business':
      styleDescription = '这套商务风格设计采用了专业稳重的配色和清晰的信息架构，适合企业官网和商务平台使用。'
      break
    case 'creative':
      styleDescription = '这套创意风格设计突破传统束缚，运用大胆的色彩和独特的排版，展现品牌的创新精神和艺术气息。'
      break
    case 'tech':
      styleDescription = '这套科技风格设计采用了深色背景和荧光色调，营造未来科技感，适合科技公司和软件产品展示。'
      break
    case 'retro':
      styleDescription = '这套复古风格设计融合了经典元素和现代技术，通过怀旧的配色和优雅的排版，营造独特的品牌氛围。'
      break
    default:
      styleDescription = `${template.description}`
  }

  // 构建AI响应内容
  let responseContent = `${opening}\n\n`
  
  responseContent += `**设计风格**：${template.name}\n`
  responseContent += `**风格解读**：${styleDescription}\n\n`
  
  responseContent += `**设计特点**：\n`
  responseContent += `- ${requirements.responsive ? '响应式布局，完美适配各种设备屏幕' : '固定布局，专注于桌面端体验'}\n`
  responseContent += `- ${requirements.animation ? '丰富的动画效果，提升用户交互体验' : '简洁的设计风格，注重内容呈现'}\n`
  if (requirements.darkMode) responseContent += `- 支持深色模式切换，保护用户视力，适配不同使用场景\n`
  
  responseContent += `\n**包含组件**：\n`
  if (components.length > 0) {
    components.forEach(component => {
      responseContent += `- ${component}\n`
    })
  } else {
    responseContent += `- 基础页面结构\n`
  }
  
  responseContent += `\n**配色方案**：\n`
  responseContent += `- 主色调：${template.colors.primary}（${requirements.darkMode ? `深色模式背景：${template.colors.darkBackground}` : ''}\n`)
  responseContent += `- 辅助色：${template.colors.secondary}\n`
  responseContent += `- 强调色：${template.colors.accent}\n\n`
  
  responseContent += `**字体方案**：\n`
  responseContent += `- 正文字体：${template.fonts.body.split(',')[0]}，保证阅读流畅性\n`
  responseContent += `- 标题字体：${template.fonts.heading.split(',')[0]}，增强视觉冲击力\n\n`
  
  // 添加个性化建议
  let suggestions = '为了进一步优化您的网站，我建议：\n'
  suggestions += `- 根据实际内容调整英雄区域的标题和副标题，突出核心价值主张\n`
  if (requirements.hasPortfolio) suggestions += `- 为作品集添加高质量图片和详细的项目描述\n`
  if (requirements.hasTestimonials) suggestions += `- 选择真实的客户评价，增强可信度\n`
  if (requirements.hasContact) suggestions += `- 优化联系表单的字段，减少用户填写负担\n`
  responseContent += `${suggestions}\n`
  
  responseContent += `您可以在右侧预览设计效果，也可以直接导出代码进行进一步开发。如果需要调整设计细节（如配色、组件布局等），随时告诉我您的想法！`

  return {
    id: (Date.now() + 1).toString(),
    type: 'ai',
    content: responseContent,
    timestamp: Date.now(),
    designData: designData
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa;
}

.chat-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  background-color: #f9f9f9;
}

.message-item {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
}

.message-item.user {
  align-items: flex-end;
}

.message-item.ai {
  align-items: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  word-wrap: break-word;
}

.message-item.user .message-content {
  background-color: #1a73e8;
  color: white;
  border-bottom-right-radius: 2px;
}

.message-item.ai .message-content {
  background-color: white;
  color: #333;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 2px;
}

.message-time {
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.3rem;
  padding: 0 0.5rem;
}

.chat-input-area {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  background-color: white;
  display: flex;
  gap: 1rem;
}

.chat-input-area .el-input {
  flex: 1;
}
</style>