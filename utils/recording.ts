/**
 * 화면 녹화 관련 유틸리티 함수
 */

import type { ScreenShareOptions } from '@/types/recording';

/**
 * 화면 공유 요청
 * @returns MediaStream 또는 에러
 */
export const requestScreenShare = async (): Promise<MediaStream> => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'monitor', // 전체 화면만 허용
        cursor: 'always',
      } as MediaTrackConstraints,
      audio: false,
    });

    // displaySurface 확인
    const videoTrack = stream.getVideoTracks()[0];
    const settings = videoTrack.getSettings();

    if (settings.displaySurface !== 'monitor') {
      // 전체 화면이 아니면 스트림 중지
      stream.getTracks().forEach((track) => track.stop());
      throw new Error('전체 화면을 선택해주세요.');
    }

    return stream;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('화면 공유 권한이 거부되었습니다.');
      }
      if (error.name === 'NotFoundError') {
        throw new Error('화면 공유 장치를 찾을 수 없습니다.');
      }
      throw error;
    }
    throw new Error('화면 공유 요청 중 오류가 발생했습니다.');
  }
};

/** 기본 비트레이트 2.5Mbps (환경변수·화면 선택 없을 때) */
const DEFAULT_VIDEO_BITRATE = 2_500_000;

export interface CreateMediaRecorderOptions {
  /** 비트레이트(bps). 화면에서 선택한 값 또는 env 우선 사용 */
  videoBitsPerSecond?: number;
}

/**
 * MediaRecorder 초기화
 * 비트레이트: options > NEXT_PUBLIC_RECORDING_VIDEO_BITRATE > 기본값 2.5Mbps
 */
export const createMediaRecorder = (
  stream: MediaStream,
  onDataAvailable: (event: BlobEvent) => void,
  onStop: () => void,
  options?: CreateMediaRecorderOptions
): MediaRecorder => {
  const override = options?.videoBitsPerSecond;
  const envBitrate =
    typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_RECORDING_VIDEO_BITRATE
      ? Number(process.env.NEXT_PUBLIC_RECORDING_VIDEO_BITRATE)
      : null;
  const bitrate =
    override != null && Number.isFinite(override) && override > 0
      ? override
      : envBitrate != null && Number.isFinite(envBitrate) && envBitrate > 0
        ? envBitrate
        : DEFAULT_VIDEO_BITRATE;
  const videoBitsPerSecond = bitrate;

  const options: MediaRecorderOptions = {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond,
  };

  // 지원되는 MIME 타입 확인
  let mimeType: string = options.mimeType ?? 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8';
    }
  }

  const recorder = new MediaRecorder(stream, {
    ...options,
    mimeType,
  });

  recorder.ondataavailable = onDataAvailable;
  recorder.onstop = onStop;

  return recorder;
};
