<script setup lang="ts">
/**
 * 皮肤 ⑪：RELAY. —— 瑞士国际主义极简（全功能）
 *
 * 纯白底、纯黑字、唯一强调色红（只占极小面积）、严格网格与 1px 实线、
 * 零圆角、零阴影、编号系统（左栏 01/02/03 + 右栏内容）。
 */
import { computed, ref } from 'vue';
import { useRelay } from '../relay';
import RelayTrust from '../components/RelayTrust.vue';
import { buildSamples } from '../samples';
import CodeBlock from '../components/CodeBlock.vue';
import ToolCard from '../components/ToolCard.vue';

const r = useRelay({
  placeholder: '尚无响应。发送一次请求以查看结果。',
  message: '你好',
  stream: true,
});

const tabs = [
  { id: 'test', num: '01', label: '测试', en: 'TEST' },
  { id: 'curl', num: '02', label: 'cURL', en: 'CURL' },
  { id: 'python', num: '03', label: 'Python', en: 'PYTHON' },
  { id: 'node', num: '04', label: 'Node.js', en: 'NODE' },
  { id: 'sdk', num: '05', label: 'OpenAI SDK', en: 'SDK' },
  { id: 'agents', num: '06', label: 'Agent 接入', en: 'AGENT' },
];
const activeTab = ref('test');

const samples = computed(() => buildSamples(r.baseUrl.value, r.apiKey.value, r.model.value));

const endpoints = [
  { method: 'POST', path: '/v1/chat/completions', cn: '对话补全', en: 'CHAT' },
  { method: 'POST', path: '/v1/responses', cn: 'Responses API', en: 'RESPONSES' },
  { method: 'GET', path: '/v1/models', cn: '模型列表', en: 'MODELS' },
];

const specs = [
  { k: '价格', v: '¥0' },
  { k: '注册', v: '不需要' },
  { k: '额度', v: '不限' },
  { k: '并发', v: '不限' },
  { k: '数据保留', v: '0 天' },
  { k: '服务等级', v: '99.9%' },
];

const clients = [
  'OpenAI SDK', 'LangChain', 'LlamaIndex', 'Dify', 'Cherry Studio',
  'NextChat', 'OpenCode', 'Codex', 'Cline', 'Continue',
];

const faqs = [
  {
    q: '是否真的免费。',
    a: '是。本站不向调用方计费，也不设额度。费用由上游免费渠道与闲置资源承担。',
  },
  {
    q: '是否需要注册。',
    a: '不需要。页面上的 API Key 由浏览器本地生成，仅用于通过鉴权格式校验，不绑定任何账号。',
  },
  {
    q: '接入需要改什么。',
    a: '只改 Base URL，其余不动。模型名照官方填写；未收录的模型名会被原样透传。',
  },
  {
    q: '可用性如何。',
    a: '不会。本站已发布《永续运营承诺》：永久免费、永久开启、永不关站；如遇不可抗力需迁移，会提前 180 天公告。关键业务仍建议保留官方 API 作备份。',
  },
];
</script>

