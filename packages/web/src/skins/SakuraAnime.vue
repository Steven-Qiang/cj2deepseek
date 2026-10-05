<script setup lang="ts">
/**
 * 皮肤 ⑤：樱 API · SakuraRelay —— 少女粉二次元「免费 API 中转站」
 * 人设是拟人化的樱花小助手"小樱"：粉紫渐变底 + 飘落樱瓣 + 手写体标题，
 * 定位依旧是中转站（Base URL / API Key / endpoint 首屏可见），功能级别 LITE：
 * 接入信息 + 在线试一句 + 一段接入代码 + 免费说明与 FAQ。
 */
import { computed, ref } from 'vue';
import { useRelay } from '../relay';
import { buildSamples } from '../samples';
import CodeBlock from '../components/CodeBlock.vue';

const r = useRelay({
  placeholder: '小樱的回应会飘到这里来～',
  message: '你好呀小樱，介绍一下你自己吧～',
});

/** 只取一条 cURL 示例，够用就好（LITE） */
const curlSnippet = computed(
  () => buildSamples(r.baseUrl.value, r.apiKey.value, r.model.value).curl[0].code,
);

/** 只有点过发送才把占位文案换成"回应气泡"，免得首屏误会成小樱在说话 */
const touched = ref(false);
async function tryOne() {
  touched.value = true;
  await r.send();
}

/** 飘落的樱瓣（纯 CSS 画的瓣形，7 片） */
const petals = [
  { left: '5%', delay: '0s', dur: '13s', size: 12, hue: '#ffc2d8' },
  { left: '18%', delay: '3.4s', dur: '16s', size: 9, hue: '#ff9ec2' },
  { left: '33%', delay: '1.2s', dur: '14.5s', size: 14, hue: '#ffd3e4' },
  { left: '49%', delay: '6s', dur: '17s', size: 10, hue: '#ffaecd' },
  { left: '64%', delay: '2.1s', dur: '12.5s', size: 12, hue: '#ffc9dc' },
  { left: '79%', delay: '8.2s', dur: '18s', size: 11, hue: '#ff9ec2' },
  { left: '92%', delay: '4.6s', dur: '15s', size: 13, hue: '#ffd3e4' },
];

const freeNotes = [
  { icon: '💰', t: '不收费', d: '小樱是公益中转，调多少都不扣钱～也不限并发 ✧' },
  { icon: '📝', t: '不注册', d: '不用邮箱不用手机号，打开这页就能拿地址用啦。' },
  { icon: '🔑', t: 'Key 随便填', d: '页面上那串是本地生成的，填别的字符串也能过哦。' },
];

const faqs = [
  {
    q: '真的免费吗？',
    a: '当然啦，骗你是小狗 🐶 小樱只是公益转发，不对调用方计费，也不限额度、不限并发。',
  },
  {
    q: '要注册或者充值吗？',
    a: '都不用哦～把 Base URL 换成人家，再随便填个 API Key，就能免费用啦。',
  },
  {
    q: '小樱会不会哪天不见了？',
    a: '有可能的 🥺 这是个人维护的小站，不承诺可用性，重要项目请用官方 API。',
  },
  {
    q: '我的客户端要改哪里？',
    a: '只改 Base URL 一个地方就好～模型名照官方填，没见过的名字小樱也会原样接住。',
  },
];

const curModel = computed(() => r.model.value || 'deepseek-flash');
</script>

