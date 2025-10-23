<template>
  <div ref="treeContainer" class="ldesign-tree-vue" :style="containerStyle">
    <!-- Tree will be rendered here by the core library -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { Tree, TreeNode, TreeOptions, TreeEvents, TreeNodeId } from '../../../index';

// Props
export interface TreeProps {
  data?: TreeNode[];
  options?: TreeOptions;
  height?: number | string;
  width?: number | string;
}

const props = withDefaults(defineProps<TreeProps>(), {
  data: () => [],
  options: () => ({}),
  height: '400px',
  width: '100%',
});

// Emits
const emit = defineEmits<{
  nodeClick: [node: TreeNode, event: MouseEvent];
  nodeDblClick: [node: TreeNode, event: MouseEvent];
  nodeContextMenu: [node: TreeNode, event: MouseEvent];
  nodeExpand: [node: TreeNode, expanded: boolean];
  nodeCheck: [node: TreeNode, checked: boolean, checkedNodes: TreeNode[]];
  selectionChange: [selectedNodes: TreeNode[]];
}>();

// Refs
const treeContainer = ref<HTMLElement | null>(null);
const treeInstance = ref<Tree | null>(null);

// Computed
const containerStyle = computed(() => ({
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
}));

// 事件处理器
const events: TreeEvents = {
  onNodeClick: (data) => {
    emit('nodeClick', data.node, data.event);
  },
  onNodeDblClick: (data) => {
    emit('nodeDblClick', data.node, data.event);
  },
  onNodeContextMenu: (data) => {
    emit('nodeContextMenu', data.node, data.event);
  },
  onNodeExpand: (data) => {
    emit('nodeExpand', data.node, data.expanded);
  },
  onNodeCheck: (data) => {
    emit('nodeCheck', data.node, data.checked, data.checkedNodes);
  },
};

// 初始化
onMounted(() => {
  if (treeContainer.value) {
    treeInstance.value = new Tree(
      treeContainer.value,
      props.data,
      props.options,
      events
    );
  }
});

// 清理
onBeforeUnmount(() => {
  if (treeInstance.value) {
    treeInstance.value.destroy();
  }
});

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    if (treeInstance.value) {
      treeInstance.value.setData(newData);
    }
  },
  { deep: true }
);

// 监听配置变化
watch(
  () => props.options,
  (newOptions) => {
    if (treeInstance.value) {
      treeInstance.value.updateOptions(newOptions);
    }
  },
  { deep: true }
);

// 公开方法
defineExpose({
  // 获取树实例
  getTreeInstance: () => treeInstance.value,

  // 刷新
  refresh: () => treeInstance.value?.refresh(),

  // 搜索
  search: (query: string) => treeInstance.value?.search(query),
  clearSearch: () => treeInstance.value?.clearSearch(),

  // 选中
  selectNode: (nodeId: TreeNodeId) => {
    treeInstance.value?.selectionManager.select(nodeId);
    treeInstance.value?.refresh();
  },

  // 展开/折叠
  expandNode: (nodeId: TreeNodeId) => {
    treeInstance.value?.treeManager.expandNode(nodeId);
    treeInstance.value?.refresh();
  },
  collapseNode: (nodeId: TreeNodeId) => {
    treeInstance.value?.treeManager.collapseNode(nodeId);
    treeInstance.value?.refresh();
  },
  expandAll: () => {
    treeInstance.value?.treeManager.expandAll();
    treeInstance.value?.refresh();
  },
  collapseAll: () => {
    treeInstance.value?.treeManager.collapseAll();
    treeInstance.value?.refresh();
  },

  // 勾选
  checkNode: (nodeId: TreeNodeId, checked: boolean) => {
    treeInstance.value?.selectionManager.check(nodeId, checked);
    treeInstance.value?.refresh();
  },
  checkAll: () => {
    treeInstance.value?.selectionManager.checkAll();
    treeInstance.value?.refresh();
  },
  uncheckAll: () => {
    treeInstance.value?.selectionManager.uncheckAll();
    treeInstance.value?.refresh();
  },

  // 获取数据
  getSelectedNodes: () => treeInstance.value?.selectionManager.getSelectedNodes() || [],
  getCheckedNodes: () => treeInstance.value?.selectionManager.getCheckedNodes() || [],
  getNode: (nodeId: TreeNodeId) => treeInstance.value?.treeManager.getNode(nodeId),

  // CRUD
  addNode: (node: TreeNode, parentId?: TreeNodeId) => {
    treeInstance.value?.treeManager.addNode(node, parentId);
    treeInstance.value?.refresh();
  },
  removeNode: (nodeId: TreeNodeId) => {
    const result = treeInstance.value?.treeManager.removeNode(nodeId);
    treeInstance.value?.refresh();
    return result;
  },
  updateNode: (nodeId: TreeNodeId, updates: Partial<TreeNode>) => {
    const result = treeInstance.value?.treeManager.updateNode(nodeId, updates);
    treeInstance.value?.refresh();
    return result;
  },
});
</script>

<style scoped>
.ldesign-tree-vue {
  overflow: auto;
  position: relative;
}

:deep(.ldesign-tree) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  color: #333;
}

:deep(.tree-node) {
  display: flex;
  align-items: center;
  padding: 4px 0;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s;
}

:deep(.tree-node:hover) {
  background-color: #f5f5f5;
}

:deep(.tree-node-selected) {
  background-color: #e6f7ff;
}

:deep(.tree-node-disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

:deep(.tree-expand-icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  font-size: 12px;
  cursor: pointer;
}

:deep(.tree-expand-placeholder) {
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

:deep(.tree-checkbox) {
  margin-right: 8px;
  cursor: pointer;
}

:deep(.tree-icon) {
  margin-right: 8px;
  font-size: 16px;
}

:deep(.tree-label) {
  flex: 1;
}

:deep(.tree-loading) {
  margin-left: 8px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

:deep(.tree-highlight) {
  background-color: yellow;
  padding: 2px 4px;
  border-radius: 2px;
}
</style>
