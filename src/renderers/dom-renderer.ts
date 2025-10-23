/**
 * @ldesign/tree - DOM 渲染器
 */

import { BaseRenderer, RenderContext } from './base-renderer';
import type { TreeOptions } from '../types';

export class DOMRenderer<T = any> extends BaseRenderer<T> {
  constructor(options: TreeOptions = {}) {
    super(options);
  }

  /**
   * 渲染节点
   */
  renderNode(context: RenderContext): HTMLElement {
    const { node, options } = context;
    const container = document.createElement('div');
    container.className = this.getNodeClass(node);
    container.setAttribute('data-node-id', String(node.id));
    container.style.paddingLeft = `${this.getIndent(node.level)}px`;

    // 展开/折叠图标
    if (!node.isLeaf || node.children?.length) {
      const expandIcon = document.createElement('span');
      expandIcon.className = `tree-expand-icon ${this.getExpandIconClass(node)}`;
      expandIcon.textContent = node.expanded ? '▼' : '▶';
      container.appendChild(expandIcon);
    } else {
      const expandPlaceholder = document.createElement('span');
      expandPlaceholder.className = 'tree-expand-placeholder';
      expandPlaceholder.style.width = '16px';
      expandPlaceholder.style.display = 'inline-block';
      container.appendChild(expandPlaceholder);
    }

    // 复选框
    if (options.checkable) {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'tree-checkbox';
      checkbox.checked = node.checked === 'checked';
      checkbox.indeterminate = node.checked === 'indeterminate';
      checkbox.disabled = node.disabled || false;
      container.appendChild(checkbox);
    }

    // 节点图标
    if (options.showIcon !== false) {
      const icon = document.createElement('span');
      icon.className = `tree-icon ${this.getIconClass(node)}`;
      icon.textContent = node.isLeaf ? '📄' : node.expanded ? '📂' : '📁';
      container.appendChild(icon);
    }

    // 节点文本
    const label = document.createElement('span');
    label.className = 'tree-label';
    label.textContent = node.label;
    container.appendChild(label);

    // 加载状态
    if (node.loading) {
      const loading = document.createElement('span');
      loading.className = 'tree-loading';
      loading.textContent = '⏳';
      container.appendChild(loading);
    }

    // 连接线
    if (options.showLine) {
      this.addConnectionLines(container, node);
    }

    return container;
  }

  /**
   * 更新节点
   */
  updateNode(element: HTMLElement, context: RenderContext): void {
    const { node, options } = context;

    element.className = this.getNodeClass(node);
    element.style.paddingLeft = `${this.getIndent(node.level)}px`;

    // 更新展开图标
    const expandIcon = element.querySelector('.tree-expand-icon');
    if (expandIcon) {
      expandIcon.className = `tree-expand-icon ${this.getExpandIconClass(node)}`;
      expandIcon.textContent = node.expanded ? '▼' : '▶';
    }

    // 更新复选框
    if (options.checkable) {
      const checkbox = element.querySelector('.tree-checkbox') as HTMLInputElement;
      if (checkbox) {
        checkbox.checked = node.checked === 'checked';
        checkbox.indeterminate = node.checked === 'indeterminate';
        checkbox.disabled = node.disabled || false;
      }
    }

    // 更新图标
    const icon = element.querySelector('.tree-icon');
    if (icon && options.showIcon !== false) {
      icon.className = `tree-icon ${this.getIconClass(node)}`;
      icon.textContent = node.isLeaf ? '📄' : node.expanded ? '📂' : '📁';
    }

    // 更新文本
    const label = element.querySelector('.tree-label');
    if (label) {
      label.textContent = node.label;
    }

    // 更新加载状态
    let loading = element.querySelector('.tree-loading');
    if (node.loading) {
      if (!loading) {
        loading = document.createElement('span');
        loading.className = 'tree-loading';
        loading.textContent = '⏳';
        element.appendChild(loading);
      }
    } else if (loading) {
      loading.remove();
    }
  }

  /**
   * 添加连接线
   */
  private addConnectionLines(element: HTMLElement, node: any): void {
    // 简单的连接线实现
    // 可以使用 SVG 或 CSS 实现更复杂的连接线
    element.style.position = 'relative';
  }

  /**
   * 销毁
   */
  destroy(): void {
    // 清理资源
  }
}