<template>
  <div class="skin">
    <!-- 飘落樱瓣：纯 CSS 瓣形 + keyframes -->
    <div class="petals" aria-hidden="true">
      <span
        v-for="(p, i) in petals"
        :key="i"
        class="petal"
        :style="{
          left: p.left,
          width: p.size + 'px',
          height: p.size + 'px',
          background: p.hue,
          animationDelay: p.delay,
          animationDuration: p.dur,
        }"
      ></span>
    </div>
    <div class="glow glow-a" aria-hidden="true"></div>
    <div class="glow glow-b" aria-hidden="true"></div>

    <!-- ① 首屏可见「完全免费」 -->
    <div class="topbar">
      <span class="tb-strong">🌸 完全免费</span>
      <span>不用注册也不用充值 ✧ 不限额度不限并发～</span>
      <span class="tb-right"><i></i>小樱在线中</span>
    </div>

    <header class="nav">
      <div class="logo">
        <span class="logo-mark">🌸</span>
        <span class="logo-name">樱 API</span>
        <span class="logo-tag">免费中转</span>
      </div>
      <div class="nav-right">
        <span class="sticker">SakuraRelay</span>
      </div>
    </header>

    <main class="main">
      <section class="hero">
        <!-- 拟人化角色（CSS 画的圆脸小樱） -->
        <div class="chibi" aria-hidden="true">
          <span class="hair-back"></span>
          <span class="head"></span>
          <span class="bangs"></span>
          <span class="eye l"></span>
          <span class="eye r"></span>
          <span class="blush l"></span>
          <span class="blush r"></span>
          <span class="mouth"></span>
          <span class="clip">🌸</span>
        </div>

        <h1 class="hand">樱 API · SakuraRelay</h1>
        <p class="hero-kicker">免费 API 中转站</p>

        <div class="say">
          <span class="say-name">小樱</span>
          这里是免费的中转站哦～不用注册也不用充值 ✧
        </div>

        <p class="hero-sub">
          把 Base URL 换成人家，就能免费用啦～OpenAI 兼容接口，SDK 里一个字都不用改。
        </p>
        <p class="triple">免注册 · 免充值 · 不限额度 · 不限并发</p>
      </section>

      <!-- ② 接入信息 -->
      <section class="card access">
        <div class="card-head">
          <span class="card-title">🔑 接入信息（复制走就能用）</span>
          <span class="free-badge">完全免费</span>
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
          <span class="endpoint"><b>POST</b> /v1/chat/completions</span>
          <span class="endpoint"><b>POST</b> /v1/responses</span>
          <span class="endpoint"><b>GET</b> /v1/models</span>
        </div>

        <!-- ③ 模型列表 -->
        <div class="models-label">可用的模型 ✧ 点一下就能试</div>
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

      <!-- 在线试一句（LITE 调试台） -->
      <section class="card">
        <div class="card-head">
          <span class="card-title">🎀 在线试一句</span>
          <span class="muted">先在网页上试一次，不用装任何东西～</span>
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
          @keydown.ctrl.enter="tryOne()"
          @keydown.meta.enter="tryOne()"
        ></textarea>

        <div class="row-actions">
          <label class="switch"><input v-model="r.stream.value" type="checkbox" /> 流式输出（一个字一个字冒出来）</label>
          <button class="send" :disabled="r.sending.value || !r.msg.value.trim()" @click="tryOne()">
            {{ r.sending.value ? '小樱在想… 🌸' : '试一下 →' }}
          </button>
        </div>

        <div v-if="touched" class="reply" :class="{ err: r.stats.err }">
          <div class="reply-head">
            <span class="face-mini">🌸</span>
            <span class="who">{{ r.stats.err ? '出错了呜呜…' : '小樱的回应：' }}</span>
            <span v-if="r.stats.time !== '-'" class="took">
              {{ r.stats.time }} · {{ r.stats.comp }} tok · {{ r.stats.speed }}
            </span>
          </div>
          <div v-if="r.output.meta" class="reply-meta">{{ r.output.meta }}</div>
          <div class="reply-body">{{ r.output.content }}</div>
        </div>
      </section>

      <!-- 一段接入代码 -->
      <section class="card">
        <div class="card-head">
          <span class="card-title">💻 一段 cURL 直接接进去</span>
          <span class="muted">当前模型：{{ curModel }}</span>
        </div>
        <CodeBlock :code="curlSnippet" />
        <p class="dev-note">
          只改 Base URL 就行啦～OpenAI SDK / LangChain / Cherry Studio / NextChat 这些都能直接用哦 ✧
        </p>
      </section>

      <!-- ④ 免费说明 -->
      <section class="card">
        <div class="card-head">
          <span class="card-title">✨ 为什么人家可以免费呀</span>
        </div>
        <div class="free-grid">
          <div v-for="f in freeNotes" :key="f.t" class="bubble">
            <span class="bubble-icon">{{ f.icon }}</span>
            <div class="bubble-txt">
              <div class="bubble-t">{{ f.t }}</div>
              <div class="bubble-d">{{ f.d }}</div>
            </div>
          </div>
        </div>
        <p class="note">小樱这边是拿闲置资源拼起来的公益转发，成本不转嫁给调用方，所以不收费、也不承诺 SLA 哦。</p>
      </section>

      <section class="card faq-card">
        <div class="card-head">
          <span class="card-title">🌸 常见问题（小樱来回答）</span>
        </div>
        <div v-for="f in faqs" :key="f.q" class="faq-item">
          <div class="faq-q">{{ f.q }}</div>
          <div class="faq-a">{{ f.a }}</div>
        </div>
      </section>
    </main>

    <footer class="footer" data-skin-footer>
      <p>樱 API · SakuraRelay · 免费公益中转 · 模型能力来自第三方，小樱说的话不一定对，要紧的事记得自己核对哦 🌸</p>
      <p class="fine">不承诺可用性，可能随时调整或关停 · 仅供学习研究与娱乐使用 · 请勿用于生产环境</p>
    </footer>
  </div>
