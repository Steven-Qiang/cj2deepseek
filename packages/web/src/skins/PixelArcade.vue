<script setup lang="ts">
/**
 * 皮肤 ④：PixelArcade —— 8-bit 复古街机「像素中转站」（LITE + 调试关卡）
 * 深蓝紫底 + 像素霓虹 + 4px 硬边框 + 2px 偏移硬阴影 + 零圆角 + CRT 扫描线。
 */
import { computed } from 'vue';
import { useRelay } from '../relay';
import { buildSamples } from '../samples';
import CodeBlock from '../components/CodeBlock.vue';

const r = useRelay({
  placeholder: '> INSERT COIN... 等待指令',
  message: '你好',
  stream: true,
});

const samples = computed(() => buildSamples(r.baseUrl.value, r.apiKey.value, r.model.value));
const curlCode = computed(() => samples.value.curl[0].code);

const endpoints = [
  { method: 'POST', path: '/v1/chat/completions', note: '主线关卡' },
  { method: 'POST', path: '/v1/responses', note: '隐藏关卡' },
  { method: 'GET', path: '/v1/models', note: '角色表' },
];

const compare = [
  { item: 'PRICE 价格', official: '¥0.15 / 1M input 起', here: '0 COIN' },
  { item: 'SIGN UP 注册', official: '邮箱 + 手机号', here: 'NO NEED 不需要' },
  { item: 'PAY 支付', official: '先充值再玩', here: 'FREE PLAY 免费开局' },
  { item: 'API KEY 密钥', official: '官方签发', here: '本站自动生成，永久有效' },
  { item: 'LIMIT 限速', official: '按余额与等级', here: 'NO LIMIT 不限' },
  { item: 'BALANCE 余额', official: '用完即停', here: '∞ 无限续币' },
];

const faqs = [
  { q: 'Q: 真的完全免费吗？', a: '是的，完全免费且不限额度，不用投币也能一直玩。本站是公益转发，不对调用方计费，也不限制并发。' },
  { q: 'Q: 需要注册或者申请 Key？', a: '不需要。上面那串 API Key 由页面在本地生成，会自动保存在浏览器里，填任意字符串也能通过校验。' },
  { q: 'Q: 会不会突然关站（GAME OVER）？', a: '不会主动关，但公益站点由个人维护，不承诺可用性。重要项目请使用官方 API，别把生产线放在街机上。' },
  { q: 'Q: 我的客户端要改哪里？', a: '只改 Base URL，其余照旧。模型名按官方写法填即可，未识别的名字会被原样接受。' },
];
</script>

