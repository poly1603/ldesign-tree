/**
 * @ldesign/tree - Lit Web Component
 */

import { LitElement, html, css, PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { Tree, TreeNode, TreeOptions, TreeEvents, TreeNodeId } from '../../index';

@customElement('ldesign-tree')
export class TreeElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 400px;
      overflow: auto;
      position: relative;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 14px;
      color: #333;
    }

    .tree-container {
      width: 100%;
      height: 100%;
      overflow: auto;
      position: relative;
    }

    ::slotted(*) {
      display: none;
    }
  `;

  @property({ type: Array })
  data: TreeNode[] = [];

  @property({ type: Object })
  options: TreeOptions = {};

  @property({ type: Number })
  indent = 20;

  @property({ type: Boolean, attribute: 'show-line' })
  showLine = false;

  @property({ type: Boolean, attribute: 'show-icon' })
  showIcon = true;

  @property({ type: Boolean })
  checkable = false;

  @property({ type: Boolean })
  multiple = false;

  @property({ type: Boolean })
  draggable = false;

  @property({ type: Boolean, attribute: 'default-expand-all' })
  defaultExpandAll = false;

  @property({ type: Boolean })
  virtual = true;

  @property({ type: Number, attribute: 'item-height' })
  itemHeight = 32;

  @query('.tree-container')
  private containerElement!: HTMLDivElement;

  @state()
  private treeInstance: Tree | null = null;

  protected firstUpdated(): void {
    this.initTree();
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('data') && this.treeInstance) {
      this.treeInstance.setData(this.data);
    }

    if (changedProperties.has('options') && this.treeInstance) {
      this.treeInstance.updateOptions(this.getCombinedOptions());
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.treeInstance) {
      this.treeInstance.destroy();
      this.treeInstance = null;
    }
  }

  private getCombinedOptions(): TreeOptions {
    return {
      indent: this.indent,
      showLine: this.showLine,
      showIcon: this.showIcon,
      checkable: this.checkable,
      multiple: this.multiple,
      draggable: this.draggable,
      defaultExpandAll: this.defaultExpandAll,
      virtual: this.virtual,
      itemHeight: this.itemHeight,
      ...this.options,
    };
  }

  private initTree(): void {
    if (!this.containerElement || this.treeInstance) return;

    const events: TreeEvents = {
      onNodeClick: (data) => {
        this.dispatchEvent(
          new CustomEvent('node-click', {
            detail: { node: data.node, event: data.event },
            bubbles: true,
            composed: true,
          })
        );
      },
      onNodeDblClick: (data) => {
        this.dispatchEvent(
          new CustomEvent('node-dblclick', {
            detail: { node: data.node, event: data.event },
            bubbles: true,
            composed: true,
          })
        );
      },
      onNodeContextMenu: (data) => {
        this.dispatchEvent(
          new CustomEvent('node-contextmenu', {
            detail: { node: data.node, event: data.event },
            bubbles: true,
            composed: true,
          })
        );
      },
      onNodeExpand: (data) => {
        this.dispatchEvent(
          new CustomEvent('node-expand', {
            detail: { node: data.node, expanded: data.expanded },
            bubbles: true,
            composed: true,
          })
        );
      },
      onNodeCheck: (data) => {
        this.dispatchEvent(
          new CustomEvent('node-check', {
            detail: { node: data.node, checked: data.checked, checkedNodes: data.checkedNodes },
            bubbles: true,
            composed: true,
          })
        );
      },
      onDrop: (data) => {
        this.dispatchEvent(
          new CustomEvent('node-drop', {
            detail: data,
            bubbles: true,
            composed: true,
          })
        );
      },
    };

    this.treeInstance = new Tree(
      this.containerElement,
      this.data,
      this.getCombinedOptions(),
      events
    );
  }

  // 公开方法
  public refresh(): void {
    this.treeInstance?.refresh();
  }

  public search(query: string): void {
    this.treeInstance?.search(query);
  }

  public clearSearch(): void {
    this.treeInstance?.clearSearch();
  }

  public selectNode(nodeId: TreeNodeId): void {
    if (this.treeInstance) {
      this.treeInstance.selectionManager.select(nodeId);
      this.treeInstance.refresh();
    }
  }

  public expandNode(nodeId: TreeNodeId): void {
    if (this.treeInstance) {
      this.treeInstance.treeManager.expandNode(nodeId);
      this.treeInstance.refresh();
    }
  }

  public collapseNode(nodeId: TreeNodeId): void {
    if (this.treeInstance) {
      this.treeInstance.treeManager.collapseNode(nodeId);
      this.treeInstance.refresh();
    }
  }

  public expandAll(): void {
    if (this.treeInstance) {
      this.treeInstance.treeManager.expandAll();
      this.treeInstance.refresh();
    }
  }

  public collapseAll(): void {
    if (this.treeInstance) {
      this.treeInstance.treeManager.collapseAll();
      this.treeInstance.refresh();
    }
  }

  public checkNode(nodeId: TreeNodeId, checked: boolean): void {
    if (this.treeInstance) {
      this.treeInstance.selectionManager.check(nodeId, checked);
      this.treeInstance.refresh();
    }
  }

  public checkAll(): void {
    if (this.treeInstance) {
      this.treeInstance.selectionManager.checkAll();
      this.treeInstance.refresh();
    }
  }

  public uncheckAll(): void {
    if (this.treeInstance) {
      this.treeInstance.selectionManager.uncheckAll();
      this.treeInstance.refresh();
    }
  }

  public getSelectedNodes(): TreeNode[] {
    return this.treeInstance?.selectionManager.getSelectedNodes() || [];
  }

  public getCheckedNodes(): TreeNode[] {
    return this.treeInstance?.selectionManager.getCheckedNodes() || [];
  }

  public getNode(nodeId: TreeNodeId): TreeNode | undefined {
    return this.treeInstance?.treeManager.getNode(nodeId);
  }

  public addNode(node: TreeNode, parentId?: TreeNodeId): void {
    if (this.treeInstance) {
      this.treeInstance.treeManager.addNode(node, parentId);
      this.treeInstance.refresh();
    }
  }

  public removeNode(nodeId: TreeNodeId): boolean {
    if (this.treeInstance) {
      const result = this.treeInstance.treeManager.removeNode(nodeId);
      this.treeInstance.refresh();
      return result;
    }
    return false;
  }

  public updateNode(nodeId: TreeNodeId, updates: Partial<TreeNode>): boolean {
    if (this.treeInstance) {
      const result = this.treeInstance.treeManager.updateNode(nodeId, updates);
      this.treeInstance.refresh();
      return result;
    }
    return false;
  }

  public getTreeInstance(): Tree | null {
    return this.treeInstance;
  }

  render() {
    return html`
      <div class="tree-container"></div>
      <slot style="display: none;"></slot>
    `;
  }
}

// 类型声明
declare global {
  interface HTMLElementTagNameMap {
    'ldesign-tree': TreeElement;
  }
}

