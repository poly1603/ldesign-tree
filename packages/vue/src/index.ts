/**
 * @ldesign/tree-vue
 * Vue 3 树形组件
 */

// 组件
export { default as LTree } from './components/LTree.vue'

// 从 core 重新导出常用类型
export type {
  NodeId,
  TreeNodeData,
  FlatNode,
  TreeOptions,
  TreeStats,
  DropPosition,
} from '@ldesign/tree-core'

// 导出工具
export { injectStyles, removeStyles } from '@ldesign/tree-core'
