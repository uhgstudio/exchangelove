'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()
      
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('인증 오류:', error)
          router.push('/auth/login?error=auth_failed')
          return
        }

        if (data.session) {
          // 인증 성공 - 홈페이지로 리다이렉트
          router.push('/')
        } else {
          // 세션이 없음 - 로그인 페이지로 리다이렉트
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('콜백 처리 오류:', error)
        router.push('/auth/login?error=callback_failed')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600">인증 처리 중...</p>
      </div>
    </div>
  )
}
