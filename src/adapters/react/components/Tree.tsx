/**
 * @ldesign/tree - React 组件
 */

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Tree as TreeCore, TreeNode, TreeOptions, TreeEvents, TreeNodeId } from '../../../index';

export interface TreeProps {
  data?: TreeNode[];
  options?: TreeOptions;
  height?: number | string;
  width?: number | string;
  onNodeClick?: (node: TreeNode, event: MouseEvent) => void;
  onNodeDblClick?: (node: TreeNode, event: MouseEvent) => void;
  onNodeContextMenu?: (node: TreeNode, event: MouseEvent) => void;
  onNodeExpand?: (node: TreeNode, expanded: boolean) => void;
  onNodeCheck?: (node: TreeNode, checked: boolean, checkedNodes: TreeNode[]) => void;
  onSelectionChange?: (selectedNodes: TreeNode[]) => void;
}

export interface TreeRef {
  getTreeInstance: () => TreeCore | null;
  refresh: () => void;
  search: (query: string) => void;
  clearSearch: () => void;
  selectNode: (nodeId: TreeNodeId) => void;
  expandNode: (nodeId: TreeNodeId) => void;
  collapseNode: (nodeId: TreeNodeId) => void;
  expandAll: () => void;
  collapseAll: () => void;
  checkNode: (nodeId: TreeNodeId, checked: boolean) => void;
  checkAll: () => void;
  uncheckAll: () => void;
  getSelectedNodes: () => TreeNode[];
  getCheckedNodes: () => TreeNode[];
  getNode: (nodeId: TreeNodeId) => TreeNode | undefined;
  addNode: (node: TreeNode, parentId?: TreeNodeId) => void;
  removeNode: (nodeId: TreeNodeId) => boolean;
  updateNode: (nodeId: TreeNodeId, updates: Partial<TreeNode>) => boolean;
}

export const Tree = forwardRef<TreeRef, TreeProps>((props, ref) => {
  const {
    data = [],
    options = {},
    height = '400px',
    width = '100%',
    onNodeClick,
    onNodeDblClick,
    onNodeContextMenu,
    onNodeExpand,
    onNodeCheck,
    onSelectionChange,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const treeInstanceRef = useRef<TreeCore | null>(null);

  // 事件处理器
  const events: TreeEvents = {
    onNodeClick: (data) => {
      onNodeClick?.(data.node, data.event);
    },
    onNodeDblClick: (data) => {
      onNodeDblClick?.(data.node, data.event);
    },
    onNodeContextMenu: (data) => {
      onNodeContextMenu?.(data.node, data.event);
    },
    onNodeExpand: (data) => {
      onNodeExpand?.(data.node, data.expanded);
    },
    onNodeCheck: (data) => {
      onNodeCheck?.(data.node, data.checked, data.checkedNodes);
    },
  };

  // 初始化
  useEffect(() => {
    if (containerRef.current && !treeInstanceRef.current) {
      treeInstanceRef.current = new TreeCore(
        containerRef.current,
        data,
        options,
        events
      );
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
    if (treeInstanceRef.current) {
      treeInstanceRef.current.setData(data);
    }
  }, [data]);

  // 监听配置变化
  useEffect(() => {
    if (treeInstanceRef.current) {
      treeInstanceRef.current.updateOptions(options);
    }
  }, [options]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    getTreeInstance: () => treeInstanceRef.current,

    refresh: () => treeInstanceRef.current?.refresh(),

    search: (query: string) => treeInstanceRef.current?.search(query),
    clearSearch: () => treeInstanceRef.current?.clearSearch(),

    selectNode: (nodeId: TreeNodeId) => {
      treeInstanceRef.current?.selectionManager.select(nodeId);
      treeInstanceRef.current?.refresh();
    },

    expandNode: (nodeId: TreeNodeId) => {
      treeInstanceRef.current?.treeManager.expandNode(nodeId);
      treeInstanceRef.current?.refresh();
    },
    collapseNode: (nodeId: TreeNodeId) => {
      treeInstanceRef.current?.treeManager.collapseNode(nodeId);
      treeInstanceRef.current?.refresh();
    },
    expandAll: () => {
      treeInstanceRef.current?.treeManager.expandAll();
      treeInstanceRef.current?.refresh();
    },
    collapseAll: () => {
      treeInstanceRef.current?.treeManager.collapseAll();
      treeInstanceRef.current?.refresh();
    },

    checkNode: (nodeId: TreeNodeId, checked: boolean) => {
      treeInstanceRef.current?.selectionManager.check(nodeId, checked);
      treeInstanceRef.current?.refresh();
    },
    checkAll: () => {
      treeInstanceRef.current?.selectionManager.checkAll();
      treeInstanceRef.current?.refresh();
    },
    uncheckAll: () => {
      treeInstanceRef.current?.selectionManager.uncheckAll();
      treeInstanceRef.current?.refresh();
    },

    getSelectedNodes: () => treeInstanceRef.current?.selectionManager.getSelectedNodes() || [],
    getCheckedNodes: () => treeInstanceRef.current?.selectionManager.getCheckedNodes() || [],
    getNode: (nodeId: TreeNodeId) => treeInstanceRef.current?.treeManager.getNode(nodeId),

    addNode: (node: TreeNode, parentId?: TreeNodeId) => {
      treeInstanceRef.current?.treeManager.addNode(node, parentId);
      treeInstanceRef.current?.refresh();
    },
    removeNode: (nodeId: TreeNodeId) => {
      const result = treeInstanceRef.current?.treeManager.removeNode(nodeId);
      treeInstanceRef.current?.refresh();
      return result || false;
    },
    updateNode: (nodeId: TreeNodeId, updates: Partial<TreeNode>) => {
      const result = treeInstanceRef.current?.treeManager.updateNode(nodeId, updates);
      treeInstanceRef.current?.refresh();
      return result || false;
    },
  }));

  const containerStyle: React.CSSProperties = {
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width,
    overflow: 'auto',
    position: 'relative',
  };

  return (
    <div ref={containerRef} className="ldesign-tree-react" style={containerStyle}>
      {/* Tree will be rendered here by the core library */}
    </div>
  );
});

Tree.displayName = 'Tree';

export default Tree;

