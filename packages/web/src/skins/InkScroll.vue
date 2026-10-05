<script setup lang="ts">
/**
 * 皮肤：InkScroll —— 国风水墨「墨枢」
 * 宣纸底、墨色字、朱红印。定位仍是"免费中转站"：接入信息在首屏，
 * 下附试笔调试台、回墨展示、一段接入代码与问答数条。
 * 宣纸纹理、印章、笔触全部由 CSS 绘制，不引外部图片与字体。
 */
import { computed, ref } from 'vue';
import { useRelay } from '../relay';
import RelayTrust from '../components/RelayTrust.vue';
import { buildSamples } from '../samples';
import CodeBlock from '../components/CodeBlock.vue';

const r = useRelay({
  placeholder: '落笔之后，回音在此处显现。',
  message: '你好',
});

/** 只取 curl 中的一条作示例 */
const curlSample = computed(() => buildSamples(r.baseUrl.value, r.apiKey.value, r.model.value).curl[0]);

const endpoints = [
  { method: 'POST', path: '/v1/chat/completions', note: '一问一答，通行的对话接口' },
  { method: 'POST', path: '/v1/responses', note: '新一代 Responses 接口' },
  { method: 'GET', path: '/v1/models', note: '取可用模型名录' },
];

const faqs = [
  { q: '果然分文不取？', a: '不取。本站以闲余资源中转，调用方不计费、不限额度，亦不设并发门槛。' },
  { q: '需注册、需申请密钥否？', a: '皆不必。页上这串 API Key 由本地生成，任意字符串亦可通行。' },
  { q: '当如何改我手上的客户端？', a: '只改 Base URL 一处，其余照旧；模型名如实填写即可。' },
  { q: '可保长久否？', a: '不敢承诺。公益小站，或调或停皆在旦夕，要紧的事请走官方 API。' },
];

const devOpen = ref(true);
</script>

