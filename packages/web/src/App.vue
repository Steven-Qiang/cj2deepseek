<script setup lang="ts">
/**
 * 页面外壳：只负责挑一套皮肤渲染。
 * 首次访问随机一套并写入 localStorage，之后一直固定（刷新/重开都不变）。
 *
 * 隐藏换肤入口（给作者自己用，页面上不显示任何提示）：
 *   1. URL 加 ?skin=2 强制指定（支持 1 起序号 / 皮肤 id / random），会覆盖并固定
 *   2. 连点页面页脚 5 次 → 重新随机一套
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { SKINS, pickRandomSkinId, resolveInitialSkin, storeSkin } from './skins';

const skinId = ref(resolveInitialSkin());
const skin = computed(() => SKINS.find((s) => s.id === skinId.value) ?? SKINS[0]);

watch(
  skin,
  (s) => {
    document.title = s.title;
  },
  { immediate: true },
);

function reroll() {
  skinId.value = pickRandomSkinId();
  storeSkin(skinId.value);
}

// 连点页脚 5 次（1.6s 内）重新随机；皮肤只需给页脚加 data-skin-footer 标记
let clicks: number[] = [];
function onDocClick(e: MouseEvent) {
  const target = e.target as HTMLElement | null;
  if (!target || typeof target.closest !== 'function') return;
  if (!target.closest('[data-skin-footer]')) return;
  const now = Date.now();
  clicks = clicks.filter((t) => now - t < 1600);
  clicks.push(now);
  if (clicks.length >= 5) {
    clicks = [];
    reroll();
  }
}

onMounted(() => document.addEventListener('click', onDocClick));
onBeforeUnmount(() => document.removeEventListener('click', onDocClick));
</script>

<template>
  <component :is="skin.component" />
</template>
