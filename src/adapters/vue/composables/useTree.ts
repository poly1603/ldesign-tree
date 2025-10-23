/**
 * @ldesign/tree - Vue Composition API
 */

import { ref, onMounted, onBeforeUnmount, watch, Ref } from 'vue';
import { Tree, TreeNode, TreeOptions, TreeEvents, TreeNodeId } from '../../../index';

export interface UseTreeOptions extends TreeOptions {
  data?: TreeNode[];
  events?: TreeEvents;
}

export interface UseTreeReturn {
  treeRef: Ref<HTMLElement | null>;
  treeInstance: Ref<Tree | null>;
  selectedNodes: Ref<TreeNode[]>;
  checkedNodes: Ref<TreeNode[]>;
  searchQuery: Ref<string>;
  loading: Ref<boolean>;

  // 方法
  refresh: () => void;
  search: (query: string) => void;
  clearSearch: () => void;
  selectNode: (nodeId: TreeNodeId) => void;
  expandNode: (nodeId: TreeNodeId) => void;
  collapseNode: (nodeId: TreeNodeId) => void;
  expandAll: () => void;
  collapseAll: () => void;
  checkNode: (nodeId: TreeNodeId, checked: boolean) => void;
  getNode: (nodeId: TreeNodeId) => TreeNode | undefined;
  addNode: (node: TreeNode, parentId?: TreeNodeId) => void;
  removeNode: (nodeId: TreeNodeId) => boolean;
  updateNode: (nodeId: TreeNodeId, updates: Partial<TreeNode>) => boolean;
}

export function useTree(options: UseTreeOptions = {}): UseTreeReturn {
  const treeRef = ref<HTMLElement | null>(null);
  const treeInstance = ref<Tree | null>(null);
  const selectedNodes = ref<TreeNode[]>([]);
  const checkedNodes = ref<TreeNode[]>([]);
  const searchQuery = ref('');
  const loading = ref(false);

  // 初始化树
  onMounted(() => {
    if (treeRef.value) {
      treeInstance.value = new Tree(
        treeRef.value,
        options.data || [],
        options,
        options.events
      );

      // 更新选中节点
      updateSelectedNodes();
      updateCheckedNodes();
    }
  });

  // 清理
  onBeforeUnmount(() => {
    if (treeInstance.value) {
      treeInstance.value.destroy();
      treeInstance.value = null;
    }
  });

  // 监听数据变化
  watch(
    () => options.data,
    (newData) => {
      if (treeInstance.value && newData) {
        treeInstance.value.setData(newData);
        updateSelectedNodes();
        updateCheckedNodes();
      }
    },
    { deep: true }
  );

  // 更新选中节点列表
  function updateSelectedNodes() {
    if (treeInstance.value) {
      selectedNodes.value = treeInstance.value.selectionManager.getSelectedNodes();
    }
  }

  // 更新勾选节点列表
  function updateCheckedNodes() {
    if (treeInstance.value) {
      checkedNodes.value = treeInstance.value.selectionManager.getCheckedNodes();
    }
  }

  // 刷新
  function refresh() {
    treeInstance.value?.refresh();
    updateSelectedNodes();
    updateCheckedNodes();
  }

  // 搜索
  function search(query: string) {
    searchQuery.value = query;
    treeInstance.value?.search(query);
  }

  // 清除搜索
  function clearSearch() {
    searchQuery.value = '';
    treeInstance.value?.clearSearch();
  }

  // 选中节点
  function selectNode(nodeId: TreeNodeId) {
    if (treeInstance.value) {
      treeInstance.value.selectionManager.select(nodeId);
      refresh();
    }
  }

  // 展开节点
  function expandNode(nodeId: TreeNodeId) {
    if (treeInstance.value) {
      treeInstance.value.treeManager.expandNode(nodeId);
      refresh();
    }
  }

  // 折叠节点
  function collapseNode(nodeId: TreeNodeId) {
    if (treeInstance.value) {
      treeInstance.value.treeManager.collapseNode(nodeId);
      refresh();
    }
  }

  // 展开所有
  function expandAll() {
    if (treeInstance.value) {
      treeInstance.value.treeManager.expandAll();
      refresh();
    }
  }

  // 折叠所有
  function collapseAll() {
    if (treeInstance.value) {
      treeInstance.value.treeManager.collapseAll();
      refresh();
    }
  }

  // 勾选节点
  function checkNode(nodeId: TreeNodeId, checked: boolean) {
    if (treeInstance.value) {
      treeInstance.value.selectionManager.check(nodeId, checked);
      refresh();
    }
  }

  // 获取节点
  function getNode(nodeId: TreeNodeId): TreeNode | undefined {
    return treeInstance.value?.treeManager.getNode(nodeId);
  }

  // 添加节点
  function addNode(node: TreeNode, parentId?: TreeNodeId) {
    if (treeInstance.value) {
      treeInstance.value.treeManager.addNode(node, parentId);
      refresh();
    }
  }

  // 删除节点
  function removeNode(nodeId: TreeNodeId): boolean {
    if (treeInstance.value) {
      const result = treeInstance.value.treeManager.removeNode(nodeId);
      refresh();
      return result;
    }
    return false;
  }

  // 更新节点
  function updateNode(nodeId: TreeNodeId, updates: Partial<TreeNode>): boolean {
    if (treeInstance.value) {
      const result = treeInstance.value.treeManager.updateNode(nodeId, updates);
      refresh();
      return result;
    }
    return false;
  }

  return {
    treeRef,
    treeInstance,
    selectedNodes,
    checkedNodes,
    searchQuery,
    loading,
    refresh,
    search,
    clearSearch,
    selectNode,
    expandNode,
    collapseNode,
    expandAll,
    collapseAll,
    checkNode,
    getNode,
    addNode,
    removeNode,
    updateNode,
  };
}

