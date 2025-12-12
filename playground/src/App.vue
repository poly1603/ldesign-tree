<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { TreePine, Search, Zap, Loader2, Move, CheckSquare, GitBranch, Sparkles, TreeDeciduous } from 'lucide-vue-next'

const navItems = [
  { path: '/basic', label: 'Basic', icon: TreePine },
  { path: '/checkbox', label: 'Checkbox', icon: CheckSquare },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/drag', label: 'Drag', icon: Move },
  { path: '/virtual', label: 'Virtual', icon: Zap },
  { path: '/lazy', label: 'Lazy', icon: Loader2 },
  { path: '/rich', label: 'Rich', icon: Sparkles },
  { path: '/lines', label: 'Lines', icon: GitBranch },
]

const route = useRoute()
</script>

<template>
  <div class="app">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="logo">
        <TreeDeciduous :size="24" />
        <span>LDesign Tree</span>
      </div>
      <nav class="nav">
        <RouterLink v-for="item in navItems" :key="item.path" :to="item.path" class="nav-item"
          :class="{ active: route.path === item.path }">
          <component :is="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app {
  display: flex;
  min-height: 100vh;
  background: #f5f5f5;
}

.sidebar {
  width: 200px;
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  font-size: 18px;
  font-weight: 600;
  color: #3b82f6;
  border-bottom: 1px solid #e5e7eb;
}

.nav {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #374151;
}

.nav-item.active {
  background: #3b82f6;
  color: white;
}

.main {
  flex: 1;
  padding: 24px;
  overflow: auto;
}
</style>
