import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const db = getAdminFirestore();
  if (!db) {
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 503 }
    );
  }

  let body: { part?: string; password?: string };
  try {
    const raw = await request.json();
    if (typeof raw !== 'object' || raw === null) throw new Error('Invalid body');
    body = raw as Record<string, unknown>;
    if (typeof body.part !== 'string' || typeof body.password !== 'string') {
      throw new Error('Missing part or password');
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid request. Required: part, password.' },
      { status: 400 }
    );
  }

  const part = body.part === 'Part 2' ? 'part2' : 'part1';
  const password = (body.password ?? '').trim();

  try {
    const stopDoc = await db.collection('settings').doc('stopPasswords').get();
    const data = stopDoc.exists ? stopDoc.data() : undefined;
    const stored = data?.[part] as string | undefined;
    if (stored === undefined || stored === null) {
      return NextResponse.json(
        { error: 'Stop password not configured' },
        { status: 503 }
      );
    }
    if (stored !== password) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('validate-stop-password error', e);
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    );
  }
}
