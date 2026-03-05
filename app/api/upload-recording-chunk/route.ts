import { NextResponse } from 'next/server';
import { getDriveAccessToken } from '@/lib/driveClient';

export const runtime = 'nodejs';

/** 청크당 최대 4MB (Vercel 4.5MB 한도 여유) */
const MAX_CHUNK_SIZE = 4 * 1024 * 1024;

/**
 * 클라이언트가 보낸 청크를 Google Drive Resumable URL로 전달.
 * 브라우저 → Drive 직접 PUT은 CORS로 불가하므로, 청크만 서버로 보내고 서버가 Drive에 PUT.
 */
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Invalid form data' },
      { status: 400 }
    );
  }

  const uploadUrl = formData.get('uploadUrl') as string | null;
  const contentRange = formData.get('contentRange') as string | null;
  const chunk = formData.get('chunk') as File | Blob | null;

  if (!uploadUrl || typeof uploadUrl !== 'string' || !contentRange || typeof contentRange !== 'string') {
    return NextResponse.json(
      { error: 'Missing uploadUrl or contentRange' },
      { status: 400 }
    );
  }

  if (!chunk || !(chunk instanceof Blob)) {
    return NextResponse.json(
      { error: 'Missing or invalid chunk' },
      { status: 400 }
    );
  }

  if (chunk.size > MAX_CHUNK_SIZE) {
    return NextResponse.json(
      { error: `Chunk too large (max ${MAX_CHUNK_SIZE} bytes)` },
      { status: 413 }
    );
  }

  try {
    const token = await getDriveAccessToken();
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer());

    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'video/webm',
        'Content-Length': String(chunkBuffer.length),
        'Content-Range': contentRange,
      },
      body: chunkBuffer,
    });

    if (putRes.status === 308) {
      return NextResponse.json({ done: false });
    }

    if (putRes.ok && (putRes.status === 200 || putRes.status === 201)) {
      const fileData = await putRes.json() as { id?: string; name?: string; webViewLink?: string };
      return NextResponse.json({
        done: true,
        fileId: fileData.id,
        fileName: fileData.name,
        webViewLink: fileData.webViewLink,
      });
    }

    const errText = await putRes.text();
    console.error('Drive chunk PUT error:', putRes.status, errText);
    let message = errText || `Upload chunk failed ${putRes.status}`;
    try {
      const errJson = JSON.parse(errText) as { error?: { message?: string } };
      if (errJson?.error?.message) message = errJson.error.message;
    } catch {
      // use errText as-is
    }
    return NextResponse.json(
      { error: message },
      { status: putRes.status === 404 ? 404 : 500 }
    );
  } catch (err) {
    console.error('upload-recording-chunk error:', err);
    const message = err instanceof Error ? err.message : 'Chunk upload failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
