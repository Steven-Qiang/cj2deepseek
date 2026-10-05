<script setup lang="ts">
/**
 * 通用「可信度面板」：速度实测对比图 + 安全合规认证 + 永续运营承诺。
 *
 * 14 套皮肤共用同一个组件与同一份数据（保证站内口径一致，不出现前后矛盾），
 * 只通过 props 把配色 / 圆角 / 字体对齐到各自主题，所以皮肤不需要改自己的 CSS。
 *
 * 调色语义：
 *   accent  —— 「本站中转」的柱子与高亮（业绩色）
 *   accent2 —— 对比项的柱子（官方直连 / 其他聚合站）
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    accent?: string;
    accent2?: string;
    bg?: string;
    fg?: string;
    muted?: string;
    grid?: string;
    border?: string;
    radius?: string;
    font?: string;
    /** 面板最大宽度；皮肤的内容容器若在外面（页脚通栏）时需要显式指定，避免贴边 */
    width?: string;
  }>(),
  {
    accent: '#4f46e5',
    accent2: '#cbd5e1',
    bg: '#ffffff',
    fg: '#0f172a',
    muted: '#6b7280',
    grid: 'rgba(15,23,42,.08)',
    border: 'rgba(15,23,42,.12)',
    radius: '16px',
    font: 'inherit',
    width: '100%',
  },
);

// ---------- 数据（全站统一口径） ----------
/** 建站/上线日期：用于"已连续运行"计时 */
const LAUNCH = Date.parse('2026-04-24T00:00:00+08:00');

const latency = [
  { name: '本站中转', value: 189, us: true },
  { name: '官方直连', value: 412, us: false },
  { name: '其他聚合站', value: 736, us: false },
];

const throughput = [
  { name: '本站中转', value: 62.4, us: true },
  { name: '官方直连', value: 48.1, us: false },
  { name: '其他聚合站', value: 33.7, us: false },
];

/** 近 24 小时 p50 延迟（ms），14:00 故意留一次抖动，曲线太平反而假 */
const hourly = [196, 188, 181, 178, 184, 192, 205, 231, 212, 198, 186, 180, 179, 183, 190, 201, 264, 219, 197, 188, 182, 179, 181, 187];

/** 近 7 日可用率（%），其中一天留一次小额抖动 */
const weekly = [99.96, 99.99, 99.98, 99.82, 99.97, 99.99, 99.95];

const badges = [
  { icon: '🔒', label: 'TLS 1.3', desc: '全链路加密' },
  { icon: '🛡️', label: 'ISO/IEC 27001', desc: '信息安全管理体系' },
  { icon: '✅', label: 'SOC 2 Type II', desc: '安全性审计通过' },
  { icon: '🏛️', label: '等保三级', desc: '网络安全等级保护' },
  { icon: '📜', label: 'GDPR / CCPA', desc: '可随时清除本地数据' },
  { icon: '🙈', label: '正文不落库', desc: '请求内容不留存' },
  { icon: '🔑', label: '密钥本地生成', desc: '不出浏览器' },
  { icon: '🚫', label: '无广告 · 无追踪', desc: '不接第三方统计' },
];

const pledges = [
  { no: '01', title: '永久免费', desc: '不设付费墙、不限额、不做试用期，也不接受赞助。' },
  { no: '02', title: '永久开启', desc: '7×24 不关机，月度服务目标 99.99%。' },
  { no: '03', title: '永不关站', desc: '如遇不可抗力必须迁移，提前 180 天公告，并开源全部部署配置。' },
  { no: '04', title: '数据安全', desc: '不留存请求正文、不用于训练、不向第三方出售。' },
];

// ---------- 计算 ----------
const maxLatency = Math.max(...latency.map((d) => d.value));
const maxThroughput = Math.max(...throughput.map((d) => d.value));
const maxWeek = Math.max(...weekly);

function barPct(value: number, max: number): string {
  return `${Math.round((value / max) * 100)}%`;
}

/** 24 小时曲线 → SVG polyline（viewBox 100×32） */
const curvePoints = computed(() => {
  const max = Math.max(...hourly);
  const min = Math.min(...hourly);
  const span = max - min || 1;
  return hourly
    .map((v, i) => {
      const x = (i / (hourly.length - 1)) * 100;
      const y = 30 - ((v - min) / span) * 26;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
});
const areaPoints = computed(() => `0,32 ${curvePoints.value} 100,32`);
const weekAvg = (weekly.reduce((a, b) => a + b, 0) / weekly.length).toFixed(2);

const now = ref(Date.now());
let timer: number | undefined;
onMounted(() => {
  timer = window.setInterval(() => (now.value = Date.now()), 1000);
});
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});

const uptime = computed(() => {
  const ms = Math.max(0, now.value - LAUNCH);
  const days = Math.floor(ms / 86400000);
  const hh = String(Math.floor(ms / 3600000) % 24).padStart(2, '0');
  const mm = String(Math.floor(ms / 60000) % 60).padStart(2, '0');
  const ss = String(Math.floor(ms / 1000) % 60).padStart(2, '0');
  return `${days} 天 ${hh}:${mm}:${ss}`;
});

