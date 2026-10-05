/**
 * 皮肤注册表。
 *
 * 四套皮肤都是「免费中转站」人设，区别在气质、文案与功能深度：
 *   ① RelayHub      深色科技风，全功能测试台（5 个 Tab + 工具调用可视化 + 成本表）
 *   ② nexus-relay   终端 / 控制台风，全功能终端化呈现
 *   ③ FreeRelay     日间极简风，主打「免注册 / 免付费 / 不限额度」+ 免费对比表 + 调试台
 *   ④ 麻薯 AI       彩色圆润黏土风，萌系免费中转站 + 调试台 + 小纸条 FAQ
 *
 * 访问者首次进来随机分配一套并写进 localStorage，之后一直固定；
 * 自己换肤的隐藏入口见 App.vue（?skin= 与连点页脚）。
 */
import type { Component } from 'vue';
import RelayDark from './RelayDark.vue';
import NexusTerminal from './NexusTerminal.vue';
import FreeRelay from './FreeRelay.vue';
import MochiCute from './MochiCute.vue';

export interface Skin {
  /** 稳定 id，存 localStorage 用 */
  id: string;
  /** 品牌名 */
  brand: string;
  /** 浏览器标题 */
  title: string;
  component: Component;
}

export const SKINS: Skin[] = [
  {
    id: 'relay-dark',
    brand: 'RelayHub',
    title: 'RelayHub · 免费开源的 AI 转发中转站',
    component: RelayDark,
  },
  {
    id: 'nexus-terminal',
    brand: 'nexus-relay',
    title: 'nexus-relay · 免费 AI Gateway Console',
    component: NexusTerminal,
  },
  {
    id: 'free-relay',
    brand: 'FreeRelay',
    title: 'FreeRelay · 免费 API 中转站',
    component: FreeRelay,
  },
  {
    id: 'mochi-cute',
    brand: '麻薯 AI',
    title: '麻薯 AI · 免费 API 中转站',
    component: MochiCute,
  },
];

export const LS_SKIN = 'cj2deepseek:skin';

export function findSkin(id: string | null | undefined): Skin | undefined {
  return SKINS.find((s) => s.id === id);
}

export function readStoredSkin(): string | null {
  try {
    const v = localStorage.getItem(LS_SKIN);
    return findSkin(v) ? v : null;
  } catch {
    return null;
  }
}

export function storeSkin(id: string): void {
  try {
    localStorage.setItem(LS_SKIN, id);
  } catch {
    /* 隐私模式下可能抛错，忽略 */
  }
}

export function pickRandomSkinId(): string {
  return SKINS[Math.floor(Math.random() * SKINS.length)].id;
}

/**
 * 决定这次渲染哪套皮肤，并把结果固定下来。
 * 优先级：URL 的 ?skin= （1 起序号 / id / random）> localStorage > 随机。
 */
export function resolveInitialSkin(): string {
  let requested: string | null = null;
  try {
    requested = new URLSearchParams(window.location.search).get('skin');
  } catch {
    requested = null;
  }

  let id: string | null = null;
  if (requested) {
    const key = requested.trim().toLowerCase();
    if (key === 'random') {
      id = pickRandomSkinId();
    } else if (/^\d+$/.test(key)) {
      id = SKINS[Number(key) - 1]?.id ?? null;
    } else {
      id = findSkin(key)?.id ?? null;
    }
  }

  if (!id) id = readStoredSkin();
  if (!id) id = pickRandomSkinId();

  storeSkin(id);
  return id;
}
