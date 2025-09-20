import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // 权限与试用逻辑
  const isLoggedIn = !!session;
  const cookieStore = await cookies(); // ✅ 此处需要 await
  const hasActiveSub = cookieStore.get('subscription_active')?.value === 'true';
  const hasUsedTrial = cookieStore.get('trial_used')?.value === 'true';

  // 是否在这次响应里标记试用
  let shouldMarkTrialUsed = false;

  if (!isLoggedIn) {
    if (hasUsedTrial) {
      return NextResponse.json({ error: 'Trial used, please subscribe' }, { status: 402 });
    }
    // 不再在这里 set；改为在成功响应上设置 cookie
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

    // 转 base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type;

    // 1) 先用 gpt-4o 分析
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this image carefully and describe ONLY the main person in detail. Focus on:
1. Person's age, gender, facial features, expression
2. Hair color and style
3. Clothing and colors
4. Pose and body position
5. Background setting

Be very specific about the person's appearance. Use simple, clear English.`,
            },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
          ],
        },
      ],
      max_tokens: 300,
    });

    const imageDescription = visionResponse.choices[0]?.message?.content;
    if (!imageDescription) {
      throw new Error('Failed to analyze image');
    }

    // 2) 生成 Ghibli 风格图
    const cleanDescription = imageDescription
      .replace(/[^\w\s.,!?-]/g, '')
      .substring(0, 200);

    type ImgRes = Awaited<ReturnType<typeof openai.images.generate>>;
    let dalleResponse: ImgRes | null = null;

    try {
      dalleResponse = await openai.images.generate({
        model: 'dall-e-3', // 可换成 'gpt-image-1'
        prompt: `Create a single Studio Ghibli style portrait of ONE person based on this description: ${cleanDescription}. 
        
Requirements:
- Show only ONE person, not multiple people
- Keep the person's key features: age, gender, hair, clothing
- Studio Ghibli art style with soft pastel colors
- Gentle lighting and clean background
- Portrait format, centered composition
- Family-friendly illustration`,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      });
    } catch (error) {
      console.log('DALL-E 3 failed, trying with simplified prompt...', error);
      dalleResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt:
          'A single Studio Ghibli style portrait of one person with soft pastel colors, gentle lighting, and clean background. Family-friendly art style.',
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      });
    }

    // 安全取值（避免 TS 可空性）
    const data = (dalleResponse?.data ?? []) as Array<{ url?: string | null; b64_json?: string | null }>;
    const imageUrl = data[0]?.url ?? null;
    if (!imageUrl) {
      throw new Error('No image URL returned');
    }

    // 构造响应，并在这里设置试用 Cookie（如需要）
    const res = NextResponse.json(
      { imageUrl, originalDescription: imageDescription },
      { status: 200 }
    );

    if (shouldMarkTrialUsed) {
      res.cookies.set('trial_used', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1年
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
