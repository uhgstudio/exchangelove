import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://abcdefghijklmnop.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzNDU2Nzg5MCwiZXhwIjoxOTUwMTQzODkwfQ.example_signature_here'
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase 환경변수가 설정되지 않았습니다. 기본값을 사용합니다.')
  }
  
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          if (typeof document !== 'undefined') {
            const value = document.cookie
              .split('; ')
              .find(row => row.startsWith(`${name}=`))
              ?.split('=')[1]
            return value ? decodeURIComponent(value) : undefined
          }
          return undefined
        },
        set(name: string, value: string, options: any = {}) {
          if (typeof document !== 'undefined') {
            const expires = options.expires ? `; expires=${options.expires}` : ''
            const path = options.path ? `; path=${options.path}` : '; path=/'
            const domain = options.domain ? `; domain=${options.domain}` : ''
            const secure = options.secure ? '; secure' : ''
            const sameSite = options.sameSite ? `; samesite=${options.sameSite}` : ''
            
            document.cookie = `${name}=${encodeURIComponent(value)}${expires}${path}${domain}${secure}${sameSite}`
          }
        },
        remove(name: string, options: any = {}) {
          if (typeof document !== 'undefined') {
            const expires = '; expires=Thu, 01 Jan 1970 00:00:00 GMT'
            const path = options.path ? `; path=${options.path}` : '; path=/'
            const domain = options.domain ? `; domain=${options.domain}` : ''
            
            document.cookie = `${name}=${expires}${path}${domain}`
          }
        }
      }
    }
  )
}
