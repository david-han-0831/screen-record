'use client';

import { useState, useCallback } from 'react';

/**
 * 비밀번호 검증 커스텀 훅
 * @param correctPassword - 올바른 비밀번호
 * @returns 비밀번호 검증 관련 상태 및 함수
 */
export const usePasswordValidation = (correctPassword: string) => {
  const [password, setPassword] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');

  /**
   * 비밀번호 검증
   */
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
        setError('비밀번호가 일치하지 않습니다.');
      }
    },
    [correctPassword]
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
