<template>
  <div class="app">
    <h1>@ldesign/tree - Vue 演示</h1>

    <!-- 基础树形展示 -->
    <section class="demo-section">
      <h2>基础树形展示</h2>
      <div class="demo-controls">
        <button @click="toggleExpandAll">{{ allExpanded ? '折叠全部' : '展开全部' }}</button>
        <button @click="addRandomNode">添加随机节点</button>
        <button @click="removeSelectedNode">删除选中节点</button>
      </div>
      <div class="tree-wrapper">
        <TreeComponent ref="basicTreeRef" :data="basicData" :options="basicOptions" height="300px"
          @node-click="handleNodeClick" />
      </div>
      <div class="stats">
        <p><strong>选中节点：</strong>{{ selectedNode?.label || '无' }}</p>
      </div>
    </section>

    <!-- 虚拟滚动大数据 -->
    <section class="demo-section">
      <h2>虚拟滚动（10,000+ 节点）</h2>
      <div class="demo-controls">
        <button @click="generateLargeData(1000)">生成 1,000 节点</button>
        <button @click="generateLargeData(10000)">生成 10,000 节点</button>
        <button @click="generateLargeData(50000)">生成 50,000 节点</button>
      </div>
      <div class="tree-wrapper">
        <TreeComponent ref="largeTreeRef" :data="largeData" :options="largeOptions" height="400px" />
      </div>
      <div class="stats">
        <p><strong>节点总数：</strong>{{ largeData.length }}</p>
        <p><strong>渲染性能：</strong>流畅（虚拟滚动）</p>
      </div>
    </section>

    <!-- 复选框树 -->
    <section class="demo-section">
      <h2>复选框树</h2>
      <div class="demo-controls">
        <button @click="checkAllNodes">全选</button>
        <button @click="uncheckAllNodes">取消全选</button>
        <button @click="exportCheckedNodes">导出勾选节点</button>
      </div>
      <div class="tree-wrapper">
        <TreeComponent ref="checkableTreeRef" :data="checkableData" :options="checkableOptions" height="300px"
          @node-check="handleNodeCheck" />
      </div>
      <div class="stats">
        <p><strong>已勾选：</strong>{{ checkedNodes.length }} 个节点</p>
        <p><strong>勾选列表：</strong>{{checkedNodes.map(n => n.label).join(', ') || '无'}}</p>
      </div>
    </section>

    <!-- 搜索过滤 -->
    <section class="demo-section">
      <h2>搜索过滤</h2>
      <div class="demo-controls">
        <input v-model="searchQuery" type="text" placeholder="输入关键词搜索..." @input="handleSearch" />
        <button @click="clearSearch">清除搜索</button>
      </div>
      <div class="tree-wrapper">
        <TreeComponent ref="searchTreeRef" :data="searchData" :options="searchOptions" height="300px" />
      </div>
      <div class="stats">
        <p><strong>搜索关键词：</strong>{{ searchQuery || '无' }}</p>
      </div>
    </section>

    <!-- 拖拽排序 -->
    <section class="demo-section">
      <h2>拖拽排序</h2>
      <div class="demo-controls">
        <button @click="getDraggableData">获取当前数据</button>
      </div>
      <div class="tree-wrapper">
        <TreeComponent ref="draggableTreeRef" :data="draggableData" :options="draggableOptions" height="300px"
          @node-drop="handleDrop" />
      </div>
      <div class="stats">
        <p><strong>提示：</strong>拖拽节点可以调整顺序或移动到其他节点下</p>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { TreeComponent } from '@ldesign/tree/vue';
import type { TreeNode, TreeOptions } from '@ldesign/tree';

// 基础树
const basicTreeRef = ref();
const basicData = ref<TreeNode[]>([
  {
    id: '1',
    label: '根节点 1',
    children: [
      {
        id: '1-1', label: '子节点 1-1', children: [
          { id: '1-1-1', label: '孙节点 1-1-1' },
          { id: '1-1-2', label: '孙节点 1-1-2' },
        ]
      },
      { id: '1-2', label: '子节点 1-2' },
    ],
  },
  {
    id: '2',
    label: '根节点 2',
    children: [
      { id: '2-1', label: '子节点 2-1' },
      { id: '2-2', label: '子节点 2-2' },
    ],
  },
]);
const basicOptions = ref<TreeOptions>({
  showIcon: true,
  highlightCurrent: true,
});
const selectedNode = ref<TreeNode | null>(null);
const allExpanded = ref(false);

function handleNodeClick(node: TreeNode) {
  selectedNode.value = node;
  console.log('点击节点:', node);
}

