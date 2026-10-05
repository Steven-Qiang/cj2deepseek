<script setup lang="ts">
/**
 * 皮肤：AuroraGlass —— 玻璃拟态 + 极光渐变
 * 品牌：Aurora · 极光中转
 * 定位：空灵、高级、像 macOS 上的未来产品。深墨底 + 4 个缓慢流动的极光色斑，
 *      卡片全部是半透明玻璃（blur + 1px 顶部高光条）。
 * 功能级别：LITE —— 接入信息 + 试用台 + 响应展示 + 一段 cURL + FAQ。
 */
import { computed } from 'vue';
import { useRelay } from '../relay';
import { buildSamples } from '../samples';
import CodeBlock from '../components/CodeBlock.vue';

const r = useRelay({
  placeholder: '// 极光已就绪，点「Send」看一次响应',
  message: '你好',
});

/** 只用 curl 里的第一条，页面上的 Key 与下方代码保持一致 */
const curl = computed(() => buildSamples(r.baseUrl.value, r.apiKey.value, r.model.value).curl[0]);

const faqs = [
  {
    q: '完全免费？是认真的吗？',
    a: 'Free forever · 不扣费、不需要充值、不需要绑卡。本站是公益转发，成本不转嫁给调用方。',
  },
  {
    q: '要注册或者申请 API Key 吗？',
    a: 'Zero signup。上面那串密钥是页面本地生成的，填任意字符串同样能通过校验。',
  },
  {
    q: '我的客户端需要改什么？',
    a: '一个 Base URL，换掉就行。模型名照官方填，未识别的名字会被原样接受。',
  },
  {
    q: '会不会突然不可用？',
    a: '可能。公益站点由个人维护，不承诺 SLA；重要项目请回官方 API，这里更适合试验和玩具项目。',
  },
];
</script>

