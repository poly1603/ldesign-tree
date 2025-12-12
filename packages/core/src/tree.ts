/**
 * Tree 主类 - 整合所有功能模块
 */

import type {
  NodeId,
  TreeNodeData,
  FlatNode,
  TreeOptions,
  DropPosition,
  TreeEventMap,
  TreeEventListener,
  TreeStats,
} from './types'
import { TreeStore } from './core/tree-store'
import { DOMRenderer } from './renderers/dom-renderer'
import { DragHandler } from './handlers/drag-handler'
import { KeyboardHandler } from './handlers/keyboard-handler'
import { LazyLoader } from './handlers/lazy-loader'

export interface TreeInstance<T = unknown> {
  // 数据操作
  setData(data: TreeNodeData<T>[]): void
  getData(): TreeNodeData<T>[]
  getNode(nodeId: NodeId): FlatNode<T> | undefined
  addNode(node: TreeNodeData<T>, parentId?: NodeId, index?: number): FlatNode<T> | null
  removeNode(nodeId: NodeId): boolean
  updateNode(nodeId: NodeId, updates: Partial<FlatNode<T>>): boolean
  moveNode(nodeId: NodeId, targetId: NodeId | null, position: DropPosition): boolean

  // 展开/折叠
  expandNode(nodeId: NodeId): void
  collapseNode(nodeId: NodeId): void
  toggleExpand(nodeId: NodeId): void
  expandAll(): void
  collapseAll(): void
  expandToLevel(level: number): void
  expandToNode(nodeId: NodeId): void

  // 选择
  selectNode(nodeId: NodeId, append?: boolean): void
  unselectNode(nodeId: NodeId): void
  toggleSelect(nodeId: NodeId, append?: boolean): void
  getSelectedNodes(): FlatNode<T>[]
  getSelectedIds(): NodeId[]
  clearSelection(): void

  // 勾选
  checkNode(nodeId: NodeId, checked?: boolean): void
  toggleCheck(nodeId: NodeId): void
  checkAll(): void
  uncheckAll(): void
  getCheckedNodes(includeHalfChecked?: boolean): FlatNode<T>[]
  getCheckedIds(includeHalfChecked?: boolean): NodeId[]
  setCheckedIds(ids: NodeId[]): void

  // 搜索
  search(query: string): FlatNode<T>[]
  clearSearch(): void

  // 懒加载
  loadNode(nodeId: NodeId): Promise<TreeNodeData<T>[]>
  reloadNode(nodeId: NodeId): Promise<TreeNodeData<T>[]>

  // 滚动
  scrollToNode(nodeId: NodeId): void
  scrollTo(scrollTop: number): void

  // 编辑
  startEdit(nodeId: NodeId): void
  finishEdit(nodeId: NodeId, newLabel: string): void
  cancelEdit(nodeId: NodeId): void

  // 聚焦
  setFocusedNode(nodeId: NodeId | null): void
  getFocusedNode(): FlatNode<T> | null

  // 统计
  getStats(): TreeStats

  // 配置
  setOptions(options: Partial<TreeOptions<T>>): void

  // 事件
  on<K extends keyof TreeEventMap<T>>(event: K, listener: TreeEventListener<T, K>): () => void
  off<K extends keyof TreeEventMap<T>>(event: K, listener: TreeEventListener<T, K>): void

  // 刷新
  refresh(): void

  // 销毁
  destroy(): void
}

export class Tree<T = unknown> implements TreeInstance<T> {
  private store: TreeStore<T>
  private renderer: DOMRenderer<T>
  private dragHandler: DragHandler<T>
  private keyboardHandler: KeyboardHandler<T>
  private lazyLoader: LazyLoader<T> | null = null
  private container: HTMLElement

