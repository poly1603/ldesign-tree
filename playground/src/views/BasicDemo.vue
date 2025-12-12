<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { LTree } from '@ldesign/tree-vue'
import { createTree, injectStyles, type Tree } from '@ldesign/tree-core'
import { basicTreeData } from '../data/tree-data'
import DemoLayout from '../components/DemoLayout.vue'

const activeTab = ref<'vue' | 'native'>('vue')
const nativeContainerRef = ref<HTMLElement | null>(null)
let nativeTree: Tree | null = null

const options = { showIcon: true, animate: true }
const code = {
  vue: `<template>
  <LTree
    ref="treeRef"
    :data="treeData"
    :options="{ showIcon: true, animate: true }"
    height="400px"
  />
</template>

<script setup>
import { LTree } from '@ldesign/tree-vue'

const treeRef = ref(null)

// 展开全部
treeRef.value?.expandAll()
<\/script>`,
  native: `import { createTree, injectStyles } from '@ldesign/tree-core'

injectStyles()

const tree = createTree('#container', treeData, {
  showIcon: true,
  animate: true,
})

// 展开全部
tree.expandAll()

// 折叠全部
tree.collapseAll()`
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
  <DemoLayout title="Basic Tree" :code="code" v-model:activeTab="activeTab">
    <template #vue>
      <LTree :data="basicTreeData" :options="options" height="400px" />
    </template>
    <template #native>
      <div ref="nativeContainerRef" style="height: 400px;"></div>
    </template>
  </DemoLayout>
</template>
