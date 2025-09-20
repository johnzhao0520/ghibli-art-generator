import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { cookies } from 'next/headers';

export async function GET() {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const subscriptionActive = cookieStore.get('subscription_active')?.value === 'true';
  const trialUsed = cookieStore.get('trial_used')?.value === 'true';
  
  return NextResponse.json({
    loggedIn: Boolean(session),
    subscriptionActive,
    trialUsed,
    email: session?.user?.email || null,
    name: session?.user?.name || null,
    image: (session as any)?.user?.image || null,
  });
}