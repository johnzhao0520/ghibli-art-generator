'use client';

import React from 'react';
import { PrimaryButton, OutlineButton } from '@/components/ui/Button';

export default function CheckoutPage() {
  const handleCheckout = async () => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('支付创建失败，请重试');
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">订阅以解锁更多生成</h2>
      <p className="mt-3 text-slate-600 max-w-[600px] mx-auto">
        月度订阅，随时取消。支付成功后自动跳转回首页并解锁权限。
      </p>
      <div className="mt-8 flex flex-col items-center gap-4">
        <PrimaryButton
          color="emerald"
          aria-label="前往 Stripe Checkout"
          onClick={handleCheckout}
        >
          前往 Stripe Checkout
        </PrimaryButton>
        <OutlineButton aria-label="返回首页" onClick={() => (window.location.href = '/')}>返回首页</OutlineButton>
      </div>
    </main>
  );
}
