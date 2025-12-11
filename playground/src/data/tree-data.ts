/**
 * 演示数据
 */

import type { TreeNodeData } from '@ldesign/tree-core'

// 基础树数据 (使用 Lucide 默认图标)
export const basicTreeData: TreeNodeData[] = [
  {
    id: '1',
    label: 'Documents',
    children: [
      {
        id: '1-1', label: 'Work', children: [
          { id: '1-1-1', label: 'project-plan.docx' },
          { id: '1-1-2', label: 'meeting-notes.docx' },
          { id: '1-1-3', label: 'requirements.docx' },
        ]
      },
      {
        id: '1-2', label: 'Personal', children: [
          { id: '1-2-1', label: 'resume.pdf' },
          { id: '1-2-2', label: 'certificates.pdf' },
        ]
      },
    ],
  },
  {
    id: '2',
    label: 'Images',
    children: [
      {
        id: '2-1', label: 'Photos', children: [
          {
            id: '2-1-1', label: 'Travel', children: [
              { id: '2-1-1-1', label: 'beijing.jpg' },
              { id: '2-1-1-2', label: 'shanghai.jpg' },
              { id: '2-1-1-3', label: 'guangzhou.jpg' },
            ]
          },
          {
            id: '2-1-2', label: 'Family', children: [
              { id: '2-1-2-1', label: 'portrait.jpg' },
            ]
          },
        ]
      },
      {
        id: '2-2', label: 'Wallpapers', children: [
          { id: '2-2-1', label: 'landscape.jpg' },
          { id: '2-2-2', label: 'city.jpg' },
        ]
      },
    ],
  },
  {
    id: '3',
    label: 'Music',
    children: [
      {
        id: '3-1', label: 'Pop', children: [
          { id: '3-1-1', label: 'trending.mp3' },
          { id: '3-1-2', label: 'classics.mp3' },
        ]
      },
      {
        id: '3-2', label: 'Classical', children: [
          { id: '3-2-1', label: 'beethoven.mp3' },
          { id: '3-2-2', label: 'mozart.mp3' },
        ]
      },
    ],
  },
  {
    id: '4',
    label: 'Videos',
    children: [
      {
        id: '4-1', label: 'Movies', children: [
          { id: '4-1-1', label: 'sci-fi.mp4' },
          { id: '4-1-2', label: 'comedy.mp4' },
        ]
      },
      {
        id: '4-2', label: 'Tutorials', children: [
          { id: '4-2-1', label: 'vue-tutorial.mp4' },
          { id: '4-2-2', label: 'react-tutorial.mp4' },
        ]
      },
    ],
  },
]

// 组织架构数据 (用于复选框演示)
export const orgTreeData: TreeNodeData[] = [
  {
    id: 'ceo',
    label: 'CEO - John Smith',
    children: [
      {
        id: 'cto',
        label: 'CTO - Mike Johnson',
        children: [
          {
            id: 'dev-lead',
            label: 'Dev Lead - Tom Wilson',
            children: [
              { id: 'dev-1', label: 'Frontend - Alice Brown' },
              { id: 'dev-2', label: 'Backend - Bob Davis' },
              { id: 'dev-3', label: 'Fullstack - Carol White' },
            ],
          },
          {
            id: 'qa-lead',
            label: 'QA Lead - David Lee',
            children: [
              { id: 'qa-1', label: 'QA Engineer - Eve Martin' },
              { id: 'qa-2', label: 'QA Engineer - Frank Garcia' },
            ],
          },
        ],
      },
      {
        id: 'coo',
        label: 'COO - Sarah Miller',
        children: [
          {
            id: 'hr-lead',
            label: 'HR Lead - Grace Taylor',
            children: [
              { id: 'hr-1', label: 'HR Specialist - Henry Anderson' },
            ],
          },
          {
            id: 'admin-lead',
            label: 'Admin Lead - Ivy Thomas',
            children: [
              { id: 'admin-1', label: 'Admin - Jack Moore' },
            ],
          },
        ],
      },
      {
        id: 'cfo',
        label: 'CFO - Kevin Jackson',
        children: [
          {
            id: 'finance-lead',
            label: 'Finance Lead - Linda Harris',
            children: [
              { id: 'finance-1', label: 'Accountant - Mary Clark' },
              { id: 'finance-2', label: 'Cashier - Nancy Lewis' },
            ],
          },
        ],
      },
    ],
  },
]

