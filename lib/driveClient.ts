import { google, drive_v3 } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import { readFileSync } from 'fs';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

/**
 * 서비스 계정으로 Drive API 클라이언트 생성
 * GOOGLE_APPLICATION_CREDENTIALS(파일 경로) 또는 GCP_SA_KEY(JSON 문자열) 사용
 */
export async function getDriveClient(): Promise<drive_v3.Drive> {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const keyJson = process.env.GCP_SA_KEY;

  let auth: GoogleAuth;

  if (keyJson) {
    try {
      const credentials = JSON.parse(keyJson) as object;
      auth = new GoogleAuth({ credentials, scopes: SCOPES });
    } catch {
      throw new Error('GCP_SA_KEY is invalid JSON');
    }
  } else if (keyPath) {
    const resolved = path.resolve(process.cwd(), keyPath);
    auth = new GoogleAuth({ keyFile: resolved, scopes: SCOPES });
  } else {
    throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS or GCP_SA_KEY');
  }

  const authClient = await auth.getClient();
  return google.drive({ version: 'v3', auth: authClient });
}
