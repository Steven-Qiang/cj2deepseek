<script setup lang="ts">
/**
 * 皮肤 ③：FreeRelay —— 日间极简「免费 API 中转站」（主打免注册 / 免付费 / 不限额度）
 * 定位是"中转站"而不是聊天站：接入信息放首屏最显眼处，配免费对比表、在线调试台与一行接入代码。
 */
import { computed, ref } from 'vue';
import { useRelay } from '../relay';
import { buildSamples } from '../samples';
import CodeBlock from '../components/CodeBlock.vue';

const r = useRelay({
  placeholder: '// 响应结果会显示在这里',
  message: '你好',
});

const samples = computed(() => buildSamples(r.baseUrl.value, r.apiKey.value, r.model.value));
const snippets = computed(() => [
  { title: '一行 cURL 直接调', code: samples.value.curl[0].code },
  { title: 'OpenAI SDK（Node.js）', code: samples.value.sdk[1].code },
]);

const compare = [
  { item: '价格', official: '$0.15 / 1M input 起', here: '￥0（公益，不扣费）' },
  { item: '注册', official: '邮箱 + 手机号', here: '不需要' },
  { item: '支付', official: '需要先充值', here: '不需要' },
  { item: 'API Key', official: '官方 Key', here: '任意字符串' },
  { item: '限速 / 并发', official: '按余额与等级', here: '不限' },
  { item: '余额', official: '用完即停', here: '不会扣' },
];

const clients = ['OpenAI SDK', 'LangChain', 'LlamaIndex', 'Cherry Studio', 'NextChat', 'OpenCode', 'Codex', 'Dify'];

const faqs = [
  { q: '真的完全免费吗？', a: '免费且不限额度。本站是公益转发，不对调用方计费，也不限制并发。' },
  { q: '需要注册或者申请 Key 吗？', a: '都不需要。上面那串 API Key 是页面本地生成的，填任意字符串也能通过。' },
  { q: '会不会突然关站？', a: '公益站点由个人维护，不承诺可用性，重要项目请使用官方 API。' },
  { q: '我的客户端要改哪里？', a: '只改 Base URL，其余不动；模型名照官方填即可，未识别的模型名会被原样接受。' },
];

const devOpen = ref(false);
</script>

<template>
  <div class="skin">
    <div class="topbar">
      <span class="tb-strong">完全免费</span>
      <span>免注册 · 免密钥 · 不限额度 · 不限并发</span>
      <span class="tb-right"><i></i>服务在线</span>
    </div>

    <header class="nav">
      <div class="logo">
        <span class="logo-mark">⇄</span>
        <span class="logo-name">FreeRelay</span>
        <span class="logo-tag">免费中转</span>
      </div>
      <div class="nav-right">
        <span class="online"><i></i>在线</span>
        <button class="ghost" @click="devOpen = !devOpen">文档</button>
      </div>
    </header>

    <main class="main">
      <section class="hero">
        <h1>免费 API 中转站</h1>
        <p class="hero-sub">
          OpenAI 兼容接口，免注册、免密钥、不限额度。把你的 SDK 里的 Base URL 换成下面这个地址，就能直接跑起来。
        </p>
        <p class="triple">无需注册 · 无需付费 · 不限并发</p>
      </section>

      <section class="card access">
        <div class="card-head">
          <span class="card-title">接入信息</span>
          <span class="free-badge">免费</span>
        </div>
        <div class="kv">
          <span class="kv-label">Base URL</span>
          <code>{{ r.baseUrl.value }}</code>
          <button class="mini" @click="r.copyText(r.baseUrl.value, $event.currentTarget)">复制</button>
        </div>
        <div class="kv">
          <span class="kv-label">API Key</span>
          <code>{{ r.apiKey.value }}</code>
          <button class="mini" @click="r.copyText(r.apiKey.value, $event.currentTarget)">复制</button>
        </div>
        <div class="endpoints">
          <span class="endpoint"><b>POST</b>/v1/chat/completions</span>
          <span class="endpoint"><b>POST</b>/v1/responses</span>
          <span class="endpoint"><b>GET</b>/v1/models</span>
        </div>
        <div class="chips">
          <span v-for="m in r.models.value" :key="m" class="chip">{{ m }}</span>
        </div>
      </section>

      <section class="card">
        <div class="card-title">为什么免费？对比一下就懂了</div>
        <table class="compare">
          <thead>
            <tr><th></th><th>官方直连</th><th class="here">本站中转</th></tr>
          </thead>
          <tbody>
            <tr v-for="c in compare" :key="c.item">
              <td class="item">{{ c.item }}</td>
              <td>{{ c.official }}</td>
              <td class="here">{{ c.here }}</td>
            </tr>
          </tbody>
        </table>
        <p class="note">本站由闲置资源与公益渠道拼起来，成本不转嫁给调用方，所以不收费也不承诺 SLA。</p>
      </section>

      <section class="card">
        <div class="card-title">在线调试台 <span class="muted">（不用装任何东西，先在网页上试一次）</span></div>
        <div class="form">
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
          <div class="field wide">
            <label>消息内容</label>
            <textarea v-model="r.msg.value" rows="3" placeholder="输入一句试试，比如：你好"></textarea>
          </div>
        </div>
        <div class="row">
          <label class="switch"><input v-model="r.stream.value" type="checkbox" /> 流式输出（SSE）</label>
          <button class="primary" :disabled="r.sending.value || !r.msg.value.trim()" @click="r.send()">
            {{ r.sending.value ? '请求中…' : '发送请求' }}
          </button>
        </div>
        <div class="resp">
          <div class="resp-head">
            <span class="dot-ok" :class="{ err: r.stats.err }"></span>
            <span class="resp-title">{{ r.stats.err ? '请求失败' : '响应' }}</span>
            <span v-if="r.stats.time !== '-'" class="resp-meta">{{ r.stats.time }} · {{ r.stats.comp }} tokens · {{ r.stats.speed }}</span>
          </div>
          <div v-if="r.output.meta" class="resp-id">{{ r.output.meta }}</div>
          <div class="resp-body">{{ r.output.content }}</div>
        </div>
      </section>

      <section class="card">
        <div class="card-title">直接接入</div>
        <template v-for="s in snippets" :key="s.title">
          <div class="code-title">{{ s.title }}</div>
          <CodeBlock :code="s.code" />
        </template>
        <div class="clients">
          <span class="clients-label">已在用：</span>
          <span v-for="c in clients" :key="c" class="client">{{ c }}</span>
        </div>
      </section>

      <section class="faq-card">
        <div class="faq-title">常见问题</div>
        <div v-for="f in faqs" :key="f.q" class="faq-item">
          <div class="faq-q">{{ f.q }}</div>
          <div class="faq-a">{{ f.a }}</div>
        </div>
      </section>
    </main>

    <footer class="footer" data-skin-footer>
      <p>FreeRelay · 免费公益中转 · 由第三方模型提供能力，AI 可能出错，请自行核实</p>
      <p class="fine">不承诺可用性，可能随时调整或关停 · 仅供学习研究与娱乐使用</p>
    </footer>
  </div>
