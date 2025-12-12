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
  --tree-line-color: #d1d5db;
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
  --tree-line-color: #d1d5db;
}

/* ==================== 容器 ==================== */
.ltree {
  position: relative;
  width: 100%;
  height: 100%;
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

/* ==================== 节点内容容器 ==================== */
.ltree-node-content {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding: 0 12px;
  min-height: var(--tree-item-height);
  height: 100%;
  gap: 4px;
  cursor: pointer;
  border-radius: var(--tree-border-radius);
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
  position: relative;
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

/* 展开图标 loading 状态 */
.ltree-expand-icon--loading {
  color: var(--tree-primary);
}

.ltree-expand-icon--loading svg {
  animation: ltree-spin 1s linear infinite;
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

/* ==================== 节点主内容区域 ==================== */
.ltree-node-main {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 8px;
}

/* ==================== 节点文本 ==================== */
.ltree-node-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.5;
}

/* ==================== 节点描述 ==================== */
.ltree-node-desc {
  font-size: 12px;
  color: var(--tree-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 1;
  opacity: 0.7;
}

/* 描述前的分隔符 */
.ltree-node-desc::before {
  content: '—';
  margin-right: 6px;
  opacity: 0.4;
}

/* ==================== 徽章 ==================== */
.ltree-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  height: 20px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 10px;
  background: #e5e7eb;
  color: #6b7280;
  margin-left: auto;
  flex-shrink: 0;
}

.ltree-badge--primary {
  background: #3b82f6;
  color: #fff;
}

.ltree-badge--success {
  background: #10b981;
  color: #fff;
}

.ltree-badge--warning {
  background: #f59e0b;
  color: #fff;
}

.ltree-badge--danger {
  background: #ef4444;
  color: #fff;
}

.ltree-badge--info {
  background: #06b6d4;
  color: #fff;
}

/* ==================== 标签 ==================== */
.ltree-tags {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  flex-shrink: 0;
}

/* 当有徽章时，标签不需要 auto margin */
.ltree-badge + .ltree-tags {
  margin-left: 6px;
}

.ltree-tag {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 8px;
  height: 20px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
  background: #dbeafe;
  color: #1d4ed8;
}

.ltree-tag--success {
  background: #d1fae5;
  color: #047857;
}

.ltree-tag--warning {
  background: #fef3c7;
  color: #b45309;
}

.ltree-tag-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  margin-left: 2px;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.6;
}

.ltree-tag-close:hover {
  background: rgba(0, 0, 0, 0.1);
  opacity: 1;
}

.ltree-tag-close svg {
  width: 10px;
  height: 10px;
}

/* ==================== 操作按钮 ==================== */
.ltree-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-left: 8px;
  flex-shrink: 0;
}

.ltree-actions--hover {
  opacity: 0;
  transition: opacity var(--tree-transition-duration);
}

.ltree-node:hover .ltree-actions--hover {
  opacity: 1;
}

.ltree-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--tree-text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all var(--tree-transition-duration);
}

.ltree-action-btn:hover {
  background: var(--tree-bg-hover);
  color: var(--tree-primary);
}

.ltree-action-btn svg {
  width: 14px;
  height: 14px;
}

.ltree-action-btn--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ltree-action-btn--disabled:hover {
  background: transparent;
  color: var(--tree-text-secondary);
}

.ltree-action-btn--danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
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
.ltree--show-line .ltree-node-content {
  position: relative;
}

.ltree-line {
  position: absolute;
  pointer-events: none;
  z-index: 0;
}

.ltree-line--vertical {
  width: 1px;
  top: 0;
  bottom: 0;
  background-color: var(--tree-line-color);
}

.ltree-line--horizontal {
  height: 1px;
  top: 50%;
  background-color: var(--tree-line-color);
}

.ltree-line--corner {
  width: 1px;
  top: 0;
  height: 50%;
  background-color: var(--tree-line-color);
}

/* L 形拐角的水平部分用伪元素 */
.ltree-line--corner::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: var(--tree-indent, 24px);
  height: 1px;
  background-color: var(--tree-line-color);
}

