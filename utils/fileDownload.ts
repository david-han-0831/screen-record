/**
 * 파일 다운로드 관련 유틸리티 함수
 */

/**
 * 녹화 파일 다운로드
 * @param blob - 다운로드할 Blob 데이터
 * @param studentId - 학생 ID (파일명에 사용)
 */
export const downloadRecording = (blob: Blob, studentId: string = 'student'): void => {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    // 파일명 생성: test_학생ID_날짜.webm
    const date = new Date().toISOString().split('T')[0];
    const fileName = `test_${studentId}_${date}.webm`;
    a.download = fileName;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // 메모리 정리
    URL.revokeObjectURL(url);
    
    // 다운로드 성공 표시 (localStorage에 저장)
    localStorage.setItem('recording_download_success', 'true');
    localStorage.setItem('recording_file_name', fileName);
  } catch (error) {
    // console.error('파일 다운로드 중 오류:', error);
    localStorage.setItem('recording_download_success', 'false');
    throw new Error('파일 다운로드에 실패했습니다.');
  }
};

/**
 * 시간을 HH:MM:SS 형식으로 포맷
 * @param seconds - 초 단위 시간
 * @returns 포맷된 시간 문자열
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return [hours, minutes, secs]
    .map((unit) => String(unit).padStart(2, '0'))
    .join(':');
};
