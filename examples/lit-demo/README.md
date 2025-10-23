# @ldesign/tree - Lit Web Component 演示项目

这是一个展示 `@ldesign/tree` 作为原生 Web Component 使用的完整演示项目。

## 功能演示

- ✅ 基础树形展示
- ✅ 复选框树
- ✅ 搜索过滤
- ✅ 虚拟滚动大数据
- ✅ 拖拽排序

## 启动方式

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build
```

访问 `http://localhost:5175` 查看演示。

## Web Component 使用方式

```html
<!-- 在任何 HTML 页面中使用 -->
<script type="module">
  import '@ldesign/tree/lit';
</script>

<ldesign-tree id="myTree"></ldesign-tree>

<script>
  const tree = document.getElementById('myTree');
  tree.data = [
    { id: '1', label: '节点 1' },
    { id: '2', label: '节点 2' },
  ];
</script>
```

## 兼容性

可在以下环境中使用：
- ✅ 原生 HTML/JS
- ✅ Vue 3
- ✅ React 18+
- ✅ Angular
- ✅ Svelte
- ✅ 任何支持 Web Components 的现代浏览器

