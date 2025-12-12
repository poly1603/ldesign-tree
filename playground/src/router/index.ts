import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/basic'
    },
    {
      path: '/basic',
      name: 'basic',
      component: () => import('../views/BasicDemo.vue'),
      meta: { title: 'Basic', icon: 'TreePine' }
    },
    {
      path: '/checkbox',
      name: 'checkbox',
      component: () => import('../views/CheckboxDemo.vue'),
      meta: { title: 'Checkbox', icon: 'CheckSquare' }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchDemo.vue'),
      meta: { title: 'Search', icon: 'Search' }
    },
    {
      path: '/drag',
      name: 'drag',
      component: () => import('../views/DragDemo.vue'),
      meta: { title: 'Drag', icon: 'Move' }
    },
    {
      path: '/virtual',
      name: 'virtual',
      component: () => import('../views/VirtualDemo.vue'),
      meta: { title: 'Virtual', icon: 'Zap' }
    },
    {
      path: '/lazy',
      name: 'lazy',
      component: () => import('../views/LazyDemo.vue'),
      meta: { title: 'Lazy', icon: 'Loader2' }
    },
    {
      path: '/rich',
      name: 'rich',
      component: () => import('../views/RichDemo.vue'),
      meta: { title: 'Rich', icon: 'Sparkles' }
    },
    {
      path: '/lines',
      name: 'lines',
      component: () => import('../views/LinesDemo.vue'),
      meta: { title: 'Lines', icon: 'GitBranch' }
    },
  ]
})

export default router