/* 尾线 (连接展开的父节点和子节点) */
.ltree-line--tail {
  width: 1px;
  top: 50%;
  bottom: 0;
  background-color: var(--tree-line-color);
  z-index: 1;
}

/* 虚线样式 */
.ltree-line--dashed {
  background: repeating-linear-gradient(
    to bottom,
    var(--tree-line-color) 0,
    var(--tree-line-color) 4px,
    transparent 4px,
    transparent 8px
  ) !important;
}

.ltree-line--horizontal.ltree-line--dashed {
  background: repeating-linear-gradient(
    to right,
    var(--tree-line-color) 0,
    var(--tree-line-color) 4px,
    transparent 4px,
    transparent 8px
  ) !important;
}

/* 点线样式 */
.ltree-line--dotted {
  background: repeating-linear-gradient(
    to bottom,
    var(--tree-line-color) 0,
    var(--tree-line-color) 2px,
    transparent 2px,
    transparent 4px
  ) !important;
}

.ltree-line--horizontal.ltree-line--dotted {
  background: repeating-linear-gradient(
    to right,
    var(--tree-line-color) 0,
    var(--tree-line-color) 2px,
    transparent 2px,
    transparent 4px
  ) !important;
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

/* ==================== 高亮节点 ==================== */
.ltree-node--highlighted {
  background-color: var(--tree-highlight-color, #fef3c7) !important;
}

/* ==================== 目录树模式 ==================== */
.ltree--directory .ltree-node-content {
  gap: 6px;
}

.ltree--directory .ltree-node-icon {
  width: 20px;
  height: 20px;
}

.ltree--directory .ltree-node-icon svg {
  width: 20px;
  height: 20px;
}

/* ==================== 卡片模式 ==================== */
.ltree--card .ltree-node {
  margin: 4px 8px;
  border-radius: var(--tree-border-radius);
  border: 1px solid var(--tree-border-color);
  background: var(--tree-bg);
}

.ltree--card .ltree-node:hover {
  border-color: var(--tree-primary);
  box-shadow: var(--tree-shadow-sm);
}

.ltree--card .ltree-node--selected {
  border-color: var(--tree-primary);
  background: var(--tree-bg-selected);
}

.ltree--card .ltree-node-content {
  padding: 8px 12px;
}

.ltree--card .ltree-node-main {
  gap: 4px;
}

/* ==================== 紧凑模式 ==================== */
.ltree--compact {
  --tree-item-height: 26px;
  --tree-font-size: 13px;
  --tree-indent: 16px;
}

.ltree--compact .ltree-node-content {
  padding: 0 8px;
  gap: 2px;
}

.ltree--compact .ltree-expand-icon {
  width: 14px;
  height: 14px;
}

.ltree--compact .ltree-expand-icon svg {
  width: 14px;
  height: 14px;
}

.ltree--compact .ltree-checkbox {
  width: 14px;
  height: 14px;
}

.ltree--compact .ltree-node-icon {
  width: 14px;
  height: 14px;
}

.ltree--compact .ltree-node-icon svg {
  width: 14px;
  height: 14px;
}

.ltree--compact .ltree-badge {
  height: 16px;
  font-size: 10px;
  padding: 0 4px;
}

.ltree--compact .ltree-tag {
  height: 16px;
  font-size: 10px;
  padding: 0 4px;
}


/* ==================== 展开/收起动画 ==================== */
.ltree--animate .ltree-node {
  animation: ltree-fade-in var(--tree-transition-duration) ease-out;
}

@keyframes ltree-fade-in {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滑动展开动画 */
.ltree--slide .ltree-node {
  animation: ltree-slide-down var(--tree-transition-duration) ease-out;
  transform-origin: top;
}

@keyframes ltree-slide-down {
  from {
    opacity: 0;
    max-height: 0;
    transform: scaleY(0);
  }
  to {
    opacity: 1;
    max-height: var(--tree-item-height);
    transform: scaleY(1);
  }
}

/* ==================== 加载动画 ==================== */
.ltree-node-loading {
  display: inline-flex;
  margin-left: 8px;
  color: var(--tree-primary);
  animation: ltree-spin 1s linear infinite;
}

@keyframes ltree-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
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
