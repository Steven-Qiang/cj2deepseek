<script setup lang="ts">
/**
 * 皮肤 ④：麻薯 AI —— 彩色圆润可爱风的「免费 API 中转站」
 * 视觉按黏土风（claymorphism）做，人设是"萌系免费中转站"：接入信息放首屏，配调试台与小纸条 FAQ。
 */
import { computed, ref } from 'vue';
import { useRelay } from '../relay';
import RelayTrust from '../components/RelayTrust.vue';
import { buildSamples } from '../samples';
import CodeBlock from '../components/CodeBlock.vue';

const r = useRelay({
  placeholder: '麻薯的回应会冒在这里～',
  message: '你好呀',
});

const curlSnippet = computed(() => buildSamples(r.baseUrl.value, r.apiKey.value, r.model.value).curl[0].code);

const notes = [
  { q: '真的免费吗？', a: '真的呀～麻薯是公益中转，不收费、不扣额度，也没有次数限制 🍡' },
  { q: '要注册或者充钱吗？', a: '都不用哦，连 Key 都可以随便填一个，打开就能用～' },
  { q: '会不会突然关门呀？', a: '不会的～麻薯贴了《永续运营承诺》：永久免费、永久开启、永不关站 🍡' },
];

const noteOpen = ref(false);
/** 只有点过发送才显示回应气泡，避免首屏把占位文案当成"麻薯的回应" */
const touched = ref(false);

async function run() {
  touched.value = true;
  await r.send();
}
</script>

<template>
  <div class="skin">
    <div class="blob blob-a"></div>
    <div class="blob blob-b"></div>

    <div class="topbar">
      <span class="tb-strong">🍡 完全免费</span>
      <span>不用注册 · 不用充值 · 不限额度 · 随便用～</span>
      <span class="tb-right"><i></i>麻薯在线中</span>
    </div>

    <header class="nav">
      <div class="logo">
        <span class="logo-mark">🍡</span>
        <span class="logo-name">麻薯 AI</span>
        <span class="logo-tag">免费中转</span>
      </div>
      <div class="nav-right">
        <button class="ghost" @click="noteOpen = true">登录（可选）</button>
      </div>
    </header>

    <main class="main">
      <section class="hero">
        <div class="mascot">🍡</div>
        <h1>免费 API 中转站，随便用～</h1>
        <p class="hero-sub">
          把 Base URL 换成麻薯的地址就能免费用上啦 ✨ 不用注册、不用充值、也不用你自己的 Key～
        </p>
        <p class="triple">不用注册 · 不用充值 · 不限次数</p>
      </section>

      <section class="clay-card access">
        <div class="pick">
          <span class="pick-label">🔑 接入信息（复制走就能用）</span>
        </div>
        <div class="dev-row">
          <span class="dev-label">Base URL</span>
          <code>{{ r.baseUrl.value }}</code>
          <button class="mini" @click="r.copyText(r.baseUrl.value, $event.currentTarget)">复制</button>
        </div>
        <div class="dev-row">
          <span class="dev-label">API Key</span>
          <code>{{ r.apiKey.value }}</code>
          <button class="mini" @click="r.copyText(r.apiKey.value, $event.currentTarget)">复制</button>
        </div>
        <div class="endpoints">
          <span class="endpoint"><b>POST</b> /v1/chat/completions</span>
          <span class="endpoint"><b>POST</b> /v1/responses</span>
          <span class="endpoint"><b>GET</b> /v1/models</span>
        </div>
        <div class="pills">
          <button
            v-for="m in r.models.value"
            :key="m"
            class="pill"
            :class="{ active: r.model.value === m }"
            @click="r.model.value = m"
          >{{ m }}</button>
        </div>
      </section>

      <section class="clay-card">
        <div class="pick">
          <span class="pick-label">🎈 在线试一句（先在网页上试一次，不用装东西）</span>
        </div>
        <div class="mini-selects">
          <select v-model="r.ep.value">
            <option value="chat">/v1/chat/completions</option>
            <option value="responses">/v1/responses</option>
          </select>
          <select v-model="r.model.value">
            <option v-for="m in r.models.value" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <textarea
          v-model="r.msg.value"
          class="cute-input"
          rows="3"
          placeholder="想试点什么呀～比如：你好"
          @keydown.ctrl.enter="run()"
          @keydown.meta.enter="run()"
        ></textarea>
        <div class="row-actions">
          <label class="switch"><input v-model="r.stream.value" type="checkbox" /> 一个字一个字冒出来</label>
          <button class="send" :disabled="r.sending.value || !r.msg.value.trim()" @click="run()">
            {{ r.sending.value ? '麻薯在想… 🍡' : '试一下 →' }}
          </button>
        </div>

        <div v-if="touched" class="bubble" :class="{ err: r.stats.err }">
          <div class="bubble-head">
            <span class="face">🍡</span>
            <span class="who">{{ r.stats.err ? '出错了呜呜' : '麻薯的回应：' }}</span>
            <span v-if="r.stats.time !== '-'" class="took">{{ r.stats.time }}</span>
          </div>
          <div class="bubble-body">{{ r.output.content }}</div>
        </div>
      </section>

      <section class="clay-card">
        <div class="pick">
          <span class="pick-label">🔧 一行接进你的程序里</span>
        </div>
        <CodeBlock :code="curlSnippet" />
        <p class="dev-note">只改 Base URL 就行～模型名照官方填，OpenAI SDK / LangChain / Cherry Studio 这些都能直接用。</p>
      </section>

      <section class="clay-card faq">
        <div class="faq-title">麻薯的小纸条 🌸</div>
        <div v-for="f in notes" :key="f.q" class="faq-item">
          <div class="faq-q">{{ f.q }}</div>
          <div class="faq-a">{{ f.a }}</div>
        </div>
      </section>
    </main>

    <div v-if="noteOpen" class="toast" @click="noteOpen = false">
      现在就是免登录模式呀～登录功能麻薯还在慢慢做 🍡（点一下关掉）
    </div>

    <RelayTrust width="700px" accent="#7c5cfc" accent2="#ff8fb1" bg="#fbfaff" fg="#2e2a45" muted="#8a82a8" grid="rgba(91,75,138,.14)" border="rgba(91,75,138,.12)" radius="26px" font="Quicksand, Nunito, 'PingFang SC', sans-serif" />

    <footer class="footer" data-skin-footer>
      <p>麻薯 AI · 免费公益中转 · 仅供娱乐，麻薯说的话不一定对，重要的事记得自己核对哦 🍡</p>
      <p class="fine">长期运营 · 永久免费 · 如遇不可抗力会提前 180 天公告</p>
    </footer>
  </div>
