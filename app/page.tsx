'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PasswordInput from '@/components/ui/PasswordInput';
import { setStudentInfoToStorage } from '@/utils/studentStorage';
import { LANDING_PAGE_MESSAGES as M } from '@/lib/messages';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 녹화 화질 고정: 1.25 Mbps (화면에서 선택 불가) */
const FIXED_BITRATE = 1_250_000;
const STORAGE_KEY_BITRATE = 'recording_bitrate';

/**
 * [S01] Waiting / Landing screen (English)
 * Enter name, email, part, access code → Start Exam → API validates → recording screen
 */
export default function Home() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [accessCodeError, setAccessCodeError] = useState('');
  const [consentScreenRecording, setConsentScreenRecording] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [part, setPart] = useState<'Part 1' | 'Part 2'>('Part 1');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isFormValid =
    firstName.trim() !== '' &&
    lastName.trim() !== '' &&
    email.trim() !== '' &&
    EMAIL_REGEX.test(email.trim());
  const consentGiven = consentScreenRecording && consentPrivacy;
  const canStart = consentGiven && isFormValid && accessCode.trim() !== '' && !submitting;

  const handleAccessCodeChange = (value: string) => {
    setAccessCode(value);
    setAccessCodeError('');
  };

  const handleStart = async () => {
    setFormError('');
    setAccessCodeError('');
    if (!consentGiven) {
      setFormError(M.consentRequired);
      return;
    }
    if (!firstName.trim()) {
      setFormError(M.formErrorFirstName);
      return;
    }
    if (!lastName.trim()) {
      setFormError(M.formErrorLastName);
      return;
    }
    if (!email.trim()) {
      setFormError(M.formErrorEmail);
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setFormError(M.formErrorEmailInvalid);
      return;
    }
    if (!accessCode.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/validate-and-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessCode: accessCode.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          part,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        if (res.status === 401) {
          setAccessCodeError(M.wrongAccessCode);
          return;
        }
        setFormError(data.error || 'Could not start exam. Please try again.');
        return;
      }
      setStudentInfoToStorage({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        part,
        studentId: email.trim(),
      });
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(STORAGE_KEY_BITRATE, String(FIXED_BITRATE));
      }
      router.push('/recording');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="w-full max-w-md px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          {/* Logo & title (회의 문서) */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{M.title}</h1>
            <p className="text-gray-600">{M.subtitle}</p>
          </div>

          {/* Student info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  {M.firstName}
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={M.firstName}
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  {M.lastName}
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={M.lastName}
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {M.email}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="email@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="part" className="block text-sm font-medium text-gray-700">
                {M.part}
              </label>
              <select
                id="part"
                value={part}
                onChange={(e) => setPart(e.target.value as 'Part 1' | 'Part 2')}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="Part 1">{M.part1}</option>
                <option value="Part 2">{M.part2}</option>
              </select>
            </div>
            {formError && (
              <p className="text-sm text-red-600" role="alert">
                {formError}
              </p>
            )}
          </div>

          {/* Access code (회의 문서: access code) */}
          <div className="space-y-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              {M.accessCode}
            </label>
            <PasswordInput
              value={accessCode}
              onChange={handleAccessCodeChange}
              error={accessCodeError}
              placeholder={M.accessCodePlaceholder}
              disabled={submitting}
            />
          </div>

          {/* 동의 (Access code 아래) */}
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">{M.consentTitle}</h2>
              <p className="text-xs text-gray-600 leading-relaxed">{M.consentBody}</p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentScreenRecording}
                  onChange={(e) => setConsentScreenRecording(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to the <strong>Screen Recording Consent.</strong>
                </span>
              </label>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-900">{M.privacyTitle}</h2>
              <p className="text-xs text-gray-600 leading-relaxed">{M.privacyBody}</p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentPrivacy}
                  onChange={(e) => setConsentPrivacy(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{M.privacyCheckbox}</span>
              </label>
            </div>
          </div>

          {/* Start Exam button */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
              canStart
                ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {submitting
              ? 'Starting…'
              : canStart
                ? part === 'Part 2'
                  ? M.startExamPart2
                  : M.startExam
                : M.startExamDisabled}
          </button>

          {/* Screen share notice (회의 문서: You must share your entire screen.) */}
          <p className="text-xs text-center text-gray-500">
            You must share your <strong>entire screen.</strong>
          </p>
        </div>
      </main>
    </div>
  );
}
