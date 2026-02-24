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

  let body: { accessCode?: string; firstName?: string; lastName?: string; email?: string; part?: string };
  try {
    const raw = await request.json();
    if (typeof raw !== 'object' || raw === null) throw new Error('Invalid body');
    body = raw as Record<string, unknown>;
    if (typeof body.accessCode !== 'string' || typeof body.firstName !== 'string' ||
        typeof body.lastName !== 'string' || typeof body.email !== 'string') {
      throw new Error('Missing or invalid fields');
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid request. Required: accessCode, firstName, lastName, email.' },
      { status: 400 }
    );
  }

  const { accessCode, firstName, lastName, email, part } = body;
  const trimmedCode = (accessCode ?? '').trim();
  const trimmedFirst = (firstName ?? '').trim();
  const trimmedLast = (lastName ?? '').trim();
  const trimmedEmail = (email ?? '').trim();
  const partValue = part === 'Part 2' ? 'Part 2' : 'Part 1';

  if (!trimmedCode || !trimmedFirst || !trimmedLast || !trimmedEmail) {
    return NextResponse.json(
      { error: 'accessCode, firstName, lastName, and email are required.' },
      { status: 400 }
    );
  }

  try {
    const accessCodeDoc = await db.collection('settings').doc('accessCode').get();
    const stored = accessCodeDoc.exists ? (accessCodeDoc.data()?.value as string | undefined) : undefined;
    if (stored === undefined || stored === null) {
      return NextResponse.json(
        { error: 'Access code not configured' },
        { status: 503 }
      );
    }
    if (stored !== trimmedCode) {
      return NextResponse.json(
        { error: 'Incorrect access code' },
        { status: 401 }
      );
    }

    await db.collection('exam_sessions').add({
      firstName: trimmedFirst,
      lastName: trimmedLast,
      email: trimmedEmail,
      part: partValue,
      startedAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('validate-and-start error', e);
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    );
  }
}
