/**
 * 树组件样式
 */

export const treeStyles = `
/* ==================== CSS 变量 ==================== */
.ltree {
  --tree-font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --tree-font-size: 14px;
  --tree-line-height: 1.5;
  
  --tree-text-color: #1f2937;
  --tree-text-secondary: #6b7280;
  --tree-text-disabled: #9ca3af;
  
  --tree-bg: #ffffff;
  --tree-bg-hover: #f3f4f6;
  --tree-bg-selected: #eff6ff;
  --tree-bg-focused: #e0f2fe;
  --tree-bg-drop: #dbeafe;
  
  --tree-border-color: #e5e7eb;
  --tree-border-radius: 6px;
  
  --tree-primary: #3b82f6;
  --tree-primary-hover: #2563eb;
  --tree-success: #10b981;
  --tree-warning: #f59e0b;
  --tree-danger: #ef4444;
  
  --tree-indent: 20px;
  --tree-item-height: 32px;
  --tree-icon-size: 16px;
  --tree-checkbox-size: 16px;
  
  --tree-transition-duration: 200ms;
  --tree-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
  
  --tree-shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --tree-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

/* 暗色主题 */
.ltree.ltree--dark {
  --tree-text-color: #f3f4f6;
  --tree-text-secondary: #9ca3af;
  --tree-text-disabled: #6b7280;
  
  --tree-bg: #1f2937;
  --tree-bg-hover: #374151;
  --tree-bg-selected: #1e3a5f;
  --tree-bg-focused: #1e40af;
  --tree-bg-drop: #1e3a5f;
  
  --tree-border-color: #374151;
}

/* ==================== 容器 ==================== */
.ltree {
  position: relative;
  font-family: var(--tree-font-family);
  font-size: var(--tree-font-size);
  line-height: var(--tree-line-height);
  color: var(--tree-text-color);
  background: var(--tree-bg);
  outline: none;
  user-select: none;
}

.ltree:focus-visible {
  box-shadow: 0 0 0 2px var(--tree-primary);
  border-radius: var(--tree-border-radius);
}

.ltree-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--tree-border-color) transparent;
}

.ltree-viewport::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.ltree-viewport::-webkit-scrollbar-track {
  background: transparent;
}

.ltree-viewport::-webkit-scrollbar-thumb {
  background: var(--tree-border-color);
  border-radius: 4px;
}

.ltree-viewport::-webkit-scrollbar-thumb:hover {
  background: var(--tree-text-secondary);
}

.ltree-content {
  position: relative;
  min-width: 100%;
}

/* ==================== 节点 ==================== */
.ltree-node {
  position: relative;
  display: flex;
  align-items: center;
  min-height: var(--tree-item-height);
  cursor: pointer;
  transition: background-color var(--tree-transition-duration) var(--tree-transition-timing);
}

.ltree-node:hover {
  background-color: var(--tree-bg-hover);
}

.ltree-node--selected {
  background-color: var(--tree-bg-selected);
}

.ltree-node--selected:hover {
  background-color: var(--tree-bg-selected);
}

.ltree-node--focused {
  background-color: var(--tree-bg-focused);
  outline: 2px solid var(--tree-primary);
  outline-offset: -2px;
}

.ltree-node--disabled {
  color: var(--tree-text-disabled);
  cursor: not-allowed;
}

.ltree-node--disabled:hover {
  background-color: transparent;
}

.ltree-node--dragging {
  opacity: 0.5;
}

.ltree-node--matched {
  background-color: #fef3c7;
}

/* ==================== 节点内容 ==================== */
.ltree-node-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding: 0 12px;
  height: var(--tree-item-height);
  gap: 4px;
}

/* ==================== 展开图标 ==================== */
.ltree-expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--tree-icon-size);
  height: var(--tree-icon-size);
  flex-shrink: 0;
  color: var(--tree-text-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all var(--tree-transition-duration) var(--tree-transition-timing);
}

.ltree-expand-icon svg {
  transition: transform var(--tree-transition-duration) var(--tree-transition-timing);
}

.ltree-expand-icon--expanded svg {
  transform: rotate(90deg);
}

.ltree-expand-icon--leaf {
  visibility: hidden;
}

.ltree-expand-icon:hover {
  color: var(--tree-primary);
  background: var(--tree-bg-hover);
}

/* ==================== 复选框 ==================== */
.ltree-checkbox {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--tree-checkbox-size);
  height: var(--tree-checkbox-size);
  flex-shrink: 0;
  border: 2px solid var(--tree-border-color);
  border-radius: 4px;
  background: var(--tree-bg);
  transition: all var(--tree-transition-duration) var(--tree-transition-timing);
}

.ltree-checkbox:hover {
  border-color: var(--tree-primary);
}

.ltree-checkbox--checked {
  background: var(--tree-primary);
  border-color: var(--tree-primary);
}

.ltree-checkbox--checked svg {
  color: #fff;
}

.ltree-checkbox--indeterminate {
  background: var(--tree-primary);
  border-color: var(--tree-primary);
}

.ltree-checkbox--indeterminate svg {
  color: #fff;
}

.ltree-checkbox--disabled {
  background: var(--tree-bg-hover);
  border-color: var(--tree-border-color);
  cursor: not-allowed;
}

/* ==================== 节点图标 ==================== */
.ltree-node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--tree-icon-size);
  height: var(--tree-icon-size);
  flex-shrink: 0;
  color: var(--tree-text-secondary);
}

.ltree-node-icon svg {
  color: var(--tree-text-secondary);
}

.ltree-node--expanded > .ltree-node-content .ltree-node-icon svg {
  color: var(--tree-primary);
}

/* ==================== 节点文本 ==================== */
.ltree-node-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ==================== 搜索高亮 ==================== */
.ltree-highlight {
  background-color: #fef08a;
  color: #854d0e;
  border-radius: 2px;
  padding: 0 2px;
}

/* ==================== 加载状态 ==================== */
.ltree-node-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--tree-icon-size);
  height: var(--tree-icon-size);
  flex-shrink: 0;
  margin-left: 8px;
  color: var(--tree-primary);
}

.ltree-node-loading svg,
.ltree-spin {
  animation: ltree-spin 1s linear infinite;
}

@keyframes ltree-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ==================== 连接线 ==================== */
.ltree-line {
  position: absolute;
  background-color: var(--tree-border-color);
}

.ltree-line--vertical {
  width: 1px;
  top: 0;
  bottom: 0;
}

.ltree-line--horizontal {
  height: 1px;
  width: calc(var(--tree-indent) / 2);
  top: 50%;
}

/* 虚线样式 */
.ltree--line-dashed .ltree-line {
  background: repeating-linear-gradient(
    to bottom,
    var(--tree-border-color) 0,
    var(--tree-border-color) 4px,
    transparent 4px,
    transparent 8px
  );
}

/* ==================== 拖拽 ==================== */
.ltree-node--drop-target {
  background-color: var(--tree-bg-drop);
}

.ltree-node--drop-before::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--tree-primary);
}

.ltree-node--drop-after::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--tree-primary);
}

.ltree-node--drop-inside {
  outline: 2px solid var(--tree-primary);
  outline-offset: -2px;
}

.ltree-drag-image {
  position: fixed;
  padding: 4px 12px;
  background: var(--tree-bg);
  border: 1px solid var(--tree-border-color);
  border-radius: var(--tree-border-radius);
  box-shadow: var(--tree-shadow);
  font-size: var(--tree-font-size);
  white-space: nowrap;
  pointer-events: none;
  z-index: 10000;
}

/* ==================== 空状态 ==================== */
.ltree-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--tree-text-secondary);
}

.ltree-empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.ltree-empty-text {
  font-size: 14px;
}

/* ==================== 内联编辑 ==================== */
.ltree-node--editing .ltree-node-label {
  display: none;
}

.ltree-edit-input {
  flex: 1;
  min-width: 0;
  padding: 2px 6px;
  border: 1px solid var(--tree-primary);
  border-radius: 4px;
  font-size: inherit;
  font-family: inherit;
  outline: none;
  background: var(--tree-bg);
  color: var(--tree-text-color);
}

/* ==================== 子节点容器动画 ==================== */
.ltree-children {
  overflow: hidden;
  transition: height var(--tree-transition-duration) var(--tree-transition-timing),
              opacity var(--tree-transition-duration) var(--tree-transition-timing);
}

.ltree-children--collapsed {
  height: 0 !important;
  opacity: 0;
}

.ltree-children--expanded {
  opacity: 1;
}

/* ==================== 节点动画 ==================== */
.ltree--animate .ltree-node {
  animation: ltree-fade-in var(--tree-transition-duration) var(--tree-transition-timing);
}

@keyframes ltree-fade-in {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 展开图标旋转动画 */
.ltree-expand-icon svg {
  transition: transform var(--tree-transition-duration) var(--tree-transition-timing);
}

.ltree-expand-icon--expanded svg {
  transform: rotate(90deg);
}

/* ==================== 响应式 ==================== */
@media (max-width: 640px) {
  .ltree {
    --tree-font-size: 13px;
    --tree-item-height: 36px;
    --tree-indent: 16px;
  }
}

/* ==================== 打印样式 ==================== */
@media print {
  .ltree {
    background: #fff;
    color: #000;
  }
  
  .ltree-checkbox,
  .ltree-expand-icon {
    color: #000;
    border-color: #000;
  }
}
`

/**
 * 注入样式到页面
 */
export function injectStyles(): void {
  if (typeof document === 'undefined') return

  const styleId = 'ltree-styles'
  if (document.getElementById(styleId)) return

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = treeStyles
  document.head.appendChild(style)
}

/**
 * 移除注入的样式
 */
export function removeStyles(): void {
  if (typeof document === 'undefined') return

  const style = document.getElementById('ltree-styles')
  if (style) {
    style.remove()
  }
}
