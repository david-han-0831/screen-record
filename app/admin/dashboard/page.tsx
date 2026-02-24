'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { getAuthClient, getFirestoreClient } from '@/lib/firebase';

interface ExamSession {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  part?: string;
  startedAt?: { toDate: () => Date };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState('');
  const [part1Password, setPart1Password] = useState('');
  const [part2Password, setPart2Password] = useState('');
  const [students, setStudents] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [saving, setSaving] = useState<'access' | 'stop' | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Auth guard: must be signed in and Firestore users/{uid}.role === 'admin'
  useEffect(() => {
    const auth = getAuthClient();
    const db = getFirestoreClient();
    if (!auth || !db) {
      setAuthChecked(true);
      setLoading(false);
      return;
    }
    const unsub = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.replace('/admin');
        setAuthChecked(true);
        setLoading(false);
        return;
      }
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const role = userDoc.exists() ? (userDoc.data()?.role as string | undefined) : undefined;
      if (role !== 'admin') {
        await auth.signOut();
        router.replace('/admin');
        setAuthChecked(true);
        setLoading(false);
        return;
      }
      setAuthChecked(true);
    });
    return () => unsub();
  }, [router]);

  // Load settings and subscribe to exam_sessions
  useEffect(() => {
    if (!authChecked) return;
    const db = getFirestoreClient();
    if (!db) {
      setLoading(false);
      return;
    }

    let unsubSessions: Unsubscribe | undefined;

    (async () => {
      try {
        const [accessSnap, stopSnap] = await Promise.all([
          getDoc(doc(db, 'settings', 'accessCode')),
          getDoc(doc(db, 'settings', 'stopPasswords')),
        ]);
        if (accessSnap.exists()) {
          const v = accessSnap.data()?.value;
          setAccessCode(typeof v === 'string' ? v : '');
        }
        if (stopSnap.exists()) {
          const d = stopSnap.data();
          setPart1Password(typeof d?.part1 === 'string' ? d.part1 : '');
          setPart2Password(typeof d?.part2 === 'string' ? d.part2 : '');
        }

        unsubSessions = onSnapshot(
          query(
            collection(db, 'exam_sessions'),
            orderBy('startedAt', 'desc')
          ),
          (snap) => {
            setStudents(
              snap.docs.map((d) => {
                const data = d.data();
                return {
                  id: d.id,
                  firstName: data.firstName ?? '',
                  lastName: data.lastName ?? '',
                  email: data.email ?? '',
                  part: data.part,
                  startedAt: data.startedAt,
                };
              })
            );
          },
          (err) => {
            // console.error('exam_sessions subscription error', err);
          }
        );
      } catch (e) {
        // console.error('Load settings error', e);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      if (unsubSessions) unsubSessions();
    };
  }, [authChecked]);

  const handleSignOut = async () => {
    const auth = getAuthClient();
    if (auth) await signOut(auth);
    router.push('/admin');
  };

  const handleSaveAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    const db = getFirestoreClient();
    if (!db) {
      setSaveError('Firestore not configured.');
      return;
    }
    setSaving('access');
    try {
      await setDoc(doc(db, 'settings', 'accessCode'), {
        value: accessCode.trim(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(null);
    }
  };

  const handleSaveStopPasswords = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    const db = getFirestoreClient();
    if (!db) {
      setSaveError('Firestore not configured.');
      return;
    }
    setSaving('stop');
    try {
      await setDoc(doc(db, 'settings', 'stopPasswords'), {
        part1: part1Password.trim(),
        part2: part2Password.trim(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(null);
    }
  };

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Sign out
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            Exam page
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {saveError && (
          <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">
            {saveError}
          </div>
        )}

        {/* 1. Student management */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Students</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Students who have started the exam (First Name, Last Name, Email)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm">
                  <th className="px-6 py-3 font-medium">First Name</th>
                  <th className="px-6 py-3 font-medium">Last Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                    <td className="px-6 py-3 text-gray-900">{s.firstName}</td>
                    <td className="px-6 py-3 text-gray-900">{s.lastName}</td>
                    <td className="px-6 py-3 text-gray-600">{s.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {students.length === 0 && (
            <p className="px-6 py-8 text-center text-gray-500 text-sm">
              No students have started the exam yet.
            </p>
          )}
        </section>

        {/* 2. Access code */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Access code</h2>
          <p className="text-sm text-gray-500 mt-0.5 mb-4">
            Single code used by all students to start the exam.
          </p>
          <form onSubmit={handleSaveAccessCode} className="flex flex-wrap items-end gap-4">
            <div className="min-w-[200px]">
              <label htmlFor="access-code" className="block text-sm font-medium text-gray-700 mb-1">
                Code
              </label>
              <input
                id="access-code"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. exam2026"
              />
            </div>
            <button
              type="submit"
              disabled={saving === 'access'}
              className="py-2 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
            >
              {saving === 'access' ? 'Saving…' : 'Save'}
            </button>
          </form>
        </section>

        {/* 3. Stop recording passwords */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Stop recording passwords</h2>
          <p className="text-sm text-gray-500 mt-0.5 mb-4">
            Passwords required to finish the exam (proctor only). One per part.
          </p>
          <form onSubmit={handleSaveStopPasswords} className="space-y-4 max-w-md">
            <div>
              <label htmlFor="stop-part1" className="block text-sm font-medium text-gray-700 mb-1">
                Part 1
              </label>
              <input
                id="stop-part1"
                type="text"
                value={part1Password}
                onChange={(e) => setPart1Password(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. 1111"
              />
            </div>
            <div>
              <label htmlFor="stop-part2" className="block text-sm font-medium text-gray-700 mb-1">
                Part 2
              </label>
              <input
                id="stop-part2"
                type="text"
                value={part2Password}
                onChange={(e) => setPart2Password(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. 1234"
              />
            </div>
            <button
              type="submit"
              disabled={saving === 'stop'}
              className="py-2 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
            >
              {saving === 'stop' ? 'Saving…' : 'Save'}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
