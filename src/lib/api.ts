 export type ApiError = {
   code: string
   message: string
   details?: unknown
 }
 
 export function ok<T>(data: T) {
   return { success: true, data }
 }
 
 export function err(code: string, message: string, details?: unknown) {
   const e: ApiError = { code, message, details }
   return { success: false, error: e }
 }
