/**
 * 代码示例
 */

export const codeExamples = {
  basic: {
    native: `import { createTree, injectStyles } from '@ldesign/tree-core'

injectStyles()

const tree = createTree('#container', treeData, {
  showIcon: true,
  animate: true,
})

// 展开全部
tree.expandAll()

// 折叠全部
tree.collapseAll()`,
    vue: `\x3Ctemplate>
  \x3CLTree
    ref="treeRef"
    :data="treeData"
    :options="{ showIcon: true, animate: true }"
    height="400px"
  />
\x3C/template>

\x3Cscript setup>
import { LTree } from '@ldesign/tree-vue'

const treeRef = ref(null)

// 展开全部
treeRef.value?.expandAll()
\x3C/script>`,
  },
  checkbox: {
    native: `const tree = createTree('#container', orgData, {
  showIcon: true,
  checkable: true,
  checkCascade: true,  // 级联选中
  defaultExpandAll: true,
})

// 获取选中的节点
const checkedIds = tree.getCheckedIds()

// 全选 / 取消全选
tree.checkAll()
tree.uncheckAll()`,
    vue: `\x3Ctemplate>
  \x3CLTree
    ref="treeRef"
    :data="orgData"
    :options="{
      showIcon: true,
      checkable: true,
      checkCascade: true,
    }"
    @node-check="handleCheck"
  />
\x3C/template>

\x3Cscript setup>
const handleCheck = (node, checked) => {
  console.log('选中状态:', node.label, checked)
}

// 获取选中的节点 ID
const checkedIds = treeRef.value?.getCheckedIds()
\x3C/script>`,
  },
  search: {
    native: `const tree = createTree('#container', treeData, {
  showIcon: true,
  defaultExpandAll: true,
})

// 搜索节点
tree.search('文档')

// 清除搜索
tree.clearSearch()`,
    vue: `\x3Ctemplate>
  \x3Cinput v-model="query" @input="handleSearch" />
  \x3CLTree
    ref="treeRef"
    :data="treeData"
    :options="{ showIcon: true }"
  />
\x3C/template>

\x3Cscript setup>
const query = ref('')
const handleSearch = () => {
  treeRef.value?.search(query.value)
}
\x3C/script>`,
  },
  drag: {
    native: `const tree = createTree('#container', treeData, {
  showIcon: true,
  draggable: true,
  allowDrag: (node) => !node.disabled,
  allowDrop: (drag, drop, position) => true,
})

tree.on('drop', ({ dragNode, dropNode, position }) => {
  console.log('拖拽完成', dragNode.label, '->', dropNode.label)
})`,
    vue: `\x3Ctemplate>
  \x3CLTree
    :data="treeData"
    :options="{ showIcon: true, draggable: true }"
    @node-drop="handleDrop"
  />
\x3C/template>

\x3Cscript setup>
const handleDrop = (dragNode, dropNode, position) => {
  console.log('拖拽:', dragNode.label, '->', dropNode.label)
}
\x3C/script>`,
  },
  virtual: {
    native: `// 生成 10000 个节点
const largeData = generateLargeData(10000)

const tree = createTree('#container', largeData, {
  virtual: true,      // 启用虚拟滚动
  itemHeight: 32,     // 固定行高
  bufferSize: 5,      // 缓冲区大小
})

// 滚动到指定节点
tree.scrollToNode('node-5000')`,
    vue: `\x3Ctemplate>
  \x3CLTree
    :data="largeData"
    :options="{
      virtual: true,
      itemHeight: 32,
    }"
    height="400px"
  />
\x3C/template>

\x3Cscript setup>
// 支持 10000+ 节点流畅渲染
const largeData = generateLargeData(10000)
\x3C/script>`,
  },
  lazy: {
    native: `const tree = createTree('#container', initialData, {
  showIcon: true,
  loadData: async (node) => {
    const res = await fetch('/api/children?id=' + node.id)
    return res.json()
  },
})

tree.on('load-data', ({ node, children }) => {
  console.log('加载完成:', node.label, children.length)
})`,
    vue: `\x3Ctemplate>
  \x3CLTree
    :data="initialData"
    :options="{
      showIcon: true,
      loadData: loadChildren,
    }"
  />
\x3C/template>

\x3Cscript setup>
const loadChildren = async (node) => {
  const res = await fetch('/api/children?id=' + node.id)
  return res.json()
}
\x3C/script>`,
  },
  rich: {
    native: `const tree = createTree('#container', richData, {
  showIcon: true,
  showDescription: true,  // 显示节点描述
  showBadge: true,        // 显示徽章
  showTags: true,         // 显示标签
  showActions: 'hover',   // 悬停显示操作按钮
  defaultExpandAll: true,
  onActionClick: (action, node) => {
    console.log('操作:', action.key, '节点:', node.label)
  },
})

// 节点数据示例
const richData = [{
  id: '1',
  label: 'My Project',
  description: 'A awesome project',
  badge: { text: 'v2.0', type: 'primary' },
  tags: [{ text: 'UI', color: '#3b82f6' }],
  actions: [{ key: 'edit', title: 'Edit' }],
}]`,
    vue: `\x3Ctemplate>
  \x3CLTree
    :data="richData"
    :options="{
      showIcon: true,
      showDescription: true,
      showBadge: true,
      showTags: true,
      showActions: 'hover',
      onActionClick: handleAction,
    }"
  />
\x3C/template>

\x3Cscript setup>
const handleAction = (action, node) => {
  console.log('操作:', action.key, node.label)
}

const richData = [{
  id: '1',
  label: 'Button.vue',
  description: 'Button component',
  badge: { text: 'NEW', type: 'success' },
  tags: [{ text: 'UI' }],
  actions: [{ key: 'edit', title: 'Edit' }],
}]
\x3C/script>`,
  },
  directory: {
    native: `const tree = createTree('#container', directoryData, {
  showIcon: true,
  showLine: true,         // 显示连接线
  lineStyle: 'solid',     // 线条样式: solid | dashed | dotted
  defaultExpandAll: true,
})`,
    vue: `\x3Ctemplate>
  \x3CLTree
    :data="directoryData"
    :options="{
      showIcon: true,
      showLine: true,
      lineStyle: 'solid',
    }"
  />
\x3C/template>

\x3Cscript setup>
// 连接线样式选项:
// - 'solid': 实线
// - 'dashed': 虚线
// - 'dotted': 点线
\x3C/script>`,
  },
}
