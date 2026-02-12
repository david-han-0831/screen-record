/**
 * 화면 녹화 관련 TypeScript 타입 정의
 */

export interface RecordingState {
  isRecording: boolean;
  stream: MediaStream | null;
  recorder: MediaRecorder | null;
  recordingBlob: Blob | null;
  elapsedTime: number;
  error: string | null;
}

export interface RecordingContextType {
  state: RecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  handleScreenShareEnd: () => void;
}

export interface ScreenShareOptions {
  video: {
    displaySurface: 'monitor' | 'window' | 'browser';
    cursor: 'always' | 'motion' | 'never';
  };
  audio: boolean;
}

export interface MediaRecorderOptions {
  mimeType?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
}
