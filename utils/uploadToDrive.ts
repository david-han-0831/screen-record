/**
 * 녹화 Blob을 서버 API를 통해 Google Drive에 업로드
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
  const { blob, studentId = 'student', firstName, lastName, email, part } = params;

  const formData = new FormData();
  formData.append('file', blob, 'recording.webm');
  formData.append('studentId', studentId);
  if (firstName !== undefined) formData.append('firstName', firstName);
  if (lastName !== undefined) formData.append('lastName', lastName);
  if (email !== undefined) formData.append('email', email);
  if (part !== undefined) formData.append('part', part);

  try {
    const res = await fetch('/api/upload-recording', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.error || res.statusText };
    }

    return {
      ok: true,
      fileId: data.fileId,
      fileName: data.fileName,
      webViewLink: data.webViewLink,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return { ok: false, error: message };
  }
}
