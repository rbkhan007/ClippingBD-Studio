import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';
import { generateToken, generateRefreshToken, setSessionCookie, setRefreshTokenCookie } from '@/lib/auth-cookies';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const provider = searchParams.get('provider') || 'google';
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      console.error('OAuth error:', error, errorDescription);
      return NextResponse.redirect(new URL('/auth?error=oauth_failed', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/auth?error=no_code', request.url));
    }

    let session;
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError || !data.session) {
        console.error('Session exchange error:', exchangeError);
        return NextResponse.redirect(new URL('/auth?error=exchange_failed', request.url));
      }
      
      session = data.session;
    } catch (authError) {
      console.error('Auth error:', authError);
      return NextResponse.redirect(new URL('/auth?error=auth_failed', request.url));
    }

    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth?error=no_user', request.url));
    }

    const oauthUser = session.user;
    const email = oauthUser.email;

    if (!email) {
      return NextResponse.redirect(new URL('/auth?error=no_email', request.url));
    }

    let user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: email.toLowerCase(),
          name: oauthUser.user_metadata?.full_name || oauthUser.user_metadata?.name || 'User',
          avatar: oauthUser.user_metadata?.avatar_url || oauthUser.user_metadata?.picture,
          password: `oauth_${oauthUser.id.substring(0, 8)}`,
          role: 'CLIENT',
          status: 'ACTIVE',
          currency: 'USD',
          lastLoginAt: new Date(),
        },
      });
    } else {
      user = await db.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
        },
      });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.redirect(new URL('/auth?error=inactive', request.url));
    }

    const token = await generateToken({
      userId: user.id,
      role: user.role || 'CLIENT',
      email: user.email,
    });

    const refreshToken = await generateRefreshToken(user.id);

    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    setSessionCookie(response, token, { rememberMe: true });
    setRefreshTokenCookie(response, refreshToken);

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/auth?error=callback_error', request.url));
  }
}