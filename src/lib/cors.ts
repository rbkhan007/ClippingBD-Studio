import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from './env-validation';

const ALLOWED_ORIGINS = getEnv().ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

export function cors(request: NextRequest): ResponseInit {
  const origin = request.headers.get('origin');
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(o => 
    o === origin || o === '*'
  ) ? origin : ALLOWED_ORIGINS[0] || '*';

  return {
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  };
}

export function corsJsonResponse(data: unknown, status = 200, request?: NextRequest): NextResponse {
  const corsHeaders = request ? cors(request) : {};
  return NextResponse.json(data, { status, ...corsHeaders });
}

export function corsErrorResponse(error: string, status = 400, request?: NextRequest): NextResponse {
  return corsJsonResponse({ error }, status, request);
}