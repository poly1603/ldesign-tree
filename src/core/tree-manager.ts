/**
 * @ldesign/tree - 树数据管理器
 * 负责树形数据的 CRUD、层级关系维护、路径计算等
 */

import type {
  TreeNode,
  TreeNodeId,
  FlatTreeNode,
  TreeOptions,
  CheckState,
} from '../types';

export class TreeManager<T = any> {
  private nodes: Map<TreeNodeId, TreeNode<T>> = new Map();
  private flatNodes: FlatTreeNode<T>[] = [];
  private rootNodes: TreeNode<T>[] = [];
  private options: TreeOptions;

  constructor(data: TreeNode<T>[] = [], options: TreeOptions = {}) {
    this.options = {
      indent: 20,
      showLine: false,
      showIcon: true,
      checkable: false,
      multiple: false,
      draggable: false,
      defaultExpandAll: false,
      virtual: true,
      itemHeight: 32,
      highlightCurrent: true,
      ...options,
    };

    this.setData(data);
  }

  /**
   * 设置树数据
   */
  setData(data: TreeNode<T>[]): void {
    this.nodes.clear();
    this.flatNodes = [];
    this.rootNodes = data;

    // 构建节点映射和扁平化列表
    this.buildNodeMap(data);
    this.flattenNodes();

    // 应用默认展开
    if (this.options.defaultExpandAll) {
      this.expandAll();
    } else if (this.options.defaultExpandedKeys?.length) {
      this.expandKeys(this.options.defaultExpandedKeys);
    }

    // 应用默认选中
    if (this.options.defaultSelectedKeys?.length) {
      this.selectKeys(this.options.defaultSelectedKeys);
    }

    // 应用默认勾选
    if (this.options.defaultCheckedKeys?.length) {
      this.checkKeys(this.options.defaultCheckedKeys);
    }
  }

  /**
   * 构建节点映射
   */
  private buildNodeMap(nodes: TreeNode<T>[], parent?: TreeNode<T>, level = 0): void {
    nodes.forEach((node) => {
      node.level = level;
      node.parentId = parent?.id;
      this.nodes.set(node.id, node);

      if (node.children?.length) {
        this.buildNodeMap(node.children, node, level + 1);
      }
    });
  }

  /**
   * 扁平化节点列表（用于虚拟滚动）
   */
  private flattenNodes(): void {
    this.flatNodes = [];
    this.flattenNodesRecursive(this.rootNodes);
  }

  private flattenNodesRecursive(
    nodes: TreeNode<T>[],
    parent?: FlatTreeNode<T>,
    parentVisible = true
  ): void {
    nodes.forEach((node) => {
      const flatNode: FlatTreeNode<T> = {
        ...node,
        level: node.level || 0,
        path: this.getNodePath(node.id),
        visible: parentVisible,
        parent,
        index: this.flatNodes.length,
      };

      this.flatNodes.push(flatNode);

      if (node.children?.length && node.expanded) {
        this.flattenNodesRecursive(
          node.children,
          flatNode,
          parentVisible && !!node.expanded
        );
      }
    });
  }

  /**
   * 获取节点路径
   */
  getNodePath(nodeId: TreeNodeId): TreeNodeId[] {
    const path: TreeNodeId[] = [];
    let current = this.nodes.get(nodeId);

    while (current) {
      path.unshift(current.id);
      current = current.parentId ? this.nodes.get(current.parentId) : undefined;
    }

    return path;
  }

  /**
   * 获取节点
   */
  getNode(nodeId: TreeNodeId): TreeNode<T> | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * 获取所有节点
   */
  getAllNodes(): TreeNode<T>[] {
    return Array.from(this.nodes.values());
  }

  /**
   * 获取扁平化节点列表
   */
  getFlatNodes(): FlatTreeNode<T>[] {
    return this.flatNodes;
  }

  /**
   * 获取可见节点列表
   */
  getVisibleNodes(): FlatTreeNode<T>[] {
    return this.flatNodes.filter((node) => node.visible);
  }

  /**
   * 获取根节点
   */
  getRootNodes(): TreeNode<T>[] {
    return this.rootNodes;
  }

  /**
   * 添加节点
   */
  addNode(node: TreeNode<T>, parentId?: TreeNodeId): void {
    if (parentId) {
      const parent = this.nodes.get(parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(node);
        parent.isLeaf = false;
      }
    } else {
      this.rootNodes.push(node);
    }

    this.nodes.set(node.id, node);
    this.flattenNodes();
  }

  /**
   * 删除节点
   */
  removeNode(nodeId: TreeNodeId): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    // 从父节点的子节点列表中移除
    if (node.parentId) {
      const parent = this.nodes.get(node.parentId);
      if (parent?.children) {
        parent.children = parent.children.filter((child) => child.id !== nodeId);
        if (parent.children.length === 0) {
          parent.isLeaf = true;
        }
      }
    } else {
      this.rootNodes = this.rootNodes.filter((n) => n.id !== nodeId);
    }

