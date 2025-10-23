# 🚀 快速开始指南

欢迎使用 `@ldesign/tree`！本指南将帮助您快速上手。

## 📦 安装

```bash
pnpm add @ldesign/tree
```

## 🎯 选择适合您的使用方式

### 方式 1: Vue 3 组件

最适合 Vue 3 项目，提供完整的响应式集成。

```vue
<template>
  <TreeComponent
    :data="treeData"
    :options="{ checkable: true, draggable: true }"
    @node-click="handleClick"
  />
</template>

<script setup>
import { TreeComponent } from '@ldesign/tree/vue';

const treeData = ref([
  { id: '1', label: '节点 1' },
]);
</script>
```

### 方式 2: React 组件

最适合 React 18+ 项目，使用 Hooks 和 Refs。

```tsx
import { Tree, TreeRef } from '@ldesign/tree/react';

function App() {
  const treeRef = useRef<TreeRef>(null);
  return <Tree ref={treeRef} data={data} />;
}
```

### 方式 3: Lit Web Component

原生 Web Component，可在任何框架中使用。

```html
<script type="module">
  import '@ldesign/tree/lit';
</script>
<ldesign-tree id="tree" checkable></ldesign-tree>
```

### 方式 4: 原生 JavaScript

直接使用核心 API，完全框架无关。

```javascript
import { createTree } from '@ldesign/tree';
const tree = createTree(container, data, options);
```

## 🎨 运行演示

### Vue 演示

```bash
cd examples/vue-demo
pnpm install
pnpm dev
# 访问 http://localhost:5173
```

### React 演示

```bash
cd examples/react-demo
pnpm install
pnpm dev
# 访问 http://localhost:5174
```

### Lit 演示

```bash
cd examples/lit-demo
pnpm install
pnpm dev
# 访问 http://localhost:5175
```

## 💡 常见使用场景

### 1. 文件浏览器

```javascript
const fileTree = [
  {
    id: '1',
    label: '项目根目录',
    icon: '📁',
    children: [
      { id: '1-1', label: 'src', icon: '📁', children: [...] },
      { id: '1-2', label: 'package.json', icon: '📄', isLeaf: true },
    ],
  },
];
```

### 2. 组织架构

```javascript
const orgTree = [
  {
    id: 'ceo',
    label: 'CEO',
    children: [
      { id: 'cto', label: 'CTO', children: [...] },
      { id: 'cfo', label: 'CFO', children: [...] },
    ],
  },
];
```

### 3. 权限管理

```javascript
const permissionTree = [
  {
    id: 'admin',
    label: '管理员权限',
    checkable: true,
    children: [
      { id: 'user-manage', label: '用户管理' },
      { id: 'role-manage', label: '角色管理' },
    ],
  },
];
```

### 4. 大数据展示（10,000+ 节点）

```javascript
// 启用虚拟滚动
const options = {
  virtual: true,
  itemHeight: 32,
};

// 生成大量数据
const largeData = Array.from({ length: 10000 }, (_, i) => ({
  id: `node-${i}`,
  label: `节点 ${i}`,
}));
```

## 🔧 核心配置

```javascript
const options = {
  // 显示设置
  showIcon: true,        // 显示图标
  showLine: false,       // 显示连接线
  indent: 20,           // 缩进像素
  
  // 功能开关
  checkable: true,      // 复选框
  multiple: true,       // 多选
  draggable: true,      // 拖拽
  
  // 性能优化
  virtual: true,        // 虚拟滚动
  itemHeight: 32,       // 项高度
  
  // 默认状态
  defaultExpandAll: false,
  defaultExpandedKeys: ['1', '2'],
  defaultCheckedKeys: ['1-1'],
  
  // 懒加载
  loadData: async (node) => {
    const children = await fetchChildren(node.id);
    return children;
  },
};
```

## 📚 下一步

- 查看 [README.md](./README.md) 了解完整 API
- 运行演示项目查看所有功能
- 查看 [CHANGELOG.md](./CHANGELOG.md) 了解版本历史

## ❓ 常见问题

### Q: 如何处理大量数据？
A: 启用 `virtual: true` 选项，树组件会自动使用虚拟滚动。

### Q: 如何实现懒加载？
A: 设置 `loadData` 函数，当节点展开时会自动调用。

### Q: 如何自定义节点样式？
A: 使用 CSS 选择器覆盖默认样式：
```css
.tree-node { /* 自定义样式 */ }
.tree-node-selected { /* 选中样式 */ }
```

### Q: 如何获取勾选的节点？
A: 调用 `getCheckedNodes()` 方法或监听 `node-check` 事件。

## 💬 获取帮助

- 提交 Issue
- 查看演示项目源码
- 阅读完整文档

祝您使用愉快！🎉

