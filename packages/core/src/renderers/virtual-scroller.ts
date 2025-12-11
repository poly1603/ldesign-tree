/**
 * 虚拟滚动引擎 - 高性能大数据渲染
 */

import type { VisibleRange } from '../types'
import { rafThrottle } from '../utils'

export interface VirtualScrollerOptions {
  /** 每个项目的高度 */
  itemHeight: number
  /** 缓冲区大小（上下各多渲染的项目数） */
  bufferSize: number
  /** 容器高度 */
  containerHeight: number
  /** 总项目数 */
  totalCount: number
  /** 滚动回调 */
  onScroll?: (scrollTop: number, range: VisibleRange) => void
  /** 范围变化回调 */
  onRangeChange?: (range: VisibleRange) => void
}

export class VirtualScroller {
  private options: VirtualScrollerOptions
  private scrollTop: number = 0
  private lastRange: VisibleRange | null = null

  constructor(options: VirtualScrollerOptions) {
    this.options = options
  }

  /**
   * 更新配置
   */
  setOptions(options: Partial<VirtualScrollerOptions>): void {
    Object.assign(this.options, options)
  }

  /**
   * 设置总项目数
   */
  setTotalCount(count: number): void {
    this.options.totalCount = count
  }

  /**
   * 设置容器高度
   */
  setContainerHeight(height: number): void {
    this.options.containerHeight = height
  }

  /**
   * 获取总高度
   */
  getTotalHeight(): number {
    return this.options.totalCount * this.options.itemHeight
  }

  /**
   * 计算可见范围
   */
  calculateRange(scrollTop: number): VisibleRange {
    const { itemHeight, bufferSize, containerHeight, totalCount } = this.options

    if (totalCount === 0) {
      return { start: 0, end: 0, offsetY: 0 }
    }

    // 计算起始索引
    const startIndex = Math.floor(scrollTop / itemHeight)
    const start = Math.max(0, startIndex - bufferSize)

    // 计算可见数量
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = Math.min(totalCount, startIndex + visibleCount + bufferSize)

    // 计算偏移量
    const offsetY = start * itemHeight

    return { start, end, offsetY }
  }

  /**
   * 处理滚动
   */
  handleScroll = rafThrottle((scrollTop: number): void => {
    this.scrollTop = scrollTop
    const range = this.calculateRange(scrollTop)

    // 检查范围是否变化
    if (
      !this.lastRange ||
      this.lastRange.start !== range.start ||
      this.lastRange.end !== range.end
    ) {
      this.lastRange = range
      this.options.onRangeChange?.(range)
    }

    this.options.onScroll?.(scrollTop, range)
  })

  /**
   * 滚动到指定索引
   */
  scrollToIndex(index: number): number {
    const scrollTop = index * this.options.itemHeight
    return Math.max(0, Math.min(scrollTop, this.getTotalHeight() - this.options.containerHeight))
  }

  /**
   * 滚动到底部
   */
  scrollToBottom(): number {
    return this.getTotalHeight() - this.options.containerHeight
  }

  /**
   * 获取当前可见范围
   */
  getVisibleRange(): VisibleRange {
    return this.lastRange ?? this.calculateRange(this.scrollTop)
  }

  /**
   * 获取当前滚动位置
   */
  getScrollTop(): number {
    return this.scrollTop
  }

  /**
   * 获取项目在列表中的位置
   */
  getItemOffset(index: number): number {
    return index * this.options.itemHeight
  }

  /**
   * 检查项目是否在可见范围内
   */
  isItemVisible(index: number): boolean {
    const range = this.getVisibleRange()
    return index >= range.start && index < range.end
  }

  /**
   * 获取可见项目数量
   */
  getVisibleCount(): number {
    return Math.ceil(this.options.containerHeight / this.options.itemHeight)
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.lastRange = null
  }
}

/**
 * 创建虚拟滚动实例
 */
export function createVirtualScroller(options: VirtualScrollerOptions): VirtualScroller {
  return new VirtualScroller(options)
}