<template>
  <div class="skin">
    <!-- 极光背景：4 个大色斑 + 一层缓慢流动的渐变 -->
    <div class="aurora" aria-hidden="true">
      <span class="flow"></span>
      <span class="blob b1"></span>
      <span class="blob b2"></span>
      <span class="blob b3"></span>
      <span class="blob b4"></span>
      <span class="veil"></span>
    </div>

    <div class="topbar">
      <span class="tb-dot"></span>
      <span class="tb-strong">完全免费</span>
      <span class="tb-sep">/</span>
      <span>Unlimited · Zero signup · Zero cost</span>
    </div>

    <header class="nav">
      <div class="logo">
        <span class="logo-mark">✦</span>
        <span class="logo-name">Aurora</span>
        <span class="logo-tag">极光中转</span>
      </div>
      <div class="nav-right">
        <span class="online"><i></i>Online</span>
        <span class="nav-note">OpenAI-compatible</span>
      </div>
    </header>

    <main class="main">
      <section class="hero">
        <span class="pill"><i></i>完全免费 · Free forever</span>
        <h1>极光中转 · 免费不限量</h1>
        <p class="hero-en">Unlimited · Zero signup · Zero cost</p>
        <p class="hero-sub">
          一个 OpenAI 兼容端点，把 Base URL 换掉就能跑。无需注册、无需付费、不限并发。
        </p>
      </section>

      <section class="card access">
        <div class="card-head">
          <span class="card-title">接入信息 · Access</span>
          <span class="badge">免费 FREE</span>
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

        <div class="sub-label">可用模型 · Models</div>
        <div class="chips">
          <span v-for="m in r.models.value" :key="m" class="chip">{{ m }}</span>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <span class="card-title">试用台 · Playground</span>
          <span class="card-note">不用装任何东西，先在网页上试一次</span>
        </div>

        <div class="form">
          <label class="field">
            <span class="lab">通道 Channel</span>
            <select v-model="r.ep.value">
              <option value="chat">/v1/chat/completions</option>
              <option value="responses">/v1/responses</option>
            </select>
          </label>
          <label class="field">
            <span class="lab">模型 Model</span>
            <select v-model="r.model.value">
              <option v-for="m in r.models.value" :key="m" :value="m">{{ m }}</option>
            </select>
          </label>
          <label class="field wide">
            <span class="lab">消息 Message</span>
            <textarea v-model="r.msg.value" rows="3" placeholder="输入一句试试，比如：你好"></textarea>
          </label>
        </div>

        <div class="row">
          <label class="switch">
            <input v-model="r.stream.value" type="checkbox" />
            <span>流式输出 Stream</span>
          </label>
          <button class="send" :disabled="r.sending.value || !r.msg.value.trim()" @click="r.send()">
            {{ r.sending.value ? '发送中…' : 'Send · 发送请求' }}
          </button>
        </div>

        <div class="resp">
          <div class="resp-head">
            <span class="dot" :class="{ err: r.stats.err }"></span>
            <span class="resp-title">{{ r.stats.err ? 'Request failed' : 'Response' }}</span>
            <span class="resp-meta">{{ r.stats.time !== '-' ? r.stats.time : 'idle' }}</span>
          </div>
          <div v-if="r.stats.visible" class="stats">
            <div class="stat"><span>耗时</span><b>{{ r.stats.time }}</b></div>
            <div class="stat"><span>Prompt</span><b>{{ r.stats.prompt }}</b></div>
            <div class="stat"><span>Completion</span><b>{{ r.stats.comp }}</b></div>
            <div class="stat"><span>Total</span><b>{{ r.stats.total }}</b></div>
            <div class="stat"><span>Speed</span><b>{{ r.stats.speed }}</b></div>
          </div>
          <div v-if="r.output.meta" class="resp-id">{{ r.output.meta }}</div>
          <div class="resp-body">{{ r.output.content }}</div>
        </div>
      </section>

      <section class="card">
        <div class="card-head">
          <span class="card-title">一行接入 · cURL</span>
          <span class="card-note">把 {{ r.model.value }} 换成任意模型名即可</span>
        </div>
        <CodeBlock :code="curl.code" />
        <p class="note">
          兼容 OpenAI SDK、LangChain、LlamaIndex、Cherry Studio、NextChat、OpenCode、Dify ——
          只改 Base URL，其余不动。
        </p>
      </section>

      <section class="card faq">
        <div class="card-head">
          <span class="card-title">免费说明 · FAQ</span>
        </div>
        <div v-for="f in faqs" :key="f.q" class="faq-item">
          <div class="faq-q"><i></i>{{ f.q }}</div>
          <div class="faq-a">{{ f.a }}</div>
        </div>
      </section>
    </main>

    <footer class="footer" data-skin-footer>
      <p class="f-brand">Aurora · 极光中转 · 免费公益转发</p>
      <p class="fine">
        非官方服务，由第三方模型提供能力，AI 可能出错，请自行核实 · 不承诺可用性，可能随时调整或关停 ·
        请勿提交隐私或敏感数据 · 仅供学习研究与娱乐使用
      </p>
    </footer>
  </div>
</template>

