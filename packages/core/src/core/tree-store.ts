/**
 * 树状态存储 - 管理所有节点数据和状态
 */

import type {
  NodeId,
  TreeNodeData,
  FlatNode,
  TreeOptions,
  CheckState,
  DropPosition,
  TreeStats,
} from '../types'
import { EventEmitter } from './event-emitter'
import {
  flattenTree,
  unflattenTree,
  createDefaultNodeState,
  getAncestorIds,
  getDescendantIds,
  computeCheckState,
  generateId,
  isSameId,
} from '../utils'

/** 默认配置 */
const DEFAULT_OPTIONS: Required<TreeOptions> = {
  indent: 20,
  showLine: false,
  lineStyle: 'solid',
  showIcon: true,
  checkable: false,
  checkCascade: true,
  checkStrictly: false,
  multiple: false,
  draggable: false,
  sortable: false,
  defaultExpandAll: false,
  defaultExpandedIds: [],
  defaultSelectedIds: [],
  defaultCheckedIds: [],
  virtual: true,
  itemHeight: 32,
  bufferSize: 5,
  editable: false,
  animate: true,
  animationDuration: 200,
  keyboardNavigation: true,
  emptyText: '暂无数据',
  loadingText: '加载中...',
  loadData: undefined as any,
  filterMethod: undefined as any,
  allowDrag: () => true,
  allowDrop: () => true,
  iconRenderer: undefined as any,
  nodeRenderer: undefined as any,
  expandIcon: undefined as any,
  checkboxIcon: undefined as any,
}

export class TreeStore<T = unknown> extends EventEmitter<T> {
  /** 配置选项 */
  private _options: Required<TreeOptions<T>>

  /** 节点 Map（ID -> 节点） */
  private nodeMap = new Map<NodeId, FlatNode<T>>()

  /** 扁平化节点列表（按顺序） */
  private flatNodes: FlatNode<T>[] = []

  /** 可见节点列表（展开状态过滤后） */
  private visibleNodes: FlatNode<T>[] = []

  /** 根节点 ID 列表 */
  private rootIds: NodeId[] = []

  /** 搜索关键词 */
  private searchQuery: string = ''

  /** 当前聚焦节点 ID */
  private focusedNodeId: NodeId | null = null

  constructor(data: TreeNodeData<T>[] = [], options: TreeOptions<T> = {}) {
    super()
    this._options = { ...DEFAULT_OPTIONS, ...options } as Required<TreeOptions<T>>
    this.setData(data)
  }

  // ==================== Getters ====================

  get options(): Required<TreeOptions<T>> {
    return this._options
  }

  /**
   * 获取所有扁平化节点
   */
  getFlatNodes(): FlatNode<T>[] {
    return this.flatNodes
  }

  /**
   * 获取可见节点列表
   */
  getVisibleNodes(): FlatNode<T>[] {
    return this.visibleNodes
  }

  /**
   * 获取节点 Map
   */
  getNodeMap(): Map<NodeId, FlatNode<T>> {
    return this.nodeMap
  }

  /**
   * 获取根节点 ID 列表
   */
  getRootIds(): NodeId[] {
    return this.rootIds
  }

  // ==================== 数据操作 ====================

  /**
   * 设置树数据
   */
  setData(data: TreeNodeData<T>[]): void {
    this.flatNodes = flattenTree(data)
    this.nodeMap.clear()
    this.rootIds = []

    this.flatNodes.forEach(node => {
      this.nodeMap.set(node.id, node)
      if (node.parentId === null) {
        this.rootIds.push(node.id)
      }
    })

    // 应用默认状态
    this.applyDefaultState()
    this.updateVisibleNodes()
    this.emit('data-change', { nodes: this.flatNodes })
  }

  /**
   * 获取树形数据
   */
  getData(): TreeNodeData<T>[] {
    return unflattenTree(this.flatNodes)
  }

  /**
   * 获取节点
   */
  getNode(nodeId: NodeId): FlatNode<T> | undefined {
    return this.nodeMap.get(nodeId)
  }