  constructor(
    container: HTMLElement | string,
    data: TreeNodeData<T>[] = [],
    options: TreeOptions<T> = {}
  ) {
    // 获取容器元素
    if (typeof container === 'string') {
      const el = document.querySelector(container)
      if (!el) {
        throw new Error(`Container element "${container}" not found`)
      }
      this.container = el as HTMLElement
    } else {
      this.container = container
    }

    // 创建各模块
    this.store = new TreeStore(data, options)
    this.renderer = new DOMRenderer(this.store)
    this.dragHandler = new DragHandler(this.store)
    this.keyboardHandler = new KeyboardHandler(this.store, {
      enabled: options.keyboardNavigation !== false,
      multiple: options.multiple ?? false,
      checkable: options.checkable ?? false,
    })

    // 设置拖拽和键盘处理器
    this.renderer.setDragHandler(this.dragHandler)
    this.renderer.setKeyboardHandler(this.keyboardHandler)

    // 懒加载
    if (options.loadData) {
      this.lazyLoader = new LazyLoader(this.store, {
        loadData: options.loadData,
      })
    }

    // 监听数据变化，刷新渲染
    this.store.on('data-change', () => this.renderer.render())
    this.store.on('node-expand', async (e) => {
      // 如果配置了懒加载且节点没有子节点，则触发加载
      if (this.lazyLoader && e.node.childIds.length === 0 && !e.node.isLeaf) {
        try {
          await this.lazyLoader.load(e.node.id)
        } catch (error) {
          console.error('Failed to load children:', error)
        }
      }
      this.renderer.render()
    })
    this.store.on('node-collapse', () => this.renderer.render())
    this.store.on('node-select', () => this.renderer.render())
    this.store.on('node-check', () => this.renderer.render())
    this.store.on('load-data', () => this.renderer.render())

    // 挂载渲染器
    this.renderer.mount(this.container)
  }

  // ==================== 数据操作 ====================

  setData(data: TreeNodeData<T>[]): void {
    this.store.setData(data)
  }

  getData(): TreeNodeData<T>[] {
    return this.store.getData()
  }

  getNode(nodeId: NodeId): FlatNode<T> | undefined {
    return this.store.getNode(nodeId)
  }

  addNode(node: TreeNodeData<T>, parentId?: NodeId, index?: number): FlatNode<T> | null {
    return this.store.addNode(node, parentId, index)
  }

  removeNode(nodeId: NodeId): boolean {
    return this.store.removeNode(nodeId)
  }

  updateNode(nodeId: NodeId, updates: Partial<FlatNode<T>>): boolean {
    return this.store.updateNode(nodeId, updates)
  }

  moveNode(nodeId: NodeId, targetId: NodeId | null, position: DropPosition): boolean {
    return this.store.moveNode(nodeId, targetId, position)
  }

  // ==================== 展开/折叠 ====================

  expandNode(nodeId: NodeId): void {
    this.store.expandNode(nodeId)
  }

  collapseNode(nodeId: NodeId): void {
    this.store.collapseNode(nodeId)
  }

  toggleExpand(nodeId: NodeId): void {
    this.store.toggleExpand(nodeId)
  }

  expandAll(): void {
    this.store.expandAll()
  }

  collapseAll(): void {
    this.store.collapseAll()
  }

  expandToLevel(level: number): void {
    this.store.expandToLevel(level)
  }

  expandToNode(nodeId: NodeId): void {
    this.store.expandToNode(nodeId)
  }

  // ==================== 选择 ====================

  selectNode(nodeId: NodeId, append: boolean = false): void {
    this.store.selectNode(nodeId, append)
  }

  unselectNode(nodeId: NodeId): void {
    this.store.unselectNode(nodeId)
  }

  toggleSelect(nodeId: NodeId, append: boolean = false): void {
    this.store.toggleSelect(nodeId, append)
  }

  getSelectedNodes(): FlatNode<T>[] {
    return this.store.getSelectedNodes()
  }

  getSelectedIds(): NodeId[] {
    return this.store.getSelectedIds()
  }

  clearSelection(): void {
    this.store.clearSelection()
  }

  // ==================== 勾选 ====================