<template>
  <div class="skin">
    <!-- 01 · 首屏 -->
    <header class="masthead">
      <div class="wrap masthead-in">
        <div class="brand">
          <span class="mark" aria-hidden="true"></span>
          <span class="brand-name">RELAY.</span>
          <span class="brand-note">API 中转站</span>
        </div>
        <div class="masthead-meta">
          <span>免费</span>
          <span>无需注册</span>
          <span>不限额度</span>
        </div>
      </div>
    </header>

    <section class="hero">
      <div class="wrap">
        <div class="hero-grid">
          <div class="hero-labels">
            <span class="label label-red">完全免费</span>
            <span class="label">Free Relay</span>
          </div>
          <div class="hero-body">
            <h1>
              <span class="h-line">免费 API 中转站</span>
              <span class="h-line h-line-en">Free. No signup. No quota.</span>
            </h1>
            <div class="rule"></div>
            <div class="facts">
              <div class="fact"><span class="label">价格</span><span class="fact-v">¥0</span></div>
              <div class="fact"><span class="label">数据保留</span><span class="fact-v">0 天</span></div>
              <div class="fact"><span class="label">服务等级</span><span class="fact-v">99.9%</span></div>
              <div class="fact"><span class="label">额度</span><span class="fact-v">不限</span></div>
            </div>
            <p class="lede">
              免费。无需注册。不限额度。OpenAI 兼容接口，支持流式与工具调用。
              把客户端里的 Base URL 换成下方地址即可。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 02 · 接入信息 -->
    <section class="sec">
      <div class="wrap sec-grid">
        <div class="sec-index"><span class="num">01</span><span class="label">接入</span></div>
        <div class="sec-body">
          <h2 class="sec-title">接入信息 <span class="sec-title-en">Access</span></h2>

          <div class="ep-grid">
            <div v-for="e in endpoints" :key="e.path" class="ep">
              <div class="ep-top">
                <span class="sq" aria-hidden="true"></span>
                <span class="ep-method">{{ e.method }}</span>
              </div>
              <div class="ep-path">{{ e.path }}</div>
              <div class="ep-foot">
                <span class="ep-cn">{{ e.cn }}</span>
                <span class="label">{{ e.en }}</span>
              </div>
            </div>
          </div>

          <div class="kv">
            <div class="kv-head">
              <span class="label">Base URL</span>
              <button class="btn-line" @click="r.copyText(r.baseUrl.value, $event.currentTarget)">复制</button>
            </div>
            <code class="kv-val">{{ r.baseUrl.value }}</code>
          </div>
          <div class="kv">
            <div class="kv-head">
              <span class="label">API Key</span>
              <button class="btn-line" @click="r.copyText(r.apiKey.value, $event.currentTarget)">复制</button>
            </div>
            <code class="kv-val">{{ r.apiKey.value }}</code>
          </div>

          <div class="block">
            <div class="block-head">
              <span class="label">模型列表</span>
              <span class="label label-dim">/v1/models</span>
            </div>
            <div class="model-list">
              <div v-for="(m, i) in r.models.value" :key="m" class="model">
                <span class="model-idx">{{ String(i + 1).padStart(2, '0') }}</span>
                <span class="model-name">{{ m }}</span>
                <span class="model-tag label label-dim">Chat · Responses</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 03 · 规格 -->
    <section class="sec">
      <div class="wrap sec-grid">
        <div class="sec-index"><span class="num">02</span><span class="label">规格</span></div>
        <div class="sec-body">
          <h2 class="sec-title">服务规格 <span class="sec-title-en">Facts</span></h2>
          <div class="spec-grid">
            <div v-for="s in specs" :key="s.k" class="spec">
              <span class="label">{{ s.k }}</span>
              <span class="spec-v">{{ s.v }}</span>
            </div>
          </div>
          <p class="note">上游为第三方推理渠道。本站只做协议转换与转发，不参与计费，也不做数据留存。</p>
        </div>
      </div>
    </section>

    <!-- 04 · 接入示例与调试 -->
    <section class="sec">
      <div class="wrap sec-grid">
        <div class="sec-index"><span class="num">03</span><span class="label">示例</span></div>
        <div class="sec-body">
          <h2 class="sec-title">接入示例 <span class="sec-title-en">Samples</span></h2>

          <div class="tab-grid">
            <div
              v-for="t in tabs"
              :key="t.id"
              class="tab"
              :class="{ 'tab-on': activeTab === t.id }"
              @click="activeTab = t.id"
            >
              <span class="tab-num">{{ t.num }}</span>
              <span class="tab-label">{{ t.label }}</span>
            </div>
          </div>

          <div v-show="activeTab === 'test'" class="panel">
            <div class="form-grid">
              <div class="field">
                <label class="label">接口通道</label>
                <select v-model="r.ep.value">
                  <option value="chat">/v1/chat/completions</option>
                  <option value="responses">/v1/responses</option>
                </select>
              </div>
              <div class="field">
                <label class="label">模型</label>
                <select v-model="r.model.value">
                  <option v-for="m in r.models.value" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>
              <div class="field">
                <label class="label">Top K</label>
                <input v-model.number="r.topk.value" type="number" min="1" max="50" />
              </div>
              <div class="field">
                <label class="label">tool_choice</label>
                <select v-model="r.toolChoice.value">
                  <option value="auto">auto</option>
                  <option value="none">none</option>
                  <option value="required">required</option>
                </select>
              </div>
            </div>

            <div class="row">
              <label class="check">
                <input v-model="r.stream.value" type="checkbox" />
                <span>流式输出</span>
                <span class="label label-dim">SSE</span>
              </label>
              <span class="label label-dim">不支持函数工具时请留空工具定义</span>
            </div>

            <div class="field">
              <label class="label">系统提示词（Responses 通道下作为 instructions）</label>
              <textarea v-model="r.system.value" rows="2" placeholder="可选"></textarea>
            </div>
            <div class="field">
              <label class="label">消息内容</label>
              <textarea v-model="r.msg.value" rows="3" placeholder="输入消息"></textarea>
            </div>
            <div class="field">
              <label class="label">工具定义 / Tools JSON</label>
              <textarea
                v-model="r.toolsRaw.value"
                class="mono"
                rows="4"
                placeholder='[{"type":"function","function":{"name":"get_weather","description":"查询指定城市的天气","parameters":{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}}}]'
              ></textarea>
            </div>

            <div class="actions">
              <button class="btn-fill" :disabled="r.sending.value" @click="r.send()">
                {{ r.sending.value ? '请求中' : '发送请求' }}
              </button>
              <span class="label label-dim">POST {{ r.ep.value === 'chat' ? '/v1/chat/completions' : '/v1/responses' }}</span>
            </div>
          </div>

          <div v-show="activeTab === 'curl'" class="panel">
            <template v-for="s in samples.curl" :key="s.title">
              <div class="code-head"><span class="sq" aria-hidden="true"></span><span class="code-title">{{ s.title }}</span></div>
              <CodeBlock :code="s.code" />
            </template>
          </div>

          <div v-show="activeTab === 'python'" class="panel">
            <template v-for="s in samples.python" :key="s.title">
              <div class="code-head"><span class="sq" aria-hidden="true"></span><span class="code-title">{{ s.title }}</span></div>
              <CodeBlock :code="s.code" />
            </template>
          </div>

          <div v-show="activeTab === 'node'" class="panel">
            <template v-for="s in samples.node" :key="s.title">
              <div class="code-head"><span class="sq" aria-hidden="true"></span><span class="code-title">{{ s.title }}</span></div>
              <CodeBlock :code="s.code" />
            </template>
          </div>

          <div v-show="activeTab === 'sdk'" class="panel">
            <template v-for="s in samples.sdk" :key="s.title">
              <div class="code-head"><span class="sq" aria-hidden="true"></span><span class="code-title">{{ s.title }}</span></div>
              <CodeBlock :code="s.code" />
            </template>
          </div>

          <div v-show="activeTab === 'agents'" class="panel">
            <p class="note">
              本中转实现 OpenAI 兼容协议，支持 tools 与 Responses API。
              Agent 框架按 OpenAI 客户端参数填写即可，Base URL 与 API Key 见「接入信息」。
            </p>
            <template v-for="s in samples.agents" :key="s.title">
              <div class="code-head"><span class="sq" aria-hidden="true"></span><span class="code-title">{{ s.title }}</span></div>
              <CodeBlock :code="s.code" />
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- 05 · 响应 -->
    <section class="sec">
      <div class="wrap sec-grid">
        <div class="sec-index"><span class="num">04</span><span class="label">响应</span></div>
        <div class="sec-body">
          <h2 class="sec-title">响应结果 <span class="sec-title-en">Response</span></h2>

          <div class="out">
            <div v-if="r.output.meta" class="out-meta">{{ r.output.meta }}</div>
            <div class="out-body">{{ r.output.content }}</div>
            <div v-if="r.output.tools.length" class="out-tools">
              <ToolCard v-for="(c, i) in r.output.tools" :key="i" :call="c" />
            </div>
          </div>

          <div v-show="r.stats.visible" class="stats">
            <div class="stat">
              <span class="label">耗时</span>
              <span class="stat-v" :class="{ 'stat-err': r.stats.err }">{{ r.stats.time }}</span>
            </div>
            <div class="stat">
              <span class="label">Prompt</span>
              <span class="stat-v" :class="{ 'stat-err': r.stats.err }">{{ r.stats.prompt }}</span>
            </div>
            <div class="stat">
              <span class="label">Completion</span>
              <span class="stat-v" :class="{ 'stat-err': r.stats.err }">{{ r.stats.comp }}</span>
            </div>
            <div class="stat">
              <span class="label">Total</span>
              <span class="stat-v" :class="{ 'stat-err': r.stats.err }">{{ r.stats.total }}</span>
            </div>
            <div class="stat">
              <span class="label">速度</span>
              <span class="stat-v" :class="{ 'stat-err': r.stats.err }">{{ r.stats.speed }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 06 · 说明 -->
    <section class="sec">
      <div class="wrap sec-grid">
        <div class="sec-index"><span class="num">05</span><span class="label">说明</span></div>
        <div class="sec-body">
          <h2 class="sec-title">免费说明 <span class="sec-title-en">FAQ</span></h2>
          <div class="faq">
            <div v-for="(f, i) in faqs" :key="f.q" class="faq-item">
              <span class="faq-num">{{ String(i + 1).padStart(2, '0') }}</span>
              <div class="faq-text">
                <div class="faq-q">{{ f.q }}</div>
                <div class="faq-a">{{ f.a }}</div>
              </div>
            </div>
          </div>
          <div class="block">
            <div class="block-head"><span class="label">已在用</span></div>
            <div class="clients">
              <span v-for="c in clients" :key="c" class="client">{{ c }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <RelayTrust width="1100px" accent="#e11d48" accent2="#9ca3af" bg="#ffffff" fg="#0a0a0a" muted="#6b7280" grid="rgba(10,10,10,.14)" border="#0a0a0a" radius="0px" />

    <footer class="footer" data-skin-footer>
      <div class="wrap footer-in">
        <div class="footer-brand">RELAY.</div>
        <p class="footer-line">
          第三方 AI 转发中转站。内容由上游模型生成，可能存在错误，请自行核实。
          本站与任何模型厂商无隶属关系；按《永续运营承诺》长期运营 —— 永久免费、永久开启、永不关站。
        </p>
        <p class="footer-line footer-fine">
          Free. No signup. No quota. 仅供学习研究与技术演示使用，请勿用于生产或商业场景。
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.skin{
  min-height:100vh;width:100%;
  background:#ffffff;color:#0a0a0a;
  font-family:"Helvetica Neue",Helvetica,Inter,Arial,"PingFang SC",sans-serif;
  font-size:15px;line-height:1.6;
  padding-bottom:0;
}
.wrap{max-width:1080px;margin:0 auto;padding:0 1.5rem}

/* ---------- 标签与强调 ---------- */
.label{
  font-size:11px;text-transform:uppercase;letter-spacing:.14em;
  color:#0a0a0a;font-weight:600;line-height:1.4;
}
.label-red{color:#e11d48}
.label-dim{color:#8a8a8a;font-weight:500}
.sq{width:8px;height:8px;background:#e11d48;display:inline-block;flex:0 0 auto}
.num{
  display:block;font-size:13px;font-weight:700;letter-spacing:.04em;
  color:#e11d48;font-variant-numeric:tabular-nums;
}

/* ---------- 页眉 ---------- */
.masthead{border-bottom:1px solid #0a0a0a}
.masthead-in{
  display:flex;align-items:baseline;justify-content:space-between;
  gap:1.5rem;flex-wrap:wrap;padding-top:1rem;padding-bottom:1rem;
}
.brand{display:flex;align-items:center;gap:.55rem}
.brand-name{font-size:1.05rem;font-weight:700;letter-spacing:-.01em}
.brand-note{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8a8a8a}
.masthead-meta{display:flex;gap:1.1rem;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#4a4a4a}

/* ---------- 首屏 ---------- */
.hero{border-bottom:1px solid #0a0a0a}
.hero-grid{display:grid;grid-template-columns:130px minmax(0,1fr);gap:0}
.hero-labels{
  padding:3.4rem 1.5rem 3.4rem 0;border-right:1px solid #0a0a0a;
  display:flex;flex-direction:column;gap:.7rem;
}
.hero-body{padding:3.4rem 0 3rem 2.4rem}
h1{margin:0;font-weight:700;letter-spacing:-.03em}
.h-line{display:block;font-size:clamp(3rem,7.4vw,5rem);line-height:1.02}
.h-line-en{
  margin-top:.55rem;font-size:clamp(1.15rem,2.5vw,1.6rem);
  font-weight:500;letter-spacing:-.02em;color:#8a8a8a;
}
.rule{height:1px;background:#0a0a0a;margin:2.2rem 0 1.6rem}
.facts{
  display:grid;grid-template-columns:repeat(4,minmax(0,1fr));
  border-top:1px solid #0a0a0a;border-bottom:1px solid #0a0a0a;
}
.fact{
  padding:.85rem 1rem .85rem 0;display:flex;flex-direction:column;gap:.3rem;
}
.fact + .fact{border-left:1px solid #dcdcdc;padding-left:1rem}
.fact-v{font-size:1rem;font-weight:600;letter-spacing:-.01em;font-variant-numeric:tabular-nums}
.lede{
  margin-top:1.6rem;max-width:34rem;
  font-size:.92rem;line-height:1.9;color:#4a4a4a;
}

/* ---------- 分节 ---------- */
.sec{border-bottom:1px solid #0a0a0a}
.sec-grid{display:grid;grid-template-columns:130px minmax(0,1fr);gap:0}
.sec-index{
  padding:2.4rem 1.5rem 2.4rem 0;border-right:1px solid #0a0a0a;
  display:flex;flex-direction:column;gap:.5rem;align-items:flex-start;
}
.sec-body{padding:2.4rem 0 2.8rem 2.4rem;min-width:0}
.sec-title{
  font-size:1.05rem;font-weight:700;letter-spacing:-.01em;margin:0 0 1.6rem;
  display:flex;align-items:baseline;gap:.7rem;
}
.sec-title-en{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8a8a8a;font-weight:500}

/* ---------- 接入信息 ---------- */
.ep-grid{
  display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
  border-top:1px solid #0a0a0a;border-bottom:1px solid #0a0a0a;margin-bottom:1.4rem;
}
.ep{padding:1rem 1rem 1rem 0;display:flex;flex-direction:column;gap:.5rem}
.ep + .ep{border-left:1px solid #dcdcdc;padding-left:1.1rem}
.ep-top{display:flex;align-items:center;gap:.5rem}
.ep-method{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700}
.ep-path{
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  font-size:.82rem;word-break:break-all;
}
.ep-foot{display:flex;align-items:baseline;justify-content:space-between;gap:.6rem}
.ep-cn{font-size:.78rem;color:#4a4a4a}

.kv{border-top:1px solid #0a0a0a;padding:.9rem 0 1rem}
.kv-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:.55rem}
.kv-val{
  display:block;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  font-size:.82rem;line-height:1.7;word-break:break-all;color:#0a0a0a;
}
.btn-line{
  font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;
  border:1px solid #0a0a0a;border-radius:0;padding:.28rem .7rem;background:#fff;
  min-width:5.2rem;text-align:center;
}
.btn-line:hover{background:#0a0a0a;color:#fff}

.block{margin-top:1.6rem;border-top:1px solid #0a0a0a;padding-top:.9rem}
.block-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:.6rem}
.model-list{border-top:1px solid #dcdcdc}
.model{
  display:grid;grid-template-columns:2.6rem minmax(0,1fr) auto;gap:1rem;align-items:baseline;
  padding:.65rem 0;border-bottom:1px solid #dcdcdc;
}
.model-idx{font-size:11px;letter-spacing:.1em;color:#8a8a8a;font-variant-numeric:tabular-nums}
.model-name{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.82rem}
.model-tag{white-space:nowrap}

/* ---------- 规格 ---------- */
.spec-grid{
  display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
  border-top:1px solid #0a0a0a;border-bottom:1px solid #0a0a0a;
}
.spec{
  padding:1rem 1rem 1rem 0;display:flex;flex-direction:column;gap:.4rem;
}
.spec + .spec{border-left:1px solid #dcdcdc;padding-left:1rem}
.spec-v{font-size:1.4rem;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}
.note{margin-top:1.2rem;font-size:.82rem;line-height:1.9;color:#4a4a4a;max-width:38rem}

/* ---------- Tab ---------- */
.tab-grid{
  display:grid;grid-template-columns:repeat(6,minmax(0,1fr));
  border-top:1px solid #0a0a0a;border-bottom:1px solid #0a0a0a;
}
.tab{
  padding:.75rem .7rem .75rem 0;cursor:pointer;
  display:flex;flex-direction:column;gap:.25rem;
  border-bottom:3px solid transparent;
}
.tab + .tab{border-left:1px solid #dcdcdc;padding-left:.8rem}
.tab:hover .tab-label{color:#0a0a0a}
.tab-num{font-size:11px;letter-spacing:.1em;color:#8a8a8a;font-variant-numeric:tabular-nums}
.tab-label{font-size:.8rem;color:#4a4a4a;font-weight:500}
.tab-on{border-bottom-color:#e11d48}
.tab-on .tab-num{color:#e11d48}
.tab-on .tab-label{color:#0a0a0a;font-weight:700}

.panel{padding-top:1.6rem}

/* ---------- 表单 ---------- */
.form-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem 1.4rem}
.field{margin-bottom:1.1rem;min-width:0}
.field .label{display:block;margin-bottom:.4rem}
input[type="text"],input[type="number"],textarea,select{
  width:100%;background:#fff;border:none;border-bottom:1px solid #0a0a0a;
  border-radius:0;color:#0a0a0a;padding:.4rem 0;font-size:.86rem;outline:none;
}
input:focus,textarea:focus,select:focus{border-bottom-width:2px}
textarea{
  resize:vertical;min-height:64px;line-height:1.8;
  border:1px solid #0a0a0a;padding:.55rem .7rem;
}
textarea:focus{border-width:2px}
textarea.mono{
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  font-size:.76rem;line-height:1.75;
}
select{appearance:none;padding-right:1rem}
input[type="checkbox"]{accent-color:#e11d48;width:auto}
.row{
  display:flex;align-items:center;justify-content:space-between;gap:1rem;
  flex-wrap:wrap;padding:.9rem 0;border-top:1px solid #dcdcdc;border-bottom:1px solid #dcdcdc;
  margin-bottom:1.3rem;
}
.check{display:flex;align-items:center;gap:.5rem;font-size:.84rem;cursor:pointer;margin:0}
.actions{display:flex;align-items:center;gap:1.1rem;flex-wrap:wrap;margin-top:1.3rem}
.btn-fill{
  background:#0a0a0a;color:#fff;border:1px solid #0a0a0a;border-radius:0;
  padding:.62rem 1.5rem;font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;
}
.btn-fill:hover{background:#e11d48;border-color:#e11d48}
.btn-fill:disabled{background:#fff;color:#8a8a8a;border-color:#8a8a8a;cursor:not-allowed}

/* ---------- 代码示例 ---------- */
.code-head{display:flex;align-items:center;gap:.55rem;margin:1.4rem 0 .5rem}
.code-head:first-child{margin-top:0}
.code-title{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:600}

/* ---------- 响应 ---------- */
.out{border-top:1px solid #0a0a0a;padding-top:.9rem;max-height:26rem;overflow-y:auto}
.out-meta{
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  font-size:.72rem;color:#8a8a8a;word-break:break-all;margin-bottom:.7rem;
}
.out-body{white-space:pre-wrap;word-break:break-word;font-size:.9rem;line-height:1.95}
.out-tools{margin-top:1rem;display:flex;flex-direction:column;gap:.6rem}

.stats{
  display:grid;grid-template-columns:repeat(5,minmax(0,1fr));
  border-top:1px solid #0a0a0a;border-bottom:1px solid #0a0a0a;margin-top:1.4rem;
}
.stat{padding:.7rem .9rem .7rem 0;display:flex;flex-direction:column;gap:.3rem}
.stat + .stat{border-left:1px solid #dcdcdc;padding-left:.9rem}
.stat-v{
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  font-size:.84rem;font-variant-numeric:tabular-nums;
}
.stat-err{color:#e11d48}

/* ---------- 说明 ---------- */
.faq{border-top:1px solid #0a0a0a}
.faq-item{
  display:grid;grid-template-columns:2.6rem minmax(0,1fr);gap:1rem;
  padding:1.1rem 0;border-bottom:1px solid #dcdcdc;
}
.faq-num{font-size:11px;letter-spacing:.1em;color:#e11d48;font-weight:700;font-variant-numeric:tabular-nums}
.faq-text{min-width:0}
.faq-q{font-size:.9rem;font-weight:600;letter-spacing:-.01em;margin-bottom:.35rem}
.faq-a{font-size:.84rem;line-height:1.9;color:#4a4a4a;max-width:40rem}
.clients{display:flex;flex-wrap:wrap;gap:.5rem}
.client{
  font-size:.76rem;border:1px solid #dcdcdc;border-radius:0;padding:.25rem .6rem;color:#4a4a4a;
}

/* ---------- 页脚 ---------- */
.footer{border-top:1px solid #0a0a0a;margin-top:0}
.footer-in{padding:2rem 1.5rem 2.6rem}
.footer-brand{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;margin-bottom:.9rem}
.footer-line{font-size:12px;line-height:1.85;color:#4a4a4a;max-width:44rem}
.footer-fine{margin-top:.6rem;color:#8a8a8a}
.footer{cursor:default}

/* ---------- 覆写子组件为黑白风 ---------- */
:deep(.code-block){
  background:#fff;border:1px solid #0a0a0a;border-radius:0;color:#0a0a0a;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  box-shadow:none;margin-bottom:.6rem;
}
:deep(.code-block code){font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
:deep(.copy-btn){
  background:#fff;color:#0a0a0a;border:1px solid #0a0a0a;border-radius:0;
  font-size:11px;letter-spacing:.14em;text-transform:uppercase;
}
:deep(.copy-btn:hover){background:#0a0a0a;color:#fff}
:deep(.tool-card){
  background:#fff;border:1px solid #0a0a0a;border-radius:0;box-shadow:none;
}
:deep(.tool-head){background:#fff;border-bottom:1px solid #0a0a0a;border-radius:0}
:deep(.tool-badge){
  background:#e11d48;color:#fff;border-radius:0;font-size:11px;
  letter-spacing:.14em;font-weight:600;
}
:deep(.tool-name){
  color:#0a0a0a;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
:deep(.tool-args){
  color:#0a0a0a;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}

@media (max-width:820px){
  .hero-grid,.sec-grid{grid-template-columns:1fr}
  .hero-labels{
    border-right:none;border-bottom:1px solid #0a0a0a;
    padding:1.4rem 0;flex-direction:row;gap:1.2rem;flex-wrap:wrap;
  }
  .hero-body{padding:1.8rem 0 2.2rem}
  .sec-index{
    border-right:none;border-bottom:1px solid #0a0a0a;
    padding:1.1rem 0;flex-direction:row;gap:1rem;align-items:baseline;
  }
  .sec-body{padding:1.6rem 0 2.2rem}
  .facts,.spec-grid,.stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ep-grid,.form-grid,.tab-grid{grid-template-columns:1fr}
  .fact + .fact,.stat + .stat{
    border-top:1px solid #dcdcdc;border-left:none;padding-left:0;
  }
  .fact:nth-child(odd),.stat:nth-child(odd){padding-right:.9rem}
  .fact:nth-child(even),.stat:nth-child(even){padding-left:.9rem}
  .ep + .ep,.tab + .tab{
    border-top:1px solid #dcdcdc;border-left:none;padding-left:0;
  }
  .spec + .spec{
    border-top:1px solid #dcdcdc;border-left:none;padding-left:0;
  }
  .stat{padding-top:.7rem;padding-bottom:.7rem}
  .ep{padding:.9rem 0}
  .tab{padding:.7rem 0}
  .fact{padding-top:.8rem;padding-bottom:.8rem}
}
</style>
