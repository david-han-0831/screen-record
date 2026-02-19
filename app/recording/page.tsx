'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScreenRecorder } from '@/hooks/useScreenRecorder';
import { useRecordingTimer } from '@/hooks/useRecordingTimer';
import { usePreventRefresh } from '@/hooks/usePreventRefresh';
import ScreenShareModal from '@/components/ui/ScreenShareModal';
import RecordingHeader from '@/components/layout/RecordingHeader';
import { downloadRecording } from '@/utils/fileDownload';

/**
 * [S03] 시험 진행 화면
 * 녹화 중 시험 진행
 */
export default function RecordingPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  const [studentId] = useState('student'); // TODO: 실제로는 사용자 정보에서 가져오기

  const {
    isRecording,
    isStarting,
    error,
    recordingBlob,
    startRecording,
    stopRecording,
    handleScreenShareEnd,
  } = useScreenRecorder();

  const { formattedTime } = useRecordingTimer(isRecording);

  // 새로고침 방지
  usePreventRefresh(isRecording);

  // 녹화 시작 성공 시 모달 닫기
  useEffect(() => {
    if (isRecording && !isStarting) {
      setShowModal(false);
    }
  }, [isRecording, isStarting]);

  // 녹화 중지 시 파일 다운로드 및 종료 페이지로 이동
  useEffect(() => {
    if (recordingBlob) {
      try {
        downloadRecording(recordingBlob, studentId);
        router.push('/complete');
      } catch (err) {
        console.error('파일 다운로드 실패:', err);
      }
    }
  }, [recordingBlob, studentId, router]);

  // 화면 공유 중단 감지
  useEffect(() => {
    if (error && error.includes('화면 공유가 중단되었습니다')) {
      // 자동으로 녹화 중지 및 파일 저장
      if (recordingBlob) {
        downloadRecording(recordingBlob, studentId);
      }
      router.push('/complete');
    }
  }, [error, recordingBlob, studentId, router]);

  const handleStop = () => {
    stopRecording();
  };

  const handleModalClose = () => {
    if (!isRecording) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 녹화 상태 표시 바 */}
      {isRecording && <RecordingHeader elapsedTime={formattedTime} />}

      {/* 메인 콘텐츠 */}
      <main className={`container mx-auto px-4 py-8 ${isRecording ? 'pt-20' : ''}`}>
        {isRecording ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 안내 문구 */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>주의:</strong> 화면 공유를 중단하면 시험이 자동으로 종료됩니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 구글 폼(답안지) 링크 - NEXT_PUBLIC_GOOGLE_FORM_URL 설정 시 표시 */}
            {process.env.NEXT_PUBLIC_GOOGLE_FORM_URL && (
              <div className="flex justify-center">
                <a
                  href={process.env.NEXT_PUBLIC_GOOGLE_FORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  답안지(구글 폼) 열기
                </a>
              </div>
            )}

            {/* 시험지 영역 (PDF 표시 영역) */}
            <div className="bg-white rounded-lg shadow-lg p-8 min-h-[600px]">
              <div className="text-center text-gray-500 py-20">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-4 text-lg">시험지가 여기에 표시됩니다</p>
                <p className="mt-2 text-sm text-gray-400">
                  (실제 구현 시 PDF 뷰어 또는 이미지로 대체)
                </p>
              </div>
            </div>

            {/* 종료 버튼 */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleStop}
                className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                </svg>
                녹화 중지
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">시험 준비 중...</p>
          </div>
        )}
      </main>

      {/* 화면 공유 요청 모달 */}
      <ScreenShareModal
        isOpen={showModal}
        onClose={handleModalClose}
        onStart={startRecording}
        isStarting={isStarting}
        error={error}
      />
    </div>
  );
}
