/**
 * 皮肤注册表。
 *
 * 全部是「免费中转站」人设，区别在气质、文案与功能深度：
 *   ① RelayHub        深色科技风，全功能测试台（5 Tab + 工具调用可视化 + 成本表）
 *   ② nexus-relay     终端 / 控制台风，全功能终端化呈现
 *   ③ FreeRelay       日间极简，免费对比表 + 调试台
 *   ④ 麻薯 AI          黏土圆润萌系
 *   ⑤ NIGHTFERRY      赛博霓虹，全功能
 *   ⑥ 云枢 API         亮色企业云控制台，全功能
 *   ⑦ 福利中转站       火红营销派对风
 *   ⑧ 樱 API           少女粉二次元
 *   ⑨ PIXEL RELAY     8-bit 街机像素风
 *   ⑩ AI 快报          报纸印刷风
 *   ⑪ RELAY.          瑞士国际主义极简，全功能
 *   ⑫ Aurora          玻璃拟态极光
 *   ⑬ 墨枢             国风水墨
 *   ⑭ AURUM           黑金奢华
 *
 * 访问者首次进来随机分配一套并写进 localStorage，之后一直固定；
 * 自己换肤的隐藏入口见 App.vue（?skin= 与连点页脚）。
 */
import type { Component } from 'vue';
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
  { id: 'relay-dark', brand: 'RelayHub', title: 'RelayHub · 免费开源的 AI 转发中转站', component: RelayDark },
  { id: 'nexus-terminal', brand: 'nexus-relay', title: 'nexus-relay · 免费 AI Gateway Console', component: NexusTerminal },
  { id: 'free-relay', brand: 'FreeRelay', title: 'FreeRelay · 免费 API 中转站', component: FreeRelay },
  { id: 'mochi-cute', brand: '麻薯 AI', title: '麻薯 AI · 免费 API 中转站', component: MochiCute },
  { id: 'cyber-neon', brand: 'NIGHTFERRY · 夜航中转', title: '夜航中转 · 免费 API 中转站', component: CyberNeon },
  { id: 'cloud-saas', brand: '云枢 API · CloudPivot', title: '云枢 API · 免费中转控制台', component: CloudSaaS },
  { id: 'hot-deal', brand: '福利中转站 · FREESLOT', title: '福利中转站 · 0 元 API 不限量', component: HotDeal },
  { id: 'sakura-anime', brand: '樱 API · SakuraRelay', title: '樱 API · 免费中转站', component: SakuraAnime },
  { id: 'pixel-arcade', brand: 'PIXEL RELAY · 像素中转站', title: '像素中转站 · FREE API', component: PixelArcade },
  { id: 'paper-daily', brand: 'AI 快报 · 中转版', title: 'AI 快报 · 免费 API 中转', component: PaperDaily },
  { id: 'swiss-mono', brand: 'RELAY.', title: 'RELAY. · 免费 API 中转', component: SwissMono },
  { id: 'aurora-glass', brand: 'Aurora · 极光中转', title: 'Aurora · 免费 API 中转站', component: AuroraGlass },
  { id: 'ink-scroll', brand: '墨枢', title: '墨枢 · 免费 API 中转', component: InkScroll },
  { id: 'noir-gold', brand: 'AURUM · 金枢', title: 'AURUM · 免费 API 中转', component: NoirGold },
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
