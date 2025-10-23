/**
 * @ldesign/tree - React Hook
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Tree, TreeNode, TreeOptions, TreeEvents, TreeNodeId } from '../../../index';

export interface UseTreeOptions extends TreeOptions {
  data?: TreeNode[];
  events?: TreeEvents;
}

export interface UseTreeReturn {
  treeRef: React.RefObject<HTMLDivElement>;
  treeInstance: Tree | null;
  selectedNodes: TreeNode[];
  checkedNodes: TreeNode[];
  searchQuery: string;
  loading: boolean;

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
  const treeRef = useRef<HTMLDivElement>(null);
  const treeInstanceRef = useRef<Tree | null>(null);

  const [selectedNodes, setSelectedNodes] = useState<TreeNode[]>([]);
  const [checkedNodes, setCheckedNodes] = useState<TreeNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // 初始化树
  useEffect(() => {
    if (treeRef.current && !treeInstanceRef.current) {
      treeInstanceRef.current = new Tree(
        treeRef.current,
        options.data || [],
        options,
        options.events
      );

      updateState();
    }

    return () => {
      if (treeInstanceRef.current) {
        treeInstanceRef.current.destroy();
        treeInstanceRef.current = null;
      }
    };
  }, []);

  // 监听数据变化
  useEffect(() => {
    if (treeInstanceRef.current && options.data) {
      treeInstanceRef.current.setData(options.data);
      updateState();
    }
  }, [options.data]);

  // 更新状态
  const updateState = useCallback(() => {
    if (treeInstanceRef.current) {
      setSelectedNodes(treeInstanceRef.current.selectionManager.getSelectedNodes());
      setCheckedNodes(treeInstanceRef.current.selectionManager.getCheckedNodes());
    }
  }, []);

  // 刷新
  const refresh = useCallback(() => {
    treeInstanceRef.current?.refresh();
    updateState();
  }, [updateState]);

  // 搜索
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    treeInstanceRef.current?.search(query);
  }, []);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    treeInstanceRef.current?.clearSearch();
  }, []);

  // 选中节点
  const selectNode = useCallback((nodeId: TreeNodeId) => {
    if (treeInstanceRef.current) {
      treeInstanceRef.current.selectionManager.select(nodeId);
      refresh();
    }
  }, [refresh]);

  // 展开节点
  const expandNode = useCallback((nodeId: TreeNodeId) => {
    if (treeInstanceRef.current) {
      treeInstanceRef.current.treeManager.expandNode(nodeId);
      refresh();
    }
  }, [refresh]);

  // 折叠节点
  const collapseNode = useCallback((nodeId: TreeNodeId) => {
    if (treeInstanceRef.current) {
      treeInstanceRef.current.treeManager.collapseNode(nodeId);
      refresh();
    }
  }, [refresh]);

  // 展开所有
  const expandAll = useCallback(() => {
    if (treeInstanceRef.current) {
      treeInstanceRef.current.treeManager.expandAll();
      refresh();
    }
  }, [refresh]);

  // 折叠所有
  const collapseAll = useCallback(() => {
    if (treeInstanceRef.current) {
      treeInstanceRef.current.treeManager.collapseAll();
      refresh();
    }
  }, [refresh]);

  // 勾选节点
  const checkNode = useCallback((nodeId: TreeNodeId, checked: boolean) => {
    if (treeInstanceRef.current) {
      treeInstanceRef.current.selectionManager.check(nodeId, checked);
      refresh();
    }
  }, [refresh]);

  // 获取节点
  const getNode = useCallback((nodeId: TreeNodeId): TreeNode | undefined => {
    return treeInstanceRef.current?.treeManager.getNode(nodeId);
  }, []);

  // 添加节点
  const addNode = useCallback((node: TreeNode, parentId?: TreeNodeId) => {
    if (treeInstanceRef.current) {
      treeInstanceRef.current.treeManager.addNode(node, parentId);
      refresh();
    }
  }, [refresh]);

  // 删除节点
  const removeNode = useCallback((nodeId: TreeNodeId): boolean => {
    if (treeInstanceRef.current) {
      const result = treeInstanceRef.current.treeManager.removeNode(nodeId);
      refresh();
      return result;
    }
    return false;
  }, [refresh]);

  // 更新节点
  const updateNode = useCallback((nodeId: TreeNodeId, updates: Partial<TreeNode>): boolean => {
    if (treeInstanceRef.current) {
      const result = treeInstanceRef.current.treeManager.updateNode(nodeId, updates);
      refresh();
      return result;
    }
    return false;
  }, [refresh]);

  return {
    treeRef,
    treeInstance: treeInstanceRef.current,
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

