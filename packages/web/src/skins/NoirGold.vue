<script setup lang="ts">
/**
 * 皮肤 ⑭：AURUM · 金枢 —— 黑金奢华 / 私人银行气质的中转站。
 *
 * 一以贯之的矛盾感：会员制的排场，免费的里子。
 * 纯黑近墨底 + 1px 金色渐变描边，衬线细体大标题 + 大字距英文副标，
 * 金色只出现在线条与文字上，几乎零圆角，靠留白撑住场面。
 * 功能级别 LITE：接入信息 + 尊享试用调试台 + 一段 cURL 接入代码 + 免费问答。
 */
import { computed } from 'vue';
import { useRelay } from '../relay';
import RelayTrust from '../components/RelayTrust.vue';
import { buildSamples } from '../samples';
import CodeBlock from '../components/CodeBlock.vue';

const r = useRelay({
  placeholder: '// 尊享响应将呈现在此处',
  message: '你好',
});

/** 接入示例随 Base URL / Key / 模型联动，这里只取 cURL 中的一条 */
const samples = computed(() => buildSamples(r.baseUrl.value, r.apiKey.value, r.model.value));

const faqs = [
  {
    q: '真的完全免费吗？',
    a: '是。金枢由公益渠道与闲置算力支撑，不对调用方计费，也不设额度上限——会员制的排场，免费的里子。',
  },
  {
    q: '需要预约、审核或入会吗？',
    a: '都不需要。页面上的 API Key 由你的浏览器本地生成并保存，填任意字符串同样可以通过校验。',
  },
  {
    q: '免费额度会一直有效吗？',
    a: '终身免费额度，无需预约。本站已发布《永续运营承诺》：永久免费、永久开启、永不关站。',
  },
  {
    q: '我的客户端需要改什么？',
    a: '把 Base URL 换成上方地址、API Key 照填即可，其余参数与官方一致；模型名未被识别时会被原样接受。',
  },
];
</script>

