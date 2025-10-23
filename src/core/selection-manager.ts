/**
 * @ldesign/tree - 选择状态管理器
 * 管理节点的选中、复选框状态，支持单选、多选模式
 */

import type { TreeNode, TreeNodeId, CheckState } from '../types';
import type { TreeManager } from './tree-manager';

export interface SelectionState {
  /** 选中的节点 ID 集合 */
  selectedIds: Set<TreeNodeId>;
  /** 勾选的节点 ID 集合 */
  checkedIds: Set<TreeNodeId>;
  /** 半选的节点 ID 集合 */
  indeterminateIds: Set<TreeNodeId>;
  /** 当前高亮的节点 ID */
  currentId: TreeNodeId | null;
}

export class SelectionManager<T = any> {
  private treeManager: TreeManager<T>;
  private state: SelectionState;
  private multiple: boolean;
  private checkable: boolean;

  constructor(
    treeManager: TreeManager<T>,
    options: { multiple?: boolean; checkable?: boolean } = {}
  ) {
    this.treeManager = treeManager;
    this.multiple = options.multiple ?? false;
    this.checkable = options.checkable ?? false;
    this.state = {
      selectedIds: new Set(),
      checkedIds: new Set(),
      indeterminateIds: new Set(),
      currentId: null,
    };
  }

  /**
   * 选中节点
   */
  select(nodeId: TreeNodeId, clearOthers = true): boolean {
    const node = this.treeManager.getNode(nodeId);
    if (!node || node.disabled) return false;

    if (clearOthers && !this.multiple) {
      // 单选模式：清除其他选中
      this.state.selectedIds.clear();
      this.treeManager.getAllNodes().forEach((n) => {
        n.selected = false;
      });
    }

    this.state.selectedIds.add(nodeId);
    node.selected = true;
    this.state.currentId = nodeId;

    return true;
  }

  /**
   * 取消选中节点
   */
  unselect(nodeId: TreeNodeId): boolean {
    const node = this.treeManager.getNode(nodeId);
    if (!node) return false;

    this.state.selectedIds.delete(nodeId);
    node.selected = false;

    if (this.state.currentId === nodeId) {
      this.state.currentId = null;
    }

    return true;
  }

  /**
   * 切换选中状态
   */
  toggleSelect(nodeId: TreeNodeId): boolean {
    if (this.isSelected(nodeId)) {
      return this.unselect(nodeId);
    } else {
      return this.select(nodeId, !this.multiple);
    }
  }

  /**
   * 批量选中
   */
  selectMultiple(nodeIds: TreeNodeId[]): void {
    if (!this.multiple) {
      // 单选模式：只选中第一个
      if (nodeIds.length > 0) {
        this.select(nodeIds[0]);
      }
      return;
    }

    nodeIds.forEach((id) => {
      const node = this.treeManager.getNode(id);
      if (node && !node.disabled) {
        this.state.selectedIds.add(id);
        node.selected = true;
      }
    });

    if (nodeIds.length > 0) {
      this.state.currentId = nodeIds[nodeIds.length - 1];
    }
  }

  /**
   * 选中范围（从 start 到 end）
   */
  selectRange(startId: TreeNodeId, endId: TreeNodeId): void {
    if (!this.multiple) return;

    const flatNodes = this.treeManager.getFlatNodes();
    const startIndex = flatNodes.findIndex((n) => n.id === startId);
    const endIndex = flatNodes.findIndex((n) => n.id === endId);

    if (startIndex === -1 || endIndex === -1) return;

    const [from, to] = startIndex < endIndex
      ? [startIndex, endIndex]
      : [endIndex, startIndex];

    for (let i = from; i <= to; i++) {
      const node = flatNodes[i];
      if (!node.disabled) {
        this.state.selectedIds.add(node.id);
        node.selected = true;
      }
    }
  }

  /**
   * 清除所有选中
   */
  clearSelection(): void {
    this.state.selectedIds.forEach((id) => {
      const node = this.treeManager.getNode(id);
      if (node) {
        node.selected = false;
      }
    });
    this.state.selectedIds.clear();
    this.state.currentId = null;
  }

  /**
   * 全选
   */
  selectAll(): void {
    if (!this.multiple) return;

    this.treeManager.getAllNodes().forEach((node) => {
      if (!node.disabled) {
        this.state.selectedIds.add(node.id);
        node.selected = true;
      }
    });
  }

  /**
   * 反选
   */
  invertSelection(): void {
    if (!this.multiple) return;

    this.treeManager.getAllNodes().forEach((node) => {
      if (!node.disabled) {
        if (this.state.selectedIds.has(node.id)) {
          this.state.selectedIds.delete(node.id);
          node.selected = false;
        } else {
          this.state.selectedIds.add(node.id);
          node.selected = true;
        }
      }
    });
  }

  /**
   * 勾选节点（复选框）
   */
  check(nodeId: TreeNodeId, checked: boolean, cascade = true): boolean {
    if (!this.checkable) return false;

    const node = this.treeManager.getNode(nodeId);
    if (!node || node.disabled) return false;

    this.setNodeCheckState(node, checked ? 'checked' : 'unchecked');

    if (cascade) {
      // 向下级联
      this.cascadeCheckChildren(node, checked);
      // 向上更新
      this.updateParentCheckState(node);
    }

    this.updateCheckState();
    return true;
  }

  /**
   * 设置节点勾选状态
   */
  private setNodeCheckState(node: TreeNode, state: CheckState): void {
    node.checked = state;

    if (state === 'checked') {
      this.state.checkedIds.add(node.id);
      this.state.indeterminateIds.delete(node.id);
    } else if (state === 'unchecked') {
      this.state.checkedIds.delete(node.id);
      this.state.indeterminateIds.delete(node.id);
    } else if (state === 'indeterminate') {
      this.state.checkedIds.delete(node.id);
      this.state.indeterminateIds.add(node.id);
    }
  }

