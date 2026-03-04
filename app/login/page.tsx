'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/resources';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gradient-to-b from-nafsma-light-blue to-white py-12 px-4">
        <div className="w-full max-w-md">
          {/* Branding */}
          <div className="text-center mb-8">
            <h1 className="text-h2 text-nafsma-blue mb-2">Member Login</h1>
            <p className="text-nafsma-warm-gray">
              Access your NAFSMA member resources and benefits
            </p>
          </div>

          {/* Login card */}
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-nafsma-warm-gray"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-nafsma-teal hover:text-nafsma-blue"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-nafsma-blue text-white font-medium py-2.5 px-4 rounded-md hover:bg-nafsma-dark-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-nafsma-warm-gray">
                Not a member?{' '}
                <Link
                  href="/membership/join"
                  className="text-nafsma-teal hover:text-nafsma-blue font-medium"
                >
                  Join NAFSMA
                </Link>
              </p>
            </div>
          </div>

          {/* Help text */}
          <p className="text-center text-xs text-gray-400 mt-6">
            Need help? Contact{' '}
            <a
              href="mailto:info@nafsma.org"
              className="text-nafsma-teal hover:text-nafsma-blue"
            >
              info@nafsma.org
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
