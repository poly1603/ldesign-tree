<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { LTree } from '@ldesign/tree-vue'
import { createTree, injectStyles, type Tree, type TreeNodeData } from '@ldesign/tree-core'
import { TreePine, Search, Check, Minus, Zap, Loader2, Move, CheckSquare, Code } from 'lucide-vue-next'
import { basicTreeData, orgTreeData, generateLargeData, loadChildrenAsync, lazyTreeData } from './data/tree-data'
import { codeExamples } from './data/code-examples'

type DemoType = 'basic' | 'checkbox' | 'search' | 'drag' | 'virtual' | 'lazy'
const currentDemo = ref<DemoType>('basic')
const activeTab = ref<'native' | 'vue'>('vue')
const showCode = ref(false)
const searchQuery = ref('')
const nodeCount = ref(10000)
const checkedCount = ref(0)

const navItems = [
  { id: 'basic', label: 'Basic', icon: TreePine },
  { id: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'drag', label: 'Drag', icon: Move },
  { id: 'virtual', label: 'Virtual', icon: Zap },
  { id: 'lazy', label: 'Lazy', icon: Loader2 },
]

const nativeContainerRef = ref<HTMLElement | null>(null)
let nativeTree: Tree | null = null

const getCurrentOptions = () => {
  const base = { showIcon: true, animate: true }
  switch (currentDemo.value) {
    case 'checkbox': return { ...base, checkable: true, checkCascade: true, defaultExpandAll: true }
    case 'search': return { ...base, defaultExpandAll: true }
    case 'drag': return { ...base, draggable: true, defaultExpandAll: true }
    case 'virtual': return { ...base, virtual: true, itemHeight: 32 }
    case 'lazy': return { ...base, loadData: loadChildrenAsync }
    default: return base
  }
}

const getCurrentData = (): TreeNodeData[] => {
  switch (currentDemo.value) {
    case 'checkbox': return [...orgTreeData]
    case 'virtual': return generateLargeData(nodeCount.value)
    case 'lazy': return [...lazyTreeData]
    default: return [...basicTreeData]
  }
}

const initNativeTree = () => {
  if (!nativeContainerRef.value) return
  nativeTree?.destroy()
  nativeTree = createTree(nativeContainerRef.value, getCurrentData(), getCurrentOptions() as any)
}

const vueTreeRef = ref<InstanceType<typeof LTree> | null>(null)
const currentCode = codeExamples

const handleExpandAll = () => activeTab.value === 'native' ? nativeTree?.expandAll() : vueTreeRef.value?.expandAll()
const handleCollapseAll = () => activeTab.value === 'native' ? nativeTree?.collapseAll() : vueTreeRef.value?.collapseAll()
const handleCheckAll = () => { activeTab.value === 'native' ? nativeTree?.checkAll() : vueTreeRef.value?.checkAll(); updateCheckedCount() }
const handleUncheckAll = () => { activeTab.value === 'native' ? nativeTree?.uncheckAll() : vueTreeRef.value?.uncheckAll(); updateCheckedCount() }
const updateCheckedCount = () => { checkedCount.value = activeTab.value === 'native' ? nativeTree?.getCheckedIds().length ?? 0 : vueTreeRef.value?.getCheckedIds()?.length ?? 0 }
const handleSearch = () => activeTab.value === 'native' ? nativeTree?.search(searchQuery.value) : vueTreeRef.value?.search(searchQuery.value)
const clearSearch = () => { searchQuery.value = ''; activeTab.value === 'native' ? nativeTree?.clearSearch() : vueTreeRef.value?.clearSearch() }
const regenerateData = () => { const data = generateLargeData(nodeCount.value); activeTab.value === 'native' ? nativeTree?.setData(data) : vueTreeRef.value?.setData(data) }

watch([currentDemo, activeTab], () => {
  showCode.value = false
  searchQuery.value = ''
  checkedCount.value = 0
  nextTick(() => { if (activeTab.value === 'native') initNativeTree() })
})

