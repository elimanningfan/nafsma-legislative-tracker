'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-b from-nafsma-light-blue to-white py-12 px-4">
        <div className="w-full max-w-md">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-h2 text-nafsma-blue mb-3">Check Your Email</h1>
              <p className="text-nafsma-warm-gray mb-6 leading-relaxed">
                If an account exists for <strong>{email}</strong>, we have sent
                a password reset link. Please check your inbox and spam folder.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-nafsma-teal hover:text-nafsma-blue font-medium"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-h2 text-nafsma-blue mb-2">
                  Reset Your Password
                </h1>
                <p className="text-nafsma-warm-gray">
                  Enter your email address and we will send you a link to reset
                  your password.
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
                      htmlFor="email"
                      className="block text-sm font-medium text-nafsma-warm-gray mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none"
                      placeholder="you@example.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-nafsma-blue text-white font-medium py-2.5 px-4 rounded-md hover:bg-nafsma-dark-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
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
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