  /**
   * 添加节点
   */
  addNode(node: TreeNodeData<T>, parentId?: NodeId, index?: number): FlatNode<T> | null {
    const id = node.id ?? generateId()

    // 检查 ID 是否已存在
    if (this.nodeMap.has(id)) {
      console.warn(`Node with id "${id}" already exists`)
      return null
    }

    const parent = parentId ? this.nodeMap.get(parentId) : null
    const level = parent ? parent.level + 1 : 0

    const flatNode: FlatNode<T> = {
      id,
      parentId: parentId ?? null,
      level,
      label: node.label,
      childIds: [],
      icon: node.icon,
      isLeaf: node.isLeaf ?? true,
      disabled: node.disabled ?? false,
      checkable: node.checkable ?? true,
      draggable: node.draggable ?? true,
      droppable: node.droppable ?? true,
      selectable: node.selectable ?? true,
      state: createDefaultNodeState(),
      originalIndex: this.flatNodes.length,
      data: node.data,
    }

    // 添加到 Map
    this.nodeMap.set(id, flatNode)

    // 更新父节点
    if (parent) {
      parent.isLeaf = false
      const insertIndex = index !== undefined
        ? Math.min(index, parent.childIds.length)
        : parent.childIds.length
      parent.childIds.splice(insertIndex, 0, id)
    } else {
      const insertIndex = index !== undefined
        ? Math.min(index, this.rootIds.length)
        : this.rootIds.length
      this.rootIds.splice(insertIndex, 0, id)
    }

    // 重建扁平化列表
    this.rebuildFlatNodes()
    this.updateVisibleNodes()
    this.emit('data-change', { nodes: this.flatNodes })

    return flatNode
  }

  /**
   * 删除节点
   */
  removeNode(nodeId: NodeId): boolean {
    const node = this.nodeMap.get(nodeId)
    if (!node) return false

    // 递归删除所有子节点
    const removeRecursive = (id: NodeId) => {
      const n = this.nodeMap.get(id)
      if (n) {
        n.childIds.forEach(removeRecursive)
        this.nodeMap.delete(id)
      }
    }
    removeRecursive(nodeId)

    // 从父节点中移除
    if (node.parentId !== null) {
      const parent = this.nodeMap.get(node.parentId)
      if (parent) {
        parent.childIds = parent.childIds.filter(id => !isSameId(id, nodeId))
        parent.isLeaf = parent.childIds.length === 0
      }
    } else {
      this.rootIds = this.rootIds.filter(id => !isSameId(id, nodeId))
    }

    this.rebuildFlatNodes()
    this.updateVisibleNodes()
    this.emit('data-change', { nodes: this.flatNodes })

    return true
  }

  /**
   * 更新节点
   */
  updateNode(nodeId: NodeId, updates: Partial<Omit<FlatNode<T>, 'id' | 'parentId' | 'level' | 'childIds'>>): boolean {
    const node = this.nodeMap.get(nodeId)
    if (!node) return false

    Object.assign(node, updates)
    this.updateVisibleNodes()
    this.emit('data-change', { nodes: this.flatNodes })

    return true
  }

  /**
   * 移动节点
   */
  moveNode(nodeId: NodeId, targetId: NodeId | null, position: DropPosition): boolean {
    const node = this.nodeMap.get(nodeId)
    if (!node) return false

    // 不能移动到自己的子节点
    if (targetId && getDescendantIds(nodeId, this.nodeMap).includes(targetId)) {
      return false
    }

    // 从原位置移除
    if (node.parentId !== null) {
      const oldParent = this.nodeMap.get(node.parentId)
      if (oldParent) {
        oldParent.childIds = oldParent.childIds.filter(id => !isSameId(id, nodeId))
        oldParent.isLeaf = oldParent.childIds.length === 0
      }
    } else {
      this.rootIds = this.rootIds.filter(id => !isSameId(id, nodeId))
    }

    // 添加到新位置
    if (targetId === null) {
      // 移动到根级别
      this.rootIds.push(nodeId)
      node.parentId = null
      node.level = 0
    } else {
      const target = this.nodeMap.get(targetId)
      if (!target) return false

      if (position === 'inside') {
        // 作为子节点
        target.childIds.push(nodeId)
        target.isLeaf = false
        node.parentId = targetId
        node.level = target.level + 1
      } else {
        // 作为兄弟节点
        const siblingList = target.parentId !== null
          ? this.nodeMap.get(target.parentId)?.childIds ?? []
          : this.rootIds

        const targetIndex = siblingList.findIndex(id => isSameId(id, targetId))
        const insertIndex = position === 'before' ? targetIndex : targetIndex + 1
        siblingList.splice(insertIndex, 0, nodeId)

        node.parentId = target.parentId
        node.level = target.level
      }
    }

    // 更新所有后代节点的层级
    this.updateDescendantLevels(nodeId)
    this.rebuildFlatNodes()
    this.updateVisibleNodes()
    this.emit('data-change', { nodes: this.flatNodes })

    return true
  }

