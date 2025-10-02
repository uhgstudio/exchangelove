'use client'

import Link from "next/link";
import { Heart, Users, Trophy, Clock, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUserWithRole, signOut } from "@/lib/auth";
import AdSense from "@/components/AdSense";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { user: currentUser, error, isAdmin: userIsAdmin } = await getCurrentUserWithRole();
        if (error) {
          console.error('사용자 확인 오류:', error);
        } else {
          setUser(currentUser);
          setIsAdmin(userIsAdmin);
        }
      } catch (error) {
        console.error('사용자 확인 중 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('로그아웃 오류:', error);
      } else {
        setUser(null);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-pink-500" />
              <h1 className="text-2xl font-bold text-gray-900">환승연애4</h1>
            </div>
            <nav className="flex space-x-4">
              {loading ? (
                <div className="text-gray-500">로딩 중...</div>
              ) : user ? (
                <>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{user.username || user.email}</span>
                  </div>
                  <Link 
                    href="/my-predictions" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
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

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            환승연애4 X예측
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            출연자들의 X를 예측하고, 방송 결과와 비교해보세요! 
            <br />
            정확한 예측으로 랭킹에 도전하고 다른 팬들과 경쟁해보세요.
          </p>
          
          {/* AdSense Banner */}
          <div className="mb-8 flex justify-center">
            <AdSense 
              slot="1234567890" 
              style={{ display: 'block', width: '728px', height: '90px' }}
              className="max-w-full"
            />
          </div>
          
          <div className="flex justify-center space-x-4 mb-12">
            <Link 
              href="/episodes" 
              className="bg-pink-500 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-pink-600 transition-colors"
            >
              예측하기
            </Link>
            <Link 
              href="/rankings" 
              className="bg-white text-pink-500 border-2 border-pink-500 px-8 py-3 rounded-lg text-lg font-medium hover:bg-pink-50 transition-colors"
            >
              랭킹 보기
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Users className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">커플 예측</h3>
            <p className="text-gray-600">
              드래그 앤 드롭으로 간편하게 출연자들을 매칭하고 커플을 예측해보세요.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Trophy className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">랭킹 시스템</h3>
            <p className="text-gray-600">
              정확한 예측으로 점수를 획득하고 다른 사용자들과 순위를 경쟁해보세요.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <Clock className="h-12 w-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">실시간 결과</h3>
            <p className="text-gray-600">
              방송이 끝나면 즉시 결과를 확인하고 통계를 살펴보세요.
            </p>
          </div>
        </div>

        {/* Current Episode Status */}
        <div className="mt-16 bg-white rounded-lg shadow-md p-8">
          <h3 className="text-2xl font-bold text-center mb-6">현재 진행 상황</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-500 mb-2">3회차</div>
              <div className="text-gray-600 mb-4">현재 진행 중인 회차</div>
              <div className="text-sm text-gray-500">
                예측 마감: 2024년 1월 15일 오후 8시
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">1,247명</div>
              <div className="text-gray-600 mb-4">참여자 수</div>
              <div className="text-sm text-gray-500">
                지금까지 참여한 사용자 수
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">
            본 서비스는 프로그램 공식 서비스가 아니며, 팬 참여 목적의 비상업적 웹 서비스입니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
