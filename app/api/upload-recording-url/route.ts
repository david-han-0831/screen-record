import { NextResponse } from 'next/server';
import { getDriveClient, getDriveAccessToken } from '@/lib/driveClient';
import type { drive_v3 } from 'googleapis';

export const runtime = 'nodejs';

/** 부모 폴더 아래에 이름으로 폴더 찾기, 없으면 생성 후 ID 반환 */
async function getOrCreateFolder(
  drive: drive_v3.Drive,
  parentId: string,
  folderName: string
): Promise<string> {
  const q = `'${parentId}' in parents and name = '${folderName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const list = await drive.files.list({
    q,
    fields: 'files(id)',
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });
  const files = list.data.files;
  if (files?.length && files[0].id) return files[0].id;

  const created = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id',
    supportsAllDrives: true,
  });
  if (!created.data.id) throw new Error('Failed to create folder');
  return created.data.id;
}

/**
 * Resumable 업로드용 URL만 발급 (요청 body에 파일 없음 → 4.5MB 한도 회피).
 * 클라이언트는 이 URL로 영상 Blob을 직접 PUT.
 */
export async function POST(request: Request) {
  const rootFolderId = process.env.DRIVE_FOLDER_ID;
  if (!rootFolderId) {
    return NextResponse.json(
      { error: 'DRIVE_FOLDER_ID is not set' },
      { status: 500 }
    );
  }

  let body: { firstName?: string; lastName?: string; part?: string; fileSize?: number };
  try {
    const raw = await request.json();
    if (typeof raw !== 'object' || raw === null) throw new Error('Invalid body');
    body = raw as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const firstName = (body.firstName as string) || '';
  const lastName = (body.lastName as string) || '';
  const partRaw = (body.part as string) || 'Part 1';
  const part = partRaw === 'Part 2' ? 'Part 2' : 'Part 1';
  const fileSize = typeof body.fileSize === 'number' && body.fileSize >= 0 ? body.fileSize : 0;

  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const date = `${kst.getUTCFullYear()}-${String(kst.getUTCMonth() + 1).padStart(2, '0')}-${String(kst.getUTCDate()).padStart(2, '0')}`;
  const time = `${String(kst.getUTCHours()).padStart(2, '0')}-${String(kst.getUTCMinutes()).padStart(2, '0')}-${String(kst.getUTCSeconds()).padStart(2, '0')}`;
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80).toLowerCase();
  const studentFolderName =
    firstName || lastName ? `${safe(firstName)}_${safe(lastName)}` : 'unknown';
  const partPrefix = part === 'Part 2' ? 'part2' : 'part1';
  const fileName = `${partPrefix}_${date}_${time}.webm`;

  try {
    const drive = await getDriveClient();
    const studentFolderId = await getOrCreateFolder(drive, rootFolderId, studentFolderName);
    const token = await getDriveAccessToken();

    const initRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': 'video/webm',
          'X-Upload-Content-Length': String(fileSize),
        },
        body: JSON.stringify({
          name: fileName,
          parents: [studentFolderId],
        }),
      }
    );

    if (!initRes.ok) {
      const errText = await initRes.text();
      console.error('Drive resumable init error:', initRes.status, errText);
      return NextResponse.json(
        { error: 'Failed to create upload session' },
        { status: 500 }
      );
    }

    const uploadUrl = initRes.headers.get('Location');
    if (!uploadUrl) {
      return NextResponse.json(
        { error: 'No upload URL in response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      uploadUrl,
      fileName,
    });
  } catch (err) {
    console.error('upload-recording-url error:', err);
    const message = err instanceof Error ? err.message : 'Upload URL failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