<template>
  <div class="skin">
    <!-- 卷轴天杆 -->
    <div class="rod rod-top"></div>

    <div class="wrap">
      <header class="nav">
        <div class="brand">
          <span class="brand-mark">墨</span>
          <span class="brand-name">墨枢</span>
          <span class="brand-tag">免费中转</span>
        </div>
        <div class="nav-right">
          <span class="quiet">起笔即用</span>
          <button class="ghost" @click="devOpen = !devOpen">{{ devOpen ? '收起试笔' : '展开试笔' }}</button>
        </div>
      </header>

      <main class="main">
        <section class="hero">
          <div class="hero-title">
            <h1>墨枢 · 免费中转</h1>
            <span class="seal" aria-hidden="true">墨枢</span>
          </div>
          <p class="hero-sub">
            免费取用，不费分文。以 OpenAI 兼容之接口示人，只消把 SDK 中的 Base URL 换作下方地址，便可起笔。
          </p>
          <p class="free-line">
            <span class="free-strong">完全免费</span>
            <span class="free-rest">无需注册 · 无需密钥 · 来者不拒</span>
          </p>
          <div class="brush"></div>
        </section>

        <section class="card card-access">
          <div class="card-head">
            <span class="card-title">接入信息</span>
            <span class="card-en">API ACCESS</span>
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

          <div class="rule"><span class="rule-mark"></span></div>

          <ul class="ends">
            <li v-for="e in endpoints" :key="e.path" class="end">
              <b>{{ e.method }}</b>
              <code>{{ e.path }}</code>
              <span class="end-note">{{ e.note }}</span>
            </li>
          </ul>
        </section>

        <section class="card">
          <div class="card-head">
            <span class="card-title">可选模型</span>
            <span class="card-en">MODELS</span>
          </div>
          <p class="lede">名录随缘增补，未识得的名号亦原样收下。</p>
          <div class="chips">
            <span v-for="m in r.models.value" :key="m" class="chip">{{ m }}</span>
          </div>
        </section>

        <section v-show="devOpen" class="card">
          <div class="card-head">
            <span class="card-title">试笔</span>
            <span class="card-en">试笔调试台</span>
          </div>
          <p class="lede">不必装什么，就在此处先写一句，看看有无回响。</p>

          <div class="form">
            <div class="field">
              <label>接口</label>
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
              <label>题词</label>
              <textarea v-model="r.msg.value" rows="3" placeholder="例如：你好"></textarea>
            </div>
          </div>

          <div class="row">
            <label class="switch">
              <input v-model="r.stream.value" type="checkbox" />
              逐字落下（流式 SSE）
            </label>
            <button class="primary" :disabled="r.sending.value || !r.msg.value.trim()" @click="r.send()">
              {{ r.sending.value ? '墨未干…' : '落笔' }}
            </button>
          </div>

          <div class="ink-resp">
            <div class="resp-head">
              <span class="dot" :class="{ err: r.stats.err }"></span>
              <span class="resp-title">回墨</span>
              <span v-if="r.stats.visible" class="resp-meta">
                {{ r.stats.time }} · {{ r.stats.comp }} tokens · {{ r.stats.speed }}
              </span>
            </div>
            <div v-if="r.output.meta" class="resp-id">{{ r.output.meta }}</div>
            <div class="resp-body">{{ r.output.content }}</div>
            <ul v-if="r.stats.visible" class="stat-list">
              <li><span>耗时</span><b>{{ r.stats.time }}</b></li>
              <li><span>输入</span><b>{{ r.stats.prompt }}</b></li>
              <li><span>输出</span><b>{{ r.stats.comp }}</b></li>
              <li><span>合计</span><b>{{ r.stats.total }}</b></li>
              <li><span>速度</span><b>{{ r.stats.speed }}</b></li>
            </ul>
          </div>
        </section>

        <section class="card">
          <div class="card-head">
            <span class="card-title">接入一则</span>
            <span class="card-en">curl</span>
          </div>
          <p class="lede">粘贴即用；或翻看下面几行问答，别处不必再看。</p>
          <CodeBlock :code="curlSample.code" />
        </section>

        <section class="faq">
          <div class="card-head">
            <span class="card-title">问答</span>
            <span class="card-en">FAQ</span>
          </div>
          <div v-for="f in faqs" :key="f.q" class="faq-item">
            <div class="faq-q"><span class="faq-mark">问</span>{{ f.q }}</div>
            <div class="faq-a"><span class="faq-mark ans">答</span>{{ f.a }}</div>
          </div>
        </section>
      </main>

      <RelayTrust accent="#9e2b25" accent2="#6b6459" bg="rgba(255,253,247,.85)" fg="#1f1c17" muted="#6b6459" grid="rgba(31,28,23,.14)" border="rgba(31,28,23,.26)" radius="2px" font="'Kaiti SC', 'STKaiti', 'Songti SC', serif" />

      <footer class="footer" data-skin-footer>
        <div class="rule"><span class="rule-mark"></span></div>
        <p>墨枢 · 免费公益中转 · 一问一答，皆有回响</p>
        <p class="fine">能力由第三方模型提供，AI 或有错漏，请自行核实；公益小站按《永续运营承诺》长期开着：永久免费、永不关站；若不得已迁移，必先期半载相告。仅供学习研究与娱乐之用。</p>
      </footer>
    </div>

    <!-- 卷轴地杆 -->
    <div class="rod rod-bottom"></div>
  </div>
</template>

