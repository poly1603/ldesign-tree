import { createApp } from 'vue'
import App from './App.vue'
import './styles/index.css'

// 注入 tree 样式
import { injectStyles } from '@ldesign/tree-core'
injectStyles()

createApp(App).mount('#app')