</template>

<style scoped>
.skin{
  position:relative;min-height:100vh;width:100%;overflow-x:hidden;
  font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",system-ui,sans-serif;
  background:linear-gradient(168deg,#fff1f6 0%,#fdeaf7 46%,#f3e8ff 100%);
  color:#5f4a63;
}

/* ---------- 樱瓣 & 光斑装饰 ---------- */
.petals{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:0}
.petal{
  position:absolute;top:-12vh;border-radius:100% 0 100% 0;opacity:0;
  box-shadow:0 0 6px rgba(255,111,165,.25);
  animation-name:fall;animation-timing-function:linear;animation-iteration-count:infinite;
}
@keyframes fall{
  0%{transform:translate3d(0,-14vh,0) rotate(0deg) scale(.85);opacity:0}
  12%{opacity:.9}
  50%{transform:translate3d(44px,52vh,0) rotate(230deg) scale(1)}
  88%{opacity:.9}
  100%{transform:translate3d(-30px,112vh,0) rotate(480deg) scale(.85);opacity:0}
}
.glow{position:fixed;border-radius:50%;filter:blur(72px);pointer-events:none;z-index:0}
.glow-a{width:420px;height:420px;background:rgba(255,143,183,.4);top:-140px;left:-120px}
.glow-b{width:460px;height:460px;background:rgba(167,139,250,.3);bottom:-170px;right:-130px}

/* ---------- 免费横幅 ---------- */
.topbar{
  position:relative;z-index:1;display:flex;align-items:center;justify-content:center;gap:.7rem;flex-wrap:wrap;
  padding:.55rem 1rem;font-size:.78rem;color:#9a7c92;
  background:linear-gradient(90deg,rgba(255,255,255,.82),rgba(255,226,240,.86),rgba(243,232,255,.82));
  border-bottom:1px solid #ffe1ee;backdrop-filter:blur(6px);
}
.tb-strong{color:#ff6fa5;font-weight:800;letter-spacing:.02em}
.tb-right{display:flex;align-items:center;gap:.35rem;color:#a78bfa}
.tb-right i{width:7px;height:7px;border-radius:50%;background:#ff6fa5;animation:pulse 1.7s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.78)}}

/* ---------- 顶栏 ---------- */
.nav{
  position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:1rem;
  max-width:760px;width:100%;margin:0 auto;padding:1rem 1.3rem;
}
.logo{display:flex;align-items:center;gap:.5rem}
.logo-mark{
  width:36px;height:36px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.05rem;
  background:linear-gradient(145deg,#fff,#ffe6f1);
  box-shadow:0 6px 16px rgba(255,111,165,.28),inset 0 1px 0 #fff;
}
.logo-name{font-weight:800;font-size:1.06rem;color:#ff6fa5;letter-spacing:.01em}
.logo-tag{
  font-size:.63rem;color:#fff;background:linear-gradient(135deg,#ff8fbb,#a78bfa);
  border-radius:999px;padding:.14rem .5rem;box-shadow:0 4px 10px rgba(255,111,165,.3);
}
/* 手写感贴纸标签：斜体 + 轻微旋转 */
.sticker{
  display:inline-block;font-size:.72rem;font-style:italic;color:#a78bfa;
  padding:.2rem .6rem;border-radius:10px;transform:rotate(-4deg);
  background:rgba(255,255,255,.75);border:1px dashed #e5d5ff;
}

/* ---------- 主区 ---------- */
.main{position:relative;z-index:1;max-width:720px;width:100%;margin:0 auto;padding:.4rem 1.3rem 2rem}

.hero{text-align:center;padding:.8rem 0 1.5rem}

/* 拟人化角色：CSS 画的圆脸小樱 */
.chibi{position:relative;width:104px;height:104px;margin:0 auto .8rem;animation:bob 4.2s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.hair-back{position:absolute;left:5px;right:5px;top:0;bottom:2px;border-radius:50% 50% 46% 46%;background:linear-gradient(160deg,#ffb3cf,#ff6fa5)}
.head{
  position:absolute;left:13px;right:13px;top:11px;bottom:9px;border-radius:50%;
  background:radial-gradient(circle at 50% 28%,#fff6fa,#ffe1ed);
  box-shadow:0 12px 26px rgba(255,111,165,.26),inset 0 -6px 12px rgba(255,163,196,.35);
}
.bangs{
  position:absolute;left:13px;right:13px;top:6px;height:46px;
  border-radius:52% 52% 42% 42%;background:linear-gradient(150deg,#ffc0d8,#ff8ab6);
  box-shadow:inset 0 -5px 9px rgba(255,111,165,.28);
}
.eye{position:absolute;top:48px;width:13px;height:16px;border-radius:50% 50% 46% 46%;background:#5f3a58;box-shadow:inset 0 3px 0 rgba(255,255,255,.92)}
.eye.l{left:31px}
.eye.r{right:31px}
.blush{position:absolute;top:66px;width:19px;height:9px;border-radius:50%;background:rgba(255,124,168,.55);filter:blur(2px)}
.blush.l{left:21px}
.blush.r{right:21px}
.mouth{position:absolute;left:50%;top:71px;width:10px;height:6px;margin-left:-5px;border-bottom:2px solid #d1739b;border-radius:0 0 50% 50%}
.clip{position:absolute;right:0;top:0;font-size:1.4rem;transform:rotate(14deg);animation:spin-slow 9s linear infinite}
@keyframes spin-slow{0%{transform:rotate(14deg)}50%{transform:rotate(-10deg)}100%{transform:rotate(14deg)}}

/* 手写感标题 */
h1.hand{
  font-family:"Kaiti SC","STKaiti","KaiTi","Segoe Script","Bradley Hand",cursive;
  font-style:italic;font-size:1.95rem;font-weight:700;line-height:1.3;
  color:#ff5f9c;transform:rotate(-1.4deg);
  text-shadow:0 2px 0 #fff,0 6px 16px rgba(255,111,165,.28);
}
.hero-kicker{
  display:inline-block;margin-top:.5rem;font-size:.76rem;color:#a78bfa;font-style:italic;
  letter-spacing:.08em;transform:rotate(-1deg);
}
.say{
  position:relative;display:inline-block;margin-top:.85rem;max-width:100%;
  font-size:.9rem;line-height:1.75;color:#77556f;text-align:left;
  background:rgba(255,255,255,.9);border:1px solid #ffdcea;border-radius:22px;
  padding:.65rem 1rem;box-shadow:0 10px 24px rgba(255,111,165,.14),inset 0 1px 0 #fff;
}
.say::after{
  content:"";position:absolute;left:34px;bottom:-9px;width:14px;height:14px;
  background:rgba(255,255,255,.9);border-right:1px solid #ffdcea;border-bottom:1px solid #ffdcea;
  transform:rotate(45deg);border-radius:0 0 4px 0;
}
.say-name{
  display:inline-block;margin-right:.45rem;font-size:.72rem;color:#fff;font-style:italic;
  background:linear-gradient(135deg,#ff8fbb,#ff6fa5);border-radius:999px;padding:.1rem .5rem;
}
.hero-sub{margin-top:1rem;color:#9a7c92;font-size:.9rem;line-height:1.8}
.triple{margin-top:.5rem;font-size:.75rem;color:#bda6bd;letter-spacing:.02em}

/* ---------- 卡片 ---------- */
.card{
  position:relative;background:rgba(255,255,255,.88);border:1px solid #ffe4f0;border-radius:26px;
  padding:1.2rem 1.25rem;margin-bottom:1.1rem;
  box-shadow:0 14px 34px rgba(255,111,165,.14),0 4px 12px rgba(167,139,250,.1),inset 0 1px 0 #fff;
}
.access{border-color:#ffd6e7;box-shadow:0 18px 42px rgba(255,111,165,.2),0 6px 16px rgba(167,139,250,.14),inset 0 1px 0 #fff}
.card-head{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:.95rem}
.card-title{font-size:.9rem;font-weight:700;color:#ff6fa5;font-style:italic}
.free-badge{
  font-size:.64rem;color:#fff;background:linear-gradient(135deg,#ff8fbb,#a78bfa);
  border-radius:999px;padding:.13rem .55rem;box-shadow:0 4px 10px rgba(167,139,250,.3);
}
.muted{margin-left:auto;font-size:.74rem;color:#c0a8c4;font-style:italic}

/* Base URL / API Key */
.kv{
  display:flex;align-items:center;gap:.6rem;font-size:.76rem;
  background:linear-gradient(150deg,#fff6fa,#f8f1ff);
  border:1px solid #ffe0ee;border-radius:20px;padding:.55rem .75rem;margin-bottom:.55rem;
  box-shadow:inset 0 2px 5px rgba(255,111,165,.07);
}
.kv-label{color:#c0a8c4;white-space:nowrap;font-style:italic}
.kv code{flex:1;color:#a78bfa;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.mini{
  font-size:.74rem;color:#fff;border-radius:999px;padding:.22rem .72rem;
  background:linear-gradient(135deg,#ff9ec2,#ff6fa5);
  box-shadow:0 5px 12px rgba(255,111,165,.32),inset 0 1px 0 rgba(255,255,255,.5);
  transition:transform .2s ease,filter .2s ease;
}
.mini:hover{transform:translateY(-1px);filter:brightness(1.05)}

/* endpoints */
.endpoints{display:flex;flex-wrap:wrap;gap:.45rem;margin:.75rem 0 .2rem}
.endpoint{
  font-size:.72rem;color:#8a7189;background:#fff;border:1px solid #ffe0ee;border-radius:999px;
  padding:.3rem .7rem;box-shadow:0 4px 10px rgba(255,111,165,.1);
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
}
.endpoint b{color:#ff6fa5;margin-right:.3rem}

/* 模型列表 */
.models-label{margin-top:1rem;font-size:.78rem;color:#a78bfa;font-style:italic}
.pills{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.6rem}
.pill{
  font-size:.8rem;color:#8a7189;background:linear-gradient(145deg,#fff,#fdf2f8);
  border:1px solid #ffe0ee;border-radius:999px;padding:.36rem .95rem;
  box-shadow:0 6px 14px rgba(255,111,165,.12),inset 0 1px 0 #fff;
  transition:transform .2s ease,box-shadow .2s ease;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
}
.pill:hover{transform:translateY(-2px)}
.pill.active{
  color:#fff;border-color:transparent;background:linear-gradient(135deg,#ff8fbb,#ff6fa5);
  box-shadow:0 8px 20px rgba(255,111,165,.36),inset 0 1px 0 rgba(255,255,255,.5);
}

/* 调试台表单 */
.mini-selects{display:flex;gap:.6rem;flex-wrap:wrap;margin-bottom:.8rem}
select{
  flex:1;min-width:180px;font-size:.82rem;color:#5f4a63;outline:none;
  background:linear-gradient(150deg,#fff6fa,#f8f1ff);border:1px solid #ffe0ee;border-radius:18px;
  padding:.52rem .75rem;transition:border-color .2s,box-shadow .2s;
}
select:focus{border-color:#ffb8d4;box-shadow:0 0 0 4px rgba(255,111,165,.12)}
.cute-input{
  width:100%;min-height:92px;resize:vertical;outline:none;
  font-size:.93rem;line-height:1.8;color:#5f4a63;
  background:linear-gradient(150deg,#fff6fa,#f8f1ff);border:1px solid #ffe0ee;border-radius:22px;
  padding:.85rem 1rem;transition:border-color .2s,box-shadow .2s;
  box-shadow:inset 0 2px 6px rgba(255,111,165,.07);
}
.cute-input:focus{border-color:#ffb8d4;box-shadow:0 0 0 4px rgba(255,111,165,.14)}
.cute-input::placeholder{color:#cbb3cf}
.row-actions{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-top:1rem}
.switch{display:flex;align-items:center;gap:.4rem;font-size:.8rem;color:#9a7c92;cursor:pointer}
.switch input{accent-color:#ff6fa5}
.send{
  font-size:.92rem;font-weight:700;color:#fff;border-radius:999px;padding:.68rem 1.5rem;
  background:linear-gradient(135deg,#ff9ec2,#ff6fa5);
  box-shadow:0 12px 26px rgba(255,111,165,.36),inset 0 1px 0 rgba(255,255,255,.55);
  transition:transform .2s ease,filter .2s ease;
}
.send:hover{transform:translateY(-2px);filter:brightness(1.04)}
.send:active{transform:scale(.97)}
.send:disabled{opacity:.55;transform:none;cursor:not-allowed;filter:grayscale(.15)}

/* 回应气泡 */
.reply{
  position:relative;margin-top:1.1rem;padding:.95rem 1.05rem;border-radius:24px;
  background:linear-gradient(150deg,#fff8fb,#f8f2ff);border:1px solid #ffe0ee;
  box-shadow:0 10px 24px rgba(255,111,165,.14),inset 0 1px 0 #fff;
}
.reply.err{background:linear-gradient(150deg,#fff1f4,#ffeaf1);border-color:#ffc9d9}
.reply-head{display:flex;align-items:center;gap:.5rem;margin-bottom:.55rem;flex-wrap:wrap}
.face-mini{
  width:28px;height:28px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:.9rem;
  background:linear-gradient(145deg,#fff,#ffe6f1);box-shadow:0 4px 10px rgba(255,111,165,.22),inset 0 1px 0 #fff;
}
.who{font-size:.86rem;font-weight:700;color:#ff6fa5;font-style:italic}
.took{margin-left:auto;font-size:.72rem;color:#c0a8c4}
.reply-meta{
  font-size:.7rem;color:#cbb3cf;word-break:break-all;margin-bottom:.45rem;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
}
.reply-body{white-space:pre-wrap;word-break:break-word;font-size:.92rem;line-height:1.95;color:#5a4459}

/* 免费说明：气泡式信息块 */
.free-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.7rem}
.bubble{
  display:flex;gap:.6rem;align-items:flex-start;
  background:rgba(255,255,255,.92);border:1px solid #ffe0ee;border-radius:20px;padding:.75rem .85rem;
  box-shadow:0 8px 20px rgba(255,111,165,.12),inset 0 1px 0 #fff;
}
.bubble-icon{font-size:1.1rem;line-height:1.4}
.bubble-t{font-size:.84rem;font-weight:700;color:#a78bfa;font-style:italic;margin-bottom:.2rem}
.bubble-d{font-size:.78rem;color:#9a7c92;line-height:1.75}
.note{margin-top:.85rem;font-size:.76rem;color:#bda6bd;line-height:1.85}
.dev-note{margin-top:.7rem;font-size:.79rem;color:#9a7c92;line-height:1.8}

/* FAQ */
.faq-card{padding:1.15rem 1.25rem}
.faq-item{padding:.6rem 0;border-bottom:1px dashed #ffe0ee}
.faq-item:last-child{border-bottom:none;padding-bottom:0}
.faq-q{font-size:.86rem;font-weight:700;color:#8a5f7f;margin-bottom:.25rem}
.faq-q::before{content:"🌸 ";font-style:normal}
.faq-a{font-size:.82rem;color:#9a7c92;line-height:1.85}

/* 页脚 */
.footer{
  position:relative;z-index:1;text-align:center;padding:1.4rem 1.3rem 2.2rem;
  color:#b591ad;font-size:.78rem;line-height:1.9;cursor:default;
  border-top:1px solid rgba(255,214,231,.9);
}
.fine{color:#c9b1c8;font-size:12px}

/* CodeBlock 主题化 */
:deep(.code-block){
  background:linear-gradient(155deg,#fff7fb,#f7f1ff);
  border:1px solid #ffdcea;border-radius:20px;color:#6b5470;
  font-size:.73rem;line-height:1.75;
  box-shadow:0 10px 24px rgba(255,111,165,.12),inset 0 1px 0 #fff;
}
:deep(.code-block code){color:#6b5470}
:deep(.copy-btn){
  background:#fff;color:#ff6fa5;border:1px solid #ffd0e2;border-radius:999px;
  padding:.16rem .5rem;font-size:.66rem;box-shadow:0 3px 8px rgba(255,111,165,.16);
}
:deep(.copy-btn:hover){background:linear-gradient(135deg,#ff9ec2,#ff6fa5);color:#fff;border-color:transparent}
</style>
