'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Clock, Users, Trophy, CheckCircle, Loader2 } from 'lucide-react'
import { formatDate, formatTimeRemaining } from '@/lib/utils'
import { getEpisodesWithStats } from '@/lib/database'

export default function EpisodesPage() {
  const [episodes, setEpisodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 데이터 로딩
  useEffect(() => {
    const loadEpisodes = async () => {
      try {
        setLoading(true)
        const { data, error } = await getEpisodesWithStats()
        
        if (error) {
          console.error('회차 데이터 로딩 실패:', error)
          return
        }

        if (data) {
          setEpisodes(data)
        }
      } catch (error) {
        console.error('회차 데이터 로딩 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    loadEpisodes()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Clock className="w-3 h-3 mr-1" />
            예측 가능
          </span>
        )
      case 'closed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            마감됨
          </span>
        )
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            예정
          </span>
        )
      default:
        return null
    }
  }

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">회차 정보를 불러오는 중...</p>
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
              <Link 
                href="/episodes" 
                className="text-pink-600 px-3 py-2 rounded-md text-sm font-medium"
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
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                내 예측
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">회차별 예측</h2>
          <p className="text-gray-600">
            각 회차별로 출연자들의 X를 예측하고 결과를 확인해보세요.
          </p>
        </div>

        {episodes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📺</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">회차 정보가 없습니다</h3>
            <p className="text-gray-600 mb-6">관리자 페이지에서 시즌과 회차를 먼저 생성해주세요.</p>
            <Link 
              href="/admin" 
              className="bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition-colors"
            >
              관리자 페이지로 이동
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {episodes.map((episode) => (
            <div key={episode.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {episode.number}회차
                  </h3>
                  {getStatusBadge(episode.status)}
                </div>
                
                <h4 className="text-lg font-medium text-gray-800 mb-2">
                  {episode.title}
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-700">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">
                      {episode.status === 'open' 
                        ? `마감까지 ${formatTimeRemaining(episode.close_at)}`
                        : `마감: ${formatDate(episode.close_at)}`
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-700">
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-medium">{episode.total_predictions?.toLocaleString() || 0}명 참여</span>
                  </div>
                  
                  {episode.status === 'closed' && episode.accuracy_rate > 0 && (
                    <div className="flex items-center text-sm text-gray-700">
                      <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
                      <span className="font-medium">전체 정답률: {episode.accuracy_rate}%</span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  {episode.status === 'open' ? (
                    <Link
                      href={`/episodes/${episode.id}/predict`}
                      className="w-full bg-pink-500 text-white py-2 px-4 rounded-md text-center block hover:bg-pink-600 transition-colors"
                    >
                      예측하기
                    </Link>
                  ) : episode.status === 'closed' ? (
                    <Link
                      href={`/episodes/${episode.id}/results`}
                      className="w-full bg-gray-500 text-white py-2 px-4 rounded-md text-center block hover:bg-gray-600 transition-colors"
                    >
                      결과 보기
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-md text-center cursor-not-allowed"
                    >
                      예정
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* 통계 섹션 */}
        {episodes.length > 0 && (
          <div className="mt-12 bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">전체 통계</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-500 mb-2">{episodes.length}</div>
                <div className="text-gray-600">총 회차</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">
                  {episodes.reduce((sum, episode) => sum + (episode.total_predictions || 0), 0).toLocaleString()}
                </div>
                <div className="text-gray-600">총 예측 수</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">
                  {episodes.length > 0 
                    ? Math.round(episodes.reduce((sum, episode) => sum + (episode.accuracy_rate || 0), 0) / episodes.length)
                    : 0}%
                </div>
                <div className="text-gray-600">평균 정답률</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
