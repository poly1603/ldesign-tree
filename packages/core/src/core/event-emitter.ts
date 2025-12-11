/**
 * 事件发射器 - 提供类型安全的事件订阅和发布
 */

import type { TreeEventMap, TreeEventListener } from '../types'

export class EventEmitter<T = unknown> {
  private listeners = new Map<keyof TreeEventMap<T>, Set<TreeEventListener<T, any>>>()

  on<K extends keyof TreeEventMap<T>>(event: K, listener: TreeEventListener<T, K>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
    return () => this.off(event, listener)
  }

  once<K extends keyof TreeEventMap<T>>(event: K, listener: TreeEventListener<T, K>): () => void {
    const onceListener: TreeEventListener<T, K> = (data) => {
      this.off(event, onceListener)
      listener(data)
    }
    return this.on(event, onceListener)
  }

  off<K extends keyof TreeEventMap<T>>(event: K, listener: TreeEventListener<T, K>): void {
    this.listeners.get(event)?.delete(listener)
  }

  emit<K extends keyof TreeEventMap<T>>(event: K, data: TreeEventMap<T>[K]): void {
    this.listeners.get(event)?.forEach(listener => {
      try { listener(data) } catch (e) { console.error(e) }
    })
  }

  removeAllListeners(event?: keyof TreeEventMap<T>): void {
    event ? this.listeners.delete(event) : this.listeners.clear()
  }

  destroy(): void {
    this.listeners.clear()
  }
}
