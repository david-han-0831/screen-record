'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { requestScreenShare, createMediaRecorder } from '@/utils/recording';
import { downloadRecording } from '@/utils/fileDownload';

interface UseScreenRecorderReturn {
  stream: MediaStream | null;
  recorder: MediaRecorder | null;
  isRecording: boolean;
  isStarting: boolean;
  error: string | null;
  recordingBlob: Blob | null;
  chunks: Blob[];
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  handleScreenShareEnd: () => void;
}

/**
 * 화면 녹화 커스텀 훅
 */
export const useScreenRecorder = (): UseScreenRecorderReturn => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);

  const chunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  // ref 동기화
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  /**
   * 녹화 중지 (내부 함수)
   */
  const stopRecordingInternal = useCallback(() => {
    // 먼저 녹화 중지
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      // 모든 데이터를 수집하기 위해 requestData() 먼저 호출
      if (recorderRef.current.state === 'recording') {
        recorderRef.current.requestData();
      }
      // 그 다음 stop() 호출
      recorderRef.current.stop();
    }

    // 스트림은 onstop 콜백이 실행된 후에 정리
    // (onstop에서 Blob 생성이 완료된 후)
    setTimeout(() => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStream(null);
      }
      setRecorder(null);
    }, 300);
    
    setIsRecording(false);
    isRecordingRef.current = false;
  }, []);

  /**
   * 녹화 시작
   */
  const startRecording = useCallback(async () => {
    try {
      setIsStarting(true);
      setError(null);
      setChunks([]);
      chunksRef.current = [];

      // 1. 화면 공유 요청
      const mediaStream = await requestScreenShare();
      setStream(mediaStream);
      streamRef.current = mediaStream;

      // 2. 화면 공유 중단 감지 설정
      const videoTrack = mediaStream.getVideoTracks()[0];
      videoTrack.onended = () => {
        if (isRecordingRef.current) {
          stopRecordingInternal();
          setError('화면 공유가 중단되었습니다. 시험이 종료됩니다.');
        }
      };

      // 3. MediaRecorder 초기화 (화면에서 선택한 비트레이트 우선)
      const storedBitrate =
        typeof sessionStorage !== 'undefined'
          ? sessionStorage.getItem('recording_bitrate')
          : null;
      const videoBitsPerSecond = storedBitrate
        ? Number(storedBitrate)
        : undefined;

      const mediaRecorder = createMediaRecorder(
        mediaStream,
        (event) => {
          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);
            setChunks([...chunksRef.current]);
          }
        },
        () => {
          // 녹화 중지 시 Blob 생성 (모든 데이터가 수집된 후)
          // 약간의 지연을 두어 모든 데이터가 수집되도록 함
          setTimeout(() => {
            if (chunksRef.current.length > 0) {
              const finalBlob = new Blob(chunksRef.current, { type: 'video/webm' });
              // 빈 Blob 체크 (최소 크기 체크)
              if (finalBlob.size > 100) {
                // 100바이트 이상이면 유효한 파일로 간주
                setRecordingBlob(finalBlob);
              } else {
                // console.warn('녹화된 데이터가 너무 작습니다:', finalBlob.size);
                setError('Recorded data is insufficient. Please try again.');
              }
            } else {
              // console.warn('녹화된 chunks가 없습니다');
              setError('No recorded data. Please try again.');
            }
            setIsRecording(false);
            isRecordingRef.current = false;
          }, 200);
        },
        typeof videoBitsPerSecond === 'number' && Number.isFinite(videoBitsPerSecond)
          ? { videoBitsPerSecond }
          : undefined
      );

      setRecorder(mediaRecorder);
      recorderRef.current = mediaRecorder;

      // 4. 녹화 시작
      mediaRecorder.start(1000); // 1초마다 데이터 수집
      setIsRecording(true);
      isRecordingRef.current = true;
      setIsStarting(false);
    } catch (err) {
      setIsStarting(false);
      setIsRecording(false);
      isRecordingRef.current = false;
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('녹화 시작 중 오류가 발생했습니다.');
      }
      
      // 에러 발생 시 스트림 정리
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setStream(null);
      }
    }
  }, [stopRecordingInternal]);

  /**
   * 녹화 중지
   */
  const stopRecording = useCallback(() => {
    stopRecordingInternal();
  }, [stopRecordingInternal]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recorderRef.current && recorderRef.current.state !== 'inactive') {
        recorderRef.current.stop();
      }
    };
  }, []);

  /**
   * 화면 공유 중단 감지 (외부에서 호출용)
   */
  const handleScreenShareEnd = useCallback(() => {
    if (isRecording) {
      stopRecording();
      setError('화면 공유가 중단되었습니다. 시험이 종료됩니다.');
    }
  }, [isRecording, stopRecording]);

  return {
    stream,
    recorder,
    isRecording,
    isStarting,
    error,
    recordingBlob,
    chunks,
    startRecording,
    stopRecording,
    handleScreenShareEnd,
  };
};
