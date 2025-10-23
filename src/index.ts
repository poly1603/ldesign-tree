/**
 * @ldesign/tree - 高级树形组件
 * 支持虚拟滚动、拖拽排序、懒加载、搜索过滤等功能
 * 可在 Vue、React、Lit 等任意框架中使用
 */

// 核心类
export { TreeManager } from './core/tree-manager';
export { VirtualScroller } from './core/virtual-scroller';
export { DragHandler } from './core/drag-handler';
export { SearchEngine } from './core/search-engine';
export { SelectionManager } from './core/selection-manager';
export { BatchOperator } from './core/batch-operator';
export { LazyLoader } from './core/lazy-loader';

// 渲染器
export { BaseRenderer } from './renderers/base-renderer';
export { DOMRenderer } from './renderers/dom-renderer';

// 工具函数
export * from './utils';

// 类型定义
export type {
  TreeNode,
  TreeNodeId,
  FlatTreeNode,
  TreeOptions,
  CheckState,
  DropType,
  DragEventData,
  NodeClickEventData,
  NodeExpandEventData,
  NodeCheckEventData,
  SearchOptions,
  VirtualScrollConfig,
  VirtualScrollState,
  TreeEvents,
  ExportFormat,
  ExportOptions,
} from './types';

import { TreeManager } from './core/tree-manager';
import { VirtualScroller } from './core/virtual-scroller';
import { DragHandler } from './core/drag-handler';
import { SearchEngine } from './core/search-engine';
import { SelectionManager } from './core/selection-manager';
import { BatchOperator } from './core/batch-operator';
import { LazyLoader } from './core/lazy-loader';
import { DOMRenderer } from './renderers/dom-renderer';
import type {
  TreeNode,
  TreeOptions,
  TreeEvents,
  TreeNodeId,
  VirtualScrollConfig,
} from './types';

/**
 * 树形组件主类
 * 集成所有功能模块，提供统一的 API
 */
export class Tree<T = any> {
  private container: HTMLElement;
  private options: TreeOptions;
  private events: TreeEvents;

  // 核心模块
  public treeManager: TreeManager<T>;
  public virtualScroller: VirtualScroller | null = null;
  public dragHandler: DragHandler<T> | null = null;
  public searchEngine: SearchEngine<T>;
  public selectionManager: SelectionManager<T>;
  public batchOperator: BatchOperator<T>;
  public lazyLoader: LazyLoader<T>;

  // 渲染器
  private renderer: DOMRenderer<T>;

  // 内部状态
  private initialized = false;
  private destroyed = false;

  constructor(
    container: HTMLElement,
    data: TreeNode<T>[] = [],
    options: TreeOptions = {},
    events: TreeEvents = {}
  ) {
    this.container = container;
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
    this.events = events;

    // 初始化核心模块
    this.treeManager = new TreeManager<T>(data, this.options);
    this.searchEngine = new SearchEngine<T>(this.treeManager);
    this.selectionManager = new SelectionManager<T>(this.treeManager, {
      multiple: this.options.multiple,
      checkable: this.options.checkable,
    });
    this.batchOperator = new BatchOperator<T>(this.treeManager, this.selectionManager);
    this.lazyLoader = new LazyLoader<T>(this.treeManager);

    // 初始化虚拟滚动
    if (this.options.virtual) {
      const height = container.clientHeight || 400;
      this.virtualScroller = new VirtualScroller({
        height,
        itemHeight: this.options.itemHeight || 32,
        buffer: 5,
      });
    }

    // 初始化拖拽
    if (this.options.draggable) {
      this.dragHandler = new DragHandler<T>(this.treeManager, this.options);
    }

    // 初始化渲染器
    this.renderer = new DOMRenderer<T>(this.options);

    // 设置懒加载函数
    if (this.options.loadData) {
      this.lazyLoader.setLoadDataFunction(this.options.loadData);
    }

    // 初始化渲染
    this.init();
  }

  /**
   * 初始化
   */
  private init(): void {
    if (this.initialized) return;

    // 设置容器样式
    this.container.classList.add('ldesign-tree');
    this.container.style.overflow = 'auto';
    this.container.style.position = 'relative';

    // 渲染树
    this.render();

    // 绑定事件
    this.bindEvents();

    this.initialized = true;
  }

  /**
   * 渲染树
   */
  render(): void {
    if (this.destroyed) return;

    // 清空容器
    this.container.innerHTML = '';

    const visibleNodes = this.treeManager.getVisibleNodes();

    if (this.virtualScroller) {
      this.virtualScroller.setTotalItems(visibleNodes.length);
      this.renderVirtual(visibleNodes);
    } else {
      this.renderAll(visibleNodes);
    }
  }

  /**
   * 虚拟滚动渲染
   */
  private renderVirtual(visibleNodes: any[]): void {
    if (!this.virtualScroller) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'tree-virtual-wrapper';
    Object.assign(wrapper.style, this.virtualScroller.getWrapperStyle());

    const list = document.createElement('div');
    list.className = 'tree-virtual-list';
    Object.assign(list.style, this.virtualScroller.getListStyle());

    const { start, end } = this.virtualScroller.getVisibleRange();
    for (let i = start; i < end && i < visibleNodes.length; i++) {
      const node = visibleNodes[i];
      const element = this.renderer.renderNode({
        node,
        index: i,
        options: this.options,
      });
      list.appendChild(element);
    }

    wrapper.appendChild(list);
    this.container.appendChild(wrapper);
  }

