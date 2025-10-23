/**
 * @ldesign/tree - 拖拽处理器
 * 支持节点拖拽排序、跨层级移动、拖拽验证等
 */

import type { TreeNode, TreeNodeId, DropType, DragEventData, TreeOptions } from '../types';
import type { TreeManager } from './tree-manager';

export interface DragState {
  isDragging: boolean;
  dragNode: TreeNode | null;
  dropNode: TreeNode | null;
  dropType: DropType | null;
  canDrop: boolean;
}

export class DragHandler<T = any> {
  private state: DragState;
  private treeManager: TreeManager<T>;
  private options: TreeOptions;
  private dragGhost: HTMLElement | null = null;

  constructor(treeManager: TreeManager<T>, options: TreeOptions = {}) {
    this.treeManager = treeManager;
    this.options = options;
    this.state = {
      isDragging: false,
      dragNode: null,
      dropNode: null,
      dropType: null,
      canDrop: false,
    };
  }

  /**
   * 开始拖拽
   */
  startDrag(nodeId: TreeNodeId, event: DragEvent): boolean {
    const node = this.treeManager.getNode(nodeId);
    if (!node) return false;

    // 检查是否允许拖拽
    if (this.options.allowDrag && !this.options.allowDrag(node)) {
      return false;
    }

    this.state.isDragging = true;
    this.state.dragNode = node;

    // 设置拖拽数据
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(nodeId));

