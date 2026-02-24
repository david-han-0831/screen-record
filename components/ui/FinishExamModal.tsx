'use client';

import { useState } from 'react';

interface FinishExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<boolean>;
  passwordLabel: string;
  passwordPlaceholder: string;
  wrongPasswordMessage: string;
  submitLabel: string;
}

/**
 * Finish Exam: 감독관 비밀번호 입력 모달
 */
export default function FinishExamModal({
  isOpen,
  onClose,
  onConfirm,
  passwordLabel,
  passwordPlaceholder,
  wrongPasswordMessage,
  submitLabel,
}: FinishExamModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password.trim()) return;
    setLoading(true);
    try {
      const ok = await onConfirm(password.trim());
      if (ok) {
        setPassword('');
        onClose();
      } else {
        setError(wrongPasswordMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{submitLabel}</h2>
        <p className="text-sm text-gray-600 mb-4">{passwordLabel}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={passwordPlaceholder}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="flex-1 py-2.5 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60"
            >
              {loading ? 'Checking…' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
