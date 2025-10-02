import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
