'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import BrandLogo from '../../../components/BrandLogo';
import ErrorAlert from '../../../components/ErrorAlert';
import PasswordInput from '../../../components/PasswordInput';
import { api } from '@/lib/api';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);

    try {
      const data = await api.login({ email, password });
      login(data.token);
      router.push('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setError(
        message.toLowerCase().includes('fetch')
          ? 'Could not reach the server. Check your connection and try again.'
          : message || 'Login failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative flex flex-1 items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-4 py-10"
      style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-brand-900/70" aria-hidden="true" />

      <div className="relative w-full max-w-sm rounded-2xl bg-white px-7 py-8 shadow-2xl">
        <BrandLogo />

        <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-brand-900">
          Sign in
        </h1>
        <p className="mt-1.5 text-center text-sm text-ink-muted">
          Welcome back. Enter your details to continue.
        </p>

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-brand-900"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-50 disabled:opacity-60"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-brand-900"
            >
              Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-400 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading && (
              <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" aria-hidden="true">
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.25"
                />
                <path
                  d="M21 12a9 9 0 0 0-9-9"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            )}
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          New here?{' '}
          <Link
            href="/signup"
            className="font-medium text-brand-600 underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
