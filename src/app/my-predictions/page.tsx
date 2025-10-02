'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, Trophy, User, LogOut } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { getUserPredictions } from '@/lib/database'
import { getCurrentUserWithRole, signOut } from '@/lib/auth'

export default function MyPredictionsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [predictions, setPredictions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        // 먼저 인증 상태 확인
        const { user: currentUser, error: authError, isAdmin: userIsAdmin } = await getCurrentUserWithRole()
        if (authError || !currentUser) {
          console.error('인증 오류:', authError)
          router.push('/auth/login')
          return
        }

        setUser(currentUser)
        setIsAdmin(userIsAdmin)
        console.log('인증된 사용자:', currentUser)

        // 사용자의 예측 데이터 가져오기
        const { data: predictionsData, error: predictionsError } = await getUserPredictions(currentUser.id)
        
        if (predictionsError) {
          console.error('예측 데이터 로딩 오류:', predictionsError)
        } else {
          setPredictions(predictionsData || [])
          console.log('사용자 예측 데이터:', predictionsData)
        }

      } catch (error) {
        console.error('데이터 로딩 중 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        console.error('로그아웃 오류:', error)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('로그아웃 중 오류:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-gray-600">로딩 중...</div>
        </div>
      </div>
    )
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'closed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'open':
        return <Clock className="w-5 h-5 text-blue-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'closed':
        return '결과 확정'
      case 'open':
        return '진행 중'
      default:
        return '예정'
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl">💕</span>
                <h1 className="text-2xl font-bold text-gray-900">환승연애4</h1>
              </Link>
            </div>
            <nav className="flex space-x-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user.username || user.email}</span>
                  </div>
                  <Link 
                    href="/episodes" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    회차별 예측
                  </Link>
                  <Link 
                    href="/rankings" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    랭킹
                  </Link>
                  <Link 
                    href="/my-predictions" 
                    className="text-pink-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    내 예측
                  </Link>
                  {isAdmin && (
                    <Link 
                      href="/admin" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      관리자
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>로그아웃</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/login" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    로그인
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="bg-pink-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-pink-600"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">내 예측 기록</h2>
          <p className="text-gray-600">
            지금까지 제출한 예측들과 결과를 확인해보세요.
          </p>
        </div>

        {/* 전체 통계 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{predictions.length}회</div>
            <div className="text-sm text-gray-600">총 참여</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {predictions.filter(p => p.episodes?.status === 'closed').length}회
            </div>
            <div className="text-sm text-gray-600">결과 확정된 회차</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {predictions.filter(p => p.episodes?.status === 'open').length}회
            </div>
            <div className="text-sm text-gray-600">진행 중인 회차</div>
          </div>
        </div>

        {/* 예측 목록 */}
        <div className="space-y-6">
          {predictions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-500 mb-4">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">아직 예측한 회차가 없습니다</h3>
                <p className="text-gray-600 mb-6">
                  회차별 예측에 참여해보세요!
                </p>
                <Link
                  href="/episodes"
                  className="bg-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors"
                >
                  예측하러 가기
                </Link>
              </div>
            </div>
          ) : (
            predictions.map((prediction) => (
            <div key={prediction.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(prediction.status)}
                      <h3 className="text-xl font-semibold text-gray-900">
                        {prediction.episodes?.number}회차 - {prediction.episodes?.title}
                      </h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      prediction.episodes?.status === 'closed' ? 'bg-green-100 text-green-800' :
                      prediction.episodes?.status === 'open' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusText(prediction.episodes?.status)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      제출: {formatDate(prediction.submitted_at)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {prediction.pairs?.length || 0}쌍 예측
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {prediction.pairs && prediction.pairs.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {prediction.pairs.map((pair: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {/* 남성 출연자 이미지 */}
                            <div className="flex-shrink-0">
                              {pair.maleImageUrl ? (
                                <img 
                                  src={pair.maleImageUrl} 
                                  alt={pair.maleName || `남성 ${index + 1}`}
                                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-blue-500 ${pair.maleImageUrl ? 'hidden' : ''}`}>
                                {(pair.maleName || `남성 ${index + 1}`).charAt(0)}
                              </div>
                            </div>
                            
                            {/* 하트 아이콘 */}
                            <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center">
                              <span className="text-pink-600 text-xs">💕</span>
                            </div>
                            
                            {/* 여성 출연자 이미지 */}
                            <div className="flex-shrink-0">
                              {pair.femaleImageUrl ? (
                                <img 
                                  src={pair.femaleImageUrl} 
                                  alt={pair.femaleName || `여성 ${index + 1}`}
                                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-pink-500 ${pair.femaleImageUrl ? 'hidden' : ''}`}>
                                {(pair.femaleName || `여성 ${index + 1}`).charAt(0)}
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {pair.maleName || `남성 ${index + 1}`} × {pair.femaleName || `여성 ${index + 1}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              예측한 커플
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {prediction.episodes?.status === 'closed' ? '결과 확인 가능' : 
                           prediction.episodes?.status === 'open' ? '진행 중' : '대기 중'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>예측한 커플 정보가 없습니다.</p>
                  </div>
                )}

                {prediction.episodes?.status === 'closed' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-blue-900">
                          방송이 종료되었습니다
                        </div>
                        <div className="text-sm text-blue-700">
                          실제 결과와 비교해보세요
                        </div>
                      </div>
                      <Link
                        href={`/episodes/${prediction.episode_id}/results`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        결과 보기 →
                      </Link>
                    </div>
                  </div>
                )}

                {prediction.episodes?.status === 'open' && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-yellow-900">
                          예측이 진행 중입니다
                        </div>
                        <div className="text-sm text-yellow-700">
                          방송이 끝나면 결과를 확인할 수 있습니다
                        </div>
                      </div>
                      <Link
                        href={`/episodes/${prediction.episode_id}/predict`}
                        className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                      >
                        예측 수정하기 →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