function toggleExpandAll() {
  if (allExpanded.value) {
    basicTreeRef.value?.collapseAll();
  } else {
    basicTreeRef.value?.expandAll();
  }
  allExpanded.value = !allExpanded.value;
}

function addRandomNode() {
  const newNode: TreeNode = {
    id: `node-${Date.now()}`,
    label: `新节点 ${Date.now()}`,
  };
  basicTreeRef.value?.addNode(newNode);
}

function removeSelectedNode() {
  if (selectedNode.value) {
    basicTreeRef.value?.removeNode(selectedNode.value.id);
    selectedNode.value = null;
  }
}

// 大数据树
const largeTreeRef = ref();
const largeData = ref<TreeNode[]>([]);
const largeOptions = ref<TreeOptions>({
  virtual: true,
  itemHeight: 32,
  showIcon: false,
});

function generateLargeData(count: number) {
  const data: TreeNode[] = [];
  for (let i = 0; i < count; i++) {
    data.push({
      id: `large-${i}`,
      label: `节点 ${i + 1}`,
      isLeaf: true,
    });
  }
  largeData.value = data;
}

// 复选框树
const checkableTreeRef = ref();
const checkableData = ref<TreeNode[]>([
  {
    id: 'c1',
    label: '项目 A',
    children: [
      {
        id: 'c1-1', label: '文件夹 A-1', children: [
          { id: 'c1-1-1', label: '文件 A-1-1.txt' },
          { id: 'c1-1-2', label: '文件 A-1-2.txt' },
        ]
      },
      { id: 'c1-2', label: '文件 A-2.txt' },
    ],
  },
  {
    id: 'c2',
    label: '项目 B',
    children: [
      { id: 'c2-1', label: '文件 B-1.txt' },
      { id: 'c2-2', label: '文件 B-2.txt' },
    ],
  },
]);
const checkableOptions = ref<TreeOptions>({
  checkable: true,
  showIcon: true,
});
const checkedNodes = ref<TreeNode[]>([]);

function handleNodeCheck(node: TreeNode, checked: boolean, nodes: TreeNode[]) {
  checkedNodes.value = nodes;
  console.log('勾选变化:', { node, checked, total: nodes.length });
}

function checkAllNodes() {
  checkableTreeRef.value?.checkAll();
}

function uncheckAllNodes() {
  checkableTreeRef.value?.uncheckAll();
}

function exportCheckedNodes() {
  const nodes = checkableTreeRef.value?.getCheckedNodes() || [];
  console.log('导出勾选节点:', nodes);
  alert(`已勾选 ${nodes.length} 个节点，详情见控制台`);
}

// 搜索树
const searchTreeRef = ref();
const searchQuery = ref('');
const searchData = ref<TreeNode[]>([
  {
    id: 's1',
    label: 'Apple',
    children: [
      { id: 's1-1', label: 'iPhone' },
      { id: 's1-2', label: 'iPad' },
      { id: 's1-3', label: 'MacBook' },
    ],
  },
  {
    id: 's2',
    label: 'Google',
    children: [
      { id: 's2-1', label: 'Android' },
      { id: 's2-2', label: 'Chrome' },
    ],
  },
  {
    id: 's3',
    label: 'Microsoft',
    children: [
      { id: 's3-1', label: 'Windows' },
      { id: 's3-2', label: 'Office' },
    ],
  },
]);
const searchOptions = ref<TreeOptions>({
  showIcon: true,
});

function handleSearch() {
  searchTreeRef.value?.search(searchQuery.value);
}

function clearSearch() {
  searchQuery.value = '';
  searchTreeRef.value?.clearSearch();
}

// 拖拽树
const draggableTreeRef = ref();
const draggableData = ref<TreeNode[]>([
  {
    id: 'd1',
    label: '可拖拽节点 1',
    children: [
      { id: 'd1-1', label: '子节点 1-1' },
      { id: 'd1-2', label: '子节点 1-2' },
    ],
  },
  {
    id: 'd2',
    label: '可拖拽节点 2',
    children: [
      { id: 'd2-1', label: '子节点 2-1' },
    ],
  },
  { id: 'd3', label: '可拖拽节点 3' },
]);
const draggableOptions = ref<TreeOptions>({
  draggable: true,
  showIcon: true,
});

function handleDrop(data: any) {
  console.log('拖拽完成:', data);
}

function getDraggableData() {
  const instance = draggableTreeRef.value?.getTreeInstance();
  const data = instance?.getData();
  console.log('当前树数据:', data);
  alert('数据已输出到控制台');
}

// 初始化
generateLargeData(1000);
</script>

<style scoped>
.app {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
