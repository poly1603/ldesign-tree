/**
 * @ldesign/tree - 工具函数
 */

import type { TreeNode, TreeNodeId, ExportFormat, ExportOptions } from '../types';

/**
 * 生成唯一 ID
 */
export function generateId(): string {
  return `tree-node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 将嵌套树转换为扁平列表
 */
export function flattenTree<T = any>(nodes: TreeNode<T>[]): TreeNode<T>[] {
  const result: TreeNode<T>[] = [];

  function traverse(nodes: TreeNode<T>[]): void {
    nodes.forEach((node) => {
      result.push(node);
      if (node.children?.length) {
        traverse(node.children);
      }
    });
  }

  traverse(nodes);
  return result;
}

/**
 * 将扁平列表转换为嵌套树
 */
export function unflattenTree<T = any>(
  nodes: TreeNode<T>[],
  idKey: keyof TreeNode = 'id',
  parentIdKey: keyof TreeNode = 'parentId'
): TreeNode<T>[] {
  const nodeMap = new Map<TreeNodeId, TreeNode<T>>();
  const roots: TreeNode<T>[] = [];

  // 创建节点映射
  nodes.forEach((node) => {
    nodeMap.set(node[idKey] as TreeNodeId, { ...node, children: [] });
  });

  // 构建树结构
  nodes.forEach((node) => {
    const treeNode = nodeMap.get(node[idKey] as TreeNodeId)!;
    const parentId = node[parentIdKey] as TreeNodeId | null | undefined;

    if (parentId != null) {
      const parent = nodeMap.get(parentId);
      if (parent) {
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(treeNode);
      } else {
        roots.push(treeNode);
      }
    } else {
      roots.push(treeNode);
    }
  });

  return roots;
}

/**
 * 克隆树节点
 */
export function cloneNode<T = any>(node: TreeNode<T>, deep = true): TreeNode<T> {
  const cloned: TreeNode<T> = { ...node };

  if (deep && node.children) {
    cloned.children = node.children.map((child) => cloneNode(child, deep));
  } else {
    delete cloned.children;
  }

  return cloned;
}

/**
 * 克隆树
 */
export function cloneTree<T = any>(nodes: TreeNode<T>[]): TreeNode<T>[] {
  return nodes.map((node) => cloneNode(node, true));
}

/**
 * 过滤树（保留匹配的节点及其祖先）
 */
export function filterTree<T = any>(
  nodes: TreeNode<T>[],
  predicate: (node: TreeNode<T>) => boolean
): TreeNode<T>[] {
  const result: TreeNode<T>[] = [];

  function traverse(nodes: TreeNode<T>[]): TreeNode<T>[] {
    const filtered: TreeNode<T>[] = [];

    nodes.forEach((node) => {
      const match = predicate(node);
      const childrenMatch = node.children ? traverse(node.children) : [];

      if (match || childrenMatch.length > 0) {
        const cloned = cloneNode(node, false);
        cloned.children = childrenMatch;
        filtered.push(cloned);
      }
    });

    return filtered;
  }

  return traverse(nodes);
}

/**
 * 树转 JSON
 */
export function treeToJSON<T = any>(nodes: TreeNode<T>[], pretty = false): string {
  return JSON.stringify(nodes, null, pretty ? 2 : 0);
}

/**
 * JSON 转树
 */
export function jsonToTree<T = any>(json: string): TreeNode<T>[] {
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to parse JSON:', e);
    return [];
  }
}

/**
 * 树转 CSV
 */
export function treeToCSV<T = any>(nodes: TreeNode<T>[], fields?: string[]): string {
  const flatNodes = flattenTree(nodes);
  const headers = fields || ['id', 'label', 'parentId', 'level'];
  const rows: string[][] = [headers];

  flatNodes.forEach((node) => {
    const row = headers.map((field) => {
      const value = node[field as keyof TreeNode];
      return value != null ? String(value) : '';
    });
    rows.push(row);
  });

  return rows.map((row) => row.map(escapeCSV).join(',')).join('\n');
}

/**
 * 转义 CSV 字段
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * 导出树数据
 */
export function exportTree<T = any>(
  nodes: TreeNode<T>[],
  options: ExportOptions
): string | Blob {
  const { format, selectedOnly, includeChildren, fields } = options;

  let data = nodes;

  // 如果只导出选中的节点
  if (selectedOnly) {
    data = filterTree(nodes, (node) => node.selected === true);
  }

  // 如果不包含子节点
  if (!includeChildren) {
    data = data.map((node) => ({ ...node, children: undefined }));
  }

  switch (format) {
    case 'json':
      return treeToJSON(data, true);

    case 'csv':
      return treeToCSV(data, fields);

    case 'excel':
      // Excel 导出需要额外的库支持（如 xlsx）
      // 这里返回 CSV 格式
      return treeToCSV(data, fields);

    default:
      return treeToJSON(data);
  }
}

/**
 * 查找节点
 */
export function findNode<T = any>(
  nodes: TreeNode<T>[],
  predicate: (node: TreeNode<T>) => boolean
): TreeNode<T> | null {
  for (const node of nodes) {
    if (predicate(node)) {
      return node;
    }
    if (node.children) {
      const found = findNode(node.children, predicate);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/**
 * 查找所有匹配的节点
 */
export function findNodes<T = any>(
  nodes: TreeNode<T>[],
  predicate: (node: TreeNode<T>) => boolean
): TreeNode<T>[] {
  const result: TreeNode<T>[] = [];

  function traverse(nodes: TreeNode<T>[]): void {
    nodes.forEach((node) => {
      if (predicate(node)) {
        result.push(node);
      }
      if (node.children) {
        traverse(node.children);
      }
    });
  }

  traverse(nodes);
  return result;
}

/**
 * 树的深度
 */
export function getTreeDepth<T = any>(nodes: TreeNode<T>[]): number {
  let maxDepth = 0;

  function traverse(nodes: TreeNode<T>[], depth: number): void {
    nodes.forEach((node) => {
      if (depth > maxDepth) {
        maxDepth = depth;
      }
      if (node.children?.length) {
        traverse(node.children, depth + 1);
      }
    });
  }

  traverse(nodes, 1);
  return maxDepth;
}

/**
 * 获取树节点总数
 */
export function getTreeNodeCount<T = any>(nodes: TreeNode<T>[]): number {
  return flattenTree(nodes).length;
}

/**
 * 获取叶子节点数量
 */
export function getLeafNodeCount<T = any>(nodes: TreeNode<T>[]): number {
  return flattenTree(nodes).filter((node) => node.isLeaf || !node.children?.length).length;
}

/**
 * 比较两棵树的差异
 */
export function diffTree<T = any>(
  oldTree: TreeNode<T>[],
  newTree: TreeNode<T>[]
): {
  added: TreeNode<T>[];
  removed: TreeNode<T>[];
  modified: TreeNode<T>[];
} {
  const oldFlat = flattenTree(oldTree);
  const newFlat = flattenTree(newTree);

  const oldMap = new Map(oldFlat.map((n) => [n.id, n]));
  const newMap = new Map(newFlat.map((n) => [n.id, n]));

  const added: TreeNode<T>[] = [];
  const removed: TreeNode<T>[] = [];
  const modified: TreeNode<T>[] = [];

  // 查找新增和修改的节点
  newFlat.forEach((newNode) => {
    const oldNode = oldMap.get(newNode.id);
    if (!oldNode) {
      added.push(newNode);
    } else if (JSON.stringify(oldNode) !== JSON.stringify(newNode)) {
      modified.push(newNode);
    }
  });

  // 查找删除的节点
  oldFlat.forEach((oldNode) => {
    if (!newMap.has(oldNode.id)) {
      removed.push(oldNode);
    }
  });

  return { added, removed, modified };
}

/**
 * 排序树
 */
export function sortTree<T = any>(
  nodes: TreeNode<T>[],
  compareFn: (a: TreeNode<T>, b: TreeNode<T>) => number
): TreeNode<T>[] {
  const sorted = [...nodes].sort(compareFn);
  sorted.forEach((node) => {
    if (node.children?.length) {
      node.children = sortTree(node.children, compareFn);
    }
  });
  return sorted;
}

/**
 * 树数据验证
 */
export function validateTree<T = any>(nodes: TreeNode<T>[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const idSet = new Set<TreeNodeId>();

  function validate(nodes: TreeNode<T>[], parentId?: TreeNodeId): void {
    nodes.forEach((node, index) => {
      // 检查 ID 是否存在
      if (node.id == null) {
        errors.push(`Node at index ${index} is missing an id`);
        return;
      }

      // 检查 ID 是否重复
      if (idSet.has(node.id)) {
        errors.push(`Duplicate node id: ${node.id}`);
      } else {
        idSet.add(node.id);
      }

      // 检查 label 是否存在
      if (!node.label) {
        errors.push(`Node ${node.id} is missing a label`);
      }

      // 检查 parentId 是否正确
      if (parentId !== undefined && node.parentId !== parentId) {
        errors.push(`Node ${node.id} has incorrect parentId`);
      }

      // 递归验证子节点
      if (node.children?.length) {
        validate(node.children, node.id);
      }
    });
  }

  validate(nodes);

  return {
    valid: errors.length === 0,
    errors,
  };
}

