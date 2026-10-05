<script setup lang="ts">
/**
 * 皮肤 ⑥：CloudPivot —— 亮色企业云控制台（SaaS）
 *
 * 人设是「正规企业级 OpenAPI 转发」，所以走的是云厂商控制台那套语言：
 * 左侧窄侧边栏（概览 / 密钥 / 日志 / 用量 / 工单）、白卡片 + 极浅描边、克制的阴影。
 * 免费这件事不藏着：首屏横幅直接写明「公益运营，个人使用完全免费，无需注册与充值」。
 * 功能级别 FULL —— 6 个 Tab（测试 / cURL / Python / Node.js / OpenAI SDK / Agent 接入）、
 * 工具定义与 tool_choice、top_k、系统提示词，以及工具调用可视化与用量统计条。
 */
import { computed, ref } from 'vue';
import { useRelay } from '../relay';
import { buildSamples } from '../samples';
import CodeBlock from '../components/CodeBlock.vue';
import ToolCard from '../components/ToolCard.vue';

const r = useRelay({
  placeholder: '// 控制台会在这里回显响应正文',
  message: '你好',
});

/* ---------- Tab ---------- */
const tabs = [
  { id: 'test', label: '测试' },
  { id: 'curl', label: 'cURL' },
  { id: 'python', label: 'Python' },
  { id: 'node', label: 'Node.js' },
  { id: 'sdk', label: 'OpenAI SDK' },
  { id: 'agents', label: 'Agent 接入' },
];
const activeTab = ref('test');

const samples = computed(() => buildSamples(r.baseUrl.value, r.apiKey.value, r.model.value));

/* ---------- 侧边栏（不可点的占位导航，纯装饰） ---------- */
const navGroups = [
  { group: '控制台', items: ['概览', '密钥管理', '调用日志', '用量统计', '工单支持'] },
];
const activeNav = '概览';

/* ---------- 文案 ---------- */
const endpoints = [
  { method: 'POST', path: '/v1/chat/completions', tag: '聊天补全' },
  { method: 'POST', path: '/v1/responses', tag: 'Responses API' },
  { method: 'GET', path: '/v1/models', tag: '模型列表' },
];

const trust = [
  '服务等级 99.9%',
  '工单 7×24',
  '企业级转发',
  '调用全量日志留存 7 天',
];

const freePoints = [
  {
    title: '免费范围',
    body: '公益运营，个人使用完全免费：不限额度、不限并发，不需要注册、实名或绑定支付方式。',
  },
  {
    title: '成本去向',
    body: '上游成本由公益渠道与闲置资源承担，不向调用方转嫁，站内也没有任何广告位。',
  },
  {
    title: '数据边界',
    body: '不落库对话正文；只保留 7 天元数据日志（时间、模型、token 用量、状态码）用于排障与对账。',
  },
];

const faqs = [
  {
    q: '免费是长期的吗？会不会用着用着开始收费？',
    a: '目前由公益渠道和闲置算力支撑，个人学习、开发调试和轻量线上都能免费跑。整站不对调用方计费，也不设额度上限；如果上游成本结构变化，我们会先在控制台公示，不会静默扣费。',
  },
  {
    q: '需要注册、实名或者先充值吗？',
    a: '都不需要。页面上这串 API Key 由你的浏览器本地生成并存在 localStorage 里，刷新和换标签页都不变，也从来没进过我们的账号体系；实际上任何符合 sk- 格式的字符串都能通过鉴权。',
  },
  {
    q: '有 SLA 和工单支持吗？出问题找谁？',
    a: '控制台按 99.9% 的服务等级做日常运维，上游抖动会自动切换节点，异常也会计入日志。工单入口 7×24 接收，但请注意这是公益站点，不签署赔付条款、不开具发票；核心业务建议保留官方 API 作为兜底。',
  },
  {
    q: '调用日志留存多久？会不会记录我的内容？',
    a: '全量请求日志保留 7 天，字段只有时间、模型、token 用量和状态码，到期自动清理；请求正文与响应正文都不做持久化存储，日志只用于定位故障和核对用量。',
  },
];
</script>

