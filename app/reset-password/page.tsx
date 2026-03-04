'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <h1 className="text-h2 text-nafsma-blue mb-3">Invalid Link</h1>
        <p className="text-nafsma-warm-gray mb-6">
          This password reset link is missing or invalid. Please request a new
          one.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center px-6 py-3 bg-nafsma-blue text-white font-medium rounded-md hover:bg-nafsma-dark-navy transition-colors"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-h2 text-nafsma-blue mb-3">Password Updated</h1>
        <p className="text-nafsma-warm-gray mb-6">
          Your password has been successfully reset. You can now sign in with
          your new password.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center px-6 py-3 bg-nafsma-blue text-white font-medium rounded-md hover:bg-nafsma-dark-navy transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-h2 text-nafsma-blue mb-2">Set New Password</h1>
        <p className="text-nafsma-warm-gray">
          Choose a new password for your account.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg border p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-nafsma-warm-gray mb-1.5"
            >
              New Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-nafsma-warm-gray mb-1.5"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none"
              placeholder="Re-enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-nafsma-blue text-white font-medium py-2.5 px-4 rounded-md hover:bg-nafsma-dark-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-nafsma-teal hover:text-nafsma-blue"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to login
          </Link>
        </div>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-b from-nafsma-light-blue to-white py-12 px-4">
        <div className="w-full max-w-md">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-nafsma-blue border-t-transparent" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
