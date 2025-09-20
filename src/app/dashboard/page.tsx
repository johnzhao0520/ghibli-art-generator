'use client';

import React, { useState, useEffect } from 'react';
import { PrimaryButton, OutlineButton } from '@/components/ui/Button';
import { signOut } from 'next-auth/react';

interface UserData {
  loggedIn: boolean;
  subscriptionActive: boolean;
  email: string | null;
  name: string | null;
  image: string | null;
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/me');
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-slate-600">加载中...</p>
        </div>
      </main>
    );
  }

  if (!userData?.loggedIn) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">请先登录</h2>
          <p className="text-slate-600 mb-6">您需要登录才能访问用户面板</p>
          <PrimaryButton onClick={() => (window.location.href = '/login')}>
            前往登录
          </PrimaryButton>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <section className="rounded-xl bg-white shadow p-6">
        <div className="flex items-center gap-4">
          <img 
            src={userData.image || 'https://i.pravatar.cc/100?img=5'} 
            alt="avatar" 
            className="h-14 w-14 rounded-full shadow" 
          />
          <div>
            <div className="text-lg font-semibold text-slate-900">
              {userData.name || '用户'}
            </div>
            <div className="text-sm text-slate-600">
              {userData.email || '未设置邮箱'}
            </div>
          </div>
        </div>
        <div className="mt-6 border-t border-emerald-100 pt-6 grid gap-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-700">支付状态</span>
            <span className={`text-sm px-2 py-1 rounded ${
              userData.subscriptionActive 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-slate-100 text-slate-700'
            }`}>
              {userData.subscriptionActive ? '已订阅' : '未订阅'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-700">订阅方案</span>
            <span className="text-sm text-slate-600">
              {userData.subscriptionActive ? '月度订阅' : '无订阅'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            {userData.subscriptionActive ? (
              <PrimaryButton 
                onClick={() => alert('演示：跳转 Stripe Customer Portal')} 
                className="w-full sm:w-auto"
              >
                Stripe 订阅管理
              </PrimaryButton>
            ) : (
              <PrimaryButton 
                onClick={() => (window.location.href = '/checkout')} 
                className="w-full sm:w-auto"
              >
                立即订阅
              </PrimaryButton>
            )}
            <OutlineButton 
              onClick={handleSignOut} 
              className="w-full sm:w-auto"
            >
              退出登录
            </OutlineButton>
          </div>
        </div>
      </section>
    </main>
  );
}
