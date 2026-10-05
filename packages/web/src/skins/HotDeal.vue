<script setup lang="ts">
/**
 * 皮肤 ④：HotDeal —— 火红营销派对风「福利中转站 · FREESLOT」
 * 大促会场的长相：顶部跑马灯、倒计时条、0 元券卡片堆叠，但所有"活动"都自洽地落在"免费"上。
 * 功能级别 LITE：接入信息 + 在线调试台 + 一条 cURL 接入代码。
 */
import { computed, ref } from 'vue';
import { useRelay } from '../relay';
import RelayTrust from '../components/RelayTrust.vue';
import { buildSamples } from '../samples';
import CodeBlock from '../components/CodeBlock.vue';

const r = useRelay({
  placeholder: '// 点右边的「0 元开跑」试一下，响应会出现在这里',
  message: '你好，介绍一下这个福利站',
});

/** 跑马灯文案（两侧重复以实现无缝滚动） */
const marquee = [
  '🔥 全场免费 0 元',
  '限时加赠：免费额度永久有效',
  '免注册 · 免密钥 · 不限并发',
  '充得越多送得越多？不用充，本来就免费',
  '本贴抽 7 位幸运佬友送无限额度',
];

/** 券卡（点一下纯本地"到账"，花钱的地方一律是 0） */
const coupons = [
  { name: '0 元券', sub: '全模型通用 · 不限额度', tag: '人人可领', off: '免 ¥999' },
  { name: '免费券', sub: '免注册 · 免密钥 · 免充值', tag: '无限刷新', off: '永久有效' },
  { name: '新人礼', sub: 'Base URL 填上就能跑', tag: '限时加赠', off: '加赠无限' },
];
const claimed = ref(false);

const snippet = computed(
  () => buildSamples(r.baseUrl.value, r.apiKey.value, r.model.value).curl[0].code,
);

const faqs = [
  {
    q: '充值有优惠吗？满 100 减 50 那种？',
    a: '没有充值入口，因为整站不收费。所谓"优惠"就是一直 0 元：额度不扣、并发不限、也不用抢，刷新一下又是满额。',
  },
  {
    q: '免费额度会过期吗？',
    a: '不会。倒计时条走完只是"刷新"一次，刷新完还是免费的，所以看到 00:00:00 也不用慌，更不用付款续期。',
  },
  {
    q: '需要注册、绑手机号或者加群领券吗？',
    a: '都不用。上面那串 API Key 是浏览器本地生成的，客户端里填任意字符串也能通过；本站没有任何群、没有二维码、也没有下载。',
  },
  {
    q: '真的能接到自己的项目里吗？',
    a: '可以。OpenAI 兼容接口，只把 Base URL 换成这里的地址即可，/v1/chat/completions、/v1/responses、/v1/models 三个口都通。',
  },
];

const clients = ['OpenAI SDK', 'Cherry Studio', 'NextChat', 'LangChain', 'OpenCode', 'Dify', 'LobeChat', 'Codex'];
</script>

