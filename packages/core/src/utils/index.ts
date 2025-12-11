/**
 * 工具函数集合
 */

import type { NodeId, TreeNodeData, FlatNode, NodeState, CheckState } from '../types'

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * 创建默认节点状态
 */
export function createDefaultNodeState(): NodeState {
  return {
    expanded: false,
    selected: false,
    disabled: false,
    checked: 'unchecked',
    loading: false,
    matched: false,
    visible: true,
    dragging: false,
    dropTarget: false,
    dropPosition: null,
    editing: false,
    focused: false,
  }
}

/**
 * 将树形数据扁平化
 */
export function flattenTree<T>(
  nodes: TreeNodeData<T>[],
  parentId: NodeId | null = null,
  level: number = 0,
  result: FlatNode<T>[] = []
): FlatNode<T>[] {
  nodes.forEach((node, index) => {
    const flatNode: FlatNode<T> = {
      id: node.id,
      parentId,
      level,
      label: node.label,
      childIds: node.children?.map(c => c.id) ?? [],
      icon: node.icon,
      isLeaf: node.isLeaf ?? !node.children?.length,
      disabled: node.disabled ?? false,
      checkable: node.checkable ?? true,
      draggable: node.draggable ?? true,
      droppable: node.droppable ?? true,
      selectable: node.selectable ?? true,
      state: createDefaultNodeState(),
      originalIndex: result.length,
      data: node.data,
    }

    result.push(flatNode)

    if (node.children?.length) {
      flattenTree(node.children, node.id, level + 1, result)
    }
  })

  return result
}

/**
 * 将扁平数据转换为树形数据
 */
export function unflattenTree<T>(flatNodes: FlatNode<T>[]): TreeNodeData<T>[] {
  const nodeMap = new Map<NodeId, TreeNodeData<T>>()
  const roots: TreeNodeData<T>[] = []

  // 创建所有节点
  flatNodes.forEach(flat => {
    nodeMap.set(flat.id, {
      id: flat.id,
      label: flat.label,
      icon: flat.icon,
      isLeaf: flat.isLeaf,
      disabled: flat.disabled,
      checkable: flat.checkable,
      draggable: flat.draggable,
      droppable: flat.droppable,
      selectable: flat.selectable,
      data: flat.data,
      children: [],
    })
  })

  // 建立父子关系
  flatNodes.forEach(flat => {
    const node = nodeMap.get(flat.id)!
    if (flat.parentId === null) {
      roots.push(node)
    } else {
      const parent = nodeMap.get(flat.parentId)
      if (parent) {
        parent.children = parent.children ?? []
        parent.children.push(node)
      }
    }
  })

  // 清理空的 children 数组
  const cleanNode = (node: TreeNodeData<T>) => {
    if (node.children?.length === 0) {
      delete node.children
    } else {
      node.children?.forEach(cleanNode)
    }
  }
  roots.forEach(cleanNode)

  return roots
}

/**
 * 获取节点的所有祖先节点 ID
 */
export function getAncestorIds<T>(
  nodeId: NodeId,
  nodeMap: Map<NodeId, FlatNode<T>>
): NodeId[] {
  const ancestors: NodeId[] = []
  let currentId = nodeMap.get(nodeId)?.parentId

  while (currentId !== null && currentId !== undefined) {
    ancestors.push(currentId)
    currentId = nodeMap.get(currentId)?.parentId ?? null
  }

  return ancestors
}

/**
 * 获取节点的所有后代节点 ID
 */
export function getDescendantIds<T>(
  nodeId: NodeId,
  nodeMap: Map<NodeId, FlatNode<T>>
): NodeId[] {
  const descendants: NodeId[] = []
  const node = nodeMap.get(nodeId)

  if (!node) return descendants

  const traverse = (ids: NodeId[]) => {
    ids.forEach(id => {
      descendants.push(id)
      const child = nodeMap.get(id)
      if (child?.childIds.length) {
        traverse(child.childIds)
      }
    })
  }

  traverse(node.childIds)
  return descendants
}

/**
 * 获取节点的所有兄弟节点 ID
 */
export function getSiblingIds<T>(
  nodeId: NodeId,
  nodeMap: Map<NodeId, FlatNode<T>>
): NodeId[] {
  const node = nodeMap.get(nodeId)
  if (!node) return []

  if (node.parentId === null) {
    // 根节点
    return Array.from(nodeMap.values())
      .filter(n => n.parentId === null && n.id !== nodeId)
      .map(n => n.id)
  }

  const parent = nodeMap.get(node.parentId)
  return parent?.childIds.filter(id => id !== nodeId) ?? []
}

/**
 * 计算复选框状态
 */
export function computeCheckState<T>(
  nodeId: NodeId,
  nodeMap: Map<NodeId, FlatNode<T>>,
  checkStrictly: boolean = false
): CheckState {
  if (checkStrictly) {
    return nodeMap.get(nodeId)?.state.checked ?? 'unchecked'
  }

  const node = nodeMap.get(nodeId)
  if (!node || node.isLeaf || !node.childIds.length) {
    return node?.state.checked ?? 'unchecked'
  }

  const childStates = node.childIds.map(id =>
    computeCheckState(id, nodeMap, checkStrictly)
  )

  const allChecked = childStates.every(s => s === 'checked')
  const allUnchecked = childStates.every(s => s === 'unchecked')

  if (allChecked) return 'checked'
  if (allUnchecked) return 'unchecked'
  return 'indeterminate'
}

/**
 * 深度克隆对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T
  }

  const cloned = {} as T
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key])
    }
  }
  return cloned
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn(...args)
      lastTime = now
    }
  }
}

/**
 * RAF 节流
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null

  return (...args: Parameters<T>) => {
    if (rafId !== null) return

    rafId = requestAnimationFrame(() => {
      fn(...args)
      rafId = null
    })
  }
}

/**
 * 判断是否为移动设备
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * 创建 CSS 类名
 */
export function cx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * 格式化节点路径
 */
export function getNodePath<T>(
  nodeId: NodeId,
  nodeMap: Map<NodeId, FlatNode<T>>,
  separator: string = ' / '
): string {
  const path: string[] = []
  let currentId: NodeId | null = nodeId

  while (currentId !== null) {
    const node = nodeMap.get(currentId)
    if (node) {
      path.unshift(node.label)
      currentId = node.parentId
    } else {
      break
    }
  }

  return path.join(separator)
}

/**
 * 搜索匹配高亮
 */
export function highlightText(
  text: string,
  query: string,
  highlightClass: string = 'tree-highlight'
): string {
  if (!query) return text

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, `<span class="${highlightClass}">$1</span>`)
}

/**
 * 转义正则表达式特殊字符
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 比较两个节点 ID 是否相等
 */
export function isSameId(a: NodeId, b: NodeId): boolean {
  return String(a) === String(b)
}

/**
 * 检查 ID 是否在列表中
 */
export function isIdInList(id: NodeId, list: NodeId[]): boolean {
  return list.some(item => isSameId(item, id))
}
