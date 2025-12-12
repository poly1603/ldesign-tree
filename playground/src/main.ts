import { createApp } from 'vue'
import './styles/index.css'
import App from './App.vue'
import router from './router'

// 注入 tree 样式
import { injectStyles } from '@ldesign/tree-core'
injectStyles()

createApp(App).use(router).mount('#app')