</template>

<style scoped>
.skin{
  position:relative;min-height:100vh;width:100%;overflow-x:hidden;
  font-family:Quicksand,Nunito,"PingFang SC","Microsoft YaHei",system-ui,-apple-system,sans-serif;
  background:#f0eefb;color:#2e2a45;
}
.blob{position:fixed;border-radius:50%;filter:blur(70px);pointer-events:none;z-index:0}
.blob-a{width:420px;height:420px;background:rgba(255,143,177,.42);top:-120px;left:-100px}
.blob-b{width:460px;height:460px;background:rgba(124,92,252,.28);bottom:-160px;right:-120px}
.topbar{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;gap:.7rem;flex-wrap:wrap;padding:.5rem 1rem;font-size:.78rem;color:#6f6790;background:rgba(255,255,255,.62)}
.tb-strong{color:#7c5cfc;font-weight:700}
.tb-right{display:flex;align-items:center;gap:.35rem;color:#5ad19a}
.tb-right i{width:7px;height:7px;border-radius:50%;background:#5ad19a;animation:pulse 1.6s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.45;transform:scale(.8)}}
.nav{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:1rem;max-width:780px;margin:0 auto;padding:1rem 1.3rem}
.logo{display:flex;align-items:center;gap:.5rem}
.logo-mark{width:36px;height:36px;border-radius:14px;background:linear-gradient(145deg,#fff,#f3eeff);display:flex;align-items:center;justify-content:center;font-size:1.1rem;box-shadow:4px 6px 14px rgba(91,75,138,.2),inset 0 2px 4px rgba(255,255,255,.95),inset 0 -3px 6px rgba(91,75,138,.12)}
.logo-name{font-weight:700;font-size:1.05rem}
.logo-tag{font-size:.64rem;color:#fff;background:linear-gradient(145deg,#9b7bff,#7c5cfc);border-radius:999px;padding:.14rem .5rem}
.ghost{font-size:.76rem;color:#8a82a8;padding:.28rem .7rem;border-radius:999px;background:rgba(255,255,255,.5);box-shadow:inset 0 1px 2px rgba(255,255,255,.8);transition:transform .2s cubic-bezier(.34,1.56,.64,1)}
.ghost:hover{color:#7c5cfc;transform:translateY(-1px)}
.main{position:relative;z-index:1;max-width:700px;margin:0 auto;padding:.5rem 1.3rem 2rem}
.hero{text-align:center;padding:.7rem 0 1.3rem}
.mascot{width:88px;height:88px;margin:0 auto .85rem;border-radius:32px;background:linear-gradient(145deg,#fff,#f3eeff);display:flex;align-items:center;justify-content:center;font-size:2.4rem;box-shadow:8px 16px 32px rgba(91,75,138,.2),inset 0 2px 4px rgba(255,255,255,.95),inset 0 -4px 8px rgba(91,75,138,.12);animation:bob 3.4s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
h1{font-size:1.72rem;font-weight:700;line-height:1.35}
.hero-sub{margin-top:.6rem;color:#8a82a8;font-size:.92rem;line-height:1.8}
.triple{margin-top:.5rem;font-size:.76rem;color:#b3abc9;letter-spacing:.02em}
.clay-card{
  background:#fbfaff;border-radius:26px;padding:1.2rem;margin-bottom:1.1rem;
  box-shadow:8px 16px 32px rgba(91,75,138,.18),inset 0 2px 4px rgba(255,255,255,.9),inset 0 -3px 6px rgba(91,75,138,.12);
}
.access{box-shadow:8px 16px 32px rgba(124,92,252,.24),inset 0 2px 4px rgba(255,255,255,.9),inset 0 -3px 6px rgba(91,75,138,.12)}
.pick{margin-bottom:.9rem}
.pick-label{display:block;font-size:.84rem;color:#7c5cfc;font-weight:600}
.dev-row{display:flex;align-items:center;gap:.6rem;background:#efebfa;border-radius:16px;padding:.5rem .75rem;margin-bottom:.55rem;font-size:.76rem;box-shadow:inset 0 2px 4px rgba(91,75,138,.13),inset 0 -2px 4px rgba(255,255,255,.85)}
.dev-label{color:#b3abc9;white-space:nowrap}
.dev-row code{flex:1;color:#7c5cfc;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.mini{font-size:.74rem;color:#fff;background:linear-gradient(145deg,#9b7bff,#7c5cfc);border-radius:999px;padding:.22rem .7rem;box-shadow:3px 5px 12px rgba(124,92,252,.3),inset 0 1px 2px rgba(255,255,255,.4)}
.endpoints{display:flex;flex-wrap:wrap;gap:.45rem;margin:.75rem 0 .2rem}
.endpoint{font-size:.72rem;color:#6f6790;background:rgba(255,255,255,.9);border-radius:999px;padding:.28rem .7rem;box-shadow:2px 4px 10px rgba(91,75,138,.12),inset 0 1px 2px rgba(255,255,255,.9);font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.endpoint b{color:#7c5cfc;margin-right:.25rem}
.pills{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.9rem}
.pill{font-size:.8rem;color:#6f6790;background:linear-gradient(145deg,#fff,#f2edff);border-radius:999px;padding:.38rem .95rem;box-shadow:4px 6px 14px rgba(91,75,138,.16),inset 0 2px 3px rgba(255,255,255,.95);transition:all .22s cubic-bezier(.34,1.56,.64,1)}
.pill:hover{transform:translateY(-2px)}
.pill.active{color:#fff;background:linear-gradient(145deg,#9b7bff,#7c5cfc);box-shadow:5px 10px 20px rgba(124,92,252,.4),inset 0 2px 4px rgba(255,255,255,.45)}
.mini-selects{display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:.8rem}
select{flex:1;min-width:180px;background:#efebfa;border:2px solid #e4ddf7;border-radius:16px;color:#2e2a45;padding:.5rem .7rem;font-size:.82rem;font-family:inherit;outline:none;box-shadow:inset 0 2px 4px rgba(91,75,138,.12),inset 0 -2px 4px rgba(255,255,255,.85)}
select:focus{border-color:#c9b8ff}
.cute-input{
  width:100%;border:2px solid #e4ddf7;border-radius:20px;background:#efebfa;color:#2e2a45;
  padding:.9rem 1rem;font-size:.95rem;line-height:1.75;resize:vertical;min-height:92px;outline:none;
  font-family:inherit;box-shadow:inset 0 3px 6px rgba(91,75,138,.14),inset 0 -2px 4px rgba(255,255,255,.9);
  transition:border-color .2s,box-shadow .2s;
}
.cute-input:focus{border-color:#c9b8ff;background:#f6f3ff;box-shadow:inset 0 3px 6px rgba(91,75,138,.12),0 0 0 4px rgba(124,92,252,.12)}
.cute-input::placeholder{color:#b3abc9}
.row-actions{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:1rem;flex-wrap:wrap}
.switch{display:flex;align-items:center;gap:.4rem;font-size:.8rem;color:#8a82a8;cursor:pointer}
.switch input{accent-color:#7c5cfc}
.send{
  font-size:.92rem;font-weight:700;color:#fff;border-radius:999px;padding:.7rem 1.5rem;
  background:linear-gradient(145deg,#9b7bff,#7c5cfc);
  box-shadow:6px 12px 24px rgba(124,92,252,.38),inset 0 3px 5px rgba(255,255,255,.45),inset 0 -4px 8px rgba(80,50,180,.25);
  transition:transform .2s cubic-bezier(.34,1.56,.64,1),box-shadow .2s;
}
.send:hover{transform:translateY(-2px)}
.send:active{transform:scale(.96);box-shadow:3px 6px 14px rgba(124,92,252,.32),inset 0 2px 4px rgba(80,50,180,.35)}
.send:disabled{opacity:.55;transform:none;cursor:not-allowed}
.bubble{margin-top:1rem;background:linear-gradient(145deg,#fff,#f7f3ff);border-radius:20px;padding:.95rem 1.05rem;box-shadow:inset 0 2px 4px rgba(255,255,255,.9),inset 0 -2px 5px rgba(91,75,138,.1)}
.bubble.err{background:#fff1f4}
.bubble-head{display:flex;align-items:center;gap:.5rem;margin-bottom:.55rem}
.face{width:28px;height:28px;border-radius:11px;background:linear-gradient(145deg,#fff,#f3eeff);display:flex;align-items:center;justify-content:center;font-size:.9rem;box-shadow:3px 5px 12px rgba(91,75,138,.18),inset 0 1px 3px rgba(255,255,255,.95)}
.who{font-size:.86rem;font-weight:700;color:#7c5cfc}
.took{margin-left:auto;font-size:.74rem;color:#b3abc9}
.bubble-body{white-space:pre-wrap;word-break:break-word;font-size:.93rem;line-height:1.95;color:#3a3455}
.dev-note{margin-top:.7rem;font-size:.8rem;color:#8a82a8;line-height:1.8}
.faq{padding:1.1rem 1.2rem}
.faq-title{font-size:.9rem;font-weight:700;color:#7c5cfc;margin-bottom:.85rem}
.faq-item{padding:.55rem 0;border-bottom:1px dashed #e8e2f8}
.faq-item:last-child{border-bottom:none;padding-bottom:0}
.faq-q{font-size:.86rem;font-weight:600;color:#4a4368;margin-bottom:.25rem}
.faq-a{font-size:.82rem;color:#8a82a8;line-height:1.8}
.toast{position:fixed;left:50%;bottom:2rem;transform:translateX(-50%);z-index:9;max-width:88vw;background:#fff;color:#4a4368;font-size:.83rem;line-height:1.7;padding:.75rem 1.1rem;border-radius:20px;box-shadow:8px 16px 32px rgba(91,75,138,.24),inset 0 2px 4px rgba(255,255,255,.9);cursor:pointer}
.footer{position:relative;z-index:1;text-align:center;padding:1.2rem 1.3rem 2.2rem;color:#b3abc9;font-size:.78rem;line-height:1.9;cursor:default}
.fine{color:#c9c2dc;font-size:.72rem}
:deep(.code-block){background:#efebfa;border:2px solid #e4ddf7;border-radius:16px;color:#4a4368;box-shadow:inset 0 2px 4px rgba(91,75,138,.12),inset 0 -2px 4px rgba(255,255,255,.85)}
:deep(.copy-btn){background:#fff;color:#7c5cfc;border:none;border-radius:999px;box-shadow:2px 4px 10px rgba(91,75,138,.16)}
</style>
