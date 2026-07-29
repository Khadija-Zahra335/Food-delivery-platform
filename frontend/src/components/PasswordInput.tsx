'use client';

import { useState } from 'react';

type PasswordInputProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
};

export default function PasswordInput({
  id,
  value,
  onChange,
  disabled = false,
  placeholder = 'Enter your password',
  autoComplete = 'current-password',
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={showPassword ? 'text' : 'password'}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-line bg-white px-3.5 py-2.5 pr-11 text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-50 disabled:opacity-60"
      />
      <button
        type="button"
        onClick={() => setShowPassword((v) => !v)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-muted transition hover:text-brand-600"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
          {showPassword ? (
            <path
              d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.4 5.2A9.5 9.5 0 0112 5c5 0 9 4.5 9 7a11 11 0 01-2.3 3.3M6.2 6.7A11.6 11.6 0 003 12c0 2.5 4 7 9 7a9.6 9.6 0 003.6-.7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          ) : (
            <>
              <path
                d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7Z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
