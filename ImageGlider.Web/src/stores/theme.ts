import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { ThemeMode } from '@/types/theme'

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>('light')
  
  // 从localStorage加载主题设置
  const loadTheme = () => {
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode
    if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
      mode.value = savedTheme
    } else {
      // 检测系统主题偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      mode.value = prefersDark ? 'dark' : 'light'
    }
    applyTheme()
  }
  
  // 应用主题
  const applyTheme = () => {
    const html = document.documentElement
    
    if (mode.value === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.classList.toggle('dark', prefersDark)
    } else {
      html.classList.toggle('dark', mode.value === 'dark')
    }
  }
  
  // 切换主题
  const toggleTheme = () => {
    const themes: ThemeMode[] = ['light', 'dark', 'auto']
    const currentIndex = themes.indexOf(mode.value)
    mode.value = themes[(currentIndex + 1) % themes.length]
  }
  
  // 设置主题
  const setTheme = (newMode: ThemeMode) => {
    mode.value = newMode
  }
  
  // 监听主题变化
  watch(mode, (newMode) => {
    localStorage.setItem('theme-mode', newMode)
    applyTheme()
  })
  
  // 监听系统主题变化
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (mode.value === 'auto') {
        applyTheme()
      }
    })
  }
  
  return {
    mode,
    loadTheme,
    toggleTheme,
    setTheme
  }
})