'use client';

import { useRouter } from 'next/navigation';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';
import PasswordInput from '@/components/ui/PasswordInput';

// TODO: 실제 환경에서는 환경변수나 서버에서 관리
const CORRECT_PASSWORD = 'test1234';

/**
 * [S01] 시험 대기 화면
 * 시험 시작 전 대기 및 비밀번호 입력
 */
export default function Home() {
  const router = useRouter();
  const { password, isValid, error, validatePassword } = usePasswordValidation(
    CORRECT_PASSWORD
  );

  const handleStart = () => {
    if (isValid) {
      // 다음 단계로 이동 (화면 공유 요청)
      router.push('/recording');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="w-full max-w-md px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* 로고 및 시험 제목 */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">시험용 화면 녹화</h1>
            <p className="text-gray-600">
              감독관이 제공한 비밀번호를 입력하세요
            </p>
          </div>

          {/* 비밀번호 입력 */}
          <div className="space-y-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <PasswordInput
              value={password}
              onChange={validatePassword}
              error={error}
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {/* Start 버튼 */}
          <button
            onClick={handleStart}
            disabled={!isValid}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
              isValid
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isValid ? '시험 시작' : '비밀번호를 입력하세요'}
          </button>

          {/* 안내 문구 */}
          <p className="text-xs text-center text-gray-500">
            시험 시작 후 전체 화면 공유가 필요합니다
          </p>
        </div>
      </main>
    </div>
  );
}
