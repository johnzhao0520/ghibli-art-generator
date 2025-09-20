'use client';

import React from 'react';
import { PrimaryButton, OutlineButton } from '@/components/ui/Button';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">登录以继续</h2>
      <p className="mt-3 text-slate-600 max-w-[600px] mx-auto">使用 Google 登录，完成后将跳转回首页。</p>
      <div className="mt-8 flex flex-col items-center gap-4">
        <PrimaryButton
          color="blue"
          aria-label="使用 Google 登录"
          onClick={() => signIn('google', { callbackUrl: '/' })}
        >
          使用 Google 登录
        </PrimaryButton>
        <OutlineButton aria-label="返回首页" onClick={() => (window.location.href = '/')}>返回首页</OutlineButton>
      </div>
    </main>
  );
}