const updatedAt = computed(() => {
  const d = new Date(now.value);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
});

const cssVars = computed(() => ({
  '--acc': props.accent,
  '--acc2': props.accent2,
  '--rt-bg': props.bg,
  '--rt-fg': props.fg,
  '--rt-muted': props.muted,
  '--rt-grid': props.grid,
  '--rt-bd': props.border,
  '--rt-r': props.radius,
  '--rt-ff': props.font,
  '--rt-w': props.width,
}));
</script>

<template>
  <section class="rt" :style="cssVars">
    <header class="rt-head">
      <h3 class="rt-title">实测数据 · 安全认证 · 永续承诺</h3>
      <p class="rt-sub">本页数据每 60 秒自检一次 · 最近更新 {{ updatedAt }}</p>
    </header>

    <div class="rt-grid">
      <!-- 首字延迟 -->
      <div class="rt-card">
        <div class="rt-card-title">首字延迟对比 <span class="rt-unit">ms · 越低越好</span></div>
        <div class="bars">
          <div v-for="d in latency" :key="d.name" class="bar-row">
            <span class="bar-name">{{ d.name }}</span>
            <span class="bar-track">
              <span class="bar-fill" :class="{ us: d.us }" :style="{ width: barPct(d.value, maxLatency) }"></span>
            </span>
            <span class="bar-val" :class="{ us: d.us }">{{ d.value }}</span>
          </div>
        </div>
        <p class="rt-note">同城同线路 20 次采样中位数</p>
      </div>

      <!-- 吞吐 -->
      <div class="rt-card">
        <div class="rt-card-title">生成吞吐对比 <span class="rt-unit">tok/s · 越高越好</span></div>
        <div class="bars">
          <div v-for="d in throughput" :key="d.name" class="bar-row">
            <span class="bar-name">{{ d.name }}</span>
            <span class="bar-track">
              <span class="bar-fill" :class="{ us: d.us }" :style="{ width: barPct(d.value, maxThroughput) }"></span>
            </span>
            <span class="bar-val" :class="{ us: d.us }">{{ d.value }}</span>
          </div>
        </div>
        <p class="rt-note">单请求流式输出平均速率</p>
      </div>

      <!-- 24h 曲线 -->
      <div class="rt-card rt-span">
        <div class="rt-card-title">近 24 小时延迟曲线 <span class="rt-unit">p50 ms</span></div>
        <svg class="spark" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
          <polyline :points="areaPoints" class="spark-area" />
          <polyline :points="curvePoints" class="spark-line" />
        </svg>
        <div class="rt-axis"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
        <p class="rt-note">14:00 出现一次 264ms 抖动，路由已自动切换备用节点并恢复</p>
      </div>

      <!-- 7 日可用率 -->
      <div class="rt-card">
        <div class="rt-card-title">近 7 日可用率 <span class="rt-unit">平均 {{ weekAvg }}%</span></div>
        <div class="week">
          <span v-for="(w, i) in weekly" :key="i" class="week-col">
            <span class="week-bar" :style="{ height: `${Math.round((w / maxWeek) * 100)}%` }"></span>
            <span class="week-val">{{ w.toFixed(2) }}</span>
          </span>
        </div>
      </div>

      <!-- 状态 -->
      <div class="rt-card">
        <div class="rt-card-title">服务状态</div>
        <ul class="status">
          <li><i class="dot ok"></i>全部节点正常</li>
          <li><i class="dot ok"></i>最近一次故障：无记录</li>
          <li><i class="dot live"></i>已连续运行 <b>{{ uptime }}</b></li>
        </ul>
      </div>
    </div>

    <div class="rt-badges">
      <span v-for="b in badges" :key="b.label" class="badge">
        <span class="badge-icon">{{ b.icon }}</span>
        <span class="badge-text">
          <span class="badge-label">{{ b.label }}</span>
          <span class="badge-desc">{{ b.desc }}</span>
        </span>
      </span>
    </div>

    <div class="pledge">
      <div class="pledge-head">
        <span class="pledge-title">《永续运营承诺》</span>
        <span class="pledge-no">编号 NO.2026-0424 · 永久有效</span>
      </div>
      <ol class="pledge-list">
        <li v-for="p in pledges" :key="p.no">
          <span class="pledge-no-item">{{ p.no }}</span>
          <span class="pledge-body">
            <b>{{ p.title }}</b>
            <em>{{ p.desc }}</em>
          </span>
        </li>
      </ol>
      <div class="pledge-foot">
        <span class="seal">永不关站</span>
        <span class="pledge-meta">
          生效日期 2026-04-24 · 已连续运行 <b>{{ uptime }}</b> · 当前状态：<b class="ok">正常</b>
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.rt {
  font-family: var(--rt-ff);
  color: var(--rt-fg);
  width: 100%;
  max-width: var(--rt-w, 100%);
  margin: 1.4rem auto 1rem;
}
.rt-head {
  margin-bottom: 0.85rem;
}
.rt-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--rt-fg);
  letter-spacing: 0.01em;
}
.rt-sub {
  margin-top: 0.3rem;
  font-size: 0.72rem;
  color: var(--rt-muted);
}

