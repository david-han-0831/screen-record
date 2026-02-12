'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * [S04] 시험 종료 화면
 * 녹화 파일 저장 완료 안내
 */
export default function CompletePage() {
  const router = useRouter();
  const [fileName, setFileName] = useState<string>('');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  useEffect(() => {
    // localStorage에서 파일명 가져오기
    const savedFileName = localStorage.getItem('recording_file_name');
    if (savedFileName) {
      setFileName(savedFileName);
    } else {
      // 기본 파일명 생성
      const date = new Date().toISOString().split('T')[0];
      setFileName(`test_student_${date}.webm`);
    }

    // 다운로드 성공 여부 확인
    const success = localStorage.getItem('recording_download_success');
    if (success === 'true') {
      setDownloadSuccess(true);
      localStorage.removeItem('recording_download_success');
    }
  }, []);

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <main className="w-full max-w-md px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 text-center">
          {/* 성공 아이콘 */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* 메시지 */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">시험이 종료되었습니다</h1>
            <p className="text-gray-600">
              녹화 파일이 저장되었습니다
            </p>
          </div>

          {/* 파일 정보 */}
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-8 h-8 text-blue-600"
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {fileName}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  다운로드 폴더에서 확인하세요
                </p>
              </div>
            </div>
          </div>

          {/* 다운로드 성공 여부 */}
          {downloadSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                ✓ 파일이 성공적으로 다운로드되었습니다
              </p>
            </div>
          )}

          {/* 안내 문구 */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded text-left">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>안내:</strong> 감독관에게 녹화 파일을 제출하세요.
                </p>
              </div>
            </div>
          </div>

          {/* 홈으로 돌아가기 버튼 */}
          <button
            onClick={handleGoHome}
            className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            홈으로 돌아가기
          </button>
        </div>
      </main>
    </div>
  );
}
