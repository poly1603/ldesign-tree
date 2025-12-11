/**
 * DOM 渲染器 - 原生 JavaScript 渲染
 */

import type { NodeId, FlatNode, TreeOptions, VisibleRange } from '../types'
import type { TreeStore } from '../core/tree-store'
import type { DragHandler } from '../handlers/drag-handler'
import type { KeyboardHandler } from '../handlers/keyboard-handler'
import { VirtualScroller } from './virtual-scroller'
import { highlightText, cx, isSameId } from '../utils'

export interface DOMRendererOptions {
  classPrefix?: string
}

export class DOMRenderer<T = unknown> {
  private store: TreeStore<T>
  private dragHandler: DragHandler<T> | null = null
  private keyboardHandler: KeyboardHandler<T> | null = null
  private virtualScroller: VirtualScroller | null = null

  private container: HTMLElement | null = null
  private wrapper: HTMLElement | null = null
  private viewport: HTMLElement | null = null
  private content: HTMLElement | null = null
  private nodePool = new Map<NodeId, HTMLElement>()

  private classPrefix: string
  private mounted = false
  private resizeObserver: ResizeObserver | null = null

  constructor(store: TreeStore<T>, options: DOMRendererOptions = {}) {
    this.store = store
    this.classPrefix = options.classPrefix ?? 'ltree'
  }

  setDragHandler(handler: DragHandler<T>): void {
    this.dragHandler = handler
  }

  setKeyboardHandler(handler: KeyboardHandler<T>): void {
    this.keyboardHandler = handler
  }

  mount(container: HTMLElement): void {
    if (this.mounted) this.unmount()

    this.container = container
    this.createStructure()
    this.setupEventListeners()
    this.setupResizeObserver()
    this.mounted = true
    this.render()
  }

  unmount(): void {
    if (!this.mounted) return
    this.removeEventListeners()
    this.resizeObserver?.disconnect()
    if (this.wrapper && this.container) {
      this.container.removeChild(this.wrapper)
    }
    this.container = null
    this.wrapper = null
    this.viewport = null
    this.content = null
    this.nodePool.clear()
    this.mounted = false
  }

  render(): void {
    if (!this.mounted || !this.content || !this.viewport) return

    const options = this.store.options
    const visibleNodes = this.store.getVisibleNodes()

    if (options.virtual && this.virtualScroller) {
      this.renderVirtual(visibleNodes)
    } else {
      this.renderNormal(visibleNodes)
    }
  }

  scrollToNode(nodeId: NodeId): void {
    const visibleNodes = this.store.getVisibleNodes()
    let index = visibleNodes.findIndex(n => isSameId(n.id, nodeId))

    if (index === -1) {
      this.store.expandToNode(nodeId)
      this.render()
      const newVisibleNodes = this.store.getVisibleNodes()
      index = newVisibleNodes.findIndex(n => isSameId(n.id, nodeId))
    }

    if (index !== -1) this.scrollToIndex(index)
  }

  scrollToIndex(index: number): void {
    if (!this.viewport || !this.virtualScroller) return
    this.viewport.scrollTop = this.virtualScroller.scrollToIndex(index)
  }

  scrollTo(scrollTop: number): void {
    if (this.viewport) this.viewport.scrollTop = scrollTop
  }

  getScrollTop(): number {
    return this.viewport?.scrollTop ?? 0
  }

  refresh(): void {
    this.updateContainerSize()
    this.render()
  }

  destroy(): void {
    this.unmount()
    this.virtualScroller?.destroy()
    this.virtualScroller = null
  }

  private createStructure(): void {
    if (!this.container) return
    const prefix = this.classPrefix

    this.wrapper = document.createElement('div')
    this.wrapper.className = prefix
    this.wrapper.setAttribute('role', 'tree')
    this.wrapper.tabIndex = 0

    this.viewport = document.createElement('div')
    this.viewport.className = `${prefix}-viewport`

    this.content = document.createElement('div')
    this.content.className = `${prefix}-content`

    this.viewport.appendChild(this.content)
    this.wrapper.appendChild(this.viewport)
    this.container.appendChild(this.wrapper)

    this.initVirtualScroller()
  }

  private initVirtualScroller(): void {
    const options = this.store.options
    if (!options.virtual) return

    this.virtualScroller = new VirtualScroller({
      itemHeight: options.itemHeight,
      bufferSize: options.bufferSize,
      containerHeight: this.viewport?.clientHeight ?? 0,
      totalCount: this.store.getVisibleNodes().length,
      onRangeChange: () => this.render(),
    })
  }

  private updateContainerSize(): void {
    if (!this.viewport || !this.virtualScroller) return
    this.virtualScroller.setContainerHeight(this.viewport.clientHeight)
    this.virtualScroller.setTotalCount(this.store.getVisibleNodes().length)
  }

