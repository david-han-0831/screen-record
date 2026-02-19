'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePasswordValidation } from '@/hooks/usePasswordValidation';
import PasswordInput from '@/components/ui/PasswordInput';

// TODO: 실제 환경에서는 환경변수나 서버에서 관리
const CORRECT_PASSWORD = 'test1234';

/** 화질 옵션: 2.5 / 1.5 / 1.25 Mbps (퀄리티 비교용) */
export const RECORDING_QUALITY_OPTIONS = [
  { label: '2.5 Mbps (고화질)', value: 2_500_000, description: '화질 우선, 파일 크기 큼' },
  { label: '1.5 Mbps (중간)', value: 1_500_000, description: '화질·용량 균형' },
  { label: '1.25 Mbps (저용량)', value: 1_250_000, description: '용량 절감, 화질 다소 낮음' },
] as const;

const STORAGE_KEY_BITRATE = 'recording_bitrate';

/**
 * [S01] 시험 대기 화면
 * 시험 시작 전 대기, 비밀번호 입력, 녹화 화질 선택
 */
export default function Home() {
  const router = useRouter();
  const { password, isValid, error, validatePassword } = usePasswordValidation(
    CORRECT_PASSWORD
  );
  const [selectedBitrate, setSelectedBitrate] = useState<number>(
    RECORDING_QUALITY_OPTIONS[0].value
  );

  const handleStart = () => {
    if (isValid) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY_BITRATE, String(selectedBitrate));
      }
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

          {/* 녹화 화질 선택 (퀄리티 비교용) */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              녹화 화질 (비트레이트)
            </label>
            <p className="text-xs text-gray-500">
              낮을수록 파일 크기 감소, 화질은 다소 낮아질 수 있습니다.
            </p>
            <div className="space-y-2">
              {RECORDING_QUALITY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedBitrate === opt.value
                      ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="quality"
                    value={opt.value}
                    checked={selectedBitrate === opt.value}
                    onChange={() => setSelectedBitrate(opt.value)}
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">{opt.label}</span>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
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