<template>
  <div class="skin">
    <!-- 首屏免费提示 -->
    <div class="topline">
      <span class="tl-free">◆ 完全免费</span>
      <span class="tl-sep">·</span>
      <span>终身免费额度，无需预约</span>
      <span class="tl-sep">·</span>
      <span>专线接入，无需付费</span>
    </div>

    <div class="wrap">
      <header class="nav">
        <div class="brand">
          <span class="brand-mark">◆</span>
          <span class="brand-name">AURUM</span>
          <span class="brand-cn">金枢</span>
        </div>
        <div class="nav-right">
          <span class="nav-en">Private relay · Publicly free</span>
        </div>
      </header>

      <main class="main">
        <section class="hero">
          <p class="eyebrow">Aurum Private Relay</p>
          <h1>会员制？<em>不必。</em></h1>
          <div class="rule"><span>◆</span></div>
          <p class="hero-lead">
            欢迎来到 AURUM · 金枢。我们把主流模型聚成一条专线，以 OpenAI 兼容的方式向所有人敞开：
            不设门槛、不查余额、不做邀约。你只需一个 Base URL。
          </p>
          <p class="hero-free">◆ 完全免费 · 终身额度 · 无需预约 ◆</p>
        </section>

        <section class="panel access">
          <div class="panel-head">
            <span class="panel-title">接入信息</span>
            <span class="panel-en">Access Credentials</span>
            <span class="panel-tag">完全免费</span>
          </div>

          <div class="kv">
            <span class="kv-label">Base URL</span>
            <code class="kv-val">{{ r.baseUrl.value }}</code>
            <button class="btn-copy" @click="r.copyText(r.baseUrl.value, $event.currentTarget)">复制</button>
          </div>
          <div class="kv">
            <span class="kv-label">API Key</span>
            <code class="kv-val">{{ r.apiKey.value }}</code>
            <button class="btn-copy" @click="r.copyText(r.apiKey.value, $event.currentTarget)">复制</button>
          </div>

          <div class="eps">
            <div class="ep">
              <span class="ep-m">POST</span>
              <span class="ep-p">/v1/chat/completions</span>
              <span class="ep-n">对话补全</span>
            </div>
            <div class="ep">
              <span class="ep-m">POST</span>
              <span class="ep-p">/v1/responses</span>
              <span class="ep-n">Responses API</span>
            </div>
            <div class="ep">
              <span class="ep-m">GET</span>
              <span class="ep-p">/v1/models</span>
              <span class="ep-n">模型列表</span>
            </div>
          </div>

          <div class="models">
            <span class="models-label">可用模型</span>
            <span v-for="m in r.models.value" :key="m" class="chip">{{ m }}</span>
          </div>

          <p class="fine-note">
            密钥由页面本地生成并留在你的浏览器中，本站不做计费、不做额度核销；未识别的模型名会被原样接受。
          </p>
        </section>

        <section class="panel">
          <div class="panel-head">
            <span class="panel-title">尊享试用</span>
            <span class="panel-en">Complimentary Trial</span>
          </div>
          <p class="panel-note">无需注册，即可在此先行试跑专线；本次试用计费 ￥0.00。</p>

          <div class="form">
            <div class="field">
              <label>接入通道</label>
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
              <textarea v-model="r.msg.value" rows="3" placeholder="输入一句试试，例如：你好" />
            </div>
          </div>

          <div class="actions">
            <label class="check">
              <input v-model="r.stream.value" type="checkbox" />
              <span>流式输出（SSE）</span>
            </label>
            <button class="btn-gold" :disabled="r.sending.value || !r.msg.value.trim()" @click="r.send()">
              {{ r.sending.value ? '呈递中…' : '发送请求' }}
            </button>
          </div>

          <div class="resp">
            <div class="resp-head">
              <span class="resp-dot" :class="{ err: r.stats.err }"></span>
              <span class="resp-title">{{ r.stats.err ? '请求失败' : '响应' }}</span>
              <span class="resp-en">Response</span>
              <span v-if="r.stats.time !== '-'" class="resp-stat">{{ r.stats.time }} · {{ r.stats.speed }}</span>
            </div>
            <div v-if="r.output.meta" class="resp-meta">{{ r.output.meta }}</div>
            <div class="resp-body">{{ r.output.content }}</div>
            <div v-if="r.stats.time !== '-'" class="resp-grid">
              <span>提示 {{ r.stats.prompt }}</span>
              <span>补全 {{ r.stats.comp }}</span>
              <span>合计 {{ r.stats.total }}</span>
              <span>耗时 {{ r.stats.time }}</span>
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <span class="panel-title">接入代码</span>
            <span class="panel-en">Integration · cURL</span>
          </div>
          <p class="panel-note">把 Base URL 换成上方地址即可，其余照旧；密钥留空亦可通过。</p>
          <CodeBlock :code="samples.curl[0].code" />
        </section>

        <section class="faq">
          <div class="panel-head">
            <span class="panel-title">免费问答</span>
            <span class="panel-en">Frequently Asked</span>
          </div>
          <div class="faq-list">
            <div v-for="f in faqs" :key="f.q" class="faq-item">
              <div class="faq-q"><span class="diamond">◆</span>{{ f.q }}</div>
              <div class="faq-a">{{ f.a }}</div>
            </div>
          </div>
        </section>
      </main>

      <RelayTrust accent="#d4af37" accent2="#5a4a2a" bg="#0b0a0d" fg="#f3d99b" muted="#8a7a52" grid="rgba(212,175,55,.18)" border="rgba(212,175,55,.32)" radius="0px" font="Didot, 'Playfair Display', Georgia, serif" />

      <footer class="footer" data-skin-footer>
        <div class="footer-mark">◆ ◆ ◆</div>
        <p class="footer-line">AURUM · 金枢 · 免费私人专线中转</p>
        <p class="footer-fine">
          本站为第三方公益转发，与任何模型厂商无隶属或代理关系；AI 输出可能出错，请自行核实，
          按《永续运营承诺》长期运营：永久免费、永久开启、永不关站。
        </p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.skin{
  min-height:100vh;width:100%;display:flex;flex-direction:column;
  background:#08070a;
  background-image:radial-gradient(1100px 520px at 50% -8%, rgba(212,175,55,.055), transparent 62%);
  color:#cfc7b6;
  font-family:"Didot","Playfair Display",Georgia,"Songti SC","STSong","SimSun",serif;
  -webkit-font-smoothing:antialiased;
}
.wrap{flex:1;display:flex;flex-direction:column;width:100%;max-width:900px;margin:0 auto;padding:0 1.6rem}