<style scoped>
.skin{
  position:relative;min-height:100vh;width:100%;display:flex;flex-direction:column;
  background:#05060f;color:#e2e8f0;overflow-x:hidden;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
  -webkit-font-smoothing:antialiased;
}
/* ---------- 极光层 ---------- */
.aurora{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden}
.blob{position:absolute;border-radius:50%;filter:blur(70px);opacity:.7;will-change:transform}
.b1{width:62vw;height:62vw;left:-16vw;top:-20vw;background:radial-gradient(circle at 50% 50%,rgba(34,211,238,.75) 0%,rgba(34,211,238,0) 68%);animation:drift-a 30s ease-in-out infinite}
.b2{width:54vw;height:54vw;right:-14vw;top:-10vw;background:radial-gradient(circle at 50% 50%,rgba(139,92,246,.78) 0%,rgba(139,92,246,0) 68%);animation:drift-b 36s ease-in-out infinite}
.b3{width:50vw;height:50vw;left:6vw;bottom:-18vw;background:radial-gradient(circle at 50% 50%,rgba(244,114,182,.6) 0%,rgba(244,114,182,0) 68%);animation:drift-c 42s ease-in-out infinite}
.b4{width:58vw;height:58vw;right:-20vw;bottom:-24vw;background:radial-gradient(circle at 50% 50%,rgba(79,70,229,.8) 0%,rgba(79,70,229,0) 70%);animation:drift-d 34s ease-in-out infinite}
.flow{
  position:absolute;inset:-35%;opacity:.5;filter:blur(90px);will-change:transform;
  background:conic-gradient(from 210deg at 50% 50%,
    rgba(34,211,238,.18),rgba(139,92,246,.22),rgba(244,114,182,.18),
    rgba(79,70,229,.22),rgba(34,211,238,.18));
  animation:flow-spin 58s linear infinite;
}
.veil{position:absolute;inset:0;background:radial-gradient(130% 95% at 50% -12%,rgba(5,6,15,0) 28%,rgba(5,6,15,.78) 100%)}
@keyframes drift-a{0%,100%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(6vw,5vh,0) scale(1.12)}}
@keyframes drift-b{0%,100%{transform:translate3d(0,0,0) scale(1.05)}50%{transform:translate3d(-7vw,7vh,0) scale(.94)}}
@keyframes drift-c{0%,100%{transform:translate3d(0,0,0) scale(.96)}50%{transform:translate3d(8vw,-6vh,0) scale(1.14)}}
@keyframes drift-d{0%,100%{transform:translate3d(0,0,0) scale(1.08)}50%{transform:translate3d(-6vw,-8vh,0) scale(.92)}}
@keyframes flow-spin{to{transform:rotate(360deg)}}

