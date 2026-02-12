'use client';

import { useState, useEffect } from 'react';
import { formatTime } from '@/utils/fileDownload';

/**
 * 녹화 시간 관리 커스텀 훅
 * @param isRecording - 녹화 중 여부
 * @returns 경과 시간과 포맷된 시간 문자열
 */
export const useRecordingTimer = (isRecording: boolean) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isRecording) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  return {
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
  };
};
