'use client';

import React, { useEffect, useState } from 'react';
import { PrimaryButton, OutlineButton } from '@/components/ui/Button';

export default function ErrorPage() {
  const [errorType, setErrorType] = useState('');

  useEffect(() => {
    // 从 URL 参数获取错误类型
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'general';
    setErrorType(type);
  }, []);

  const getErrorContent = () => {
    switch (errorType) {
      case 'generation':
        return {
          title: '生成失败',
          message: 'AI 图像生成过程中出现了问题，请检查网络连接或稍后重试。',
          suggestions: ['检查网络连接', '尝试上传其他图片', '稍后重试']
        };
      case 'payment':
        return {
          title: '支付失败',
          message: '支付过程中出现了问题，请检查支付信息或重试。',
          suggestions: ['检查支付信息', '尝试其他支付方式', '联系客服']
        };
      case 'auth':
        return {
          title: '登录失败',
          message: '登录过程中出现了问题，请重试或使用其他登录方式。',
          suggestions: ['重新登录', '检查网络连接', '尝试其他浏览器']
        };
      default:
        return {
          title: '出了点问题',
          message: '系统遇到了意外错误，请稍后重试或返回首页。',
          suggestions: ['刷新页面', '检查网络连接', '联系客服']
        };
    }
  };

  const errorContent = getErrorContent();

  return (
    <main className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-6">😅</div>
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
        {errorContent.title}
      </h2>
      <p className="mt-3 text-slate-600 max-w-[600px] mx-auto mb-8">
        {errorContent.message}
      </p>
      
      <div className="bg-slate-50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
        <h3 className="font-semibold text-slate-900 mb-3">建议尝试：</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          {errorContent.suggestions.map((suggestion, index) => (
            <li key={index} className="flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <PrimaryButton 
          aria-label="返回首页" 
          onClick={() => (window.location.href = '/')}
        >
          返回首页
        </PrimaryButton>
        <OutlineButton 
          aria-label="刷新页面" 
          onClick={() => window.location.reload()}
        >
          刷新页面
        </OutlineButton>
      </div>
    </main>
  );
}
