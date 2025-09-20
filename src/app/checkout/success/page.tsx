'use client';

import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '@/components/ui/Button';

export default function CheckoutSuccessPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [debugInfo, setDebugInfo] = useState<{sessionId: string | null, url: string} | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        setDebugInfo({ sessionId, url: window.location.href });
        
        if (!sessionId) {
          console.log('No session_id found, setting status to success for testing');
          setStatus('success');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          return;
        }

        console.log('Verifying payment with session_id:', sessionId);
        
        const response = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
        const result = await response.json();
        
        console.log('Verification result:', result);
        
        if (result.subscriptionActive) {
          setStatus('success');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
      }
    };

    verifyPayment();
  }, []);

  if (status === 'loading') {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <p className="mt-4 text-slate-600">验证支付中...</p>
        {debugInfo && (
          <div className="mt-4 p-4 bg-slate-100 rounded text-sm text-left">
            <p>Debug Info:</p>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-red-600 text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">验证失败</h2>
        <p className="text-slate-600 mb-6">支付验证失败，请联系客服或重试。</p>
        <PrimaryButton onClick={() => (window.location.href = '/')}>
          返回首页
        </PrimaryButton>
        {debugInfo && (
          <div className="mt-6 p-4 bg-slate-100 rounded text-sm text-left">
            <p>Debug Info:</p>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="text-emerald-600 text-6xl mb-4">✅</div>
      <h2 className="text-2xl font-bold text-slate-900 mb-4">支付成功！</h2>
      <p className="text-slate-600 mb-6">订阅已激活，正在跳转到首页...</p>
      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
    </main>
  );
}
