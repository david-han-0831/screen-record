'use client';

import { useRouter } from 'next/navigation';

/**
 * [S04] 시험 종료 화면 (회의 3번)
 * 문구만 표시: The exam is finished. / Please raise your hand and wait for instructions from your proctor.
 */
export default function CompletePage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <main className="w-full max-w-md px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">The exam is finished.</h1>
          <p className="text-gray-700">
            Please raise your hand and wait for instructions from your proctor.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Back to home
          </button>
        </div>
      </main>
    </div>
  );
}
