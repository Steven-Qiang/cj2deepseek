/**
 * 皮肤注册表 + 选择逻辑。
 *
 * id / brand / title 的唯一来源是 skin-meta.ts（同一份数据也会被构建脚本投递给 Worker，
 * 用于服务端注入 head 与预渲染首屏），这里只负责把 id 映射到组件。
 *
 * 选择优先级：
 *   /skin/<id> 路径（可收录 URL，必须严格生效）
 *   > ?skin=（作者换肤入口：序号 / id / random）
 *   > localStorage（回访用户固定）
 *   > window.__RELAY_SKIN__（服务端本次下发的皮肤，首访沿用，避免闪屏）
 *   > 随机
 */
import type { Component } from 'vue';
import { SKIN_META } from './skin-meta';
import RelayDark from './RelayDark.vue';
import NexusTerminal from './NexusTerminal.vue';
import FreeRelay from './FreeRelay.vue';
import MochiCute from './MochiCute.vue';
import CyberNeon from './CyberNeon.vue';
import CloudSaaS from './CloudSaaS.vue';
import HotDeal from './HotDeal.vue';
import SakuraAnime from './SakuraAnime.vue';
import PixelArcade from './PixelArcade.vue';
import PaperDaily from './PaperDaily.vue';
import SwissMono from './SwissMono.vue';
import AuroraGlass from './AuroraGlass.vue';
import InkScroll from './InkScroll.vue';
import NoirGold from './NoirGold.vue';

declare global {
  interface Window {
    /** 服务端注入的本轮皮肤 id */
    __RELAY_SKIN__?: string;
  }
}

const COMPONENTS: Record<string, Component> = {
  'relay-dark': RelayDark,
  'nexus-terminal': NexusTerminal,
  'free-relay': FreeRelay,
  'mochi-cute': MochiCute,
  'cyber-neon': CyberNeon,
  'cloud-saas': CloudSaaS,
  'hot-deal': HotDeal,
  'sakura-anime': SakuraAnime,
  'pixel-arcade': PixelArcade,
  'paper-daily': PaperDaily,
  'swiss-mono': SwissMono,
  'aurora-glass': AuroraGlass,
  'ink-scroll': InkScroll,
  'noir-gold': NoirGold,
};

export interface Skin {
  /** 稳定 id，存 localStorage / cookie 用 */
  id: string;
  /** 品牌名 */
  brand: string;
  /** 浏览器标题 */
  title: string;
  component: Component;
}

export const SKINS: Skin[] = SKIN_META.filter((m) => COMPONENTS[m.id]).map((m) => ({
  id: m.id,
  brand: m.brand,
  title: m.title,
  component: COMPONENTS[m.id],
}));

export const LS_SKIN = 'cj2deepseek:skin';
export const SKIN_COOKIE = 'relay_skin';

export function findSkin(id: string | null | undefined): Skin | undefined {
  if (!id) return undefined;
  return SKINS.find((s) => s.id === id);
}

export function readStoredSkin(): string | null {
  try {
    return findSkin(localStorage.getItem(LS_SKIN))?.id ?? null;
  } catch {
    return null;
  }
}

/** 同时写 localStorage 与 cookie：cookie 让服务端下次直接下发同一套皮肤 */
export function storeSkin(id: string): void {
  try {
    localStorage.setItem(LS_SKIN, id);
  } catch {
    /* 隐私模式下可能抛错，忽略 */
  }
  try {
    document.cookie = `${SKIN_COOKIE}=${encodeURIComponent(id)}; path=/; max-age=31536000; samesite=lax`;
  } catch {
    /* 同上 */
  }
}

export function pickRandomSkinId(): string {
  return SKINS[Math.floor(Math.random() * SKINS.length)].id;
}

/** /skin/<id> 路径上的皮肤（可收录 URL，优先级最高） */
function readPathSkin(): string | null {
  try {
    const m = window.location.pathname.match(/^\/skin\/([^/]+)\/?$/);
    return m ? findSkin(decodeURIComponent(m[1]))?.id ?? null : null;
  } catch {
    return null;
  }
}

/** 决定这次渲染哪套皮肤，并把结果固定下来 */
export function resolveInitialSkin(): string {
  let requested: string | null = null;
  try {
    requested = new URLSearchParams(window.location.search).get('skin');
  } catch {
    requested = null;
  }

  let id: string | null = readPathSkin();

  if (!id && requested) {
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
  if (!id) id = findSkin(window.__RELAY_SKIN__)?.id ?? null;
  if (!id) id = pickRandomSkinId();

  storeSkin(id);
  return id;
}
