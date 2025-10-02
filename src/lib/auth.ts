import { createClient } from './supabase/client'
import bcrypt from 'bcryptjs'

export async function signUp(email: string, password: string, username: string) {
  const supabase = createClient()
  
  try {
    // Supabase Auth로 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: '사용자 생성에 실패했습니다.' }
    }

    // 사용자 프로필을 user_profiles 테이블에 저장
    const { error: dbError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        username,
        role: 'user'
      })

    if (dbError) {
      console.error('프로필 생성 오류:', dbError)
      console.error('오류 코드:', dbError.code)
      console.error('오류 메시지:', dbError.message)
      console.error('오류 세부사항:', dbError.details)
      // 프로필 생성 실패해도 회원가입은 성공으로 처리
      // return { error: dbError.message }
    }

    // 이메일 인증이 필요한 경우
    if (authData.user && !authData.user.email_confirmed_at) {
      return { 
        success: true, 
        user: authData.user, 
        needsEmailConfirmation: true,
        message: '이메일 인증이 필요합니다. 이메일을 확인해주세요.'
      }
    }

    return { success: true, user: authData.user }
  } catch (error) {
    return { error: '회원가입 중 오류가 발생했습니다.' }
  }
}

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true, user: data.user }
  } catch (error) {
    return { error: '로그인 중 오류가 발생했습니다.' }
  }
}

export async function signOut() {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { error: '로그아웃 중 오류가 발생했습니다.' }
  }
}

export async function getCurrentUser() {
  const supabase = createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      return { error: error.message }
    }

    if (!user) {
      return { user: null }
    }

    // 사용자 프로필 가져오기
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError) {
      return { error: userError.message }
    }

    return { user: userData }
  } catch (error) {
    return { error: '사용자 정보를 가져오는 중 오류가 발생했습니다.' }
  }
}

// 관리자 권한 확인 함수
export async function isAdmin(): Promise<boolean> {
  try {
    const { user, error } = await getCurrentUser()
    
    if (error || !user) {
      return false
    }

    return user.role === 'admin'
  } catch (error) {
    console.error('관리자 권한 확인 오류:', error)
    return false
  }
}

// 관리자 권한 확인 (사용자 정보와 함께 반환)
export async function getCurrentUserWithRole() {
  try {
    const { user, error } = await getCurrentUser()
    
    if (error || !user) {
      return { user: null, error, isAdmin: false }
    }

    return { 
      user, 
      error: null, 
      isAdmin: user.role === 'admin' 
    }
  } catch (error) {
    return { user: null, error: '사용자 정보를 가져오는 중 오류가 발생했습니다.', isAdmin: false }
  }
}

export async function resetPassword(email: string) {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { error: '비밀번호 재설정 중 오류가 발생했습니다.' }
  }
}
