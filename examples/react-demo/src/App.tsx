import React, { useState, useRef } from 'react';
import { Tree, TreeRef } from '@ldesign/tree/react';
import type { TreeNode, TreeOptions } from '@ldesign/tree';

function App() {
  // 基础树
  const basicTreeRef = useRef<TreeRef>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [basicData] = useState<TreeNode[]>([
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

  // 复选框树
  const checkableTreeRef = useRef<TreeRef>(null);
  const [checkedNodes, setCheckedNodes] = useState<TreeNode[]>([]);
  const [checkableData] = useState<TreeNode[]>([
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
  ]);

  // 搜索树
  const searchTreeRef = useRef<TreeRef>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchData] = useState<TreeNode[]>([
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
  ]);

  // 大数据树
  const largeTreeRef = useRef<TreeRef>(null);
  const [largeData, setLargeData] = useState<TreeNode[]>([]);

  const generateLargeData = (count: number) => {
    const data: TreeNode[] = [];
    for (let i = 0; i < count; i++) {
      data.push({
        id: `large-${i}`,
        label: `节点 ${i + 1}`,
        isLeaf: true,
      });
    }
    setLargeData(data);
  };

  const basicOptions: TreeOptions = {
    showIcon: true,
    highlightCurrent: true,
  };

  const checkableOptions: TreeOptions = {
    checkable: true,
    showIcon: true,
  };

  const largeOptions: TreeOptions = {
    virtual: true,
    itemHeight: 32,
    showIcon: false,
  };

  React.useEffect(() => {
    generateLargeData(1000);
  }, []);

  return (
    <div className="app">
      <h1>@ldesign/tree - React 演示</h1>

      {/* 基础树 */}
      <section className="demo-section">
        <h2>基础树形展示</h2>
        <div className="demo-controls">
          <button onClick={() => basicTreeRef.current?.expandAll()}>展开全部</button>
          <button onClick={() => basicTreeRef.current?.collapseAll()}>折叠全部</button>
          <button onClick={() => {
            const newNode: TreeNode = {
              id: `node-${Date.now()}`,
              label: `新节点 ${Date.now()}`,
            };
            basicTreeRef.current?.addNode(newNode);
          }}>添加节点</button>
        </div>
        <div className="tree-wrapper">
          <Tree
            ref={basicTreeRef}
            data={basicData}
            options={basicOptions}
            height="300px"
            onNodeClick={(node) => setSelectedNode(node)}
          />
        </div>
        <div className="stats">
          <p><strong>选中节点：</strong>{selectedNode?.label || '无'}</p>
        </div>
      </section>

      {/* 复选框树 */}
      <section className="demo-section">
        <h2>复选框树</h2>
        <div className="demo-controls">
          <button onClick={() => checkableTreeRef.current?.checkAll()}>全选</button>
          <button onClick={() => checkableTreeRef.current?.uncheckAll()}>取消全选</button>
        </div>
        <div className="tree-wrapper">
          <Tree
            ref={checkableTreeRef}
            data={checkableData}
            options={checkableOptions}
            height="300px"
            onNodeCheck={(node, checked, nodes) => setCheckedNodes(nodes)}
          />
        </div>
        <div className="stats">
          <p><strong>已勾选：</strong>{checkedNodes.length} 个节点</p>
        </div>
      </section>

      {/* 搜索树 */}
      <section className="demo-section">
        <h2>搜索过滤</h2>
        <div className="demo-controls">
          <input
            type="text"
            placeholder="输入关键词搜索..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              searchTreeRef.current?.search(e.target.value);
            }}
          />
          <button onClick={() => {
            setSearchQuery('');
            searchTreeRef.current?.clearSearch();
          }}>清除搜索</button>
        </div>
        <div className="tree-wrapper">
          <Tree
            ref={searchTreeRef}
            data={searchData}
            options={{ showIcon: true }}
            height="300px"
          />
        </div>
      </section>

      {/* 大数据树 */}
      <section className="demo-section">
        <h2>虚拟滚动（大数据）</h2>
        <div className="demo-controls">
          <button onClick={() => generateLargeData(1000)}>生成 1,000 节点</button>
          <button onClick={() => generateLargeData(10000)}>生成 10,000 节点</button>
          <button onClick={() => generateLargeData(50000)}>生成 50,000 节点</button>
        </div>
        <div className="tree-wrapper">
          <Tree
            ref={largeTreeRef}
            data={largeData}
            options={largeOptions}
            height="400px"
          />
        </div>
        <div className="stats">
          <p><strong>节点总数：</strong>{largeData.length}</p>
        </div>
      </section>
    </div>
  );
}

export default App;

