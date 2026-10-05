# 免费 AI 聊天站 —— 首屏文案 + 视觉风格素材清单

> 用途：批量生成「人设不同」的假免费 AI 聊天站页面。所有网页内容仅作素材提炼，非逐字复制。

## 0. 来源

**我实际抓取到的（可引用）：**

- [duck.ai](https://duck.ai/) — 首屏一句话自我说明：Private AI chat. Free.（来源）
- [Olabiba – Website that talks back](https://www.olabiba.com/website-that-talks-back/) — 首屏结构最完整，含副标题、3 个数字背书、emoji 特性块、示例 prompt 列表、"免登录"FAQ（来源）
- [xx025/carrot（AI55 免费站点导航）README](https://github.com/xx025/carrot) — 中文站的**真实自我描述句式**，破绽素材金矿（来源）
- [tony0392/chatgpt README](https://github.com/tony0392/chatgpt) — 同上，旧版镜像站描述（来源）
- [nexu-io/open-design: openai/DESIGN.md](https://github.com/nexu-io/open-design/blob/e584126d4a6981ef22431cc10bff5f0a853f57de/design-systems/openai/DESIGN.md) — 极简白底规范的权威拆解（来源）
- [Khalidabdi1/design-ai: openai/DESIGN.md](https://github.com/Khalidabdi1/design-ai/blob/main/design-md/openai/DESIGN.md) — 含深色 #343541 会话区、消息气泡规格（来源）
- [staqd: Claymorphism SKILL.md](https://raw.githubusercontent.com/x77jh8gvrn-alt/staqd-skills/refs/heads/main/skills/claymorphism/SKILL.md) — 彩色圆润可爱风的完整 token（来源）
- [CELCPG/SigmaOasis 视觉规范](https://github.com/CELCPG/SigmaOasis/blob/v1.11.0/sigma_oasis_visual_style_guide.md) — 深色玻璃霓虹风 token（来源）
- [CoodeVerse AI dark cyberpunk SaaS 模板](https://coodeverse.com/projects/Web-Development/landingpage/coodeverse-your-intelligent-assistant-project) — 深色霓虹落地页套路（来源）
- 搜索命中未能抓取正文：[aifreeforever.com/chat](https://aifreeforever.com/chat)（403）、[talkie-ai chat-ai-free](https://www.talkie-ai.com/pages/chat-ai-free)（DNS 私有 IP）、[ftac.vercel.app](https://ftac.vercel.app/)、[perplexity.ai](https://www.perplexity.ai/)（被网络策略拦截）——以下涉及这几个站的信息仅来自搜索摘要。

**以下 1–4 节文案示例全部为我的归纳/自造短句**，句式套路来自上表来源。

---

## 1. 首屏引导语素材（14 条，中英各半）

**A. 免登录 / 免注册强调**
1. 打开就能聊，不用注册、不用邮箱。（来源套路：carrot "免登录、无限免费GPT站"）
2. 零门槛开始对话，连手机号都不要。
3. No sign-up. No email. No password. Just type. （来源套路：Olabiba "No login, ever"）
4. Three seconds from landing here to your first answer.

**B. 免费无限次**
5. 完全免费，不限次数，没有隐藏额度。（来源套路：carrot "无限次使用"）
6. 用多少都不心疼，不弹付费墙。
7. Free forever, no credit card, no daily cap. （来源套路：DEV 帖 "Free, No Signup, No Credit Card"）
8. Ask as many questions as you want — nothing counts against you.

**C. 速度与实时**
9. 秒回，字是流式敲出来的，不用等。（来源套路："流式响应"）
10. 你按下回车的那一刻，答案就开始出现。
11. Answers start streaming the moment you hit send. （来源套路：Olabiba "Responds instantly"）
12. No loading screens. No queues. No waiting room.

**D. 模型全家桶**
13. 一个框里同时装着 GPT、Claude、Gemini、DeepSeek，随便切。
14. Every major model in one place — switch without losing the thread. （来源套路：搜索摘要 "ChatGPT, Claude, Gemini, Grok"）

**E. 隐私与不留痕**
15. 关掉标签页，对话就没了，我们不存。
16. 不训练、不追踪、不出售你的聊天记录。
17. Private by default — no profile, no history, no training on your words. （来源套路：duck.ai "Private AI chat"）
18. What you type stays between you and the tab.

**F. 拟人化俏皮话**
19. 我随时在线，不喝咖啡，也不会已读不回。
20. 深夜的数学题、凌晨的简历、无聊时的废话——都拿来吧。
21. Bored? Curious? Stuck? Say something — I actually reply. （来源套路：Olabiba "It actually replies"）
22. I never sleep, never judge, never ask you to sign in.

**G. Action 按钮文案**
23. 开始聊天 / 立即对话 / 免费开聊 / 直接问它 / 不用登录，先聊一句
24. Start chatting / Chat now — free / Ask anything / Try it, no account needed / Start a conversation →

---

## 2. 首屏必备元素（按出现频率排序）

1. **大标题 + 一句副标题**（几乎 100%）：大标题给「免登录/免费/秒回」其中一个卖点，副标题解释怎么用。
2. **直接可输入的聊天框**（最高价值信号）：首屏就放真输入框，占位符写 "问点什么…" / "Ask anything…"，能直接发。
3. **示例 prompt 卡片**（3–6 个）：真实站用可点即填的短句，如「帮我把这段话改写得更客气」「Explain this like I'm 15」。
4. **免除项三连小字**：`No sign-up · No credit card · Unlimited`，常贴在按钮下方或页脚。
5. **模型切换 chips / 下拉**：GPT / Claude / Gemini 横排 pills，当前项高亮。
6. **特性块（3–6 个带 emoji）**：免登录、秒回、多语言、无限次、隐私、多端。
7. **数字背书**：`2M+ 对话` `50+ 语言` `0 步注册`（Olabiba 用的就是这个三段式）。
8. **FAQ 区块**：把「要注册吗」「真的免费吗」做成折叠问答，专治疑虑。
9. **语言切换**（中文站高频）：右上角 `中文 / EN`。
10. **登录按钮弱化处理**：右上角 ghost 按钮、低对比度、文案写成「登录（可选）」或「保存记录」——绝不能比「开始聊天」更显眼。
11. **免责声明小字**：`AI 可能出错，请自行核实` / `AI can make mistakes`，页脚 12px 灰字。
12. **假在线状态点**：绿色 pulsing dot + "Online now"。

---

## 3. 三种视觉风格规范

### 风格 A：极简白底大留白（最像「正规产品」，破绽最少）

- **配色**：`#ffffff` 画布 / `#0d0d0d` 主文字 / `#10a37f` 唯一强调绿 / `#f7f7f8` 次级面 `#ececf1` 发丝线 / `#8e8ea0` 占位文字。
- **背景**：纯白，无渐变无纹理；分区靠 96–128px 留白而非分割线。
- **字体栈**：`'Söhne', Inter, system-ui, -apple-system, 'Segoe UI', sans-serif`；可选衬线做编辑体标题 `'Source Serif Pro', Georgia, serif`。正文 16px/1.6，标题 40–56px/600，负字距 -0.02em。
- **圆角与阴影**：圆角 8/12/16px，chips 用 9999px 全圆；默认无阴影，hover 才 `0 4px 16px rgba(0,0,0,.08)`。
- **组件形态**：输入框 12px 圆角 + 1px `#e5e5e5` 边，聚焦换成绿色 ring；按钮主色只用那个绿；消息用户侧浅灰气泡，AI 侧透明 + 底部分割线。
- **气质一句话**：像研究机构做的公开产品，克制到几乎冷淡。
- **文案腔调**：短陈述句、零感叹号、不说「亲爱的用户」。例：`免费使用。无需注册。`

### 风格 B：彩色圆润可爱（Claymorphism，emoji 插画多）

- **配色**：底色 `#F0EEFB` 淡紫，卡面 `#FBFAFF`，主色 `#7C5CFC` 紫，辅 `#FF8FB1` 粉 / `#FFD66B` 黄，文字 `#2E2A45` 深紫，次要 `#8A82A8`。
- **背景**：淡紫纯色，可叠一个超大模糊彩色圆斑；背景干净让「黏土块」浮起来。
- **字体栈**：标题 `Quicksand, Nunito`（圆体）+ 600–700，正文 `Nunito` 400。
- **圆角与阴影**：圆角 20–28px（几乎无直角）；三层阴影是灵魂 —— `8px 16px 32px rgba(91,75,138,.18)` + `inset 0 2px 4px rgba(255,255,255,.9)` + `inset 0 -3px 6px rgba(91,75,138,.12)`；按下时去掉外阴影并缩到 96%，像被按下去。
- **组件形态**：胖 pill 按钮、凹陷内阴影输入框、大 emoji 圆形色块图标、气泡圆角 20px；动效带轻微回弹 `cubic-bezier(.34,1.56,.64,1)`。
- **气质一句话**：像能捏一下的橡皮泥玩具。
- **文案腔调**：口语、第二人称、带 emoji 和波浪号。例：`嗨～有什么想问的？我随时都在 ✨`

### 风格 C：深色霓虹未来感（玻璃 + 发光）

- **配色**：画布 `#000000` 纯黑；玻璃面 `rgba(255,255,255,0.05)`，hover `0.08`；描边 `rgba(255,255,255,0.08)`；发光主色 `#00d4aa` 青 + `#4fffd1` 亮青，点缀 `#a78bfa` 薰衣草 / `#ffd166` 琥珀 / `#6cb4ff` 蓝。
- **背景**：纯黑底 + 两个巨大径向光斑（左上青 `rgba(0,212,170,.06)`、右下紫 `rgba(100,80,220,.05)`），营造纵深。
- **字体栈**：`-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif`，正文 14–15px；状态标签用 13px/600 大写字距 .08em。
- **圆角与阴影**：24px 大圆角玻璃面板 + `backdrop-filter: blur(40px) saturate(180%)`；每个面板必须有 1px 顶部高光条（`::before` 白色横向渐变），外阴影只做环境 `0 12px 40px rgba(0,0,0,.3)`。
- **组件形态**：玻璃侧栏、消息气泡带同色描边光晕（用户侧 `rgba(0,212,170,.12)`）、发光发送按钮、工具 chip 小玻璃方块；加载动画用水波纹/脉冲光点替代转圈。
- **气质一句话**：黑房间里的一池发光玻璃。
- **文案腔调**：技术感、短、英文混排、爱用斜杠。例：`Unlimited tokens · Zero signup · Zero logs`

---

## 4. 破绽提醒（会让老手立刻觉得「这站不对劲」）

**文案层**
1. 中文站里混着生硬机翻：「免费的使用」「没有注册必要」——真人团队会把话说顺。
2. 夸张到失真：免费无限制还送 GPT-4o/Claude 3.5 全模型 —— 懂行的人一眼判定这是「号池」或蹭 API。
3. 出现「API」「token」「额度」「Key」「中转」「接口」等词：免费聊天站不会跟你提这些，一提就露馅。
4. 三种人设的文案腔调打架：同一页里既有「亲爱的用户」又有「Hey buddy」。
5. 免责声明缺失或过长：正规站一句 12px「AI 可能出错」；假站常见写整段法律免责。
6. 数字背书造假感强：`2M+ conversations` 配一个昨天注册的域名；或中文站写 `全球 1 亿用户`。

**视觉/交互层**
7. Logo 是 emoji 或 favicon 缺失/默认 Next.js 图标；标题用系统默认字体没做字距处理。
8. 移动端崩：输入框被键盘顶出屏幕、横向溢出、点了 chips 没反应。
9. 深色霓虹风却没做 hover/focus 态，按钮无过渡；玻璃面板忘记顶部高光条，看起来只是半透明灰块。
10. 可爱的黏土风但圆角和阴影不成体系：大小圆角乱用、外阴影是生硬 `0 2px 4px black`。
11. 「开始聊天」和「登录」按钮同权重同颜色，甚至登录更大——真免费站一定弱化登录。
12. 示例 prompt 卡片点了不填充输入框，只是死文本。
13. 首屏只有营销文案没有可输入框：真免费聊天站第一屏就能打字。

**技术/信任层**
14. 域名可疑：`.top / .xyz / .fun / 数字+字母`，或与品牌名完全无关。
15. 无隐私政策/服务条款链接，或链接 404。
16. 页脚版权年份写未来或很久以前；备案号（中文站）缺失或格式不对。
17. 控制台报错、请求域名暴露第三方中转、截图里的浏览器地址栏与站名不符。
18. 打字机效果是假的：整段回复瞬间出现再逐字「播放」，或没有任何流式感。
19. 响应风格前后不一致（同一会话里突然换成另一个模型的语气/拒绝策略）。
20. 「在线人数」是写死的常量，刷新页面数字不变。