  /**
   * 完整渲染
   */
  private renderAll(visibleNodes: any[]): void {
    const fragment = document.createDocumentFragment();

    visibleNodes.forEach((node, index) => {
      const element = this.renderer.renderNode({
        node,
        index,
        options: this.options,
      });
      fragment.appendChild(element);
    });

    this.container.appendChild(fragment);
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 滚动事件（虚拟滚动）
    if (this.virtualScroller) {
      this.container.addEventListener('scroll', () => {
        this.virtualScroller!.setScrollTop(this.container.scrollTop);
        this.render();
      });
    }

    // 节点点击事件
    this.container.addEventListener('click', (e) => {
      this.handleNodeClick(e);
    });

    // 节点双击事件
    this.container.addEventListener('dblclick', (e) => {
      this.handleNodeDblClick(e);
    });

    // 节点右键事件
    this.container.addEventListener('contextmenu', (e) => {
      this.handleNodeContextMenu(e);
    });

    // 拖拽事件
    if (this.dragHandler) {
      this.container.addEventListener('dragstart', (e) => {
        this.handleDragStart(e);
      });
      this.container.addEventListener('dragover', (e) => {
        this.handleDragOver(e);
      });
      this.container.addEventListener('drop', (e) => {
        this.handleDrop(e);
      });
      this.container.addEventListener('dragend', () => {
        this.dragHandler!.endDrag();
      });
    }
  }

  /**
   * 处理节点点击
   */
  private handleNodeClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const nodeElement = target.closest('[data-node-id]') as HTMLElement;
    if (!nodeElement) return;

    const nodeId = nodeElement.getAttribute('data-node-id')!;
    const node = this.treeManager.getNode(nodeId);
    if (!node) return;

    // 展开/折叠
    if (target.classList.contains('tree-expand-icon')) {
      this.treeManager.toggleExpand(nodeId);
      this.render();
      return;
    }

    // 复选框
    if (target.classList.contains('tree-checkbox')) {
      const checked = (target as HTMLInputElement).checked;
      this.selectionManager.check(nodeId, checked);
      this.render();
      return;
    }

    // 选中节点
    this.selectionManager.select(nodeId, !this.options.multiple);
    this.render();

    // 触发事件
    if (this.events.onNodeClick) {
      this.events.onNodeClick({ node, event: e });
    }
  }

  /**
   * 处理节点双击
   */
  private handleNodeDblClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const nodeElement = target.closest('[data-node-id]') as HTMLElement;
    if (!nodeElement) return;

    const nodeId = nodeElement.getAttribute('data-node-id')!;
    const node = this.treeManager.getNode(nodeId);
    if (!node) return;

    if (this.events.onNodeDblClick) {
      this.events.onNodeDblClick({ node, event: e });
    }
  }

  /**
   * 处理节点右键
   */
  private handleNodeContextMenu(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const nodeElement = target.closest('[data-node-id]') as HTMLElement;
    if (!nodeElement) return;

    const nodeId = nodeElement.getAttribute('data-node-id')!;
    const node = this.treeManager.getNode(nodeId);
    if (!node) return;

    if (this.events.onNodeContextMenu) {
      e.preventDefault();
      this.events.onNodeContextMenu({ node, event: e });
    }
  }

  /**
   * 处理拖拽开始
   */
  private handleDragStart(e: DragEvent): void {
    if (!this.dragHandler) return;

    const target = e.target as HTMLElement;
    const nodeElement = target.closest('[data-node-id]') as HTMLElement;
    if (!nodeElement) return;

    const nodeId = nodeElement.getAttribute('data-node-id')!;
    this.dragHandler.startDrag(nodeId, e);
  }

  /**
   * 处理拖拽经过
   */
  private handleDragOver(e: DragEvent): void {
    if (!this.dragHandler) return;

    const target = e.target as HTMLElement;
    const nodeElement = target.closest('[data-node-id]') as HTMLElement;
    if (!nodeElement) return;

    const nodeId = nodeElement.getAttribute('data-node-id')!;
    this.dragHandler.dragOver(nodeId, e);
  }

  /**
   * 处理放置
   */
  private handleDrop(e: DragEvent): void {
    if (!this.dragHandler) return;

    const target = e.target as HTMLElement;
    const nodeElement = target.closest('[data-node-id]') as HTMLElement;
    if (!nodeElement) return;

    const nodeId = nodeElement.getAttribute('data-node-id')!;
    const success = this.dragHandler.drop(nodeId, e);

    if (success) {
      this.render();
      if (this.events.onDrop && this.dragHandler.getDragEventData()) {
        this.events.onDrop(this.dragHandler.getDragEventData()!);
      }
    }
  }

  /**
   * 更新配置
   */
  updateOptions(options: Partial<TreeOptions>): void {
    this.options = { ...this.options, ...options };
    this.render();
  }

  /**
   * 设置数据
   */
  setData(data: TreeNode<T>[]): void {
    this.treeManager.setData(data);
    this.render();
  }

  /**
   * 获取数据
   */
  getData(): TreeNode<T>[] {
    return this.treeManager.getRootNodes();
  }

  /**
   * 搜索
   */
  search(query: string): void {
    this.searchEngine.search(query);
    this.render();
  }

  /**
   * 清除搜索
   */
  clearSearch(): void {
    this.searchEngine.clear();
    this.render();
  }

  /**
   * 刷新渲染
   */
  refresh(): void {
    this.render();
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.destroyed) return;

    this.container.innerHTML = '';
    this.renderer.destroy();
    this.destroyed = true;
  }
}

/**
 * 创建树形组件实例
 */
export function createTree<T = any>(
  container: HTMLElement,
  data?: TreeNode<T>[],
  options?: TreeOptions,
  events?: TreeEvents
): Tree<T> {
  return new Tree<T>(container, data, options, events);
}

// 默认导出
export default Tree;
