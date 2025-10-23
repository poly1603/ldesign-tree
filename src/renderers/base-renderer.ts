/**
 * @ldesign/tree - 基础渲染器
 */

import type { TreeNode, TreeOptions, FlatTreeNode } from '../types';

export interface RenderContext {
  node: FlatTreeNode;
  index: number;
  options: TreeOptions;
}

export abstract class BaseRenderer<T = any> {
  protected options: TreeOptions;

  constructor(options: TreeOptions = {}) {
    this.options = options;
  }

  /**
   * 渲染节点
   */
  abstract renderNode(context: RenderContext): HTMLElement | string;

  /**
   * 更新节点
   */
  abstract updateNode(element: HTMLElement, context: RenderContext): void;

  /**
   * 销毁
   */
  abstract destroy(): void;

  /**
   * 获取节点缩进
   */
  protected getIndent(level: number): number {
    return level * (this.options.indent || 20);
  }

  /**
   * 获取节点图标类名
   */
  protected getIconClass(node: TreeNode): string {
    if (node.icon) {
      return node.icon;
    }

    if (node.isLeaf || (!node.children?.length && !node.loading)) {
      return 'tree-icon-file';
    }

    return node.expanded ? 'tree-icon-folder-open' : 'tree-icon-folder';
  }

  /**
   * 获取展开图标类名
   */
  protected getExpandIconClass(node: TreeNode): string {
    if (node.isLeaf || (!node.children?.length && !node.loading)) {
      return 'tree-expand-icon-leaf';
    }

    return node.expanded ? 'tree-expand-icon-expanded' : 'tree-expand-icon-collapsed';
  }

  /**
   * 获取节点类名
   */
  protected getNodeClass(node: TreeNode): string {
    const classes = ['tree-node'];

    if (node.selected) classes.push('tree-node-selected');
    if (node.disabled) classes.push('tree-node-disabled');
    if (node.expanded) classes.push('tree-node-expanded');
    if (node.isLeaf) classes.push('tree-node-leaf');
    if (node.loading) classes.push('tree-node-loading');

    return classes.join(' ');
  }
}

