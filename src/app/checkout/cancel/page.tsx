'use client';

import React from 'react';
import { PrimaryButton } from '@/components/ui/Button';

export default function CancelPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">支付已取消</h2>
      <p className="mt-3 text-slate-600 max-w-[600px] mx-auto">你可以稍后再次尝试，或返回首页继续浏览。</p>
      <div className="mt-8">
        <PrimaryButton onClick={() => (window.location.href = '/')}>返回首页</PrimaryButton>
      </div>
    </main>
  );
}
