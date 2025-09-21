'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { PrimaryButton } from '@/components/ui/Button';

function NavBar({ loggedIn, subscriptionActive, user }: { 
  loggedIn: boolean; 
  subscriptionActive: boolean; 
  user: {name: string, email: string, image: string} | null;
}) {
  return (
    <header className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b border-emerald-100">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded bg-emerald-500 shadow ring-2 ring-emerald-200" />
          <span className="text-slate-900 font-semibold tracking-wide group-hover:text-emerald-700 transition-colors">
            Ghibli-Inspired Art
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <a href="/dashboard" className="text-sm px-3 py-2 rounded hover:bg-emerald-50 text-slate-700">
            Dashboard
          </a>
          {!loggedIn ? (
            <a href="/login" className="text-sm px-3 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600">
              Login
            </a>
          ) : (
            <div className="flex items-center gap-2">
              {user?.image && (
                <img src={user.image} alt="avatar" className="h-6 w-6 rounded-full" />
              )}
              <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-800">
                {subscriptionActive ? 'Subscribed' : 'Free'}
              </span>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function UploadZone({
  file, onFileChange, selectedStyle, onStyleChange
}: { 
  file: File | null; 
  onFileChange: (f: File) => void;
  selectedStyle: string;
  onStyleChange: (style: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!file) { setPreviewUrl(''); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => { URL.revokeObjectURL(url); };
  }, [file]);

  const handleFile = (f: File) => {
    const okType = ['image/jpeg', 'image/png'].includes(f.type);
    const okSize = f.size <= 10 * 1024 * 1024; // 10MB
    if (!okType) { alert('请上传 JPG/PNG 图片'); return; }
    if (!okSize) { alert('图片大小需 ≤ 10MB'); return; }
    onFileChange(f);
  };

  return (
    <div className="space-y-4">
      {/* 风格选择器 */}
      <div className="w-full max-w-[600px] mx-auto space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Choose Ghibli Style:
        </label>
        <select 
          value={selectedStyle}
          onChange={(e) => onStyleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm"
        >
          <option value="ghibli-inspired">🎨 Ghibli Inspired - Vibrant & Whimsical</option>
          <option value="ghibli-soft-pastel">🌸 Ghibli Soft Pastel - Dreamy & Gentle</option>
          <option value="ghibli-filmic">🎬 Ghibli Filmic - Cinematic & Dramatic</option>
        </select>
      </div>

      {/* 现有的上传区域保持不变 */}
      <div
        role="region"
        aria-label="图片上传区域，支持拖拽或点击选择"
        className={`w-full max-w-[600px] mx-auto p-5 rounded-lg border-2 border-dashed
        ${dragOver ? 'border-emerald-500 bg-emerald-50/60' : 'border-emerald-200 bg-white'}
        shadow transition-colors`}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        <div className="text-center space-y-3">
          <div className="text-slate-600">
            拖拽图片到此处，或
            <button
              aria-label="选择图片上传"
              className="ml-1 text-emerald-700 underline decoration-emerald-300 hover:text-emerald-800"
              onClick={() => inputRef.current?.click()}
            >
              点击上传
            </button>
          </div>
          <div className="text-xs text-slate-500">支持 JPG/PNG，最大 10MB</div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          {previewUrl && (
            <div className="mt-4">
              <img src={previewUrl} alt="preview" className="mx-auto rounded shadow max-h-64 object-contain" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  // 真实用户态
  const [loggedIn, setLoggedIn] = useState(false);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [trialUsed, setTrialUsed] = useState(false);
  const [user, setUser] = useState<{name: string, email: string, image: string} | null>(null);

  const [selectedStyle, setSelectedStyle] = useState('ghibli-inspired'); // 新增
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [generationStep, setGenerationStep] = useState('');

  // 从 API 获取用户状态
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await fetch('/api/me');
        const data = await response.json();
        setLoggedIn(data.loggedIn);
        setSubscriptionActive(data.subscriptionActive);
        setTrialUsed(data.trialUsed || false);
        if (data.loggedIn) {
          setUser({
            name: data.name || 'User',
            email: data.email || '',
            image: data.image || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch user status:', error);
      }
    };
    
    fetchUserStatus();
  }, []);

  const canGenerate = loggedIn ? subscriptionActive : !trialUsed;

  const statusHint = useMemo(() => {
    if (loggedIn) return subscriptionActive ? '订阅已激活：可继续生成' : '已登录：完成订阅后可继续生成';
    return trialUsed ? '已用完免费机会：登录/订阅以继续' : '你还有一次免费机会';
  }, [loggedIn, subscriptionActive, trialUsed]);

  const onRequireLoginOrCheckout = () => {
    if (!loggedIn) { window.location.href = '/login'; return; }
    window.location.href = '/checkout';
  };

  // 更新生成函数
  const simulateGenerate = async () => {
    if (!file) return;
    
    setIsGenerating(true);
    setGenerationStep('Uploading reference image...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('style', selectedStyle); // 添加风格参数

      setGenerationStep('Generating Ghibli style image...');
      
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 402) {
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedUrl(data.imageUrl);
      setGenerationStep('');
    } catch (error: unknown) {
      console.error('Generation error:', error);
      const message = error instanceof Error ? error.message : String(error);
      window.location.href = `/error?type=generation&message=${encodeURIComponent(message)}`;
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <NavBar loggedIn={loggedIn} subscriptionActive={subscriptionActive} user={user} />
      
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <section className="text-center [background-image:radial-gradient(rgba(16,185,129,0.06)_1px,transparent_1px)] bg-[length:12px_12px] rounded-xl p-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900">
            将你的照片变为 Ghibli 风格插画
          </h1>
          <p className="mt-3 text-slate-600 max-w-[600px] mx-auto">
            一次免费体验。订阅后解锁更多生成次数。Ghibli-inspired，柔和、手绘、幻想的光影与细腻纹理。
          </p>

          <UploadZone 
            file={file} 
            onFileChange={setFile}
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
          />

          <div className="mt-6 flex flex-col items-center gap-3">
            <PrimaryButton
              aria-label={canGenerate ? '生成图像' : '登录或订阅以继续'}
              aria-busy={isGenerating ? 'true' : 'false'}
              onClick={() => {
                if (!canGenerate) { onRequireLoginOrCheckout(); return; }
                simulateGenerate();
              }}
              disabled={!file || isGenerating}
              color={canGenerate ? 'emerald' : 'blue'}
            >
              {isGenerating ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-white animate-spin"></span>
                  {generationStep || '正在生成...'}
                </span>
              ) : (canGenerate ? '生成图像' : '登录/订阅以继续')}
            </PrimaryButton>

            <div className="text-sm text-slate-600" role="status" aria-live="polite">
              {statusHint}
            </div>
          </div>

          {generatedUrl && (
            <div className="mt-8">
              <div className="text-left text-sm text-slate-700 mb-2">生成结果预览：</div>
              <img src={generatedUrl} alt="generated" className="mx-auto rounded shadow max-h-96 object-contain" />
              <div className="mt-4 flex justify-center">
                <a
                  href={generatedUrl}
                  download="ghibli-art.png"
                  className="w-full max-w-xs text-center rounded-md px-5 py-3 font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  下载图像
                </a>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-10 py-10 text-center text-xs text-slate-500">
        <div className="max-w-3xl mx-auto px-4">
          <div>© 2025 Ghibli-Inspired Art · Privacy · Terms</div>
        </div>
      </footer>
    </div>
  );
}