<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { LTree } from '@ldesign/tree-vue'
import { createTree, injectStyles, type Tree } from '@ldesign/tree-core'
import { basicTreeData } from '../data/tree-data'
import DemoLayout from '../components/DemoLayout.vue'
import { Search } from 'lucide-vue-next'

const activeTab = ref<'vue' | 'native'>('vue')
const nativeContainerRef = ref<HTMLElement | null>(null)
const treeRef = ref<InstanceType<typeof LTree> | null>(null)
let nativeTree: Tree | null = null
const searchQuery = ref('')

const options = { showIcon: true, defaultExpandAll: true }
const code = {
  vue: `<template>
  <input v-model="query" @input="handleSearch" />
  <LTree
    ref="treeRef"
    :data="treeData"
    :options="{ showIcon: true }"
  />
</template>

<script setup>
const query = ref('')
const handleSearch = () => {
  treeRef.value?.search(query.value)
}
<\/script>`,
  native: `const tree = createTree('#container', treeData, {
  showIcon: true,
  defaultExpandAll: true,
})

// 搜索节点
tree.search('文档')

// 清除搜索
tree.clearSearch()`
}

const handleSearch = () => {
  if (activeTab.value === 'vue') {
    treeRef.value?.search(searchQuery.value)
  } else {
    nativeTree?.search(searchQuery.value)
  }
}

const initNativeTree = () => {
  if (!nativeContainerRef.value) return
  nativeTree?.destroy()
  injectStyles()
  nativeTree = createTree(nativeContainerRef.value, [...basicTreeData], options)
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
  <DemoLayout title="Search Tree" :code="code" v-model:activeTab="activeTab">
    <template #actions>
      <div class="search-input">
        <Search :size="16" />
        <input v-model="searchQuery" @input="handleSearch" placeholder="Search nodes..." />
      </div>
    </template>
    <template #vue>
      <LTree ref="treeRef" :data="basicTreeData" :options="options" height="400px" />
    </template>
    <template #native>
      <div ref="nativeContainerRef" style="height: 400px;"></div>
    </template>
  </DemoLayout>
</template>

<style scoped>
.search-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
}

.search-input input {
  border: none;
  outline: none;
  font-size: 14px;
  width: 200px;
}

.search-input svg {
  color: #9ca3af;
}
</style>
