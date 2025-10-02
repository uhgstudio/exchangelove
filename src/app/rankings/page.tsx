'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Trophy, Users, Clock, User, LogOut } from 'lucide-react'
import { getEpisodesWithStats } from '@/lib/database'
import { getCurrentUserWithRole, signOut } from '@/lib/auth'

export default function RankingsPage() {
  const [user, setUser] = useState<any>(null)
  const [episodes, setEpisodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        // 인증 상태 확인
        const { user: currentUser, error: authError, isAdmin: userIsAdmin } = await getCurrentUserWithRole()
        if (authError || !currentUser) {
          console.error('인증 오류:', authError)
          // 랭킹 페이지는 로그인 없이도 볼 수 있도록 함
        } else {
          setUser(currentUser)
          setIsAdmin(userIsAdmin)
        }

        // 회차별 통계 데이터 가져오기
        const { data: episodesData, error: episodesError } = await getEpisodesWithStats()
        if (episodesError) {
          console.error('회차 데이터 로딩 오류:', episodesError)
        } else {
          setEpisodes(episodesData || [])
        }

      } catch (error) {
        console.error('데이터 로딩 중 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSignOut = async () => {
    try {
      const { error } = await signOut()
      if (error) {
        console.error('로그아웃 오류:', error)
      } else {
        window.location.href = '/'
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
                    className="text-pink-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    랭킹
                  </Link>
                  <Link 
                    href="/my-predictions" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    내 예측
                  </Link>
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
                    href="/episodes" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    회차별 예측
                  </Link>
                  <Link 
                    href="/rankings" 
                    className="text-pink-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    랭킹
                  </Link>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">랭킹</h2>
          <p className="text-gray-600">
            현재는 예측 참여 현황을 확인할 수 있습니다. 시즌이 끝나면 점수와 랭킹이 공개됩니다.
          </p>
        </div>

        {/* 전체 통계 */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {episodes.reduce((acc, ep) => acc + (ep.total_predictions || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">총 예측 참여</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{episodes.length}</div>
            <div className="text-sm text-gray-600">총 회차</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {episodes.filter(ep => ep.status === 'open').length}
            </div>
            <div className="text-sm text-gray-600">진행 중인 회차</div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 랭킹 안내 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">랭킹 시스템</h3>
                <p className="text-sm text-gray-600 mt-1">시즌 종료 후 점수와 랭킹이 공개됩니다</p>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">랭킹 준비 중</h4>
                  <p className="text-gray-600 mb-6">
                    시즌이 끝나면 다음과 같은 방식으로 점수가 계산됩니다:
                  </p>
                  <div className="text-left max-w-md mx-auto space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                      <span className="text-sm text-gray-700">1회차 예측 성공: <strong>10점</strong></span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                      <span className="text-sm text-gray-700">2회차 예측 성공: <strong>8점</strong></span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                      <span className="text-sm text-gray-700">3회차 예측 성공: <strong>6점</strong></span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-medium">4</span>
                      <span className="text-sm text-gray-700">4회차 예측 성공: <strong>4점</strong></span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-6">
                    회차가 진행될수록 점수가 낮아져서 초기 예측의 정확도가 더 중요합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 회차별 통계 */}
          <div>
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">회차별 참여 현황</h3>
                <p className="text-sm text-gray-600 mt-1">각 회차별 예측 참여자 수</p>
              </div>
              <div className="divide-y divide-gray-200">
                {episodes.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <p>등록된 회차가 없습니다.</p>
                  </div>
                ) : (
                  episodes.map((episode) => (
                    <div key={episode.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{episode.number}회차</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          episode.status === 'closed' ? 'bg-green-100 text-green-800' :
                          episode.status === 'open' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {episode.status === 'closed' ? '종료' :
                           episode.status === 'open' ? '진행중' : '예정'}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>제목: {episode.title}</div>
                        <div>참여자: {(episode.total_predictions || 0).toLocaleString()}명</div>
                        {episode.status === 'closed' && (
                          <div className="text-green-600 font-medium">결과 확인 가능</div>
                        )}
                        {episode.status === 'open' && (
                          <div className="text-blue-600 font-medium">예측 진행 중</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 예측 참여 안내 */}
            <div className="bg-white rounded-lg shadow-md mt-6">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">예측 참여하기</h3>
                <p className="text-sm text-gray-600 mt-1">지금 바로 예측에 참여해보세요!</p>
              </div>
              <div className="p-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">💕</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">커플 예측하기</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    출연자들을 매칭해서 커플을 예측해보세요.
                  </p>
                  <Link
                    href="/episodes"
                    className="bg-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-600 transition-colors inline-block"
                  >
                    예측하러 가기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