<style scoped>
.skin{
  min-height:100vh;width:100%;position:relative;overflow-x:hidden;
  font-family:"Kaiti SC","STKaiti","KaiTi","Songti SC","SimSun",serif;
  color:#1f1c17;
  background-color:#f6f1e7;
  background-image:
    repeating-linear-gradient(90deg,rgba(31,28,23,.032) 0 1px,rgba(31,28,23,0) 1px 4px),
    repeating-linear-gradient(0deg,rgba(31,28,23,.026) 0 1px,rgba(31,28,23,0) 1px 7px),
    radial-gradient(120% 80% at 12% 6%,rgba(158,43,37,.045) 0%,rgba(158,43,37,0) 55%),
    radial-gradient(100% 70% at 88% 92%,rgba(31,28,23,.05) 0%,rgba(31,28,23,0) 60%),
    radial-gradient(60% 50% at 50% 0%,rgba(255,255,255,.7) 0%,rgba(255,255,255,0) 70%);
  background-attachment:fixed;
}
.rod{height:14px;width:100%;background:linear-gradient(180deg,#efe8da,#e2d8c4 45%,#cdbfa4);border-bottom:1px solid rgba(31,28,23,.14)}
.rod-bottom{border-bottom:none;border-top:1px solid rgba(31,28,23,.14);background:linear-gradient(0deg,#efe8da,#e2d8c4 45%,#cdbfa4)}
.wrap{max-width:720px;margin:0 auto;padding:0 1.6rem;display:flex;flex-direction:column;min-height:100vh}

.nav{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.6rem 0 1.2rem}
.brand{display:flex;align-items:baseline;gap:.55rem}
.brand-mark{font-size:.9rem;color:#f6f1e7;background:#9e2b25;padding:.1rem .34rem;border-radius:1px;letter-spacing:.02em}
.brand-name{font-size:1.24rem;letter-spacing:.28em;color:#1f1c17}
.brand-tag{font-size:.7rem;color:#6b6459;letter-spacing:.2em;border-left:1px solid rgba(31,28,23,.22);padding-left:.55rem}
.nav-right{display:flex;align-items:center;gap:.9rem}
.quiet{font-size:.74rem;color:#6b6459;letter-spacing:.18em;opacity:.85}
.ghost{font-size:.76rem;color:#6b6459;letter-spacing:.14em;padding:.2rem 0;border-bottom:1px solid rgba(158,43,37,.45);transition:color .2s,border-color .2s}
.ghost:hover{color:#9e2b25;border-color:#9e2b25}

.main{flex:1;padding-bottom:1.5rem}
.hero{padding:1rem 0 1.7rem}
.hero-title{display:flex;align-items:flex-start;gap:1rem}
h1{font-size:1.78rem;font-weight:400;line-height:1.5;letter-spacing:.12em;color:#1f1c17}
.seal{
  flex:none;margin-top:.4rem;width:40px;height:40px;display:flex;align-items:center;justify-content:center;
  transform:rotate(-3deg);color:#f6f1e7;background:#9e2b25;border-radius:2px;
  font-size:.72rem;line-height:1.05;letter-spacing:.02em;text-align:center;word-break:break-all;
  box-shadow:inset 0 0 0 1px rgba(246,241,231,.45);opacity:.92;
}
.hero-sub{margin-top:1rem;font-size:.94rem;line-height:2.1;color:#3c372e;max-width:34em;text-align:justify}
.free-line{margin-top:1.1rem;display:flex;align-items:baseline;gap:.7rem;flex-wrap:wrap}
.free-strong{font-size:.9rem;color:#9e2b25;letter-spacing:.16em}
.free-rest{font-size:.8rem;color:#6b6459;letter-spacing:.1em}
.brush{margin-top:1.3rem;height:1px;background:linear-gradient(90deg,#1f1c17,rgba(31,28,23,.12) 55%,rgba(31,28,23,0))}

.card{margin-bottom:1.5rem;padding:1.15rem 1.2rem;background:rgba(255,253,247,.55);border:1px solid rgba(31,28,23,.13);border-radius:2px;box-shadow:1px 2px 0 rgba(31,28,23,.035)}
.card-access{border-color:rgba(158,43,37,.28);background:rgba(255,253,247,.72)}
.card-head{display:flex;align-items:baseline;gap:.7rem;margin-bottom:.9rem}
.card-title{font-size:.98rem;letter-spacing:.2em;color:#1f1c17}
.card-en{font-size:.66rem;color:#a89f8e;letter-spacing:.24em;text-transform:uppercase}
.lede{font-size:.82rem;color:#6b6459;line-height:1.95;margin-bottom:.9rem}

.rule{height:0;border-top:1px solid rgba(31,28,23,.14);margin:1rem 0;position:relative}
.rule-mark{position:absolute;left:0;top:-1px;width:38px;height:2px;background:#9e2b25;display:block}

.kv{display:flex;align-items:center;gap:.65rem;padding:.55rem .2rem;border-bottom:1px dotted rgba(31,28,23,.15);font-size:.78rem}
.kv:last-of-type{border-bottom:none}
.kv-label{flex:none;width:5.2em;color:#6b6459;letter-spacing:.14em}
.kv code{flex:1;color:#1f1c17;word-break:break-all;font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;font-size:.76rem}
.mini{flex:none;font-size:.72rem;color:#9e2b25;letter-spacing:.12em;border:1px solid rgba(158,43,37,.42);border-radius:1px;padding:.16rem .5rem;transition:background .2s,color .2s}
.mini:hover{background:#9e2b25;color:#f6f1e7}

.ends{list-style:none}
.end{display:flex;align-items:baseline;gap:.6rem;flex-wrap:wrap;padding:.4rem 0;border-bottom:1px solid rgba(31,28,23,.07)}
.end:last-child{border-bottom:none}
.end b{flex:none;font-weight:400;font-size:.68rem;color:#f6f1e7;background:#6b6459;padding:.08rem .36rem;border-radius:1px;letter-spacing:.1em}
.end code{font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;font-size:.78rem;color:#1f1c17}
.end-note{font-size:.74rem;color:#8b8375;margin-left:auto}

.chips{display:flex;flex-wrap:wrap;gap:.5rem}
.chip{font-size:.74rem;color:#3c372e;background:rgba(158,43,37,.05);border:1px solid rgba(31,28,23,.16);border-radius:1px;padding:.22rem .6rem;font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace}

.form{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:1rem;margin-bottom:1rem}
.field.wide{grid-column:1/-1}
label{display:block;font-size:.78rem;color:#6b6459;letter-spacing:.14em;margin-bottom:.4rem}
select,textarea{width:100%;background:rgba(255,253,247,.85);border:1px solid rgba(31,28,23,.18);border-radius:1px;color:#1f1c17;padding:.5rem .6rem;font-size:.86rem;font-family:inherit;outline:none;transition:border-color .2s,box-shadow .2s}
select:focus,textarea:focus{border-color:rgba(158,43,37,.55);box-shadow:0 0 0 2px rgba(158,43,37,.08)}
textarea{resize:vertical;min-height:76px;line-height:1.9}
.row{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.switch{display:flex;align-items:center;gap:.45rem;font-size:.8rem;color:#6b6459;letter-spacing:.08em;cursor:pointer;margin:0}
.switch input{accent-color:#9e2b25}
.primary{font-family:inherit;font-size:.88rem;letter-spacing:.2em;color:#f6f1e7;background:#9e2b25;border-radius:1px;padding:.5rem 1.5rem;transition:opacity .2s,transform .2s}
.primary:hover{opacity:.88}
.primary:active{transform:translateY(1px)}
.primary:disabled{opacity:.4;cursor:not-allowed}

.ink-resp{margin-top:1.2rem;padding:1rem 1.05rem;background:rgba(31,28,23,.035);border:1px solid rgba(31,28,23,.12);border-radius:1px;border-left:2px solid rgba(31,28,23,.32)}
.resp-head{display:flex;align-items:center;gap:.55rem;margin-bottom:.6rem}
.dot{width:6px;height:6px;background:#6b6459}
.dot.err{background:#9e2b25}
.resp-title{font-size:.86rem;letter-spacing:.22em;color:#1f1c17}
.resp-meta{margin-left:auto;font-size:.72rem;color:#8b8375}
.resp-id{font-size:.68rem;color:#8b8375;word-break:break-all;margin-bottom:.5rem;font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace}
.resp-body{white-space:pre-wrap;word-break:break-word;font-size:.9rem;line-height:2.05;color:#1f1c17}
.stat-list{list-style:none;display:flex;flex-wrap:wrap;gap:.35rem 1.2rem;margin-top:.9rem;padding-top:.7rem;border-top:1px solid rgba(31,28,23,.1)}
.stat-list li{display:flex;align-items:baseline;gap:.4rem;font-size:.72rem}
.stat-list span{color:#8b8375;letter-spacing:.12em}
.stat-list b{font-weight:400;color:#3c372e;font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace}

.faq{margin-top:2rem;padding-top:1.2rem;border-top:1px solid rgba(31,28,23,.14)}
.faq-item{padding:.7rem 0;border-bottom:1px solid rgba(31,28,23,.08)}
.faq-item:last-child{border-bottom:none}
.faq-q{display:flex;gap:.5rem;font-size:.88rem;color:#1f1c17;letter-spacing:.06em;margin-bottom:.35rem}
.faq-a{display:flex;gap:.5rem;font-size:.82rem;color:#6b6459;line-height:2}
.faq-mark{flex:none;font-size:.66rem;color:#f6f1e7;background:#9e2b25;padding:.06rem .3rem;border-radius:1px;margin-top:.22rem;letter-spacing:.06em}
.faq-mark.ans{background:#6b6459}

.footer{padding:1rem 0 2.6rem;text-align:center;cursor:default}
.footer .rule{margin-top:0}
.footer p{font-size:.78rem;color:#6b6459;letter-spacing:.12em;line-height:2}
.footer .fine{margin-top:.5rem;font-size:12px;color:#a89f8e;letter-spacing:.04em;line-height:1.95;text-align:justify}

:deep(.code-block){background:rgba(255,253,247,.8);border:1px solid rgba(31,28,23,.16);border-radius:1px;color:#3c372e}
:deep(.copy-btn){background:rgba(31,28,23,.05);border:1px solid rgba(31,28,23,.18);border-radius:1px;color:#6b6459}
:deep(.copy-btn:hover){background:#9e2b25;border-color:#9e2b25;color:#f6f1e7}
</style>
