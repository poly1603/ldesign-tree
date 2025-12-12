<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { LTree } from '@ldesign/tree-vue'
import { createTree, injectStyles, type Tree } from '@ldesign/tree-core'
import { generateLargeData } from '../data/tree-data'
import DemoLayout from '../components/DemoLayout.vue'

const activeTab = ref<'vue' | 'native'>('vue')
const nativeContainerRef = ref<HTMLElement | null>(null)
let nativeTree: Tree | null = null
const nodeCount = ref(10000)

const treeData = computed(() => generateLargeData(nodeCount.value))
const options = { showIcon: true, virtual: true, itemHeight: 32 }
const code = {
  vue: `<template>
  <LTree
    :data="largeData"
    :options="{
      virtual: true,
      itemHeight: 32,
    }"
    height="400px"
  />
</template>

<script setup>
// 支持 10000+ 节点流畅渲染
const largeData = generateLargeData(10000)
<\/script>`,
  native: `// 生成 10000 个节点
const largeData = generateLargeData(10000)

const tree = createTree('#container', largeData, {
  virtual: true,      // 启用虚拟滚动
  itemHeight: 32,     // 固定行高
  bufferSize: 5,      // 缓冲区大小
})

// 滚动到指定节点
tree.scrollToNode('node-5000')`
}

const initNativeTree = () => {
  if (!nativeContainerRef.value) return
  nativeTree?.destroy()
  injectStyles()
  nativeTree = createTree(nativeContainerRef.value, treeData.value, options)
}

watch(activeTab, (tab) => {
  if (tab === 'native') {
    setTimeout(initNativeTree, 0)
  }
})

watch(nodeCount, () => {
  if (activeTab.value === 'native' && nativeTree) {
    nativeTree.setData(treeData.value)
  }
})

onMounted(() => {
  if (activeTab.value === 'native') {
    initNativeTree()
  }
})
</script>

<template>
  <DemoLayout title="Virtual Scroll" :code="code" v-model:activeTab="activeTab">
    <template #actions>
      <select v-model="nodeCount" class="node-select">
        <option :value="1000">1K</option>
        <option :value="5000">5K</option>
        <option :value="10000">10K</option>
        <option :value="50000">50K</option>
      </select>
    </template>
    <template #vue>
      <LTree :data="treeData" :options="options" height="400px" />
    </template>
    <template #native>
      <div ref="nativeContainerRef" style="height: 400px;"></div>
    </template>
  </DemoLayout>
</template>

<style scoped>
.node-select {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}
</style>
