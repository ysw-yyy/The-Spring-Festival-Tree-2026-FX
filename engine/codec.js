/* ============================================================================
 * 存档编解码（重写版）
 * ----------------------------------------------------------------------------
 * 与上游 `js/utils/save.js` 的 formatsave **格式完全兼容**：
 *
 *   'TRGTSaveFile' + map7( base64( deflate( utf8( JSON(player) ) ) ) ) + 'EndOfSaveFile'
 *   map7: 去掉结尾 '='、'0'→'0a'、'+'→'0b'、'/'→'0c'；解码反向替换。
 *
 * 两个刻意的差异（都是本次重构的技术选择）：
 *   1) **压缩用自研的同步 DEFLATE**（engine/deflate.js：固定 Huffman + LZ77，零依赖）。
 *      之所以必须同步：内容层 mod.js 的 displayThings 里直接用
 *      `formatsave.encode(JSON.stringify(player)).length` 显示存档长度。
 *      若自研压缩不可用或反而更大，自动退回「stored 块」实现（同样是合法 zlib）。
 *   2) **解压用浏览器原生 DecompressionStream('deflate')**（异步），所以
 *      formatsave.decode 返回 Promise；引擎内部（读档/导入存档）都在异步上下文里用它。
 *      它同时能读原版 pako 压出来的存档，双向兼容。
 * ========================================================================== */

