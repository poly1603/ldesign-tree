<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { LTree } from '@ldesign/tree-vue'
import { createTree, injectStyles, type Tree } from '@ldesign/tree-core'
import { directoryTreeData } from '../data/tree-data'
import DemoLayout from '../components/DemoLayout.vue'

const activeTab = ref<'vue' | 'native'>('vue')
const nativeContainerRef = ref<HTMLElement | null>(null)
let nativeTree: Tree | null = null
const lineStyle = ref<'solid' | 'dashed' | 'dotted'>('solid')

const getOptions = () => ({
  showIcon: true,
  showLine: true,
  lineStyle: lineStyle.value,
  defaultExpandAll: true
})

const code = {
  vue: `<template>
  <LTree
    :data="directoryData"
    :options="{
      showIcon: true,
      showLine: true,
      lineStyle: 'solid',
    }"
  />
</template>

<script setup>
// 连接线样式选项:
// - 'solid': 实线
// - 'dashed': 虚线
// - 'dotted': 点线
<\/script>`,
  native: `const tree = createTree('#container', directoryData, {
  showIcon: true,
  showLine: true,         // 显示连接线
  lineStyle: 'solid',     // 线条样式: solid | dashed | dotted
  defaultExpandAll: true,
})`
}

const initNativeTree = () => {
  if (!nativeContainerRef.value) return
  nativeTree?.destroy()
  injectStyles()
  nativeTree = createTree(nativeContainerRef.value, [...directoryTreeData], getOptions())
}

watch(activeTab, (tab) => {
  if (tab === 'native') {
    setTimeout(initNativeTree, 0)
  }
})

watch(lineStyle, () => {
  if (activeTab.value === 'native' && nativeTree) {
    initNativeTree()
  }
})

onMounted(() => {
  if (activeTab.value === 'native') {
    initNativeTree()
  }
})
</script>

<template>
  <DemoLayout title="Connection Lines" :code="code" v-model:activeTab="activeTab">
    <template #actions>
      <select v-model="lineStyle" class="line-select">
        <option value="solid">Solid</option>
        <option value="dashed">Dashed</option>
        <option value="dotted">Dotted</option>
      </select>
    </template>
    <template #vue>
      <LTree :key="lineStyle" :data="directoryTreeData" :options="getOptions()" height="400px" />
    </template>
    <template #native>
      <div ref="nativeContainerRef" style="height: 400px;"></div>
    </template>
  </DemoLayout>
</template>

<style scoped>
.line-select {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}
</style>
