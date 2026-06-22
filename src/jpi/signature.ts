function bytesToHex(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) {
    s += b.toString(16).padStart(2, '0')
  }
  return s
}

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length === 0 || hex.length % 2 !== 0) return null
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    const high = parseInt(hex[i * 2], 16)
    const low = parseInt(hex[i * 2 + 1], 16)
    if (isNaN(high) || isNaN(low)) return null
    bytes[i] = (high << 4) | low
  }
  return bytes
}

async function importKey(secret: string, usage: 'sign' | 'verify'): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    usage,
  ])
}

export async function sign(secret: string, payload: string): Promise<string> {
  const key = await importKey(secret, 'sign')
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return bytesToHex(new Uint8Array(sig))
}

export async function verify(secret: string, payload: string, sigHex: string): Promise<boolean> {
  const sigBytes = hexToBytes(sigHex)
  if (!sigBytes) return false
  const key = await importKey(secret, 'verify')
  return crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(payload))
}
