<script setup lang="ts">
/**
 * 皮肤 ③：nexus-relay —— 终端 / 控制台风（开发者向，保留全功能测试台）
 */
import { computed, ref } from 'vue';
import { useRelay } from '../relay';
import RelayTrust from '../components/RelayTrust.vue';
import { buildSamples } from '../samples';
import CodeBlock from '../components/CodeBlock.vue';
import ToolCard from '../components/ToolCard.vue';

const r = useRelay({
  placeholder: '# 等待输入… 按 [SEND] 发送一次请求',
  message: '你好',
});

const tabs = [
  { id: 'test', label: 'test' },
  { id: 'curl', label: 'curl' },
  { id: 'python', label: 'python' },
  { id: 'node', label: 'node' },
  { id: 'sdk', label: 'sdk' },
  { id: 'agents', label: 'agents' },
];
const activeTab = ref('test');

const samples = computed(() => buildSamples(r.baseUrl.value, r.apiKey.value, r.model.value));

const bootLines = [
  'nexus-relay v4.2.1 (build 20260910)  ·  node: edge-runtime  ·  region: auto',
  'mode .................. public FREE relay — no signup, no key, no quota',
  'loading config ......... ok',
  'upstream pool ......... 12 nodes / 4 regions / rr+latency-route',
  'probe scheduler ....... every 6h  (last: 3m ago)',
  'auth mode ............. open (no key required, X-Relay-Token ignored)',
  'listen ................ /v1/chat/completions  /v1/responses  /v1/models',
];

const nodes = [
  { host: 'hkg-01', ms: 42, state: 'up' },
  { host: 'sin-02', ms: 68, state: 'up' },
  { host: 'nrt-03', ms: 91, state: 'up' },
  { host: 'lax-07', ms: 158, state: 'up' },
  { host: 'fra-05', ms: 212, state: 'warn' },
];
</script>