<template>
  <div class="skin">
    <!-- 顶部跑马灯 -->
    <div class="marquee">
      <div class="mq-track">
        <div class="mq-group">
          <span v-for="(t, i) in marquee" :key="i" class="mq-item">{{ t }}</span>
        </div>
        <div class="mq-group" aria-hidden="true">
          <span v-for="(t, i) in marquee" :key="'b' + i" class="mq-item">{{ t }}</span>
        </div>
      </div>
    </div>

    <!-- 导航 -->
    <header class="nav">
      <div class="logo">
        <span class="logo-mark">福</span>
        <span class="logo-name">福利中转站</span>
        <span class="logo-tag">FREESLOT</span>
      </div>
      <div class="nav-right">
        <span class="live"><i></i>万人同抢 · 无需排队</span>
        <a class="cta-sm" href="#access">免费领取</a>
      </div>
    </header>

    <main class="main">
      <!-- 第一屏 -->
      <section class="hero">
        <div class="free-callout">
          <span class="fc-fire">🔥</span>
          <b>完全免费</b>
          <span class="fc-txt">0 元起，一直免费 —— 不充值、不拼团、不拉人</span>
        </div>
        <h1>
          福利中转站
          <span class="h1-sub">FREE<span class="grad">SLOT</span></span>
        </h1>
        <p class="hero-sub">
          别人做大促，我们做"免促"：OpenAI 兼容接口，Base URL 换过来就能用。
          没有满减、没有尾款、没有首充礼包，价格从头到尾都是 <b class="gold">¥0</b>。
        </p>
        <div class="triple">
          <span>免注册</span><i>·</i><span>免密钥</span><i>·</i><span>不限额度</span><i>·</i><span>不限并发</span>
        </div>

        <!-- 倒计时条（静态数字 + CSS 动画，不跑定时器） -->
        <div class="countdown">
          <div class="cd-head">
            <span class="cd-label">距离本次免费额度刷新还剩</span>
            <span class="cd-time">02:47:19</span>
          </div>
          <div class="cd-track"><span class="cd-fill"></span></div>
          <div class="cd-note">刷新后依然是满额免费，所以这个倒计时只负责热闹 🎉</div>
        </div>
      </section>

      <!-- 满减券卡片 -->
      <section class="coupons">
        <div v-for="c in coupons" :key="c.name" class="coupon">
          <div class="cp-left">
            <div class="cp-off">{{ c.off }}</div>
            <div class="cp-tag">{{ c.tag }}</div>
          </div>
          <div class="cp-cut"></div>
          <div class="cp-right">
            <div class="cp-name">{{ c.name }}</div>
            <div class="cp-sub">{{ c.sub }}</div>
            <button class="cp-btn" :class="{ done: claimed }" @click="claimed = true">
              {{ claimed ? '已到账 · 永久有效' : '免费领取' }}
            </button>
          </div>
        </div>
        <p class="cp-note">券只是气氛组：不用凑单、不用凑人数，本来就不花钱。</p>
      </section>

      <!-- 接入信息 -->
      <section id="access" class="card access">
        <div class="card-head">
          <span class="card-title">🎁 领取后的接入信息</span>
          <span class="badge-free">FREE</span>
        </div>
        <div class="kv">
          <span class="kv-label">Base URL</span>
          <code>{{ r.baseUrl.value }}</code>
          <button class="pill" @click="r.copyText(r.baseUrl.value, $event.currentTarget)">复制</button>
        </div>
        <div class="kv">
          <span class="kv-label">API Key</span>
          <code>{{ r.apiKey.value }}</code>
          <button class="pill" @click="r.copyText(r.apiKey.value, $event.currentTarget)">复制</button>
        </div>
        <div class="endpoints">
          <span class="endpoint"><b>POST</b>/v1/chat/completions</span>
          <span class="endpoint"><b>POST</b>/v1/responses</span>
          <span class="endpoint"><b>GET</b>/v1/models</span>
        </div>
        <div class="sub-title">可选模型（点开你的客户端照着填）</div>
        <div class="chips">
          <span v-for="m in r.models.value" :key="m" class="chip">{{ m }}</span>
        </div>
      </section>

      <!-- 在线调试台 -->
      <section class="card">
        <div class="card-title">🔥 在线调试台 <span class="muted">（先在这儿白嫖一次，再接到项目里）</span></div>
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
            <textarea v-model="r.msg.value" rows="3" placeholder="输入一句话，比如：你好"></textarea>
          </div>
        </div>
        <div class="row">
          <label class="switch"><input v-model="r.stream.value" type="checkbox" /> 流式输出（SSE）</label>
          <button class="cta" :disabled="r.sending.value || !r.msg.value.trim()" @click="r.send()">
            {{ r.sending.value ? '正在抢…' : '0 元开跑 →' }}
          </button>
        </div>

        <div class="out">
          <div class="out-head">
            <span class="dot" :class="{ err: r.stats.err }"></span>
            <span class="out-title">{{ r.stats.err ? '请求失败' : '响应结果' }}</span>
            <span v-if="r.stats.visible" class="out-stats">
              {{ r.stats.time }} · in {{ r.stats.prompt }} / out {{ r.stats.comp }} / 共 {{ r.stats.total }} · {{ r.stats.speed }}
            </span>
          </div>
          <div v-if="r.output.meta" class="out-meta">{{ r.output.meta }}</div>
          <div class="out-body">{{ r.output.content }}</div>
        </div>
      </section>

      <!-- 接入代码 -->
      <section class="card">
        <div class="card-title">📦 一行 cURL 就能跑通</div>
        <CodeBlock :code="snippet" />
        <div class="clients">
          <span class="clients-label">佬友们已经在用：</span>
          <span v-for="c in clients" :key="c" class="client">{{ c }}</span>
        </div>
      </section>

      <!-- 免费说明 / FAQ -->
      <section class="card faq-card">
        <div class="card-title">🧨 大家最想问的几件事</div>
        <div v-for="f in faqs" :key="f.q" class="faq-item">
          <div class="faq-q">{{ f.q }}</div>
          <div class="faq-a">{{ f.a }}</div>
        </div>
        <p class="final-line">限时加赠：免费额度永久有效 —— 因为从来就没有收费档位。</p>
      </section>
    </main>

    <RelayTrust width="1000px" accent="#ffc53d" accent2="#8a2a20" bg="rgba(34,10,12,.72)" fg="#ffe9d6" muted="#c08a7a" grid="rgba(255,157,46,.16)" border="rgba(255,157,46,.32)" radius="14px" />

    <footer class="footer" data-skin-footer>
      <p>福利中转站 · FREESLOT · 公益转发 · 由第三方模型提供能力，AI 可能出错，请自行核实</p>
      <p class="fine">
        本站全部"活动"均为玩梗，不涉及任何真实交易、收款、社群或下载，页面也没有任何外部链接；
        长期运营 · 永久免费 · 如遇不可抗力将提前 180 天公告 · 仅供学习研究与娱乐使用
      </p>
    </footer>
  </div>