  // ==================== 展开/折叠 ====================

  /**
   * 展开节点
   */
  expandNode(nodeId: NodeId): void {
    const node = this.nodeMap.get(nodeId)
    if (!node || node.isLeaf) return

    if (!node.state.expanded) {
      node.state.expanded = true
      this.updateVisibleNodes()
      this.emit('node-expand', { node, expanded: true })
    }
  }

  /**
   * 折叠节点
   */
  collapseNode(nodeId: NodeId): void {
    const node = this.nodeMap.get(nodeId)
    if (!node) return

    if (node.state.expanded) {
      node.state.expanded = false
      this.updateVisibleNodes()
      this.emit('node-collapse', { node, expanded: false })
    }
  }

  /**
   * 切换展开状态
   */
  toggleExpand(nodeId: NodeId): void {
    const node = this.nodeMap.get(nodeId)
    if (!node) return

    if (node.state.expanded) {
      this.collapseNode(nodeId)
    } else {
      this.expandNode(nodeId)
    }
  }

  /**
   * 展开所有节点
   */
  expandAll(): void {
    this.flatNodes.forEach(node => {
      if (!node.isLeaf) {
        node.state.expanded = true
      }
    })
    this.updateVisibleNodes()
  }

  /**
   * 折叠所有节点
   */
  collapseAll(): void {
    this.flatNodes.forEach(node => {
      node.state.expanded = false
    })
    this.updateVisibleNodes()
  }

  /**
   * 展开到指定层级
   */
  expandToLevel(level: number): void {
    this.flatNodes.forEach(node => {
      if (!node.isLeaf) {
        node.state.expanded = node.level < level
      }
    })
    this.updateVisibleNodes()
  }

  /**
   * 展开到指定节点
   */
  expandToNode(nodeId: NodeId): void {
    const ancestors = getAncestorIds(nodeId, this.nodeMap)
    ancestors.forEach(id => this.expandNode(id))
  }

  // ==================== 选择 ====================

  /**
   * 选中节点
   */
  selectNode(nodeId: NodeId, append: boolean = false): void {
    const node = this.nodeMap.get(nodeId)
    if (!node || node.disabled || !node.selectable) return

    if (!this._options.multiple && !append) {
      // 单选模式，取消其他选中
      this.flatNodes.forEach(n => {
        n.state.selected = false
      })
    }

    node.state.selected = true
    this.emit('node-select', {
      node,
      selected: true,
      selectedNodes: this.getSelectedNodes(),
    })
  }

  /**
   * 取消选中节点
   */
  unselectNode(nodeId: NodeId): void {
    const node = this.nodeMap.get(nodeId)
    if (!node) return

    node.state.selected = false
    this.emit('node-select', {
      node,
      selected: false,
      selectedNodes: this.getSelectedNodes(),
    })
  }

  /**
   * 切换选中状态
   */
  toggleSelect(nodeId: NodeId, append: boolean = false): void {
    const node = this.nodeMap.get(nodeId)
    if (!node) return

    if (node.state.selected) {
      this.unselectNode(nodeId)
    } else {
      this.selectNode(nodeId, append)
    }
  }

  /**
   * 获取选中的节点
   */
  getSelectedNodes(): FlatNode<T>[] {
    return this.flatNodes.filter(n => n.state.selected)
  }

  /**
   * 获取选中的节点 ID
   */
  getSelectedIds(): NodeId[] {
    return this.getSelectedNodes().map(n => n.id)
  }

