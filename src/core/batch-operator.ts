/**
 * @ldesign/tree - 批量操作器
 * 支持批量选中、删除、移动、导出等操作
 */

import type { TreeNode, TreeNodeId, ExportOptions } from '../types';
import type { TreeManager } from './tree-manager';
import type { SelectionManager } from './selection-manager';
import { exportTree } from '../utils';

export class BatchOperator<T = any> {
  private treeManager: TreeManager<T>;
  private selectionManager: SelectionManager<T>;

  constructor(treeManager: TreeManager<T>, selectionManager: SelectionManager<T>) {
    this.treeManager = treeManager;
    this.selectionManager = selectionManager;
  }

  /**
   * 批量选中节点
   */
  selectNodes(nodeIds: TreeNodeId[]): void {
    this.selectionManager.selectMultiple(nodeIds);
  }

  /**
   * 批量取消选中
   */
  unselectNodes(nodeIds: TreeNodeId[]): void {
    nodeIds.forEach((id) => this.selectionManager.unselect(id));
  }

  /**
   * 批量勾选节点
   */
  checkNodes(nodeIds: TreeNodeId[], checked = true): void {
    this.selectionManager.checkMultiple(nodeIds, checked);
  }

  /**
   * 批量删除节点
   */
  deleteNodes(nodeIds: TreeNodeId[]): { success: number; failed: number } {
    let success = 0;
    let failed = 0;

    // 从后往前删除，避免索引变化
    const sortedIds = [...nodeIds].reverse();

    sortedIds.forEach((id) => {
      const result = this.treeManager.removeNode(id);
      if (result) {
        success++;
      } else {
        failed++;
      }
    });

    return { success, failed };
  }

  /**
   * 批量删除选中的节点
   */
  deleteSelected(): { success: number; failed: number } {
    const selectedNodes = this.selectionManager.getSelectedNodes();
    const nodeIds = selectedNodes.map((node) => node.id);
    return this.deleteNodes(nodeIds);
  }

  /**
   * 批量删除勾选的节点
   */
  deleteChecked(): { success: number; failed: number } {
    const checkedNodes = this.selectionManager.getCheckedNodes();
    const nodeIds = checkedNodes.map((node) => node.id);
    return this.deleteNodes(nodeIds);
  }

  /**
   * 批量移动节点
   */
  moveNodes(nodeIds: TreeNodeId[], targetParentId: TreeNodeId | null): {
    success: number;
    failed: number;
  } {
    let success = 0;
    let failed = 0;

    nodeIds.forEach((id) => {
      const result = this.treeManager.moveNode(id, targetParentId);
      if (result) {
        success++;
      } else {
        failed++;
      }
    });

    return { success, failed };
  }

  /**
   * 批量更新节点
   */
  updateNodes(
    nodeIds: TreeNodeId[],
    updates: Partial<TreeNode<T>>
  ): { success: number; failed: number } {
    let success = 0;
    let failed = 0;

    nodeIds.forEach((id) => {
      const result = this.treeManager.updateNode(id, updates);
      if (result) {
        success++;
      } else {
        failed++;
      }
    });

    return { success, failed };
  }

  /**
   * 批量展开节点
   */
  expandNodes(nodeIds: TreeNodeId[]): void {
    nodeIds.forEach((id) => this.treeManager.expandNode(id));
  }

  /**
   * 批量折叠节点
   */
  collapseNodes(nodeIds: TreeNodeId[]): void {
    nodeIds.forEach((id) => this.treeManager.collapseNode(id));
  }

  /**
   * 展开所有节点
   */
  expandAll(): void {
    this.treeManager.expandAll();
  }

  /**
   * 折叠所有节点
   */
  collapseAll(): void {
    this.treeManager.collapseAll();
  }

  /**
   * 批量导出节点
   */
  exportNodes(nodeIds: TreeNodeId[], options: ExportOptions): string | Blob {
    const nodes = nodeIds
      .map((id) => this.treeManager.getNode(id))
      .filter((node): node is TreeNode<T> => node !== undefined);

    return exportTree(nodes, options);
  }

  /**
   * 导出选中的节点
   */
  exportSelected(options: Omit<ExportOptions, 'selectedOnly'>): string | Blob {
    const selectedNodes = this.selectionManager.getSelectedNodes();
    return exportTree(selectedNodes, { ...options, selectedOnly: true });
  }

  /**
   * 导出勾选的节点
   */
  exportChecked(options: Omit<ExportOptions, 'selectedOnly'>): string | Blob {
    const checkedNodes = this.selectionManager.getCheckedNodes();
    return exportTree(checkedNodes, { ...options, selectedOnly: true });
  }

  /**
   * 导出所有节点
   */
  exportAll(options: ExportOptions): string | Blob {
    const rootNodes = this.treeManager.getRootNodes();
    return exportTree(rootNodes, options);
  }

  /**
   * 批量设置节点属性
   */
  setNodeProperty<K extends keyof TreeNode<T>>(
    nodeIds: TreeNodeId[],
    key: K,
    value: TreeNode<T>[K]
  ): void {
    nodeIds.forEach((id) => {
      this.treeManager.updateNode(id, { [key]: value } as Partial<TreeNode<T>>);
    });
  }

  /**
   * 批量禁用节点
   */
  disableNodes(nodeIds: TreeNodeId[]): void {
    this.setNodeProperty(nodeIds, 'disabled', true);
  }

  /**
   * 批量启用节点
   */
  enableNodes(nodeIds: TreeNodeId[]): void {
    this.setNodeProperty(nodeIds, 'disabled', false);
  }

  /**
   * 获取操作统计
   */
  getStats() {
    const allNodes = this.treeManager.getAllNodes();
    const selectedNodes = this.selectionManager.getSelectedNodes();
    const checkedNodes = this.selectionManager.getCheckedNodes();

    return {
      totalNodes: allNodes.length,
      selectedCount: selectedNodes.length,
      checkedCount: checkedNodes.length,
      selectableNodes: allNodes.filter((n) => !n.disabled).length,
    };
  }
}