</template>

<style scoped>
.skin{
  min-height:100vh;width:100%;display:flex;flex-direction:column;
  font-family:"PingFang SC","Microsoft YaHei",Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  color:#ffe7d6;
  background:
    radial-gradient(circle at 12% 4%,rgba(255,61,61,.30),transparent 45%),
    radial-gradient(circle at 88% 2%,rgba(255,157,46,.24),transparent 42%),
    radial-gradient(circle at 50% 108%,rgba(255,61,61,.20),transparent 55%),
    #12060b;
}
/* ---------- 跑马灯 ---------- */
.marquee{
  overflow:hidden;border-bottom:1px solid rgba(255,61,61,.35);
  background:linear-gradient(90deg,#ff3d3d,#ff9d2e);color:#2a0505;
}
.mq-track{display:flex;width:max-content;animation:mq 26s linear infinite}
.mq-group{display:flex;gap:2.4rem;padding:.42rem 2.4rem .42rem 0}
.mq-item{font-size:.76rem;font-weight:800;letter-spacing:.02em;white-space:nowrap}
@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ---------- 导航 ---------- */
.nav{
  display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;
  padding:1rem 1.5rem;max-width:960px;width:100%;margin:0 auto;
}
.logo{display:flex;align-items:center;gap:.5rem}
.logo-mark{
  width:30px;height:30px;border-radius:10px;display:flex;align-items:center;justify-content:center;
  font-size:.92rem;font-weight:900;color:#2a0505;background:linear-gradient(135deg,#ff3d3d,#ffc53d);
  box-shadow:0 0 0 1px rgba(255,197,61,.5),0 6px 18px rgba(255,61,61,.35);
}
.logo-name{font-weight:900;font-size:1.05rem;letter-spacing:.01em;color:#fff2e6}
.logo-tag{
  font-size:.62rem;font-weight:800;letter-spacing:.12em;color:#ffc53d;
  border:1px solid rgba(255,197,61,.5);border-radius:999px;padding:.1rem .5rem;
}
.nav-right{display:flex;align-items:center;gap:.75rem;flex-wrap:wrap}
.live{display:flex;align-items:center;gap:.35rem;font-size:.75rem;color:#ffb08a}
.live i{width:7px;height:7px;border-radius:50%;background:#ff3d3d;box-shadow:0 0 8px #ff3d3d;animation:blink 1.6s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}
.cta-sm{
  font-size:.78rem;font-weight:800;color:#2a0505;border-radius:999px;padding:.4rem 1rem;
  background:linear-gradient(135deg,#ffc53d,#ff9d2e);
  box-shadow:0 0 0 1px rgba(255,197,61,.5),0 6px 18px rgba(255,157,46,.3);
}
.cta-sm:hover{filter:brightness(1.08)}

/* ---------- 主体 ---------- */
.main{flex:1;width:100%;max-width:820px;margin:0 auto;padding:.6rem 1.4rem 2rem}
.hero{text-align:center;padding:.8rem 0 1.2rem}
.free-callout{
  display:inline-flex;align-items:center;gap:.5rem;flex-wrap:wrap;justify-content:center;
  border-radius:999px;padding:.42rem 1.1rem;margin-bottom:1rem;font-size:.82rem;
  background:rgba(255,61,61,.14);border:1px solid rgba(255,61,61,.45);
  box-shadow:0 0 0 1px rgba(255,61,61,.4) inset,0 8px 26px rgba(255,61,61,.22);
}
.free-callout b{color:#ffc53d;font-size:.95rem;letter-spacing:.03em}
.fc-txt{color:#ffcbb0;font-size:.78rem}
h1{font-size:2.1rem;font-weight:900;line-height:1.2;letter-spacing:-.01em;color:#fff4ea}
.h1-sub{display:block;margin-top:.35rem;font-size:1.1rem;letter-spacing:.28em;color:#ffb08a}
.grad{
  background:linear-gradient(135deg,#ff3d3d,#ff9d2e);-webkit-background-clip:text;background-clip:text;color:transparent;
}
.hero-sub{margin:1rem auto 0;max-width:620px;color:#e3b39c;font-size:.9rem;line-height:1.9}
.gold{color:#ffc53d}
.triple{margin-top:.7rem;font-size:.76rem;color:#c98f78;display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap}
.triple i{color:#8d5240;font-style:normal}

/* ---------- 倒计时条 ---------- */
.countdown{
  margin:1.4rem auto 0;max-width:520px;text-align:left;
  background:rgba(255,61,61,.08);border:1px solid rgba(255,61,61,.32);border-radius:16px;padding:.85rem 1rem;
  box-shadow:0 0 0 1px rgba(255,61,61,.4),0 10px 28px rgba(18,6,11,.6);
}
.cd-head{display:flex;align-items:baseline;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.cd-label{font-size:.78rem;color:#ffcbb0}
.cd-time{
  font-size:1.15rem;font-weight:900;letter-spacing:.06em;color:#ffc53d;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;text-shadow:0 0 14px rgba(255,197,61,.45);
}
.cd-track{margin-top:.55rem;height:8px;border-radius:999px;background:rgba(255,255,255,.07);overflow:hidden}
.cd-fill{
  display:block;height:100%;border-radius:999px;
  background:linear-gradient(90deg,#ff3d3d,#ff9d2e,#ffc53d);
  animation:drain 9s ease-in-out infinite alternate;
}
@keyframes drain{from{width:86%}to{width:12%}}
.cd-note{margin-top:.45rem;font-size:.72rem;color:#c98f78}

/* ---------- 券卡 ---------- */
.coupons{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:.85rem;margin:1.5rem 0 1.1rem}
.coupon{
  display:flex;align-items:stretch;border-radius:16px;overflow:hidden;
  background:linear-gradient(135deg,rgba(255,61,61,.16),rgba(255,157,46,.10));
  border:1px solid rgba(255,61,61,.35);
  box-shadow:0 0 0 1px rgba(255,61,61,.4),0 10px 26px rgba(18,6,11,.55);
}
.cp-left{
  flex:0 0 84px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.2rem;
  padding:.7rem .4rem;background:linear-gradient(160deg,#ff3d3d,#ff9d2e);color:#2a0505;
}
.cp-off{font-size:.9rem;font-weight:900;line-height:1.15;text-align:center}
.cp-tag{font-size:.6rem;font-weight:800;border:1px solid rgba(42,5,5,.35);border-radius:999px;padding:.05rem .35rem}
.cp-cut{width:0;border-left:2px dashed rgba(255,197,61,.5)}
.cp-right{flex:1;padding:.7rem .8rem;display:flex;flex-direction:column;gap:.28rem}
.cp-name{font-size:.9rem;font-weight:800;color:#fff2e6}
.cp-sub{font-size:.72rem;color:#d9a48c;line-height:1.6}
.cp-btn{
  align-self:flex-start;margin-top:.3rem;font-size:.72rem;font-weight:800;color:#2a0505;
  border-radius:999px;padding:.28rem .85rem;background:linear-gradient(135deg,#ff3d3d,#ff9d2e);
  box-shadow:0 0 0 1px rgba(255,61,61,.4);transition:filter .15s;
}
.cp-btn:hover{filter:brightness(1.08)}
.cp-btn.done{background:rgba(255,197,61,.16);color:#ffc53d;box-shadow:0 0 0 1px rgba(255,197,61,.5)}
.cp-note{grid-column:1/-1;font-size:.72rem;color:#a86f5c;text-align:center;margin:-.2rem 0 .2rem}

/* ---------- 卡片通用 ---------- */
.card{
  background:rgba(255,255,255,.035);border:1px solid rgba(255,61,61,.22);border-radius:18px;
  padding:1.2rem;margin-bottom:1.1rem;backdrop-filter:blur(2px);
}
.card-title{font-size:.88rem;font-weight:800;color:#ffd9c2;margin-bottom:1rem}
.muted{color:#b4836f;font-weight:400;font-size:.75rem}
.access{border-color:rgba(255,197,61,.4);box-shadow:0 0 0 1px rgba(255,61,61,.4),0 14px 34px rgba(18,6,11,.6)}
.card-head{display:flex;align-items:center;gap:.6rem;margin-bottom:.9rem}
.card-head .card-title{margin-bottom:0}
.badge-free{
  font-size:.62rem;font-weight:900;letter-spacing:.1em;color:#2a0505;border-radius:999px;padding:.12rem .5rem;
  background:linear-gradient(135deg,#ffc53d,#ff9d2e);
}
.kv{
  display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;font-size:.76rem;
  background:rgba(18,6,11,.55);border:1px solid rgba(255,61,61,.24);border-radius:12px;
  padding:.55rem .7rem;margin-bottom:.55rem;
}
.kv-label{color:#a86f5c;white-space:nowrap}
.kv code{flex:1;min-width:180px;color:#ffc53d;word-break:break-all;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.pill{
  font-size:.72rem;font-weight:800;color:#ff8a6a;border-radius:999px;padding:.22rem .75rem;
  background:rgba(255,61,61,.12);border:1px solid rgba(255,61,61,.42);transition:all .15s;
}
.pill:hover{background:rgba(255,61,61,.24);color:#ffc53d}
.endpoints{display:flex;flex-wrap:wrap;gap:.4rem;margin:.8rem 0 .2rem}
.endpoint{
  font-size:.72rem;color:#ffd0b8;border-radius:999px;padding:.3rem .7rem;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,61,61,.26);
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
}
.endpoint b{color:#ffc53d;margin-right:.35rem;font-weight:800}
.sub-title{margin:1rem 0 .55rem;font-size:.76rem;color:#c98f78}
.chips{display:flex;flex-wrap:wrap;gap:.4rem}
.chip{
  font-size:.72rem;color:#ffc53d;border-radius:999px;padding:.22rem .7rem;
  background:rgba(255,197,61,.1);border:1px solid rgba(255,197,61,.4);
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
}

/* ---------- 调试台 ---------- */
.form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1rem}
.field.wide{grid-column:1/-1}
label{display:block;font-size:.78rem;color:#c98f78;margin-bottom:.4rem}
select,textarea{
  width:100%;background:rgba(18,6,11,.7);border:1px solid rgba(255,61,61,.28);border-radius:12px;
  color:#ffe7d6;padding:.55rem .7rem;font-size:.85rem;outline:none;transition:border-color .15s,box-shadow .15s;
}
select:focus,textarea:focus{border-color:rgba(255,157,46,.7);box-shadow:0 0 0 3px rgba(255,61,61,.18)}
textarea{resize:vertical;min-height:78px;line-height:1.7}
select option{background:#1c0a11;color:#ffe7d6}
.row{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap}
.switch{display:flex;align-items:center;gap:.4rem;font-size:.8rem;color:#d9a48c;cursor:pointer;margin:0}
.switch input{accent-color:#ff3d3d}
.cta{
  font-size:.88rem;font-weight:900;color:#2a0505;border-radius:999px;padding:.6rem 1.5rem;
  background:linear-gradient(135deg,#ff3d3d,#ff9d2e);
  box-shadow:0 0 0 1px rgba(255,61,61,.4),0 10px 26px rgba(255,61,61,.32);transition:filter .15s;
}
.cta:hover{filter:brightness(1.08)}
.cta:disabled{opacity:.5;cursor:not-allowed;filter:none}
.out{
  margin-top:1.1rem;background:rgba(18,6,11,.62);border:1px solid rgba(255,61,61,.24);
  border-radius:14px;padding:.9rem 1rem;
}
.out-head{display:flex;align-items:center;gap:.5rem;flex-wrap:wrap;margin-bottom:.6rem}
.dot{width:7px;height:7px;border-radius:50%;background:#ffc53d;box-shadow:0 0 8px rgba(255,197,61,.7)}
.dot.err{background:#ff3d3d;box-shadow:0 0 8px #ff3d3d}
.out-title{font-size:.8rem;font-weight:800;color:#ffd9c2}
.out-stats{margin-left:auto;font-size:.71rem;color:#b4836f}
.out-meta{font-size:.7rem;color:#a86f5c;word-break:break-all;margin-bottom:.45rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
.out-body{white-space:pre-wrap;word-break:break-word;font-size:.88rem;line-height:1.9;color:#ffe7d6}

/* ---------- 客户端标签 + FAQ ---------- */
.clients{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;margin-top:.9rem;padding-top:.9rem;border-top:1px solid rgba(255,61,61,.2)}
.clients-label{font-size:.74rem;color:#a86f5c}
.client{font-size:.72rem;color:#ffd0b8;background:rgba(255,255,255,.05);border-radius:999px;padding:.2rem .6rem}
.faq-card{border-color:rgba(255,197,61,.28)}
.faq-item{padding:.6rem 0;border-bottom:1px solid rgba(255,61,61,.16)}
.faq-item:last-of-type{border-bottom:none}
.faq-q{font-size:.85rem;font-weight:800;color:#ffd9c2;margin-bottom:.25rem}
.faq-a{font-size:.8rem;color:#d9a48c;line-height:1.9}
.final-line{
  margin-top:.9rem;text-align:center;font-size:.8rem;font-weight:800;color:#ffc53d;
  border:1px dashed rgba(255,197,61,.45);border-radius:999px;padding:.5rem .9rem;
}

/* ---------- 页脚 ---------- */
.footer{
  text-align:center;padding:1.6rem 1.4rem 2rem;color:#a86f5c;font-size:12px;line-height:1.9;
  border-top:1px solid rgba(255,61,61,.2);cursor:default;
}
.footer .fine{color:#8d5240;font-size:12px}

/* ---------- CodeBlock 主题覆写 ---------- */
:deep(.code-block){
  background:rgba(18,6,11,.85);border:1px solid rgba(255,61,61,.3);border-radius:14px;color:#ffcbb0;
}
:deep(.code-block code){color:#ffd9c2}
:deep(.copy-btn){
  background:rgba(255,61,61,.14);color:#ff8a6a;border:1px solid rgba(255,61,61,.45);border-radius:999px;
}
:deep(.copy-btn:hover){background:rgba(255,157,46,.22);color:#ffc53d;border-color:rgba(255,197,61,.6)}
</style>
