import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import { getDriveClient } from '@/lib/driveClient';
import type { drive_v3 } from 'googleapis';

export const runtime = 'nodejs';

const MAX_BODY_SIZE = 1024 * 1024 * 1024; // 1GB;

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

export async function POST(request: Request) {
  const rootFolderId = process.env.DRIVE_FOLDER_ID;
  if (!rootFolderId) {
    return NextResponse.json(
      { error: 'DRIVE_FOLDER_ID is not set' },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: 'Invalid form data' },
      { status: 400 }
    );
  }

  const file = formData.get('file') as File | null;
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: 'Missing or invalid file' },
      { status: 400 }
    );
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
    return NextResponse.json(
      { error: 'File too large' },
      { status: 413 }
    );
  }

  const firstName = (formData.get('firstName') as string) || '';
  const lastName = (formData.get('lastName') as string) || '';
  const partRaw = (formData.get('part') as string) || 'Part 1';
  const part = partRaw === 'Part 2' ? 'Part 2' : 'Part 1';

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
    const buffer = Buffer.from(await file.arrayBuffer());

    const { data } = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [studentFolderId],
      },
      media: {
        mimeType: 'video/webm',
        body: Readable.from([buffer]),
      },
      fields: 'id, name, webViewLink',
      supportsAllDrives: true,
    });

    return NextResponse.json({
      ok: true,
      fileId: data.id,
      fileName: data.name,
      webViewLink: data.webViewLink,
    });
  } catch (err) {
    console.error('Drive upload error:', err);
    const message = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
