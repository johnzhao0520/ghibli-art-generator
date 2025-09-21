import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// 三种吉卜力风格的 Prompt 模板（强调保持人物特征与单人构图）
const stylePrompts: Record<string, string> = {
  'ghibli-inspired':
    'Convert this photo into a Studio Ghibli inspired illustration. Keep the same person and key facial features (age, gender, hair, clothing). Hand-drawn anime look, vibrant colors, whimsical atmosphere, clean background, warm lighting, single person portrait centered.',
  'ghibli-soft-pastel':
    'Convert this photo into a Studio Ghibli soft pastel illustration. Keep the same person and key facial features (age, gender, hair, clothing). Dreamlike atmosphere, gentle pastel colors, soft shading, warm glow, delicate lines, clean background, single person portrait centered.',
  'ghibli-filmic':
    'Convert this photo into a Studio Ghibli cinematic film style illustration. Keep the same person and key facial features (age, gender, hair, clothing). Cinematic composition, rich lighting, painterly textures, emotional tone, clean background, single person portrait centered.',
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const formData = await request.formData();
  // 兼容字段名：优先使用 file，其次 image
  const file = (formData.get('file') as File) || (formData.get('image') as File);
  const style = (formData.get('style') as string) || 'ghibli-inspired';
  const customPrompt = formData.get('prompt') ? String(formData.get('prompt')) : '';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // 权限与试用逻辑
  const isLoggedIn = !!session;
  const cookieStore = await cookies();
  const hasActiveSub = cookieStore.get('subscription_active')?.value === 'true';
  const hasUsedTrial = cookieStore.get('trial_used')?.value === 'true';

  let shouldMarkTrialUsed = false;

  if (!isLoggedIn) {
    if (hasUsedTrial) {
      return NextResponse.json({ error: 'Trial used, please subscribe' }, { status: 402 });
    }
    shouldMarkTrialUsed = true;
  } else {
    if (!hasActiveSub) {
      return NextResponse.json({ error: 'Subscription required' }, { status: 402 });
    }
  }

  try {
    // 文件校验
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // File -> Buffer（edits 支持 Buffer/Stream）
    const arrayBuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    // 选择风格 prompt，允许自定义覆盖
    const selectedPrompt = customPrompt || stylePrompts[style] || stylePrompts['ghibli-inspired'];

    // 使用 gpt-image-1 的 images.edits，实现“带参考图风格化”并保持人物一致性
    const result = await openai.images.edits({
      model: 'gpt-image-1',
      image: buffer,
      prompt: selectedPrompt,
      size: '1024x1024',
      n: 1,
    });

    // 取 URL 或回退到 base64
    const imageUrl = result.data[0]?.url || (result.data[0]?.b64_json ? `data:image/png;base64,${result.data[0]?.b64_json}` : null);
    if (!imageUrl) {
      throw new Error('No image returned');
    }

    // 构造响应
    const res = NextResponse.json({ imageUrl, style }, { status: 200 });

    // 设置试用标记
    if (shouldMarkTrialUsed) {
      res.cookies.set('trial_used', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1年
        path: '/'
      });
    }

    return res;

  } catch (error: unknown) {
    const message =
      typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: unknown }).message)
        : String(error);
    
    console.error('OpenAI generation error:', error);
    return NextResponse.json(
      { error: 'Generation failed', details: message },
      { status: 500 }
    );
  }
}
