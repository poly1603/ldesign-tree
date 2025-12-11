<script setup lang="ts" generic="T = unknown">
/**
 * LTree - Vue 3 树组件
 * 简单封装，内部直接使用 @ldesign/tree-core 的 Tree 类
 */
import { ref, watch, onMounted, onUnmounted, type PropType } from 'vue'
import { Tree, injectStyles, type TreeNodeData, type TreeOptions, type FlatNode, type NodeId, type DropPosition } from '@ldesign/tree-core'

const props = withDefaults(defineProps<{
  data?: TreeNodeData<T>[]
  options?: TreeOptions<T>
  height?: string | number
}>(), {
  data: () => [],
  options: () => ({}),
  height: '100%',
})

const emit = defineEmits<{
  'node-click': [node: FlatNode<T>, event: MouseEvent]
  'node-select': [node: FlatNode<T>, selected: boolean]
  'node-check': [node: FlatNode<T>, checked: boolean]
  'node-expand': [node: FlatNode<T>]
  'node-collapse': [node: FlatNode<T>]
  'node-drop': [dragNode: FlatNode<T>, dropNode: FlatNode<T>, position: DropPosition]
}>()

const containerRef = ref<HTMLElement | null>(null)
let tree: Tree<T> | null = null

// 容器样式
const containerStyle = {
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
}

onMounted(() => {
  if (!containerRef.value) return

  // 注入样式
  injectStyles()

  // 创建 Tree 实例
  tree = new Tree<T>(containerRef.value, props.data, props.options)

  // 绑定事件
  tree.on('node-click', (e) => emit('node-click', e.node, e.originalEvent))
  tree.on('node-select', (e) => emit('node-select', e.node, e.selected))
  tree.on('node-check', (e) => emit('node-check', e.node, e.checked === 'checked'))
  tree.on('node-expand', (e) => emit('node-expand', e.node))
  tree.on('node-collapse', (e) => emit('node-collapse', e.node))
  tree.on('drop', (e) => emit('node-drop', e.dragNode, e.dropNode, e.position))
})

onUnmounted(() => {
  tree?.destroy()
  tree = null
})

// 监听数据变化
watch(() => props.data, (newData) => {
  tree?.setData(newData)
}, { deep: true })

// 监听配置变化
watch(() => props.options, (newOptions) => {
  tree?.setOptions(newOptions)
}, { deep: true })

// 暴露方法
defineExpose({
  // 数据
  setData: (data: TreeNodeData<T>[]) => tree?.setData(data),
  getData: () => tree?.getData() ?? [],
  getNode: (id: NodeId) => tree?.getNode(id),
  addNode: (node: TreeNodeData<T>, parentId?: NodeId) => tree?.addNode(node, parentId),
  removeNode: (id: NodeId) => tree?.removeNode(id),
  updateNode: (id: NodeId, updates: Partial<FlatNode<T>>) => tree?.updateNode(id, updates),

  // 展开/折叠
  expandNode: (id: NodeId) => tree?.expandNode(id),
  collapseNode: (id: NodeId) => tree?.collapseNode(id),
  toggleExpand: (id: NodeId) => tree?.toggleExpand(id),
  expandAll: () => tree?.expandAll(),
  collapseAll: () => tree?.collapseAll(),

  // 选择
  selectNode: (id: NodeId) => tree?.selectNode(id),
  getSelectedNodes: () => tree?.getSelectedNodes() ?? [],
  getSelectedIds: () => tree?.getSelectedIds() ?? [],
  clearSelection: () => tree?.clearSelection(),

  // 勾选
  checkNode: (id: NodeId, checked?: boolean) => tree?.checkNode(id, checked),
  toggleCheck: (id: NodeId) => tree?.toggleCheck(id),
  checkAll: () => tree?.checkAll(),
  uncheckAll: () => tree?.uncheckAll(),
  getCheckedNodes: () => tree?.getCheckedNodes() ?? [],
  getCheckedIds: () => tree?.getCheckedIds() ?? [],

  // 搜索
  search: (query: string) => tree?.search(query),
  clearSearch: () => tree?.clearSearch(),

  // 滚动
  scrollToNode: (id: NodeId) => tree?.scrollToNode(id),

  // 统计
  getStats: () => tree?.getStats(),

  // 刷新
  refresh: () => tree?.refresh(),

  // 获取实例
  getInstance: () => tree,
})
</script>

<template>
  <div ref="containerRef" :style="containerStyle" />
</template>