<template>
  <div class="skin">
    <!-- CRT 扫描线 + 暗角 -->
    <div class="crt" aria-hidden="true"></div>

    <div class="topbar">
      <span class="tb-free">完全免费</span>
      <span class="tb-txt">NO REGISTRATION · NO PAYMENT · NO LIMIT · 不用投币</span>
      <span class="tb-coin">🪙 ×∞</span>
    </div>

    <header class="nav">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true"></span>
        <span class="brand-name">PIXEL RELAY</span>
        <span class="brand-tag">像素中转站</span>
      </div>
      <div class="nav-right">
        <span class="blink">▶ 1 PLAYER · 0 COIN · 免费续币</span>
      </div>
    </header>

    <main class="main">
      <!-- ========== 标题画面 ========== -->
      <section class="title-screen">
        <div class="title-deco" aria-hidden="true"><span class="coin"></span></div>
        <p class="title-top">INSERT COIN? · 不需要投币</p>
        <h1 class="title-main">PIXEL RELAY</h1>
        <p class="title-sub">像素中转站 · 8-BIT FREE API GATEWAY</p>
        <p class="title-free">PRESS START 开始白嫖 —— 完全免费</p>
        <p class="title-desc">
          OpenAI 兼容接口，兼容 /v1/chat/completions 与 /v1/responses。把你的 SDK 里的 Base URL 换成下面这个地址，不用注册、
          不用付费、不用投币，直接开局。
        </p>
        <div class="quota">
          <span class="quota-label">FREE QUOTA</span>
          <span class="quota-bar" aria-hidden="true">[████████]</span>
          <span class="quota-inf">∞</span>
          <span class="quota-note">金币 +∞ · 不扣费</span>
        </div>
      </section>

      <!-- ========== LEVEL 1 接入信息 ========== -->
      <section class="panel access">
        <div class="panel-head">
          <span class="panel-tag">LEVEL 1</span>
          <span class="panel-title">接入 API · CONNECT</span>
          <span class="panel-badge">FREE</span>
        </div>
        <p class="panel-hint">把这两行填进你的客户端配置，游戏就开始了。</p>

        <div class="kv">
          <span class="kv-label">BASE URL</span>
          <code class="kv-val">{{ r.baseUrl.value }}</code>
          <button class="btn mini" @click="r.copyText(r.baseUrl.value, $event.currentTarget)">复制</button>
        </div>
        <div class="kv">
          <span class="kv-label">API KEY</span>
          <code class="kv-val">{{ r.apiKey.value }}</code>
          <button class="btn mini" @click="r.copyText(r.apiKey.value, $event.currentTarget)">复制</button>
        </div>

        <div class="ep-list">
          <div v-for="e in endpoints" :key="e.path" class="ep">
            <span class="ep-method">{{ e.method }}</span>
            <span class="ep-path">{{ e.path }}</span>
            <span class="ep-note">{{ e.note }}</span>
          </div>
        </div>
        <p class="panel-foot">AUTH: <b>Authorization: Bearer &lt;任意字符串&gt;</b> · 空 Key 也能通关</p>
      </section>

      <!-- ========== LEVEL 2 角色选择 + 调试关卡 ========== -->
      <section class="panel">
        <div class="panel-head">
          <span class="panel-tag">LEVEL 2</span>
          <span class="panel-title">选择角色 · SELECT MODEL</span>
          <span class="panel-badge alt">ONLINE</span>
        </div>
        <div class="roster">
          <button
            v-for="(m, i) in r.models.value"
            :key="m"
            class="roster-item"
            :class="{ on: r.model.value === m }"
            @click="r.model.value = m"
          >
            <span class="roster-slot">{{ String(i + 1).padStart(2, '0') }}P</span>
            <span class="roster-name">{{ m }}</span>
            <span class="roster-state">{{ r.model.value === m ? 'SELECTED' : 'READY' }}</span>
          </button>
        </div>
        <p class="panel-foot">当前角色：<b>{{ r.model.value }}</b> · 未识别的模型名会被原样接受</p>
      </section>

      <!-- ========== LEVEL 3 调试关卡 ========== -->
      <section class="panel">
        <div class="panel-head">
          <span class="panel-tag">LEVEL 3</span>
          <span class="panel-title">调试关卡 · DEBUG ARENA</span>
          <span class="panel-badge alt">LIVE</span>
        </div>

        <div class="fields">
          <div class="field">
            <label>CHANNEL 通道</label>
            <select v-model="r.ep.value">
              <option value="chat">/v1/chat/completions</option>
              <option value="responses">/v1/responses</option>
            </select>
          </div>
          <div class="field">
            <label>MODEL 角色</label>
            <select v-model="r.model.value">
              <option v-for="m in r.models.value" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div class="field">
            <label>TOP_K 连击</label>
            <input v-model.number="r.topk.value" type="number" min="1" max="64" />
          </div>
          <div class="field">
            <label>SYSTEM 开场白</label>
            <input v-model="r.system.value" type="text" placeholder="可留空，例如：你是街机厅老板" />
          </div>
          <div class="field wide">
            <label>MESSAGE 指令</label>
            <textarea v-model="r.msg.value" rows="2" placeholder="输入一句指令，例如：你好"></textarea>
          </div>
        </div>

        <div class="controls">
          <label class="switch">
            <input v-model="r.stream.value" type="checkbox" />
            <span>STREAM 流式输出</span>
          </label>
          <button class="btn primary" :disabled="r.sending.value || !r.msg.value.trim()" @click="r.send()">
            {{ r.sending.value ? 'LOADING...' : 'START ▶ 发送请求' }}
          </button>
        </div>

        <div class="console" :class="{ err: r.stats.err }">
          <div class="console-head">
            <span class="console-led" :class="{ err: r.stats.err }"></span>
            <span class="console-title">{{ r.stats.err ? 'ERROR · 请求失败' : 'OUTPUT · 响应' }}</span>
            <span v-if="r.stats.visible" class="console-meta">
              {{ r.stats.time }} · {{ r.stats.comp }} tok · {{ r.stats.speed }}
            </span>
          </div>
          <div v-if="r.stats.visible" class="console-stats">
            <span>PROMPT <b>{{ r.stats.prompt }}</b></span>
            <span>COMP <b>{{ r.stats.comp }}</b></span>
            <span>TOTAL <b>{{ r.stats.total }}</b></span>
            <span>SPEED <b>{{ r.stats.speed }}</b></span>
          </div>
          <div v-if="r.output.meta" class="console-meta-line">{{ r.output.meta }}</div>
          <div class="console-body">{{ r.output.content }}</div>
          <div v-if="r.output.tools.length" class="console-tools">
            <span class="tools-label">TOOL CALLS</span>
            <code v-for="(t, i) in r.output.tools" :key="i" class="tool-line">
              {{ t.function?.name }} {{ t.function?.arguments }}
            </code>
          </div>
        </div>

        <p class="panel-foot">装不上客户端也能玩：先在网页上打一局，再去接自己的代码。</p>
      </section>

      <!-- ========== LEVEL 4 一行接入 ========== -->
      <section class="panel">
        <div class="panel-head">
          <span class="panel-tag">LEVEL 4</span>
          <span class="panel-title">快速接入 · 1-LINE START</span>
          <span class="panel-badge alt">CURL</span>
        </div>
        <p class="panel-hint">复制走，粘到终端里直接跑。</p>
        <CodeBlock :code="curlCode" />
      </section>

      <!-- ========== LEVEL 5 免费说明 ========== -->
      <section class="panel">
        <div class="panel-head">
          <span class="panel-tag">LEVEL 5</span>
          <span class="panel-title">为什么免费 · FREE PLAY</span>
          <span class="panel-badge">0 COIN</span>
        </div>
        <table class="compare">
          <thead>
            <tr>
              <th></th>
              <th>官方直连</th>
              <th class="here">PIXEL RELAY</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in compare" :key="c.item">
              <td class="c-item">{{ c.item }}</td>
              <td>{{ c.official }}</td>
              <td class="here">{{ c.here }}</td>
            </tr>
          </tbody>
        </table>
        <p class="note">
          本站由闲置资源与公益渠道拼起来，成本不转嫁给调用方，所以不收费、不投币、也不承诺 SLA。
          <b>GAME OVER? 不会的，本站免费。</b>
        </p>
      </section>

      <!-- ========== FAQ ========== -->
      <section class="panel faq">
        <div class="panel-head">
          <span class="panel-tag">FAQ</span>
          <span class="panel-title">常见问题 · HELP SCREEN</span>
        </div>
        <div v-for="f in faqs" :key="f.q" class="faq-item">
          <div class="faq-q">{{ f.q }}</div>
          <div class="faq-a">{{ f.a }}</div>
        </div>
      </section>
    </main>

    <footer class="footer" data-skin-footer>
      <div class="foot-line">
        <span>PIXEL RELAY · 像素中转站</span>
        <span>1 PLAYER · 0 COIN · 免费续币</span>
        <span>COIN +∞</span>
      </div>
      <p class="fine">
        本站为第三方公益中转，由第三方模型提供能力，与任何模型厂商无隶属关系；AI 输出可能出错，请自行核实。
      </p>
      <p class="fine">不承诺可用性与数据安全，请勿提交隐私或敏感信息 · 仅供学习研究与娱乐使用</p>
    </footer>
  </div>
