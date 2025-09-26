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
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-emerald-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg ring-2 ring-emerald-200 flex items-center justify-center">
            <span className="text-white font-bold text-lg">G</span>
          </div>
          <span className="text-slate-900 font-bold text-xl tracking-tight group-hover:text-emerald-700 transition-colors">
            Ghibli Art Generator
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <a href="/dashboard" className="text-sm px-4 py-2 rounded-lg hover:bg-emerald-50 text-slate-700 font-medium transition-colors">
            Dashboard
          </a>
          {!loggedIn ? (
            <a href="/login" className="text-sm px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 font-medium transition-colors shadow-sm">
              Get Started
            </a>
          ) : (
            <div className="flex items-center gap-3">
              {user?.image && (
                <img src={user.image} alt="avatar" className="h-8 w-8 rounded-full ring-2 ring-emerald-200" />
              )}
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                {subscriptionActive ? 'Pro' : 'Free'}
              </span>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

// 新增：风格展示组件
function StyleShowcase() {
  const styles = [
    {
      id: 'ghibli-inspired',
      name: 'Ghibli Inspired',
      description: 'Vibrant & Whimsical',
      emoji: '🎨',
      preview: 'bg-gradient-to-br from-green-400 to-blue-500'
    },
    {
      id: 'ghibli-soft-pastel',
      name: 'Soft Pastel',
      description: 'Dreamy & Gentle',
      emoji: '🌸',
      preview: 'bg-gradient-to-br from-pink-300 to-purple-400'
    },
    {
      id: 'ghibli-filmic',
      name: 'Filmic',
      description: 'Cinematic & Dramatic',
      emoji: '🎬',
      preview: 'bg-gradient-to-br from-orange-400 to-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {styles.map((style) => (
        <div key={style.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className={`w-full h-24 rounded-xl ${style.preview} mb-4 flex items-center justify-center`}>
            <span className="text-3xl">{style.emoji}</span>
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">{style.name}</h3>
          <p className="text-slate-600 text-sm">{style.description}</p>
        </div>
      ))}
    </div>
  );
}

// 新增：功能特色组件
function FeatureGrid() {
  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Generation',
      description: 'Advanced AI transforms your photos into stunning Ghibli-style artwork in seconds'
    },
    {
      icon: '🎨',
      title: 'Multiple Art Styles',
      description: 'Choose from various Ghibli-inspired styles to match your creative vision'
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Get your transformed artwork in under 30 seconds with our optimized AI engine'
    },
    {
      icon: '📱',
      title: 'High Quality Output',
      description: 'Download high-resolution images perfect for printing or digital use'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
      {features.map((feature, index) => (
        <div key={index} className="text-center group">
          <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-emerald-200 transition-colors">
            {feature.icon}
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-2">{feature.title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
        </div>
      ))}
    </div>
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
    <div className="space-y-6">
      {/* 风格选择器 - 重新设计 */}
      <div className="w-full max-w-[600px] mx-auto space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          Choose Your Ghibli Style:
        </label>
        <select 
          value={selectedStyle}
          onChange={(e) => onStyleChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-sm font-medium shadow-sm transition-all"
        >
          <option value="ghibli-inspired">🎨 Ghibli Inspired - Vibrant & Whimsical</option>
          <option value="ghibli-soft-pastel">🌸 Ghibli Soft Pastel - Dreamy & Gentle</option>
          <option value="ghibli-filmic">🎬 Ghibli Filmic - Cinematic & Dramatic</option>
        </select>
      </div>

      {/* 上传区域 - 重新设计 */}
      <div
        role="region"
        aria-label="图片上传区域，支持拖拽或点击选择"
        className={`w-full max-w-[600px] mx-auto p-8 rounded-2xl border-2 border-dashed transition-all duration-300
        ${dragOver ? 'border-emerald-500 bg-emerald-50/60 scale-105' : 'border-emerald-200 bg-white'}
        shadow-lg hover:shadow-xl`}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          className="hidden"
        />

        {!previewUrl ? (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Upload Your Photo</h3>
            <p className="text-slate-600 mb-4">Drag and drop your image here, or click to browse</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors shadow-sm"
            >
              Choose File
            </button>
            <p className="text-xs text-slate-500 mt-3">Supports JPG, PNG up to 10MB</p>
          </div>
        ) : (
          <div className="text-center">
            <img src={previewUrl} alt="preview" className="mx-auto rounded-xl shadow-md max-h-48 object-contain mb-4" />
            <p className="text-sm text-slate-700 mb-3">✅ {file?.name}</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="text-sm px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Change Image
            </button>
          </div>
        )}
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

  const [selectedStyle, setSelectedStyle] = useState('ghibli-inspired');
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

  const simulateGenerate = async () => {
    if (!file) return;
    
    setIsGenerating(true);
    setGenerationStep('Uploading reference image...');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('style', selectedStyle);

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
    <>
      {/* SEO Meta Tags */}
      <head>
        <title>Ghibli Art Generator - AI-Powered Ghibli Style Image Creator</title>
        <meta name="description" content="Transform your photos into stunning Ghibli-style artwork with our AI-powered generator. Create whimsical, dreamy, and cinematic art in seconds. Free trial available." />
        <meta name="keywords" content="Ghibli风格, AI图像生成, 宫崎骏风格, 动漫风格转换, AI艺术生成器, Studio Ghibli art, anime style generator" />
        <meta property="og:title" content="Ghibli Art Generator - Transform Photos into Ghibli Style Art" />
        <meta property="og:description" content="Create beautiful Ghibli-inspired artwork from your photos using advanced AI technology. Multiple styles available." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ghibli Art Generator - AI-Powered Art Creation" />
        <meta name="twitter:description" content="Transform your photos into stunning Ghibli-style artwork with AI" />
      </head>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <NavBar loggedIn={loggedIn} subscriptionActive={subscriptionActive} user={user} />
        
        {/* Hero Section - 全新设计 */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-blue-100/50"></div>
          <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Transform Your Photos into
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
                  Ghibli Masterpieces
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Experience the magic of Studio Ghibli with our AI-powered art generator. 
                Create whimsical, dreamy artwork from your photos in seconds. 
                <strong className="text-emerald-600"> Start with a free trial!</strong>
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <a 
                  href="#upload-section" 
                  className="px-8 py-4 bg-emerald-500 text-white rounded-xl font-semibold text-lg hover:bg-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  Create Art Now - Free Trial
                </a>
                <a 
                  href="#features" 
                  className="px-8 py-4 bg-white text-slate-700 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 shadow-lg border border-gray-200"
                >
                  See Examples
                </a>
              </div>

              {/* Style Preview */}
              <div className="mb-16">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">Choose Your Ghibli Style</h2>
                <StyleShowcase />
              </div>
            </div>
          </div>
        </section>

        {/* Upload Section */}
        <section id="upload-section" className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Upload & Transform</h2>
              <p className="text-lg text-slate-600">Simple 3-step process to create your Ghibli artwork</p>
            </div>

            <UploadZone 
              file={file} 
              onFileChange={setFile}
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
            />

            <div className="mt-8 flex flex-col items-center gap-4">
              <PrimaryButton
                aria-label={canGenerate ? '生成图像' : '登录或订阅以继续'}
                aria-busy={isGenerating ? 'true' : 'false'}
                onClick={() => {
                  if (!canGenerate) { onRequireLoginOrCheckout(); return; }
                  simulateGenerate();
                }}
                disabled={!file || isGenerating}
                color={canGenerate ? 'emerald' : 'blue'}
                className="px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isGenerating ? (
                  <span className="inline-flex items-center gap-3">
                    <span className="h-5 w-5 rounded-full border-2 border-white/60 border-t-white animate-spin"></span>
                    {generationStep || 'Creating your masterpiece...'}
                  </span>
                ) : (canGenerate ? 'Generate Ghibli Art' : 'Start Free Trial')}
              </PrimaryButton>

              <div className="text-sm text-slate-600 text-center max-w-md" role="status" aria-live="polite">
                {statusHint}
              </div>
            </div>

            {generatedUrl && (
              <div className="mt-12 bg-gray-50 rounded-2xl p-8">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Your Ghibli Masterpiece</h3>
                  <img src={generatedUrl} alt="generated" className="mx-auto rounded-xl shadow-lg max-h-96 object-contain mb-6" />
                  <div className="flex justify-center">
                    <a
                      href={generatedUrl}
                      download="ghibli-art.png"
                      className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-lg"
                    >
                      Download High-Res Image
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Our Ghibli Generator?</h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Powered by advanced AI technology, delivering professional-quality results in seconds
              </p>
            </div>
            <FeatureGrid />
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 bg-gradient-to-r from-emerald-500 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Create Your Ghibli Art?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of artists and creators who trust our AI-powered generator
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#upload-section" 
                className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                Start Free Trial
              </a>
              <a 
                href="/checkout" 
                className="px-8 py-4 bg-emerald-600 text-white rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-all duration-300 shadow-lg border-2 border-white/20"
              >
                Get Pro Access
              </a>
            </div>
          </div>
        </section>

        <footer className="py-12 bg-slate-900 text-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <span className="text-white font-bold">G</span>
                  </div>
                  <span className="font-bold text-lg">Ghibli Art Generator</span>
                </div>
                <p className="text-slate-400 text-sm">
                  Transform your photos into magical Ghibli-style artwork with AI
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Product</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Support</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="/help" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="/privacy" className="hover:text-white transition-colors">Privacy</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
              © 2025 Ghibli Art Generator. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}