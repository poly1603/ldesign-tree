<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { LTree } from '@ldesign/tree-vue'
import { createTree, injectStyles, type Tree, type TreeNodeData, type FlatNode } from '@ldesign/tree-core'
import DemoLayout from '../components/DemoLayout.vue'

const activeTab = ref<'vue' | 'native'>('vue')
const nativeContainerRef = ref<HTMLElement | null>(null)
let nativeTree: Tree | null = null

// 使用 JSONPlaceholder API 作为真实数据源
const lazyTreeData: TreeNodeData[] = [
  { id: 'users', label: 'Users', isLeaf: false, data: { type: 'users' } },
  { id: 'posts', label: 'Posts', isLeaf: false, data: { type: 'posts' } },
  { id: 'albums', label: 'Albums', isLeaf: false, data: { type: 'albums' } },
]

// 真实的懒加载函数 - 从 JSONPlaceholder 获取数据
const loadChildren = async (node: FlatNode<{ type?: string; userId?: number; postId?: number; albumId?: number }>): Promise<TreeNodeData[]> => {
  const { data } = node

  try {
    // 根据节点类型加载不同的数据
    if (data?.type === 'users') {
      const res = await fetch('https://jsonplaceholder.typicode.com/users')
      const users = await res.json()
      return users.slice(0, 10).map((user: any) => ({
        id: `user-${user.id}`,
        label: user.name,
        isLeaf: false,
        data: { type: 'user-posts', userId: user.id },
      }))
    }

    if (data?.type === 'user-posts') {
      const res = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${data.userId}`)
      const posts = await res.json()
      return posts.slice(0, 5).map((post: any) => ({
        id: `post-${post.id}`,
        label: post.title.substring(0, 40) + '...',
        isLeaf: true,
      }))
    }

    if (data?.type === 'posts') {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=20')
      const posts = await res.json()
      return posts.map((post: any) => ({
        id: `post-${post.id}`,
        label: post.title.substring(0, 40) + '...',
        isLeaf: false,
        data: { type: 'post-comments', postId: post.id },
      }))
    }

    if (data?.type === 'post-comments') {
      const res = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${data.postId}`)
      const comments = await res.json()
      return comments.slice(0, 3).map((comment: any) => ({
        id: `comment-${comment.id}`,
        label: comment.name.substring(0, 30) + '...',
        isLeaf: true,
      }))
    }

    if (data?.type === 'albums') {
      const res = await fetch('https://jsonplaceholder.typicode.com/albums?_limit=10')
      const albums = await res.json()
      return albums.map((album: any) => ({
        id: `album-${album.id}`,
        label: album.title.substring(0, 40) + '...',
        isLeaf: false,
        data: { type: 'album-photos', albumId: album.id },
      }))
    }

    if (data?.type === 'album-photos') {
      const res = await fetch(`https://jsonplaceholder.typicode.com/photos?albumId=${data.albumId}&_limit=5`)
      const photos = await res.json()
      return photos.map((photo: any) => ({
        id: `photo-${photo.id}`,
        label: photo.title.substring(0, 40) + '...',
        isLeaf: true,
      }))
    }

    return []
  } catch (error) {
    console.error('Failed to load data:', error)
    throw error
  }
}

const options = { showIcon: true, loadData: loadChildren }
const code = {
  vue: `<template>
  <LTree
    :data="initialData"
    :options="{
      showIcon: true,
      loadData: loadChildren,
    }"
  />
</template>

<script setup>
// 真实 API 懒加载示例
const loadChildren = async (node) => {
  const res = await fetch(\`/api/children?id=\${node.id}\`)
  return res.json()
}
<\/script>`,
  native: `const tree = createTree('#container', initialData, {
  showIcon: true,
  loadData: async (node) => {
    // 请求服务端获取子节点
    const res = await fetch('/api/children?id=' + node.id)
    return res.json()
  },
})

// 加载完成事件
tree.on('load-data', ({ node, children }) => {
  console.log('加载完成:', node.label, children.length)
})`
}

const initNativeTree = () => {
  if (!nativeContainerRef.value) return
  nativeTree?.destroy()
  injectStyles()
  nativeTree = createTree(nativeContainerRef.value, [...lazyTreeData], options)
}

watch(activeTab, (tab) => {
  if (tab === 'native') {
    setTimeout(initNativeTree, 0)
  }
})

onMounted(() => {
  if (activeTab.value === 'native') {
    initNativeTree()
  }
})
</script>

<template>
  <DemoLayout title="Lazy Loading" :code="code" v-model:activeTab="activeTab">
    <template #actions>
      <span class="hint">Click to expand and load data from JSONPlaceholder API</span>
    </template>
    <template #vue>
      <LTree :data="lazyTreeData" :options="options" height="400px" />
    </template>
    <template #native>
      <div ref="nativeContainerRef" style="height: 400px;"></div>
    </template>
  </DemoLayout>
</template>

<style scoped>
.hint {
  font-size: 12px;
  color: #9ca3af;
}
</style>
