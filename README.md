# @ldesign/tree

<p align="center">
  <strong>🌳 高级树形组件 - 支持虚拟滚动、拖拽排序、懒加载、搜索过滤</strong>
</p>

<p align="center">
  <a href="#特性">特性</a> •
  <a href="#安装">安装</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#api">API</a> •
  <a href="#演示">演示</a>
</p>

---

## ✨ 特性

### 核心功能（P0）
- ✅ **树形渲染** - 支持层级缩进、展开/折叠、自定义图标
- ✅ **虚拟滚动** - 流畅渲染 10,000+ 节点，性能卓越
- ✅ **节点操作** - 单选/多选、复选框（三态）、右键菜单
- ✅ **数据管理** - 完整的 CRUD API、父子关系自动维护

### 高级功能（P1）
- ✅ **拖拽排序** - 节点拖拽、跨层级移动、拖拽验证
- ✅ **懒加载** - 异步加载子节点、加载状态、失败重试
- ✅ **搜索过滤** - 关键词搜索、正则表达式、高亮显示
- ✅ **批量操作** - 批量选中、删除、移动、导出（JSON/CSV）

### 扩展功能（P2）
- ✅ **内联编辑** - 节点文本直接编辑
- ✅ **导入导出** - JSON/Excel 格式支持
- ✅ **统计分析** - 节点数、层级深度等统计
- ✅ **树形 Diff** - 对比两棵树的差异

### 跨框架支持
- ✅ **Vue 3** - 组件 + Composition API
- ✅ **React 18** - 组件 + Hooks
- ✅ **Lit** - 原生 Web Component
- ✅ **框架无关** - 核心 API 可在任意框架中使用

## 📦 安装

```bash
# npm
npm install @ldesign/tree

# pnpm
pnpm add @ldesign/tree

# yarn
yarn add @ldesign/tree
```

## 🚀 快速开始

### Vue 3

```vue
<template>
  <TreeComponent
    :data="treeData"
    :options="options"
    height="400px"
    @node-click="handleNodeClick"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { TreeComponent } from '@ldesign/tree/vue';
import type { TreeNode, TreeOptions } from '@ldesign/tree';

const treeData = ref<TreeNode[]>([
  {
    id: '1',
    label: '根节点',
    children: [
      { id: '1-1', label: '子节点 1-1' },
      { id: '1-2', label: '子节点 1-2' },
    ],
  },
]);

const options: TreeOptions = {
  showIcon: true,
  checkable: true,
  draggable: true,
  virtual: true,
};

function handleNodeClick(node: TreeNode) {
  console.log('点击节点:', node);
}
</script>
```

### React

```tsx
import React, { useRef } from 'react';
import { Tree, TreeRef } from '@ldesign/tree/react';
import type { TreeNode, TreeOptions } from '@ldesign/tree';

function App() {
  const treeRef = useRef<TreeRef>(null);
  
  const data: TreeNode[] = [
    {
      id: '1',
      label: '根节点',
      children: [
        { id: '1-1', label: '子节点 1-1' },
        { id: '1-2', label: '子节点 1-2' },
      ],
    },
  ];

  const options: TreeOptions = {
    showIcon: true,
    checkable: true,
  };

  return (
    <Tree
      ref={treeRef}
      data={data}
      options={options}
      height="400px"
      onNodeClick={(node) => console.log(node)}
    />
  );
}
```

### Lit / Web Component

```html
<script type="module">
  import '@ldesign/tree/lit';
  
  const tree = document.getElementById('myTree');
  tree.data = [
    { id: '1', label: '根节点', children: [
      { id: '1-1', label: '子节点 1-1' },
    ]},
  ];
  
  tree.addEventListener('node-click', (e) => {
    console.log('点击节点:', e.detail.node);
  });
</script>

<ldesign-tree
  id="myTree"
  checkable
  draggable
  virtual
></ldesign-tree>
```

### 原生 JavaScript

```javascript
import { createTree } from '@ldesign/tree';

const container = document.getElementById('tree-container');

const tree = createTree(container, [
  {
    id: '1',
    label: '根节点',
    children: [
      { id: '1-1', label: '子节点 1-1' },
      { id: '1-2', label: '子节点 1-2' },
    ],
  },
], {
  showIcon: true,
  checkable: true,
  virtual: true,
});
```

## 📖 API

### TreeNode

```typescript
interface TreeNode<T = any> {
  id: string | number;           // 节点唯一标识
  label: string;                 // 节点显示文本
  parentId?: string | number;    // 父节点 ID
  children?: TreeNode<T>[];      // 子节点列表
  expanded?: boolean;            // 是否展开
  selected?: boolean;            // 是否选中
  disabled?: boolean;            // 是否禁用
  checkable?: boolean;           // 是否显示复选框
  checked?: 'checked' | 'unchecked' | 'indeterminate';  // 复选框状态
  isLeaf?: boolean;              // 是否叶子节点
  loading?: boolean;             // 是否正在加载
  icon?: string;                 // 节点图标
  data?: T;                      // 自定义数据
}
```

