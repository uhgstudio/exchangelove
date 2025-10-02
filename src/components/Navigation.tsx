'use client'

import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth";

interface NavigationProps {
  user: any;
  isAdmin: boolean;
  onSignOut: () => void;
}

export default function Navigation({ user, isAdmin, onSignOut }: NavigationProps) {
  return (
    <nav className="flex items-center space-x-4">
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
        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
      >
        내 예측
      </Link>
      
      {/* 관리자 메뉴 - admin 권한이 있을 때만 표시 */}
      {isAdmin && (
        <Link
          href="/admin"
          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
        >
          관리자
        </Link>
      )}
      
      <div className="flex items-center space-x-2">
        <User className="h-5 w-5 text-gray-500" />
        <span className="text-sm text-gray-700">
          {user?.username || user?.email}
        </span>
      </div>
      <button
        onClick={onSignOut}
        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
      >
        <LogOut className="h-4 w-4" />
        <span>로그아웃</span>
      </button>
    </nav>
  );
}
