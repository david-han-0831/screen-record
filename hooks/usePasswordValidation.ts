'use client';

import { useState, useCallback } from 'react';

export interface UsePasswordValidationOptions {
  wrongPasswordMessage?: string;
}

/**
 * 비밀번호 검증 커스텀 훅
 * @param correctPassword - 올바른 비밀번호
 * @param options - wrongPasswordMessage: 불일치 시 표시할 메시지 (기본: 영어)
 */
export const usePasswordValidation = (
  correctPassword: string,
  options?: UsePasswordValidationOptions
) => {
  const wrongMessage = options?.wrongPasswordMessage ?? 'Incorrect password.';
  const [password, setPassword] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');

  const validatePassword = useCallback(
    (inputPassword: string) => {
      setPassword(inputPassword);

      if (inputPassword === '') {
        setIsValid(false);
        setError('');
        return;
      }

      if (inputPassword === correctPassword) {
        setIsValid(true);
        setError('');
      } else {
        setIsValid(false);
        setError(wrongMessage);
      }
    },
    [correctPassword, wrongMessage]
  );

  /**
   * 비밀번호 초기화
   */
  const resetPassword = useCallback(() => {
    setPassword('');
    setIsValid(false);
    setError('');
  }, []);

  return {
    password,
    isValid,
    error,
    validatePassword,
    resetPassword,
  };
};