### TreeOptions

```typescript
interface TreeOptions {
  indent?: number;                    // 节点缩进像素（默认 20）
  showLine?: boolean;                 // 是否显示连接线
  showIcon?: boolean;                 // 是否显示图标（默认 true）
  checkable?: boolean;                // 是否显示复选框
  multiple?: boolean;                 // 是否支持多选
  draggable?: boolean;                // 是否支持拖拽
  defaultExpandAll?: boolean;         // 默认展开所有节点
  virtual?: boolean;                  // 是否启用虚拟滚动（默认 true）
  itemHeight?: number;                // 虚拟滚动项高度（默认 32）
  loadData?: (node: TreeNode) => Promise<TreeNode[]>;  // 懒加载函数
  filterMethod?: (query: string, node: TreeNode) => boolean;  // 过滤函数
  allowDrag?: (node: TreeNode) => boolean;            // 节点可拖拽判断
  allowDrop?: (dragNode: TreeNode, dropNode: TreeNode, type: DropType) => boolean;  // 节点可放置判断
}
```

### 核心方法

#### 数据操作
- `setData(data: TreeNode[])` - 设置树数据
- `getData(): TreeNode[]` - 获取树数据
- `getNode(nodeId)` - 获取节点
- `addNode(node, parentId?)` - 添加节点
- `removeNode(nodeId)` - 删除节点
- `updateNode(nodeId, updates)` - 更新节点

#### 展开/折叠
- `expandNode(nodeId)` - 展开节点
- `collapseNode(nodeId)` - 折叠节点
- `toggleExpand(nodeId)` - 切换展开状态
- `expandAll()` - 展开所有节点
- `collapseAll()` - 折叠所有节点

#### 选择
- `selectNode(nodeId)` - 选中节点
- `unselectNode(nodeId)` - 取消选中
- `getSelectedNodes()` - 获取选中节点

#### 勾选
- `checkNode(nodeId, checked)` - 勾选节点
- `checkAll()` - 全选
- `uncheckAll()` - 取消全选
- `getCheckedNodes()` - 获取勾选节点

#### 搜索
- `search(query)` - 搜索节点
- `clearSearch()` - 清除搜索

#### 批量操作
- `batchOperator.selectNodes(nodeIds)` - 批量选中
- `batchOperator.deleteNodes(nodeIds)` - 批量删除
- `batchOperator.exportNodes(nodeIds, options)` - 批量导出

## 🎯 演示

### 在线演示

- Vue 演示: `cd examples/vue-demo && pnpm dev`
- React 演示: `cd examples/react-demo && pnpm dev`
- Lit 演示: `cd examples/lit-demo && pnpm dev`

### 演示功能

每个演示项目都包含以下完整功能展示：

1. **基础树形展示** - 展开/折叠、增删改查
2. **虚拟滚动大数据** - 10,000+ 节点流畅渲染
3. **复选框树** - 级联勾选、全选/反选
4. **搜索过滤** - 关键词搜索、高亮显示
5. **拖拽排序** - 节点拖拽、跨层级移动
6. **懒加载** - 异步加载子节点
7. **批量操作** - 批量选中、删除、导出

## 🏗️ 架构设计

```
@ldesign/tree
├── core/                 # 框架无关的核心逻辑
│   ├── tree-manager     # 树数据管理
│   ├── virtual-scroller # 虚拟滚动引擎
│   ├── drag-handler     # 拖拽处理
│   ├── search-engine    # 搜索引擎
│   ├── selection-manager # 选择管理
│   ├── batch-operator   # 批量操作
│   └── lazy-loader      # 懒加载管理
├── adapters/            # 框架适配器
│   ├── vue/            # Vue 3 适配器
│   ├── react/          # React 适配器
│   └── lit/            # Lit Web Component
└── renderers/          # 渲染器
    └── dom-renderer    # DOM 渲染器
```

## 📊 性能

- ✅ 支持 10,000+ 节点流畅渲染（虚拟滚动）
- ✅ 首屏渲染时间 < 100ms
- ✅ 节点操作响应时间 < 16ms
- ✅ 内存占用优化（按需渲染）

## 🔧 开发

```bash
# 安装依赖
pnpm install

# 构建
pnpm build

# 开发模式
pnpm dev

# 运行 Vue 演示
cd examples/vue-demo && pnpm dev

# 运行 React 演示
cd examples/react-demo && pnpm dev

# 运行 Lit 演示
cd examples/lit-demo && pnpm dev
```

## 📄 License

MIT © LDesign Team

## 🙏 参考项目

- [react-arborist](https://github.com/brimdata/react-arborist) - 高性能树组件
- [vue-virtual-tree](https://github.com/lycHub/vue-virtual-tree) - Vue 虚拟树
- [antd-tree](https://ant.design/components/tree-cn) - Ant Design 树组件
- [element-plus-tree](https://element-plus.org/zh-CN/component/tree.html) - Element Plus 树组件