  /**
   * 清除所有选中
   */
  clearSelection(): void {
    this.flatNodes.forEach(n => {
      n.state.selected = false
    })
  }

  // ==================== 勾选 ====================

  /**
   * 勾选节点
   */
  checkNode(nodeId: NodeId, checked: boolean = true): void {
    const node = this.nodeMap.get(nodeId)
    if (!node || node.disabled || !node.checkable) return

    const newState: CheckState = checked ? 'checked' : 'unchecked'
    node.state.checked = newState

    if (this._options.checkCascade && !this._options.checkStrictly) {
      // 级联选中子节点
      this.cascadeCheckChildren(nodeId, newState)
      // 更新父节点状态
      this.updateAncestorCheckState(nodeId)
    }

    this.emit('node-check', {
      node,
      checked: newState,
      checkedNodes: this.getCheckedNodes(),
    })
  }

  /**
   * 切换勾选状态
   */
  toggleCheck(nodeId: NodeId): void {
    const node = this.nodeMap.get(nodeId)
    if (!node) return

    const checked = node.state.checked !== 'checked'
    this.checkNode(nodeId, checked)
  }

  /**
   * 全选
   */
  checkAll(): void {
    this.flatNodes.forEach(node => {
      if (!node.disabled && node.checkable) {
        node.state.checked = 'checked'
      }
    })
  }

  /**
   * 取消全选
   */
  uncheckAll(): void {
    this.flatNodes.forEach(node => {
      node.state.checked = 'unchecked'
    })
  }

  /**
   * 获取勾选的节点
   */
  getCheckedNodes(includeHalfChecked: boolean = false): FlatNode<T>[] {
    return this.flatNodes.filter(n =>
      n.state.checked === 'checked' ||
      (includeHalfChecked && n.state.checked === 'indeterminate')
    )
  }

  /**
   * 获取勾选的节点 ID
   */
  getCheckedIds(includeHalfChecked: boolean = false): NodeId[] {
    return this.getCheckedNodes(includeHalfChecked).map(n => n.id)
  }

  /**
   * 设置勾选的节点
   */
  setCheckedIds(ids: NodeId[]): void {
    this.uncheckAll()
    ids.forEach(id => this.checkNode(id, true))
  }

  // ==================== 搜索 ====================

  /**
   * 搜索节点
   */
  search(query: string): FlatNode<T>[] {
    this.searchQuery = query

    if (!query) {
      // 清除搜索
      this.flatNodes.forEach(node => {
        node.state.matched = false
        node.state.visible = true
      })
      this.updateVisibleNodes()
      this.emit('search', { query: '', matchedNodes: [] })
      return []
    }

    const filterMethod = this._options.filterMethod || this.defaultFilterMethod
    const matchedNodes: FlatNode<T>[] = []

    // 标记匹配的节点
    this.flatNodes.forEach(node => {
      node.state.matched = filterMethod(query, node)
      if (node.state.matched) {
        matchedNodes.push(node)
      }
    })

    // 更新可见性（匹配节点及其祖先节点可见）
    this.flatNodes.forEach(node => {
      node.state.visible = false
    })

    matchedNodes.forEach(node => {
      node.state.visible = true
      // 展开并显示祖先节点
      getAncestorIds(node.id, this.nodeMap).forEach(ancestorId => {
        const ancestor = this.nodeMap.get(ancestorId)
        if (ancestor) {
          ancestor.state.visible = true
          ancestor.state.expanded = true
        }
      })
    })

    this.updateVisibleNodes()
    this.emit('search', { query, matchedNodes })

    return matchedNodes
  }

  /**
   * 清除搜索
   */
  clearSearch(): void {
    this.search('')
  }

  /**
   * 获取搜索关键词
   */
  getSearchQuery(): string {
    return this.searchQuery
  }

  // ==================== 聚焦 ====================

  /**
   * 设置聚焦节点
   */
  setFocusedNode(nodeId: NodeId | null): void {
    // 清除旧的聚焦
    if (this.focusedNodeId !== null) {
      const oldNode = this.nodeMap.get(this.focusedNodeId)
      if (oldNode) {
        oldNode.state.focused = false
      }
    }

    // 设置新的聚焦
    this.focusedNodeId = nodeId
    if (nodeId !== null) {
      const node = this.nodeMap.get(nodeId)
      if (node) {
        node.state.focused = true
      }
    }
  }

