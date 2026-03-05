import { google, drive_v3 } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

function getDriveAuth(): GoogleAuth {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const keyJson = process.env.GCP_SA_KEY;

  if (keyJson) {
    try {
      const credentials = JSON.parse(keyJson) as object;
      return new GoogleAuth({ credentials, scopes: SCOPES });
    } catch {
      throw new Error('GCP_SA_KEY is invalid JSON');
    }
  }
  if (keyPath) {
    const resolved = path.resolve(process.cwd(), keyPath);
    return new GoogleAuth({ keyFile: resolved, scopes: SCOPES });
  }
  throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS or GCP_SA_KEY');
}

/**
 * 서비스 계정으로 Drive API 클라이언트 생성
 */
export async function getDriveClient(): Promise<drive_v3.Drive> {
  const auth = getDriveAuth();
  return google.drive({ version: 'v3', auth });
}

/**
 * Resumable 업로드용 초기화 요청에 쓸 액세스 토큰 반환
 * (클라이언트가 Drive에 직접 PUT 할 수 있도록 URL만 발급할 때 사용)
 */
export async function getDriveAccessToken(): Promise<string> {
  const auth = getDriveAuth();
  const client = await auth.getClient();
  const tokenRes = await client.getAccessToken();
  if (!tokenRes.token) throw new Error('Failed to get Drive access token');
  return tokenRes.token;
}
