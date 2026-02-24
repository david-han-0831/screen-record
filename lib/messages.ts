/**
 * 대기 화면(랜딩) 영어 안내 메시지
 * 출처: docs/회의/2026-02/2026-02-20-시험 녹화 웹사이트 영어 추가_변경 내용.md
 */
export const LANDING_PAGE_MESSAGES = {
  // 1. Screen Recording Consent (로그인 전 동의)
  consentTitle: 'Screen Recording Consent',
  consentBody:
    'To ensure the integrity and fairness of the examination, your screen will be recorded during the exam session. The recording will be used solely for monitoring and academic integrity purposes. By proceeding with the examination, you acknowledge and consent to the screen recording under these conditions.',
  consentCheckbox: 'I have read and agree to the **Screen Recording Consent.**',
  // Privacy & Data Retention
  privacyTitle: 'Privacy & Data Retention',
  privacyBody:
    'Recordings will be retained solely for academic review and integrity verification purposes and will be securely stored and deleted in accordance with institutional data retention policies.',
  privacyCheckbox: 'I have read and agree to the Privacy and Data Retention Policy.',
  // 2. Form
  title: 'Screen Recording for the Exam',
  subtitle: 'Please enter the access code provided by your proctor.',
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email',
  part: 'Part',
  part1: 'Part 1',
  part2: 'Part 2',
  accessCode: 'Access code',
  accessCodePlaceholder: 'Enter access code',
  wrongAccessCode: 'Incorrect access code.',
  recordingQuality: 'Recording quality (bitrate)',
  recordingQualityHint: 'Lower bitrate = smaller file size; quality may be slightly lower.',
  qualityHigh: '2.5 Mbps (High quality)',
  qualityHighDesc: 'Best quality, larger file',
  qualityMedium: '1.5 Mbps (Medium)',
  qualityMediumDesc: 'Balanced quality and size',
  qualitySmall: '1.25 Mbps (Smaller file)',
  qualitySmallDesc: 'Smaller file, slightly lower quality',
  startExam: 'Start Exam',
  startExamPart2: 'Resume Exam',
  startExamDisabled: 'Please enter your name, email, and access code.',
  screenShareNotice: 'You must share your **entire screen.**',
  formErrorFirstName: 'Please enter First Name.',
  formErrorLastName: 'Please enter Last Name.',
  formErrorEmail: 'Please enter Email.',
  formErrorEmailInvalid: 'Please enter a valid email address.',
  consentRequired: 'Please agree to both consent statements above.',
} as const;

/** 녹화 페이지 (회의 3번 + 2026-02-24) */
export const RECORDING_PAGE_MESSAGES = {
  finishExam: 'Finish Exam',
  finishExamPasswordLabel: 'Enter the password provided by your proctor to finish the exam.',
  finishExamPasswordPlaceholder: 'Password',
  finishExamWrongPassword: 'Incorrect password.',
  stopRecording: 'Finish Exam',
  // Caution (회의 3번)
  caution:
    'Caution: Do not stop screen sharing or close this window, as doing so will terminate your exam.',
  // Instruction block (회의 3번 - 시험지 영역 상단)
  instructionTitle: 'Instruction',
  instruction1: 'You must not close this website or stop screen sharing.',
  instruction2:
    'If this window is closed or screen sharing stops, please raise your hand immediately and wait for the proctor.',
  instruction3:
    'Please ensure that all other applications and browser tabs unrelated to the exam are closed before sharing your screen.',
  instruction4:
    'Please click the exam link below, read the instructions, and wait for the proctor’s instructions.',
  examLinkButton: 'Open exam',
  examLinkDescription: 'The exam will open in a new tab. Follow the on-screen instructions.',
  examAreaPlaceholder: 'Click the button above to open the exam in a new tab.',
  preparing: 'Preparing...',
  // Google Form (답안지)
  answerSheetButton: 'Open answer sheet (Google Form)',
  // Upload overlay (already English, keep consistent)
  savingRecording: 'Saving your recording...',
  doNotClose: 'Do not close this window until saving is complete.',
  // Part 2: 녹화 재개 (2026-02-24 수정사항)
  recordingLabel: 'Recording',
  recordingResumedLabel: 'Resume recording',
} as const;
