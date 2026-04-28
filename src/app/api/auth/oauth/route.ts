import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';
import {
  generateToken,
  generateRefreshToken,
  setSessionCookie,
  setRefreshTokenCookie,
} from '@/lib/auth-cookies';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, code, redirectUri } = body;

    if (!provider || !code) {
      return NextResponse.json(
        { error: 'Missing provider or code' },
        { status: 400 }
      );
    }

    const validProviders = ['google', 'github'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    let session;
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data.session) {
        console.error('OAuth session error:', error);
        return NextResponse.json(
          { error: 'Failed to exchange code for session' },
          { status: 401 }
        );
      }
      session = data.session;
    } catch (oauthError) {
      console.error('OAuth exchange error:', oauthError);
      return NextResponse.json(
        { error: 'OAuth authentication failed' },
        { status: 401 }
      );
    }

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No session created' },
        { status: 401 }
      );
    }

    const oauthUser = session.user;
    const email = oauthUser.email;
    const providerId = oauthUser.id;
    const name = oauthUser.user_metadata?.full_name || oauthUser.user_metadata?.name || 'User';
    const avatarUrl = oauthUser.user_metadata?.avatar_url || oauthUser.user_metadata?.picture;

    if (!email) {
      return NextResponse.json(
        { error: 'Email not provided by OAuth provider' },
        { status: 400 }
      );
    }

    let user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          avatar: avatarUrl,
          password: `oauth_${provider}_${providerId}`,
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
          avatar: user.avatar || avatarUrl,
        },
      });
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Account is not active. Please contact support.' },
        { status: 403 }
      );
    }

    const token = await generateToken({
      userId: user.id,
      role: user.role || 'CLIENT',
      email: user.email,
    });

    const refreshToken = await generateRefreshToken(user.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
        status: user.status,
        walletBalance: user.walletBalance,
        currency: user.currency,
      },
      token,
    });

    setSessionCookie(response, token, { rememberMe: true });
    setRefreshTokenCookie(response, refreshToken);

    return response;
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}