  private setupEventListeners(): void {
    if (!this.wrapper || !this.viewport) return
    this.viewport.addEventListener('scroll', this.handleScroll)
    this.wrapper.addEventListener('keydown', this.handleKeyDown)
    this.wrapper.addEventListener('click', this.handleClick)
    this.wrapper.addEventListener('dblclick', this.handleDblClick)
    this.wrapper.addEventListener('contextmenu', this.handleContextMenu)

    if (this.store.options.draggable) {
      this.wrapper.addEventListener('dragstart', this.handleDragStart)
      this.wrapper.addEventListener('dragover', this.handleDragOver)
      this.wrapper.addEventListener('dragleave', this.handleDragLeave)
      this.wrapper.addEventListener('drop', this.handleDrop)
      this.wrapper.addEventListener('dragend', this.handleDragEnd)
    }
  }

  private removeEventListeners(): void {
    if (!this.wrapper || !this.viewport) return
    this.viewport.removeEventListener('scroll', this.handleScroll)
    this.wrapper.removeEventListener('keydown', this.handleKeyDown)
    this.wrapper.removeEventListener('click', this.handleClick)
    this.wrapper.removeEventListener('dblclick', this.handleDblClick)
    this.wrapper.removeEventListener('contextmenu', this.handleContextMenu)
    this.wrapper.removeEventListener('dragstart', this.handleDragStart)
    this.wrapper.removeEventListener('dragover', this.handleDragOver)
    this.wrapper.removeEventListener('dragleave', this.handleDragLeave)
    this.wrapper.removeEventListener('drop', this.handleDrop)
    this.wrapper.removeEventListener('dragend', this.handleDragEnd)
  }

  private setupResizeObserver(): void {
    if (!this.viewport) return
    this.resizeObserver = new ResizeObserver(() => {
      this.updateContainerSize()
      this.render()
    })
    this.resizeObserver.observe(this.viewport)
  }

  private renderVirtual(nodes: FlatNode<T>[]): void {
    if (!this.content || !this.virtualScroller) return

    const options = this.store.options
    const range = this.virtualScroller.getVisibleRange()
    const totalHeight = nodes.length * options.itemHeight

    this.content.style.height = `${totalHeight}px`
    this.content.style.position = 'relative'

    const visibleNodes = nodes.slice(range.start, range.end)

    this.nodePool.forEach((element, id) => {
      if (!visibleNodes.some(n => isSameId(n.id, id))) {
        element.remove()
        this.nodePool.delete(id)
      }
    })

    visibleNodes.forEach((node, index) => {
      const actualIndex = range.start + index
      const element = this.renderNode(node)
      element.style.position = 'absolute'
      element.style.top = `${actualIndex * options.itemHeight}px`
      element.style.left = '0'
      element.style.right = '0'
      element.style.height = `${options.itemHeight}px`
    })
  }

  private renderNormal(nodes: FlatNode<T>[]): void {
    if (!this.content) return

    this.nodePool.forEach((element, id) => {
      if (!nodes.some(n => isSameId(n.id, id))) {
        element.remove()
        this.nodePool.delete(id)
      }
    })

    nodes.forEach(node => this.renderNode(node))
  }

  private renderNode(node: FlatNode<T>): HTMLElement {
    const prefix = this.classPrefix
    const options = this.store.options
    const searchQuery = this.store.getSearchQuery()

    let element = this.nodePool.get(node.id)

    if (!element) {
      element = document.createElement('div')
      element.className = `${prefix}-node`
      element.setAttribute('role', 'treeitem')
      element.setAttribute('data-node-id', String(node.id))
      this.nodePool.set(node.id, element)
      this.content?.appendChild(element)
    }

    element.setAttribute('aria-expanded', String(node.state.expanded))
    element.setAttribute('aria-selected', String(node.state.selected))
    element.setAttribute('aria-level', String(node.level + 1))
    element.draggable = options.draggable && node.draggable && !node.disabled

    element.className = cx(
      `${prefix}-node`,
      node.state.expanded && `${prefix}-node--expanded`,
      node.state.selected && `${prefix}-node--selected`,
      node.state.focused && `${prefix}-node--focused`,
      node.disabled && `${prefix}-node--disabled`,
      node.state.dragging && `${prefix}-node--dragging`,
      node.state.dropTarget && `${prefix}-node--drop-target`,
      node.state.dropPosition && `${prefix}-node--drop-${node.state.dropPosition}`,
      node.state.matched && `${prefix}-node--matched`,
      node.isLeaf && `${prefix}-node--leaf`,
    ) || `${prefix}-node`

    element.innerHTML = this.renderNodeContent(node, searchQuery)
    return element
  }

  // Lucide SVG 图标
  private icons = {
    chevronRight: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    folder: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>',
    folderOpen: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>',
    file: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>',
    fileText: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    minus: '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>',
    loader: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ltree-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
  }

