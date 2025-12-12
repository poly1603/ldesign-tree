<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { LTree } from '@ldesign/tree-vue'
import { createTree, injectStyles, type Tree, type FlatNode, type DropPosition } from '@ldesign/tree-core'
import { basicTreeData } from '../data/tree-data'
import DemoLayout from '../components/DemoLayout.vue'

const activeTab = ref<'vue' | 'native'>('vue')
const nativeContainerRef = ref<HTMLElement | null>(null)
let nativeTree: Tree | null = null

const options = { showIcon: true, draggable: true, defaultExpandAll: true }
const code = {
  vue: `<template>
  <LTree
    :data="treeData"
    :options="{ showIcon: true, draggable: true }"
    @node-drop="handleDrop"
  />
</template>

<script setup>
const handleDrop = (dragNode, dropNode, position) => {
  console.log('拖拽:', dragNode.label, '->', dropNode.label, position)
}
<\/script>`,
  native: `const tree = createTree('#container', treeData, {
  showIcon: true,
  draggable: true,
  allowDrag: (node) => !node.disabled,
  allowDrop: (drag, drop, position) => true,
})

tree.on('drop', ({ dragNode, dropNode, position }) => {
  console.log('拖拽完成', dragNode.label, '->', dropNode.label)
})`
}

const handleDrop = (dragNode: FlatNode, dropNode: FlatNode, position: DropPosition) => {
  console.log('Drop:', dragNode.label, '->', dropNode.label, position)
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
  <DemoLayout title="Drag & Drop" :code="code" v-model:activeTab="activeTab">
    <template #vue>
      <LTree :data="basicTreeData" :options="options" height="400px" @node-drop="handleDrop" />
    </template>
    <template #native>
      <div ref="nativeContainerRef" style="height: 400px;"></div>
    </template>
  </DemoLayout>
</template>
