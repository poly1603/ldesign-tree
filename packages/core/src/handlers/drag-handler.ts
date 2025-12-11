/**
 * 拖拽处理器
 */

import type { NodeId, FlatNode, DropPosition } from '../types'
import type { TreeStore } from '../core/tree-store'
import { getDescendantIds, isSameId } from '../utils'

export interface DragState<T = unknown> {
  isDragging: boolean
  dragNode: FlatNode<T> | null
  dropNode: FlatNode<T> | null
  dropPosition: DropPosition | null
  allowDrop: boolean
}

export class DragHandler<T = unknown> {
  private store: TreeStore<T>
  private state: DragState<T> = {
    isDragging: false,
    dragNode: null,
    dropNode: null,
    dropPosition: null,
    allowDrop: false,
  }

  constructor(store: TreeStore<T>) {
    this.store = store
  }

  getState(): DragState<T> {
    return { ...this.state }
  }

  startDrag(node: FlatNode<T>, event: DragEvent): boolean {
    const options = this.store.options
    if (!options.draggable || node.disabled || !node.draggable) return false
    if (options.allowDrag && !options.allowDrag(node)) return false

    this.state = { isDragging: true, dragNode: node, dropNode: null, dropPosition: null, allowDrop: false }
    this.store.setDraggingNode(node.id)

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(node.id))
    }

    this.store.emit('drag-start', { node, originalEvent: event })
    return true
  }

  dragOver(targetNode: FlatNode<T>, event: DragEvent, itemHeight: number): void {
    if (!this.state.isDragging || !this.state.dragNode) return
    event.preventDefault()

    const dragNode = this.state.dragNode
    if (isSameId(dragNode.id, targetNode.id)) {
      this.clearDropTarget()
      return
    }

    const descendants = getDescendantIds(dragNode.id, this.store.getNodeMap())
    if (descendants.some(id => isSameId(id, targetNode.id))) {
      this.clearDropTarget()
      return
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const offsetY = event.clientY - rect.top
    const position = this.calculateDropPosition(offsetY, itemHeight, targetNode)

    const options = this.store.options
    const allowDrop = options.allowDrop ? options.allowDrop(dragNode, targetNode, position) : true

    this.state.dropNode = targetNode
    this.state.dropPosition = position
    this.state.allowDrop = allowDrop

    if (allowDrop) {
      this.store.setDropTarget(targetNode.id, position)
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    } else {
      this.store.setDropTarget(null, null)
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'none'
    }

    this.store.emit('drag-over', { dragNode, dropNode: targetNode, position, originalEvent: event })
  }

  dragLeave(event: DragEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement | null
    const currentTarget = event.currentTarget as HTMLElement
    if (relatedTarget && currentTarget.contains(relatedTarget)) return
    this.clearDropTarget()
  }

  drop(event: DragEvent): boolean {
    event.preventDefault()
    if (!this.state.isDragging || !this.state.dragNode || !this.state.dropNode || !this.state.dropPosition || !this.state.allowDrop) {
      return false
    }

    const { dragNode, dropNode, dropPosition } = this.state
    const success = this.store.moveNode(dragNode.id, dropNode.id, dropPosition)

    if (success) {
      this.store.emit('drop', { dragNode, dropNode, position: dropPosition, originalEvent: event })
    }

    this.endDrag(event)
    return success
  }

  endDrag(event: DragEvent): void {
    if (!this.state.isDragging) return
    const { dragNode, dropNode, dropPosition } = this.state
    this.store.emit('drag-end', { dragNode: dragNode!, dropNode, position: dropPosition, originalEvent: event })
    this.resetState()
  }

  cancel(): void {
    this.resetState()
  }

  private calculateDropPosition(offsetY: number, itemHeight: number, targetNode: FlatNode<T>): DropPosition {
    const threshold = itemHeight / 4
    if (offsetY < threshold) return 'before'
    if (offsetY > itemHeight - threshold) return 'after'
    if (targetNode.isLeaf) return offsetY < itemHeight / 2 ? 'before' : 'after'
    return 'inside'
  }

  private clearDropTarget(): void {
    this.state.dropNode = null
    this.state.dropPosition = null
    this.state.allowDrop = false
    this.store.setDropTarget(null, null)
  }

  private resetState(): void {
    this.state = { isDragging: false, dragNode: null, dropNode: null, dropPosition: null, allowDrop: false }
    this.store.clearDragState()
  }

  destroy(): void {
    this.resetState()
  }
}
