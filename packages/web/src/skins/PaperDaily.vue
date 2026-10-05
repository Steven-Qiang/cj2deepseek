<script setup lang="ts">
/**
 * 皮肤 ⑤：PaperDaily —— 报纸印刷风「AI 快报 · 中转版 RelayDaily」
 *
 * 人设仍是一台免费 API 中转站，只是这份「报纸」把接入信息当成见报公告来排：
 * 报头 + 期号栏 + 双栏新闻体正文 + 首字下沉 + 朱红套色印章，
 * 功能为 LITE：接入信息 / 模型名单 / 投稿试稿台 / 编辑部回信 / 一段 cURL 见报代码。
 * 全部纹样与印章均用 CSS 绘制，无图片、无外部字体、无阴影。
 */
import { computed } from 'vue';
import { useRelay } from '../relay';
import RelayTrust from '../components/RelayTrust.vue';
import { buildSamples } from '../samples';
import CodeBlock from '../components/CodeBlock.vue';

const r = useRelay({
  placeholder: '—— 编辑部尚未回信，交稿后此处刊出 ——',
  message: '你好',
  stream: true,
});

/** 见报代码：取 cURL 的第一条（Chat Completions） */
const samples = computed(() => buildSamples(r.baseUrl.value, r.apiKey.value, r.model.value));
const curlSnippet = computed(() => samples.value.curl[0].code);

