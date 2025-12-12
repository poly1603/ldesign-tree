<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { LTree } from '@ldesign/tree-vue'
import { createTree, injectStyles, type Tree, type FlatNode } from '@ldesign/tree-core'
import { orgTreeData } from '../data/tree-data'
import DemoLayout from '../components/DemoLayout.vue'

const activeTab = ref<'vue' | 'native'>('vue')
const nativeContainerRef = ref<HTMLElement | null>(null)
const treeRef = ref<InstanceType<typeof LTree> | null>(null)
let nativeTree: Tree | null = null
const checkedCount = ref(0)

const options = { showIcon: true, checkable: true, checkCascade: true, defaultExpandAll: true }
const code = {
  vue: `<template>
  <LTree
    ref="treeRef"
    :data="orgData"
    :options="{
      showIcon: true,
      checkable: true,
      checkCascade: true,
    }"
    @node-check="handleCheck"
  />
</template>

<script setup>
const handleCheck = (node, checked) => {
  console.log('选中状态:', node.label, checked)
}

// 获取选中的节点 ID
const checkedIds = treeRef.value?.getCheckedIds()
<\/script>`,
  native: `const tree = createTree('#container', orgData, {
  showIcon: true,
  checkable: true,
  checkCascade: true,
  defaultExpandAll: true,
})

// 获取选中的节点
const checkedIds = tree.getCheckedIds()

// 全选 / 取消全选
tree.checkAll()
tree.uncheckAll()`
}

const handleCheck = (node: FlatNode, checked: boolean) => {
  console.log('Checked:', node.label, checked)
  checkedCount.value = treeRef.value?.getCheckedIds().length || 0
}

const checkAll = () => {
  if (activeTab.value === 'vue') {
    treeRef.value?.checkAll()
  } else {
    nativeTree?.checkAll()
  }
  updateCheckedCount()
}

const uncheckAll = () => {
  if (activeTab.value === 'vue') {
    treeRef.value?.uncheckAll()
  } else {
    nativeTree?.uncheckAll()
  }
  updateCheckedCount()
}

const updateCheckedCount = () => {
  if (activeTab.value === 'vue') {
    checkedCount.value = treeRef.value?.getCheckedIds().length || 0
  } else {
    checkedCount.value = nativeTree?.getCheckedIds().length || 0
  }
}

const initNativeTree = () => {
  if (!nativeContainerRef.value) return
  nativeTree?.destroy()
  injectStyles()
  nativeTree = createTree(nativeContainerRef.value, [...orgTreeData], options)
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
  <DemoLayout title="Checkbox Tree" :code="code" v-model:activeTab="activeTab">
    <template #actions>
      <span class="checked-count">Checked: {{ checkedCount }}</span>
      <button class="action-btn" @click="checkAll">Check All</button>
      <button class="action-btn" @click="uncheckAll">Uncheck All</button>
    </template>
    <template #vue>
      <LTree ref="treeRef" :data="orgTreeData" :options="options" height="400px" @node-check="handleCheck" />
    </template>
    <template #native>
      <div ref="nativeContainerRef" style="height: 400px;"></div>
    </template>
  </DemoLayout>
</template>

<style scoped>
.checked-count {
  font-size: 13px;
  color: #6b7280;
  margin-right: 8px;
}

.action-btn {
  padding: 4px 12px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}
</style>