  /**
   * 获取聚焦节点
   */
  getFocusedNode(): FlatNode<T> | null {
    return this.focusedNodeId !== null
      ? this.nodeMap.get(this.focusedNodeId) ?? null
      : null
  }

  /**
   * 聚焦上一个节点
   */
  focusPrevNode(): void {
    const visibleNodes = this.visibleNodes
    if (!visibleNodes.length) return

    const currentIndex = this.focusedNodeId !== null
      ? visibleNodes.findIndex(n => isSameId(n.id, this.focusedNodeId!))
      : -1

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : visibleNodes.length - 1
    this.setFocusedNode(visibleNodes[prevIndex].id)
  }

  /**
   * 聚焦下一个节点
   */
  focusNextNode(): void {
    const visibleNodes = this.visibleNodes
    if (!visibleNodes.length) return

    const currentIndex = this.focusedNodeId !== null
      ? visibleNodes.findIndex(n => isSameId(n.id, this.focusedNodeId!))
      : -1

    const nextIndex = currentIndex < visibleNodes.length - 1 ? currentIndex + 1 : 0
    this.setFocusedNode(visibleNodes[nextIndex].id)
  }

  // ==================== 拖拽状态 ====================

  /**
   * 设置拖拽节点
   */
  setDraggingNode(nodeId: NodeId | null): void {
    this.flatNodes.forEach(node => {
      node.state.dragging = nodeId !== null && isSameId(node.id, nodeId)
    })
  }

  /**
   * 设置拖拽目标
   */
  setDropTarget(nodeId: NodeId | null, position: DropPosition | null): void {
    this.flatNodes.forEach(node => {
      node.state.dropTarget = nodeId !== null && isSameId(node.id, nodeId)
      node.state.dropPosition = isSameId(node.id, nodeId!) ? position : null
    })
  }

  /**
   * 清除拖拽状态
   */
  clearDragState(): void {
    this.flatNodes.forEach(node => {
      node.state.dragging = false
      node.state.dropTarget = false
      node.state.dropPosition = null
    })
  }

  // ==================== 编辑 ====================

  /**
   * 开始编辑节点
   */
  startEdit(nodeId: NodeId): void {
    // 先结束其他编辑
    this.flatNodes.forEach(node => {
      node.state.editing = false
    })

    const node = this.nodeMap.get(nodeId)
    if (node && !node.disabled) {
      node.state.editing = true
    }
  }

  /**
   * 完成编辑
   */
  finishEdit(nodeId: NodeId, newLabel: string): void {
    const node = this.nodeMap.get(nodeId)
    if (!node) return

    const oldLabel = node.label
    node.label = newLabel
    node.state.editing = false

    this.emit('node-edit', { node, oldLabel, newLabel })
  }

  /**
   * 取消编辑
   */
  cancelEdit(nodeId: NodeId): void {
    const node = this.nodeMap.get(nodeId)
    if (node) {
      node.state.editing = false
    }
  }

  // ==================== 统计 ====================

  /**
   * 获取树统计信息
   */
  getStats(): TreeStats {
    let expandedNodes = 0
    let selectedNodes = 0
    let checkedNodes = 0
    let indeterminateNodes = 0
    let disabledNodes = 0
    let leafNodes = 0
    let maxDepth = 0

    this.flatNodes.forEach(node => {
      if (node.state.expanded) expandedNodes++
      if (node.state.selected) selectedNodes++
      if (node.state.checked === 'checked') checkedNodes++
      if (node.state.checked === 'indeterminate') indeterminateNodes++
      if (node.disabled) disabledNodes++
      if (node.isLeaf) leafNodes++
      if (node.level > maxDepth) maxDepth = node.level
    })

    return {
      totalNodes: this.flatNodes.length,
      visibleNodes: this.visibleNodes.length,
      expandedNodes,
      selectedNodes,
      checkedNodes,
      indeterminateNodes,
      disabledNodes,
      leafNodes,
      maxDepth,
    }
  }

