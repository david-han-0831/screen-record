'use client';

import { useEffect, useRef } from 'react';

interface ScreenShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => Promise<void>;
  isStarting: boolean;
  error: string | null;
}

/**
 * 화면 공유 요청 모달 컴포넌트
 * [S02] 화면 공유 요청 화면
 */
export default function ScreenShareModal({
  isOpen,
  onClose,
  onStart,
  isStarting,
  error,
}: ScreenShareModalProps) {
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (isOpen && !hasStartedRef.current && !isStarting && !error) {
      // 모달이 처음 열릴 때만 자동으로 화면 공유 요청
      hasStartedRef.current = true;
      onStart();
    }
  }, [isOpen, isStarting, error, onStart]);

  // 모달이 닫히면 리셋
  useEffect(() => {
    if (!isOpen) {
      hasStartedRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            {isStarting ? (
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
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
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">화면 공유 요청</h2>
            {isStarting ? (
              <p className="text-gray-600">화면 공유 권한을 요청하고 있습니다...</p>
            ) : error ? (
              <div className="space-y-4">
                <p className="text-red-600 font-medium">{error}</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
                  <p className="text-sm text-yellow-800 font-semibold mb-2">
                    ⚠️ 중요 안내
                  </p>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    <li>반드시 <strong>전체 화면(모니터)</strong>을 선택해주세요</li>
                    <li>브라우저 탭이나 창을 선택하면 시험이 시작되지 않습니다</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">
                화면 공유 대화상자에서 <strong>전체 화면</strong>을 선택해주세요
              </p>
            )}
          </div>

          {error && (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  hasStartedRef.current = false;
                  onStart();
                }}
                disabled={isStarting}
                className="flex-1 py-2 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}

          {!error && !isStarting && (
            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
