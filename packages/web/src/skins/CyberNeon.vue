<script setup lang="ts">
/**
 * 皮肤 ⑤：NIGHTFERRY · 夜航中转 —— 赛博朋克霓虹风，黑市网关气质。
 * 全功能（FULL）：测试台 / 6 个接入 Tab / 工具调用可视化 / 用量统计，全部套在霓虹外壳里。
 */
import { computed, ref } from 'vue';
import { useRelay } from '../relay';
import RelayTrust from '../components/RelayTrust.vue';
import { buildSamples } from '../samples';
import CodeBlock from '../components/CodeBlock.vue';
import ToolCard from '../components/ToolCard.vue';

const r = useRelay({
  placeholder: '// 网关待命，按下 SEND 取回响应',
  message: '你好',
});

const tabs = [
  { id: 'test', label: '测试' },
  { id: 'curl', label: 'cURL' },
  { id: 'python', label: 'Python' },
  { id: 'node', label: 'Node.js' },
  { id: 'sdk', label: 'OpenAI SDK' },
  { id: 'agents', label: 'Agent 接入' },
];
const activeTab = ref('test');

const samples = computed(() => buildSamples(r.baseUrl.value, r.apiKey.value, r.model.value));

const nodes = [
  { name: 'edge · hkg', load: '12%' },
  { name: 'edge · sin', load: '31%' },
  { name: 'edge · lax', load: '08%' },
];

const faqs = [
  {
    q: '真的免费吗？',
    a: '免费。转发链路不向调用方计费，不做额度截断，也不会在月底给你寄账单。上游是公益池和闲置算力，成本不落在你头上。',
  },
  {
    q: '要注册，或者申请 Key 吗？',
    a: '都不用。页面上那串 sk- 是本地生成的，网关不校验它——你填任意字符串照样放行。',
  },
  {
    q: '会不会突然关站？',
    a: '不会。本站已签署《永续运营承诺》：永久免费、永久开启、永不关站；真到必须迁移那天，提前 180 天公告。',
  },
  {
    q: '有并发或速率限制吗？',
    a: '没有硬性限速。节点打满时会排队或甩 503，退避重试一次通常就通了。',
  },
];
</script>

