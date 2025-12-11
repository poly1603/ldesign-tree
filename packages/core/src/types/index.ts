/**
 * @ldesign/tree-core 类型定义
 */

// ==================== 节点类型 ====================

/** 节点唯一标识类型 */
export type NodeId = string | number

/** 复选框状态 */
export type CheckState = 'checked' | 'unchecked' | 'indeterminate'

/** 拖拽放置位置 */
export type DropPosition = 'before' | 'inside' | 'after'

/** 节点状态 */
export interface NodeState {
  /** 是否展开 */
  expanded: boolean
  /** 是否选中 */
  selected: boolean
  /** 是否禁用 */
  disabled: boolean
  /** 复选框状态 */
  checked: CheckState
  /** 是否正在加载 */
  loading: boolean
  /** 是否匹配搜索 */
  matched: boolean
  /** 是否可见（受搜索/过滤影响） */
  visible: boolean
  /** 是否正在拖拽 */
  dragging: boolean
  /** 是否是拖拽目标 */
  dropTarget: boolean
  /** 放置位置指示 */
  dropPosition: DropPosition | null
  /** 是否正在编辑 */
  editing: boolean
  /** 是否聚焦 */
  focused: boolean
}

/** 树节点数据 */
export interface TreeNodeData<T = unknown> {
  /** 节点唯一标识 */
  id: NodeId
  /** 节点显示文本 */
  label: string
  /** 子节点列表 */
  children?: TreeNodeData<T>[]
  /** 节点图标 */
  icon?: string
  /** 是否为叶子节点（没有子节点） */
  isLeaf?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否可勾选 */
  checkable?: boolean
  /** 是否可拖拽 */
  draggable?: boolean
  /** 是否可作为放置目标 */
  droppable?: boolean
  /** 是否可选择 */
  selectable?: boolean
  /** 自定义数据 */
  data?: T
}

/** 扁平化的树节点（内部使用） */
export interface FlatNode<T = unknown> {
  /** 节点唯一标识 */
  id: NodeId
  /** 父节点 ID */
  parentId: NodeId | null
  /** 节点层级（从 0 开始） */
  level: number
  /** 节点显示文本 */
  label: string
  /** 子节点 ID 列表 */
  childIds: NodeId[]
  /** 节点图标 */
  icon?: string
  /** 是否为叶子节点 */
  isLeaf: boolean
  /** 是否禁用 */
  disabled: boolean
  /** 是否可勾选 */
  checkable: boolean
  /** 是否可拖拽 */
  draggable: boolean
  /** 是否可作为放置目标 */
  droppable: boolean
  /** 是否可选择 */
  selectable: boolean
  /** 节点状态 */
  state: NodeState
  /** 原始索引（用于排序） */
  originalIndex: number
  /** 自定义数据 */
  data?: T
}

// ==================== 配置类型 ====================

/** 树配置选项 */
export interface TreeOptions<T = unknown> {
  /** 节点缩进大小（px） */
  indent?: number
  /** 是否显示连接线 */
  showLine?: boolean
  /** 连接线样式 */
  lineStyle?: 'solid' | 'dashed' | 'dotted'
  /** 是否显示图标 */
  showIcon?: boolean
  /** 是否显示复选框 */
  checkable?: boolean
  /** 复选框是否级联选中 */
  checkCascade?: boolean
  /** 复选框是否严格模式（不级联） */
  checkStrictly?: boolean
  /** 是否支持多选 */
  multiple?: boolean
  /** 是否支持拖拽 */
  draggable?: boolean
  /** 是否支持拖拽排序 */
  sortable?: boolean
  /** 默认展开所有节点 */
  defaultExpandAll?: boolean
  /** 默认展开的节点 ID 列表 */
  defaultExpandedIds?: NodeId[]
  /** 默认选中的节点 ID 列表 */
  defaultSelectedIds?: NodeId[]
  /** 默认勾选的节点 ID 列表 */
  defaultCheckedIds?: NodeId[]
  /** 是否启用虚拟滚动 */
  virtual?: boolean
  /** 虚拟滚动时每个节点的高度 */
  itemHeight?: number
  /** 虚拟滚动时的缓冲区大小 */
  bufferSize?: number
  /** 是否可编辑节点 */
  editable?: boolean
  /** 是否启用动画 */
  animate?: boolean
  /** 动画持续时间（ms） */
  animationDuration?: number
  /** 是否启用键盘导航 */
  keyboardNavigation?: boolean
  /** 空状态文本 */
  emptyText?: string
  /** 加载中文本 */
  loadingText?: string
  /** 懒加载函数 */
  loadData?: (node: FlatNode<T>) => Promise<TreeNodeData<T>[]>
  /** 自定义过滤函数 */
  filterMethod?: (query: string, node: FlatNode<T>) => boolean
  /** 节点是否可拖拽判断函数 */
  allowDrag?: (node: FlatNode<T>) => boolean
  /** 节点是否可放置判断函数 */
  allowDrop?: (dragNode: FlatNode<T>, dropNode: FlatNode<T>, position: DropPosition) => boolean
  /** 自定义节点图标函数 */
  iconRenderer?: (node: FlatNode<T>) => string | HTMLElement | null
  /** 自定义节点内容渲染函数 */
  nodeRenderer?: (node: FlatNode<T>) => string | HTMLElement | null
  /** 自定义展开图标 */
  expandIcon?: string | ((expanded: boolean) => string)
  /** 自定义复选框图标 */
  checkboxIcon?: (state: CheckState) => string
}

// ==================== 事件类型 ====================

/** 节点点击事件 */
export interface NodeClickEvent<T = unknown> {
  node: FlatNode<T>
  originalEvent: MouseEvent
}

