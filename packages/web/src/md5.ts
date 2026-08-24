// 紧凑 MD5 实现（输入 string 或字节数组，输出 32 位小写十六进制）
// 用于生成 DeepSeek 风格的假 API Key：sk-<md5hex>

const HEX = '0123456789abcdef';

function utf8Bytes(s: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x80) {
      out.push(c);
    } else if (c < 0x800) {
      out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
    } else {
      out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
    }
  }
  return out;
}

function rotl(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

export function md5(input: string | Uint8Array): string {
  const raw = typeof input === 'string' ? utf8Bytes(input) : Array.from(input);
  const n = raw.length;

  // 填充：0x80 + 0x00… 到 mod 64 == 56，再补 64 位小端比特长度
  const withPad = raw.slice();
  withPad.push(0x80);
  while (withPad.length % 64 !== 56) withPad.push(0);
  const bitLenLo = (n * 8) >>> 0;
  const bitLenHi = Math.floor((n * 8) / 0x100000000);
  for (let i = 0; i < 4; i++) withPad.push((bitLenLo >>> (8 * i)) & 0xff);
  for (let i = 0; i < 4; i++) withPad.push((bitLenHi >>> (8 * i)) & 0xff);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const K: number[] = [];
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;

  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const M = new Array<number>(16);
  for (let off = 0; off < withPad.length; off += 64) {
    for (let i = 0; i < 16; i++) {
      M[i] =
        withPad[off + i * 4] |
        (withPad[off + i * 4 + 1] << 8) |
        (withPad[off + i * 4 + 2] << 16) |
        (withPad[off + i * 4 + 3] << 24);
    }
    let A = a0;
    let B = b0;
    let C = c0;
    let D = d0;
    for (let i = 0; i < 64; i++) {
      let F: number;
      let g: number;
      if (i < 16) {
        F = ((B & C) | (~B & D)) >>> 0;
        g = i;
      } else if (i < 32) {
        F = ((D & B) | (~D & C)) >>> 0;
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = (B ^ C ^ D) >>> 0;
        g = (3 * i + 5) % 16;
      } else {
        F = (C ^ (B | ~D)) >>> 0;
        g = (7 * i) % 16;
      }
      const tmp = D;
      D = C;
      C = B;
      B = (B + rotl((A + F + K[i] + M[g]) >>> 0, S[i])) >>> 0;
      A = tmp;
    }
    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  let out = '';
  for (const w of [a0, b0, c0, d0]) {
    for (let i = 0; i < 4; i++) {
      const b = (w >>> (8 * i)) & 0xff;
      out += HEX[(b >> 4) & 0xf] + HEX[b & 0xf];
    }
  }
  return out;
}