// 生成大量数据（用于虚拟滚动演示）
export function generateLargeData(count: number = 10000): TreeNodeData[] {
  const data: TreeNodeData[] = []

  for (let i = 1; i <= count; i++) {
    const hasChildren = Math.random() > 0.7
    const node: TreeNodeData = {
      id: `node-${i}`,
      label: `Node ${i}`,
    }

    if (hasChildren) {
      const childCount = Math.floor(Math.random() * 5) + 1
      node.children = []
      for (let j = 1; j <= childCount; j++) {
        const hasGrandChildren = Math.random() > 0.8
        const childNode: TreeNodeData = {
          id: `node-${i}-${j}`,
          label: `Node ${i}-${j}`,
        }

        if (hasGrandChildren) {
          const grandChildCount = Math.floor(Math.random() * 3) + 1
          childNode.children = []
          for (let k = 1; k <= grandChildCount; k++) {
            childNode.children.push({
              id: `node-${i}-${j}-${k}`,
              label: `Node ${i}-${j}-${k}`,
            })
          }
        }

        node.children.push(childNode)
      }
    }

    data.push(node)
  }

  return data
}

// 使用 GitHub API 进行懒加载测试 (获取 Vue 仓库文件结构)
const GITHUB_REPOS = [
  { owner: 'vuejs', repo: 'core', name: 'Vue.js Core' },
  { owner: 'facebook', repo: 'react', name: 'React' },
  { owner: 'sveltejs', repo: 'svelte', name: 'Svelte' },
]

interface GitHubContent {
  name: string
  path: string
  type: 'file' | 'dir'
  sha: string
}

// 从 GitHub API 加载目录内容
export async function loadChildrenAsync(node: { id: string; data?: { path?: string; owner?: string; repo?: string } }): Promise<TreeNodeData[]> {
  const nodeData = node.data || {}
  const path = nodeData.path || ''
  const owner = nodeData.owner || 'vuejs'
  const repo = nodeData.repo || 'core'

  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
    const response = await fetch(url, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const contents: GitHubContent[] = await response.json()

    // 排序: 目录在前，文件在后，按名称排序
    contents.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
      return a.name.localeCompare(b.name)
    })

    return contents.slice(0, 20).map(item => ({
      id: item.sha,
      label: item.name,
      isLeaf: item.type === 'file',
      data: { path: item.path, owner, repo },
    }))
  } catch (error) {
    console.error('Failed to load from GitHub:', error)
    // 降级到模拟数据
    return fallbackLoadChildren(node.id)
  }
}

// 备用模拟数据加载
function fallbackLoadChildren(nodeId: string): Promise<TreeNodeData[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const count = Math.floor(Math.random() * 5) + 2
      const children: TreeNodeData[] = []
      for (let i = 1; i <= count; i++) {
        const hasChildren = Math.random() > 0.5
        children.push({
          id: `${nodeId}-${i}`,
          label: `Node ${nodeId.split('-').pop()}-${i}`,
          isLeaf: !hasChildren,
        })
      }
      resolve(children)
    }, 500)
  })
}

// 懒加载树初始数据 - GitHub 仓库列表
export const lazyTreeData: TreeNodeData[] = GITHUB_REPOS.map((repo, index) => ({
  id: `repo-${index}`,
  label: repo.name,
  isLeaf: false,
  data: { path: '', owner: repo.owner, repo: repo.repo },
}))