/* ---------- 顶部提示条 ---------- */
.topbar{
  position:relative;z-index:1;display:flex;align-items:center;justify-content:center;gap:.55rem;flex-wrap:wrap;
  padding:.6rem 1rem;font-size:12px;color:#94a3b8;letter-spacing:.01em;
  background:rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.07);
  backdrop-filter:blur(20px) saturate(160%);-webkit-backdrop-filter:blur(20px) saturate(160%);
}
.tb-dot{width:6px;height:6px;border-radius:50%;background:#22d3ee;box-shadow:0 0 10px rgba(34,211,238,.9);animation:breathe 2.6s ease-in-out infinite}
.tb-strong{color:#e2e8f0;font-weight:600}
.tb-sep{color:rgba(255,255,255,.18)}
@keyframes breathe{0%,100%{opacity:1}50%{opacity:.3}}

/* ---------- 导航 ---------- */
.nav{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:1rem;
  width:100%;max-width:900px;margin:0 auto;padding:1.1rem 1.5rem}
.logo{display:flex;align-items:center;gap:.5rem}
.logo-mark{
  width:30px;height:30px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:.85rem;color:#05060f;
  background:linear-gradient(135deg,#67e8f9,#a78bfa 55%,#f9a8d4);box-shadow:0 6px 20px -6px rgba(139,92,246,.9);
}
.logo-name{font-size:1.02rem;font-weight:600;letter-spacing:-.01em}
.logo-tag{font-size:11px;color:#a5b4fc;background:rgba(139,92,246,.14);border:1px solid rgba(139,92,246,.32);border-radius:99px;padding:.12rem .5rem}
.nav-right{display:flex;align-items:center;gap:.9rem}
.online{display:flex;align-items:center;gap:.35rem;font-size:12px;color:#67e8f9}
.online i{width:6px;height:6px;border-radius:50%;background:#22d3ee;box-shadow:0 0 10px rgba(34,211,238,.9);animation:breathe 2.6s ease-in-out infinite}
.nav-note{font-size:12px;color:#64748b}

/* ---------- 主体 ---------- */
.main{position:relative;z-index:1;flex:1;width:100%;max-width:820px;margin:0 auto;padding:.4rem 1.4rem 2.4rem}
.hero{text-align:center;padding:1.6rem 0 2rem}
.pill{
  display:inline-flex;align-items:center;gap:.45rem;font-size:12px;color:#c7d2fe;
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:99px;
  padding:.32rem .8rem;backdrop-filter:blur(24px) saturate(170%);-webkit-backdrop-filter:blur(24px) saturate(170%);
}
.pill i{width:6px;height:6px;border-radius:50%;background:linear-gradient(135deg,#22d3ee,#f472b6);box-shadow:0 0 10px rgba(34,211,238,.8)}
h1{
  margin-top:1.1rem;font-size:clamp(2rem,5.4vw,3rem);font-weight:600;letter-spacing:-.025em;line-height:1.2;
  background:linear-gradient(100deg,#e2e8f0 6%,#a5f3fc 42%,#ddd6fe 68%,#fbcfe8 96%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
}
.hero-en{margin-top:.7rem;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#94a3b8}
.hero-sub{margin:1rem auto 0;max-width:520px;font-size:.9rem;line-height:1.9;color:#94a3b8}

/* ---------- 玻璃卡片 ---------- */
.card{
  position:relative;margin-bottom:1.15rem;padding:1.4rem;border-radius:24px;
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);
  backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);
  box-shadow:0 30px 70px -40px rgba(0,0,0,.95),inset 0 1px 0 rgba(255,255,255,.05);
}
.card::before{
  content:"";position:absolute;left:16px;right:16px;top:0;height:1px;border-radius:1px;
  background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.7),rgba(255,255,255,0));
}
.card-head{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:1.05rem}
.card-title{font-size:.86rem;font-weight:600;letter-spacing:.01em;color:#e2e8f0}
.card-note{font-size:12px;color:#64748b}
.badge{
  margin-left:auto;font-size:11px;font-weight:600;letter-spacing:.06em;color:#05060f;border-radius:99px;padding:.16rem .6rem;
  background:linear-gradient(120deg,#67e8f9,#c4b5fd);box-shadow:0 4px 18px -6px rgba(103,232,249,.9);
}
.access{border-color:rgba(165,243,252,.22);box-shadow:0 30px 70px -40px rgba(0,0,0,.95),0 0 0 1px rgba(103,232,249,.08)}

/* 接入信息 */
.kv{display:flex;align-items:center;gap:.65rem;padding:.6rem .75rem;margin-bottom:.55rem;
  background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07);border-radius:14px}
.kv-label{font-size:12px;color:#94a3b8;white-space:nowrap}
.kv code{flex:1;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.76rem;color:#a5f3fc;word-break:break-all}
.mini{
  font-size:12px;color:#e2e8f0;padding:.24rem .6rem;border-radius:99px;white-space:nowrap;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);transition:background .18s,border-color .18s;
}
.mini:hover{background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.26)}
.endpoints{display:flex;flex-wrap:wrap;gap:.45rem;margin:.85rem 0 .2rem}
.endpoint{font-size:12px;color:#cbd5e1;padding:.32rem .62rem;border-radius:12px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.endpoint b{margin-right:.35rem;color:#67e8f9;font-weight:600}
.sub-label{margin:1.05rem 0 .55rem;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#64748b}
.chips{display:flex;flex-wrap:wrap;gap:.45rem}
.chip{font-size:12px;color:#ddd6fe;padding:.26rem .6rem;border-radius:99px;
  background:linear-gradient(120deg,rgba(34,211,238,.12),rgba(139,92,246,.16));
  border:1px solid rgba(167,139,250,.28);
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}

/* 试用台 */
.form{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.9rem}
.field{display:block;min-width:0}
.field.wide{grid-column:1/-1}
.lab{display:block;margin-bottom:.4rem;font-size:12px;color:#94a3b8}
select,textarea{
  width:100%;padding:.58rem .72rem;border-radius:14px;font-size:.85rem;color:#e2e8f0;outline:none;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);transition:border-color .18s,box-shadow .18s;
}
select:focus,textarea:focus{border-color:rgba(103,232,249,.5);box-shadow:0 0 0 3px rgba(103,232,249,.12)}
select option{background:#0a0f1f;color:#e2e8f0}
textarea{resize:vertical;min-height:84px;line-height:1.8;font-family:inherit}
.row{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-top:1rem}
.switch{display:flex;align-items:center;gap:.45rem;font-size:.8rem;color:#94a3b8;cursor:pointer}
.switch input{accent-color:#22d3ee}
.send{
  padding:.62rem 1.4rem;border-radius:14px;font-size:.85rem;font-weight:600;color:#05060f;
  background:linear-gradient(120deg,#67e8f9,#a78bfa 55%,#f9a8d4);
  box-shadow:0 12px 34px -14px rgba(139,92,246,.95);transition:filter .18s,transform .18s;
}
.send:hover{filter:brightness(1.08)}
.send:active{transform:translateY(1px)}
.send:disabled{opacity:.45;cursor:not-allowed;filter:grayscale(.3)}

/* 响应区 */
.resp{margin-top:1.15rem;padding:1rem 1.05rem;border-radius:18px;
  background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.07)}
.resp-head{display:flex;align-items:center;gap:.5rem;margin-bottom:.7rem}
.dot{width:7px;height:7px;border-radius:50%;background:#22d3ee;box-shadow:0 0 10px rgba(34,211,238,.9)}
.dot.err{background:#f472b6;box-shadow:0 0 10px rgba(244,114,182,.9)}
.resp-title{font-size:.8rem;font-weight:600;color:#e2e8f0}
.resp-meta{margin-left:auto;font-size:12px;color:#64748b;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.stats{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.75rem}
.stat{display:flex;align-items:baseline;gap:.4rem;padding:.28rem .6rem;border-radius:10px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)}
.stat span{font-size:11px;color:#64748b}
.stat b{font-size:12px;font-weight:600;color:#cbd5e1;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.resp-id{margin-bottom:.5rem;font-size:11px;color:#64748b;word-break:break-all;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.resp-body{white-space:pre-wrap;word-break:break-word;font-size:.88rem;line-height:1.9;color:#e2e8f0}
.note{margin-top:.9rem;font-size:12px;line-height:1.9;color:#94a3b8}

/* FAQ */
.faq-item{padding:.65rem 0;border-bottom:1px solid rgba(255,255,255,.06)}
.faq-item:last-child{border-bottom:none;padding-bottom:.1rem}
.faq-q{display:flex;align-items:center;gap:.45rem;margin-bottom:.25rem;font-size:.84rem;font-weight:500;color:#e2e8f0}
.faq-q i{width:5px;height:5px;border-radius:50%;background:linear-gradient(135deg,#22d3ee,#8b5cf6);flex:0 0 auto}
.faq-a{font-size:.8rem;line-height:1.9;color:#94a3b8;padding-left:.95rem}

/* 页脚 */
.footer{position:relative;z-index:1;padding:2rem 1.4rem 2.4rem;text-align:center;font-size:12px;color:#94a3b8;line-height:1.9}
.f-brand{margin-bottom:.35rem;color:#cbd5e1}
.fine{max-width:640px;margin:0 auto;font-size:12px;color:#64748b}
.hero,.card,.resp{position:relative;z-index:1}

/* CodeBlock 玻璃质感覆写 */
:deep(.code-block){
  padding:1rem 1.1rem;border-radius:20px;font-size:.75rem;line-height:1.7;color:#cbd5e1;
  background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.1);
  backdrop-filter:blur(24px) saturate(170%);-webkit-backdrop-filter:blur(24px) saturate(170%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.06);
}
:deep(.copy-btn){
  top:.6rem;right:.6rem;padding:.2rem .55rem;border-radius:99px;font-size:11px;color:#94a3b8;
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);
}
:deep(.copy-btn:hover){color:#e2e8f0;background:rgba(255,255,255,.17)}

@media (max-width:760px){
  .blob{width:130vw;height:130vw}
  .b1{left:-40vw;top:-40vw}
  .b2{right:-45vw;top:-25vw}
  .b3{left:-30vw;bottom:-40vw}
  .b4{right:-40vw;bottom:-45vw}
  .kv{flex-wrap:wrap}
  .kv code{flex:1 1 100%;order:3}
}
@media (prefers-reduced-motion:reduce){
  .blob,.flow,.tb-dot,.online i{animation:none}
}
</style>
