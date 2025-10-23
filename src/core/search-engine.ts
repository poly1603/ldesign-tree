/**
 * @ldesign/tree - 搜索过滤引擎
 * 支持关键词搜索、正则表达式、高亮、自动展开等
 */

import type { TreeNode, TreeNodeId, SearchOptions } from '../types';
import type { TreeManager } from './tree-manager';

export interface SearchResult {
  /** 匹配的节点列表 */
  matches: TreeNode[];
  /** 匹配的节点 ID 列表 */
  matchIds: Set<TreeNodeId>;
  /** 需要展开的节点 ID 列表（包含匹配节点的祖先） */
  expandIds: Set<TreeNodeId>;
  /** 总匹配数 */
  count: number;
}

export class SearchEngine<T = any> {
  private treeManager: TreeManager<T>;
  private currentQuery = '';
  private currentResult: SearchResult | null = null;
  private options: SearchOptions = {
    query: '',
    useRegex: false,
    caseSensitive: false,
    highlight: true,
  };

  constructor(treeManager: TreeManager<T>) {
    this.treeManager = treeManager;
  }

  /**
   * 搜索节点
   */
  search(query: string, options?: Partial<SearchOptions>): SearchResult {
    this.currentQuery = query;
    this.options = {
      ...this.options,
      query,
      ...options,
    };

    const matches: TreeNode[] = [];
    const matchIds = new Set<TreeNodeId>();
    const expandIds = new Set<TreeNodeId>();

    if (!query.trim()) {
      this.currentResult = { matches, matchIds, expandIds, count: 0 };
      return this.currentResult;
    }

    // 创建搜索正则表达式
    const regex = this.createSearchRegex(query, options);

    // 搜索所有节点
    const allNodes = this.treeManager.getAllNodes();
    allNodes.forEach((node) => {
      if (this.matchNode(node, regex, options)) {
        matches.push(node);
        matchIds.add(node.id);

        // 收集需要展开的祖先节点
        const ancestors = this.treeManager.getAncestors(node.id);
        ancestors.forEach((ancestor) => expandIds.add(ancestor.id));
      }
    });

    this.currentResult = {
      matches,
      matchIds,
      expandIds,
      count: matches.length,
    };

    // 自动展开包含匹配结果的节点
    this.expandMatchedNodes();

    return this.currentResult;
  }