/* ---------- 顶部免费提示 ---------- */
.topline{
  display:flex;align-items:center;justify-content:center;gap:.7rem;flex-wrap:wrap;
  padding:.6rem 1.2rem;font-size:.72rem;letter-spacing:.16em;color:rgba(243,217,155,.6);
  border-bottom:1px solid transparent;
  border-image:linear-gradient(90deg, rgba(212,175,55,.05), rgba(212,175,55,.5), rgba(212,175,55,.05)) 1;
}
.tl-free{color:#f3d99b;letter-spacing:.22em}
.tl-sep{color:rgba(212,175,55,.45)}

/* ---------- 品牌导航 ---------- */
.nav{
  display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;
  padding:1.7rem 0 1.6rem;
}
.brand{display:flex;align-items:baseline;gap:.55rem}
.brand-mark{color:#d4af37;font-size:.6rem}
.brand-name{font-size:1.06rem;letter-spacing:.34em;color:#f3d99b;font-weight:400}
.brand-cn{font-size:.74rem;letter-spacing:.3em;color:rgba(212,175,55,.72)}
.nav-en{font-size:.6rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(243,217,155,.42)}

/* ---------- 首屏 ---------- */
.main{flex:1}
.hero{padding:3.4rem 0 3.6rem;text-align:center}
.eyebrow{
  font-size:.64rem;letter-spacing:.3em;text-transform:uppercase;
  color:rgba(212,175,55,.7);margin-bottom:1.6rem;
}
h1{
  font-size:clamp(2.2rem,6vw,3.4rem);font-weight:300;line-height:1.22;
  letter-spacing:.06em;color:#f6f2e8;
}
h1 em{font-style:normal;color:#d4af37}
.rule{
  display:flex;align-items:center;justify-content:center;gap:.8rem;
  margin:1.9rem auto;max-width:340px;
}
.rule::before,.rule::after{
  content:"";height:1px;flex:1;
  background:linear-gradient(90deg, transparent, rgba(212,175,55,.55));
}
.rule::after{background:linear-gradient(90deg, rgba(212,175,55,.55), transparent)}
.rule span{font-size:.55rem;color:rgba(212,175,55,.8)}
.hero-lead{
  max-width:620px;margin:0 auto;font-size:.95rem;line-height:2.1;
  color:rgba(207,199,182,.82);letter-spacing:.04em;
}
.hero-free{
  margin-top:1.5rem;font-size:.72rem;letter-spacing:.3em;
  color:#f3d99b;text-transform:uppercase;
}

/* ---------- 金线面板 ---------- */
.panel{
  position:relative;margin-bottom:3rem;padding:2.1rem 1.9rem;
  border:1px solid transparent;
  border-image:linear-gradient(150deg, rgba(212,175,55,.42), rgba(212,175,55,.07) 34%, rgba(212,175,55,.07) 66%, rgba(212,175,55,.42)) 1;
}
.panel.access{
  border-image:linear-gradient(150deg, rgba(243,217,155,.62), rgba(212,175,55,.1) 38%, rgba(212,175,55,.1) 62%, rgba(243,217,155,.62)) 1;
}
.panel::before,.panel::after{
  content:"◆";position:absolute;font-size:.5rem;color:rgba(212,175,55,.55);
  background:#08070a;padding:0 .25rem;line-height:1;
}
.panel::before{top:-.28rem;left:1.4rem}
.panel::after{bottom:-.28rem;right:1.4rem}
.panel-head{display:flex;align-items:baseline;gap:.9rem;flex-wrap:wrap;margin-bottom:1.5rem}
.panel-title{font-size:1.02rem;font-weight:400;letter-spacing:.22em;color:#f3d99b}
.panel-en{font-size:.58rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(243,217,155,.38)}
.panel-tag{
  margin-left:auto;font-size:.6rem;letter-spacing:.24em;color:#d4af37;
  border:1px solid rgba(212,175,55,.4);padding:.22rem .6rem;
}
.panel-note{margin:-.7rem 0 1.5rem;font-size:.78rem;line-height:1.95;color:rgba(207,199,182,.6);letter-spacing:.03em}

/* ---------- 接入信息 ---------- */
.kv{
  display:flex;align-items:center;gap:.9rem;flex-wrap:wrap;
  padding:.85rem 0;border-bottom:1px solid rgba(212,175,55,.14);
}
.kv-label{
  font-size:.6rem;letter-spacing:.26em;text-transform:uppercase;
  color:rgba(212,175,55,.72);min-width:5.6rem;
}
.kv-val{
  flex:1;min-width:12rem;word-break:break-all;
  font-family:"SF Mono",Monaco,Consolas,"Courier New",monospace;
  font-size:.78rem;letter-spacing:.02em;color:#f3d99b;
}
.btn-copy{
  font-size:.64rem;letter-spacing:.24em;color:#d4af37;
  border:1px solid rgba(212,175,55,.38);padding:.26rem .7rem;
  transition:color .2s,border-color .2s,background .2s;
}
.btn-copy:hover{color:#f6f2e8;border-color:rgba(243,217,155,.7);background:rgba(212,175,55,.07)}

.eps{margin-top:1.6rem}
.ep{
  display:flex;align-items:center;gap:1rem;flex-wrap:wrap;
  padding:.7rem 0;border-bottom:1px solid rgba(212,175,55,.1);
}
.ep-m{font-size:.6rem;letter-spacing:.22em;color:rgba(212,175,55,.6);min-width:3.2rem}
.ep-p{
  flex:1;min-width:11rem;font-size:.78rem;color:#e8e0cd;
  font-family:"SF Mono",Monaco,Consolas,"Courier New",monospace;
}
.ep-n{font-size:.68rem;letter-spacing:.18em;color:rgba(207,199,182,.45)}

.models{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-top:1.6rem}
.models-label{font-size:.6rem;letter-spacing:.26em;text-transform:uppercase;color:rgba(212,175,55,.6);margin-right:.3rem}
.chip{
  font-size:.7rem;letter-spacing:.06em;color:#f3d99b;padding:.3rem .65rem;
  border:1px solid rgba(212,175,55,.26);
  font-family:"SF Mono",Monaco,Consolas,"Courier New",monospace;
}
.fine-note{margin-top:1.5rem;font-size:.72rem;line-height:2;color:rgba(207,199,182,.42);letter-spacing:.03em}

/* ---------- 尊享试用 ---------- */
.form{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:1.4rem 1.6rem}
.field.wide{grid-column:1/-1}
label{display:block;font-size:.62rem;letter-spacing:.26em;text-transform:uppercase;color:rgba(212,175,55,.72);margin-bottom:.6rem}
select,textarea{
  width:100%;background:#0b0a0d;color:#e8e0cd;
  border:1px solid rgba(212,175,55,.2);border-radius:0;
  padding:.62rem .7rem;font-size:.82rem;letter-spacing:.03em;outline:none;
  font-family:inherit;transition:border-color .2s,box-shadow .2s;
}
select{appearance:none;background-image:linear-gradient(45deg,transparent 50%,rgba(212,175,55,.7) 50%),linear-gradient(135deg,rgba(212,175,55,.7) 50%,transparent 50%);background-position:calc(100% - 1rem) 1.05rem,calc(100% - .7rem) 1.05rem;background-size:.3rem .3rem,.3rem .3rem;background-repeat:no-repeat}
select option{background:#0b0a0d;color:#e8e0cd}
select:focus,textarea:focus{border-color:rgba(243,217,155,.55);box-shadow:0 0 0 1px rgba(212,175,55,.18)}
textarea{resize:vertical;min-height:84px;line-height:1.9}
.actions{display:flex;align-items:center;justify-content:space-between;gap:1.2rem;flex-wrap:wrap;margin-top:1.6rem}
.check{display:flex;align-items:center;gap:.5rem;cursor:pointer;margin:0}
.check input{accent-color:#d4af37;width:13px;height:13px}
.check span{font-size:.68rem;letter-spacing:.2em;color:rgba(207,199,182,.68)}
.btn-gold{
  font-size:.72rem;letter-spacing:.28em;color:#f3d99b;
  border:1px solid rgba(212,175,55,.55);padding:.7rem 1.9rem;
  background:transparent;transition:color .2s,border-color .2s,background .2s,letter-spacing .2s;
}
.btn-gold:hover:not(:disabled){color:#fffdf6;border-color:rgba(243,217,155,.85);background:rgba(212,175,55,.08);letter-spacing:.32em}
.btn-gold:disabled{opacity:.4;cursor:not-allowed}

.resp{margin-top:2rem;padding:1.4rem 1.4rem 1.2rem;background:#0b0a0d;border:1px solid rgba(212,175,55,.16)}
.resp-head{display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;margin-bottom:1rem}
.resp-dot{width:5px;height:5px;background:#d4af37;transform:rotate(45deg)}
.resp-dot.err{background:#b4483f}
.resp-title{font-size:.86rem;letter-spacing:.22em;color:#f3d99b}
.resp-en{font-size:.56rem;letter-spacing:.3em;text-transform:uppercase;color:rgba(243,217,155,.32)}
.resp-stat{margin-left:auto;font-size:.68rem;letter-spacing:.1em;color:rgba(212,175,55,.72);font-family:"SF Mono",Monaco,Consolas,"Courier New",monospace}
.resp-meta{
  margin-bottom:.8rem;font-size:.68rem;line-height:1.8;word-break:break-all;
  color:rgba(207,199,182,.45);font-family:"SF Mono",Monaco,Consolas,"Courier New",monospace;
}
.resp-body{
  white-space:pre-wrap;word-break:break-word;font-size:.88rem;line-height:2.05;
  color:#ded7c6;letter-spacing:.03em;
}
.resp-grid{
  display:flex;flex-wrap:wrap;gap:.8rem 1.6rem;margin-top:1.2rem;padding-top:.9rem;
  border-top:1px solid rgba(212,175,55,.12);
  font-size:.68rem;letter-spacing:.14em;color:rgba(212,175,55,.62);
}

/* ---------- 免费问答 ---------- */
.faq{padding-bottom:1rem}
.faq-list{border-top:1px solid rgba(212,175,55,.1)}
.faq-item{padding:1.1rem 0;border-bottom:1px solid rgba(212,175,55,.1)}
.faq-q{display:flex;align-items:baseline;gap:.6rem;font-size:.9rem;letter-spacing:.1em;color:#f3d99b;margin-bottom:.5rem}
.diamond{font-size:.5rem;color:rgba(212,175,55,.7)}
.faq-a{font-size:.82rem;line-height:2.05;color:rgba(207,199,182,.66);letter-spacing:.03em;padding-left:1.1rem}

/* ---------- 页脚 ---------- */
.footer{
  margin-top:2rem;padding:3rem 0 3.4rem;text-align:center;cursor:default;
  border-top:1px solid transparent;
  border-image:linear-gradient(90deg, rgba(212,175,55,.04), rgba(212,175,55,.42), rgba(212,175,55,.04)) 1;
}
.footer-mark{font-size:.5rem;letter-spacing:.6em;color:rgba(212,175,55,.6);margin-bottom:1.1rem}
.footer-line{font-size:.72rem;letter-spacing:.28em;color:rgba(243,217,155,.6);margin-bottom:.9rem}
.footer-fine{
  font-size:12px;line-height:1.95;letter-spacing:.04em;
  color:rgba(207,199,182,.34);max-width:640px;margin:0 auto;
}

/* ---------- CodeBlock 黑金覆写 ---------- */
:deep(.code-block){
  background:#050506;border:1px solid transparent;border-radius:0;
  border-image:linear-gradient(120deg, rgba(212,175,55,.5), rgba(212,175,55,.1) 40%, rgba(212,175,55,.1) 60%, rgba(212,175,55,.5)) 1;
  color:#f3d99b;font-family:"SF Mono",Monaco,Consolas,"Courier New",monospace;
  font-size:.72rem;line-height:1.75;letter-spacing:.02em;
  padding:1.9rem .85rem .8rem;
}
:deep(.code-block pre){margin:0;white-space:pre}
:deep(.code-block code){font-family:inherit;color:inherit}
:deep(.copy-btn){
  background:#0b0a0d;color:#d4af37;border:1px solid rgba(212,175,55,.4);border-radius:0;
  font-size:.62rem;letter-spacing:.18em;padding:.18rem .5rem;
}
:deep(.copy-btn:hover){color:#f6f2e8;background:rgba(212,175,55,.1);border-color:rgba(243,217,155,.7)}
</style>
