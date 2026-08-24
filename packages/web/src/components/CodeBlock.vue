<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ code: string }>();

const copied = ref(false);

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code);
  } catch {
    // clipboard 不可用时回退
    const ta = document.createElement('textarea');
    ta.value = props.code;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch { /* ignore */ }
    document.body.removeChild(ta);
  }
  copied.value = true;
  setTimeout(() => (copied.value = false), 1500);
}
</script>

<template>
  <div class="code-block">
    <button class="copy-btn" @click="copy">{{ copied ? '已复制' : '复制' }}</button>
    <pre><code>{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.code-block{position:relative;background:#0c0c0c;border:1px solid #252525;border-radius:6px;padding:.7rem .8rem;font-family:"SF Mono",Monaco,Consolas,monospace;font-size:.72rem;line-height:1.6;color:#a0a0a0;overflow-x:auto;margin-bottom:.6rem}
.code-block pre{margin:0;white-space:pre}
.code-block code{font-family:inherit}
.copy-btn{position:absolute;top:.4rem;right:.4rem;background:#1a1a1a;color:#888;border:1px solid #333;border-radius:4px;padding:.15rem .4rem;font-size:.65rem;cursor:pointer}
.copy-btn:hover{color:#fff;background:#333}
</style>