  private renderNodeContent(node: FlatNode<T>, searchQuery: string): string {
    const prefix = this.classPrefix
    const options = this.store.options
    const indent = node.level * options.indent

    let html = `<div class="${prefix}-node-content" style="padding-left: ${indent}px">`

    // 展开图标 (使用 Lucide chevron-right)
    const expandClass = cx(
      `${prefix}-expand-icon`,
      node.isLeaf && `${prefix}-expand-icon--leaf`,
      node.state.expanded && `${prefix}-expand-icon--expanded`,
    )
    html += `<span class="${expandClass}" data-action="toggle">${node.isLeaf ? '' : this.icons.chevronRight}</span>`

    // 复选框 (使用 Lucide check/minus)
    if (options.checkable && node.checkable) {
      const checkClass = cx(
        `${prefix}-checkbox`,
        node.state.checked === 'checked' && `${prefix}-checkbox--checked`,
        node.state.checked === 'indeterminate' && `${prefix}-checkbox--indeterminate`,
        node.disabled && `${prefix}-checkbox--disabled`,
      )
      const checkIcon = node.state.checked === 'checked' ? this.icons.check
        : node.state.checked === 'indeterminate' ? this.icons.minus : ''
      html += `<span class="${checkClass}" data-action="check">${checkIcon}</span>`
    }

    // 图标 (使用 Lucide folder/file)
    if (options.showIcon) {
      let icon = node.icon
      if (!icon) {
        icon = node.isLeaf ? this.icons.file : (node.state.expanded ? this.icons.folderOpen : this.icons.folder)
      }
      html += `<span class="${prefix}-node-icon">${icon}</span>`
    }

    // 文本
    const label = searchQuery ? highlightText(node.label, searchQuery, `${prefix}-highlight`) : node.label
    html += `<span class="${prefix}-node-label">${label}</span>`

    // 加载状态 (使用 Lucide loader)
    if (node.state.loading) {
      html += `<span class="${prefix}-node-loading">${this.icons.loader}</span>`
    }

    html += '</div>'
    return html
  }

  private handleScroll = (event: Event): void => {
    const target = event.target as HTMLElement
    this.virtualScroller?.handleScroll(target.scrollTop)
    this.store.emit('scroll', { scrollTop: target.scrollTop, scrollLeft: target.scrollLeft })
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    this.keyboardHandler?.handleKeyDown(event)
  }

  private handleClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement
    const nodeElement = target.closest('[data-node-id]') as HTMLElement
    if (!nodeElement) return

    const nodeId = nodeElement.dataset.nodeId!
    const node = this.store.getNode(nodeId)
    if (!node) return

    const action = (target as HTMLElement).dataset.action

    if (action === 'toggle') {
      this.store.toggleExpand(nodeId)
      this.render()
    } else if (action === 'check') {
      this.store.toggleCheck(nodeId)
      this.render()
    } else {
      if (!node.disabled && node.selectable) {
        this.store.selectNode(nodeId, event.ctrlKey || event.metaKey)
        this.store.setFocusedNode(nodeId)
        this.render()
      }
      this.store.emit('node-click', { node, originalEvent: event })
    }
  }

  private handleDblClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement
    const nodeElement = target.closest('[data-node-id]') as HTMLElement
    if (!nodeElement) return

    const nodeId = nodeElement.dataset.nodeId!
    const node = this.store.getNode(nodeId)
    if (!node) return

    if (this.store.options.editable && !node.disabled) {
      this.store.startEdit(nodeId)
    }
    this.store.emit('node-dblclick', { node, originalEvent: event })
  }

  private handleContextMenu = (event: MouseEvent): void => {
    const target = event.target as HTMLElement
    const nodeElement = target.closest('[data-node-id]') as HTMLElement
    if (!nodeElement) return

    const nodeId = nodeElement.dataset.nodeId!
    const node = this.store.getNode(nodeId)
    if (!node) return

    this.store.emit('node-contextmenu', { node, originalEvent: event })
  }

  private handleDragStart = (event: DragEvent): void => {
    const target = event.target as HTMLElement
    const nodeElement = target.closest('[data-node-id]') as HTMLElement
    if (!nodeElement) return

    const node = this.store.getNode(nodeElement.dataset.nodeId!)
    if (node) {
      this.dragHandler?.startDrag(node, event)
      this.render()
    }
  }

  private handleDragOver = (event: DragEvent): void => {
    const target = event.target as HTMLElement
    const nodeElement = target.closest('[data-node-id]') as HTMLElement
    if (!nodeElement) return

    const node = this.store.getNode(nodeElement.dataset.nodeId!)
    if (node) {
      this.dragHandler?.dragOver(node, event, this.store.options.itemHeight)
      this.render()
    }
  }

  private handleDragLeave = (event: DragEvent): void => {
    this.dragHandler?.dragLeave(event)
    this.render()
  }

  private handleDrop = (event: DragEvent): void => {
    this.dragHandler?.drop(event)
    this.render()
  }

  private handleDragEnd = (event: DragEvent): void => {
    this.dragHandler?.endDrag(event)
    this.render()
  }
}
