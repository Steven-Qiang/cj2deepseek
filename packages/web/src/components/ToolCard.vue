<script setup lang="ts">
import { computed } from 'vue';

export interface ToolCallItem {
  name?: string;
  arguments?: string;
  function?: { name?: string; arguments?: string };
}

const props = defineProps<{ call: ToolCallItem }>();

const name = computed(() => props.call.function?.name || props.call.name || 'unknown');

const prettyArgs = computed(() => {
  const raw =
    props.call.function?.arguments !== undefined
      ? props.call.function.arguments
      : props.call.arguments ?? '';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return String(raw);
  }
});
</script>

<template>
  <div class="tool-card">
    <div class="tool-head">
      <span class="tool-badge">tool_call</span>
      <span class="tool-name">{{ name }}</span>
    </div>
    <pre class="tool-args">{{ prettyArgs }}</pre>
  </div>
</template>

<style scoped>
.tool-card{background:#0f1118;border:1px solid #2a3a4a;border-radius:8px;overflow:hidden}
.tool-head{display:flex;align-items:center;gap:.5rem;padding:.35rem .6rem;background:#121826;border-bottom:1px solid #1e2a3a}
.tool-badge{font-size:.62rem;color:#0a0a0a;background:#4a9eff;border-radius:4px;padding:.08rem .35rem;font-weight:600}
.tool-name{font-size:.76rem;color:#4ade80;font-family:"SF Mono",Monaco,Consolas,monospace}
.tool-args{margin:0;padding:.55rem .7rem;font-size:.72rem;color:#9aa7c0;white-space:pre-wrap;word-break:break-word;font-family:"SF Mono",Monaco,Consolas,monospace}
</style>
