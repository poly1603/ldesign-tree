/**
 * 键盘处理器
 */

import type { FlatNode } from '../types'
import type { TreeStore } from '../core/tree-store'

export interface KeyboardOptions {
  enabled: boolean
  multiple: boolean
  checkable: boolean
}

export class KeyboardHandler<T = unknown> {
  private store: TreeStore<T>
  private options: KeyboardOptions

  constructor(store: TreeStore<T>, options: Partial<KeyboardOptions> = {}) {
    this.store = store
    this.options = { enabled: true, multiple: false, checkable: false, ...options }
  }

  setOptions(options: Partial<KeyboardOptions>): void {
    Object.assign(this.options, options)
  }

  handleKeyDown(event: KeyboardEvent): boolean {
    if (!this.options.enabled) return false

    const focusedNode = this.store.getFocusedNode()
    let handled = false

    switch (event.key) {
      case 'ArrowUp':
        this.store.focusPrevNode()
        handled = true
        break
      case 'ArrowDown':
        this.store.focusNextNode()
        handled = true
        break
      case 'ArrowLeft':
        if (focusedNode) {
          if (focusedNode.state.expanded && !focusedNode.isLeaf) {
            this.store.collapseNode(focusedNode.id)
          } else if (focusedNode.parentId !== null) {
            this.store.setFocusedNode(focusedNode.parentId)
          }
          handled = true
        }
        break
      case 'ArrowRight':
        if (focusedNode && !focusedNode.isLeaf) {
          if (!focusedNode.state.expanded) {
            this.store.expandNode(focusedNode.id)
          } else if (focusedNode.childIds.length) {
            this.store.setFocusedNode(focusedNode.childIds[0])
          }
          handled = true
        }
        break
      case 'Enter':
        if (focusedNode) {
          if (this.options.checkable) {
            this.store.toggleCheck(focusedNode.id)
          } else {
            this.store.toggleSelect(focusedNode.id, event.ctrlKey || event.metaKey)
          }
          handled = true
        }
        break
      case ' ':
        if (focusedNode) {
          if (this.options.checkable) {
            this.store.toggleCheck(focusedNode.id)
          } else if (!focusedNode.isLeaf) {
            this.store.toggleExpand(focusedNode.id)
          }
          handled = true
        }
        break
      case 'Home':
        const firstNode = this.store.getVisibleNodes()[0]
        if (firstNode) {
          this.store.setFocusedNode(firstNode.id)
          handled = true
        }
        break
      case 'End':
        const visibleNodes = this.store.getVisibleNodes()
        const lastNode = visibleNodes[visibleNodes.length - 1]
        if (lastNode) {
          this.store.setFocusedNode(lastNode.id)
          handled = true
        }
        break
      case 'Escape':
        if (focusedNode?.state.editing) {
          this.store.cancelEdit(focusedNode.id)
        } else {
          this.store.clearSelection()
        }
        handled = true
        break
    }

    if (handled) {
      event.preventDefault()
      event.stopPropagation()
    }

    return handled
  }

  destroy(): void { }
}
