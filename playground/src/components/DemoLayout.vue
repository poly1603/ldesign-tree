<script setup lang="ts">
import { ref, computed } from 'vue'
import { Code } from 'lucide-vue-next'

const props = defineProps<{
  title: string
  code: { vue: string; native: string }
  activeTab?: 'vue' | 'native'
}>()

const emit = defineEmits<{
  'update:activeTab': [value: 'vue' | 'native']
}>()

const showCode = ref(false)
const tab = computed({
  get: () => props.activeTab || 'vue',
  set: (v) => emit('update:activeTab', v)
})

const currentCode = computed(() => tab.value === 'vue' ? props.code.vue : props.code.native)
</script>

<template>
  <div class="demo-layout">
    <div class="demo-header">
      <div class="demo-tabs">
        <button :class="['demo-tab', { active: tab === 'vue' }]" @click="tab = 'vue'">
          Vue
        </button>
        <button :class="['demo-tab', { active: tab === 'native' }]" @click="tab = 'native'">
          Native
        </button>
      </div>
      <div class="demo-actions">
        <slot name="actions"></slot>
        <button class="demo-btn" @click="showCode = !showCode" title="Toggle Code">
          <Code :size="18" />
        </button>
      </div>
    </div>

    <div class="demo-content">
      <div v-show="tab === 'vue'" class="demo-panel">
        <slot name="vue"></slot>
      </div>
      <div v-show="tab === 'native'" class="demo-panel">
        <slot name="native"></slot>
      </div>
    </div>

    <div v-if="showCode" class="demo-code">
      <pre><code>{{ currentCode }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.demo-layout {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.demo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
}

.demo-tabs {
  display: flex;
  gap: 4px;
}

.demo-tab {
  padding: 6px 16px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-tab:hover {
  color: #374151;
  background: #e5e7eb;
}

.demo-tab.active {
  color: #3b82f6;
  background: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.demo-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.demo-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #6b7280;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.demo-btn:hover {
  color: #374151;
  background: #e5e7eb;
}

.demo-content {
  padding: 24px;
}

.demo-panel {
  min-height: 400px;
}

.demo-code {
  border-top: 1px solid #e5e7eb;
  background: #1e1e1e;
  max-height: 300px;
  overflow: auto;
}

.demo-code pre {
  margin: 0;
  padding: 16px;
  font-size: 13px;
  line-height: 1.5;
}

.demo-code code {
  color: #d4d4d4;
  font-family: 'Fira Code', Consolas, Monaco, monospace;
}
</style>
