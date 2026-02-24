/**
 * 시험 대기 화면에서 입력한 학생 정보를 sessionStorage에 저장/조회
 * recording 페이지에서 파일명·업로드 시 사용
 */

export const STORAGE_KEY_STUDENT_INFO = 'recording_student_info';

export interface StudentInfo {
  firstName: string;
  lastName: string;
  email: string;
  part: 'Part 1' | 'Part 2';
  /** 파일명 fallback용 (firstName_lastName_email 없을 때) */
  studentId: string;
}

const defaultStudentInfo: StudentInfo = {
  firstName: '',
  lastName: '',
  email: '',
  part: 'Part 1',
  studentId: 'student',
};

export function setStudentInfoToStorage(info: Partial<StudentInfo>): void {
  if (typeof sessionStorage === 'undefined') return;
  const current = getStudentInfoFromStorage();
  const merged: StudentInfo = {
    ...current,
    ...info,
    studentId: info.email?.trim() || info.studentId || current.studentId,
  };
  sessionStorage.setItem(STORAGE_KEY_STUDENT_INFO, JSON.stringify(merged));
}

export function getStudentInfoFromStorage(): StudentInfo {
  if (typeof sessionStorage === 'undefined') return defaultStudentInfo;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_STUDENT_INFO);
    if (!raw) return defaultStudentInfo;
    const parsed = JSON.parse(raw) as Partial<StudentInfo>;
    return {
      firstName: parsed.firstName ?? defaultStudentInfo.firstName,
      lastName: parsed.lastName ?? defaultStudentInfo.lastName,
      email: parsed.email ?? defaultStudentInfo.email,
      part: parsed.part === 'Part 2' ? 'Part 2' : 'Part 1',
      studentId: parsed.studentId ?? parsed.email ?? defaultStudentInfo.studentId,
    };
  } catch {
    return defaultStudentInfo;
  }
}