RT.codec = (function () {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // ---- Adler-32（zlib 校验和）--------------------------------------------
  function adler32(bytes) {
    let a = 1, b = 0;
    const MOD = 65521;
    for (let i = 0; i < bytes.length; i++) {
      a = (a + bytes[i]) % MOD;
      b = (b + a) % MOD;
    }
    return ((b << 16) | a) >>> 0;
  }

  // ---- 同步 zlib：只用 stored(未压缩) 块 ----------------------------------
  // 布局：[0x78, 0x01] + N 个 stored 块 + adler32(4B, 大端)
  const STORED_MAX = 65535;
  function deflateStored(bytes) {
    const blocks = Math.max(1, Math.ceil(bytes.length / STORED_MAX));
    const out = new Uint8Array(2 + bytes.length + blocks * 5 + 4);
    let p = 0;
    out[p++] = 0x78; // CMF: deflate, 32K window
    out[p++] = 0x01; // FLG: 最快压缩，且 (0x78*256+1) % 31 === 0
    for (let i = 0; i < blocks; i++) {
      const off = i * STORED_MAX;
      const len = Math.min(STORED_MAX, bytes.length - off);
      const final = i === blocks - 1 ? 1 : 0;
      out[p++] = final;                     // BFINAL + BTYPE=00
      out[p++] = len & 0xff;                // LEN 小端
      out[p++] = (len >>> 8) & 0xff;
      const nlen = (~len) & 0xffff;
      out[p++] = nlen & 0xff;               // NLEN 小端
      out[p++] = (nlen >>> 8) & 0xff;
      out.set(bytes.subarray(off, off + len), p);
      p += len;
    }
    const sum = adler32(bytes);
    out[p++] = (sum >>> 24) & 0xff;
    out[p++] = (sum >>> 16) & 0xff;
    out[p++] = (sum >>> 8) & 0xff;
    out[p++] = sum & 0xff;
    return out.subarray(0, p);
  }

  // ---- 异步解压：浏览器原生 ------------------------------------------------
  async function inflateNative(bytes) {
    if (typeof DecompressionStream !== 'function') {
      throw new Error('当前环境没有 DecompressionStream，无法解压存档');
    }
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
    const buf = await new Response(stream).arrayBuffer();
    return new Uint8Array(buf);
  }

  // ---- 字节 <-> 二进制字符串（分块，避免 apply 参数过多）------------------
  const CHUNK = 0x8000;
  function bytesToBinaryString(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += CHUNK) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
    }
    return s;
  }
  function binaryStringToBytes(str) {
    const out = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) out[i] = str.charCodeAt(i) & 0xff;
    return out;
  }

  // ---- 自定义字符替换（与上游一致）---------------------------------------
  function mapChars(s) {
    return s.replace(/=+$/g, '').replace(/0/g, '0a').replace(/\+/g, '0b').replace(/\//g, '0c');
  }
  function unmapChars(s) {
    return s.replace(/0b/g, '+').replace(/0c/g, '/').replace(/0a/g, '0');
  }

  function bytesToB64(bytes) { return btoa(bytesToBinaryString(bytes)); }
  function b64ToBytes(b64) { return binaryStringToBytes(atob(b64)); }

  // ---- 对外接口 -----------------------------------------------------------
  async function inflateZlib(bytes) {
    // 先看是不是 stored 块（我们自己写的），是的话直接用更省事的路径
    return inflateNative(bytes);
  }

  /** 压缩：优先自研 DEFLATE；不可用或没压小就退回 stored 块（两者都是合法 zlib） */
  function compress(bytes) {
    if (RT.deflate && typeof RT.deflate.deflate === 'function') {
      try {
        const packed = RT.deflate.deflate(bytes);
        if (packed.length < bytes.length + 11) return packed;
        RT.warn('自研 DEFLATE 没压小，改用 stored 块');
      } catch (e) {
        RT.error('自研 DEFLATE 失败，改用 stored 块: ' + e.message, e.stack);
      }
    }
    return deflateStored(bytes);
  }

  // 存档前后缀从配置里取（两个模组不同：RG = TRGTSaveFile/EndOfSaveFile，
  // SF = 2026HappyNewYear/2026NewYearTreeMadeByQqQe308）。见 M1。
  function markers() {
    const s = (RT.config && RT.config.save) || {};
    return { start: s.startString || 'TRGTSaveFile', end: s.endString || 'EndOfSaveFile' };
  }

  return {
    get startString() { return markers().start; },
    get endString() { return markers().end; },
    markerList: markers,
    encoder, decoder,
    adler32, deflateStored, compress, inflateZlib,
    bytesToBinaryString, binaryStringToBytes, bytesToB64, b64ToBytes,
    mapChars, unmapChars,

    /** 同步编码：player/options 对象或 JSON 字符串 -> 存档字符串 */
    encode(data) {
      const json = typeof data === 'string' ? data : JSON.stringify(data);
      const utf8 = encoder.encode(json);
      const z = compress(utf8);
      const m = markers();
      return m.start + mapChars(bytesToB64(z)) + m.end;
    },

    /** 异步解码：存档字符串 -> 对象（Promise） */
    async decode(save) {
      if (typeof save !== 'string') throw new Error('存档必须是字符串');
      save = save.trim();
      const m = markers();
      if (save.startsWith(m.start)) {
        if (!save.endsWith(m.end)) throw new Error('存档结尾标记缺失');
        const body = save.slice(m.start.length, save.length - m.end.length);
        const b64 = unmapChars(body);
        const bytes = b64ToBytes(b64);
        const raw = await inflateZlib(bytes);
        return JSON.parse(decoder.decode(raw));
      }
      // 老格式：base64(JSON)。SF 把这个兜底分支注释掉了（S2），按配置决定。
      if (RT.config && RT.config.save && RT.config.save.legacyBase64Fallback === false) {
        throw new Error('存档前缀不匹配（该模组不支持无前缀的旧式存档）');
      }
      return JSON.parse(atob(save));
    },

    /** 同步估算：只在需要长度时用（避免真的压一遍） */
    encodeLength(data) {
      return this.encode(data).length;
    },
  };
})();

// 名字与上游一致，内容层 mod.js 直接引用 formatsave。
// startString/endString 用 getter：内容层（例如 mod.js 里显示存档长度那段）可能在任何
// 时刻读它们，而模组配置是在内容层加载时通过 RT.setConfig 设进去的。
var formatsave = {
  encoder: RT.codec.encoder,
  decoder: RT.codec.decoder,
  encode: function (data) { return RT.codec.encode(data); },
  decode: function (s) { return RT.codec.decode(s); },
};
Object.defineProperty(formatsave, 'startString', { get: function () { return RT.codec.startString; }, enumerable: true });
Object.defineProperty(formatsave, 'endString', { get: function () { return RT.codec.endString; }, enumerable: true });