  // ==================== 配置 ====================

  /**
   * 更新配置
   */
  setOptions(options: Partial<TreeOptions<T>>): void {
    Object.assign(this._options, options)
    this.updateVisibleNodes()
  }

  // ==================== 私有方法 ====================

  /**
   * 应用默认状态
   */
  private applyDefaultState(): void {
    const { defaultExpandAll, defaultExpandedIds, defaultSelectedIds, defaultCheckedIds } = this._options

    if (defaultExpandAll) {
      this.flatNodes.forEach(node => {
        if (!node.isLeaf) {
          node.state.expanded = true
        }
      })
    } else if (defaultExpandedIds?.length) {
      defaultExpandedIds.forEach(id => {
        const node = this.nodeMap.get(id)
        if (node) {
          node.state.expanded = true
        }
      })
    }

    defaultSelectedIds?.forEach(id => {
      const node = this.nodeMap.get(id)
      if (node) {
        node.state.selected = true
      }
    })

    defaultCheckedIds?.forEach(id => {
      const node = this.nodeMap.get(id)
      if (node) {
        node.state.checked = 'checked'
      }
    })

    // 如果启用级联选中，更新父节点状态
    if (this._options.checkCascade && !this._options.checkStrictly && defaultCheckedIds?.length) {
      this.flatNodes.forEach(node => {
        if (!node.isLeaf) {
          node.state.checked = computeCheckState(node.id, this.nodeMap, false)
        }
      })
    }
  }

  /**
   * 更新可见节点列表
   */
  private updateVisibleNodes(): void {
    this.visibleNodes = []

    const traverse = (ids: NodeId[]) => {
      ids.forEach(id => {
        const node = this.nodeMap.get(id)
        if (!node) return

        // 如果有搜索，检查可见性
        if (this.searchQuery && !node.state.visible) return

        this.visibleNodes.push(node)

        if (node.state.expanded && node.childIds.length) {
          traverse(node.childIds)
        }
      })
    }

    traverse(this.rootIds)
  }

  /**
   * 重建扁平化节点列表
   */
  private rebuildFlatNodes(): void {
    this.flatNodes = []

    const traverse = (ids: NodeId[]) => {
      ids.forEach(id => {
        const node = this.nodeMap.get(id)
        if (node) {
          node.originalIndex = this.flatNodes.length
          this.flatNodes.push(node)
          if (node.childIds.length) {
            traverse(node.childIds)
          }
        }
      })
    }

    traverse(this.rootIds)
  }

  /**
   * 更新后代节点的层级
   */
  private updateDescendantLevels(nodeId: NodeId): void {
    const node = this.nodeMap.get(nodeId)
    if (!node) return

    const updateLevel = (id: NodeId, parentLevel: number) => {
      const n = this.nodeMap.get(id)
      if (n) {
        n.level = parentLevel + 1
        n.childIds.forEach(childId => updateLevel(childId, n.level))
      }
    }

    node.childIds.forEach(childId => updateLevel(childId, node.level))
  }

  /**
   * 级联勾选子节点
   */
  private cascadeCheckChildren(nodeId: NodeId, checked: CheckState): void {
    const descendants = getDescendantIds(nodeId, this.nodeMap)
    descendants.forEach(id => {
      const node = this.nodeMap.get(id)
      if (node && !node.disabled && node.checkable) {
        node.state.checked = checked
      }
    })
  }

  /**
   * 更新祖先节点的勾选状态
   */
  private updateAncestorCheckState(nodeId: NodeId): void {
    const ancestors = getAncestorIds(nodeId, this.nodeMap)
    ancestors.forEach(id => {
      const node = this.nodeMap.get(id)
      if (node) {
        node.state.checked = computeCheckState(id, this.nodeMap, false)
      }
    })
  }

  /**
   * 默认过滤方法
   */
  private defaultFilterMethod = (query: string, node: FlatNode<T>): boolean => {
    return node.label.toLowerCase().includes(query.toLowerCase())
  }

  /**
   * 销毁
   */
  destroy(): void {
    super.destroy()
    this.nodeMap.clear()
    this.flatNodes = []
    this.visibleNodes = []
    this.rootIds = []
  }
}
