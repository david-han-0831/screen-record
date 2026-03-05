/**
 * 녹화 Blob을 Google Drive에 업로드 (4.5MB 한도 + CORS 회피)
 * 브라우저 → Drive 직접 PUT은 CORS로 불가하므로, 4MB 청크로 나눠 우리 API 경유 → 서버가 Drive에 PUT
 */

const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB (Vercel 4.5MB 한도 내)

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
    // 1. Resumable 업로드 URL 발급 (메타데이터만 전송)
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

    // 2. 4MB 청크로 나눠 서버 경유 → 서버가 Drive Resumable URL로 PUT (CORS 회피)
    const total = blob.size;
    let start = 0;

    while (start < total) {
      const end = Math.min(start + CHUNK_SIZE, total) - 1;
      const chunk = blob.slice(start, end + 1);
      const contentRange = `bytes ${start}-${end}/${total}`;

      const formData = new FormData();
      formData.append('uploadUrl', uploadUrl);
      formData.append('contentRange', contentRange);
      formData.append('chunk', chunk, 'chunk.webm');

      const chunkRes = await fetch('/api/upload-recording-chunk', {
        method: 'POST',
        body: formData,
      });

      const chunkData = await chunkRes.json();

      if (!chunkRes.ok) {
        return { ok: false, error: chunkData.error || chunkRes.statusText };
      }

      if (chunkData.done) {
        return {
          ok: true,
          fileId: chunkData.fileId,
          fileName: chunkData.fileName ?? fileName,
          webViewLink: chunkData.webViewLink,
        };
      }

      start = end + 1;
    }

    return { ok: false, error: 'Upload did not complete' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return { ok: false, error: message };
  }
}