<template>
  <div class="skin">
    <div class="win">
      <div class="chrome">
        <span class="dots"><i></i><i></i><i></i></span>
        <span class="chrome-title">nexus-relay@edge: ~/gateway — bash — 118×36</span>
        <span class="chrome-state">● online</span>
      </div>

      <div class="body">
        <div class="boot">
          <div v-for="(l, i) in bootLines" :key="i" class="boot-line">
            <span class="ts">[{{ String(i).padStart(2, '0') }}:00.{{ String(i * 7).padStart(2, '0') }}]</span>
            <span>{{ l }}</span>
          </div>
          <div class="prompt-line">
            <span class="user">nexus@edge</span><span class="path">:~/gateway</span><span class="sig">$</span>
            <span class="cmd">relay status --verbose</span>
          </div>
        </div>

        <section class="block">
          <div class="sep">── gateway status ─────────────────────────────────────────────</div>
          <div class="grid2">
            <div class="kv"><span class="k">availability</span><span class="v ok">99.9%</span></div>
            <div class="kv"><span class="k">p50 latency</span><span class="v">189 ms</span></div>
            <div class="kv"><span class="k">concurrency</span><span class="v">unlimited</span></div>
            <div class="kv"><span class="k">stream</span><span class="v">sse</span></div>
            <div class="kv"><span class="k">tool-call</span><span class="v">enabled</span></div>
            <div class="kv"><span class="k">billing</span><span class="v ok">FREE · no quota</span></div>
          </div>
          <div class="nodes">
            <span v-for="n in nodes" :key="n.host" class="node">
              <i :class="n.state"></i>{{ n.host }} {{ n.ms }}ms
            </span>
          </div>
        </section>

        <section class="block">
          <div class="sep">── credentials ───────────────────────────────────────────────</div>
          <div class="exp">
            <span class="k">export</span> NEXUS_BASE_URL=<code>{{ r.baseUrl.value }}</code>
            <button class="btn" @click="r.copyText(r.baseUrl.value, $event.currentTarget)">[copy]</button>
          </div>
          <div class="exp">
            <span class="k">export</span> NEXUS_API_KEY=<code>{{ r.apiKey.value }}</code>
            <button class="btn" @click="r.copyText(r.apiKey.value, $event.currentTarget)">[copy]</button>
          </div>
          <div class="exp">
            <span class="k">models</span>
            <span class="models"><code v-for="m in r.models.value" :key="m">{{ m }}</code></span>
          </div>
        </section>

        <section class="block">
          <div class="tabs">
            <button
              v-for="(t, i) in tabs"
              :key="t.id"
              class="tabx"
              :class="{ active: activeTab === t.id }"
              @click="activeTab = t.id"
            >[{{ i + 1 }}] {{ t.label }}</button>
          </div>

          <div v-show="activeTab === 'test'" class="panel">
            <div class="sep">── request ───────────────────────────────────────────────────</div>
            <div class="row">
              <label>endpoint</label>
              <select v-model="r.ep.value">
                <option value="chat">/v1/chat/completions</option>
                <option value="responses">/v1/responses</option>
              </select>
            </div>
            <div class="row">
              <label>model</label>
              <select v-model="r.model.value">
                <option v-for="m in r.models.value" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
            <div class="row">
              <label>top_k</label>
              <input v-model.number="r.topk.value" type="number" min="1" max="50" />
            </div>
            <div class="row">
              <label>tool_choice</label>
              <select v-model="r.toolChoice.value">
                <option value="auto">auto</option>
                <option value="none">none</option>
                <option value="required">required</option>
              </select>
            </div>
            <div class="row">
              <label>stream</label>
              <label class="chk"><input v-model="r.stream.value" type="checkbox" /> sse on</label>
            </div>
            <div class="row col">
              <label>system</label>
              <textarea v-model="r.system.value" rows="2" placeholder="(optional)"></textarea>
            </div>
            <div class="row col">
              <label>prompt</label>
              <textarea v-model="r.msg.value" rows="3" placeholder="输入消息..."></textarea>
            </div>
            <div class="row col">
              <label>tools.json</label>
              <textarea
                v-model="r.toolsRaw.value"
                rows="4"
                placeholder='[{"type":"function","function":{"name":"get_weather","description":"查询指定城市的天气","parameters":{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}}}]'
              ></textarea>
            </div>
            <div class="prompt-line send-line">
              <span class="user">nexus@edge</span><span class="path">:~/gateway</span><span class="sig">$</span>
              <button class="btn-run" :disabled="r.sending.value" @click="r.send">
                {{ r.sending.value ? 'relay call …' : 'relay call --stream' }}
              </button>
            </div>
          </div>

          <div v-show="activeTab === 'curl'">
            <div class="sep">── curl ──────────────────────────────────────────────────────</div>
            <template v-for="s in samples.curl" :key="s.title">
              <div class="code-title"># {{ s.title }}</div>
              <CodeBlock :code="s.code" />
            </template>
          </div>

          <div v-show="activeTab === 'python'">
            <div class="sep">── python ────────────────────────────────────────────────────</div>
            <template v-for="s in samples.python" :key="s.title">
              <div class="code-title"># {{ s.title }}</div>
              <CodeBlock :code="s.code" />
            </template>
          </div>

          <div v-show="activeTab === 'node'">
            <div class="sep">── node ──────────────────────────────────────────────────────</div>
            <template v-for="s in samples.node" :key="s.title">
              <div class="code-title"># {{ s.title }}</div>
              <CodeBlock :code="s.code" />
            </template>
          </div>

          <div v-show="activeTab === 'sdk'">
            <div class="sep">── openai sdk ────────────────────────────────────────────────</div>
            <template v-for="s in samples.sdk" :key="s.title">
              <div class="code-title"># {{ s.title }}</div>
              <CodeBlock :code="s.code" />
            </template>
          </div>

          <div v-show="activeTab === 'agents'">
            <div class="sep">── agent frameworks ──────────────────────────────────────────</div>
            <p class="note"># openai-compatible · function calling (tools) · responses api · 主流 Agent 框架可直接接入</p>
            <template v-for="s in samples.agents" :key="s.title">
              <div class="code-title"># {{ s.title }}</div>
              <CodeBlock :code="s.code" />
            </template>
          </div>
        </section>

        <section class="block">
          <div class="sep">── stdout ────────────────────────────────────────────────────</div>
          <div class="stdout">
            <div v-if="r.output.meta" class="meta">{{ r.output.meta }}</div>
            <div class="out">{{ r.output.content }}</div>
            <div class="tools">
              <ToolCard v-for="(c, i) in r.output.tools" :key="i" :call="c" />
            </div>
          </div>
          <div class="statusline" :class="{ err: r.stats.err }">
            <span>TIME {{ r.stats.time }}</span>
            <span>PROMPT {{ r.stats.prompt }}</span>
            <span>COMP {{ r.stats.comp }}</span>
            <span>TOTAL {{ r.stats.total }}</span>
            <span>SPEED {{ r.stats.speed }}</span>
            <span class="cursor">▌</span>
          </div>
        </section>

        <RelayTrust accent="#34d399" accent2="#2f4453" bg="#04080b" fg="#a7c0d0" muted="#4f6472" grid="#16232b" border="#16232b" radius="6px" font="'JetBrains Mono', ui-monospace, monospace" />

        <footer class="footer" data-skin-footer>
          <span class="user">nexus@edge</span><span class="path">:~/gateway</span><span class="sig">$</span>
          <span class="dim">exit 0 — session closed · nexus-relay 仅供学习研究与娱乐使用 · 第三方转发 · 按《永续运营承诺》长期在线，永不关站</span>
          <span class="cursor">▌</span>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skin{
  min-height:100vh;width:100%;padding:1.6rem .9rem 2rem;
  font-family:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,"Cascadia Mono",monospace;
  background:
    radial-gradient(700px 380px at 20% -8%,rgba(34,211,238,.10),transparent 62%),
    radial-gradient(700px 420px at 82% 4%,rgba(167,139,250,.08),transparent 62%),
    #05070a;
  color:#8aa0b4;font-size:.8rem;
}
.win{max-width:1040px;margin:0 auto;border:1px solid #1d2b33;border-radius:8px;overflow:hidden;background:rgba(4,8,11,.9);box-shadow:0 0 0 1px rgba(34,211,238,.12),0 24px 60px rgba(0,0,0,.6)}
.chrome{display:flex;align-items:center;gap:.8rem;padding:.5rem .8rem;background:#0a1016;border-bottom:1px solid #16232b}
.dots{display:flex;gap:.35rem}
.dots i{width:10px;height:10px;border-radius:99px;background:#23323c}
.dots i:first-child{background:#ff5f57}
.dots i:nth-child(2){background:#febc2e}
.dots i:nth-child(3){background:#28c840}
.chrome-title{flex:1;text-align:center;font-size:.72rem;color:#4f6472}
.chrome-state{font-size:.68rem;color:#34d399}
.body{padding:1.1rem 1.1rem 1.4rem}
.boot-line{display:flex;gap:.7rem;font-size:.74rem;line-height:1.85;color:#5c7285}
.ts{color:#2f4453}
.prompt-line{display:flex;align-items:center;gap:.4rem;margin-top:.9rem;font-size:.8rem;flex-wrap:wrap}
.user{color:#34d399}
.path{color:#22d3ee}
.sig{color:#a78bfa}
.cmd{color:#cbd5e1}
.block{margin-top:1.5rem}
.sep{color:#2f4453;font-size:.72rem;margin-bottom:.8rem;overflow:hidden;white-space:nowrap}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.35rem .9rem}
.kv{display:flex;gap:.6rem;font-size:.76rem}
.kv .k{color:#4f6472;min-width:104px}
.kv .v{color:#cbd5e1}
.kv .v.ok{color:#34d399}
.kv .v.warn{color:#fbbf24}
.nodes{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.8rem}
.node{display:flex;align-items:center;gap:.35rem;font-size:.7rem;color:#5c7285;border:1px solid #16232b;border-radius:4px;padding:.15rem .45rem}
.node i{width:6px;height:6px;border-radius:99px;background:#34d399}
.node i.warn{background:#fbbf24}
.exp{display:flex;align-items:center;gap:.55rem;font-size:.76rem;padding:.3rem 0;flex-wrap:wrap}
.exp .k{color:#a78bfa}
.exp code{color:#7dd3fc;word-break:break-all}
.exp .models{display:flex;gap:.5rem;flex-wrap:wrap}
.btn{color:#64748b;border:1px solid #1d2b33;border-radius:4px;padding:.1rem .45rem;font-size:.68rem;background:transparent}
.btn:hover{color:#22d3ee;border-color:#22d3ee}
.tabs{display:flex;flex-wrap:wrap;gap:.5rem;margin:1.1rem 0 .9rem}
.tabx{font-size:.74rem;color:#4f6472;border:1px solid transparent;border-radius:4px;padding:.15rem .4rem}
.tabx:hover{color:#8aa0b4}
.tabx.active{color:#22d3ee;border-color:#1d2b33;background:rgba(34,211,238,.07)}
.row{display:grid;grid-template-columns:120px 1fr;gap:.7rem;align-items:center;margin-bottom:.6rem}
.row.col{grid-template-columns:1fr;align-items:start}
.row label{color:#4f6472;font-size:.74rem}
input[type="text"],input[type="number"],textarea,select{width:100%;background:#04080b;border:1px solid #16232b;border-radius:4px;color:#cbd5e1;padding:.42rem .55rem;font-size:.76rem;font-family:inherit;outline:none}
input:focus,textarea:focus,select:focus{border-color:#22d3ee}
input[type="checkbox"]{accent-color:#22d3ee;width:auto}
textarea{resize:vertical;min-height:62px}
.chk{display:flex;align-items:center;gap:.4rem;color:#8aa0b4;font-size:.76rem;cursor:pointer}
.send-line{margin-top:1rem}
.btn-run{border:1px solid #22d3ee;color:#22d3ee;border-radius:4px;padding:.32rem .8rem;font-size:.76rem;background:rgba(34,211,238,.07);font-family:inherit}
.btn-run:hover{background:rgba(34,211,238,.16)}
.btn-run:disabled{opacity:.5;cursor:progress}
.code-title{font-size:.72rem;color:#4f6472;margin:.9rem 0 .4rem}
.note{font-size:.72rem;color:#4f6472;line-height:1.7;margin-bottom:.8rem}
.stdout{background:#04080b;border:1px solid #16232b;border-radius:6px;padding:.85rem;min-height:60px;max-height:420px;overflow-y:auto;font-size:.78rem;line-height:1.8;color:#a7c0d0}
.meta{color:#3f5566;font-size:.68rem;margin-bottom:.5rem;word-break:break-all}
.out{white-space:pre-wrap;word-break:break-word}
.tools{margin-top:.7rem;display:flex;flex-direction:column;gap:.5rem}
.statusline{display:flex;flex-wrap:wrap;gap:1rem;background:#0a1016;border:1px solid #16232b;border-top:none;border-radius:0 0 6px 6px;padding:.4rem .8rem;font-size:.7rem;color:#4f6472}
.statusline.err{color:#f87171}
.cursor{color:#34d399;animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.footer{margin-top:1.4rem;font-size:.74rem;display:flex;gap:.4rem;align-items:center;flex-wrap:wrap;cursor:default}
.dim{color:#2f4453}
:deep(.code-block){background:#04080b;border-color:#16232b;color:#9fb3c8}
:deep(.copy-btn){background:#0a1016;color:#64748b;border-color:#1d2b33;font-family:inherit}
:deep(.tool-card){background:#04080b;border-color:#1d3b33}
:deep(.tool-head){background:#0a1016;border-bottom-color:#16232b}
:deep(.tool-badge){background:#34d399;color:#04120c}
:deep(.tool-name){color:#22d3ee}
:deep(.tool-args){color:#8aa0b4}
</style>
