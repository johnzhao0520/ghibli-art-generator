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

  // 检查权限
  const isLoggedIn = !!session;
  const cookieStore = cookies();
  const hasActiveSub = cookieStore.get('subscription_active')?.value === 'true';
  const hasUsedTrial = cookieStore.get('trial_used')?.value === 'true';

  if (!isLoggedIn) {
    if (hasUsedTrial) {
      return NextResponse.json({ error: 'Trial used, please subscribe' }, { status: 402 });
    }
    // 标记试用已使用
    cookieStore.set('trial_used', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1年
    });
  } else {
    if (!hasActiveSub) {
      return NextResponse.json({ error: 'Subscription required' }, { status: 402 });
    }
  }

  try {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // 验证文件大小 (5MB 限制)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    console.log('Analyzing uploaded image with GPT-4 Vision...');
    
    // 转换文件为 base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type;

    // 步骤1：使用 GPT-4 Vision 分析图片
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

Be very specific about the person's appearance. Use simple, clear English.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`
              }
            }
          ]
        }
      ],
      max_tokens: 300
    });

    const imageDescription = visionResponse.choices[0]?.message?.content;
    if (!imageDescription) {
      throw new Error('Failed to analyze image');
    }

    console.log('Image analysis completed:', imageDescription);

    // 步骤2：使用 DALL-E 3 生成 Ghibli 风格图片
    console.log('Generating Ghibli-style image with DALL-E 3...');
    
    // 清理和过滤描述，确保符合安全政策
    const cleanDescription = imageDescription
      .replace(/[^\w\s.,!?-]/g, '') // 移除特殊字符
      .substring(0, 200); // 限制长度
    
    // 1) 类型声明更稳妥 - 使用返回值推断
    type ImgRes = Awaited<ReturnType<typeof openai.images.generate>>;
    let dalleResponse: ImgRes | null = null;

    try {
      dalleResponse = await openai.images.generate({
        model: 'dall-e-3', // 可改 'gpt-image-1'
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
        model: 'dall-e-3', // 可改 'gpt-image-1'
        prompt: 'A single Studio Ghibli style portrait of one person with soft pastel colors, gentle lighting, and clean background. Family-friendly art style.',
        size: '1024x1024',
        quality: 'standard',
        n: 1,
      });
    }

    // 2) 收窄 + 兜底，避免 TS 报 possibly undefined
    if (!dalleResponse) {
      throw new Error('No image response from DALL-E');
    }
    const data = Array.isArray(dalleResponse.data) ? dalleResponse.data : []; // ✅ 关键一行
    if (data.length === 0) {
      throw new Error('No image generated from DALL-E');
    }

    const imageUrl = data[0]?.url ?? null; // ✅ 关键一行
    if (!imageUrl) {
      throw new Error('No image URL returned');
    }

    console.log('Ghibli-style image generated successfully:', imageUrl);
    return NextResponse.json({ 
      imageUrl,
      originalDescription: imageDescription 
    });
  } catch (error: any) {
    console.error('OpenAI generation error:', error);
    return NextResponse.json({ 
      error: 'Generation failed', 
      details: error?.message ?? String(error) 
    }, { status: 500 });
  }
}