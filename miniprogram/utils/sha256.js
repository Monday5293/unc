/**
 * 轻量 SHA-256 实现，用于微信小程序端密码哈希
 * 来源: https://github.com/geraintluff/sha256 (MIT License)
 */
function sha256(msg) {
  msg = typeof msg === 'string' ? msg : String(msg)
  msg = utf8Encode(msg)

  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ]

  var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]

  msg += '\x80'
  var l = msg.length / 4 + 2
  var N = Math.ceil(l / 16)
  var M = new Array(N)
  for (var i = 0; i < N; i++) {
    M[i] = new Array(16)
    for (var j = 0; j < 16; j++) {
      M[i][j] = (msg.charCodeAt(i * 64 + j * 4) << 24) |
        (msg.charCodeAt(i * 64 + j * 4 + 1) << 16) |
        (msg.charCodeAt(i * 64 + j * 4 + 2) << 8) |
        (msg.charCodeAt(i * 64 + j * 4 + 3))
    }
  }

  var lenHi = ((msg.length - 1) * 8) / Math.pow(2, 32)
  var lenLo = ((msg.length - 1) * 8) >>> 0
  M[N - 1][14] = Math.floor(lenHi)
  M[N - 1][15] = lenLo

  for (var i = 0; i < N; i++) {
    var W = new Array(64)
    for (var t = 0; t < 16; t++) W[t] = M[i][t]
    for (var t = 16; t < 64; t++) {
      W[t] = (sigma1(W[t - 2]) + W[t - 7] + sigma0(W[t - 15]) + W[t - 16]) >>> 0
    }

    var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7]
    for (var t = 0; t < 64; t++) {
      var T1 = h + Sigma1(e) + Ch(e, f, g) + K[t] + W[t]
      var T2 = Sigma0(a) + Maj(a, b, c)
      h = g; g = f; f = e; e = (d + T1) >>> 0; d = c; c = b; b = a; a = (T1 + T2) >>> 0
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0
  }

  var hex = ''
  for (var i = 0; i < 8; i++) {
    hex += toHex(H[i])
  }
  return hex
}

function utf8Encode(str) {
  var out = ''
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i)
    if (c < 0x80) { out += String.fromCharCode(c) }
    else if (c < 0x800) { out += String.fromCharCode((c >> 6) | 0xc0, (c & 0x3f) | 0x80) }
    else if (c < 0xd800 || c >= 0xe000) { out += String.fromCharCode((c >> 12) | 0xe0, ((c >> 6) & 0x3f) | 0x80, (c & 0x3f) | 0x80) }
    else { i++; c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff)); out += String.fromCharCode((c >> 18) | 0xf0, ((c >> 12) & 0x3f) | 0x80, ((c >> 6) & 0x3f) | 0x80, (c & 0x3f) | 0x80) }
  }
  return out
}

function ROTR(x, n) { return (x >>> n) | (x << (32 - n)) }
function Sigma0(x) { return ROTR(x, 2) ^ ROTR(x, 13) ^ ROTR(x, 22) }
function Sigma1(x) { return ROTR(x, 6) ^ ROTR(x, 11) ^ ROTR(x, 25) }
function sigma0(x) { return ROTR(x, 7) ^ ROTR(x, 18) ^ (x >>> 3) }
function sigma1(x) { return ROTR(x, 17) ^ ROTR(x, 19) ^ (x >>> 10) }
function Ch(x, y, z) { return (x & y) ^ (~x & z) }
function Maj(x, y, z) { return (x & y) ^ (x & z) ^ (y & z) }

function toHex(n) {
  n = (n >>> 0)
  var hex = '0123456789abcdef'
  var s = ''
  for (var i = 7; i >= 0; i--) {
    s += hex.charAt((n >>> (i * 4)) & 0x0f)
  }
  return s
}

module.exports = { sha256 }