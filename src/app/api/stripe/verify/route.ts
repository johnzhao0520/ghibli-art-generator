import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Stripe session status:', session.payment_status, session.status);
    
    if (session.payment_status === 'paid' && session.status === 'complete') {
      // 设置订阅激活标记到 cookie（MVP 简化实现）
      const cookieStore = await cookies();
      cookieStore.set('subscription_active', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30天
        path: '/', // 确保路径正确
      });
      
      console.log('Subscription activated for session:', sessionId);
      return NextResponse.json({ subscriptionActive: true });
    }
    
    return NextResponse.json({ subscriptionActive: false });
  } catch (error) {
    console.error('Stripe verification error:', error);
    return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 });
  }
}