  /**
   * 创建搜索正则表达式
   */
  private createSearchRegex(query: string, options?: Partial<SearchOptions>): RegExp {
    const useRegex = options?.useRegex ?? this.options.useRegex;
    const caseSensitive = options?.caseSensitive ?? this.options.caseSensitive;

    let pattern = query;

    if (!useRegex) {
      // 转义特殊字符
      pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    const flags = caseSensitive ? 'g' : 'gi';

    try {
      return new RegExp(pattern, flags);
    } catch (e) {
      // 如果正则表达式无效，使用字面量搜索
      return new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    }
  }

  /**
   * 匹配节点
   */
  private matchNode(
    node: TreeNode,
    regex: RegExp,
    options?: Partial<SearchOptions>
  ): boolean {
    // 匹配节点标签
    if (regex.test(node.label)) {
      return true;
    }

    // 可以扩展匹配其他字段
    if (node.data && typeof node.data === 'object') {
      const dataStr = JSON.stringify(node.data);
      if (regex.test(dataStr)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 展开匹配的节点
   */
  private expandMatchedNodes(): void {
    if (!this.currentResult) return;

    this.currentResult.expandIds.forEach((id) => {
      this.treeManager.expandNode(id);
    });
  }

  /**
   * 过滤节点（自定义过滤函数）
   */
  filter(predicate: (node: TreeNode) => boolean): TreeNode[] {
    const allNodes = this.treeManager.getAllNodes();
    return allNodes.filter(predicate);
  }

  /**
   * 高亮匹配文本
   */
  highlightText(text: string): string {
    if (!this.currentQuery || !this.options.highlight) {
      return text;
    }

    const regex = this.createSearchRegex(this.currentQuery);
    return text.replace(regex, (match) => `<mark class="tree-highlight">${match}</mark>`);
  }

  /**
   * 获取当前搜索结果
   */
  getResult(): SearchResult | null {
    return this.currentResult;
  }

  /**
   * 清除搜索
   */
  clear(): void {
    this.currentQuery = '';
    this.currentResult = null;

    // 可以选择折叠之前展开的节点
    // this.treeManager.collapseAll();
  }

  /**
   * 判断节点是否匹配当前搜索
   */
  isMatched(nodeId: TreeNodeId): boolean {
    return this.currentResult?.matchIds.has(nodeId) ?? false;
  }

  /**
   * 获取下一个匹配节点
   */
  getNextMatch(currentNodeId?: TreeNodeId): TreeNode | null {
    if (!this.currentResult || this.currentResult.matches.length === 0) {
      return null;
    }

    if (!currentNodeId) {
      return this.currentResult.matches[0];
    }

    const currentIndex = this.currentResult.matches.findIndex(
      (node) => node.id === currentNodeId
    );

    if (currentIndex === -1) {
      return this.currentResult.matches[0];
    }

    const nextIndex = (currentIndex + 1) % this.currentResult.matches.length;
    return this.currentResult.matches[nextIndex];
  }

  /**
   * 获取上一个匹配节点
   */
  getPreviousMatch(currentNodeId?: TreeNodeId): TreeNode | null {
    if (!this.currentResult || this.currentResult.matches.length === 0) {
      return null;
    }

    if (!currentNodeId) {
      return this.currentResult.matches[this.currentResult.matches.length - 1];
    }

    const currentIndex = this.currentResult.matches.findIndex(
      (node) => node.id === currentNodeId
    );

    if (currentIndex === -1) {
      return this.currentResult.matches[this.currentResult.matches.length - 1];
    }

    const prevIndex =
      currentIndex === 0 ? this.currentResult.matches.length - 1 : currentIndex - 1;
    return this.currentResult.matches[prevIndex];
  }

  /**
   * 定位到匹配节点
   */
  scrollToMatch(nodeId: TreeNodeId): boolean {
    if (!this.isMatched(nodeId)) {
      return false;
    }

    // 展开所有祖先节点
    const ancestors = this.treeManager.getAncestors(nodeId);
    ancestors.forEach((ancestor) => {
      this.treeManager.expandNode(ancestor.id);
    });

    return true;
  }

  /**
   * 获取搜索统计
   */
  getStats() {
    return {
      query: this.currentQuery,
      matchCount: this.currentResult?.count ?? 0,
      hasResults: (this.currentResult?.count ?? 0) > 0,
      expandedCount: this.currentResult?.expandIds.size ?? 0,
    };
  }

  /**
   * 按字段搜索
   */
  searchByField(field: keyof TreeNode, value: any): TreeNode[] {
    const allNodes = this.treeManager.getAllNodes();
    return allNodes.filter((node) => {
      const nodeValue = node[field];
      if (typeof value === 'string' && typeof nodeValue === 'string') {
        return nodeValue.includes(value);
      }
      return nodeValue === value;
    });
  }

  /**
   * 多条件搜索
   */
  searchMultiple(conditions: Partial<TreeNode>[]): TreeNode[] {
    const allNodes = this.treeManager.getAllNodes();
    return allNodes.filter((node) => {
      return conditions.some((condition) => {
        return Object.entries(condition).every(([key, value]) => {
          const nodeValue = node[key as keyof TreeNode];
          if (typeof value === 'string' && typeof nodeValue === 'string') {
            return nodeValue.includes(value);
          }
          return nodeValue === value;
        });
      });
    });
  }

  /**
   * 重置搜索引擎
   */
  reset(): void {
    this.clear();
  }
}

