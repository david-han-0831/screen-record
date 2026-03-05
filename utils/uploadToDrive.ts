/**
 * 녹화 Blob을 Google Drive에 업로드 (4.5MB 한도 회피)
 * 서버는 업로드 URL만 발급하고, 실제 바이트는 브라우저 → Drive 직접 전송
 */

export interface UploadRecordingParams {
  blob: Blob;
  studentId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  /** Part 1 | Part 2 - 업로드 경로에 part1/part2 폴더 사용 */
  part?: 'Part 1' | 'Part 2';
}

export interface UploadRecordingResult {
  ok: boolean;
  fileId?: string;
  fileName?: string;
  webViewLink?: string;
  error?: string;
}

export async function uploadRecordingToDrive(
  params: UploadRecordingParams
): Promise<UploadRecordingResult> {
  const { blob, firstName, lastName, part } = params;

  try {
    // 1. 서버에서 Resumable 업로드 URL만 발급 (파일 바이트는 안 보냄 → 4.5MB 한도 회피)
    const urlRes = await fetch('/api/upload-recording-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName,
        lastName,
        part,
        fileSize: blob.size,
      }),
    });

    const urlData = await urlRes.json();
    if (!urlRes.ok) {
      return { ok: false, error: urlData.error || urlRes.statusText };
    }

    const { uploadUrl, fileName } = urlData as { uploadUrl: string; fileName: string };
    if (!uploadUrl) {
      return { ok: false, error: 'No upload URL received' };
    }

    // 2. 브라우저에서 Drive로 직접 PUT (Vercel 경유 안 함)
    const total = blob.size;
    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/webm',
        'Content-Length': String(total),
        'Content-Range': `bytes 0-${total - 1}/${total}`,
      },
      body: blob,
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      return { ok: false, error: errText || `Upload failed ${putRes.status}` };
    }

    const fileData = await putRes.json() as { id?: string; name?: string; webViewLink?: string };
    return {
      ok: true,
      fileId: fileData.id,
      fileName: fileData.name ?? fileName,
      webViewLink: fileData.webViewLink,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return { ok: false, error: message };
  }
}