      // 创建拖拽幽灵元素
      this.createDragGhost(node, event);
    }

    return true;
  }

  /**
   * 创建拖拽幽灵元素
   */
  private createDragGhost(node: TreeNode, event: DragEvent): void {
    this.dragGhost = document.createElement('div');
    this.dragGhost.className = 'tree-drag-ghost';
    this.dragGhost.textContent = node.label;
    this.dragGhost.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      padding: 4px 8px;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(this.dragGhost);

    if (event.dataTransfer) {
      event.dataTransfer.setDragImage(this.dragGhost, 0, 0);
    }
  }

  /**
   * 拖拽进入
   */
  dragEnter(nodeId: TreeNodeId, event: DragEvent): void {
    if (!this.state.isDragging || !this.state.dragNode) return;

    const node = this.treeManager.getNode(nodeId);
    if (!node || node.id === this.state.dragNode.id) return;

    this.state.dropNode = node;
    this.updateDropType(event);
  }

  /**
   * 拖拽经过
   */
  dragOver(nodeId: TreeNodeId, event: DragEvent): void {
    if (!this.state.isDragging || !this.state.dragNode) return;

    event.preventDefault();

    const node = this.treeManager.getNode(nodeId);
    if (!node || node.id === this.state.dragNode.id) return;

    this.state.dropNode = node;
    this.updateDropType(event);

    // 检查是否可以放置
    this.state.canDrop = this.canDrop(this.state.dragNode, node, this.state.dropType!);

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = this.state.canDrop ? 'move' : 'none';
    }
  }

  /**
   * 拖拽离开
   */
  dragLeave(): void {
    // 可以在这里添加视觉反馈的清理逻辑
  }

  /**
   * 放置
   */
  drop(nodeId: TreeNodeId, event: DragEvent): boolean {
    event.preventDefault();

    if (!this.state.isDragging || !this.state.dragNode || !this.state.canDrop) {
      this.endDrag();
      return false;
    }

    const dropNode = this.treeManager.getNode(nodeId);
    if (!dropNode) {
      this.endDrag();
      return false;
    }

    // 执行拖拽操作
    const success = this.performDrop(this.state.dragNode, dropNode, this.state.dropType!);

    this.endDrag();
    return success;
  }

  /**
   * 结束拖拽
   */
  endDrag(): void {
    this.state.isDragging = false;
    this.state.dragNode = null;
    this.state.dropNode = null;
    this.state.dropType = null;
    this.state.canDrop = false;

    // 清理拖拽幽灵元素
    if (this.dragGhost) {
      document.body.removeChild(this.dragGhost);
      this.dragGhost = null;
    }
  }

  /**
   * 更新放置类型
   */
  private updateDropType(event: DragEvent): void {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const offsetY = event.clientY - rect.top;
    const height = rect.height;

    // 根据鼠标位置判断放置类型
    if (offsetY < height * 0.25) {
      this.state.dropType = 'before';
    } else if (offsetY > height * 0.75) {
      this.state.dropType = 'after';
    } else {
      this.state.dropType = 'inner';
    }
  }

  /**
   * 检查是否可以放置
   */
  private canDrop(dragNode: TreeNode, dropNode: TreeNode, dropType: DropType): boolean {
    // 不能拖拽到自己
    if (dragNode.id === dropNode.id) return false;

    // 不能拖拽到自己的子节点
    if (this.treeManager.isDescendantOf(dropNode.id, dragNode.id)) return false;

    // 如果是放置到内部，检查目标节点是否是叶子节点
    if (dropType === 'inner' && dropNode.isLeaf && dropNode.children?.length === 0) {
      // 可以将节点拖拽到叶子节点内部，使其变成父节点
    }

    // 调用用户自定义的验证函数
    if (this.options.allowDrop) {
      return this.options.allowDrop(dragNode, dropNode, dropType);
    }

    return true;
  }

  /**
   * 执行放置操作
   */
  private performDrop(dragNode: TreeNode, dropNode: TreeNode, dropType: DropType): boolean {
    let targetParentId: TreeNodeId | null = null;
    let insertIndex = -1;

    switch (dropType) {
      case 'before':
      case 'after': {
        // 插入到目标节点的前面或后面
        const parent = this.treeManager.getParent(dropNode.id);
        targetParentId = parent?.id || null;

        // 获取父节点的子节点列表
        const siblings = parent?.children || this.treeManager.getRootNodes();
        const dropIndex = siblings.findIndex((n) => n.id === dropNode.id);

        if (dropIndex !== -1) {
          insertIndex = dropType === 'before' ? dropIndex : dropIndex + 1;
        }
        break;
      }
      case 'inner':
        // 插入到目标节点内部
        targetParentId = dropNode.id;
        insertIndex = dropNode.children?.length || 0;
        break;
    }

    // 先从原位置移除
    const oldParent = this.treeManager.getParent(dragNode.id);
    if (oldParent) {
      oldParent.children = oldParent.children?.filter((n) => n.id !== dragNode.id);
    } else {
      const rootNodes = this.treeManager.getRootNodes();
      const index = rootNodes.findIndex((n) => n.id === dragNode.id);
      if (index !== -1) {
        rootNodes.splice(index, 1);
      }
    }

    // 插入到新位置
    if (targetParentId) {
      const newParent = this.treeManager.getNode(targetParentId);
      if (newParent) {
        if (!newParent.children) {
          newParent.children = [];
        }
        if (insertIndex >= 0 && insertIndex <= newParent.children.length) {
          newParent.children.splice(insertIndex, 0, dragNode);
        } else {
          newParent.children.push(dragNode);
        }
        dragNode.parentId = targetParentId;
        newParent.isLeaf = false;
      }
    } else {
      const rootNodes = this.treeManager.getRootNodes();
      if (insertIndex >= 0 && insertIndex <= rootNodes.length) {
        rootNodes.splice(insertIndex, 0, dragNode);
      } else {
        rootNodes.push(dragNode);
      }
      dragNode.parentId = null;
    }

    return true;
  }

  /**
   * 获取拖拽状态
   */
  getState(): DragState {
    return { ...this.state };
  }

  /**
   * 获取拖拽事件数据
   */
  getDragEventData(): DragEventData | null {
    if (!this.state.dragNode || !this.state.dropNode || !this.state.dropType) {
      return null;
    }

    return {
      dragNode: this.state.dragNode,
      dropNode: this.state.dropNode,
      dropType: this.state.dropType,
    };
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.endDrag();
  }
}

