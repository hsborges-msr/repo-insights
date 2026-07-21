import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/helpers/env/local';

/**
 *  Simple route to check if the server is up and running
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  return fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.GH_CLIENT_ID,
      client_secret: env.GH_CLIENT_SECRET,
      code
    })
  })
    .then(async (response) => {
      if (!response.ok) return NextResponse.json({ status: 'Failed to get access token' }, { status: response.status });

      const jsonRes = await response.json();
      if (jsonRes.error) return NextResponse.json(jsonRes, { status: 400 });

      return NextResponse.json(jsonRes, { status: 200 });
    })
    .catch(() => NextResponse.json({ status: 'Failed to get access token' }, { status: 500 }));
}