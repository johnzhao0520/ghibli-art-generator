import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// 三种吉卜力风格的 Prompt 模板
const stylePrompts = {
  'ghibli-inspired': `A person in Studio Ghibli inspired style. Hand-drawn anime look, vibrant colors, whimsical atmosphere, detailed background, warm lighting, and expressive character design.`,
  
  'ghibli-soft-pastel': `A person in Studio Ghibli soft pastel style. Dreamlike atmosphere, gentle pastel colors, soft shading, warm glow, delicate hand-drawn lines, and tender expressions.`,
  
  'ghibli-filmic': `A person in Studio Ghibli cinematic film style. Cinematic composition, deep contrast, rich lighting, painterly textures, emotional tone, and dramatic atmosphere.`
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const style = formData.get('style') as string || 'ghibli-inspired';

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

    // 1) 上传参考图片到 OpenAI
    const uploadedFile = await openai.files.create({
      file: file,
      purpose: 'vision',
    });

    console.log('Uploaded reference file:', uploadedFile.id);

    // 2) 获取对应风格的 prompt
    const selectedPrompt = stylePrompts[style as keyof typeof stylePrompts] || stylePrompts['ghibli-inspired'];

    // 3) 使用 gpt-image-1 生成图片，引用上传的图片
    const result = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: selectedPrompt,
      size: '1024x1024',
      n: 1,
      referenced_image_ids: [uploadedFile.id], // 关键：引用上传的图片保持人物一致性
    });

    const imageUrl = result.data[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned');
    }

    // 构造响应
    const res = NextResponse.json(
      { 
        imageUrl, 
        style,
        referenceFileId: uploadedFile.id 
      },
      { status: 200 }
    );

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
