#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""og-card-generator.py —— 为 14 套皮肤生成社交分享卡片 (og:image, 1200x630)。

用途
----
生成  packages/web/og-cards/<skin-id>.png ，供链接分享到 QQ / 微信 / Telegram
时显示的缩略图。14 张图合计体积硬预算 260 KB。

用法
----
    # 用仓库主运行时（唯一被验证过的解释器）
    PY="C:\\Users\\Steven\\.dsh\\dsh-runtimes\\dsh-primary-runtime\\dependencies\\python\\python.exe"

    $PY scripts/og-card-generator.py                 # 生成全部 14 张（幂等，可重复跑）
    $PY scripts/og-card-generator.py --list          # 只列出皮肤清单和产出路径
    $PY scripts/og-card-generator.py --only relay-dark noir-gold
                                                     # 只重生成指定的几张
    $PY scripts/og-card-generator.py --check         # 不写文件，只校验已有 PNG
                                                     #（存在性 / 尺寸 / 单张体积 / 合计体积）
    $PY scripts/og-card-generator.py --budget-kb 300 # 改体积预算（默认 260）

幂等性
------
* 每张卡片都是纯 Pillow 绘制，无随机数、无时间戳；同样的输出字节。
* 调色板量化档位由“实测体积”确定，实测是确定性的 → 重跑结果一致。
* PNG 不写入 tIME 等时间元数据。
验证：连续跑两次，对 packages/web/og-cards/*.png 做 SHA256 比对，应完全一致。

体积控制
--------
1. 设计上只用纯色 / 硬边界 / 小面积色块，避免大面积渐变和噪点；
2. 保存参数 optimize=True, compress_level=9；
3. 若 14 张合计超预算，按 [256,128,64,48,32,24,16] 的档位从高到低
   对全部图做 ADAPTIVE 调色板量化（dither=NONE，硬边界不产生噪点），
   取“满足预算的最高画质档”。因此脚本永远输出 ≤ 预算。

依赖：仅 Pillow（已验证 12.3.0）。字体全部来自 C:\\Windows\\Fonts，不联网。
"""

from __future__ import annotations

import argparse
import hashlib
import io
import sys
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# --------------------------------------------------------------------------
# 路径与常量
# --------------------------------------------------------------------------

REPO = Path(__file__).resolve().parents[1]
OUT_DIR = REPO / "packages" / "web" / "og-cards"

FONT_DIR = Path(r"C:\Windows\Fonts")
F_SANS_BD = FONT_DIR / "msyhbd.ttc"   # 微软雅黑 粗体（中日韩 + 拉丁）
F_SANS = FONT_DIR / "msyh.ttc"        # 微软雅黑 常规
F_SIMHEI = FONT_DIR / "simhei.ttf"    # 黑体（等宽皮肤的 CJK 兜底）
F_CONSOLA = FONT_DIR / "consola.ttf"  # Consolas 常规（等宽拉丁）
F_CONSOLAB = FONT_DIR / "consolab.ttf"  # Consolas 粗体
F_KAI = FONT_DIR / "simkai.ttf"       # 楷体（水墨皮肤）
F_SONG = FONT_DIR / "simsun.ttc"      # 宋体（衬线感）
F_EMOJI = FONT_DIR / "seguiemj.ttf"   # Segoe UI Emoji（彩色 emoji 点缀）

W, H = 1200, 630          # og:image 标准尺寸
M = 64                    # 四周安全边距：任何文字都不越过这个范围
CONTENT_W = W - 2 * M     # 可用的文字宽度 1072

BRAND_BASELINE = 286      # 品牌大字基线
SUB_GAP = 74              # 副标基线 = 品牌末行基线 + SUB_GAP
FOOTER_BASELINE = 566     # 底部卖点小字基线（下缘距底边约 56px）

FOOTER_TOKENS = ("免费", "免注册", "免密钥", "不限额度")
FOOTER_SEP = "·"

FALLBACK_SIZES = (256, 128, 64, 48, 32, 24, 16)  # 量化档位（从高画质到低画质）


# --------------------------------------------------------------------------
# 颜色 / 字体 / 文本工具
# --------------------------------------------------------------------------


def hx(value: str) -> tuple[int, int, int]:
    """'#22d3ee' -> (0x22, 0xd3, 0xee)"""
    s = value.lstrip("#")
    return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16))


def mix(fg: tuple[int, int, int], bg: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    """把 fg 以 t 的不透明度压在 bg 上（等价于半透明混色，保持纯色输出）。"""
    return tuple(round(a * t + b * (1 - t)) for a, b in zip(fg, bg))  # type: ignore[return-value]


_FONT_CACHE: dict[tuple[str, int], ImageFont.FreeTypeFont] = {}


def font_of(path: Path, size: int) -> ImageFont.FreeTypeFont:
    key = (str(path), int(size))
    f = _FONT_CACHE.get(key)
    if f is None:
        f = ImageFont.truetype(str(path), int(size))
        _FONT_CACHE[key] = f
    return f


def is_cjk(ch: str) -> bool:
    o = ord(ch)
    return (
        0x2E80 <= o <= 0x9FFF
        or 0xF900 <= o <= 0xFAFF
        or 0xFE30 <= o <= 0xFE4F
        or 0xFF00 <= o <= 0xFFEF
        or o in (0x00B7, 0x2014, 0x2022, 0x2018, 0x2019, 0x201C, 0x201D)
    )


def make_resolver(kind: str, size: int):
    """返回 char -> FreeTypeFont 的解析器。

    kind:
      sans     微软雅黑粗体（品牌大字）
      sans_reg 微软雅黑常规（正文）
      mono     Consolas + 黑体兜底（等宽/终端/像素人设，CJK 走黑体）
      mono_bd  Consolas 粗体 + 黑体兜底
      kai      楷体（水墨）
      serif    宋体（衬线）
    """
    if kind in ("mono", "mono_bd"):
        latin = F_CONSOLAB if kind == "mono_bd" else F_CONSOLA
        return lambda ch: font_of(F_SIMHEI if is_cjk(ch) else latin, size)
    if kind == "kai":
        return lambda ch: font_of(F_KAI, size)
    if kind == "serif":
        return lambda ch: font_of(F_SONG, size)
    if kind == "sans_reg":
        return lambda ch: font_of(F_SANS, size)
    return lambda ch: font_of(F_SANS_BD, size)


# 用于测量的离屏 draw（textlength 不依赖目标图）
_MEASURE = ImageDraw.Draw(Image.new("L", (4, 4)))


def measure(text: str, resolve, spacing: float = 0.0) -> float:
    if not text:
        return 0.0
    total = 0.0
    for ch in text:
        total += _MEASURE.textlength(ch, font=resolve(ch)) + spacing
    return total - spacing


def draw_run(d: ImageDraw.ImageDraw, x: float, baseline: float, text: str, resolve, fill,
             spacing: float = 0.0) -> float:
    """逐字绘制（支持字距），返回绘制后的右边界 x。anchor='ls' 保证基线对齐。"""
    cx = float(x)
    for ch in text:
        f = resolve(ch)
        d.text((cx, baseline), ch, font=f, fill=fill, anchor="ls")
        cx += _MEASURE.textlength(ch, font=f) + spacing
    return cx - spacing if text else cx


def split_two(text: str) -> list[str]:
    """把过长的品牌名按空格折成两行（尽量均衡）。"""
    parts = text.split(" ")
    if len(parts) < 2:
        return [text]
    best, best_delta = None, None
    for i in range(1, len(parts)):
        a, b = " ".join(parts[:i]), " ".join(parts[i:])
        delta = abs(len(a) - len(b))
        if best_delta is None or delta < best_delta:
            best, best_delta = [a, b], delta
    return best or [text]


# --------------------------------------------------------------------------
# 皮肤定义（品牌名 / 副标 / 配色 / 明暗 —— 权威表，逐字使用）
# --------------------------------------------------------------------------


@dataclass(frozen=True)
class Skin:
    id: str
    brand: str
    subtitle: str
    accent: str
    bg: str
    fg: str
    dark: bool


SKINS: tuple[Skin, ...] = (
    Skin("relay-dark", "RelayHub", "免费开源的 AI 转发中转站", "#22d3ee", "#0a0f1e", "#e2e8f0", True),
    Skin("nexus-terminal", "nexus-relay", "免费 AI Gateway Console", "#34d399", "#05070a", "#a7c0d0", True),
    Skin("free-relay", "FreeRelay", "免费 API 中转站", "#10b981", "#ffffff", "#0f172a", False),
    Skin("mochi-cute", "麻薯 AI", "免费 API 中转站", "#7c5cfc", "#f0eefb", "#2e2a45", False),
    Skin("cyber-neon", "NIGHTFERRY 夜航中转", "免费 API 中转站", "#00fff0", "#0a0018", "#e6d9ff", True),
    Skin("cloud-saas", "云枢 API CloudPivot", "免费中转控制台", "#4f46e5", "#ffffff", "#0f172a", False),
    Skin("hot-deal", "福利中转站 FREESLOT", "0 元 API 不限量", "#ffc53d", "#12060b", "#ffe9d6", True),
    Skin("sakura-anime", "樱 API SakuraRelay", "免费中转站", "#ff6fa5", "#fff1f6", "#5b3f56", False),
    Skin("pixel-arcade", "PIXEL RELAY 像素中转站", "8-BIT FREE API GATEWAY", "#7cf03d", "#10102a", "#d8e0ff", True),
    Skin("paper-daily", "AI 快报 中转版", "一份把 API 白送出去的日报", "#b3261e", "#f7f4ec", "#1a1a1a", False),
    Skin("swiss-mono", "RELAY.", "免费 API 中转站", "#e11d48", "#ffffff", "#0a0a0a", False),
    Skin("aurora-glass", "Aurora 极光中转", "免费 API 中转站", "#22d3ee", "#05060f", "#e2e8f0", True),
    Skin("ink-scroll", "墨枢", "免费中转", "#9e2b25", "#f6f1e7", "#1f1c17", False),
    Skin("noir-gold", "AURUM 金枢", "PRIVATE RELAY · PUBLICLY FREE", "#d4af37", "#08070a", "#f3d99b", True),
)


# --------------------------------------------------------------------------
# 绘制上下文
# --------------------------------------------------------------------------

REPORT: list[tuple[str, str, float, float]] = []  # (skin, label, width, limit)


class Card:
    """一张卡片的绘制上下文 + 复用的排版原语。"""

    def __init__(self, skin: Skin):
        self.s = skin
        self.accent = hx(skin.accent)
        self.bg = hx(skin.bg)
        self.fg = hx(skin.fg)
        self.img = Image.new("RGB", (W, H), self.bg)
        self.d = ImageDraw.Draw(self.img)
        self.footer_right = M

    # ---- 颜色 ----
    def sub_col(self, t: float = 0.68) -> tuple[int, int, int]:
        return mix(self.fg, self.bg, t)

    def acc(self, t: float) -> tuple[int, int, int]:
        """accent 以 t 的强度压在底色上（做浅底 / 暗描边用）。"""
        return mix(self.accent, self.bg, t)

    def note(self, label: str, width: float, limit: float = CONTENT_W) -> None:
        REPORT.append((self.s.id, label, width, limit))

    # ---- 排版 ----
    def head(self, *, brand_kind: str = "sans", brand_size: int = 96, brand_spacing: float = 0.0,
             sub_kind: str = "sans_reg", sub_size: int = 36, sub_spacing: float = 0.0,
             brand_color=None, sub_color=None, x: float = M, max_w: float = CONTENT_W,
             base: float = BRAND_BASELINE, sub_gap: float = SUB_GAP) -> float:
        """绘制品牌大字 + 副标。自动缩号/折行以保证绝不裁切。返回副标基线。"""
        btext, stext = self.s.brand, self.s.subtitle
        bcol = brand_color or self.fg
        scol = sub_color if sub_color is not None else self.sub_col()

        size = None
        for cand in range(brand_size, 55, -4):
            if measure(btext, make_resolver(brand_kind, cand), brand_spacing) <= max_w:
                size = cand
                break

        if size is not None:
            w = draw_run(self.d, x, base, btext, make_resolver(brand_kind, size), bcol, brand_spacing) - x
            self.note("brand", w)
            last = base
        else:
            lines = split_two(btext)
            size = 56
            for cand in range(brand_size, 47, -4):
                if all(measure(l, make_resolver(brand_kind, cand), brand_spacing) <= max_w for l in lines):
                    size = cand
                    break
            b1 = base - size * 0.66
            b2 = b1 + size * 1.18
            for i, line in enumerate(lines):
                w = draw_run(self.d, x, b1 + i * size * 1.18, line,
                             make_resolver(brand_kind, size), bcol, brand_spacing) - x
                self.note("brand-line%d" % (i + 1), w)
            self.note("brand-size", float(size), float(brand_size))
            last = b2

        sub_base = last + sub_gap
        w = draw_run(self.d, x, sub_base, stext, make_resolver(sub_kind, sub_size), scol, sub_spacing) - x
        self.note("subtitle", w)
        return sub_base

    def footer(self, *, y: float = FOOTER_BASELINE, size: int = 30, kind: str = "sans",
               spacing: float = 0.0, color=None, sep_color=None, x: float = M) -> float:
        """底部统一卖点：免费 · 免注册 · 免密钥 · 不限额度。返回右边界。"""
        col = color if color is not None else self.sub_col(0.62)
        sep = sep_color if sep_color is not None else self.accent
        res = make_resolver(kind, size)
        gap = 12
        cx = float(x)
        for i, tok in enumerate(FOOTER_TOKENS):
            if i:
                cx = draw_run(self.d, cx + gap, y, FOOTER_SEP, res, sep, spacing) + gap
            cx = draw_run(self.d, cx, y, tok, res, col, spacing)
        self.footer_right = cx
        self.note("footer", cx - x, W - M - x)
        return cx

    # ---- 形状 ----
    def rect(self, box, fill=None, outline=None, width: int = 1) -> None:
        self.d.rectangle(box, fill=fill, outline=outline, width=width)

    def rrect(self, box, radius: int, fill=None, outline=None, width: int = 1) -> None:
        self.d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

    def dot(self, cx: float, cy: float, r: float, fill) -> None:
        self.d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=fill)

    def capsule(self, x: float, y: float, w: float, h: float, *, fill=None, outline=None,
                width: int = 1) -> None:
        self.d.rounded_rectangle((x, y, x + w, y + h), radius=h / 2, fill=fill, outline=outline, width=width)

    def emoji(self, x: float, y: float, ch: str, size: int) -> None:
        """彩色 emoji（COLR）。失败时退化为同心圆装饰，不影响出图。"""
        try:
            f = font_of(F_EMOJI, size)
            self.d.text((x, y), ch, font=f, embedded_color=True, anchor="la")
            return
        except Exception:
            pass
        cx, cy, r = x + size / 2, y + size / 2, size * 0.36
        self.dot(cx, cy, r, self.acc(0.55))
        self.dot(cx, cy, r * 0.55, self.bg)
        self.dot(cx, cy, r * 0.3, self.acc(0.85))


# --------------------------------------------------------------------------
# 各皮肤渲染（14 个，人设各不相同）
# --------------------------------------------------------------------------


def render_relay_dark(c: Card) -> None:
    """RelayHub：暗底 + accent 细描边圆角框，左下角一条 accent 短线。"""
    c.rrect((28, 28, W - 29, H - 29), 22, outline=c.acc(0.55), width=2)
    c.dot(W - 56, 56, 7, c.accent)
    c.dot(W - 56, 56, 7, c.accent)
    sub = c.head(brand_size=100)
    c.rect((M, sub + 26, M + 96, sub + 29), fill=c.acc(0.85))
    c.footer()


def render_aurora_glass(c: Card) -> None:
    """Aurora 极光：暗底 + 多层极光描边（玻璃感）+ 斜向光带。"""
    c.rrect((26, 26, W - 27, H - 27), 20, outline=c.acc(0.30), width=2)
    c.rrect((38, 38, W - 39, H - 39), 16, outline=c.acc(0.16), width=1)
    # 斜向光带（小面积、硬边界，收敛在描边之内）
    c.d.polygon([(W - 268, 40), (W - 238, 40), (W - 40, 258), (W - 40, 300)], fill=c.acc(0.16))
    c.d.polygon([(W - 206, 40), (W - 188, 40), (W - 40, 186), (W - 40, 208)], fill=c.acc(0.30))
    c.dot(W - 74, H - 74, 8, c.accent)
    c.head(brand_size=100)
    c.footer()


def render_cyber_neon(c: Card) -> None:
    """NIGHTFERRY 夜航：扫描线 + accent 四角括号 + 霓虹细描边。"""
    for y in range(0, H, 12):                       # 扫描线
        c.rect((0, y, W, y), fill=c.acc(0.10))
    c.rrect((24, 24, W - 25, H - 25), 4, outline=c.acc(0.60), width=2)
    arm, off, th = 46, 24, 5                        # 四角括号
    for sx, sy in ((1, 1), (-1, 1), (1, -1), (-1, -1)):
        x0 = off if sx > 0 else W - off
        y0 = off if sy > 0 else H - off
        c.rect((min(x0, x0 + sx * arm), y0 - th // 2, max(x0, x0 + sx * arm), y0 + th // 2 + 1), fill=c.accent)
        c.rect((x0 - th // 2, min(y0, y0 + sy * arm), x0 + th // 2 + 1, max(y0, y0 + sy * arm)), fill=c.accent)
    c.dot(W - 72, H - 72, 6, c.accent)
    c.head(brand_size=96)
    c.footer(sep_color=c.acc(0.9))


def render_nexus_terminal(c: Card) -> None:
    """nexus-relay：终端窗口——标题栏三点 + 提示符 + 光标块，全部等宽字体。"""
    c.rrect((28, 26, W - 29, H - 27), 10, fill=c.acc(0.06), outline=c.acc(0.32), width=1)
    c.rect((28, 82, W - 29, 84), fill=c.acc(0.32))
    for i, x in enumerate((58, 82, 106)):           # 窗口按钮
        c.dot(x, 55, 6, c.accent if i == 0 else c.acc(0.35))
    c.footer(x=M, kind="mono", size=28, y=FOOTER_BASELINE)
    prompt_x = M
    c.d.text((prompt_x, 286), ">", font=font_of(F_CONSOLAB, 96), fill=c.accent, anchor="ls")
    pw = _MEASURE.textlength(">", font=font_of(F_CONSOLAB, 96))
    sub = c.head(brand_kind="mono_bd", brand_size=88, sub_kind="mono", sub_size=32,
                 x=prompt_x + pw + 18)
    # 光标块
    c.d.rectangle((M, sub - 30, M + 16, sub + 2), fill=c.accent)
    c.note("cursor", 16 + 6, CONTENT_W)


def render_free_relay(c: Card) -> None:
    """FreeRelay：极简白底 + 细描边卡片 + accent 胶囊标签。"""
    c.rrect((30, 30, W - 31, H - 31), 18, outline=c.acc(0.22), width=1)
    c.rect((30, 30, 36, H - 31), fill=c.accent)     # 左侧 6px accent 色条
    c.capsule(M + 12, 108, 150, 44, fill=c.acc(0.14), outline=c.acc(0.55), width=1)
    draw_run(c.d, M + 40, 139, "免费", make_resolver("sans_reg", 24), c.acc(0.95))
    c.note("capsule-label", 48 + 12, 200)
    sub = c.head(brand_size=100, x=M + 12)
    c.footer(x=M + 12)
    c.dot(W - 84, H - 84, 7, c.accent)


def render_mochi_cute(c: Card) -> None:
    """麻薯 AI：圆角大卡片 + 柔和色块 + 1 个 emoji（团子）。"""
    c.rrect((28, 26, W - 29, H - 27), 44, fill=mix(hx("#ffffff"), c.bg, 1.0), outline=c.acc(0.30), width=2)
    c.dot(1104, 118, 48, c.acc(0.16))                # 柔和色块（全部收在卡片内）
    c.dot(1034, 148, 26, c.acc(0.24))
    c.capsule(M + 24, H - 142, 186, 46, fill=c.acc(0.20))
    draw_run(c.d, M + 52, H - 109, "免费 API", make_resolver("sans_reg", 24), c.acc(0.95))
    c.note("capsule-label", 52 + 106, 300)
    c.emoji(W - 212, 356, "\U0001F361", 116)        # 🍡
    c.head(brand_size=98, x=M + 24)
    c.footer(x=M + 24, sep_color=c.acc(0.85))


def render_cloud_saas(c: Card) -> None:
    """云枢 API CloudPivot：极简白底 + 细描边卡片 + accent 胶囊标签 + 网格点。"""
    c.rrect((30, 30, W - 31, H - 31), 14, outline=c.acc(0.18), width=1)
    c.capsule(M, 104, 138, 44, fill=c.accent)
    draw_run(c.d, M + 26, 135, "API", make_resolver("sans_reg", 24), (255, 255, 255))
    c.note("capsule-label", 26 + 48, 200)
    for i in range(5):                              # 右上角点阵（极小面积 accent）
        for j in range(3):
            c.dot(W - 210 + i * 26, 110 + j * 26, 2.5, c.acc(0.55))
    c.note("dot-grid", 4 * 26, 200)
    sub = c.head(brand_size=98)
    c.rect((M, sub + 24, W - M, sub + 25), fill=c.acc(0.20))
    c.footer()
    c.dot(W - 60, H - 60, 6, c.accent)


def render_hot_deal(c: Card) -> None:
    """福利中转站 FREESLOT：深红底 + 橙黄渐变条 + 胶囊色块。"""
    bar = Image.new("RGB", (420, 8))
    bd = ImageDraw.Draw(bar)
    a, b = c.accent, hx("#ff7a18")
    for x in range(420):
        bd.line((x, 0, x, 8), fill=mix(b, a, x / 419))
    c.img.paste(bar, (M, 150))
    c.img.paste(bar.crop((0, 0, 180, 8)), (W - M - 180, 150))   # 右侧短条，不越安全边距
    c.rect((M, H - 198, M + 96, H - 192), fill=c.accent)        # 小色条点缀
    c.capsule(M, H - 176, 208, 50, fill=c.accent)               # 胶囊色块
    draw_run(c.d, M + 30, H - 140, "0 元", make_resolver("sans", 28), hx("#12060b"))
    c.capsule(M + 226, H - 176, 178, 50, outline=c.acc(0.5), width=2)
    draw_run(c.d, M + 252, H - 140, "不限量", make_resolver("sans_reg", 26), c.acc(0.95))
    c.note("capsules", 226 + 178, CONTENT_W)
    c.dot(W - 78, 78, 12, c.accent)
    c.head(brand_size=92, sub_color=mix(c.accent, c.bg, 0.90), base=274)
    c.footer(sep_color=c.acc(0.9))


def render_sakura_anime(c: Card) -> None:
    """樱 API SakuraRelay：粉白底 + 圆角大卡片 + 花瓣 + 1 个 emoji（樱花）。"""
    c.rrect((28, 26, W - 29, H - 27), 46, fill=mix(hx("#ffffff"), c.bg, 1.0), outline=c.acc(0.35), width=2)
    petals = ((1090, 112, 42), (1024, 140, 24), (1146, 180, 18), (958, 108, 16), (852, 556, 20))
    for x, y, r in petals:                          # 花瓣：两枚椭圆拼成
        c.d.ellipse((x - r, y - r * 0.62, x + r, y + r * 0.62), fill=c.acc(0.30))
        c.d.ellipse((x - r * 0.62, y - r, x + r * 0.62, y + r), fill=c.acc(0.20))
    c.emoji(W - 246, 372, "\U0001F338", 112)        # 🌸
    c.capsule(M + 24, H - 140, 176, 46, fill=c.acc(0.22))
    draw_run(c.d, M + 52, H - 107, "免费中转", make_resolver("sans_reg", 24), c.acc(0.95))
    c.note("capsule-label", 52 + 96, 300)
    c.head(brand_size=96, x=M + 24)
    c.footer(x=M + 24, sep_color=c.accent)


def render_pixel_arcade(c: Card) -> None:
    """PIXEL RELAY 像素中转站：硬 4px 边框 + 等宽字 + 像素方块。"""
    c.rect((24, 24, W - 25, H - 25), outline=c.accent, width=4)
    c.rect((36, 36, W - 37, H - 37), outline=c.acc(0.45), width=2)
    for i in range(9):                              # 右下像素阶梯（收在安全边距内）
        x = W - M - 18 - i * 26
        c.rect((x, H - M - 18, x + 18, H - M), fill=c.accent if i % 2 == 0 else c.acc(0.55))
    for i in range(5):                              # 左上像素点
        c.rect((M + i * 26, M, M + i * 26 + 18, M + 18), fill=c.accent if i % 2 == 0 else c.acc(0.5))
    c.note("pixel-blocks", 9 * 26, CONTENT_W)
    sub = c.head(brand_kind="mono_bd", brand_size=88, sub_kind="mono", sub_size=30)
    c.rect((M, sub + 24, M + 120, sub + 32), fill=c.accent)
    c.footer(kind="mono", size=28, sep_color=c.accent)


def render_paper_daily(c: Card) -> None:
    """AI 快报：米白纸底 + 顶部双线报头 + 朱红印章方块。"""
    c.rect((M, 62, W - M, 68), fill=c.fg)                    # 报头粗线
    c.rect((M, 76, W - M, 79), fill=c.fg)                    # 报头细线
    for x in range(M, W - M, 12):                            # 细线中间的小分段
        c.rect((x, 76, x + 6, 79), fill=c.bg)
    seal = 104                                               # 朱红印章
    sx, sy = W - M - seal, H - 212
    c.rect((M, sy + seal - 2, sx - 26, sy + seal), fill=mix(c.fg, c.bg, 0.45))  # 正文底线（止于印章前）
    c.rect((sx, sy, sx + seal, sy + seal), fill=c.accent)
    c.rect((sx + 9, sy + 9, sx + seal - 9, sy + seal - 9), outline=mix(hx("#ffffff"), c.accent, 1.0), width=3)
    draw_run(c.d, sx + 24, sy + 78, "免", make_resolver("kai", 58), hx("#fff5f2"))
    c.note("seal", float(seal), 300)
    c.head(brand_kind="serif", brand_size=96, sub_kind="sans_reg", sub_size=34, base=272)
    c.footer()


def render_swiss_mono(c: Card) -> None:
    """RELAY.：纯白、超大字重、一块 8px 红色方块、零装饰。"""
    c.rect((M, 64, M + 72, 64 + 72), fill=c.accent)          # 8px 网格对齐的红色方块
    sub = c.head(brand_kind="sans", brand_size=104, brand_spacing=0.0,
                 sub_color=mix(c.fg, c.bg, 0.70))
    c.note("brand-weight", float(sub), float(H))
    c.footer(color=mix(c.fg, c.bg, 0.55), sep_color=mix(c.fg, c.bg, 0.45))


def render_ink_scroll(c: Card) -> None:
    """墨枢：宣纸底 + 竖排界格线 + accent 方形印章 + 楷体。"""
    for x in (M + 4, M + 220, M + 436):                      # 界格竖线（极淡）
        c.rect((x, 96, x + 1, H - 150), fill=mix(c.fg, c.bg, 0.14))
    c.rect((M, 96, M + 1, H - 150), fill=c.acc(0.45))
    seal = 92                                                # 印章
    sx, sy = W - M - seal, H - 160
    c.rect((sx, sy, sx + seal, sy + seal), fill=c.accent)
    c.rect((sx + 8, sy + 8, sx + seal - 8, sy + seal - 8), outline=hx("#f6f1e7"), width=2)
    draw_run(c.d, sx + 22, sy + 68, "墨", make_resolver("kai", 52), hx("#f6f1e7"))
    c.note("seal", float(seal), 300)
    sub = c.head(brand_kind="kai", brand_size=104, sub_kind="serif", sub_size=34,
                 brand_spacing=6.0, sub_spacing=2.0, base=290)
    c.rect((M, sub + 28, M + 132, sub + 31), fill=c.acc(0.85))
    c.footer(color=mix(c.fg, c.bg, 0.62), sep_color=c.accent)


def render_noir_gold(c: Card) -> None:
    """AURUM 金枢：纯黑 + 1px 金色细描边 + 大字距 + 金色菱形。"""
    c.rect((30, 30, W - 31, H - 31), outline=c.acc(0.85), width=1)
    c.rect((38, 38, W - 39, H - 39), outline=c.acc(0.35), width=1)
    cx, cy, r = W / 2, H - 62, 9                             # 菱形装饰
    c.d.polygon([(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)], fill=c.accent)
    c.d.polygon([(W - 76, 76 - 9), (W - 76 + 9, 76), (W - 76, 76 + 9), (W - 76 - 9, 76)], fill=c.accent)
    c.head(brand_kind="sans", brand_size=96, brand_spacing=16.0,
           sub_kind="mono", sub_size=30, sub_spacing=5.0,
           sub_color=mix(c.accent, c.bg, 0.72))
    c.footer(kind="mono", size=26, spacing=3.0, color=mix(c.accent, c.bg, 0.66),
             sep_color=mix(c.accent, c.bg, 0.95), y=H - 40)


RENDERERS = {
    "relay-dark": render_relay_dark,
    "nexus-terminal": render_nexus_terminal,
    "free-relay": render_free_relay,
    "mochi-cute": render_mochi_cute,
    "cyber-neon": render_cyber_neon,
    "cloud-saas": render_cloud_saas,
    "hot-deal": render_hot_deal,
    "sakura-anime": render_sakura_anime,
    "pixel-arcade": render_pixel_arcade,
    "paper-daily": render_paper_daily,
    "swiss-mono": render_swiss_mono,
    "aurora-glass": render_aurora_glass,
    "ink-scroll": render_ink_scroll,
    "noir-gold": render_noir_gold,
}


# --------------------------------------------------------------------------
# 渲染 / 编码 / 保存
# --------------------------------------------------------------------------


def render_card(skin: Skin) -> Image.Image:
    card = Card(skin)
    RENDERERS[skin.id](card)
    return card.img


def encode(img: Image.Image, colors: int | None) -> bytes:
    """colors=None → 真彩 PNG；否则 ADAPTIVE 调色板量化（无抖动，保持硬边界）。"""
    out = img
    if colors is not None:
        out = img.convert("P", palette=Image.ADAPTIVE, colors=colors, dither=Image.Dither.NONE)
    buf = io.BytesIO()
    out.save(buf, format="PNG", optimize=True, compress_level=9)
    return buf.getvalue()


def build_all(skins: list[Skin], budget_bytes: int, verbose: bool = True):
    """渲染 + 编码，按体积预算挑量化档位。返回 (skin, png bytes, colors)。"""
    images = {s.id: render_card(s) for s in skins}

    chosen: dict[str, tuple[bytes, int | None]] = {}
    used: int | None = None
    for colors in (None,) + FALLBACK_SIZES:
        trial = {s.id: encode(images[s.id], colors) for s in skins}
        total = sum(len(b) for b in trial.values())
        if verbose:
            tag = "真彩" if colors is None else "调色板 %d 色" % colors
            print("  尝试 %-12s 合计 %7.1f KB%s" % (tag, total / 1024, "" if total <= budget_bytes else "  > 预算"))
        if total <= budget_bytes:
            chosen = {k: (v, colors) for k, v in trial.items()}
            used = colors
            break
    if not chosen:
        # 预算过小：退化到最低档也要交付（并在报告里标红）
        colors = FALLBACK_SIZES[-1]
        chosen = {s.id: (encode(images[s.id], colors), colors) for s in skins}
        used = colors
        if verbose:
            print("  !! 即使最低画质档仍超预算，请调高 --budget-kb")
    return images, chosen, used


def write_cards(skins: list[Skin], chosen, out_dir: Path) -> list[tuple[str, int]]:
    out_dir.mkdir(parents=True, exist_ok=True)
    rows: list[tuple[str, int]] = []
    for s in skins:
        data = chosen[s.id][0]
        path = out_dir / ("%s.png" % s.id)
        # 幂等：内容一致就不触碰文件（保持 mtime 稳定）
        if path.exists() and hashlib.sha256(path.read_bytes()).hexdigest() == hashlib.sha256(data).hexdigest():
            rows.append((s.id, path.stat().st_size))
            continue
        path.write_bytes(data)
        rows.append((s.id, len(data)))
    return rows


def read_back(out_dir: Path, skins: list[Skin]) -> list[tuple[str, int, tuple[int, int] | None]]:
    """读回每张图，确认存在 + 尺寸 1200x630 + 体积。"""
    rows = []
    for s in skins:
        path = out_dir / ("%s.png" % s.id)
        if not path.exists():
            rows.append((s.id, 0, None))
            continue
        with Image.open(path) as im:
            rows.append((s.id, path.stat().st_size, im.size))
    return rows


# --------------------------------------------------------------------------
# CLI
# --------------------------------------------------------------------------


def fmt_rows(rows) -> tuple[list[str], int]:
    lines, total = [], 0
    for sid, size, dim in rows:
        total += size
        dims = "%dx%d" % dim if dim else "缺失"
        flag = "" if dim == (W, H) else "  <== 尺寸异常"
        lines.append("  %-16s %8.1f KB  %-11s%s" % (sid, size / 1024, dims, flag))
    return lines, total


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(description="生成 14 张 og:image 分享卡片 (1200x630)")
    ap.add_argument("--only", nargs="+", metavar="ID", help="只处理这些皮肤 id")
    ap.add_argument("--list", action="store_true", help="列出皮肤清单")
    ap.add_argument("--check", action="store_true", help="只校验已有文件，不写盘")
    ap.add_argument("--budget-kb", type=int, default=260, help="14 张合计体积预算 (KB)，默认 260")
    ap.add_argument("--out", default=str(OUT_DIR), help="输出目录，默认 packages/web/og-cards")
    args = ap.parse_args(argv)

    out_dir = Path(args.out)
    skins = list(SKINS)
    if args.only:
        wanted = set(args.only)
        unknown = sorted(wanted - {s.id for s in SKINS})
        if unknown:
            print("未知皮肤 id: %s" % ", ".join(unknown), file=sys.stderr)
            return 2
        skins = [s for s in SKINS if s.id in wanted]

    if args.list:
        for i, s in enumerate(SKINS, 1):
            print("%2d. %-16s %-28s %s" % (i, s.id, s.brand, out_dir / ("%s.png" % s.id)))
        print("\n输出目录: %s\n尺寸: %dx%d  合计预算: %d KB" % (out_dir, W, H, args.budget_kb))
        return 0

    budget = args.budget_kb * 1024
    print("输出目录 : %s" % out_dir)
    print("画布     : %dx%d  安全边距 %dpx" % (W, H, M))
    print("预算     : %.0f KB / %d 张" % (args.budget_kb, len(skins)))
    print("")

    if args.check:
        rows = read_back(out_dir, skins)
        lines, total = fmt_rows(rows)
        print("校验已有文件：")
        print("\n".join(lines))
        print("\n合计 %.1f KB / 预算 %.0f KB  ->  %s" % (
            total / 1024, args.budget_kb, "OK" if total <= budget and all(r[2] == (W, H) for r in rows) else "不通过"))
        return 0 if total <= budget and all(r[2] == (W, H) for r in rows) else 1

    before = len(REPORT)
    images, chosen, colors = build_all(skins, budget)
    rows = write_cards(skins, chosen, out_dir)

    lines, total = fmt_rows([(sid, size, images[sid].size) for sid, size in rows])
    print("\n写出结果：")
    print("\n".join(lines))

    # 文字边界自检：所有文字元素都必须在安全边距内
    warns = [(sid, label, w, lim) for sid, label, w, lim in REPORT[before:] if w > lim]
    print("\n文字边界自检：%d 项，%s" % (len(REPORT) - before,
          "全部在安全边距内" if not warns else "越界 %d 项" % len(warns)))
    for sid, label, w, lim in warns:
        print("  !! %s / %s  %.1fpx > %.1fpx" % (sid, label, w, lim))

    extra = sum(r[1] for r in read_back(out_dir, SKINS) if r[0] not in {s.id for s in skins})
    print("\n本次 %d 张合计 %.1f KB（目录内全部 14 张 %.1f KB）" % (
        len(skins), total / 1024, (total + extra) / 1024))
    print("量化档位 : %s" % ("真彩 RGB（无需量化）" if colors is None else "ADAPTIVE %d 色" % colors))
    dims_ok = all(images[sid].size == (W, H) for sid, _ in rows)
    ok = total <= budget and dims_ok and not warns
    print("结论     : %s" % ("OK" if ok else "需要调整"))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
