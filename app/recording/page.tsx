'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useScreenRecorder } from '@/hooks/useScreenRecorder';
import { useRecordingTimer } from '@/hooks/useRecordingTimer';
import { usePreventRefresh } from '@/hooks/usePreventRefresh';
import ScreenShareModal from '@/components/ui/ScreenShareModal';
import FinishExamModal from '@/components/ui/FinishExamModal';
import RecordingHeader from '@/components/layout/RecordingHeader';
import { uploadRecordingToDrive } from '@/utils/uploadToDrive';
import { getStudentInfoFromStorage } from '@/utils/studentStorage';
import { RECORDING_PAGE_MESSAGES as R } from '@/lib/messages';

/**
 * [S03] 시험 진행 화면
 * 녹화 중 시험 진행
 */
export default function RecordingPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  const [showFinishExamModal, setShowFinishExamModal] = useState(false);
  const [studentInfo] = useState(() => getStudentInfoFromStorage());

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

  // 새로고침/탭 닫기 방지 (녹화 중 + 업로드 중)
  usePreventRefresh(isRecording || !!recordingBlob);

  // 녹화 시작 성공 시 모달 닫기
  useEffect(() => {
    if (isRecording && !isStarting) {
      setShowModal(false);
    }
  }, [isRecording, isStarting]);

  // 녹화 중지 시 Drive 업로드만 진행 후 종료 페이지로 이동 (로컬 다운로드 없음)
  useEffect(() => {
    if (!recordingBlob) return;

    let cancelled = false;

    (async () => {
      const result = await uploadRecordingToDrive({
        blob: recordingBlob,
        studentId: studentInfo.studentId,
        firstName: studentInfo.firstName,
        lastName: studentInfo.lastName,
        email: studentInfo.email,
        part: studentInfo.part,
      });
      if (cancelled) return;
      if (result.ok) {
        // console.log('Drive 업로드 완료:', result.fileName);
      } else {
        // console.warn('Drive 업로드 실패:', result.error);
      }
      if (!cancelled) router.push('/complete');
    })();

    return () => {
      cancelled = true;
    };
  }, [recordingBlob, studentInfo, router]);

  // 화면 공유 중단 감지
  useEffect(() => {
    if (!error?.includes('화면 공유가 중단되었습니다') || !recordingBlob) return;

    (async () => {
      await uploadRecordingToDrive({
        blob: recordingBlob,
        studentId: studentInfo.studentId,
        firstName: studentInfo.firstName,
        lastName: studentInfo.lastName,
        email: studentInfo.email,
        part: studentInfo.part,
      });
      router.push('/complete');
    })();
  }, [error, recordingBlob, studentInfo, router]);

  const handleStopClick = () => {
    setShowFinishExamModal(true);
  };

  const handleFinishExamConfirm = async (password: string): Promise<boolean> => {
    const res = await fetch('/api/validate-stop-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ part: studentInfo.part, password }),
    });
    if (!res.ok) return false;
    stopRecording();
    return true;
  };

  const handleModalClose = () => {
    if (!isRecording) {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 업로드 중 오버레이: 녹화 중지 후 Drive 저장이 끝날 때까지 표시 */}
      {recordingBlob && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-900/90 text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent" />
          <p className="mt-6 text-xl font-semibold">{R.savingRecording}</p>
          <p className="mt-2 text-sm text-gray-300 max-w-sm text-center">
            {R.doNotClose}
          </p>
        </div>
      )}

      {/* 녹화 상태 표시 바 */}
      {isRecording && (
        <RecordingHeader elapsedTime={formattedTime} part={studentInfo.part} />
      )}

      {/* 메인 콘텐츠 */}
      <main className={`container mx-auto px-4 py-8 ${isRecording ? 'pt-20' : ''}`}>
        {isRecording ? (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Caution (회의 3번) */}
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
                  <p className="text-sm text-yellow-700">{R.caution}</p>
                </div>
              </div>
            </div>

            {/* Instruction: 항상 표시. 시험 링크는 Part 1에서만 (Part 2에서는 링크만 제외, 2026-02-24 수정사항) */}
            <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">{R.instructionTitle}</h2>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                <li>{R.instruction1}</li>
                <li>{R.instruction2}</li>
                <li>{R.instruction3}</li>
                <li>{R.instruction4}</li>
              </ul>
              {studentInfo.part !== 'Part 2' &&
                (process.env.NEXT_PUBLIC_EXAM_URL ? (
                  <div className="pt-2">
                    <a
                      href={process.env.NEXT_PUBLIC_EXAM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      {R.examLinkButton}
                    </a>
                    <p className="mt-2 text-sm text-gray-500">{R.examLinkDescription}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">{R.examAreaPlaceholder}</p>
                ))}
            </div>

            {/* Answer sheet (Google Form) - optional */}
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
                  {R.answerSheetButton}
                </a>
              </div>
            )}

            {/* Finish Exam: 감독관 비밀번호 입력 후에만 중지 */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleStopClick}
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
                {R.finishExam}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">{R.preparing}</p>
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

      {/* Finish Exam: 비밀번호 입력 후에만 녹화 중지 */}
      <FinishExamModal
        isOpen={showFinishExamModal}
        onClose={() => setShowFinishExamModal(false)}
        onConfirm={handleFinishExamConfirm}
        passwordLabel={R.finishExamPasswordLabel}
        passwordPlaceholder={R.finishExamPasswordPlaceholder}
        wrongPasswordMessage={R.finishExamWrongPassword}
        submitLabel={R.finishExam}
      />
    </div>
  );
}