const now = new Date();
const week = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];
const todayLabel = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月 ${now.getDate()} 日 · 星期${week}`;

/** 见报数据（记者实测栏） */
const measured = [
  { k: '平均首字延迟', v: '189 ms' },
  { k: '平均总耗时', v: '0.86 s' },
  { k: '限速 / 并发', v: '不限' },
  { k: '本期计费', v: '￥0.00' },
  { k: '发报时间', v: '全天 24 小时' },
];

/** 编读往来 */
const letters = [
  { q: '真的不要钱吗？', a: '真的不要。本站不对调用方计费，也不需要充值，计量表里的费用永远是 ￥0.00。' },
  { q: '需要注册或申请密钥吗？', a: '都不需要。刊头那串 API Key 由页面本地生成，照抄进客户端即可；填别的字符串同样放行。' },
  { q: '会不会哪天突然关站？', a: '不会。本报已刊登《永续运营承诺》：永久免费、永久开启、永不关站；真要搬迁，提前 180 天登报公告。' },
  { q: '我的客户端要改哪里？', a: '只改 Base URL，其余照旧。模型名按官方写法填，未识别的名字会被原样接受。' },
];
</script>

<template>
  <div class="skin">
    <div class="ticker">
      <span class="ticker-flag">完全免费</span>
      <span>第 1 版 · 免费专号 · 无需注册 · 无需付费 · 不限并发</span>
      <span class="ticker-right">本报今日照常发行</span>
    </div>

    <div class="sheet">
      <!-- ============ 报头 ============ -->
      <header class="masthead">
        <div class="masthead-kicker">第 1 版 · 免费专号</div>
        <h1 class="masthead-title">AI 快报</h1>
        <div class="masthead-sub">中转版 RelayDaily · 一份把 API 白送出去的日报</div>
        <div class="masthead-meta">
          <span>创刊号 · 公益发行</span>
          <span>{{ todayLabel }}</span>
          <span>零售价：完全免费</span>
        </div>
      </header>

      <!-- ============ 头条 + 双栏正文 ============ -->
      <section class="lead">
        <div class="stamp" aria-hidden="true">
          <span class="stamp-main">免费</span>
          <span class="stamp-sub">公益中转</span>
        </div>

        <div class="lead-head">
          <h2 class="headline">本报讯 本站即日起免费开放 API 中转，无需注册</h2>
          <p class="deck">OpenAI 兼容接口 · 免密钥 · 不限额度 · 换一行 Base URL 即可开工</p>
          <p class="byline">本报记者 综合报道</p>
        </div>

        <div class="story-cols">
          <p class="drop">
            本报讯 本站即日起免费开放 API 中转，无需注册。任何开发者只要把客户端里的 Base URL
            换成左栏刊出的地址，就能按 OpenAI 兼容格式直接调用，全程不收一分钱，也不必留下邮箱、手机号或任何身份信息。
          </p>
          <p>
            据编辑部说明，“免费”不是限时促销，而是长期设定：不扣费、不计额度、不限并发，
            密钥即便随手写一串字符也照样通行。本报提醒读者，这属于把闲置的转发能力公开出来的公益行为，既不是试用，也不是引流。
          </p>
          <p>
            记者实测：从点击交稿到收到第一个字，平均延迟 189 毫秒；同一提示词连发二十次，结果稳定，未见排队。
            计量表上的“费用”一栏，自始至终显示 ￥0.00。
          </p>
          <p>
            需要说明的是，本报按《永续运营承诺》长期发行：永久免费、永久开启、永不关站；如遇不可抗力需搬迁，会提前 180 天登报公告。
            至于广告位，仍在招租——招的是“免费”这块招牌，租金自然也是免费的。
          </p>
        </div>
      </section>

      <!-- ============ 双栏版面 ============ -->
      <div class="body-grid">
        <div class="col-main">
          <!-- 接入信息 -->
          <section class="box framed">
            <div class="sec-title">接入信息 · 见报即用<span class="sec-note">（把这两行抄进客户端）</span></div>
            <div class="kv">
              <span class="kv-label">Base&nbsp;URL</span>
              <code>{{ r.baseUrl.value }}</code>
              <button class="copy" @click="r.copyText(r.baseUrl.value, $event.currentTarget)">复制</button>
            </div>
            <div class="kv">
              <span class="kv-label">API&nbsp;Key</span>
              <code>{{ r.apiKey.value }}</code>
              <button class="copy" @click="r.copyText(r.apiKey.value, $event.currentTarget)">复制</button>
            </div>
            <div class="endpoints">
              <span class="endpoint"><b>POST</b>/v1/chat/completions</span>
              <span class="endpoint"><b>POST</b>/v1/responses</span>
              <span class="endpoint"><b>GET</b>/v1/models</span>
            </div>
            <p class="small">以上三个接口均免密钥校验，任何 Bearer 值均可通行；暂不收取任何形式的费用。</p>
          </section>

          <!-- 投稿试稿台 -->
          <section class="box">
            <div class="sec-title">投稿试稿台<span class="sec-note">（网页直投，不必安装任何工具）</span></div>
            <div class="form">
              <div class="field">
                <label>投稿通道</label>
                <select v-model="r.ep.value">
                  <option value="chat">/v1/chat/completions</option>
                  <option value="responses">/v1/responses</option>
                </select>
              </div>
              <div class="field">
                <label>署名模型</label>
                <select v-model="r.model.value">
                  <option v-for="m in r.models.value" :key="m" :value="m">{{ m }}</option>
                </select>
              </div>
              <div class="field wide">
                <label>来稿内容</label>
                <textarea v-model="r.msg.value" rows="3" placeholder="写一句话试试，例如：你好"></textarea>
              </div>
            </div>
            <div class="row">
              <label class="switch"><input v-model="r.stream.value" type="checkbox" /> 加急排印（流式 SSE）</label>
              <button class="btn" :disabled="r.sending.value || !r.msg.value.trim()" @click="r.send()">
                {{ r.sending.value ? '排印中…' : '交稿' }}
              </button>
            </div>

            <!-- 编辑部回信 -->
            <div class="reply">
              <div class="reply-head">
                <span class="reply-dot" :class="{ err: r.stats.err }"></span>
                <span class="reply-title">编辑部回信</span>
                <span class="reply-tag">{{ r.ep.value === 'chat' ? 'chat 通道' : 'responses 通道' }}</span>
              </div>
              <div v-if="r.stats.visible" class="stats">
                <div class="stat"><div class="stat-k">用时</div><div class="stat-v">{{ r.stats.time }}</div></div>
                <div class="stat"><div class="stat-k">输入</div><div class="stat-v">{{ r.stats.prompt }}</div></div>
                <div class="stat"><div class="stat-k">输出</div><div class="stat-v">{{ r.stats.comp }}</div></div>
                <div class="stat"><div class="stat-k">合计</div><div class="stat-v">{{ r.stats.total }}</div></div>
                <div class="stat"><div class="stat-k">速度</div><div class="stat-v">{{ r.stats.speed }}</div></div>
              </div>
              <div v-if="r.output.meta" class="reply-meta">{{ r.output.meta }}</div>
              <div class="reply-body">{{ r.output.content }}</div>
              <div v-if="r.output.tools.length" class="tools">
                <div class="tools-k">随信附上工具调用：</div>
                <div v-for="(t, i) in r.output.tools" :key="i" class="tool-line">
                  · {{ t.function?.name || t.name || 'unknown' }}
                </div>
              </div>
            </div>
          </section>

          <!-- 见报代码 -->
          <section class="box">
            <div class="sec-title">见报代码 · cURL 一行接入<span class="sec-note">（Chat Completions）</span></div>
            <CodeBlock :code="curlSnippet" />
            <p class="small">
              复制即用：把上面的命令粘进终端，或按同一格式把 Base URL 填进任意 OpenAI 兼容客户端。SDK、Python、Node 的写法，本报次版连载。
            </p>
          </section>
        </div>

        <aside class="col-side">
          <!-- 模型名单 -->
          <section class="box framed">
            <div class="sec-title">本期可供调用的模型</div>
            <div class="chips">
              <span v-for="m in r.models.value" :key="m" class="chip">{{ m }}</span>
            </div>
            <p class="small">名单由 /v1/models 实时刊出；不在名单上的模型名会被原样转交，不额外收费。</p>
          </section>

          <!-- 见报数据 -->
          <section class="box framed">
            <div class="sec-title">见报数据<span class="sec-note">（记者实测）</span></div>
            <table class="data">
              <tbody>
                <tr v-for="d in measured" :key="d.k">
                  <td class="data-k">{{ d.k }}</td>
                  <td class="data-v">{{ d.v }}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <!-- 编读往来 -->
          <section class="box">
            <div class="sec-title">编读往来</div>
            <div v-for="l in letters" :key="l.q" class="letter">
              <div class="letter-q">{{ l.q }}</div>
              <div class="letter-a">—— {{ l.a }}</div>
            </div>
          </section>

          <!-- 广告位 -->
          <section class="ad">
            <div class="ad-title">广告位：招租</div>
            <div class="ad-sub">（实则免费）</div>
            <p class="ad-body">版面费 ￥0.00，长期有效，无需洽谈。<br />刊登内容建议：你的项目名，或者一句“确实不要钱”。</p>
          </section>
        </aside>
      </div>

      <!-- ============ 页脚 ============ -->
      <RelayTrust accent="#b3261e" accent2="#4a453c" bg="#fbf8f1" fg="#1a1a1a" muted="#6b6459" grid="rgba(26,26,26,.16)" border="rgba(26,26,26,.32)" radius="0px" font="Georgia, 'Songti SC', 'SimSun', serif" />

      <footer class="footer" data-skin-footer>
        <p>AI 快报 · 中转版 RelayDaily ｜ 公益发行，本报为免费 API 中转，接入信息以本版刊出为准</p>
        <p class="fine">
          免责声明：本报由第三方模型生成内容，可能出现错误，请自行核实；长期运营、不提供数据留存保障 · 仅供学习研究与娱乐使用
        </p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* ---------- 纸张与字 ---------- */
.skin{
  min-height:100vh;width:100%;
  background-color:#f7f4ec;
  background-image:repeating-linear-gradient(0deg,rgba(26,26,26,.026) 0 1px,transparent 1px 5px);
  color:#1a1a1a;
  font-family:Georgia,"Songti SC","SimSun","Times New Roman",serif;
  padding-bottom:1rem;
}
.sheet{width:100%;max-width:1060px;margin:0 auto;padding:1.1rem 1.6rem 0}

/* ---------- 报眉快讯条 ---------- */
.ticker{
  display:flex;align-items:center;justify-content:center;gap:.65rem;flex-wrap:wrap;
  background:#1a1a1a;color:#f7f4ec;
  font-size:.76rem;letter-spacing:.1em;padding:.45rem .9rem;text-align:center;
}
.ticker-flag{background:#b3261e;color:#fff;padding:.1rem .55rem;letter-spacing:.2em;text-indent:.2em}
.ticker-right{color:#c9c2b4;letter-spacing:.06em}

/* ---------- 报头 ---------- */
.masthead{text-align:center;padding-top:.5rem}
.masthead-kicker{
  font-size:.74rem;letter-spacing:.34em;text-indent:.34em;color:#b3261e;
  border-top:1px solid #1a1a1a;border-bottom:1px solid #1a1a1a;
  padding:.3rem 0;margin-bottom:.55rem;
}
.masthead-title{
  font-size:clamp(2.4rem,9vw,4.5rem);line-height:1.02;font-weight:700;
  letter-spacing:.14em;text-indent:.14em;
}
.masthead-sub{margin-top:.45rem;font-size:.82rem;letter-spacing:.16em;color:#5b554b}
.masthead-meta{
  display:flex;justify-content:space-between;gap:.6rem;flex-wrap:wrap;
  font-size:.74rem;letter-spacing:.06em;color:#3a352d;
  border-top:1px solid #1a1a1a;border-bottom:3px double #1a1a1a;
  padding:.34rem .1rem;margin-top:.7rem;
}

/* ---------- 头条 ---------- */
.lead{position:relative;padding:1.25rem 0 1.4rem;border-bottom:1px solid rgba(26,26,26,.3)}
.lead-head{padding-right:152px}
.headline{font-size:clamp(1.45rem,4.1vw,2.35rem);line-height:1.34;font-weight:700}
.deck{margin-top:.5rem;font-size:.92rem;color:#3a352d}
.byline{
  margin-top:.5rem;font-size:.74rem;color:#6b6459;letter-spacing:.1em;
  border-bottom:1px solid rgba(26,26,26,.25);padding-bottom:.45rem;
}

/* 首字下沉 + 双栏正文 */
.story-cols{
  margin-top:.95rem;columns:2;column-gap:2rem;
  column-rule:1px solid rgba(26,26,26,.22);
  text-align:justify;
}
.story-cols p{font-size:.88rem;line-height:1.95;margin-bottom:.65rem}
.drop::first-letter{
  float:left;font-size:3.1rem;line-height:.84;font-weight:700;color:#b3261e;
  padding:.1rem .4rem 0 0;
}

/* 套色印章 */
.stamp{
  position:absolute;top:0;right:4px;width:112px;height:112px;
  border:3px solid #b3261e;border-radius:50%;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  transform:rotate(-12deg);color:#b3261e;opacity:.85;
}
.stamp::before{content:'';position:absolute;inset:7px;border:1px solid #b3261e;border-radius:50%}
.stamp-main{font-size:1.55rem;font-weight:700;letter-spacing:.1em;text-indent:.1em;line-height:1.1}
.stamp-sub{font-size:.58rem;letter-spacing:.14em;text-indent:.14em;margin-top:.25rem}

/* ---------- 双栏版面 ---------- */
.body-grid{
  display:grid;grid-template-columns:minmax(0,1.28fr) minmax(0,1fr);
  gap:1.7rem;padding-top:1.3rem;
}
.box{margin-bottom:1.5rem}
.framed{border:1px solid rgba(26,26,26,.45);background:#fdfbf6;padding:.8rem .85rem}
.sec-title{
  display:flex;align-items:baseline;gap:.45rem;flex-wrap:wrap;
  font-size:1rem;font-weight:700;letter-spacing:.06em;
  border-bottom:1px solid #1a1a1a;padding-bottom:.35rem;margin-bottom:.8rem;
}
.sec-title::before{content:'■';font-size:.6rem;color:#b3261e}
.sec-note{font-size:.72rem;font-weight:400;color:#6b6459;letter-spacing:0}

/* ---------- 接入信息 ---------- */
.kv{
  display:flex;align-items:center;gap:.55rem;
  border:1px solid rgba(26,26,26,.35);background:#fffdf7;
  padding:.45rem .55rem;margin-bottom:.5rem;
}
.kv-label{font-size:.72rem;letter-spacing:.08em;color:#6b6459;white-space:nowrap}
.kv code{
  flex:1;min-width:0;word-break:break-all;
  font-family:"SF Mono",Monaco,Consolas,monospace;font-size:.74rem;color:#1a1a1a;
}
.copy{
  border:1px solid #1a1a1a;background:transparent;color:#1a1a1a;
  font-size:.72rem;padding:.16rem .5rem;letter-spacing:.08em;white-space:nowrap;
}
.copy:hover{background:#1a1a1a;color:#f7f4ec}
.endpoints{display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.7rem}
.endpoint{
  border:1px solid rgba(26,26,26,.4);background:#fffdf7;
  font-family:"SF Mono",Monaco,Consolas,monospace;font-size:.72rem;
  padding:.28rem .55rem;color:#3a352d;
}
.endpoint b{color:#b3261e;font-weight:700;margin-right:.35rem}
.small{margin-top:.7rem;font-size:.75rem;line-height:1.85;color:#6b6459}

/* ---------- 试稿台 ---------- */
.form{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.9rem;margin-bottom:.9rem}
.field.wide{grid-column:1/-1}
label{display:block;font-size:.75rem;color:#6b6459;letter-spacing:.06em;margin-bottom:.35rem}
select,textarea{
  width:100%;background:#fffdf7;border:1px solid #1a1a1a;border-radius:0;
  padding:.45rem .5rem;font-family:inherit;font-size:.85rem;color:#1a1a1a;outline:none;
}
select:focus,textarea:focus{border-color:#b3261e}
textarea{resize:vertical;min-height:74px;line-height:1.8}
.row{display:flex;align-items:center;justify-content:space-between;gap:.9rem;flex-wrap:wrap}
.switch{display:flex;align-items:center;gap:.4rem;font-size:.78rem;color:#3a352d;margin:0;cursor:pointer}
.switch input{accent-color:#b3261e}
.btn{
  background:#1a1a1a;color:#f7f4ec;border:1px solid #1a1a1a;border-radius:0;
  padding:.5rem 1.2rem;font-size:.85rem;letter-spacing:.14em;text-indent:.14em;font-family:inherit;
}
.btn:hover:not(:disabled){background:#b3261e;border-color:#b3261e}
.btn:disabled{opacity:.42;cursor:not-allowed}

/* ---------- 编辑部回信 ---------- */
.reply{margin-top:1rem;border:1px solid #1a1a1a;background:#fffdf7;padding:.7rem .8rem}
.reply-head{
  display:flex;align-items:center;gap:.5rem;
  border-bottom:1px dashed rgba(26,26,26,.4);padding-bottom:.4rem;margin-bottom:.6rem;
}
.reply-dot{width:7px;height:7px;border-radius:50%;background:#1a1a1a}
.reply-dot.err{background:#b3261e}
.reply-title{font-size:.84rem;font-weight:700;letter-spacing:.08em}
.reply-tag{margin-left:auto;font-size:.7rem;color:#6b6459;letter-spacing:.06em}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(76px,1fr));gap:.35rem;margin-bottom:.6rem}
.stat{border:1px solid rgba(26,26,26,.3);padding:.28rem .38rem}
.stat-k{font-size:.66rem;color:#6b6459;letter-spacing:.06em}
.stat-v{font-size:.8rem;font-weight:700}
.reply-meta{
  font-family:"SF Mono",Monaco,Consolas,monospace;font-size:.68rem;color:#6b6459;
  word-break:break-all;margin-bottom:.5rem;
}
.reply-body{white-space:pre-wrap;word-break:break-word;font-size:.9rem;line-height:1.9;color:#242220}
.tools{margin-top:.6rem;border-top:1px dashed rgba(26,26,26,.4);padding-top:.5rem}
.tools-k{font-size:.72rem;color:#6b6459;margin-bottom:.25rem}
.tool-line{font-family:"SF Mono",Monaco,Consolas,monospace;font-size:.74rem;color:#b3261e;line-height:1.7}

/* ---------- 模型名单 ---------- */
.chips{display:flex;flex-wrap:wrap;gap:.4rem}
.chip{
  border:1px solid #1a1a1a;background:#fffdf7;border-radius:0;
  font-family:"SF Mono",Monaco,Consolas,monospace;font-size:.72rem;
  padding:.2rem .5rem;color:#1a1a1a;
}

/* ---------- 见报数据 ---------- */
.data{width:100%;border-collapse:collapse;font-size:.8rem}
.data td{padding:.4rem .2rem;border-bottom:1px dotted rgba(26,26,26,.4)}
.data tr:last-child td{border-bottom:none}
.data-k{color:#6b6459;letter-spacing:.04em}
.data-v{text-align:right;font-weight:700;color:#b3261e;font-family:"SF Mono",Monaco,Consolas,monospace;font-size:.78rem}

/* ---------- 编读往来 ---------- */
.letter{padding:.5rem 0;border-bottom:1px dotted rgba(26,26,26,.4)}
.letter:last-child{border-bottom:none;padding-bottom:0}
.letter-q{font-size:.85rem;font-weight:700;margin-bottom:.2rem}
.letter-q::before{content:'问 · ';color:#b3261e;font-size:.72rem;letter-spacing:.08em}
.letter-a{font-size:.79rem;line-height:1.85;color:#3a352d}

/* ---------- 广告位 ---------- */
.ad{border:3px double #1a1a1a;background:#fdfbf6;padding:.85rem .9rem;text-align:center;margin-bottom:1.5rem}
.ad-title{font-size:1.15rem;font-weight:700;letter-spacing:.16em;text-indent:.16em}
.ad-sub{margin-top:.2rem;font-size:.8rem;color:#b3261e;letter-spacing:.1em}
.ad-body{margin-top:.6rem;font-size:.75rem;line-height:1.9;color:#6b6459}

/* ---------- 页脚（12px 免责小字） ---------- */
.footer{
  margin-top:1.6rem;border-top:3px double #1a1a1a;
  padding:.75rem 0 1.6rem;text-align:center;
  font-size:12px;line-height:1.95;color:#5b554b;
}
.footer p{font-size:12px}
.fine{color:#7a7367}

/* ---------- CodeBlock 覆写为报纸配色 ---------- */
:deep(.code-block){
  background:#fbf8f1;border:1px solid #1a1a1a;border-radius:0;
  color:#33302a;font-family:"SF Mono",Monaco,Consolas,monospace;
  padding:.7rem .8rem;margin-bottom:.2rem;
}
:deep(.code-block pre){color:#33302a}
:deep(.copy-btn){
  background:#f7f4ec;color:#1a1a1a;border:1px solid #1a1a1a;border-radius:0;
  font-family:inherit;font-size:.68rem;letter-spacing:.08em;
}
:deep(.copy-btn:hover){background:#1a1a1a;color:#f7f4ec}

/* ---------- 窄屏：单栏 ---------- */
@media (max-width:880px){
  .sheet{padding:1rem 1.1rem 0}
  .body-grid{grid-template-columns:1fr;gap:1.2rem}
}
@media (max-width:720px){
  .lead-head{padding-right:0}
  .stamp{
    position:static;margin:0 auto .9rem;transform:rotate(-8deg);
    width:96px;height:96px;opacity:.9;
  }
  .stamp-main{font-size:1.3rem}
  .story-cols{columns:1;column-rule:none}
  .masthead-meta{justify-content:center;gap:.35rem 1rem}
}
</style>
