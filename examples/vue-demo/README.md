# @ldesign/tree - Vue 演示项目

这是一个展示 `@ldesign/tree` 在 Vue 3 中使用的完整演示项目。

## 功能演示

- ✅ 基础树形展示（展开/折叠、增删改查）
- ✅ 虚拟滚动大数据（10,000+ 节点流畅渲染）
- ✅ 复选框树（级联勾选、全选/反选）
- ✅ 搜索过滤（关键词搜索、高亮显示）
- ✅ 拖拽排序（节点拖拽、跨层级移动）

## 启动方式

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

## 使用说明

### 1. 基础用法

```vue
<template>
  <TreeComponent
    :data="treeData"
    :options="options"
    @node-click="handleNodeClick"
  />
</template>

<script setup>
import { TreeComponent } from '@ldesign/tree/vue';

const treeData = [
  {
    id: '1',
    label: '根节点',
    children: [
      { id: '1-1', label: '子节点 1-1' },
      { id: '1-2', label: '子节点 1-2' },
    ],
  },
];

const options = {
  showIcon: true,
  checkable: false,
};

function handleNodeClick(node) {
  console.log('点击节点:', node);
}
</script>
```

### 2. 使用 Composition API

```vue
<script setup>
import { ref } from 'vue';
import { useTree } from '@ldesign/tree/vue';

const { treeRef, selectedNodes, search } = useTree({
  data: treeData,
  options: {
    virtual: true,
    itemHeight: 32,
  },
});
</script>

<template>
  <div ref="treeRef"></div>
</template>
```

## API 文档

详见主项目 README.md

## 在线演示

访问 `http://localhost:5173` 查看在线演示。