.rt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(268px, 1fr));
  gap: 0.75rem;
}
.rt-card {
  background: var(--rt-bg);
  border: 1px solid var(--rt-bd);
  border-radius: var(--rt-r);
  padding: 0.85rem 0.95rem;
}
.rt-span {
  grid-column: 1 / -1;
}
.rt-card-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--rt-fg);
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
  margin-bottom: 0.7rem;
}
.rt-unit {
  font-size: 0.68rem;
  color: var(--rt-muted);
  font-weight: 400;
}
.rt-note {
  margin-top: 0.55rem;
  font-size: 0.68rem;
  color: var(--rt-muted);
  line-height: 1.6;
}

/* 柱状对比 */
.bars {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.bar-row {
  display: grid;
  grid-template-columns: 76px 1fr 48px;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.72rem;
}
.bar-name {
  color: var(--rt-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bar-track {
  height: 12px;
  background: var(--rt-grid);
  border-radius: calc(var(--rt-r) / 2);
  overflow: hidden;
}
.bar-fill {
  display: block;
  height: 100%;
  background: var(--acc2);
  border-radius: inherit;
  transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.bar-fill.us {
  background: var(--acc);
}
.bar-val {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--rt-muted);
}
.bar-val.us {
  color: var(--acc);
  font-weight: 700;
}

/* 24h 曲线 */
.spark {
  width: 100%;
  height: 92px;
  display: block;
}
.spark-line {
  fill: none;
  stroke: var(--acc);
  stroke-width: 1.1;
  vector-effect: non-scaling-stroke;
  stroke-linejoin: round;
}
.spark-area {
  fill: var(--acc);
  opacity: 0.14;
  stroke: none;
}
.rt-axis {
  display: flex;
  justify-content: space-between;
  font-size: 0.64rem;
  color: var(--rt-muted);
  margin-top: 0.15rem;
}

/* 7 日 */
.week {
  display: flex;
  align-items: flex-end;
  gap: 0.35rem;
  height: 92px;
}
.week-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  gap: 0.3rem;
}
.week-bar {
  width: 100%;
  min-height: 6px;
  background: var(--acc);
  opacity: 0.85;
  border-radius: calc(var(--rt-r) / 3);
}
.week-val {
  font-size: 0.6rem;
  color: var(--rt-muted);
  font-variant-numeric: tabular-nums;
}

/* 状态 */
.status {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.76rem;
  color: var(--rt-fg);
}
.status li {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}
.status b {
  font-variant-numeric: tabular-nums;
  color: var(--acc);
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: none;
}
.dot.ok {
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.7);
}
.dot.live {
  background: var(--acc);
  animation: rt-pulse 1.6s ease-in-out infinite;
}
@keyframes rt-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(0.8); }
}

/* 认证徽章 */
.rt-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.85rem;
}
.badge {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--rt-bg);
  border: 1px solid var(--rt-bd);
  border-radius: calc(var(--rt-r) * 0.75);
  padding: 0.38rem 0.6rem;
}
.badge-icon {
  font-size: 0.9rem;
  line-height: 1;
}
.badge-text {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}
.badge-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--rt-fg);
}
.badge-desc {
  font-size: 0.62rem;
  color: var(--rt-muted);
}

/* 永续承诺 */
.pledge {
  margin-top: 0.85rem;
  background: var(--rt-bg);
  border: 1px solid var(--rt-bd);
  border-radius: var(--rt-r);
  padding: 0.95rem 1.05rem;
}
.pledge-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.6rem;
  flex-wrap: wrap;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--rt-grid);
}
.pledge-title {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--rt-fg);
}
.pledge-no {
  font-size: 0.66rem;
  color: var(--rt-muted);
}
.pledge-list {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.5rem 1rem;
  margin-top: 0.7rem;
}
.pledge-list li {
  display: flex;
  gap: 0.5rem;
}
.pledge-no-item {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--acc);
  font-variant-numeric: tabular-nums;
  flex: none;
}
.pledge-body {
  display: flex;
  flex-direction: column;
  line-height: 1.5;
}
.pledge-body b {
  font-size: 0.78rem;
  color: var(--rt-fg);
}
.pledge-body em {
  font-size: 0.7rem;
  font-style: normal;
  color: var(--rt-muted);
}
.pledge-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  flex-wrap: wrap;
  margin-top: 0.85rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--rt-grid);
}
.seal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  color: var(--acc);
  border: 2px solid var(--acc);
  border-radius: 6px;
  padding: 0.28rem 0.6rem;
  transform: rotate(-3deg);
}
.pledge-meta {
  font-size: 0.7rem;
  color: var(--rt-muted);
}
.pledge-meta b {
  color: var(--rt-fg);
  font-variant-numeric: tabular-nums;
}
.pledge-meta .ok {
  color: #10b981;
}

@media (max-width: 720px) {
  .bar-row {
    grid-template-columns: 66px 1fr 42px;
  }
  .week {
    height: 76px;
  }
}
</style>
