'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Settings, Users, Calendar, BarChart3, Plus, Edit, X, Save, LogOut } from 'lucide-react'
import { getSeasons, getEpisodes, getParticipants, createSeason, createEpisode, createParticipant, updateSeason, updateEpisode, updateParticipant, deleteParticipant, getAllEpisodes, testUpdateEpisode, getOfficialCouples, createOfficialCouple, deleteOfficialCouple } from '@/lib/database'
import { getCurrentUserWithRole, signOut } from '@/lib/auth'
import { Season, Participant } from '@/types/database'

export default function AdminPage() {
  const router = useRouter()
  const [seasons, setSeasons] = useState<Season[]>([])
  const [episodes, setEpisodes] = useState<any[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [officialCouples, setOfficialCouples] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [, setIsAdmin] = useState(false)
  
  // 모달 상태
  const [showSeasonModal, setShowSeasonModal] = useState(false)
  const [showEpisodeModal, setShowEpisodeModal] = useState(false)
  const [showParticipantModal, setShowParticipantModal] = useState(false)
  const [showOfficialCoupleModal, setShowOfficialCoupleModal] = useState(false)
  
  // 수정 모드 상태
  const [editingSeason, setEditingSeason] = useState<Season | null>(null)
  const [editingEpisode, setEditingEpisode] = useState<any>(null)
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null)
  
  // 폼 데이터
  const [seasonForm, setSeasonForm] = useState({ title: '', code: '', start_date: '', end_date: '' })
  const [episodeForm, setEpisodeForm] = useState({ season_id: '', number: '', title: '', open_at: '', close_at: '', status: 'scheduled' })
  const [participantForm, setParticipantForm] = useState({ name: '', gender: 'M', season_id: '', image_url: '' })
  const [officialCoupleForm, setOfficialCoupleForm] = useState({ episode_id: '', male_id: '', female_id: '' })

  // 인증 확인 및 데이터 로딩
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // 먼저 인증 상태 확인
        const { user: currentUser, error: authError, isAdmin: userIsAdmin } = await getCurrentUserWithRole()
        if (authError || !currentUser) {
          console.error('인증 오류:', authError)
          router.push('/auth/login')
          return
        }

        // 관리자 권한 확인
        if (!userIsAdmin) {
          console.error('관리자 권한 없음')
          alert('관리자 권한이 필요합니다.')
          router.push('/')
          return
        }
        
        setUser(currentUser)
        setIsAdmin(userIsAdmin)
        console.log('인증된 관리자:', currentUser)

        const [seasonsResult, episodesResult, participantsResult, allEpisodesResult, officialCouplesResult] = await Promise.all([
          getSeasons(),
          getEpisodes(),
          getParticipants(),
          getAllEpisodes(),
          getOfficialCouples()
        ])

        if (seasonsResult.data) setSeasons(seasonsResult.data)
        if (episodesResult.data) setEpisodes(episodesResult.data)
        if (participantsResult.data) setParticipants(participantsResult.data)
        if (officialCouplesResult.data) setOfficialCouples(officialCouplesResult.data)
        
        // 디버깅용: 모든 회차 데이터 로그
        console.log('관리자 페이지 로딩된 회차 데이터:', allEpisodesResult.data)
        console.log('관리자 페이지 로딩된 공식 커플 데이터:', officialCouplesResult.data)
      } catch (error) {
        console.error('데이터 로딩 오류:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  // 시즌 생성/수정
  const handleCreateSeason = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingSeason) {
        // 수정
        const { data, error } = await updateSeason(editingSeason.id, {
          title: seasonForm.title,
          code: seasonForm.code,
          start_date: seasonForm.start_date || null,
          end_date: seasonForm.end_date || null,
          is_active: true
        })

        if (error) {
          alert('시즌 수정 실패: ' + error.message)
          return
        }

        setSeasons(prev => prev.map(s => s.id === editingSeason.id ? data : s))
        alert('시즌이 수정되었습니다!')
      } else {
        // 생성
        const { data, error } = await createSeason({
          title: seasonForm.title,
          code: seasonForm.code,
          start_date: seasonForm.start_date || null,
          end_date: seasonForm.end_date || null,
          is_active: true
        })

        if (error) {
          alert('시즌 생성 실패: ' + error.message)
          return
        }

        setSeasons(prev => [...prev, data])
        alert('시즌이 생성되었습니다!')
      }

      setSeasonForm({ title: '', code: '', start_date: '', end_date: '' })
      setEditingSeason(null)
      setShowSeasonModal(false)
    } catch (error) {
      alert('시즌 처리 중 오류가 발생했습니다.')
    }
  }

  // 회차 생성/수정
  const handleCreateEpisode = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingEpisode) {
        // 수정
        console.log('수정할 회차 ID:', editingEpisode.id)
        console.log('수정 데이터:', {
          season_id: episodeForm.season_id,
          number: parseInt(episodeForm.number),
          title: episodeForm.title,
          open_at: episodeForm.open_at || null,
          close_at: episodeForm.close_at || null,
          status: episodeForm.status as any
        })
        
        // 디버깅용 업데이트 테스트
        const updateData = {
          season_id: episodeForm.season_id,
          number: parseInt(episodeForm.number),
          title: episodeForm.title,
          open_at: episodeForm.open_at || null,
          close_at: episodeForm.close_at || null,
          status: episodeForm.status as any
        }
        
        console.log('=== 디버깅 테스트 시작 ===')
        const testResult = await testUpdateEpisode(editingEpisode.id, updateData)
        console.log('=== 디버깅 테스트 결과 ===', testResult)
        
        const { data, error } = await updateEpisode(editingEpisode.id, updateData)

        if (error) {
          console.error('회차 수정 오류:', error)
          alert('회차 수정 실패: ' + error.message)
          return
        }

        console.log('수정된 회차 데이터:', data)
        setEpisodes(prev => prev.map(e => e.id === editingEpisode.id ? data : e))
        alert('회차가 수정되었습니다!')
      } else {
        // 생성
        const { data, error } = await createEpisode({
          season_id: episodeForm.season_id,
          number: parseInt(episodeForm.number),
          title: episodeForm.title,
          open_at: episodeForm.open_at || null,
          close_at: episodeForm.close_at || null,
          status: episodeForm.status as any
        })

        if (error) {
          alert('회차 생성 실패: ' + error.message)
          return
        }

        setEpisodes(prev => [...prev, data])
        alert('회차가 생성되었습니다!')
      }

      setEpisodeForm({ season_id: '', number: '', title: '', open_at: '', close_at: '', status: 'scheduled' })
      setEditingEpisode(null)
      setShowEpisodeModal(false)
    } catch (error) {
      alert('회차 처리 중 오류가 발생했습니다.')
    }
  }

  // 출연자 생성/수정
  const handleCreateParticipant = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingParticipant) {
        // 수정
        const { data, error } = await updateParticipant(editingParticipant.id, {
          name: participantForm.name,
          gender: participantForm.gender as 'M' | 'F',
          season_id: participantForm.season_id,
          image_url: participantForm.image_url || null,
          is_active: true
        })

        if (error) {
          alert('출연자 수정 실패: ' + error.message)
          return
        }

        setParticipants(prev => prev.map(p => p.id === editingParticipant.id ? data : p))
        alert('출연자가 수정되었습니다!')
      } else {
        // 생성
        const { data, error } = await createParticipant({
          name: participantForm.name,
          gender: participantForm.gender as 'M' | 'F',
          season_id: participantForm.season_id,
          image_url: participantForm.image_url || null,
          is_active: true
        })

        if (error) {
          alert('출연자 생성 실패: ' + error.message)
          return
        }

        setParticipants(prev => [...prev, data])
        alert('출연자가 추가되었습니다!')
      }

      setParticipantForm({ name: '', gender: 'M', season_id: '', image_url: '' })
      setEditingParticipant(null)
      setShowParticipantModal(false)
    } catch (error) {
      alert('출연자 처리 중 오류가 발생했습니다.')
    }
  }

  // 날짜 형식 변환 함수
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      // datetime-local input 형식으로 변환 (YYYY-MM-DDTHH:MM)
      return date.toISOString().slice(0, 16)
    } catch (error) {
      console.error('날짜 변환 오류:', error)
      return ''
    }
  }

  // 수정 모드 시작
  const handleEditSeason = (season: Season) => {
    setEditingSeason(season)
    setSeasonForm({
      title: season.title,
      code: season.code,
      start_date: formatDateForInput(season.start_date),
      end_date: formatDateForInput(season.end_date)
    })
    setShowSeasonModal(true)
  }

  const handleEditEpisode = (episode: any) => {
    console.log('수정할 회차 데이터:', episode)
    console.log('회차 ID 타입:', typeof episode.id)
    console.log('회차 ID 값:', episode.id)
    console.log('원본 날짜 데이터:', {
      open_at: episode.open_at,
      close_at: episode.close_at
    })
    
    setEditingEpisode(episode)
    setEpisodeForm({
      season_id: episode.season_id,
      number: episode.number.toString(),
      title: episode.title,
      open_at: formatDateForInput(episode.open_at),
      close_at: formatDateForInput(episode.close_at),
      status: episode.status
    })
    
    console.log('변환된 폼 데이터:', {
      open_at: formatDateForInput(episode.open_at),
      close_at: formatDateForInput(episode.close_at)
    })
    
    setShowEpisodeModal(true)
  }

  const handleEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant)
    setParticipantForm({
      name: participant.name,
      gender: participant.gender,
      season_id: participant.season_id,
      image_url: participant.image_url || ''
    })
    setShowParticipantModal(true)
  }

  // 삭제 함수
  const handleDeleteParticipant = async (participant: Participant) => {
    if (!confirm(`${participant.name} 출연자를 삭제하시겠습니까?`)) {
      return
    }

    try {
      const { error } = await deleteParticipant(participant.id)
      if (error) {
        alert('출연자 삭제 실패: ' + error.message)
        return
      }

      setParticipants(prev => prev.filter(p => p.id !== participant.id))
      alert('출연자가 삭제되었습니다!')
    } catch (error) {
      alert('출연자 삭제 중 오류가 발생했습니다.')
    }
  }

  // 공식 커플 관련 함수들
  const handleCreateOfficialCouple = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!officialCoupleForm.episode_id || !officialCoupleForm.male_id || !officialCoupleForm.female_id) {
      alert('모든 필드를 입력해주세요.')
      return
    }

    const { data, error } = await createOfficialCouple({
      episode_id: officialCoupleForm.episode_id,
      male_id: officialCoupleForm.male_id,
      female_id: officialCoupleForm.female_id
    })

    if (error) {
      alert(`공식 커플 등록 실패: ${error.message}`)
      return
    }

    // 목록에 추가
    setOfficialCouples(prev => [data, ...prev])
    setOfficialCoupleForm({ episode_id: '', male_id: '', female_id: '' })
    setShowOfficialCoupleModal(false)
  }

  const handleDeleteOfficialCouple = async (id: string) => {
    if (!confirm('정말로 이 공식 커플을 삭제하시겠습니까?')) return

    const { error } = await deleteOfficialCouple(id)
    if (error) {
      alert(`삭제 실패: ${error.message}`)
      return
    }

    // 목록에서 제거
    setOfficialCouples(prev => prev.filter(c => c.id !== id))
  }

  // 모달 닫기 시 상태 초기화
  const closeSeasonModal = () => {
    setShowSeasonModal(false)
    setEditingSeason(null)
    setSeasonForm({ title: '', code: '', start_date: '', end_date: '' })
  }

  const closeEpisodeModal = () => {
    setShowEpisodeModal(false)
    setEditingEpisode(null)
    setEpisodeForm({ season_id: '', number: '', title: '', open_at: '', close_at: '', status: 'scheduled' })
  }

  const closeParticipantModal = () => {
    setShowParticipantModal(false)
    setEditingParticipant(null)
    setParticipantForm({ name: '', gender: 'M', season_id: '', image_url: '' })
  }

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Link href="/" className="flex items-center space-x-2">
                <Settings className="h-8 w-8 text-gray-600" />
                <h1 className="text-2xl font-bold text-gray-900">관리자 패널</h1>
              </Link>
            </div>
            <nav className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <span className="text-sm font-medium">{user?.username || user?.email}</span>
              </div>
              <Link 
                href="/" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                홈으로
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1"
              >
                <LogOut className="w-4 h-4" />
                <span>로그아웃</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">관리자 대시보드</h2>
          <p className="text-gray-600">
            시즌, 회차, 출연자 정보를 관리할 수 있습니다.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{seasons.length}</div>
                <div className="text-sm text-gray-600">총 시즌</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{episodes.length}</div>
                <div className="text-sm text-gray-600">총 회차</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{participants.length}</div>
                <div className="text-sm text-gray-600">총 출연자</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <span className="text-2xl">📊</span>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">총 예측 수</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 시즌 관리 */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">시즌 관리</h3>
                <button 
                  onClick={() => setShowSeasonModal(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  새 시즌
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {seasons.map((season) => (
                <div key={season.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{season.title}</h4>
                      <div className="text-sm text-gray-700 mt-1 font-medium">
                        코드: {season.code}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditSeason(season)}
                        className="text-blue-500 hover:text-blue-700"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 회차 관리 */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">회차 관리</h3>
                <button 
                  onClick={() => setShowEpisodeModal(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  새 회차
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {episodes.map((episode) => (
                <div key={episode.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {episode.number}회차 - {episode.title}
                      </h4>
                      <div className="text-sm text-gray-700 mt-1 font-medium">
                        상태: {episode.status}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditEpisode(episode)}
                        className="text-green-500 hover:text-green-700"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 출연자 관리 */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">출연자 관리</h3>
                <button 
                  onClick={() => setShowParticipantModal(true)}
                  className="bg-purple-500 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-600 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  출연자 추가
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {participants.map((participant) => (
                <div key={participant.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {participant.image_url ? (
                          <img 
                            src={participant.image_url} 
                            alt={participant.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                          participant.gender === 'M' ? 'bg-blue-500' : 'bg-pink-500'
                        } ${participant.image_url ? 'hidden' : ''}`}>
                          {participant.name.charAt(0)}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{participant.name}</h4>
                        <div className="text-sm text-gray-700 font-medium">
                          {participant.gender === 'M' ? '남성' : '여성'}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditParticipant(participant)}
                        className="text-purple-500 hover:text-purple-700"
                        title="수정"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteParticipant(participant)}
                        className="text-red-500 hover:text-red-700"
                        title="삭제"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 공식 커플 관리 */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">공식 커플 관리</h3>
                <button 
                  onClick={() => setShowOfficialCoupleModal(true)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  공식 커플 추가
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {officialCouples.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>등록된 공식 커플이 없습니다.</p>
                </div>
              ) : (
                officialCouples.map((couple) => (
                  <div key={couple.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">💕</span>
                          <div>
                            <div className="font-medium text-gray-900">
                              {couple.male_participant?.name} × {couple.female_participant?.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {couple.episodes?.number}회차 - {couple.episodes?.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              확정일: {new Date(couple.decided_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleDeleteOfficialCouple(couple.id)}
                          className="text-red-500 hover:text-red-700"
                          title="삭제"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 시즌 생성 모달 */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSeason ? '시즌 수정' : '새 시즌 생성'}
              </h3>
              <button onClick={closeSeasonModal} className="text-gray-600 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSeason} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">시즌 제목</label>
                <input
                  type="text"
                  required
                  value={seasonForm.title}
                  onChange={(e) => setSeasonForm({...seasonForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="예: 환승연애4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">시즌 코드</label>
                <input
                  type="text"
                  required
                  value={seasonForm.code}
                  onChange={(e) => setSeasonForm({...seasonForm, code: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="예: EXCHANGE_LOVE_4"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">시작일</label>
                  <input
                    type="date"
                    value={seasonForm.start_date}
                    onChange={(e) => setSeasonForm({...seasonForm, start_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">종료일</label>
                  <input
                    type="date"
                    value={seasonForm.end_date}
                    onChange={(e) => setSeasonForm({...seasonForm, end_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeSeasonModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingSeason ? '수정' : '생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 회차 생성 모달 */}
      {showEpisodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingEpisode ? '회차 수정' : '새 회차 생성'}
              </h3>
              <button onClick={closeEpisodeModal} className="text-gray-600 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEpisode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">시즌 선택</label>
                <select
                  required
                  value={episodeForm.season_id}
                  onChange={(e) => setEpisodeForm({...episodeForm, season_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                >
                  <option value="">시즌을 선택하세요</option>
                  {seasons.map(season => (
                    <option key={season.id} value={season.id}>{season.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">회차 번호</label>
                <input
                  type="number"
                  required
                  value={episodeForm.number}
                  onChange={(e) => setEpisodeForm({...episodeForm, number: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  placeholder="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">회차 제목</label>
                <input
                  type="text"
                  required
                  value={episodeForm.title}
                  onChange={(e) => setEpisodeForm({...episodeForm, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  placeholder="예: 첫 만남"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">상태</label>
                <select
                  value={episodeForm.status}
                  onChange={(e) => setEpisodeForm({...episodeForm, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
                >
                  <option value="scheduled">예정</option>
                  <option value="open">진행 중</option>
                  <option value="closed">마감</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">오픈 시간</label>
                  <input
                    type="datetime-local"
                    value={episodeForm.open_at}
                    onChange={(e) => setEpisodeForm({...episodeForm, open_at: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">마감 시간</label>
                  <input
                    type="datetime-local"
                    value={episodeForm.close_at}
                    onChange={(e) => setEpisodeForm({...episodeForm, close_at: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeEpisodeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingEpisode ? '수정' : '생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 출연자 생성 모달 */}
      {showParticipantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingParticipant ? '출연자 수정' : '출연자 추가'}
              </h3>
              <button onClick={closeParticipantModal} className="text-gray-600 hover:text-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateParticipant} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">시즌 선택</label>
                <select
                  required
                  value={participantForm.season_id}
                  onChange={(e) => setParticipantForm({...participantForm, season_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                >
                  <option value="">시즌을 선택하세요</option>
                  {seasons.map(season => (
                    <option key={season.id} value={season.id}>{season.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">이름</label>
                <input
                  type="text"
                  required
                  value={participantForm.name}
                  onChange={(e) => setParticipantForm({...participantForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                  placeholder="예: 김민수"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">성별</label>
                <select
                  value={participantForm.gender}
                  onChange={(e) => setParticipantForm({...participantForm, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                >
                  <option value="M">남성</option>
                  <option value="F">여성</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">이미지 URL</label>
                <input
                  type="url"
                  value={participantForm.image_url}
                  onChange={(e) => setParticipantForm({...participantForm, image_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                  placeholder="https://example.com/image.jpg"
                />
                {participantForm.image_url && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">미리보기:</p>
                    <img 
                      src={participantForm.image_url} 
                      alt="미리보기"
                      className="w-16 h-16 rounded-full object-cover border border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeParticipantModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 flex items-center justify-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingParticipant ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 공식 커플 생성 모달 */}
      {showOfficialCoupleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">공식 커플 추가</h3>
              <button
                onClick={() => setShowOfficialCoupleModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateOfficialCouple} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">회차</label>
                <select
                  value={officialCoupleForm.episode_id}
                  onChange={(e) => setOfficialCoupleForm(prev => ({ ...prev, episode_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">회차를 선택하세요</option>
                  {episodes.map((episode) => (
                    <option key={episode.id} value={episode.id}>
                      {episode.number}회차 - {episode.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">남성 출연자</label>
                <select
                  value={officialCoupleForm.male_id}
                  onChange={(e) => setOfficialCoupleForm(prev => ({ ...prev, male_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">남성 출연자를 선택하세요</option>
                  {participants.filter(p => p.gender === 'M').map((participant) => (
                    <option key={participant.id} value={participant.id}>
                      {participant.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">여성 출연자</label>
                <select
                  value={officialCoupleForm.female_id}
                  onChange={(e) => setOfficialCoupleForm(prev => ({ ...prev, female_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">여성 출연자를 선택하세요</option>
                  {participants.filter(p => p.gender === 'F').map((participant) => (
                    <option key={participant.id} value={participant.id}>
                      {participant.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowOfficialCoupleModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}