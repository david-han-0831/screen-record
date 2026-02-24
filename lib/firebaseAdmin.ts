import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
// 로컬: 파일 경로. Vercel 등: JSON 문자열 (FIREBASE_APPLICATION_CREDENTIALS_JSON)
const credentialsPath =
  process.env.FIREBASE_APPLICATION_CREDENTIALS ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS;
const credentialsJson = process.env.FIREBASE_APPLICATION_CREDENTIALS_JSON;

function getCredential() {
  if (credentialsJson) {
    try {
      return cert(JSON.parse(credentialsJson) as object);
    } catch {
      return null;
    }
  }
  if (credentialsPath) return cert(credentialsPath);
  return null;
}

function getAdminApp(): App | null {
  const existing = getApps();
  if (existing.length > 0) return existing[0] as App;
  if (!projectId) return null;
  const credential = getCredential();
  if (!credential) return null;
  try {
    return initializeApp({
      projectId,
      credential,
    });
  } catch {
    return null;
  }
}

/** Firestore 인스턴스 (서버 전용). 규칙 우회. */
export function getAdminFirestore(): Firestore | null {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}

/** Auth 인스턴스 (custom claim 등 설정용) */
export function getAdminAuth() {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}
