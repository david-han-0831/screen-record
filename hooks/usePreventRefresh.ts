'use client';

import { useEffect } from 'react';

/**
 * 새로고침 방지 커스텀 훅
 * @param isRecording - 녹화 중 여부
 */
export const usePreventRefresh = (isRecording: boolean) => {
  useEffect(() => {
    if (!isRecording) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Chrome에서는 기본 메시지만 표시됨
      e.returnValue = '시험이 진행 중입니다. 페이지를 나가시겠습니까?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRecording]);
};
