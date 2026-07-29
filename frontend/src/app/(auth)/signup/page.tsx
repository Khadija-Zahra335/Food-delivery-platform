'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BrandLogo from '../../../components/BrandLogo';
import ErrorAlert from '../../../components/ErrorAlert';
import PasswordInput from '../../../components/PasswordInput';

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Signup failed');
        return;
      }

      router.push('/login');
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    'w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-50 disabled:opacity-60';

  const labelClasses = 'mb-1.5 block text-sm font-medium text-brand-900';

  return (
    <div
      className="relative flex flex-1 items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-4 py-6"
      style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-brand-900/70" aria-hidden="true" />

      <div className="relative w-full max-w-sm rounded-2xl bg-white px-7 py-6 shadow-2xl">
        <BrandLogo />

        <h1 className="mt-5 text-center text-2xl font-semibold tracking-tight text-brand-900">
          Create your account
        </h1>
        <p className="mt-1.5 text-center text-sm text-ink-muted">
          Order, deliver, or manage a restaurant.
        </p>

        {error && <ErrorAlert message={error} />}

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div>
            <label htmlFor="name" className={labelClasses}>
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClasses}>
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
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClasses}>
              Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={setPassword}
              disabled={isLoading}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="role" className={labelClasses}>
              I am a
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isLoading}
              className={inputClasses}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="RESTAURANT_OWNER">Restaurant owner</option>
              <option value="RIDER">Rider</option>
            </select>
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
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-brand-600 underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