</template>

<style scoped>
/* ================= 基础画布 ================= */
.skin{
  position:relative;min-height:100vh;width:100%;display:flex;flex-direction:column;
  background:#10102a;
  background-image:
    linear-gradient(rgba(77,208,255,.055) 1px,transparent 1px),
    linear-gradient(90deg,rgba(77,208,255,.055) 1px,transparent 1px);
  background-size:32px 32px,32px 32px;
  color:#d8e0ff;
  font-family:"Courier New",ui-monospace,"MS Gothic","MS PGothic",monospace;
  font-size:14px;line-height:1.7;letter-spacing:.03em;
  -webkit-font-smoothing:none;-moz-osx-font-smoothing:unset;
}
/* CRT 扫描线 + 屏幕暗角 */
.crt{
  position:fixed;inset:0;z-index:6;pointer-events:none;
  background:
    repeating-linear-gradient(to bottom,rgba(0,0,0,.30) 0 1px,rgba(0,0,0,0) 1px 3px),
    radial-gradient(ellipse at center,rgba(0,0,0,0) 58%,rgba(0,0,0,.34) 100%);
  mix-blend-mode:multiply;
}
.skin :is(button,input,select,textarea){font-family:inherit;letter-spacing:inherit}
.skin ::selection{background:#7cf03d;color:#10102a}

/* ================= 跑马灯顶栏 ================= */
.topbar{
  display:flex;align-items:center;justify-content:center;gap:.8rem;flex-wrap:wrap;
  padding:.5rem 1rem;background:#0a0a1e;border-bottom:4px solid #2a2a56;
  font-size:11px;letter-spacing:.12em;text-transform:uppercase;
}
.tb-free{
  background:#7cf03d;color:#10102a;font-weight:700;padding:2px 8px;
  border:2px solid #000;box-shadow:2px 2px 0 #000;
}
.tb-txt{color:#7c88c8}
.tb-coin{color:#ffd23f}

/* ================= 导航 ================= */
.nav{
  display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;
  padding:.9rem 1.4rem;background:#141438;border-bottom:4px solid #2a2a56;
}
.brand{display:flex;align-items:center;gap:.55rem}
.brand-mark{
  display:inline-block;width:6px;height:6px;background:#7cf03d;
  box-shadow:6px 0 0 #7cf03d,12px 0 0 #7cf03d,0 6px 0 #7cf03d,12px 6px 0 #7cf03d,
             6px 12px 0 #7cf03d,6px 18px 0 #4dd0ff;
}
.brand-name{font-size:15px;font-weight:700;color:#7cf03d;letter-spacing:.2em}
.brand-tag{
  font-size:11px;color:#ffd23f;border:2px solid #ffd23f;padding:1px 6px;letter-spacing:.1em;
}
.nav-right{display:flex;align-items:center;gap:1rem}
.blink{font-size:11px;color:#4dd0ff;letter-spacing:.1em;animation:blink 1.15s steps(1,end) infinite}
@keyframes blink{0%,55%{opacity:1}56%,100%{opacity:.18}}

/* ================= 布局 ================= */
.main{
  position:relative;z-index:1;flex:1;width:100%;max-width:860px;margin:0 auto;
  padding:1.8rem 1.2rem 2.6rem;
}

/* ================= 标题画面 ================= */
.title-screen{text-align:center;padding:.4rem 0 1.8rem}
.title-deco{display:flex;justify-content:center;margin-bottom:1rem}
.coin{
  width:8px;height:8px;background:#ffd23f;
  box-shadow:
    8px 0 0 #ffd23f,16px 0 0 #ffd23f,24px 0 0 #ffd23f,
    0 8px 0 #ffd23f,8px 8px 0 #fff3b0,16px 8px 0 #fff3b0,24px 8px 0 #ffd23f,32px 8px 0 #ffd23f,
    0 16px 0 #ffd23f,8px 16px 0 #fff3b0,24px 16px 0 #ffd23f,32px 16px 0 #ffd23f,
    0 24px 0 #ffd23f,8px 24px 0 #ffd23f,16px 24px 0 #ffd23f,24px 24px 0 #ffd23f,32px 24px 0 #ffd23f,
    8px 32px 0 #ffd23f,16px 32px 0 #ffd23f,24px 32px 0 #ffd23f;
  animation:bob 1.6s steps(2,end) infinite;
}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.title-top{font-size:11px;color:#ff5ea8;letter-spacing:.28em;text-transform:uppercase}
.title-main{
  margin:.4rem 0 .2rem;font-size:38px;font-weight:700;color:#7cf03d;letter-spacing:.16em;
  text-shadow:4px 4px 0 #000,8px 8px 0 rgba(255,94,168,.45);
}
.title-sub{font-size:12px;color:#8b96d8;letter-spacing:.24em}
.title-free{
  display:inline-block;margin:1.1rem 0 .9rem;padding:.45rem 1rem;
  background:#ffd23f;color:#10102a;font-weight:700;font-size:15px;letter-spacing:.08em;
  border:4px solid #000;box-shadow:4px 4px 0 #000;
}
.title-desc{max-width:620px;margin:0 auto;font-size:13px;color:#a9b4ee;line-height:1.95}
.quota{
  display:inline-flex;align-items:center;gap:.6rem;flex-wrap:wrap;justify-content:center;
  margin-top:1.3rem;padding:.5rem .9rem;background:#0a0a1e;border:4px solid #2a2a56;box-shadow:4px 4px 0 #000;
  font-size:12px;
}
.quota-label{color:#4dd0ff;letter-spacing:.16em}
.quota-bar{color:#7cf03d;letter-spacing:-.06em}
.quota-inf{color:#ffd23f;font-weight:700}
.quota-note{color:#7c88c8}

/* ================= 面板 ================= */
.panel{
  background:#181840;border:4px solid #2a2a56;box-shadow:4px 4px 0 #000;
  padding:1.1rem 1.1rem 1.2rem;margin-bottom:1.4rem;
}
.panel.access{border-color:#7cf03d;box-shadow:4px 4px 0 #000,0 0 0 4px rgba(124,240,61,.12)}
.panel-head{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:.9rem}
.panel-tag{
  background:#4dd0ff;color:#10102a;font-size:10px;font-weight:700;letter-spacing:.14em;
  padding:2px 6px;border:2px solid #000;box-shadow:2px 2px 0 #000;
}
.panel-title{font-size:13px;color:#ffd23f;letter-spacing:.14em}
.panel-badge{
  margin-left:auto;font-size:10px;color:#7cf03d;border:2px solid #7cf03d;padding:1px 6px;letter-spacing:.14em;
}
.panel-badge.alt{color:#ff5ea8;border-color:#ff5ea8}
.panel-hint{font-size:12px;color:#8b96d8;margin-bottom:.8rem}
.panel-foot{margin-top:.85rem;font-size:11px;color:#7c88c8}
.panel-foot b{color:#4dd0ff}

/* ================= 接入信息 ================= */
.kv{
  display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;
  background:#0d0d24;border:4px solid #2a2a56;padding:.5rem .7rem;margin-bottom:.6rem;
}
.kv-label{
  font-size:10px;color:#10102a;background:#4dd0ff;padding:1px 6px;letter-spacing:.14em;font-weight:700;
}
.kv-val{flex:1;min-width:180px;color:#7cf03d;font-size:12px;word-break:break-all}
.ep-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.5rem;margin:.85rem 0 .2rem}
.ep{
  display:flex;align-items:center;gap:.45rem;background:#0d0d24;border:2px solid #2a2a56;
  padding:.35rem .55rem;font-size:11px;
}
.ep-method{color:#10102a;background:#ffd23f;padding:0 4px;font-weight:700}
.ep-path{color:#d8e0ff;flex:1;word-break:break-all}
.ep-note{color:#7c88c8;font-size:10px;white-space:nowrap}

/* ================= 按钮 ================= */
.btn{
  border:4px solid #000;box-shadow:4px 4px 0 #000;padding:.42rem .9rem;
  font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;
  transition:transform .06s steps(1,end),box-shadow .06s steps(1,end);
}
.btn:hover{transform:translate(2px,2px);box-shadow:2px 2px 0 #000}
.btn:active{transform:translate(4px,4px);box-shadow:0 0 0 #000}
.btn.mini{
  border-width:2px;box-shadow:2px 2px 0 #000;padding:.22rem .55rem;font-size:11px;
  background:#ffd23f;color:#10102a;
}
.btn.mini:hover{transform:translate(1px,1px);box-shadow:1px 1px 0 #000}
.btn.mini:active{transform:translate(2px,2px);box-shadow:0 0 0 #000}
.btn.primary{background:#7cf03d;color:#10102a}
.btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:4px 4px 0 #000}

/* ================= 角色选择 ================= */
.roster{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.6rem}
.roster-item{
  display:flex;align-items:center;gap:.5rem;text-align:left;
  background:#0d0d24;border:4px solid #2a2a56;box-shadow:4px 4px 0 #000;padding:.45rem .6rem;
  font-size:12px;color:#a9b4ee;
}
.roster-item:hover{border-color:#4dd0ff;color:#d8e0ff}
.roster-item.on{background:#1d3a17;border-color:#7cf03d;color:#7cf03d}
.roster-slot{
  font-size:10px;background:#4dd0ff;color:#10102a;padding:1px 4px;font-weight:700;letter-spacing:.1em;
}
.roster-item.on .roster-slot{background:#7cf03d}
.roster-name{flex:1;word-break:break-all;letter-spacing:.04em}
.roster-state{font-size:10px;color:#7c88c8;letter-spacing:.1em}
.roster-item.on .roster-state{color:#ffd23f}

/* ================= 调试关卡表单 ================= */
.fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.8rem}
.field{display:flex;flex-direction:column;gap:.3rem}
.field.wide{grid-column:1/-1}
.field label{font-size:10px;color:#4dd0ff;letter-spacing:.14em}
.field :is(input,select,textarea){
  width:100%;background:#0d0d24;border:4px solid #2a2a56;color:#d8e0ff;
  padding:.42rem .55rem;font-size:12px;outline:none;
}
.field :is(input,select,textarea):focus{border-color:#7cf03d;background:#0a0a1e}
.field textarea{resize:vertical;min-height:60px;line-height:1.8}
.field select option{background:#0d0d24;color:#d8e0ff}
.field input[type=number]{-moz-appearance:textfield}
.controls{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-top:1rem}
.switch{display:flex;align-items:center;gap:.45rem;font-size:11px;color:#a9b4ee;letter-spacing:.1em;cursor:pointer}
.switch input{width:15px;height:15px;accent-color:#7cf03d;cursor:pointer}

/* ================= 响应控制台 ================= */
.console{margin-top:1rem;background:#08081a;border:4px solid #4dd0ff;box-shadow:4px 4px 0 #000;padding:.7rem .8rem}
.console.err{border-color:#ff5ea8}
.console-head{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;border-bottom:2px solid #2a2a56;padding-bottom:.45rem}
.console-led{
  width:8px;height:8px;background:#7cf03d;animation:pulse 1.3s steps(1,end) infinite;
}
.console-led.err{background:#ff5ea8}
@keyframes pulse{0%,50%{opacity:1}51%,100%{opacity:.25}}
.console-title{font-size:11px;color:#ffd23f;letter-spacing:.14em}
.console-meta{margin-left:auto;font-size:10px;color:#7c88c8}
.console-stats{display:flex;gap:.9rem;flex-wrap:wrap;margin-top:.5rem;font-size:10px;color:#7c88c8;letter-spacing:.08em}
.console-stats b{color:#4dd0ff;font-weight:400}
.console-meta-line{margin-top:.5rem;font-size:10px;color:#6b76b8;word-break:break-all}
.console-body{
  margin-top:.6rem;white-space:pre-wrap;word-break:break-word;
  font-size:12.5px;line-height:1.95;color:#7cf03d;min-height:2.4em;
}
.console-tools{margin-top:.7rem;border-top:2px solid #2a2a56;padding-top:.5rem}
.tools-label{display:block;font-size:10px;color:#ff5ea8;letter-spacing:.14em;margin-bottom:.35rem}
.tool-line{display:block;font-size:11px;color:#ffd23f;word-break:break-all}

/* ================= 对比表 ================= */
.compare{width:100%;border-collapse:collapse;font-size:12px;border:4px solid #2a2a56}
.compare th,.compare td{text-align:left;padding:.45rem .55rem;border:2px solid #2a2a56}
.compare th{font-size:10px;color:#4dd0ff;letter-spacing:.12em;background:#0d0d24}
.compare td{color:#a9b4ee}
.compare .c-item{color:#7c88c8;width:30%}
.compare .here{color:#7cf03d;background:#12240f}
.compare th.here{color:#10102a;background:#7cf03d}
.note{margin-top:.85rem;font-size:12px;color:#8b96d8;line-height:1.9}
.note b{color:#ffd23f}

/* ================= FAQ ================= */
.faq .panel-head{margin-bottom:.5rem}
.faq-item{padding:.6rem 0;border-bottom:2px dashed #2a2a56}
.faq-item:last-child{border-bottom:none}
.faq-q{font-size:12px;color:#ffd23f;letter-spacing:.08em;margin-bottom:.15rem}
.faq-a{font-size:12px;color:#a9b4ee;line-height:1.9}

/* ================= 页脚 ================= */
.footer{
  margin-top:auto;padding:1.4rem 1.2rem 2rem;text-align:center;
  background:#0a0a1e;border-top:4px solid #2a2a56;
}
.foot-line{
  display:flex;justify-content:center;gap:1.2rem;flex-wrap:wrap;margin-bottom:.8rem;
  font-size:11px;color:#4dd0ff;letter-spacing:.14em;
}
.fine{font-size:12px;color:#5d68a8;line-height:1.9}

/* ================= CodeBlock 像素化覆写 ================= */
:deep(.code-block){
  background:#08081a;border:4px solid #2a2a56;border-radius:0;
  color:#7cf03d;font-size:11.5px;line-height:1.85;padding:.85rem .9rem;
  font-family:"Courier New",ui-monospace,"MS Gothic",monospace;
}
:deep(.code-block pre){white-space:pre}
:deep(.copy-btn){
  background:#ffd23f;color:#10102a;border:2px solid #000;border-radius:0;
  box-shadow:2px 2px 0 #000;font-weight:700;letter-spacing:.1em;padding:.2rem .5rem;
  font-family:inherit;font-size:10px;text-transform:uppercase;
}
:deep(.copy-btn:hover){background:#7cf03d;color:#10102a;border-color:#000}

/* ================= 小屏 ================= */
@media (max-width:600px){
  .title-main{font-size:26px;letter-spacing:.1em;text-shadow:3px 3px 0 #000,5px 5px 0 rgba(255,94,168,.45)}
  .nav{padding:.8rem 1rem}
  .main{padding:1.2rem .9rem 2rem}
  .panel{padding:.9rem .85rem}
}
</style>