</template>

<style scoped>
.skin{
  min-height:100vh;width:100%;display:flex;flex-direction:column;
  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
  background:linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%);color:#0f172a;
}
.topbar{display:flex;align-items:center;justify-content:center;gap:.7rem;flex-wrap:wrap;padding:.5rem 1rem;font-size:.76rem;color:#475569;background:#ecfdf5;border-bottom:1px solid #d1fae5}
.tb-strong{color:#047857;font-weight:700}
.tb-right{display:flex;align-items:center;gap:.3rem;color:#0f9d76}
.tb-right i{width:6px;height:6px;border-radius:50%;background:#10b981;animation:pulse 1.7s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
.nav{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.6rem;max-width:960px;width:100%;margin:0 auto}
.logo{display:flex;align-items:center;gap:.5rem}
.logo-mark{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,#4f46e5,#8b5cf6);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.9rem}
.logo-name{font-weight:700;font-size:1.02rem;letter-spacing:-.01em}
.logo-tag{font-size:.62rem;color:#047857;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:99px;padding:.1rem .45rem}
.nav-right{display:flex;align-items:center;gap:.85rem}
.online{display:flex;align-items:center;gap:.35rem;color:#0f9d76;font-size:.76rem}
.online i{width:7px;height:7px;border-radius:50%;background:#10b981;animation:pulse 1.7s ease-in-out infinite}
.ghost{font-size:.78rem;color:#64748b;padding:.25rem .65rem;border-radius:8px;transition:all .15s}
.ghost:hover{color:#4f46e5;background:#eef2ff}
.main{flex:1;width:100%;max-width:780px;margin:0 auto;padding:1rem 1.4rem 2rem}
.hero{text-align:center;padding:1.2rem 0 1.6rem}
h1{font-size:2rem;font-weight:800;letter-spacing:-.02em;line-height:1.25}
.hero-sub{margin-top:.75rem;color:#64748b;font-size:.92rem;line-height:1.75}
.triple{margin-top:.6rem;font-size:.76rem;color:#a3adbd;letter-spacing:.02em}
.card{background:#fff;border:1px solid #e9ecf3;border-radius:16px;padding:1.25rem;margin-bottom:1.1rem}
.card-head{display:flex;align-items:center;gap:.6rem;margin-bottom:.9rem}
.card-title{font-size:.86rem;font-weight:600;color:#334155;margin-bottom:0}
.card-head .card-title{margin-bottom:0}
.card > .card-title{margin-bottom:1rem}
.free-badge{font-size:.64rem;color:#fff;background:linear-gradient(135deg,#10b981,#059669);border-radius:99px;padding:.12rem .5rem}
.access{border-color:#bbf7d0;box-shadow:0 0 0 3px rgba(16,185,129,.07)}
.kv{display:flex;align-items:center;gap:.6rem;background:#f8fafc;border:1px solid #e9ecf3;border-radius:10px;padding:.55rem .7rem;margin-bottom:.55rem;font-size:.76rem}
.kv-label{color:#94a3b8;white-space:nowrap}
.kv code{flex:1;color:#4f46e5;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.mini{font-size:.72rem;color:#4f46e5;background:#eef2ff;border:1px solid #c7d2fe;border-radius:6px;padding:.18rem .55rem}
.endpoints{display:flex;flex-wrap:wrap;gap:.4rem;margin:.7rem 0 .2rem}
.endpoint{font-size:.72rem;color:#475569;background:#f8fafc;border:1px solid #e9ecf3;border-radius:8px;padding:.3rem .6rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.endpoint b{color:#059669;margin-right:.35rem}
.chips{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.7rem}
.chip{font-size:.72rem;color:#047857;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:99px;padding:.2rem .6rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.compare{width:100%;border-collapse:collapse;font-size:.8rem}
.compare th,.compare td{text-align:left;padding:.55rem .6rem;border-bottom:1px solid #f1f5f9}
.compare th{font-size:.72rem;color:#94a3b8;font-weight:600}
.compare td{color:#475569}
.compare .item{color:#94a3b8;width:28%}
.compare .here{color:#047857;font-weight:600;background:#f0fdf4}
.note{margin-top:.8rem;font-size:.75rem;color:#94a3b8;line-height:1.8}
.muted{color:#a3adbd;font-weight:400;font-size:.76rem}
.form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1rem}
.field.wide{grid-column:1/-1}
label{display:block;font-size:.78rem;color:#7c8798;margin-bottom:.4rem}
select,textarea{width:100%;background:#fcfcfd;border:1px solid #e5e9f0;border-radius:10px;color:#0f172a;padding:.55rem .7rem;font-size:.85rem;outline:none;transition:border-color .15s,box-shadow .15s}
select:focus,textarea:focus{border-color:#a5b4fc;box-shadow:0 0 0 3px rgba(99,102,241,.12);background:#fff}
textarea{resize:vertical;min-height:78px;line-height:1.7}
.row{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.switch{display:flex;align-items:center;gap:.4rem;font-size:.8rem;color:#64748b;cursor:pointer;margin:0}
.switch input{accent-color:#4f46e5}
.primary{background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;font-weight:600;border-radius:10px;padding:.6rem 1.35rem;font-size:.86rem;transition:filter .15s}
.primary:hover{filter:brightness(1.06)}
.primary:disabled{opacity:.5;cursor:not-allowed}
.resp{margin-top:1.1rem;background:#f8fafc;border:1px solid #e9ecf3;border-radius:12px;padding:.9rem 1rem}
.resp-head{display:flex;align-items:center;gap:.5rem;margin-bottom:.6rem}
.dot-ok{width:7px;height:7px;border-radius:50%;background:#10b981}
.dot-ok.err{background:#ef4444}
.resp-title{font-size:.8rem;font-weight:600;color:#334155}
.resp-meta{margin-left:auto;font-size:.72rem;color:#94a3b8}
.resp-id{font-size:.7rem;color:#a3adbd;word-break:break-all;margin-bottom:.45rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.resp-body{white-space:pre-wrap;word-break:break-word;font-size:.88rem;line-height:1.85;color:#1e293b}
.code-title{font-size:.76rem;color:#7c8798;margin:.9rem 0 .4rem;font-weight:500}
.clients{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;margin-top:.9rem;padding-top:.9rem;border-top:1px solid #f1f5f9}
.clients-label{font-size:.74rem;color:#a3adbd}
.client{font-size:.72rem;color:#475569;background:#f1f5f9;border-radius:6px;padding:.2rem .5rem}
.faq-card{margin-top:1.3rem;padding-top:1.2rem;border-top:1px solid #eceff5}
.faq-title{font-size:.84rem;font-weight:600;color:#334155;margin-bottom:.7rem}
.faq-item{padding:.55rem 0;border-bottom:1px solid #f1f5f9}
.faq-item:last-child{border-bottom:none}
.faq-q{font-size:.84rem;color:#334155;font-weight:500;margin-bottom:.2rem}
.faq-a{font-size:.8rem;color:#7c8798;line-height:1.8}
.footer{text-align:center;padding:1.6rem 1.4rem 2rem;color:#94a3b8;font-size:.75rem;line-height:1.9;cursor:default}
.fine{color:#cbd5e1}
:deep(.code-block){background:#f8fafc;border-color:#e9ecf3;color:#475569}
:deep(.copy-btn){background:#fff;color:#64748b;border-color:#e2e8f0}
:deep(.copy-btn:hover){color:#4f46e5;background:#eef2ff}
</style>