onMounted(() => injectStyles())
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="logo"><TreePine :size="24" /><span>LDesign Tree</span></div>
    </header>
    <div class="main">
      <aside class="sidebar">
        <ul class="nav">
          <li v-for="item in navItems" :key="item.id" :class="['nav-item', { active: currentDemo === item.id }]" @click="currentDemo = item.id as DemoType">
            <component :is="item.icon" :size="18" /><span>{{ item.label }}</span>
          </li>
        </ul>
      </aside>
      <main class="content">
        <div class="card">
          <div class="card-header">
            <div class="tabs">
              <button :class="['tab', { active: activeTab === 'vue' }]" @click="activeTab = 'vue'">Vue</button>
              <button :class="['tab', { active: activeTab === 'native' }]" @click="activeTab = 'native'">Native</button>
            </div>
            <div class="actions">
              <template v-if="currentDemo === 'checkbox'">
                <span class="badge">{{ checkedCount }}</span>
                <button class="btn btn-primary" @click="handleCheckAll"><Check :size="14" /></button>
                <button class="btn" @click="handleUncheckAll"><Minus :size="14" /></button>
              </template>
              <template v-if="currentDemo === 'basic' || currentDemo === 'drag'">
                <button class="btn" @click="handleExpandAll">Expand</button>
                <button class="btn" @click="handleCollapseAll">Collapse</button>
              </template>
              <template v-if="currentDemo === 'virtual'">
                <select v-model="nodeCount" class="select" @change="regenerateData">
                  <option :value="1000">1K</option>
                  <option :value="10000">10K</option>
                  <option :value="50000">50K</option>
                </select>
              </template>
              <button :class="['btn', { 'btn-primary': showCode }]" @click="showCode = !showCode"><Code :size="14" /></button>
            </div>
          </div>
          <div v-if="currentDemo === 'search'" class="toolbar">
            <input v-model="searchQuery" type="text" placeholder="Search..." @input="handleSearch" class="input" />
            <button v-if="searchQuery" class="btn" @click="clearSearch">Clear</button>
          </div>
          <div v-if="showCode" class="code"><pre>{{ activeTab === 'vue' ? currentCode[currentDemo].vue : currentCode[currentDemo].native }}</pre></div>
          <div class="card-body">
            <div v-show="activeTab === 'vue'" class="tree-box">
              <LTree ref="vueTreeRef" :data="getCurrentData()" :options="getCurrentOptions() as any" height="100%" @node-check="updateCheckedCount" />
            </div>
            <div v-show="activeTab === 'native'" class="tree-box">
              <div ref="nativeContainerRef" style="height:100%"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;font-size:14px;background:#f8fafc;color:#1e293b}
.app{min-height:100vh}
.header{display:flex;align-items:center;padding:12px 20px;background:#fff;border-bottom:1px solid #e2e8f0}
.logo{display:flex;align-items:center;gap:8px;font-size:18px;font-weight:600;color:#3b82f6}
.main{display:flex}
.sidebar{width:180px;background:#fff;border-right:1px solid #e2e8f0;padding:16px 8px}
.nav{list-style:none}
.nav-item{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:6px;color:#64748b;cursor:pointer}
.nav-item:hover{background:#f1f5f9;color:#1e293b}
.nav-item.active{background:#3b82f6;color:#fff}
.content{flex:1;padding:20px}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden}
.card-header{display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;flex-wrap:wrap;gap:8px}
.tabs{display:flex;gap:4px}
.tab{padding:6px 12px;border:none;background:transparent;color:#64748b;font-size:13px;cursor:pointer;border-radius:6px}
.tab:hover{background:#f1f5f9}
.tab.active{background:#fff;color:#1e293b;box-shadow:0 1px 2px rgba(0,0,0,.05)}
.actions{display:flex;align-items:center;gap:6px}
.btn{display:inline-flex;align-items:center;gap:4px;padding:6px 10px;font-size:12px;border:none;background:#f1f5f9;color:#1e293b;border-radius:6px;cursor:pointer}
.btn:hover{background:#e2e8f0}
.btn-primary{background:#3b82f6;color:#fff}
.btn-primary:hover{background:#2563eb}
.badge{padding:2px 8px;font-size:12px;background:rgba(59,130,246,.1);color:#3b82f6;border-radius:4px}
.select{padding:6px 8px;font-size:12px;border:1px solid #e2e8f0;border-radius:4px;background:#fff}
.toolbar{padding:12px;border-bottom:1px solid #e2e8f0;display:flex;gap:8px}
.input{padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:14px;flex:1;max-width:300px}
.input:focus{outline:none;border-color:#3b82f6}
.code{padding:16px;background:#0f172a;color:#e2e8f0;font-size:13px;overflow-x:auto;max-height:240px;border-bottom:1px solid #e2e8f0}
.code pre{margin:0;white-space:pre-wrap}
.card-body{height:400px}
.tree-box{height:100%}
</style>