    // 递归删除子节点
    this.removeNodeRecursive(node);
    this.flattenNodes();

    return true;
  }

  private removeNodeRecursive(node: TreeNode<T>): void {
    this.nodes.delete(node.id);
    if (node.children) {
      node.children.forEach((child) => this.removeNodeRecursive(child));
    }
  }

  /**
   * 更新节点
   */
  updateNode(nodeId: TreeNodeId, updates: Partial<TreeNode<T>>): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    Object.assign(node, updates);
    this.flattenNodes();
    return true;
  }

  /**
   * 展开节点
   */
  expandNode(nodeId: TreeNodeId): void {
    const node = this.nodes.get(nodeId);
    if (node && !node.isLeaf) {
      node.expanded = true;
      this.flattenNodes();
    }
  }

  /**
   * 折叠节点
   */
  collapseNode(nodeId: TreeNodeId): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.expanded = false;
      this.flattenNodes();
    }
  }

  /**
   * 切换展开/折叠
   */
  toggleExpand(nodeId: TreeNodeId): boolean {
    const node = this.nodes.get(nodeId);
    if (!node || node.isLeaf) return false;

    node.expanded = !node.expanded;
    this.flattenNodes();
    return !!node.expanded;
  }

  /**
   * 展开所有节点
   */
  expandAll(): void {
    this.nodes.forEach((node) => {
      if (!node.isLeaf) {
        node.expanded = true;
      }
    });
    this.flattenNodes();
  }

  /**
   * 折叠所有节点
   */
  collapseAll(): void {
    this.nodes.forEach((node) => {
      node.expanded = false;
    });
    this.flattenNodes();
  }

  /**
   * 展开指定的节点列表
   */
  expandKeys(keys: TreeNodeId[]): void {
    keys.forEach((key) => this.expandNode(key));
  }

  /**
   * 选中节点
   */
  selectNode(nodeId: TreeNodeId, multiple = false): void {
    if (!multiple) {
      // 单选模式：取消其他节点的选中状态
      this.nodes.forEach((node) => {
        node.selected = false;
      });
    }

    const node = this.nodes.get(nodeId);
    if (node && !node.disabled) {
      node.selected = true;
    }
  }

  /**
   * 取消选中节点
   */
  unselectNode(nodeId: TreeNodeId): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.selected = false;
    }
  }

  /**
   * 选中多个节点
   */
  selectKeys(keys: TreeNodeId[]): void {
    keys.forEach((key) => this.selectNode(key, true));
  }

  /**
   * 获取选中的节点
   */
  getSelectedNodes(): TreeNode<T>[] {
    return Array.from(this.nodes.values()).filter((node) => node.selected);
  }

  /**
   * 勾选节点（复选框）
   */
  checkNode(nodeId: TreeNodeId, checked: boolean, cascade = true): void {
    const node = this.nodes.get(nodeId);
    if (!node || node.disabled) return;

    node.checked = checked ? 'checked' : 'unchecked';

    if (cascade) {
      // 向下级联勾选子节点
      this.cascadeCheckChildren(node, checked);
      // 向上更新父节点状态
      this.updateParentCheckState(node);
    }
  }

  /**
   * 级联勾选子节点
   */
  private cascadeCheckChildren(node: TreeNode<T>, checked: boolean): void {
    if (node.children) {
      node.children.forEach((child) => {
        if (!child.disabled) {
          child.checked = checked ? 'checked' : 'unchecked';
          this.cascadeCheckChildren(child, checked);
        }
      });
    }
  }

  /**
   * 更新父节点勾选状态
   */
  private updateParentCheckState(node: TreeNode<T>): void {
    if (!node.parentId) return;

    const parent = this.nodes.get(node.parentId);
    if (!parent || !parent.children) return;

    const checkedCount = parent.children.filter((n) => n.checked === 'checked').length;
    const uncheckedCount = parent.children.filter((n) => n.checked === 'unchecked').length;

    if (checkedCount === parent.children.length) {
      parent.checked = 'checked';
    } else if (uncheckedCount === parent.children.length) {
      parent.checked = 'unchecked';
    } else {
      parent.checked = 'indeterminate';
    }

    this.updateParentCheckState(parent);
  }

  /**
   * 勾选多个节点
   */
  checkKeys(keys: TreeNodeId[], checked = true): void {
    keys.forEach((key) => this.checkNode(key, checked));
  }

  /**
   * 获取勾选的节点
   */
  getCheckedNodes(includeIndeterminate = false): TreeNode<T>[] {
    return Array.from(this.nodes.values()).filter((node) => {
      if (includeIndeterminate) {
        return node.checked === 'checked' || node.checked === 'indeterminate';
      }
      return node.checked === 'checked';
    });
  }

  /**
   * 获取半选的节点
   */
  getIndeterminateNodes(): TreeNode<T>[] {
    return Array.from(this.nodes.values()).filter(
      (node) => node.checked === 'indeterminate'
    );
  }

  /**
   * 获取子节点
   */
  getChildren(nodeId: TreeNodeId): TreeNode<T>[] {
    const node = this.nodes.get(nodeId);
    return node?.children || [];
  }

  /**
   * 获取父节点
   */
  getParent(nodeId: TreeNodeId): TreeNode<T> | undefined {
    const node = this.nodes.get(nodeId);
    return node?.parentId ? this.nodes.get(node.parentId) : undefined;
  }

  /**
   * 获取兄弟节点
   */
  getSiblings(nodeId: TreeNodeId): TreeNode<T>[] {
    const node = this.nodes.get(nodeId);
    if (!node) return [];

    if (node.parentId) {
      const parent = this.nodes.get(node.parentId);
      return parent?.children?.filter((n) => n.id !== nodeId) || [];
    }

    return this.rootNodes.filter((n) => n.id !== nodeId);
  }

  /**
   * 获取所有祖先节点
   */
  getAncestors(nodeId: TreeNodeId): TreeNode<T>[] {
    const ancestors: TreeNode<T>[] = [];
    let current = this.nodes.get(nodeId);

    while (current?.parentId) {
      const parent = this.nodes.get(current.parentId);
      if (parent) {
        ancestors.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }

    return ancestors;
  }

  /**
   * 获取所有后代节点
   */
  getDescendants(nodeId: TreeNodeId): TreeNode<T>[] {
    const node = this.nodes.get(nodeId);
    if (!node) return [];

    const descendants: TreeNode<T>[] = [];
    this.collectDescendants(node, descendants);
    return descendants;
  }

  private collectDescendants(node: TreeNode<T>, result: TreeNode<T>[]): void {
    if (node.children) {
      node.children.forEach((child) => {
        result.push(child);
        this.collectDescendants(child, result);
      });
    }
  }

  /**
   * 移动节点
   */
  moveNode(nodeId: TreeNodeId, targetParentId: TreeNodeId | null): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    // 不能移动到自己或自己的子节点下
    if (targetParentId === nodeId) return false;
    if (targetParentId && this.isDescendantOf(targetParentId, nodeId)) return false;

    // 从原位置移除
    if (node.parentId) {
      const oldParent = this.nodes.get(node.parentId);
      if (oldParent?.children) {
        oldParent.children = oldParent.children.filter((n) => n.id !== nodeId);
      }
    } else {
      this.rootNodes = this.rootNodes.filter((n) => n.id !== nodeId);
    }

    // 添加到新位置
    if (targetParentId) {
      const newParent = this.nodes.get(targetParentId);
      if (newParent) {
        if (!newParent.children) {
          newParent.children = [];
        }
        newParent.children.push(node);
        node.parentId = targetParentId;
        node.level = (newParent.level || 0) + 1;
      }
    } else {
      this.rootNodes.push(node);
      node.parentId = null;
      node.level = 0;
    }

    // 更新子节点的层级
    this.updateChildrenLevel(node);
    this.flattenNodes();

    return true;
  }

  /**
   * 更新子节点层级
   */
  private updateChildrenLevel(node: TreeNode<T>): void {
    if (node.children) {
      node.children.forEach((child) => {
        child.level = (node.level || 0) + 1;
        this.updateChildrenLevel(child);
      });
    }
  }

  /**
   * 判断节点是否是另一个节点的后代
   */
  isDescendantOf(nodeId: TreeNodeId, ancestorId: TreeNodeId): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    let current = node;
    while (current.parentId) {
      if (current.parentId === ancestorId) return true;
      const parent = this.nodes.get(current.parentId);
      if (!parent) break;
      current = parent;
    }

    return false;
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    this.nodes.clear();
    this.flatNodes = [];
    this.rootNodes = [];
  }

  /**
   * 获取树的统计信息
   */
  getStats() {
    let maxDepth = 0;
    let leafCount = 0;

    this.nodes.forEach((node) => {
      if (node.level !== undefined && node.level > maxDepth) {
        maxDepth = node.level;
      }
      if (node.isLeaf || !node.children?.length) {
        leafCount++;
      }
    });

    return {
      totalNodes: this.nodes.size,
      rootNodes: this.rootNodes.length,
      maxDepth: maxDepth + 1,
      leafNodes: leafCount,
      expandedNodes: Array.from(this.nodes.values()).filter((n) => n.expanded).length,
      selectedNodes: this.getSelectedNodes().length,
      checkedNodes: this.getCheckedNodes().length,
    };
  }
}

