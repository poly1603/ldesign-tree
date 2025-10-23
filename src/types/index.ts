/**
 * @ldesign/tree - TypeScript 类型定义
 */

/** 树节点 ID 类型 */
export type TreeNodeId = string | number;

/** 树节点数据结构 */
export interface TreeNode<T = any> {
  /** 节点唯一标识 */
  id: TreeNodeId;
  /** 节点显示文本 */
  label: string;
  /** 父节点 ID */
  parentId?: TreeNodeId | null;
  /** 子节点列表 */
  children?: TreeNode<T>[];
  /** 是否展开 */
  expanded?: boolean;
  /** 是否选中 */
  selected?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示复选框 */
  checkable?: boolean;
  /** 复选框状态：checked/unchecked/indeterminate */
  checked?: CheckState;
  /** 是否叶子节点 */
  isLeaf?: boolean;
  /** 是否正在加载 */
  loading?: boolean;
  /** 节点图标 */
  icon?: string;
  /** 节点层级（根节点为 0） */
  level?: number;
  /** 节点路径（从根到当前节点的 ID 数组） */
  path?: TreeNodeId[];
  /** 自定义数据 */
  data?: T;
}

/** 复选框状态 */
export type CheckState = 'checked' | 'unchecked' | 'indeterminate';

/** 扁平化的树节点（用于虚拟滚动） */
export interface FlatTreeNode<T = any> extends TreeNode<T> {
  /** 节点层级 */
  level: number;
  /** 节点路径 */
  path: TreeNodeId[];
  /** 是否可见（父节点展开） */
  visible: boolean;
  /** 父节点引用 */
  parent?: FlatTreeNode<T>;
  /** 原始索引 */
  index: number;
}

/** 树配置选项 */
export interface TreeOptions {
  /** 节点缩进像素 */
  indent?: number;
  /** 是否显示连接线 */
  showLine?: boolean;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 是否显示复选框 */
  checkable?: boolean;
  /** 是否支持多选 */
  multiple?: boolean;
  /** 是否支持拖拽 */
  draggable?: boolean;
  /** 默认展开所有节点 */
  defaultExpandAll?: boolean;
  /** 默认展开的节点 ID 列表 */
  defaultExpandedKeys?: TreeNodeId[];
  /** 默认选中的节点 ID 列表 */
  defaultSelectedKeys?: TreeNodeId[];
  /** 默认勾选的节点 ID 列表 */
  defaultCheckedKeys?: TreeNodeId[];
  /** 虚拟滚动配置 */
  virtual?: boolean;
  /** 虚拟滚动项高度 */
  itemHeight?: number;
  /** 懒加载函数 */
  loadData?: (node: TreeNode) => Promise<TreeNode[]>;
  /** 过滤函数 */
  filterMethod?: (query: string, node: TreeNode) => boolean;
  /** 是否高亮当前选中节点 */
  highlightCurrent?: boolean;
  /** 节点可拖拽判断函数 */
  allowDrag?: (node: TreeNode) => boolean;
  /** 节点可放置判断函数 */
  allowDrop?: (draggingNode: TreeNode, dropNode: TreeNode, type: DropType) => boolean;
}

/** 拖拽放置类型 */
export type DropType = 'before' | 'after' | 'inner';

/** 拖拽事件数据 */
export interface DragEventData {
  /** 被拖拽的节点 */
  dragNode: TreeNode;
  /** 目标节点 */
  dropNode: TreeNode;
  /** 放置类型 */
  dropType: DropType;
}

/** 节点点击事件数据 */
export interface NodeClickEventData {
  node: TreeNode;
  event: MouseEvent;
}

/** 节点展开/折叠事件数据 */
export interface NodeExpandEventData {
  node: TreeNode;
  expanded: boolean;
}

/** 节点勾选事件数据 */
export interface NodeCheckEventData {
  node: TreeNode;
  checked: boolean;
  checkedNodes: TreeNode[];
}

/** 搜索配置 */
export interface SearchOptions {
  /** 搜索关键词 */
  query: string;
  /** 是否使用正则表达式 */
  useRegex?: boolean;
  /** 是否区分大小写 */
  caseSensitive?: boolean;
  /** 是否高亮匹配 */
  highlight?: boolean;
}

/** 虚拟滚动配置 */
export interface VirtualScrollConfig {
  /** 容器高度 */
  height: number;
  /** 项高度 */
  itemHeight: number;
  /** 缓冲区大小 */
  buffer?: number;
}

/** 虚拟滚动状态 */
export interface VirtualScrollState {
  /** 开始索引 */
  startIndex: number;
  /** 结束索引 */
  endIndex: number;
  /** 偏移量 */
  offset: number;
  /** 可见项数量 */
  visibleCount: number;
}

/** 树事件回调 */
export interface TreeEvents {
  onNodeClick?: (data: NodeClickEventData) => void;
  onNodeDblClick?: (data: NodeClickEventData) => void;
  onNodeContextMenu?: (data: NodeClickEventData) => void;
  onNodeExpand?: (data: NodeExpandEventData) => void;
  onNodeCollapse?: (data: NodeExpandEventData) => void;
  onNodeCheck?: (data: NodeCheckEventData) => void;
  onDragStart?: (data: DragEventData) => void;
  onDragEnd?: (data: DragEventData) => void;
  onDrop?: (data: DragEventData) => void;
}

/** 导出格式 */
export type ExportFormat = 'json' | 'csv' | 'excel';

/** 导出配置 */
export interface ExportOptions {
  format: ExportFormat;
  /** 是否只导出选中的节点 */
  selectedOnly?: boolean;
  /** 是否包含子节点 */
  includeChildren?: boolean;
  /** 导出的字段 */
  fields?: string[];
}

