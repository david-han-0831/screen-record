'use client';

import { useEffect } from 'react';

/**
 * 새로고침/탭 닫기 방지 커스텀 훅
 * @param shouldPrevent - 경고를 띄울 조건 (녹화 중 또는 업로드 중)
 */
export const usePreventRefresh = (shouldPrevent: boolean) => {
  useEffect(() => {
    if (!shouldPrevent) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Chrome 등에서는 브라우저 기본 문구만 표시됨
      e.returnValue = '';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [shouldPrevent]);
};