  checkNode(nodeId: NodeId, checked: boolean = true): void {
    this.store.checkNode(nodeId, checked)
  }

  toggleCheck(nodeId: NodeId): void {
    this.store.toggleCheck(nodeId)
  }

  checkAll(): void {
    this.store.checkAll()
  }

  uncheckAll(): void {
    this.store.uncheckAll()
  }

  getCheckedNodes(includeHalfChecked: boolean = false): FlatNode<T>[] {
    return this.store.getCheckedNodes(includeHalfChecked)
  }

  getCheckedIds(includeHalfChecked: boolean = false): NodeId[] {
    return this.store.getCheckedIds(includeHalfChecked)
  }

  setCheckedIds(ids: NodeId[]): void {
    this.store.setCheckedIds(ids)
  }

  // ==================== 搜索 ====================

  search(query: string): FlatNode<T>[] {
    return this.store.search(query)
  }

  clearSearch(): void {
    this.store.clearSearch()
  }

  // ==================== 懒加载 ====================

  async loadNode(nodeId: NodeId): Promise<TreeNodeData<T>[]> {
    if (!this.lazyLoader) {
      throw new Error('Lazy loading is not configured')
    }
    return this.lazyLoader.load(nodeId)
  }

  async reloadNode(nodeId: NodeId): Promise<TreeNodeData<T>[]> {
    if (!this.lazyLoader) {
      throw new Error('Lazy loading is not configured')
    }
    return this.lazyLoader.reload(nodeId)
  }

  // ==================== 滚动 ====================

  scrollToNode(nodeId: NodeId): void {
    this.renderer.scrollToNode(nodeId)
  }

  scrollTo(scrollTop: number): void {
    this.renderer.scrollTo(scrollTop)
  }

  // ==================== 编辑 ====================

  startEdit(nodeId: NodeId): void {
    this.store.startEdit(nodeId)
  }

  finishEdit(nodeId: NodeId, newLabel: string): void {
    this.store.finishEdit(nodeId, newLabel)
  }

  cancelEdit(nodeId: NodeId): void {
    this.store.cancelEdit(nodeId)
  }

  // ==================== 聚焦 ====================

  setFocusedNode(nodeId: NodeId | null): void {
    this.store.setFocusedNode(nodeId)
  }

  getFocusedNode(): FlatNode<T> | null {
    return this.store.getFocusedNode()
  }

  // ==================== 统计 ====================

  getStats(): TreeStats {
    return this.store.getStats()
  }

  // ==================== 配置 ====================

  setOptions(options: Partial<TreeOptions<T>>): void {
    this.store.setOptions(options)
    this.keyboardHandler.setOptions({
      enabled: options.keyboardNavigation !== false,
      multiple: options.multiple ?? false,
      checkable: options.checkable ?? false,
    })
  }

  // ==================== 事件 ====================

  on<K extends keyof TreeEventMap<T>>(
    event: K,
    listener: TreeEventListener<T, K>
  ): () => void {
    return this.store.on(event, listener)
  }

  off<K extends keyof TreeEventMap<T>>(
    event: K,
    listener: TreeEventListener<T, K>
  ): void {
    this.store.off(event, listener)
  }

  // ==================== 其他 ====================

  refresh(): void {
    this.renderer.refresh()
  }

  destroy(): void {
    this.renderer.destroy()
    this.dragHandler.destroy()
    this.keyboardHandler.destroy()
    this.lazyLoader?.destroy()
    this.store.destroy()
  }

  // ==================== 内部访问器（用于框架封装） ====================

  /** @internal */
  getStore(): TreeStore<T> {
    return this.store
  }

  /** @internal */
  getRenderer(): DOMRenderer<T> {
    return this.renderer
  }
}

/**
 * 创建树实例
 */
export function createTree<T = unknown>(
  container: HTMLElement | string,
  data: TreeNodeData<T>[] = [],
  options: TreeOptions<T> = {}
): Tree<T> {
  return new Tree(container, data, options)
}
