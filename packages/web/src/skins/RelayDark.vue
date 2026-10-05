<script setup lang="ts">
/**
 * 皮肤 ①：RelayHub —— 深色科技风中转站（开发者向，保留全功能测试台）
 */
import { computed, ref } from 'vue';
import { useRelay } from '../relay';
import RelayTrust from '../components/RelayTrust.vue';
import { buildSamples } from '../samples';
import CodeBlock from '../components/CodeBlock.vue';
import ToolCard from '../components/ToolCard.vue';

const r = useRelay({
  placeholder: '点击「发送请求」查看结果',
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

const pricing = [
  { model: 'deepseek-flash', ctx: '1M', hit: '$0.003', miss: '$0.15', out: '$0.60' },
  { model: 'deepseek-v4-pro', ctx: '1M', hit: '$0.022', miss: '$0.66', out: '$1.98' },
];
</script>

<template>
  <div class="skin">
    <!-- 顶部滚动公告 -->
    <div class="notice">
      <div class="notice-track">
        <span>🆓 公益转发 · 免注册免密钥，直接调用 · 聚合 DeepSeek / ChatGPT / Claude / Gemini 等主流模型</span>
        <span>⚡ 多 Key 轮询 + 智能路由，上游抖动自动切换 · 实测延迟 189ms · 不排队不限并发</span>
        <span>🆓 公益转发 · 免注册免密钥，直接调用 · 聚合 DeepSeek / ChatGPT / Claude / Gemini 等主流模型</span>
        <span>⚡ 多 Key 轮询 + 智能路由，上游抖动自动切换 · 实测延迟 189ms · 不排队不限并发</span>
      </div>
    </div>

    <div class="container">
      <header class="header">
        <h1>RelayHub</h1>
        <span class="badge">v1.2.0</span>
        <span class="badge badge-open">免费 · 公益</span>
      </header>
      <p class="subtitle">免费公益中转站：聚合 ChatGPT / Claude / DeepSeek / Gemini 等主流大模型，免注册、免密钥、不限额度</p>
      <div class="pills">
        <span class="pill pill-free">免费不限额度</span>
        <span class="pill"><i class="dot"></i>99.9% 可用性</span>
        <span class="pill">实测 189ms</span>
        <span class="pill">峰值 10,000 tok/s</span>
        <span class="pill">不限并发</span>
        <span class="pill">SSE 流式</span>
        <span class="pill">Function Calling</span>
      </div>

      <section class="card">
        <div class="card-title">接入信息</div>
        <div class="endpoint"><span><span class="method">POST</span>/v1/chat/completions</span><span class="tag">聊天补全</span></div>
        <div class="endpoint"><span><span class="method">POST</span>/v1/responses</span><span class="tag">Responses API</span></div>
        <div class="endpoint"><span><span class="method">GET</span>/v1/models</span><span class="tag">模型列表</span></div>
        <div class="kv">
          <span class="kv-label">Base URL</span>
          <code>{{ r.baseUrl.value }}</code>
          <button class="btn-sm" @click="r.copyText(r.baseUrl.value, $event.currentTarget)">复制</button>
        </div>
        <div class="kv">
          <span class="kv-label">API Key</span>
          <code>{{ r.apiKey.value }}</code>
          <button class="btn-sm" @click="r.copyText(r.apiKey.value, $event.currentTarget)">复制</button>
        </div>
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

        <div v-show="activeTab === 'test'" class="panel">
          <div class="form-grid">
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
              <label>Top K</label>
              <input v-model.number="r.topk.value" type="number" min="1" max="50" />
            </div>
            <div class="field">
              <label>tool_choice</label>
              <select v-model="r.toolChoice.value">
                <option value="auto">auto</option>
                <option value="none">none</option>
                <option value="required">required</option>
              </select>
            </div>
          </div>
          <div class="field">
            <label class="check-label"><input v-model="r.stream.value" type="checkbox" /> 流式输出（SSE）</label>
          </div>
          <div class="field">
            <label>系统提示词（Responses API 时作为 instructions）</label>
            <textarea v-model="r.system.value" rows="2" placeholder="可选"></textarea>
          </div>
          <div class="field">
            <label>消息内容</label>
            <textarea v-model="r.msg.value" rows="3" placeholder="输入消息..."></textarea>
          </div>
          <div class="field">
            <label>工具定义（Tools JSON，留空则不启用 Function Calling）</label>
            <textarea
              v-model="r.toolsRaw.value"
              class="mono"
              rows="4"
              placeholder='[{"type":"function","function":{"name":"get_weather","description":"查询指定城市的天气","parameters":{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}}}]'
            ></textarea>
          </div>
          <div class="actions">
            <button class="btn-primary" :disabled="r.sending.value" @click="r.send">{{ r.sending.value ? '请求中...' : '发送请求' }}</button>
          </div>
        </div>

        <div v-show="activeTab === 'curl'">
          <template v-for="s in samples.curl" :key="s.title">
            <div class="code-title">{{ s.title }}</div>
            <CodeBlock :code="s.code" />
          </template>
        </div>

        <div v-show="activeTab === 'python'">
          <template v-for="s in samples.python" :key="s.title">
            <div class="code-title">{{ s.title }}</div>
            <CodeBlock :code="s.code" />
          </template>
        </div>

        <div v-show="activeTab === 'node'">
          <template v-for="s in samples.node" :key="s.title">
            <div class="code-title">{{ s.title }}</div>
            <CodeBlock :code="s.code" />
          </template>
        </div>

        <div v-show="activeTab === 'sdk'">
          <template v-for="s in samples.sdk" :key="s.title">
            <div class="code-title">{{ s.title }}</div>
            <CodeBlock :code="s.code" />
          </template>
        </div>

        <div v-show="activeTab === 'agents'">
          <p class="intro">本中转为 OpenAI 兼容接口，支持 Function Calling（tools）与 Responses API，主流 Agent 框架可直接接入。Base URL 与 API Key 见上方「接入信息」。</p>
          <template v-for="s in samples.agents" :key="s.title">
            <div class="code-title">{{ s.title }}</div>
            <CodeBlock :code="s.code" />
          </template>
        </div>
      </section>

      <section class="card">
        <div class="card-title">响应结果</div>
        <div class="output">
          <div v-if="r.output.meta" class="resp-meta">{{ r.output.meta }}</div>
          <div class="resp-content">{{ r.output.content }}</div>
          <div class="resp-tools">
            <ToolCard v-for="(c, i) in r.output.tools" :key="i" :call="c" />
          </div>
        </div>
        <div v-show="r.stats.visible" class="stats-bar">
          <div class="stat">耗时 <span class="val" :class="{ err: r.stats.err }">{{ r.stats.time }}</span></div>
          <div class="stat">Prompt <span class="val" :class="{ err: r.stats.err }">{{ r.stats.prompt }}</span></div>
          <div class="stat">Completion <span class="val" :class="{ err: r.stats.err }">{{ r.stats.comp }}</span></div>
          <div class="stat">Total <span class="val" :class="{ err: r.stats.err }">{{ r.stats.total }}</span></div>
          <div class="stat">速度 <span class="val" :class="{ err: r.stats.err }">{{ r.stats.speed }}</span></div>
        </div>
      </section>

      <section class="card">
        <div class="card-title">成本参考 <span class="muted">（官方价，off-peak；本服务为公益转发，不对调用方计费）</span></div>
        <table class="price">
          <thead>
            <tr><th>模型</th><th>上下文</th><th>输入（缓存命中）</th><th>输入（缓存未命中）</th><th>输出</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in pricing" :key="p.model">
              <td class="mono">{{ p.model }}</td>
              <td>{{ p.ctx }}</td>
              <td>{{ p.hit }}</td>
              <td>{{ p.miss }}</td>
              <td>{{ p.out }}</td>
            </tr>
          </tbody>
        </table>
        <p class="muted price-note">单位：每 1M tokens · 峰值时段（UTC 01:00-04:00 / 06:00-10:00 工作日）为表中 2 倍 · 价格以官方公示为准</p>
      </section>

      <RelayTrust accent="#22d3ee" accent2="#64748b" bg="rgba(15,23,42,.72)" fg="#e2e8f0" muted="#7c8aa0" grid="rgba(148,163,184,.16)" border="rgba(148,163,184,.16)" radius="12px" />

      <footer class="footer" data-skin-footer>
        RelayHub · 开源项目 · 仅供学习研究与娱乐使用 · 请勿用于商业用途<br />
        本服务为第三方转发，按《永续运营承诺》长期运营：永久免费、永久开启、永不关站
      </footer>
    </div>
  </div>
</template>

<style scoped>
.skin{
  min-height:100vh;width:100%;color:#94a3b8;
  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
  background:
    radial-gradient(900px 500px at 12% -10%,rgba(34,211,238,.16),transparent 60%),
    radial-gradient(900px 520px at 88% 0%,rgba(167,139,250,.16),transparent 62%),
    linear-gradient(180deg,#0a0f1e 0%,#080b16 100%);
  padding-bottom:2rem;
}
.notice{overflow:hidden;background:linear-gradient(90deg,rgba(34,211,238,.12),rgba(167,139,250,.12));border-bottom:1px solid rgba(34,211,238,.18)}
.notice-track{display:flex;gap:3rem;white-space:nowrap;padding:.5rem 0;font-size:.74rem;color:#7dd3fc;animation:slide 38s linear infinite}
@keyframes slide{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.container{max-width:920px;margin:0 auto;padding:2.2rem 1.25rem 0}
.header{display:flex;align-items:center;gap:.8rem;margin-bottom:.45rem}
h1{font-size:1.75rem;font-weight:700;background:linear-gradient(90deg,#22d3ee,#a78bfa);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.badge{font-size:.65rem;padding:.18rem .55rem;border-radius:99px;border:1px solid rgba(34,211,238,.35);color:#22d3ee;background:rgba(34,211,238,.08)}
.badge-open{border-color:rgba(52,211,153,.35);color:#34d399;background:rgba(52,211,153,.08)}
.subtitle{color:#64748b;font-size:.85rem;margin-bottom:.8rem;line-height:1.6}
.pills{display:flex;flex-wrap:wrap;gap:.45rem;margin-bottom:1.5rem}
.pill{display:flex;align-items:center;gap:.35rem;font-size:.68rem;color:#94a3b8;border:1px solid rgba(148,163,184,.22);border-radius:99px;padding:.2rem .6rem;background:rgba(15,23,42,.6)}
.pill-free{color:#04120c;font-weight:700;border-color:transparent;background:linear-gradient(90deg,#34d399,#22d3ee)}
.dot{width:6px;height:6px;border-radius:99px;background:#34d399;box-shadow:0 0 8px #34d399}
.card{background:rgba(15,23,42,.72);border:1px solid rgba(148,163,184,.16);border-radius:12px;padding:1.4rem;margin-bottom:1.2rem;box-shadow:0 0 0 1px rgba(34,211,238,.05),0 18px 40px rgba(2,6,23,.35)}
.card-title{font-size:.85rem;color:#cbd5e1;margin-bottom:1rem;font-weight:600}
label{display:block;font-size:.78rem;color:#7c8aa0;margin-bottom:.4rem}
input[type="text"],input[type="number"],textarea,select{width:100%;background:rgba(2,6,23,.7);border:1px solid rgba(148,163,184,.2);border-radius:8px;color:#e2e8f0;padding:.55rem .7rem;font-size:.84rem;outline:none;transition:border-color .15s}
input:focus,textarea:focus,select:focus{border-color:#22d3ee}
input[type="checkbox"]{accent-color:#22d3ee}
textarea{resize:vertical;min-height:70px}
.mono,textarea.mono{font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:1rem;margin-bottom:1rem}
.field{margin-bottom:1rem}
.check-label{display:flex;align-items:center;gap:.5rem;font-size:.8rem;color:#a9b6c9;margin:0;cursor:pointer}
.check-label input{width:auto}
.actions{margin-top:1.1rem;display:flex;gap:.9rem;align-items:center}
.btn-primary{background:linear-gradient(90deg,#22d3ee,#6366f1);color:#04121c;font-weight:700;border-radius:8px;padding:.6rem 1.3rem;font-size:.84rem}
.btn-primary:hover{filter:brightness(1.08)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}
.btn-sm{background:rgba(148,163,184,.1);color:#a9b6c9;border:1px solid rgba(148,163,184,.24);border-radius:6px;padding:.28rem .7rem;font-size:.7rem}
.btn-sm:hover{color:#e2e8f0;border-color:#22d3ee}
.endpoint{background:rgba(2,6,23,.6);border:1px solid rgba(99,102,241,.25);border-radius:8px;padding:.5rem .75rem;font-size:.78rem;color:#93c5fd;margin-bottom:.5rem;display:flex;justify-content:space-between;align-items:center;font-family:"JetBrains Mono",ui-monospace,monospace}
.method{color:#34d399;margin-right:.5rem;font-weight:700}
.tag{font-size:.62rem;color:#64748b;border:1px solid rgba(148,163,184,.22);border-radius:4px;padding:.1rem .35rem;font-family:inherit}
.kv{display:flex;align-items:center;gap:.6rem;background:rgba(2,6,23,.6);border:1px dashed rgba(99,102,241,.3);border-radius:8px;padding:.45rem .7rem;margin-top:.6rem;font-size:.72rem}
.kv-label{color:#64748b;white-space:nowrap}
.kv code{flex:1;color:#7dd3fc;font-family:"JetBrains Mono",ui-monospace,monospace;word-break:break-all}
.chips{display:flex;flex-wrap:wrap;gap:.45rem;margin-top:.8rem}
.chip{font-size:.68rem;color:#a7f3d0;background:rgba(52,211,153,.08);border:1px solid rgba(52,211,153,.25);border-radius:99px;padding:.2rem .6rem;font-family:"JetBrains Mono",ui-monospace,monospace}
.tab-bar{display:flex;flex-wrap:wrap;border-bottom:1px solid rgba(148,163,184,.16);margin-bottom:1.1rem}
.tab{padding:.5rem 1rem;font-size:.8rem;color:#64748b;cursor:pointer;border-bottom:2px solid transparent;transition:all .15s}
.tab:hover{color:#cbd5e1}
.tab.active{color:#22d3ee;border-bottom-color:#22d3ee}
.code-title{font-size:.74rem;color:#7c8aa0;margin:1rem 0 .45rem;font-weight:600}
.intro{font-size:.75rem;color:#7c8aa0;line-height:1.7;background:rgba(2,6,23,.55);border:1px solid rgba(148,163,184,.16);border-radius:8px;padding:.7rem .85rem;margin-bottom:1rem}
.output{background:rgba(2,6,23,.72);border:1px solid rgba(148,163,184,.16);border-radius:10px;padding:1.1rem;min-height:70px;max-height:440px;overflow-y:auto;font-size:.84rem;line-height:1.75;color:#cbd5e1}
.resp-meta{font-size:.68rem;color:#5b6b82;margin-bottom:.6rem;word-break:break-all;font-family:"JetBrains Mono",ui-monospace,monospace}
.resp-content{white-space:pre-wrap;word-break:break-word}
.resp-tools{margin-top:.8rem;display:flex;flex-direction:column;gap:.5rem}
.stats-bar{display:flex;flex-wrap:wrap;gap:1.1rem;padding:.6rem .9rem;background:rgba(2,6,23,.72);border:1px solid rgba(148,163,184,.16);border-top:none;border-radius:0 0 10px 10px;font-size:.72rem;color:#64748b}
.stat{display:flex;gap:.3rem;align-items:center}
.val{color:#34d399;font-family:"JetBrains Mono",ui-monospace,monospace}
.val.err{color:#f87171}
.price{width:100%;border-collapse:collapse;font-size:.76rem}
.price th,.price td{text-align:left;padding:.5rem .6rem;border-bottom:1px solid rgba(148,163,184,.12)}
.price th{color:#64748b;font-weight:600;font-size:.7rem}
.price td{color:#cbd5e1}
.price-note{margin-top:.7rem;line-height:1.6}
.muted{color:#5b6b82;font-size:.7rem}
.footer{text-align:center;font-size:.7rem;color:#3f4c60;margin:1.5rem 0 .5rem;line-height:1.8;cursor:default}
:deep(.code-block){background:rgba(2,6,23,.8);border-color:rgba(148,163,184,.18);color:#9fb3c8}
:deep(.copy-btn){background:rgba(148,163,184,.1);color:#94a3b8;border-color:rgba(148,163,184,.22)}
:deep(.tool-card){background:rgba(2,6,23,.8);border-color:rgba(34,211,238,.28)}
:deep(.tool-head){background:rgba(34,211,238,.08);border-bottom-color:rgba(34,211,238,.2)}
:deep(.tool-badge){background:#22d3ee;color:#04121c}
:deep(.tool-name){color:#34d399}
</style>
