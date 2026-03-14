 const buckets = new Map<string, number[]>()
 
 export function rateLimit(key: string, limit: number, windowMs: number) {
   const now = Date.now()
   const from = now - windowMs
   const arr = buckets.get(key) ?? []
   const kept = arr.filter((t) => t > from)
   if (kept.length >= limit) {
     buckets.set(key, kept)
     return { allowed: false, remaining: 0 }
   }
   kept.push(now)
   buckets.set(key, kept)
   return { allowed: true, remaining: Math.max(0, limit - kept.length) }
 }
 
 export function ipFromHeaders(h: Headers) {
   const fwd = h.get("x-forwarded-for")
   if (!fwd) return "unknown"
   const ip = fwd.split(",")[0]?.trim()
   return ip || "unknown"
 }
