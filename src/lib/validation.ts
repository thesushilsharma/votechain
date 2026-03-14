 function isString(v: unknown): v is string {
   return typeof v === "string"
 }
 
 function isNonEmptyString(v: unknown): v is string {
   return isString(v) && v.trim().length > 0
 }
 
 function asDate(v: unknown): Date | undefined {
   if (v instanceof Date) return v
   if (isString(v)) {
     const d = new Date(v)
     if (!isNaN(d.getTime())) return d
   }
   return undefined
 }
 
 export function validateCreateTopic(body: any) {
   const title = body?.title
   const description = body?.description
   const startTime = body?.startTime
   const endTime = body?.endTime
   const creator = body?.creator
   const allow = body?.allow
 
   const errors: string[] = []
   if (!isNonEmptyString(title)) errors.push("title")
   if (!isNonEmptyString(creator)) errors.push("creator")
   if (description != null && !isString(description)) errors.push("description")
   const start = startTime != null ? asDate(startTime) : undefined
   const end = endTime != null ? asDate(endTime) : undefined
   let allowList: string[] | undefined
   if (allow != null) {
     if (Array.isArray(allow) && allow.every(isNonEmptyString)) {
       allowList = allow
     } else {
       errors.push("allow")
     }
   }
 
   if (errors.length) {
     return { ok: false as const, message: "Invalid input", details: { fields: errors } }
   }
 
   return {
     ok: true as const,
     data: {
       title: String(title).trim(),
       description: description ? String(description) : "",
       startTime: start,
       endTime: end,
       creator: String(creator),
       allow: allowList,
     },
   }
 }
 
 export function validateVote(body: any) {
   const type = body?.type
   const voter = body?.voter
   if (!isNonEmptyString(voter) || (type !== "up" && type !== "down")) {
     return { ok: false as const, message: "Invalid vote", details: { fields: ["type", "voter"] } }
   }
   return { ok: true as const, data: { type, voter } }
 }
 
 export function validateComment(body: any) {
   const content = body?.content
   const author = body?.author
   if (!isNonEmptyString(content) || !isNonEmptyString(author)) {
     return { ok: false as const, message: "Invalid comment", details: { fields: ["content", "author"] } }
   }
   return { ok: true as const, data: { content: String(content).trim(), author } }
 }
 
 export function validateAllowlist(body: any) {
   const allow = body?.allow
   if (!Array.isArray(allow) || allow.length === 0 || !allow.every(isNonEmptyString)) {
     return { ok: false as const, message: "Invalid allowlist", details: { fields: ["allow"] } }
   }
   return { ok: true as const, data: { allow: allow as string[] } }
 }
