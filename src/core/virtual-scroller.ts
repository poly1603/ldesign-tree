/**
 * @ldesign/tree - 虚拟滚动引擎
 * 支持 10,000+ 节点的高性能渲染
 */

import type { VirtualScrollConfig, VirtualScrollState } from '../types';

export class VirtualScroller {
  private config: Required<VirtualScrollConfig>;
  private state: VirtualScrollState;
  private totalItems = 0;
  private scrollTop = 0;

  constructor(config: VirtualScrollConfig) {
    this.config = {
      height: config.height,
      itemHeight: config.itemHeight,
      buffer: config.buffer || 5,
    };

    this.state = {
      startIndex: 0,
      endIndex: 0,
      offset: 0,
      visibleCount: 0,
    };

    this.updateState();
  }

  /**
   * 设置总项数
   */
  setTotalItems(count: number): void {
    this.totalItems = count;
    this.updateState();
  }

  /**
   * 设置滚动位置
   */
  setScrollTop(scrollTop: number): void {
    this.scrollTop = Math.max(0, scrollTop);
    this.updateState();
  }

  /**
   * 更新容器高度
   */
  setHeight(height: number): void {
    this.config.height = height;
    this.updateState();
  }

  /**
   * 更新项高度
   */
  setItemHeight(height: number): void {
    this.config.itemHeight = height;
    this.updateState();
  }

  /**
   * 更新虚拟滚动状态
   */
  private updateState(): void {
    const { height, itemHeight, buffer } = this.config;

    // 计算可见项数量
    const visibleCount = Math.ceil(height / itemHeight);

    // 计算开始索引（带缓冲）
    const startIndex = Math.max(
      0,
      Math.floor(this.scrollTop / itemHeight) - buffer
    );

    // 计算结束索引（带缓冲）
    const endIndex = Math.min(
      this.totalItems,
      startIndex + visibleCount + buffer * 2
    );

    // 计算偏移量
    const offset = startIndex * itemHeight;

    this.state = {
      startIndex,
      endIndex,
      offset,
      visibleCount,
    };
  }

  /**
   * 获取当前状态
   */
  getState(): VirtualScrollState {
    return { ...this.state };
  }

  /**
   * 获取可见范围
   */
  getVisibleRange(): { start: number; end: number } {
    return {
      start: this.state.startIndex,
      end: this.state.endIndex,
    };
  }

  /**
   * 获取总高度
   */
  getTotalHeight(): number {
    return this.totalItems * this.config.itemHeight;
  }

  /**
   * 获取偏移量
   */
  getOffset(): number {
    return this.state.offset;
  }

  /**
   * 滚动到指定索引
   */
  scrollToIndex(index: number, align: 'start' | 'center' | 'end' = 'start'): number {
    const { itemHeight, height } = this.config;
    let targetScrollTop = 0;

    switch (align) {
      case 'start':
        targetScrollTop = index * itemHeight;
        break;
      case 'center':
        targetScrollTop = index * itemHeight - height / 2 + itemHeight / 2;
        break;
      case 'end':
        targetScrollTop = index * itemHeight - height + itemHeight;
        break;
    }

    const maxScrollTop = Math.max(0, this.getTotalHeight() - height);
    targetScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));

    this.setScrollTop(targetScrollTop);
    return targetScrollTop;
  }

  /**
   * 获取项的位置信息
   */
  getItemPosition(index: number): { top: number; height: number } {
    return {
      top: index * this.config.itemHeight,
      height: this.config.itemHeight,
    };
  }

  /**
   * 判断索引是否在可见范围内
   */
  isVisible(index: number): boolean {
    return index >= this.state.startIndex && index < this.state.endIndex;
  }

  /**
   * 获取配置
   */
  getConfig(): Required<VirtualScrollConfig> {
    return { ...this.config };
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.scrollTop = 0;
    this.totalItems = 0;
    this.updateState();
  }

  /**
   * 计算可见项的变换样式
   */
  getTransformStyle(): string {
    return `translateY(${this.state.offset}px)`;
  }

  /**
   * 获取容器样式
   */
  getContainerStyle(): Record<string, string> {
    return {
      position: 'relative',
      height: `${this.config.height}px`,
      overflow: 'auto',
      willChange: 'transform',
    };
  }

  /**
   * 获取内容包装器样式
   */
  getWrapperStyle(): Record<string, string> {
    return {
      position: 'relative',
      height: `${this.getTotalHeight()}px`,
      minHeight: '100%',
    };
  }

  /**
   * 获取可见列表样式
   */
  getListStyle(): Record<string, string> {
    return {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      transform: this.getTransformStyle(),
      willChange: 'transform',
    };
  }
}

