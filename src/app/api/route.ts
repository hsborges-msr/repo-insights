import { NextResponse } from 'next/server';

/**
 *  Simple route to check if the server is up and running
 */
export async function GET() {
  return NextResponse.json({ status: 'OK' }, { status: 200 });
}