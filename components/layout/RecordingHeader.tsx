'use client';

interface RecordingHeaderProps {
  elapsedTime: string;
}

/**
 * 녹화 중 상단 고정 바 컴포넌트
 */
export default function RecordingHeader({ elapsedTime }: RecordingHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              <span className="font-bold text-lg">REC</span>
            </div>
            <span className="text-sm opacity-90">녹화 중</span>
          </div>
          <div className="font-mono text-lg font-semibold">{elapsedTime}</div>
        </div>
      </div>
    </div>
  );
}
