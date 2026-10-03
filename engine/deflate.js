/* ============================================================================
 * 自研 DEFLATE 压缩（同步、零依赖）
 * ----------------------------------------------------------------------------
 * 为什么需要它：
 *   · 内容层 mod.js 会同步调用 formatsave.encode(...).length 显示存档长度，
 *     所以编码**必须同步**（浏览器原生 CompressionStream 是异步的，用不了）；
 *   · 又不想为了压缩去依赖 pako 之类的第三方库。
 *   · 早先的「stored 块」实现虽然简单可靠，但完全不压缩 —— 实测同一份存档
 *     是原版 pako 的 6.3 倍（13621 vs 2159 字符）。
 *
 * 实现范围：RFC1951 固定 Huffman 码表（BTYPE=01）+ 贪心 LZ77（32KB 窗口、
 * 3 字节哈希链）。不带动态 Huffman 表，所以压缩率仍略逊于 pako，但已接近。
 * 解码仍交给浏览器原生 DecompressionStream（能读任意 deflate 流）。
 * ========================================================================== */

RT.deflate = (function () {
  const WINDOW = 32768;
  const MIN_MATCH = 3;
  const MAX_MATCH = 258;
  const HASH_BITS = 15;
  const HASH_SIZE = 1 << HASH_BITS;
  const MAX_CHAIN = 128;

  // 长度码 257..285 的基准值与附加位
  const LEN_BASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59,
    67, 83, 99, 115, 131, 163, 195, 227, 258];
  const LEN_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3,
    4, 4, 4, 4, 5, 5, 5, 5, 0];
  // 距离码 0..29 的基准值与附加位
  const DIST_BASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769,
    1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
  const DIST_EXTRA = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8,
    9, 9, 10, 10, 11, 11, 12, 12, 13, 13];

  function adler32(bytes) {
    let a = 1, b = 0;
    const MOD = 65521;
    for (let i = 0; i < bytes.length; i++) {
      a = (a + bytes[i]) % MOD;
      b = (b + a) % MOD;
    }
    return ((b << 16) | a) >>> 0;
  }

  // ---- 位写入（deflate 的位序：普通用 LSB-first，Huffman 码用 MSB-first）----
  function BitWriter(capacity) {
    this.buf = new Uint8Array(capacity);
    this.len = 0;
    this.bitPos = 0;   // 当前字节内已写入的位数
  }
  BitWriter.prototype.ensure = function (extraBytes) {
    if (this.len + extraBytes + 1 < this.buf.length) return;
    let size = this.buf.length * 2;
    while (size < this.len + extraBytes + 1) size *= 2;
    const next = new Uint8Array(size);
    next.set(this.buf.subarray(0, this.len));
    this.buf = next;
  };
  BitWriter.prototype.writeBits = function (value, count) {
    for (let i = 0; i < count; i++) {
      if (this.bitPos === 0) { this.ensure(1); this.buf[this.len] = 0; }
      if ((value >>> i) & 1) this.buf[this.len] |= 1 << this.bitPos;
      this.bitPos++;
      if (this.bitPos === 8) { this.bitPos = 0; this.len++; }
    }
  };
  // Huffman 码：高位先写
  BitWriter.prototype.writeCode = function (code, count) {
    for (let i = count - 1; i >= 0; i--) {
      if (this.bitPos === 0) { this.ensure(1); this.buf[this.len] = 0; }
      if ((code >>> i) & 1) this.buf[this.len] |= 1 << this.bitPos;
      this.bitPos++;
      if (this.bitPos === 8) { this.bitPos = 0; this.len++; }
    }
  };
  BitWriter.prototype.finish = function () {
    if (this.bitPos > 0) this.len++;
    return this.buf.subarray(0, this.len);
  };

  // 固定 Huffman 字面量/长度码
  function writeLiteral(w, v) {
    if (v <= 143) w.writeCode(0x30 + v, 8);
    else if (v <= 255) w.writeCode(0x190 + (v - 144), 9);
    else if (v <= 279) w.writeCode(v - 256, 7);
    else w.writeCode(0xC0 + (v - 280), 8);
  }

  function lengthCode(len) {
    // 返回 [码字, 附加位数, 附加位值]
    let i = LEN_BASE.length - 1;
    while (i > 0 && LEN_BASE[i] > len) i--;
    return [257 + i, LEN_EXTRA[i], len - LEN_BASE[i]];
  }

  function distanceCode(dist) {
    let i = DIST_BASE.length - 1;
    while (i > 0 && DIST_BASE[i] > dist) i--;
    return [i, DIST_EXTRA[i], dist - DIST_BASE[i]];
  }

  function hash3(d, i) {
    return (((d[i] << 10) ^ (d[i + 1] << 5) ^ d[i + 2]) & (HASH_SIZE - 1)) >>> 0;
  }

  /**
   * 压缩为 zlib 流（含 2 字节头与 adler32 尾）。
   * @param {Uint8Array} data
   * @returns {Uint8Array}
   */
  function deflate(data) {
    const w = new BitWriter(Math.max(1024, data.length + (data.length >> 3) + 64));
    w.writeBits(0x78, 8);      // CMF
    w.writeBits(0x01, 8);      // FLG（(0x78*256+1) % 31 == 0）
    w.writeBits(1, 1);         // BFINAL
    w.writeBits(1, 2);         // BTYPE = 01（固定 Huffman）

    const n = data.length;
    const head = new Int32Array(HASH_SIZE).fill(-1);
    const prev = new Int32Array(n);

    let i = 0;
    while (i < n) {
      let bestLen = 0, bestDist = 0;
      if (i + MIN_MATCH <= n) {
        const h = hash3(data, i);
        let cand = head[h];
        let chain = 0;
        const limit = Math.max(0, i - WINDOW);
        while (cand >= limit && cand >= 0 && chain < MAX_CHAIN) {
          // 先比最长可能长度，再回退
          let len = 0;
          const maxLen = Math.min(MAX_MATCH, n - i);
          while (len < maxLen && data[cand + len] === data[i + len]) len++;
          if (len > bestLen) {
            bestLen = len;
            bestDist = i - cand;
            if (len === maxLen) break;
          }
          cand = prev[cand];
          chain++;
        }
        // 把当前位置插入哈希链
        prev[i] = head[h];
        head[h] = i;
      }

      if (bestLen >= MIN_MATCH) {
        const lc = lengthCode(bestLen);
        writeLiteral(w, lc[0]);
        if (lc[1]) w.writeBits(lc[2], lc[1]);
        const dc = distanceCode(bestDist);
        w.writeCode(dc[0], 5);
        if (dc[1]) w.writeBits(dc[2], dc[1]);
        // 把匹配区间内其余位置也插入链（否则后续匹配质量骤降）
        const end = Math.min(i + bestLen, n - MIN_MATCH + 1);
        for (let k = i + 1; k < end; k++) {
          const h2 = hash3(data, k);
          prev[k] = head[h2];
          head[h2] = k;
        }
        i += bestLen;
      } else {
        writeLiteral(w, data[i]);
        i++;
      }
    }

    writeLiteral(w, 256);      // 块结束
    const body = w.finish();

    const out = new Uint8Array(body.length + 4);
    out.set(body, 0);
    const sum = adler32(data);
    out[body.length] = (sum >>> 24) & 0xff;
    out[body.length + 1] = (sum >>> 16) & 0xff;
    out[body.length + 2] = (sum >>> 8) & 0xff;
    out[body.length + 3] = sum & 0xff;
    return out;
  }

  return { deflate: deflate, adler32: adler32, LEN_BASE: LEN_BASE, DIST_BASE: DIST_BASE };
})();