/** 节点双击事件 */
export interface NodeDblClickEvent<T = unknown> {
  node: FlatNode<T>
  originalEvent: MouseEvent
}

/** 节点右键菜单事件 */
export interface NodeContextMenuEvent<T = unknown> {
  node: FlatNode<T>
  originalEvent: MouseEvent
}

/** 节点展开事件 */
export interface NodeExpandEvent<T = unknown> {
  node: FlatNode<T>
  expanded: boolean
}

/** 节点选中事件 */
export interface NodeSelectEvent<T = unknown> {
  node: FlatNode<T>
  selected: boolean
  selectedNodes: FlatNode<T>[]
}

/** 节点勾选事件 */
export interface NodeCheckEvent<T = unknown> {
  node: FlatNode<T>
  checked: CheckState
  checkedNodes: FlatNode<T>[]
}

/** 拖拽开始事件 */
export interface DragStartEvent<T = unknown> {
  node: FlatNode<T>
  originalEvent: DragEvent
}

/** 拖拽中事件 */
export interface DragOverEvent<T = unknown> {
  dragNode: FlatNode<T>
  dropNode: FlatNode<T>
  position: DropPosition
  originalEvent: DragEvent
}

/** 拖拽结束事件 */
export interface DragEndEvent<T = unknown> {
  dragNode: FlatNode<T>
  dropNode: FlatNode<T> | null
  position: DropPosition | null
  originalEvent: DragEvent
}

/** 拖拽放置事件 */
export interface DropEvent<T = unknown> {
  dragNode: FlatNode<T>
  dropNode: FlatNode<T>
  position: DropPosition
  originalEvent: DragEvent
}

/** 节点编辑事件 */
export interface NodeEditEvent<T = unknown> {
  node: FlatNode<T>
  oldLabel: string
  newLabel: string
}

/** 懒加载事件 */
export interface LoadDataEvent<T = unknown> {
  node: FlatNode<T>
  children: TreeNodeData<T>[]
}

/** 搜索事件 */
export interface SearchEvent<T = unknown> {
  query: string
  matchedNodes: FlatNode<T>[]
}

/** 事件映射 */
export interface TreeEventMap<T = unknown> {
  'node-click': NodeClickEvent<T>
  'node-dblclick': NodeDblClickEvent<T>
  'node-contextmenu': NodeContextMenuEvent<T>
  'node-expand': NodeExpandEvent<T>
  'node-collapse': NodeExpandEvent<T>
  'node-select': NodeSelectEvent<T>
  'node-check': NodeCheckEvent<T>
  'drag-start': DragStartEvent<T>
  'drag-over': DragOverEvent<T>
  'drag-end': DragEndEvent<T>
  'drop': DropEvent<T>
  'node-edit': NodeEditEvent<T>
  'load-data': LoadDataEvent<T>
  'search': SearchEvent<T>
  'data-change': { nodes: FlatNode<T>[] }
  'scroll': { scrollTop: number; scrollLeft: number }
}

/** 事件监听器类型 */
export type TreeEventListener<T = unknown, K extends keyof TreeEventMap<T> = keyof TreeEventMap<T>> =
  (event: TreeEventMap<T>[K]) => void

// ==================== 渲染器类型 ====================

/** 虚拟滚动可见范围 */
export interface VisibleRange {
  start: number
  end: number
  offsetY: number
}

/** 渲染上下文 */
export interface RenderContext<T = unknown> {
  /** 扁平化节点列表 */
  flatNodes: FlatNode<T>[]
  /** 可见节点列表 */
  visibleNodes: FlatNode<T>[]
  /** 可见范围 */
  visibleRange: VisibleRange
  /** 配置选项 */
  options: Required<TreeOptions<T>>
  /** 容器高度 */
  containerHeight: number
  /** 内容总高度 */
  totalHeight: number
  /** 滚动位置 */
  scrollTop: number
}

/** 渲染器接口 */
export interface TreeRenderer<T = unknown> {
  /** 挂载到容器 */
  mount(container: HTMLElement): void
  /** 卸载 */
  unmount(): void
  /** 更新渲染 */
  render(context: RenderContext<T>): void
  /** 滚动到指定节点 */
  scrollToNode(nodeId: NodeId): void
  /** 滚动到指定位置 */
  scrollTo(scrollTop: number): void
  /** 获取滚动位置 */
  getScrollTop(): number
  /** 销毁 */
  destroy(): void
}

// ==================== 导出数据类型 ====================

/** 导出格式 */
export type ExportFormat = 'json' | 'csv' | 'excel'

/** 导出选项 */
export interface ExportOptions {
  /** 导出格式 */
  format: ExportFormat
  /** 文件名 */
  filename?: string
  /** 是否包含禁用节点 */
  includeDisabled?: boolean
  /** 是否只导出选中节点 */
  selectedOnly?: boolean
  /** 是否只导出勾选节点 */
  checkedOnly?: boolean
  /** 自定义字段映射 */
  fields?: Record<string, string>
}

// ==================== 统计类型 ====================

/** 树统计信息 */
export interface TreeStats {
  /** 总节点数 */
  totalNodes: number
  /** 可见节点数 */
  visibleNodes: number
  /** 展开节点数 */
  expandedNodes: number
  /** 选中节点数 */
  selectedNodes: number
  /** 勾选节点数 */
  checkedNodes: number
  /** 半选节点数 */
  indeterminateNodes: number
  /** 禁用节点数 */
  disabledNodes: number
  /** 叶子节点数 */
  leafNodes: number
  /** 最大层级深度 */
  maxDepth: number
}
