/**
 * @ldesign/tree - 懒加载管理器
 * 支持异步加载子节点、加载状态、失败重试等
 */

import type { TreeNode, TreeNodeId } from '../types';
import type { TreeManager } from './tree-manager';

export type LoadDataFunction<T = any> = (node: TreeNode<T>) => Promise<TreeNode<T>[]>;

export interface LazyLoadOptions {
  /** 最大重试次数 */
  maxRetries?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
  /** 加载超时（毫秒） */
  timeout?: number;
}

export interface LoadState {
  loading: boolean;
  loaded: boolean;
  error: Error | null;
  retries: number;
}

export class LazyLoader<T = any> {
  private treeManager: TreeManager<T>;
  private loadDataFn: LoadDataFunction<T> | null = null;
  private loadStates: Map<TreeNodeId, LoadState> = new Map();
  private options: Required<LazyLoadOptions>;

  constructor(treeManager: TreeManager<T>, options: LazyLoadOptions = {}) {
    this.treeManager = treeManager;
    this.options = {
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      timeout: options.timeout || 30000,
    };
  }

  /**
   * 设置加载函数
   */
  setLoadDataFunction(fn: LoadDataFunction<T>): void {
    this.loadDataFn = fn;
  }

  /**
   * 加载节点的子节点
   */
  async loadNode(nodeId: TreeNodeId): Promise<TreeNode<T>[]> {
    if (!this.loadDataFn) {
      throw new Error('Load data function not set');
    }

    const node = this.treeManager.getNode(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    // 检查是否已加载
    const loadState = this.getLoadState(nodeId);
    if (loadState.loaded) {
      return node.children || [];
    }

    // 检查是否正在加载
    if (loadState.loading) {
      return this.waitForLoad(nodeId);
    }

    // 开始加载
    return this.performLoad(nodeId);
  }

  /**
   * 执行加载
   */
  private async performLoad(nodeId: TreeNodeId): Promise<TreeNode<T>[]> {
    const node = this.treeManager.getNode(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const loadState = this.getLoadState(nodeId);
    loadState.loading = true;
    loadState.error = null;

    // 更新节点加载状态
    this.treeManager.updateNode(nodeId, { loading: true });

    try {
      // 使用超时包装
      const children = await this.withTimeout(
        this.loadDataFn!(node),
        this.options.timeout
      );

      // 添加子节点
      children.forEach((child) => {
        this.treeManager.addNode(child, nodeId);
      });

      // 更新状态
      loadState.loading = false;
      loadState.loaded = true;
      loadState.retries = 0;

      this.treeManager.updateNode(nodeId, {
        loading: false,
        isLeaf: children.length === 0,
      });

      return children;
    } catch (error) {
      loadState.error = error as Error;
      loadState.loading = false;

      this.treeManager.updateNode(nodeId, { loading: false });

      // 尝试重试
      if (loadState.retries < this.options.maxRetries) {
        loadState.retries++;
        await this.delay(this.options.retryDelay);
        return this.performLoad(nodeId);
      }

      throw error;
    }
  }

  /**
   * 等待加载完成
   */
  private async waitForLoad(nodeId: TreeNodeId): Promise<TreeNode<T>[]> {
    return new Promise((resolve, reject) => {
      const checkInterval = 100;
      const maxWait = this.options.timeout;
      let waited = 0;

      const interval = setInterval(() => {
        const loadState = this.getLoadState(nodeId);

        if (!loadState.loading) {
          clearInterval(interval);

          if (loadState.loaded) {
            const node = this.treeManager.getNode(nodeId);
            resolve(node?.children || []);
          } else if (loadState.error) {
            reject(loadState.error);
          }
        }

        waited += checkInterval;
        if (waited >= maxWait) {
          clearInterval(interval);
          reject(new Error('Load timeout'));
        }
      }, checkInterval);
    });
  }

  /**
   * 带超时的 Promise
   */
  private withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Load timeout')), timeout)
      ),
    ]);
  }

  /**
   * 延迟
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 获取加载状态
   */
  getLoadState(nodeId: TreeNodeId): LoadState {
    if (!this.loadStates.has(nodeId)) {
      this.loadStates.set(nodeId, {
        loading: false,
        loaded: false,
        error: null,
        retries: 0,
      });
    }
    return this.loadStates.get(nodeId)!;
  }

  /**
   * 重置加载状态
   */
  resetLoadState(nodeId: TreeNodeId): void {
    this.loadStates.delete(nodeId);
  }

  /**
   * 重新加载节点
   */
  async reloadNode(nodeId: TreeNodeId): Promise<TreeNode<T>[]> {
    const node = this.treeManager.getNode(nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    // 清除现有子节点
    if (node.children) {
      node.children.forEach((child) => {
        this.treeManager.removeNode(child.id);
      });
    }

    // 重置加载状态
    this.resetLoadState(nodeId);

    // 重新加载
    return this.loadNode(nodeId);
  }

  /**
   * 预加载节点
   */
  async preloadNode(nodeId: TreeNodeId): Promise<void> {
    try {
      await this.loadNode(nodeId);
    } catch (error) {
      console.error(`Failed to preload node ${nodeId}:`, error);
    }
  }

  /**
   * 批量预加载
   */
  async preloadNodes(nodeIds: TreeNodeId[]): Promise<void> {
    await Promise.all(nodeIds.map((id) => this.preloadNode(id)));
  }

  /**
   * 检查节点是否已加载
   */
  isLoaded(nodeId: TreeNodeId): boolean {
    return this.getLoadState(nodeId).loaded;
  }

  /**
   * 检查节点是否正在加载
   */
  isLoading(nodeId: TreeNodeId): boolean {
    return this.getLoadState(nodeId).loading;
  }

  /**
   * 获取加载错误
   */
  getLoadError(nodeId: TreeNodeId): Error | null {
    return this.getLoadState(nodeId).error;
  }

  /**
   * 清除所有加载状态
   */
  clearAll(): void {
    this.loadStates.clear();
  }

  /**
   * 获取统计信息
   */
  getStats() {
    let loadingCount = 0;
    let loadedCount = 0;
    let errorCount = 0;

    this.loadStates.forEach((state) => {
      if (state.loading) loadingCount++;
      if (state.loaded) loadedCount++;
      if (state.error) errorCount++;
    });

    return {
      total: this.loadStates.size,
      loading: loadingCount,
      loaded: loadedCount,
      error: errorCount,
    };
  }
}