<template>
  <div class="skin">
    <div class="shell">
      <!-- 左侧窄侧边栏：企业控制台的分区导航 -->
      <aside class="side">
        <div class="brand">
          <span class="brand-mark">云</span>
          <span class="brand-text">
            <span class="brand-name">云枢 API</span>
            <span class="brand-sub">CloudPivot Console</span>
          </span>
        </div>

        <nav class="nav">
          <template v-for="g in navGroups" :key="g.group">
            <div class="nav-group">{{ g.group }}</div>
            <div
              v-for="item in g.items"
              :key="item"
              class="nav-item"
              :class="{ active: item === activeNav }"
            >{{ item }}</div>
          </template>
        </nav>

        <div class="side-plan">
          <div class="side-plan-head">
            <span class="plan-dot"></span>
            <span class="plan-name">公益免费版</span>
          </div>
          <p class="side-plan-body">个人使用完全免费，无需注册与充值。</p>
        </div>

        <div class="side-foot">
          <div class="side-foot-row"><span class="ok-dot"></span>全部节点运行正常</div>
          <div class="side-foot-note">服务等级 99.9% · 工单 7×24</div>
        </div>
      </aside>

      <!-- 主区 -->
      <main class="main">
        <div class="topbar">
          <div class="crumb">
            <span>控制台</span>
            <span class="crumb-sep">/</span>
            <span class="crumb-cur">概览</span>
          </div>
          <div class="topbar-right">
            <span class="env">环境：生产</span>
            <span class="status"><i></i>服务在线</span>
          </div>
        </div>

        <div class="content">
          <!-- 首屏：完全免费横幅 -->
          <section class="free-banner">
            <span class="free-pill">完全免费</span>
            <p class="free-text">
              公益运营，<b>个人使用完全免费</b>，无需注册与充值；接口能力与企业版一致，额度不限、并发不限。
            </p>
          </section>

          <section class="hero">
            <h1>企业级 OpenAI 兼容中转</h1>
            <p class="hero-sub">
              一个 Base URL 接管你手上所有 OpenAI 客户端：SDK、LangChain、IDE 插件、桌面工具，改地址即可用，不用改代码结构。
            </p>
            <div class="trust">
              <span v-for="t in trust" :key="t" class="trust-item"><i></i>{{ t }}</span>
            </div>
          </section>

          <!-- 接入信息 -->
          <section class="card">
            <div class="card-head">
              <h2 class="card-title">接入信息</h2>
              <span class="card-note">复制即用 · 密钥本地生成</span>
            </div>

            <div class="kv">
              <span class="kv-label">Base URL</span>
              <code>{{ r.baseUrl.value }}</code>
              <button class="btn-copy" @click="r.copyText(r.baseUrl.value, $event.currentTarget)">复制</button>
            </div>
            <div class="kv">
              <span class="kv-label">API Key</span>
              <code>{{ r.apiKey.value }}</code>
              <button class="btn-copy" @click="r.copyText(r.apiKey.value, $event.currentTarget)">复制</button>
            </div>

            <div class="ep-list">
              <div v-for="e in endpoints" :key="e.path" class="ep">
                <span class="ep-method" :class="{ get: e.method === 'GET' }">{{ e.method }}</span>
                <span class="ep-path">{{ e.path }}</span>
                <span class="ep-tag">{{ e.tag }}</span>
              </div>
            </div>

            <div class="models">
              <div class="models-head">
                <span class="models-title">可用模型</span>
                <span class="models-hint">点击模型名可直接带入下方测试台</span>
              </div>
              <div class="chips">
                <button
                  v-for="m in r.models.value"
                  :key="m"
                  class="chip"
                  :class="{ on: m === r.model.value }"
                  @click="r.model.value = m"
                >{{ m }}</button>
              </div>
            </div>
          </section>

          <!-- 接口调试 + 接入示例 -->
          <section class="card">
            <div class="tab-bar">
              <button
                v-for="t in tabs"
                :key="t.id"
                class="tab"
                :class="{ active: activeTab === t.id }"
                @click="activeTab = t.id"
              >{{ t.label }}</button>
            </div>

            <div v-show="activeTab === 'test'" class="panel">
              <div class="form-grid">
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
                <div class="field">
                  <label>top_k</label>
                  <input v-model.number="r.topk.value" type="number" min="1" max="50" />
                </div>
                <div class="field">
                  <label>tool_choice</label>
                  <select v-model="r.toolChoice.value">
                    <option value="auto">auto</option>
                    <option value="none">none</option>
                    <option value="required">required</option>
                  </select>
                </div>
              </div>

              <div class="field">
                <label>系统提示词<span class="label-note">（Responses API 下作为 instructions 下发）</span></label>
                <textarea v-model="r.system.value" rows="2" placeholder="可选，例如：你是企业知识库助手，回答尽量简洁。"></textarea>
              </div>

              <div class="field">
                <label>消息内容</label>
                <textarea v-model="r.msg.value" rows="3" placeholder="输入一条消息…"></textarea>
              </div>

              <div class="field">
                <label>工具定义<span class="label-note">（Tools JSON，留空则不启用 Function Calling）</span></label>
                <textarea
                  v-model="r.toolsRaw.value"
                  class="mono"
                  rows="4"
                  placeholder='[{"type":"function","function":{"name":"get_weather","description":"查询指定城市的天气","parameters":{"type":"object","properties":{"city":{"type":"string"}},"required":["city"]}}}]'
                ></textarea>
              </div>

              <div class="actions">
                <label class="check"><input v-model="r.stream.value" type="checkbox" /> 流式输出（SSE）</label>
                <button class="btn-primary" :disabled="r.sending.value" @click="r.send()">
                  {{ r.sending.value ? '请求中…' : '发送请求' }}
                </button>
              </div>
            </div>

            <div v-show="activeTab === 'curl'" class="panel">
              <template v-for="s in samples.curl" :key="s.title">
                <div class="code-title">{{ s.title }}</div>
                <CodeBlock :code="s.code" />
              </template>
            </div>

            <div v-show="activeTab === 'python'" class="panel">
              <template v-for="s in samples.python" :key="s.title">
                <div class="code-title">{{ s.title }}</div>
                <CodeBlock :code="s.code" />
              </template>
            </div>

            <div v-show="activeTab === 'node'" class="panel">
              <template v-for="s in samples.node" :key="s.title">
                <div class="code-title">{{ s.title }}</div>
                <CodeBlock :code="s.code" />
              </template>
            </div>

            <div v-show="activeTab === 'sdk'" class="panel">
              <template v-for="s in samples.sdk" :key="s.title">
                <div class="code-title">{{ s.title }}</div>
                <CodeBlock :code="s.code" />
              </template>
            </div>

            <div v-show="activeTab === 'agents'" class="panel">
              <p class="intro">
                本服务对外是标准 OpenAI 兼容接口，支持 Function Calling（tools）与 Responses API，
                Agent 框架、编排平台、IDE 插件都可以直接接入。Base URL 与 API Key 见上方「接入信息」。
              </p>
              <template v-for="s in samples.agents" :key="s.title">
                <div class="code-title">{{ s.title }}</div>
                <CodeBlock :code="s.code" />
              </template>
            </div>
          </section>

          <!-- 响应结果 -->
          <section class="card">
            <div class="card-head">
              <h2 class="card-title">响应结果</h2>
              <span class="card-note">请求与响应均可审计</span>
            </div>

            <div class="output">
              <div v-if="r.output.meta" class="resp-meta">{{ r.output.meta }}</div>
              <div class="resp-content">{{ r.output.content }}</div>
              <div v-if="r.output.tools.length" class="resp-tools">
                <ToolCard v-for="(c, i) in r.output.tools" :key="i" :call="c" />
              </div>
            </div>

            <div v-show="r.stats.visible" class="stats-bar">
              <div class="stat">耗时<span class="val" :class="{ err: r.stats.err }">{{ r.stats.time }}</span></div>
              <div class="stat">Prompt<span class="val" :class="{ err: r.stats.err }">{{ r.stats.prompt }}</span></div>
              <div class="stat">Completion<span class="val" :class="{ err: r.stats.err }">{{ r.stats.comp }}</span></div>
              <div class="stat">Total<span class="val" :class="{ err: r.stats.err }">{{ r.stats.total }}</span></div>
              <div class="stat">速度<span class="val" :class="{ err: r.stats.err }">{{ r.stats.speed }}</span></div>
            </div>
          </section>

          <!-- 免费说明 -->
          <section class="card">
            <div class="card-head">
              <h2 class="card-title">免费说明</h2>
              <span class="card-note">公益运营 · 不向调用方计费</span>
            </div>
            <div class="free-grid">
              <div v-for="f in freePoints" :key="f.title" class="free-cell">
                <div class="free-cell-title">{{ f.title }}</div>
                <p class="free-cell-body">{{ f.body }}</p>
              </div>
            </div>
            <p class="free-foot">
              价格页、账单、充值入口这些都不需要——本控制台没有付费项，免费也不是试用期。
            </p>
          </section>

          <!-- FAQ -->
          <section class="card">
            <div class="card-head">
              <h2 class="card-title">常见问题</h2>
              <span class="card-note">工单 7×24 接收</span>
            </div>
            <div class="faq">
              <div v-for="f in faqs" :key="f.q" class="faq-item">
                <div class="faq-q">{{ f.q }}</div>
                <p class="faq-a">{{ f.a }}</p>
              </div>
            </div>
          </section>

          <footer class="footer" data-skin-footer>
            <p class="fine">
              云枢 API · CloudPivot · 第三方公益转发，非官方服务，不签署 SLA 赔付条款、不开具发票 · AI 生成内容可能出错，请自行核实
            </p>
            <p class="fine dim">
              服务等级 99.9% 为工程运维目标而非承诺 · 调用日志元数据留存 7 天 · 仅供学习研究与娱乐使用，请勿用于商业用途
            </p>
          </footer>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.skin{
  min-height:100vh;width:100%;
  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;
  color:#0f172a;
  background:linear-gradient(180deg,#f8fafc 0%,#eef2ff 100%);
  -webkit-font-smoothing:antialiased;
}
.shell{display:flex;min-height:100vh;align-items:flex-start}

/* ---------- 侧边栏 ---------- */
.side{
  width:224px;flex:none;align-self:stretch;position:sticky;top:0;height:100vh;overflow-y:auto;
  display:flex;flex-direction:column;gap:1.15rem;
  padding:1.15rem 1rem 1.2rem;
  background:#fff;border-right:1px solid #e5e7eb;
}
.brand{display:flex;align-items:center;gap:.55rem}
.brand-mark{
  width:30px;height:30px;border-radius:9px;flex:none;
  display:flex;align-items:center;justify-content:center;
  font-size:.85rem;font-weight:700;color:#fff;
  background:linear-gradient(135deg,#4f46e5,#6366f1);
  box-shadow:0 1px 2px rgba(79,70,229,.28);
}
.brand-text{display:flex;flex-direction:column;line-height:1.25;min-width:0}
.brand-name{font-size:.86rem;font-weight:700;letter-spacing:-.01em;color:#111827}
.brand-sub{font-size:.62rem;color:#9ca3af}
.nav{display:flex;flex-direction:column;gap:.15rem}
.nav-group{font-size:.62rem;color:#9ca3af;letter-spacing:.08em;padding:.1rem .55rem .35rem}
.nav-item{
  font-size:.79rem;color:#4b5563;padding:.44rem .6rem;border-radius:9px;
  border:1px solid transparent;cursor:default;user-select:none;
}
.nav-item.active{
  color:#4338ca;font-weight:600;background:#eef2ff;border-color:#e0e7ff;
}
.side-plan{
  margin-top:auto;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.7rem .75rem;
}
.side-plan-head{display:flex;align-items:center;gap:.4rem;margin-bottom:.3rem}
.plan-dot{width:6px;height:6px;border-radius:50%;background:#4f46e5}
.plan-name{font-size:.75rem;font-weight:600;color:#312e81}
.side-plan-body{font-size:.68rem;line-height:1.65;color:#6b7280}
.side-foot{border-top:1px solid #f1f5f9;padding-top:.6rem}
.side-foot-row{display:flex;align-items:center;gap:.4rem;font-size:.68rem;color:#4b5563}
.ok-dot{width:6px;height:6px;border-radius:50%;background:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.14)}
.side-foot-note{font-size:.62rem;color:#9ca3af;margin-top:.28rem;line-height:1.6}

/* ---------- 主区 ---------- */
.main{flex:1;min-width:0;display:flex;flex-direction:column}
.topbar{
  display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;
  padding:.7rem 1.6rem;background:rgba(255,255,255,.82);
  border-bottom:1px solid #e5e7eb;
  -webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
  position:sticky;top:0;z-index:5;
}
.crumb{display:flex;align-items:center;gap:.4rem;font-size:.76rem;color:#9ca3af}
.crumb-cur{color:#374151;font-weight:600}
.crumb-sep{color:#d1d5db}
.topbar-right{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}
.env{
  font-size:.68rem;color:#4338ca;background:#eef2ff;border:1px solid #e0e7ff;
  border-radius:99px;padding:.14rem .55rem;
}
.status{display:flex;align-items:center;gap:.35rem;font-size:.72rem;color:#059669}
.status i{width:6px;height:6px;border-radius:50%;background:#10b981;animation:pulse 1.8s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.content{width:100%;max-width:960px;padding:1.4rem 1.6rem 1rem}

/* ---------- 首屏 ---------- */
.free-banner{
  display:flex;align-items:center;gap:.7rem;flex-wrap:wrap;
  background:linear-gradient(90deg,#eef2ff 0%,#f5f3ff 55%,#f8fafc 100%);
  border:1px solid #c7d2fe;border-radius:12px;
  padding:.65rem .85rem;margin-bottom:1.1rem;
  box-shadow:0 1px 2px rgba(79,70,229,.06);
}
.free-pill{
  flex:none;font-size:.7rem;font-weight:700;color:#fff;letter-spacing:.02em;
  background:#4f46e5;border-radius:7px;padding:.22rem .6rem;
}
.free-text{font-size:.79rem;color:#4338ca;line-height:1.6}
.free-text b{color:#312e81}
.hero{padding:.2rem 0 1.4rem}
h1{font-size:1.85rem;font-weight:800;letter-spacing:-.02em;line-height:1.3;color:#111827}
.hero-sub{margin-top:.65rem;font-size:.88rem;line-height:1.85;color:#6b7280;max-width:44rem}
.trust{display:flex;flex-wrap:wrap;gap:.45rem;margin-top:1rem}
.trust-item{
  display:flex;align-items:center;gap:.35rem;font-size:.7rem;color:#4b5563;
  background:#fff;border:1px solid #e5e7eb;border-radius:99px;padding:.24rem .65rem;
  box-shadow:0 1px 2px rgba(16,24,40,.03);
}
.trust-item i{width:5px;height:5px;border-radius:50%;background:#6366f1}

/* ---------- 卡片 ---------- */
.card{
  background:#fff;border:1px solid #e5e7eb;border-radius:16px;
  padding:1.3rem 1.35rem;margin-bottom:1.1rem;
  box-shadow:0 1px 2px rgba(16,24,40,.04),0 8px 24px rgba(79,70,229,.05);
}
.card-head{display:flex;align-items:baseline;justify-content:space-between;gap:.8rem;flex-wrap:wrap;margin-bottom:1rem}
.card-title{font-size:.92rem;font-weight:700;color:#111827;letter-spacing:-.01em}
.card-note{font-size:.7rem;color:#9ca3af}

/* ---------- 接入信息 ---------- */
.kv{
  display:flex;align-items:center;gap:.65rem;
  background:#f8fafc;border:1px solid #e5e7eb;border-radius:11px;
  padding:.55rem .7rem;margin-bottom:.5rem;font-size:.75rem;
}
.kv-label{color:#9ca3af;white-space:nowrap;flex:none}
.kv code{
  flex:1;min-width:0;color:#4338ca;word-break:break-all;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.75rem;
}
.btn-copy{
  flex:none;font-size:.7rem;color:#4f46e5;background:#fff;
  border:1px solid #c7d2fe;border-radius:8px;padding:.22rem .6rem;
  transition:background .15s,color .15s;
}
.btn-copy:hover{background:#eef2ff;color:#4338ca}
.ep-list{margin-top:.85rem;display:flex;flex-direction:column;gap:.4rem}
.ep{
  display:flex;align-items:center;gap:.6rem;font-size:.75rem;
  background:#fff;border:1px solid #eef0f4;border-radius:10px;padding:.45rem .7rem;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
.ep-method{
  flex:none;font-size:.62rem;font-weight:700;color:#4338ca;background:#eef2ff;
  border:1px solid #e0e7ff;border-radius:5px;padding:.06rem .34rem;font-family:inherit;
}
.ep-method.get{color:#047857;background:#ecfdf5;border-color:#d1fae5}
.ep-path{color:#374151;word-break:break-all}
.ep-tag{
  margin-left:auto;flex:none;font-size:.64rem;color:#9ca3af;
  font-family:Inter,sans-serif;white-space:nowrap;
}
.models{margin-top:1rem;padding-top:.9rem;border-top:1px solid #f1f5f9}
.models-head{display:flex;align-items:baseline;gap:.6rem;flex-wrap:wrap;margin-bottom:.55rem}
.models-title{font-size:.76rem;font-weight:600;color:#374151}
.models-hint{font-size:.68rem;color:#9ca3af}
.chips{display:flex;flex-wrap:wrap;gap:.4rem}
.chip{
  font-size:.72rem;color:#4338ca;background:#fff;
  border:1px solid #c7d2fe;border-radius:99px;padding:.2rem .66rem;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  transition:background .15s,color .15s,border-color .15s;
}
.chip:hover{background:#eef2ff}
.chip.on{background:#4f46e5;border-color:#4f46e5;color:#fff}

/* ---------- Tab ---------- */
.tab-bar{display:flex;flex-wrap:wrap;gap:.25rem;border-bottom:1px solid #e5e7eb;margin-bottom:1.1rem}
.tab{
  font-size:.79rem;color:#6b7280;padding:.5rem .85rem;border-radius:9px 9px 0 0;
  border-bottom:2px solid transparent;margin-bottom:-1px;transition:color .15s,background .15s;
}
.tab:hover{color:#374151;background:#f8fafc}
.tab.active{color:#4338ca;font-weight:600;border-bottom-color:#4f46e5;background:#eef2ff}
.panel{padding-top:.1rem}
.code-title{font-size:.74rem;font-weight:600;color:#6b7280;margin:1rem 0 .45rem}
.code-title:first-child{margin-top:0}
.intro{
  font-size:.75rem;line-height:1.8;color:#6b7280;
  background:#f8fafc;border:1px solid #e5e7eb;border-radius:11px;
  padding:.7rem .85rem;margin-bottom:1rem;
}

/* ---------- 表单 ---------- */
.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:.9rem}
.field{margin-bottom:.95rem}
label{display:block;font-size:.75rem;color:#4b5563;margin-bottom:.38rem;font-weight:500}
.label-note{color:#9ca3af;font-weight:400;font-size:.7rem}
select,input[type="number"],textarea{
  width:100%;background:#fff;border:1px solid #d1d5db;border-radius:10px;
  color:#111827;padding:.52rem .68rem;font-size:.82rem;outline:none;
  transition:border-color .15s,box-shadow .15s;
}
select:focus,input[type="number"]:focus,textarea:focus{
  border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.14);
}
textarea{resize:vertical;min-height:66px;line-height:1.7}
textarea.mono,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:.76rem}
input[type="checkbox"]{accent-color:#4f46e5}
.actions{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;margin-top:.35rem}
.check{display:flex;align-items:center;gap:.45rem;font-size:.78rem;color:#4b5563;margin:0;font-weight:400;cursor:pointer}
.btn-primary{
  background:linear-gradient(135deg,#4f46e5,#6366f1);color:#fff;font-weight:600;
  font-size:.83rem;border-radius:10px;padding:.6rem 1.3rem;
  box-shadow:0 1px 2px rgba(79,70,229,.24);transition:filter .15s,box-shadow .15s;
}
.btn-primary:hover{filter:brightness(1.06);box-shadow:0 8px 24px rgba(79,70,229,.18)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;box-shadow:none}

/* ---------- 输出 ---------- */
.output{
  background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;
  padding:.9rem 1rem;min-height:78px;max-height:420px;overflow-y:auto;
}
.resp-meta{
  font-size:.68rem;color:#9ca3af;word-break:break-all;margin-bottom:.55rem;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
.resp-content{white-space:pre-wrap;word-break:break-word;font-size:.85rem;line-height:1.85;color:#1f2937}
.resp-tools{margin-top:.8rem;display:flex;flex-direction:column;gap:.5rem}
.stats-bar{
  display:flex;flex-wrap:wrap;gap:1.1rem;
  padding:.6rem .95rem;margin-top:.7rem;
  background:#fff;border:1px solid #e5e7eb;border-radius:11px;font-size:.72rem;color:#9ca3af;
}
.stat{display:flex;align-items:center;gap:.35rem}
.val{color:#4338ca;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.val.err{color:#dc2626}

/* ---------- 免费说明 ---------- */
.free-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.8rem}
.free-cell{background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:.85rem .9rem}
.free-cell-title{font-size:.77rem;font-weight:600;color:#312e81;margin-bottom:.35rem}
.free-cell-body{font-size:.75rem;line-height:1.8;color:#6b7280}
.free-foot{margin-top:.9rem;font-size:.74rem;line-height:1.8;color:#9ca3af}

/* ---------- FAQ ---------- */
.faq{display:flex;flex-direction:column}
.faq-item{padding:.75rem 0;border-bottom:1px solid #f1f5f9}
.faq-item:last-child{border-bottom:none;padding-bottom:.1rem}
.faq-q{font-size:.81rem;font-weight:600;color:#1f2937;margin-bottom:.3rem}
.faq-a{font-size:.77rem;line-height:1.85;color:#6b7280}

/* ---------- 页脚 ---------- */
.footer{cursor:default;padding:1.4rem .2rem 2rem;text-align:center}
.fine{font-size:12px;line-height:1.9;color:#9ca3af}
.fine.dim{color:#b6bdc9}

/* ---------- CodeBlock / ToolCard 主题覆写 ---------- */
:deep(.code-block){
  background:#f8fafc;border-color:#e5e7eb;border-radius:12px;color:#334155;
}
:deep(.copy-btn){
  background:#fff;color:#6b7280;border-color:#e5e7eb;border-radius:7px;
}
:deep(.copy-btn:hover){color:#4338ca;background:#eef2ff;border-color:#c7d2fe}
:deep(.tool-card){background:#fff;border-color:#e0e7ff;border-radius:12px}
:deep(.tool-head){background:#eef2ff;border-bottom-color:#e0e7ff}
:deep(.tool-badge){background:#4f46e5;color:#fff}
:deep(.tool-name){color:#4338ca}
:deep(.tool-args){color:#334155}

/* ---------- 响应式：窄屏把侧边栏压成顶部条 ---------- */
@media (max-width:900px){
  .shell{flex-direction:column}
  .side{
    width:100%;height:auto;position:static;
    flex-direction:row;align-items:center;gap:.7rem;
    padding:.6rem .85rem;overflow-x:auto;
    border-right:none;border-bottom:1px solid #e5e7eb;
  }
  .brand{flex:none}
  .brand-sub{display:none}
  .nav{flex-direction:row;gap:.2rem;margin-left:.4rem}
  .nav-group,.side-plan,.side-foot{display:none}
  .nav-item{padding:.34rem .6rem;white-space:nowrap;font-size:.75rem}
  .content{padding:1.1rem 1rem .5rem}
  .topbar{padding:.6rem 1rem;position:static}
  h1{font-size:1.5rem}
  .card{padding:1.05rem 1rem;border-radius:14px}
}
</style>
