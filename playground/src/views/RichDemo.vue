<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { LTree } from '@ldesign/tree-vue'
import { createTree, injectStyles, type Tree, type NodeAction, type FlatNode } from '@ldesign/tree-core'
import { richTreeData } from '../data/tree-data'
import DemoLayout from '../components/DemoLayout.vue'

const activeTab = ref<'vue' | 'native'>('vue')
const nativeContainerRef = ref<HTMLElement | null>(null)
let nativeTree: Tree | null = null

const handleActionClick = (action: NodeAction, node: FlatNode) => {
  console.log('Action clicked:', action.key, 'on node:', node.label)
  alert(`Action: ${action.key}\nNode: ${node.label}`)
}

const options = {
  showIcon: true,
  defaultExpandAll: true,
  showDescription: true,
  showBadge: true,
  showTags: true,
  showActions: 'hover' as const,
  onActionClick: handleActionClick
}

const code = {
  vue: `<template>
  <LTree
    :data="richData"
    :options="{
      showIcon: true,
      showDescription: true,
      showBadge: true,
      showTags: true,
      showActions: 'hover',
      onActionClick: handleAction,
    }"
  />
</template>

<script setup>
const handleAction = (action, node) => {
  console.log('操作:', action.key, node.label)
}

const richData = [{
  id: '1',
  label: 'Button.vue',
  description: 'Button component',
  badge: { text: 'NEW', type: 'success' },
  tags: [{ text: 'UI' }],
  actions: [{ key: 'edit', title: 'Edit' }],
}]
<\/script>`,
  native: `const tree = createTree('#container', richData, {
  showIcon: true,
  showDescription: true,  // 显示节点描述
  showBadge: true,        // 显示徽章
  showTags: true,         // 显示标签
  showActions: 'hover',   // 悬停显示操作按钮
  defaultExpandAll: true,
  onActionClick: (action, node) => {
    console.log('操作:', action.key, '节点:', node.label)
  },
})`
}

const initNativeTree = () => {
  if (!nativeContainerRef.value) return
  nativeTree?.destroy()
  injectStyles()
  nativeTree = createTree(nativeContainerRef.value, [...richTreeData], options)
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
  <DemoLayout title="Rich Features" :code="code" v-model:activeTab="activeTab">
    <template #vue>
      <LTree :data="richTreeData" :options="options" height="400px" />
    </template>
    <template #native>
      <div ref="nativeContainerRef" style="height: 400px;"></div>
    </template>
  </DemoLayout>
</template>