<template>
  <div class="skin">
    <div class="scan" aria-hidden="true"></div>

    <!-- 首屏公告：完全免费 -->
    <div class="alert">
      <span class="alert-strong">完全免费</span>
      <span class="alert-sep">//</span>
      <span class="alert-text">公网网关已开 · 无 key 直连 · 免费配额：无限</span>
      <span class="alert-right"><i></i>节点全开</span>
    </div>

    <header class="hud">
      <div class="logo">
        <span class="logo-mark">◤</span>
        <span class="logo-name">NIGHTFERRY</span>
        <span class="logo-tag">夜航中转</span>
        <span class="logo-ver">v2.7.1</span>
      </div>
      <div class="hud-right">
        <span class="uptime">uptime 41d 06h</span>
        <span class="online"><i></i>ONLINE</span>
      </div>
    </header>

    <main class="wrap">
      <section class="hero">
        <h1 class="glitch" data-text="NIGHTFERRY">NIGHTFERRY</h1>
        <p class="hero-sub">
          公网侧的中转网关。OpenAI 兼容接口，免注册、免密钥、不计量。
          把你 SDK 里的 Base URL 指过来，别的什么都别动。
        </p>
        <div class="tags">
          <span class="tag tag-hot">免费配额：无限</span>
          <span class="tag">无 key 直连</span>
          <span class="tag">节点全开</span>
          <span class="tag">SSE 流式</span>
          <span class="tag">Function Calling</span>
          <span class="tag">延迟 182ms</span>
        </div>
      </section>

      <section class="card card-access">
        <div class="card-head">
          <span class="card-title">接入信息</span>
          <span class="card-badge">无需注册</span>
        </div>

        <div class="kv">
          <span class="kv-label">BASE_URL</span>
          <code>{{ r.baseUrl.value }}</code>
          <button class="mini" @click="r.copyText(r.baseUrl.value, $event.currentTarget)">复制</button>
        </div>
        <div class="kv">
          <span class="kv-label">API_KEY</span>
          <code>{{ r.apiKey.value }}</code>
          <button class="mini" @click="r.copyText(r.apiKey.value, $event.currentTarget)">复制</button>
        </div>

        <div class="endpoints">
          <div class="endpoint">
            <span class="method">POST</span>
            <span class="path">/v1/chat/completions</span>
            <span class="ep-tag">聊天补全</span>
          </div>
          <div class="endpoint">
            <span class="method">POST</span>
            <span class="path">/v1/responses</span>
            <span class="ep-tag">Responses API</span>
          </div>
          <div class="endpoint">
            <span class="method method-get">GET</span>
            <span class="path">/v1/models</span>
            <span class="ep-tag">模型列表</span>
          </div>
        </div>

        <div class="block-label">// 在售节点（自动路由）</div>
        <div class="nodes">
          <span v-for="n in nodes" :key="n.name" class="node">
            <i></i>{{ n.name }}<b>{{ n.load }}</b>
          </span>
        </div>

        <div class="block-label">// 可用模型</div>
        <div class="chips">
          <span v-for="m in r.models.value" :key="m" class="chip">{{ m }}</span>
        </div>
      </section>

      <section class="card">
        <div class="tab-bar">
          <div
            v-for="t in tabs"
            :key="t.id"
            class="tab"
            :class="{ active: activeTab === t.id }"
            @click="activeTab = t.id"
          >{{ t.label }}</div>
        </div>

        <!-- 测试台 -->
        <div v-show="activeTab === 'test'" class="panel">
          <div class="grid">
            <div class="field">
              <label>接口通道</label>
              <select v-model="r.ep.value">
                <option value="chat">/v1/chat/completions</option>
                <option value="responses">/v1/responses</option>
              </select>
            </div>
            <div class="field">
              <label>模型</label>
              <select v-model="r.model.value">
                <option v-for="m in r.models.value" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
            <div class="field">
              <label>TOP_K</label>
              <input v-model.number="r.topk.value" type="number" min="1" max="50" />
            </div>
            <div class="field">
              <label>TOOL_CHOICE</label>
              <select v-model="r.toolChoice.value">
                <option value="auto">auto</option>
                <option value="none">none</option>
                <option value="required">required</option>
              </select>
            </div>
          </div>

          <div class="field">
            <label class="check"><input v-model="r.stream.value" type="checkbox" /> 流式输出（SSE）</label>
          </div>

          <div class="field">
            <label>系统提示词（走 Responses API 时作 instructions）</label>
            <textarea v-model="r.system.value" rows="2" placeholder="留空即不注入 system"></textarea>
          </div>

          <div class="field">
            <label>消息内容</label>
            <textarea v-model="r.msg.value" rows="3" placeholder="输入要送进网关的内容"></textarea>
          </div>

          <div class="field">
            <label>工具定义（Tools JSON，留空则关闭 Function Calling）</label>
            <textarea
              v-model="r.toolsRaw.value"
              class="mono"
              rows="4"
              placeholder='[{"type":"function","function":{"name":"get_weather","description":"查询指定城市的天气","parameters":{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}}}]'
            ></textarea>
          </div>

          <div class="actions">
            <button class="btn-primary" :disabled="r.sending.value" @click="r.send()">
              {{ r.sending.value ? '链路传输中…' : 'SEND ▸ 发送请求' }}
            </button>
            <span class="hint">网关不记账，随便打。</span>
          </div>

          <div class="console">
            <div class="console-head">
              <span class="dot" :class="{ err: r.stats.err }"></span>
              <span class="console-title">{{ r.stats.err ? 'LINK FAILED' : 'RESPONSE' }}</span>
              <span class="console-path">{{ r.ep.value === 'chat' ? '/v1/chat/completions' : '/v1/responses' }}</span>
            </div>
            <div v-if="r.output.meta" class="console-meta">{{ r.output.meta }}</div>
            <div class="console-body">{{ r.output.content }}<span v-if="r.sending.value" class="caret">█</span></div>
            <div v-if="r.output.tools.length" class="tool-list">
              <ToolCard v-for="(c, i) in r.output.tools" :key="i" :call="c" />
            </div>
          </div>

          <div v-show="r.stats.visible" class="stats">
            <span class="stat">TIME <b :class="{ err: r.stats.err }">{{ r.stats.time }}</b></span>
            <span class="stat">PROMPT <b :class="{ err: r.stats.err }">{{ r.stats.prompt }}</b></span>
            <span class="stat">COMP <b :class="{ err: r.stats.err }">{{ r.stats.comp }}</b></span>
            <span class="stat">TOTAL <b :class="{ err: r.stats.err }">{{ r.stats.total }}</b></span>
            <span class="stat">SPEED <b :class="{ err: r.stats.err }">{{ r.stats.speed }}</b></span>
          </div>
        </div>

        <div v-show="activeTab === 'curl'" class="panel">
          <p class="intro">三个接口任选。Base URL 与 API Key 都在上方「接入信息」里，直接抄。</p>
          <template v-for="s in samples.curl" :key="s.title">
            <div class="code-title">{{ s.title }}</div>
            <CodeBlock :code="s.code" />
          </template>
        </div>

        <div v-show="activeTab === 'python'" class="panel">
          <p class="intro">requests 直接打，不需要装 openai 包。</p>
          <template v-for="s in samples.python" :key="s.title">
            <div class="code-title">{{ s.title }}</div>
            <CodeBlock :code="s.code" />
          </template>
        </div>

        <div v-show="activeTab === 'node'" class="panel">
          <p class="intro">原生 fetch，Node 18+ 直接跑。</p>
          <template v-for="s in samples.node" :key="s.title">
            <div class="code-title">{{ s.title }}</div>
            <CodeBlock :code="s.code" />
          </template>
        </div>

        <div v-show="activeTab === 'sdk'" class="panel">
          <p class="intro">官方 SDK 只改 base_url / baseURL，api_key 填页面上那串即可。</p>
          <template v-for="s in samples.sdk" :key="s.title">
            <div class="code-title">{{ s.title }}</div>
            <CodeBlock :code="s.code" />
          </template>
        </div>

        <div v-show="activeTab === 'agents'" class="panel">
          <p class="intro">
            网关是 OpenAI 兼容的，tools 与 Responses API 都通，Agent 框架基本可以无缝认领。
            模型名写官方的就行，认不出来的名字会原样透传。
          </p>
          <template v-for="s in samples.agents" :key="s.title">
            <div class="code-title">{{ s.title }}</div>
            <CodeBlock :code="s.code" />
          </template>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <span class="card-title">FAQ</span>
          <span class="card-badge card-badge-dim">4 条，读完再问</span>
        </div>
        <div v-for="f in faqs" :key="f.q" class="faq">
          <div class="faq-q"><span class="faq-mark">?</span>{{ f.q }}</div>
          <div class="faq-a">{{ f.a }}</div>
        </div>
      </section>

      <RelayTrust accent="#00fff0" accent2="#6b2a5a" bg="rgba(10,0,24,.72)" fg="#e6d9ff" muted="#8a7fa8" grid="rgba(0,255,240,.14)" border="rgba(255,45,149,.28)" radius="4px" />

      <footer class="footer" data-skin-footer>
        <p>NIGHTFERRY · 夜航中转 —— 第三方转发，非官方服务，AI 输出可能出错，请自行核实</p>
        <p class="fine">长期运营 · 永久免费 · 如遇不可抗力将提前 180 天公告 · 仅供学习研究与娱乐使用 · 请勿用于商业或违法用途</p>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.skin{
  position:relative;min-height:100vh;width:100%;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
  background:
    radial-gradient(760px 420px at 8% -8%,rgba(255,45,149,.20),transparent 62%),
    radial-gradient(760px 460px at 94% 2%,rgba(0,255,240,.15),transparent 62%),
    linear-gradient(180deg,#0a0018 0%,#0b0320 45%,#07000f 100%);
  color:#cbb9e6;
  padding-bottom:1.5rem;
}
/* 细扫描线 + 冷光晕，纯 CSS，不影响交互 */
.scan{
  position:fixed;inset:0;z-index:0;pointer-events:none;
  background:repeating-linear-gradient(to bottom,rgba(0,255,240,.045) 0 1px,rgba(0,0,0,0) 1px 3px);
  mix-blend-mode:screen;
}
.scan::after{
  content:"";position:absolute;left:0;right:0;height:160px;
  background:linear-gradient(180deg,rgba(255,45,149,0),rgba(255,45,149,.06),rgba(255,45,149,0));
  animation:beam 7.5s linear infinite;
}
@keyframes beam{0%{top:-15%}100%{top:105%}}

.alert{
  position:relative;z-index:1;display:flex;align-items:center;justify-content:center;
  gap:.55rem;flex-wrap:wrap;padding:.55rem 1rem;font-size:.76rem;
  background:linear-gradient(90deg,rgba(255,45,149,.16),rgba(0,255,240,.14));
  border-bottom:1px solid rgba(255,45,149,.45);
  box-shadow:0 0 18px rgba(255,45,149,.28) inset;
}
.alert-strong{
  color:#fff;font-weight:700;letter-spacing:.14em;font-size:.78rem;
  text-shadow:0 0 8px #ff2d95,0 0 18px rgba(255,45,149,.7);
}
.alert-sep{color:#ff2d95}
.alert-text{color:#9ff6ef;text-shadow:0 0 8px rgba(0,255,240,.5)}
.alert-right{
  display:flex;align-items:center;gap:.35rem;color:#00fff0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  font-size:.7rem;letter-spacing:.1em;
}
.alert-right i{width:6px;height:6px;border-radius:50%;background:#00fff0;box-shadow:0 0 8px #00fff0;animation:blink 1.4s steps(2,end) infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}

.hud{
  position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;
  gap:1rem;flex-wrap:wrap;max-width:960px;margin:0 auto;padding:1.15rem 1.3rem .7rem;
}
.logo{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap}
.logo-mark{color:#ff2d95;font-size:1rem;text-shadow:0 0 10px #ff2d95}
.logo-name{
  font-weight:800;font-size:1.02rem;letter-spacing:.22em;color:#fff;
  text-shadow:0 0 6px rgba(0,255,240,.85),0 0 16px rgba(0,255,240,.45),2px 0 0 rgba(255,45,149,.6);
}
.logo-tag{font-size:.63rem;color:#ffb3dc;border:1px solid rgba(255,45,149,.5);border-radius:2px;padding:.1rem .4rem;letter-spacing:.08em;background:rgba(255,45,149,.1)}
.logo-ver{font-size:.62rem;color:#6c5a8c;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.hud-right{display:flex;align-items:center;gap:.9rem;font-size:.68rem;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.uptime{color:#6c5a8c}
.online{display:flex;align-items:center;gap:.35rem;color:#00fff0;letter-spacing:.12em}
.online i{width:6px;height:6px;border-radius:50%;background:#00fff0;box-shadow:0 0 8px #00fff0;animation:blink 1.9s steps(2,end) infinite}

.wrap{position:relative;z-index:1;max-width:960px;margin:0 auto;padding:.6rem 1.3rem 0}

.hero{padding:.9rem 0 1.7rem;text-align:center}
.glitch{
  position:relative;display:inline-block;font-size:2.5rem;font-weight:800;letter-spacing:.14em;
  color:#fff;text-shadow:0 0 14px rgba(0,255,240,.6),0 0 40px rgba(0,255,240,.28);
}
.glitch::before,.glitch::after{
  content:attr(data-text);position:absolute;left:0;top:0;width:100%;overflow:hidden;
}
.glitch::before{color:#ff2d95;text-shadow:0 0 12px rgba(255,45,149,.8);animation:gl-top 3.6s steps(1,end) infinite}
.glitch::after{color:#00fff0;text-shadow:0 0 12px rgba(0,255,240,.8);animation:gl-bot 2.9s steps(1,end) infinite}
@keyframes gl-top{
  0%,100%{clip-path:inset(0 0 62% 0);transform:translate(-2px,-1px)}
  22%{clip-path:inset(14% 0 46% 0);transform:translate(2px,1px)}
  44%{clip-path:inset(4% 0 72% 0);transform:translate(-3px,0)}
  66%{clip-path:inset(30% 0 32% 0);transform:translate(3px,-1px)}
  84%{clip-path:inset(8% 0 58% 0);transform:translate(-1px,1px)}
}
@keyframes gl-bot{
  0%,100%{clip-path:inset(66% 0 0 0);transform:translate(2px,1px)}
  26%{clip-path:inset(50% 0 12% 0);transform:translate(-2px,-1px)}
  48%{clip-path:inset(74% 0 2% 0);transform:translate(3px,0)}
  70%{clip-path:inset(38% 0 26% 0);transform:translate(-3px,1px)}
  88%{clip-path:inset(58% 0 6% 0);transform:translate(1px,-1px)}
}
.hero-sub{margin-top:.85rem;color:#8f7bb0;font-size:.86rem;line-height:1.85;max-width:620px;margin-left:auto;margin-right:auto}
.tags{display:flex;flex-wrap:wrap;gap:.4rem;justify-content:center;margin-top:1.05rem}
.tag{
  font-size:.68rem;color:#a48fc4;border:1px solid rgba(164,143,196,.3);border-radius:2px;
  padding:.22rem .6rem;background:rgba(20,6,40,.6);
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
.tag-hot{
  color:#0a0018;font-weight:700;border-color:transparent;
  background:linear-gradient(90deg,#ff2d95,#00fff0);box-shadow:0 0 14px rgba(255,45,149,.55);
}

.card{
  position:relative;background:rgba(14,2,30,.78);border:1px solid rgba(255,45,149,.32);border-radius:4px;
  padding:1.25rem;margin-bottom:1.15rem;
  box-shadow:0 0 0 1px rgba(0,255,240,.06) inset,0 0 20px rgba(255,45,149,.14),0 14px 34px rgba(0,0,0,.5);
}
.card-access{border-color:rgba(0,255,240,.4);box-shadow:0 0 0 1px rgba(255,45,149,.08) inset,0 0 22px rgba(0,255,240,.16),0 14px 34px rgba(0,0,0,.5)}
.card-head{display:flex;align-items:center;justify-content:space-between;gap:.8rem;margin-bottom:1rem;flex-wrap:wrap}
.card-title{
  font-size:.82rem;font-weight:700;color:#fff;letter-spacing:.14em;
  text-shadow:0 0 8px rgba(0,255,240,.5);
}
.card-badge{
  font-size:.62rem;color:#0a0018;font-weight:700;letter-spacing:.08em;
  background:#00fff0;border-radius:2px;padding:.12rem .45rem;
}
.card-badge-dim{background:transparent;color:#a48fc4;border:1px solid rgba(164,143,196,.35)}

.kv{
  display:flex;align-items:center;gap:.6rem;background:rgba(6,0,16,.8);
  border:1px dashed rgba(0,255,240,.35);border-radius:3px;padding:.5rem .7rem;margin-bottom:.55rem;font-size:.74rem;
}
.kv-label{color:#6c5a8c;white-space:nowrap;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.08em}
.kv code{flex:1;color:#00fff0;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;text-shadow:0 0 9px rgba(0,255,240,.4)}
.mini{
  font-size:.68rem;color:#ff2d95;background:rgba(255,45,149,.1);border:1px solid rgba(255,45,149,.45);
  border-radius:2px;padding:.2rem .6rem;letter-spacing:.06em;white-space:nowrap;
}
.mini:hover{background:rgba(255,45,149,.25);color:#fff;box-shadow:0 0 10px rgba(255,45,149,.5)}

.endpoints{display:flex;flex-direction:column;gap:.4rem;margin-top:.8rem}
.endpoint{
  display:flex;align-items:center;gap:.55rem;background:rgba(6,0,16,.7);
  border:1px solid rgba(164,143,196,.22);border-left:2px solid #ff2d95;border-radius:2px;padding:.42rem .65rem;font-size:.74rem;
}
.method{
  font-size:.62rem;font-weight:700;color:#0a0018;background:#ff2d95;border-radius:2px;padding:.1rem .35rem;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
.method-get{background:#00fff0}
.path{color:#d8c9f2;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.ep-tag{margin-left:auto;font-size:.62rem;color:#6c5a8c}

.block-label{margin:.95rem 0 .5rem;font-size:.68rem;color:#6c5a8c;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.06em}
.nodes{display:flex;flex-wrap:wrap;gap:.45rem}
.node{
  display:flex;align-items:center;gap:.4rem;font-size:.68rem;color:#a48fc4;
  border:1px solid rgba(0,255,240,.22);border-radius:2px;padding:.2rem .55rem;background:rgba(0,255,240,.05);
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
.node i{width:5px;height:5px;border-radius:50%;background:#00fff0;box-shadow:0 0 6px #00fff0;animation:blink 2.3s steps(2,end) infinite}
.node b{color:#00fff0;font-weight:600}

.chips{display:flex;flex-wrap:wrap;gap:.45rem}
.chip{
  font-size:.68rem;color:#ffb3dc;background:rgba(255,45,149,.1);border:1px solid rgba(255,45,149,.4);
  border-radius:2px;padding:.2rem .55rem;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  box-shadow:0 0 10px rgba(255,45,149,.14);
}

.tab-bar{display:flex;flex-wrap:wrap;gap:.25rem;border-bottom:1px solid rgba(255,45,149,.25);margin-bottom:1.1rem}
.tab{
  padding:.48rem .95rem;font-size:.78rem;color:#6c5a8c;cursor:pointer;letter-spacing:.04em;
  border:1px solid transparent;border-bottom:2px solid transparent;transition:color .15s,text-shadow .15s;
}
.tab:hover{color:#cbb9e6}
.tab.active{
  color:#0a0018;font-weight:700;background:linear-gradient(180deg,rgba(0,255,240,.9),rgba(0,255,240,.65));
  border-bottom-color:#ff2d95;box-shadow:0 0 16px rgba(0,255,240,.45);
}

.panel{padding-top:.15rem}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.9rem;margin-bottom:.35rem}
.field{margin-bottom:.85rem}
label{display:block;font-size:.72rem;color:#8f7bb0;margin-bottom:.35rem;letter-spacing:.04em}
input[type="text"],input[type="number"],textarea,select{
  width:100%;background:rgba(6,0,16,.85);border:1px solid rgba(164,143,196,.28);border-radius:2px;color:#eadcff;
  padding:.5rem .65rem;font-size:.82rem;outline:none;transition:border-color .15s,box-shadow .15s;
}
input:focus,textarea:focus,select:focus{border-color:#00fff0;box-shadow:0 0 12px rgba(0,255,240,.32)}
input[type="checkbox"]{accent-color:#ff2d95;width:auto}
textarea{resize:vertical;min-height:66px;line-height:1.65}
.mono,textarea.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.74rem}
.check{display:flex;align-items:center;gap:.45rem;font-size:.76rem;color:#a48fc4;margin:0;cursor:pointer}
.check input{width:auto}

.actions{display:flex;align-items:center;gap:.9rem;flex-wrap:wrap;margin-top:.9rem}
.btn-primary{
  background:linear-gradient(90deg,#ff2d95,#00fff0);color:#0a0018;font-weight:800;letter-spacing:.1em;
  border-radius:2px;padding:.6rem 1.3rem;font-size:.8rem;box-shadow:0 0 18px rgba(255,45,149,.5);
}
.btn-primary:hover{filter:brightness(1.12);box-shadow:0 0 24px rgba(0,255,240,.55)}
.btn-primary:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}
.hint{font-size:.68rem;color:#6c5a8c}

.console{
  margin-top:1.15rem;background:rgba(4,0,12,.9);border:1px solid rgba(0,255,240,.28);border-radius:3px;
  padding:.85rem 1rem;min-height:78px;max-height:420px;overflow-y:auto;
  box-shadow:0 0 18px rgba(0,255,240,.1) inset;
}
.console-head{display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem}
.dot{width:6px;height:6px;border-radius:50%;background:#00fff0;box-shadow:0 0 8px #00fff0}
.dot.err{background:#ff2d95;box-shadow:0 0 8px #ff2d95}
.console-title{font-size:.68rem;font-weight:700;color:#00fff0;letter-spacing:.14em;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.console-path{margin-left:auto;font-size:.64rem;color:#6c5a8c;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.console-meta{font-size:.66rem;color:#6c5a8c;word-break:break-all;margin-bottom:.5rem;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.console-body{white-space:pre-wrap;word-break:break-word;font-size:.84rem;line-height:1.85;color:#e2d5ff}
.caret{color:#ff2d95;animation:blink .9s steps(2,end) infinite;margin-left:2px}
.tool-list{margin-top:.85rem;display:flex;flex-direction:column;gap:.55rem}

.stats{
  display:flex;flex-wrap:wrap;gap:1rem;margin-top:.6rem;padding:.5rem .8rem;
  background:rgba(6,0,16,.8);border:1px solid rgba(164,143,196,.22);border-radius:3px;
  font-size:.66rem;color:#6c5a8c;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.06em;
}
.stat b{color:#00fff0;font-weight:600;text-shadow:0 0 8px rgba(0,255,240,.4)}
.stat b.err{color:#ff2d95;text-shadow:0 0 8px rgba(255,45,149,.4)}

.intro{
  font-size:.74rem;color:#8f7bb0;line-height:1.75;background:rgba(6,0,16,.7);
  border-left:2px solid #00fff0;border-radius:2px;padding:.6rem .8rem;margin-bottom:1rem;
}
.code-title{
  font-size:.72rem;color:#ffb3dc;margin:.95rem 0 .4rem;font-weight:600;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.04em;
}

.faq{padding:.6rem 0;border-bottom:1px solid rgba(164,143,196,.14)}
.faq:last-child{border-bottom:none;padding-bottom:0}
.faq-q{display:flex;align-items:center;gap:.5rem;font-size:.82rem;color:#fff;font-weight:600;margin-bottom:.25rem}
.faq-mark{
  color:#0a0018;background:#ff2d95;border-radius:2px;width:15px;height:15px;flex:0 0 15px;
  display:flex;align-items:center;justify-content:center;font-size:.62rem;font-weight:800;
}
.faq-a{font-size:.78rem;color:#8f7bb0;line-height:1.85;padding-left:1.35rem}

.footer{
  text-align:center;font-size:12px;line-height:1.95;color:#6c5a8c;
  padding:1.6rem .5rem 1.8rem;border-top:1px solid rgba(255,45,149,.2);margin-top:1.4rem;cursor:default;
}
.fine{font-size:12px;color:#54456e}

:deep(.code-block){
  background:rgba(4,0,12,.92);border-color:rgba(0,255,240,.28);color:#b9a6dd;border-radius:3px;
  box-shadow:0 0 16px rgba(0,255,240,.08) inset;
}
:deep(.copy-btn){background:rgba(255,45,149,.12);color:#ff2d95;border-color:rgba(255,45,149,.4);border-radius:2px}
:deep(.copy-btn:hover){background:rgba(255,45,149,.28);color:#fff}
:deep(.tool-card){background:rgba(4,0,12,.92);border-color:rgba(0,255,240,.32);border-radius:3px}
:deep(.tool-head){background:rgba(0,255,240,.08);border-bottom-color:rgba(0,255,240,.22)}
:deep(.tool-badge){background:#ff2d95;color:#0a0018;border-radius:2px;font-weight:700}
:deep(.tool-name){color:#00fff0;text-shadow:0 0 8px rgba(0,255,240,.4)}
:deep(.tool-args){color:#b9a6dd;background:transparent}
</style>
