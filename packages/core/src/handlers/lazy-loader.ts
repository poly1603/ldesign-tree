/**
 * 懒加载器
 */

import type { NodeId, TreeNodeData, FlatNode } from '../types'
import type { TreeStore } from '../core/tree-store'

export interface LazyLoaderOptions<T = unknown> {
  loadData: (node: FlatNode<T>) => Promise<TreeNodeData<T>[]>
  retryCount?: number
  retryDelay?: number
  timeout?: number
}

export class LazyLoader<T = unknown> {
  private store: TreeStore<T>
  private options: Required<LazyLoaderOptions<T>>
  private loadingIds = new Set<NodeId>()
  private loadedIds = new Set<NodeId>()
  private errorMap = new Map<NodeId, Error>()

  constructor(store: TreeStore<T>, options: LazyLoaderOptions<T>) {
    this.store = store
    this.options = { retryCount: 3, retryDelay: 1000, timeout: 30000, ...options }
  }

  isLoading(nodeId: NodeId): boolean {
    return this.loadingIds.has(nodeId)
  }

  isLoaded(nodeId: NodeId): boolean {
    return this.loadedIds.has(nodeId)
  }

  getError(nodeId: NodeId): Error | undefined {
    return this.errorMap.get(nodeId)
  }

  async load(nodeId: NodeId): Promise<TreeNodeData<T>[]> {
    const node = this.store.getNode(nodeId)
    if (!node) throw new Error(`Node "${nodeId}" not found`)
    if (this.loadingIds.has(nodeId)) return []
    if (this.loadedIds.has(nodeId) && node.childIds.length > 0) return []

    this.loadingIds.add(nodeId)
    this.errorMap.delete(nodeId)
    node.state.loading = true

    let lastError: Error | null = null
    let retries = 0

    while (retries <= this.options.retryCount) {
      try {
        const children = await Promise.race([
          this.options.loadData(node),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), this.options.timeout)
          ),
        ])

        this.loadingIds.delete(nodeId)
        this.loadedIds.add(nodeId)
        node.state.loading = false

        if (children.length > 0) {
          children.forEach((child, index) => this.store.addNode(child, nodeId, index))
        } else {
          node.isLeaf = true
        }

        this.store.emit('load-data', { node, children })
        return children
      } catch (error) {
        lastError = error as Error
        retries++
        if (retries <= this.options.retryCount) {
          await new Promise(r => setTimeout(r, this.options.retryDelay * retries))
        }
      }
    }

    this.loadingIds.delete(nodeId)
    this.errorMap.set(nodeId, lastError!)
    node.state.loading = false
    throw lastError
  }

  async reload(nodeId: NodeId): Promise<TreeNodeData<T>[]> {
    const node = this.store.getNode(nodeId)
    if (!node) throw new Error(`Node "${nodeId}" not found`)

    const childIds = [...node.childIds]
    childIds.forEach(id => this.store.removeNode(id))
    this.loadedIds.delete(nodeId)

    return this.load(nodeId)
  }

  clearAll(): void {
    this.loadingIds.clear()
    this.errorMap.clear()
    this.loadedIds.clear()
  }

  destroy(): void {
    this.clearAll()
  }
}