  /**
   * 级联勾选子节点
   */
  private cascadeCheckChildren(node: TreeNode, checked: boolean): void {
    const descendants = this.treeManager.getDescendants(node.id);
    descendants.forEach((child) => {
      if (!child.disabled) {
        this.setNodeCheckState(child, checked ? 'checked' : 'unchecked');
      }
    });
  }

  /**
   * 更新父节点勾选状态
   */
  private updateParentCheckState(node: TreeNode): void {
    const parent = this.treeManager.getParent(node.id);
    if (!parent) return;

    const children = this.treeManager.getChildren(parent.id);
    if (children.length === 0) return;

    const checkedCount = children.filter((n) => n.checked === 'checked').length;
    const uncheckedCount = children.filter((n) => n.checked === 'unchecked').length;

    if (checkedCount === children.length) {
      this.setNodeCheckState(parent, 'checked');
    } else if (uncheckedCount === children.length) {
      this.setNodeCheckState(parent, 'unchecked');
    } else {
      this.setNodeCheckState(parent, 'indeterminate');
    }

    this.updateParentCheckState(parent);
  }

  /**
   * 批量勾选
   */
  checkMultiple(nodeIds: TreeNodeId[], checked = true): void {
    if (!this.checkable) return;

    nodeIds.forEach((id) => {
      this.check(id, checked, false);
    });

    // 统一更新父节点状态
    nodeIds.forEach((id) => {
      const node = this.treeManager.getNode(id);
      if (node) {
        this.updateParentCheckState(node);
      }
    });

    this.updateCheckState();
  }

  /**
   * 全选（复选框）
   */
  checkAll(): void {
    if (!this.checkable) return;

    this.treeManager.getAllNodes().forEach((node) => {
      if (!node.disabled) {
        this.setNodeCheckState(node, 'checked');
      }
    });

    this.updateCheckState();
  }

  /**
   * 取消全选（复选框）
   */
  uncheckAll(): void {
    if (!this.checkable) return;

    this.treeManager.getAllNodes().forEach((node) => {
      this.setNodeCheckState(node, 'unchecked');
    });

    this.updateCheckState();
  }

  /**
   * 更新勾选状态集合
   */
  private updateCheckState(): void {
    this.state.checkedIds.clear();
    this.state.indeterminateIds.clear();

    this.treeManager.getAllNodes().forEach((node) => {
      if (node.checked === 'checked') {
        this.state.checkedIds.add(node.id);
      } else if (node.checked === 'indeterminate') {
        this.state.indeterminateIds.add(node.id);
      }
    });
  }

  /**
   * 判断节点是否选中
   */
  isSelected(nodeId: TreeNodeId): boolean {
    return this.state.selectedIds.has(nodeId);
  }

  /**
   * 判断节点是否勾选
   */
  isChecked(nodeId: TreeNodeId): boolean {
    return this.state.checkedIds.has(nodeId);
  }

  /**
   * 判断节点是否半选
   */
  isIndeterminate(nodeId: TreeNodeId): boolean {
    return this.state.indeterminateIds.has(nodeId);
  }

  /**
   * 判断节点是否为当前节点
   */
  isCurrent(nodeId: TreeNodeId): boolean {
    return this.state.currentId === nodeId;
  }

  /**
   * 设置当前节点
   */
  setCurrent(nodeId: TreeNodeId | null): void {
    this.state.currentId = nodeId;
  }

  /**
   * 获取选中的节点
   */
  getSelectedNodes(): TreeNode<T>[] {
    return Array.from(this.state.selectedIds)
      .map((id) => this.treeManager.getNode(id))
      .filter((node): node is TreeNode<T> => node !== undefined);
  }

  /**
   * 获取勾选的节点
   */
  getCheckedNodes(includeIndeterminate = false): TreeNode<T>[] {
    const ids = new Set(this.state.checkedIds);
    if (includeIndeterminate) {
      this.state.indeterminateIds.forEach((id) => ids.add(id));
    }

    return Array.from(ids)
      .map((id) => this.treeManager.getNode(id))
      .filter((node): node is TreeNode<T> => node !== undefined);
  }

  /**
   * 获取当前节点
   */
  getCurrentNode(): TreeNode<T> | null {
    if (!this.state.currentId) return null;
    return this.treeManager.getNode(this.state.currentId) || null;
  }

  /**
   * 获取状态
   */
  getState(): SelectionState {
    return {
      selectedIds: new Set(this.state.selectedIds),
      checkedIds: new Set(this.state.checkedIds),
      indeterminateIds: new Set(this.state.indeterminateIds),
      currentId: this.state.currentId,
    };
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      selectedCount: this.state.selectedIds.size,
      checkedCount: this.state.checkedIds.size,
      indeterminateCount: this.state.indeterminateIds.size,
      hasCurrent: this.state.currentId !== null,
      multiple: this.multiple,
      checkable: this.checkable,
    };
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.clearSelection();
    this.uncheckAll();
    this.state.currentId = null;
  }

  /**
   * 设置多选模式
   */
  setMultiple(multiple: boolean): void {
    this.multiple = multiple;
    if (!multiple && this.state.selectedIds.size > 1) {
      // 切换到单选模式时，只保留最后一个选中
      const lastId = Array.from(this.state.selectedIds).pop();
      this.clearSelection();
      if (lastId) {
        this.select(lastId);
      }
    }
  }

  /**
   * 设置可勾选模式
   */
  setCheckable(checkable: boolean): void {
    this.checkable = checkable;
    if (!checkable) {
      this.uncheckAll();
    }
  }
}

