import '@ldesign/tree/lit';
import type { TreeElement } from '@ldesign/tree/lit';
import type { TreeNode } from '@ldesign/tree';

// 基础树数据
const basicData: TreeNode[] = [
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
];

// 复选框树数据
const checkableData: TreeNode[] = [
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
];

// 搜索树数据
const searchData: TreeNode[] = [
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
];

// 拖拽树数据
const draggableData: TreeNode[] = [
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
];

// 等待DOM加载完成
window.addEventListener('DOMContentLoaded', () => {
  // 基础树
  const basicTree = document.getElementById('basic-tree') as TreeElement;
  if (basicTree) {
    basicTree.data = basicData;

    document.getElementById('expand-all')?.addEventListener('click', () => {
      basicTree.expandAll();
    });

    document.getElementById('collapse-all')?.addEventListener('click', () => {
      basicTree.collapseAll();
    });

    document.getElementById('add-node')?.addEventListener('click', () => {
      const newNode: TreeNode = {
        id: `node-${Date.now()}`,
        label: `新节点 ${Date.now()}`,
      };
      basicTree.addNode(newNode);
    });
  }

  // 复选框树
  const checkableTree = document.getElementById('checkable-tree') as TreeElement;
  if (checkableTree) {
    checkableTree.data = checkableData;

    checkableTree.addEventListener('node-check', ((e: CustomEvent) => {
      const checkedNodes = checkableTree.getCheckedNodes();
      const info = document.getElementById('checked-info');
      if (info) {
        info.innerHTML = `<strong>已勾选：</strong>${checkedNodes.length} 个节点`;
      }
    }) as EventListener);

    document.getElementById('check-all')?.addEventListener('click', () => {
      checkableTree.checkAll();
    });

    document.getElementById('uncheck-all')?.addEventListener('click', () => {
      checkableTree.uncheckAll();
    });

    document.getElementById('get-checked')?.addEventListener('click', () => {
      const checkedNodes = checkableTree.getCheckedNodes();
      console.log('勾选的节点:', checkedNodes);
      alert(`已勾选 ${checkedNodes.length} 个节点，详情见控制台`);
    });
  }

  // 搜索树
  const searchTree = document.getElementById('search-tree') as TreeElement;
  if (searchTree) {
    searchTree.data = searchData;

    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    searchInput?.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value;
      searchTree.search(query);
    });

    document.getElementById('clear-search')?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchTree.clearSearch();
    });
  }

  // 大数据树
  const largeTree = document.getElementById('large-tree') as TreeElement;

  function generateLargeData(count: number) {
    const data: TreeNode[] = [];
    for (let i = 0; i < count; i++) {
      data.push({
        id: `large-${i}`,
        label: `节点 ${i + 1}`,
        isLeaf: true,
      });
    }
    if (largeTree) {
      largeTree.data = data;
      const info = document.getElementById('large-info');
      if (info) {
        info.innerHTML = `<strong>节点总数：</strong>${count}`;
      }
    }
  }

  generateLargeData(1000);

  document.getElementById('gen-1k')?.addEventListener('click', () => generateLargeData(1000));
  document.getElementById('gen-10k')?.addEventListener('click', () => generateLargeData(10000));
  document.getElementById('gen-50k')?.addEventListener('click', () => generateLargeData(50000));

  // 拖拽树
  const draggableTree = document.getElementById('draggable-tree') as TreeElement;
  if (draggableTree) {
    draggableTree.data = draggableData;

    draggableTree.addEventListener('node-drop', ((e: CustomEvent) => {
      console.log('拖拽完成:', e.detail);
    }) as EventListener);

    document.getElementById('get-tree-data')?.addEventListener('click', () => {
      const instance = draggableTree.getTreeInstance();
      const data = instance?.getData();
      console.log('当前树数据:', data);
      alert('数据已输出到控制台');
    });
  }
});

