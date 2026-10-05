/**
 * 皮肤 SEO 元数据单一数据源。
 *
 * 14 套皮肤共用同一份「首屏文案 + head 元数据」表：服务端预渲染首屏 HTML、
 * 注入 <title> / <meta name="description"> / keywords 时都从这里取，
 * 不再各自散落在 .vue 里。id / brand / accent / theme 必须与 skins/index.ts
 * 的注册表逐字一致。
 *
 * 口径（全站统一，不得出现「可能随时关停 / 不承诺可用性」这类措辞）：
 *   永久免费、永久开启、永不关站；如遇不可抗力将提前 180 天公告。
 *
 * 本文件是纯数据文件：不 import 任何模块，export 一个 interface 和一个常量数组。
 */

export interface SkinMeta {
  id: string;
  brand: string;
  title: string;
  description: string;
  headline: string;
  tagline: string;
  accent: string;
  theme: 'dark' | 'light';
  features: string[];
  faq: { q: string; a: string }[];
  keywords: string[];
}

export const SKIN_META: SkinMeta[] = [
  // ① 深色科技风 · 开发者向，术语与工程腔
  {
    id: 'relay-dark',
    brand: 'RelayHub',
    title: 'RelayHub · 免费开源的 AI 转发中转站',
    description:
      'RelayHub 是免费 AI API 中转站，把 ChatGPT、Claude、DeepSeek 等主流模型聚合成一条 OpenAI 兼容端点：免注册、免密钥、不限额度，流式与工具调用开箱可用，换一行 Base URL 就接入，长期运营。',
    headline: 'RelayHub',
    tagline: '免费公益中转站：聚合 ChatGPT / Claude / DeepSeek / Gemini 等主流大模型，免注册、免密钥、不限额度',
    accent: '#22d3ee',
    theme: 'dark',
    features: ['OpenAI 兼容端点', '免注册 免密钥直连', 'SSE 流式输出', 'Function Calling'],
    faq: [
      {
        q: '真的完全免费吗？',
        a: '免费。本中转不对调用方计费，额度与并发都不设上限；按《永续运营承诺》永久免费，没有试用期，也没有付费墙。',
      },
      {
        q: '要注册或者申请 Key 吗？',
        a: '都不需要。页面上那串 API Key 由浏览器本地生成，填任意字符串也能通过校验，不绑定账号、邮箱或手机号。',
      },
      {
        q: '会不会突然关站？',
        a: '不会。本站已发布《永续运营承诺》：永久免费、永久开启、永不关站；如遇不可抗力需迁移，会提前 180 天公告。',
      },
    ],
    keywords: [
      '免费 API 中转',
      'OpenAI 兼容',
      '免注册',
      'RelayHub',
      '免费大模型 API',
      'AI 中转站',
      '免密钥调用',
      'SSE 流式',
    ],
  },

  // ② 终端 / 控制台风 · 全站英文键值 + 命令行腔
  {
    id: 'nexus-terminal',
    brand: 'nexus-relay',
    title: 'nexus-relay · 免费 AI Gateway Console',
    description:
      'nexus-relay 是终端风格的免费 AI 网关，向公网开放 OpenAI 兼容接口：免注册、无 Key、无额度限制，对话与 Responses 端点直接可用。12 节点多区域自动路由，流式与工具调用默认开启，长期在线。',
    headline: 'nexus-relay · public FREE relay',
    tagline: 'public FREE relay — no signup, no key, no quota',
    accent: '#34d399',
    theme: 'dark',
    features: ['免密钥直连网关', '12 节点自动路由', 'SSE 流式默认开启', 'OpenAI 兼容接口'],
    faq: [
      {
        q: 'billing 那一栏真的是 FREE 吗？',
        a: '是。本站不对调用方计费，no quota、不限并发；按《永续运营承诺》长期在线：永久免费、永久开启、永不关站。',
      },
      {
        q: '要注册或者申请 token 吗？',
        a: '不需要。auth mode 为 open，X-Relay-Token 会被忽略，客户端里填任意字符串即可通过校验。',
      },
      {
        q: 'gateway 会不会有一天关掉？',
        a: '不会。这个 session 的 exit code 只会是 0：已按《永续运营承诺》长期在线、永不关站；如遇不可抗力需迁移，提前 180 天公告。',
      },
    ],
    keywords: [
      '免费 API 中转',
      'OpenAI 兼容',
      '免注册',
      'nexus-relay',
      'AI Gateway',
      '免费网关',
      '免密钥 API',
      '开发者中转站',
    ],
  },

  // ③ 日间极简 · 直白、短句、不修饰
  {
    id: 'free-relay',
    brand: 'FreeRelay',
    title: 'FreeRelay · 免费 API 中转站',
    description:
      'FreeRelay 是一个简单直接的免费 API 中转站：OpenAI 兼容接口，免注册、免密钥、不限额度、不限并发。把 SDK 里的 Base URL 换成这里的地址就能直接跑起来，不对调用方计费，长期免费开放。',
    headline: '免费 API 中转站',
    tagline: 'OpenAI 兼容接口，免注册、免密钥、不限额度',
    accent: '#10b981',
    theme: 'light',
    features: ['换 Base URL 即用', '免注册 免密钥', '不限额度并发', 'OpenAI 兼容'],
    faq: [
      {
        q: '真的完全免费吗？',
        a: '免费且不限额度。本站是公益转发，不对调用方计费，也不限制并发，永久免费开放。',
      },
      {
        q: '需要注册或者申请 Key 吗？',
        a: '都不需要。上面那串 API Key 是页面本地生成的，客户端里填任意字符串也能通过校验。',
      },
      {
        q: '会不会突然关站？',
        a: '不会。本站已发布《永续运营承诺》：永久免费、永久开启、永不关站；如遇不可抗力需迁移，会提前 180 天公告。',
      },
    ],
    keywords: [
      '免费 API 中转',
      'OpenAI 兼容',
      '免注册',
      'FreeRelay',
      '免费接口',
      '不限额度',
      '免密钥',
    ],
  },

  // ④ 黏土萌系 · 软萌语气词、拟人自称
  {
    id: 'mochi-cute',
    brand: '麻薯 AI',
    title: '麻薯 AI · 免费 API 中转站',
    description:
      '麻薯 AI 是一个软乎乎的免费 API 中转站：把 Base URL 换成麻薯的地址，就能用上 OpenAI 兼容接口，不用注册、不用充值、也不用你自己的 Key。额度不限、次数不限，永久免费，麻薯会一直开着门。',
    headline: '免费 API 中转站，随便用～',
    tagline: '把 Base URL 换成麻薯的地址就能免费用上啦 ✨',
    accent: '#7c5cfc',
    theme: 'light',
    features: ['换地址就能用', '不用注册充值', '额度次数不限', 'OpenAI 兼容接口'],
    faq: [
      {
        q: '真的免费吗？',
        a: '真的呀～麻薯是公益中转，不收费、不扣额度，也没有次数限制，永久免费开放。',
      },
      {
        q: '要注册或者充钱吗？',
        a: '都不用哦，连 Key 都可以随便填一个，打开就能用～',
      },
      {
        q: '会不会突然关门呀？',
        a: '不会的～麻薯贴了《永续运营承诺》：永久免费、永久开启、永不关站；真要搬家也会提前 180 天公告。',
      },
    ],
    keywords: [
      '免费 API 中转',
      'OpenAI 兼容',
      '免注册',
      '麻薯 AI',
      '免费大模型接口',
      '无需充值',
      '萌系中转站',
    ],
  },

  // ⑤ 赛博霓虹 · 冷硬网络黑话，短促、点状
  {
    id: 'cyber-neon',
    brand: 'NIGHTFERRY · 夜航中转',
    title: '夜航中转 · 免费 API 中转站',
    description:
      'NIGHTFERRY · 夜航中转是公网侧的免费 AI 网关：OpenAI 兼容接口，免注册、免密钥、不计量，节点全开，流式与工具调用常驻。把 SDK 里的 Base URL 指过来即可上线，永久免费，永不关站。',
    headline: 'NIGHTFERRY',
    tagline: '公网侧的中转网关。OpenAI 兼容接口，免注册、免密钥、不计量。',
    accent: '#00fff0',
    theme: 'dark',
    features: ['免密钥直连节点', '免费配额：无限', '峰值 10,000 tok/s', '延迟 189ms'],
    faq: [
      {
        q: '真的免费吗？',
        a: '免费。转发链路不向调用方计费，不做额度截断，也不会在月底给你寄账单；按《永续运营承诺》永久免费。',
      },
      {
        q: '要注册，或者申请 Key 吗？',
        a: '都不用。页面上那串 sk- 是本地生成的，网关不校验它——你填任意字符串照样放行。',
      },
      {
        q: '会不会突然关站？',
        a: '不会。本站已签署《永续运营承诺》：永久免费、永久开启、永不关站；真到必须迁移那天，提前 180 天公告。',
      },
    ],
    keywords: [
      '免费 API 中转',
      'OpenAI 兼容',
      '免注册',
      '夜航中转',
      'NIGHTFERRY',
      '免费 AI 网关',
      '免密钥直连',
    ],
  },

  // ⑥ 亮色企业云控制台 · 规格化、工单与运维口径
  {
    id: 'cloud-saas',
    brand: '云枢 API · CloudPivot',
    title: '云枢 API · 免费中转控制台',
    description:
      '云枢 API · CloudPivot 是一个企业云控制台风格的免费中转站：OpenAI 兼容接口，免注册、免密钥，一个 Base URL 即可接管 SDK、LangChain、IDE 插件与桌面工具。个人使用完全免费，额度不限、并发不限。',
    headline: '企业级 OpenAI 兼容中转',
    tagline: '一个 Base URL 接管你手上所有 OpenAI 客户端',
    accent: '#4f46e5',
    theme: 'light',
    features: ['企业级兼容中转', '免注册 免密钥', '额度并发不限', '复制即用配置'],
    faq: [
      {
        q: '免费是长期的吗？',
        a: '是。公益运营，个人使用完全免费，整站不对调用方计费；按《永续运营承诺》永久免费、永久开启、永不关站，如遇不可抗力将提前 180 天公告。',
      },
      {
        q: '需要注册、实名或者先充值吗？',
        a: '都不需要。页面上这串 API Key 由浏览器本地生成并存在 localStorage，不进入任何账号体系；任何符合 sk- 格式的字符串都能通过鉴权。',
      },
      {
        q: '会不会突然停止服务？',
        a: '不会。控制台按《永续运营承诺》长期运维：永久免费、永久开启、永不关站；如遇不可抗力需迁移，会提前 180 天公告。',
      },
    ],
    keywords: [
      '免费 API 中转',
      'OpenAI 兼容',
      '免注册',
      '云枢 API',
      'CloudPivot',
      '企业级中转',
      'LangChain 接入',
      '免费控制台',
    ],
  },

  // ⑦ 火红营销派对风 · 促销话术，但卖点是「没有促销」
  {
    id: 'hot-deal',
    brand: '福利中转站 · FREESLOT',
    title: '福利中转站 · 0 元 API 不限量',
    description:
      '福利中转站 · FREESLOT 是一场没有满减的免费 API 促销：OpenAI 兼容接口，免注册、免密钥、不限额度、不限并发，没有首充礼包，也没有尾款，价格从头到尾都是 ¥0，长期免费开放。',
    headline: '福利中转站 FREESLOT',
    tagline: '0 元起，一直免费 —— 不充值、不拼团、不拉人',
    accent: '#ffc53d',
    theme: 'dark',
    features: ['全程 ¥0 免费', '无满减无尾款', '免注册 免密钥', '额度并发不限'],
    faq: [
      {
        q: '充值有优惠吗？满 100 减 50 那种？',
        a: '没有充值入口，因为整站不收费：额度不扣、并发不限，刷新一下又是满额，永久免费。',
      },
      {
        q: '需要注册、绑手机号或者加群领券吗？',
        a: '都不用。上面那串 API Key 是浏览器本地生成的，客户端里填任意字符串也能通过；本站没有群、没有二维码。',
      },
      {
        q: '免费活动会不会突然结束，甚至关站？',
        a: '不会。本站按《永续运营承诺》长期开办：永久免费、永久开启、永不关站；如遇不可抗力需迁移，提前 180 天公告。',
      },
    ],
    keywords: [
      '免费 API 中转',
      'OpenAI 兼容',
      '免注册',
      '福利中转站',
      'FREESLOT',
      '0 元 API',
      '不限量免费',
    ],
  },

  // ⑧ 少女粉二次元 · 拟人角色口吻，语气词与波浪号
  {
    id: 'sakura-anime',
    brand: '樱 API · SakuraRelay',
    title: '樱 API · 免费中转站',
    description:
      '樱 API · SakuraRelay 是软萌风格的免费 API 中转站：OpenAI 兼容接口，免注册、免充值、免密钥，额度与并发都不限。把 Base URL 换成人家就能免费用啦，SDK 里一个字都不用改，长期免费开放。',
    headline: '樱 API · SakuraRelay',
    tagline: '这里是免费的中转站哦～不用注册也不用充值 ✧',
    accent: '#ff6fa5',
    theme: 'light',
    features: ['免注册 免充值', '额度并发不限', '换 Base URL 即用', 'OpenAI 兼容'],
    faq: [
      {
        q: '真的免费吗？',
        a: '当然啦，小樱只是公益转发，不对调用方计费，也不限额度、不限并发，永久免费。',
      },
      {
        q: '要注册或者充值吗？',
        a: '都不用哦～把 Base URL 换成人家，再随便填个 API Key，就能免费用啦。',
      },
      {
        q: '小樱会不会哪天不见了？',
        a: '不会的～小樱已经贴出《永续运营承诺》啦：永久免费、永久开启、永不关站；就算要搬家也会提前 180 天公告～',
      },
    ],
    keywords: [
      '免费 API 中转',
      'OpenAI 兼容',
      '免注册',
      '樱 API',
      'SakuraRelay',
      '二次元中转站',
      '免充值接口',
    ],
  },

  // ⑨ 8-bit 街机像素风 · 街机提示语与全大写术语
  {
    id: 'pixel-arcade',
    brand: 'PIXEL RELAY · 像素中转站',
    title: '像素中转站 · FREE API 开局',
    description:
      'PIXEL RELAY · 像素中转站是一台不用投币的免费 API 街机：OpenAI 兼容接口，免注册、免付费，额度不限。把 SDK 里的 Base URL 换过来就能开局，聊天与 Responses 双通道，长期免费运营。',
    headline: 'PIXEL RELAY',
    tagline: 'PRESS START 开始白嫖 —— 完全免费',
    accent: '#7cf03d',
    theme: 'dark',
    features: ['无需投币 免费开局', 'FREE QUOTA ∞', '双通道兼容接口', '免注册 免密钥'],
    faq: [
      {
        q: 'Q: 真的完全免费吗？',
        a: '是的，完全免费且不限额度，不用投币也能一直玩；本站是公益转发，不对调用方计费，永久免费。',
      },
      {
        q: 'Q: 需要注册或者申请 Key？',
        a: '不需要。上面那串 API Key 由页面在本地生成，会自动保存在浏览器里，填任意字符串也能通过校验。',
      },
      {
        q: 'Q: 会不会突然关站（GAME OVER）？',
        a: 'GAME OVER 不会来。已发布《永续运营承诺》：永久免费、永久开启、永不关站，真要搬家也提前 180 天公告。',
      },
    ],
    keywords: [
      '免费 API 中转',
      'OpenAI 兼容',
      '免注册',
      '像素中转站',
      'PIXEL RELAY',
      '免费 API 街机',
      '不限额度',
    ],
  },

  // ⑩ 报纸印刷风 · 新闻体，报头、编读往来
  {
    id: 'paper-daily',
    brand: 'AI 快报 · 中转版',
    title: 'AI 快报 · 免费 API 中转',
    description:
      '《AI 快报 · 中转版》是一份把 API 白送出去的日报：OpenAI 兼容接口，免注册、免密钥、不限额度，换一行 Base URL 即可开工。编辑部按《永续运营承诺》长期发行，永久免费、永不关站，零售价始终是 0 元。',
    headline: 'AI 快报',
    tagline: '本报讯 本站即日起免费开放 API 中转，无需注册',
    accent: '#b3261e',
    theme: 'light',
    features: ['免费专号 公益发行', '免注册 免密钥', '换一行 Base URL', '不限额度并发'],
    faq: [
      {
        q: '真的不要钱吗？',
        a: '真的不要。本报不对调用方计费，也不需要充值，计量表里的费用永远是 ￥0.00，永久免费发行。',
      },
      {
        q: '需要注册或申请密钥吗？',
        a: '都不需要。刊头那串 API Key 由页面本地生成，照抄进客户端即可；填别的字符串同样放行。',
      },
      {
        q: '会不会哪天突然关站？',
        a: '不会。本报已刊登《永续运营承诺》：永久免费、永久开启、永不关站；如遇不可抗力需搬迁，提前 180 天登报公告。',
      },
    ],
    keywords: [
      '免费 API 中转',
      'OpenAI 兼容',
      '免注册',
      'AI 快报',
      '免费 API 日报',
      '免密钥调用',
      '不限额度',
    ],
  },

  // ⑪ 瑞士国际主义极简 · 句号短句、事实优先
  {
    id: 'swiss-mono',
    brand: 'RELAY.',
    title: 'RELAY. · 免费 API 中转',
    description:
      'RELAY. 是一份克制的免费 API 中转：价格 ¥0、数据保留 0 天、额度不限、并发不限。OpenAI 兼容接口，支持流式与工具调用，把客户端里的 Base URL 换成下方地址即可，免注册、免密钥，长期免费运营。',
    headline: '免费 API 中转站',
    tagline: 'Free. No signup. No quota.',
    accent: '#e11d48',
    theme: 'light',
    features: ['价格 ¥0', '无需注册', '额度不限', '流式与工具调用'],
    faq: [
      {
        q: '是否真的免费。',
        a: '是。本站不向调用方计费，也不设额度，永久免费；费用由上游免费渠道与闲置资源承担。',
      },
      {
        q: '是否需要注册。',
        a: '不需要。页面上的 API Key 由浏览器本地生成，仅用于通过鉴权格式校验，不绑定任何账号。',
      },
      {
        q: '会不会突然关站。',
        a: '不会。本站已发布《永续运营承诺》：永久免费、永久开启、永不关站；如遇不可抗力需迁移，会提前 180 天公告。',
      },
    ],
    keywords: [
      '免费 API 中转',
      'OpenAI 兼容',
      '免注册',
      'RELAY.',
      '免费 API',
      '极简中转站',
      '不限额度',
    ],
  },

  // ⑫ 玻璃拟态极光 · 中英混排，轻盈的 product 腔
  {
    id: 'aurora-glass',
    brand: 'Aurora · 极光中转',
    title: 'Aurora · 免费 API 中转站',
    description:
      'Aurora · 极光中转是一个玻璃拟态的免费 API 中转站：一个 OpenAI 兼容端点，把 Base URL 换掉就能跑，无需注册、无需付费、不限并发，永久免费。流式输出与工具调用即开即用，长期在线。',
    headline: '极光中转 · 免费不限量',
    tagline: 'Unlimited · Zero signup · Zero cost',
    accent: '#22d3ee',
    theme: 'dark',
    features: ['Free forever 免费', 'Zero signup 免注册', '不限并发', 'OpenAI 兼容端点'],
    faq: [
      {
        q: '完全免费？是认真的吗？',
        a: 'Free forever。不扣费、不需要充值、不需要绑卡；本站是公益转发，成本不转嫁给调用方，永久免费。',
      },
      {
        q: '要注册或者申请 API Key 吗？',
        a: 'Zero signup。上面那串密钥是页面本地生成的，填任意字符串同样能通过校验。',
      },
      {
        q: '会不会突然不可用，或者关站？',
        a: '不会。本站已发布《永续运营承诺》：永久免费、永久开启、永不关站；如遇不可抗力需迁移会提前 180 天公告。',
      },
    ],
    keywords: [
      '免费 API 中转',
      'OpenAI 兼容',
      '免注册',
      '极光中转',
      'Aurora',
      'Free forever',
      '不限并发',
    ],
  },

  // ⑬ 国风水墨 · 文言语感，书案与笔墨意象
  {
    id: 'ink-scroll',
    brand: '墨枢',
    title: '墨枢 · 免费 API 中转',
    description:
      '墨枢是一方以闲余算力中转的免费书案：OpenAI 兼容接口，免注册、免密钥、不限额度，来者不拒。只消把 SDK 中的 Base URL 换作本站地址，便可起笔行文，笔墨不收分文，长期开放。',
    headline: '墨枢 · 免费中转',
    tagline: '免费取用，不费分文；只消把 SDK 中的 Base URL 换作下方地址，便可起笔。',
    accent: '#9e2b25',
    theme: 'light',
    features: ['免费取用 不费分文', '免注册 免密钥', '额度不限 来者不拒', 'OpenAI 兼容接口'],
    faq: [
      {
        q: '果然分文不取？',
        a: '不取。本站以闲余资源中转，调用方不计费、不限额度，亦不设并发门槛，永久如此。',
      },
      {
        q: '需注册、需申请密钥否？',
        a: '皆不必。页上这串 API Key 由本地生成，任意字符串亦可通行。',
      },
      {
        q: '可保长久否？',
        a: '可。本站已立《永续运营承诺》：永久免费、永久开启、永不关站；纵有不测须迁，亦提前 180 天公告。',
      },
    ],
    keywords: [
      '免费 API 中转',
      'OpenAI 兼容',
      '免注册',
      '墨枢',
      '国风中转站',
      '免密钥接口',
      '不限额度',
    ],
  },

  // ⑭ 黑金奢华 · 高级会员体，排场与礼遇的话术
  {
    id: 'noir-gold',
    brand: 'AURUM · 金枢',
    title: 'AURUM · 免费 API 中转',
    description:
      'AURUM · 金枢把主流模型聚成一条专线，以 OpenAI 兼容的方式向所有人敞开：免注册、免密钥、不查余额、不做邀约，一个 Base URL 即可接入。完全免费、终身额度、无需预约，永久运营，永不关站。',
    headline: '会员制？不必。',
    tagline: '◆ 完全免费 · 终身额度 · 无需预约 ◆',
    accent: '#d4af37',
    theme: 'dark',
    features: ['完全免费 终身额度', '无需预约 免注册', '不查余额 免密钥', 'OpenAI 兼容专线'],
    faq: [
      {
        q: '真的完全免费吗？',
        a: '是。金枢由公益渠道与闲置算力支撑，不对调用方计费，也不设额度上限——会员制的排场，免费的里子，永久有效。',
      },
      {
        q: '需要预约、审核或者入会吗？',
        a: '都不需要。页面上的 API Key 由你的浏览器本地生成并保存，填任意字符串同样可以通过校验。',
      },
      {
        q: '免费额度会一直有效吗？会不会突然关站？',
        a: '终身免费额度，无需续期。本站已发布《永续运营承诺》：永久免费、永久开启、永不关站；如遇不可抗力将提前 180 天公告。',
      },
    ],
    keywords: [
      '免费 API 中转',
      'OpenAI 兼容',
      '免注册',
      'AURUM 金枢',
      '终身免费额度',
      '黑金中转站',
      '免密钥',
    ],
  },
];
