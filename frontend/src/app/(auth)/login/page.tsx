// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '../../context/AuthContext';

// export default function LoginPage() {
//   const { login } = useAuth();
//   const router = useRouter();

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     if (!email || !password) {
//       setError('Email and password are required');
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const res = await fetch('http://localhost:3000/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setError(data.message || 'Login failed');
//         return;
//       }

//       login(data.token);
//       router.push('/dashboard');
//     } catch {
//       setError('Could not reach the server. Check your connection and try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div
//       className="relative flex flex-1 items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-4 py-4"
//       style={{ backgroundImage: "url('images/login-bg.jpg')" }}
//     >
//       <div className="absolute inset-0 bg-brand-900/70" aria-hidden="true" />

//       <div className="relative w-full max-w-lg rounded-2xl bg-white p-10 shadow-2xl sm:p-16">
//         {/* <div className="relative w-full max-w-2xl rounded-2xl bg-white p-14 shadow-2xl sm:p-16"> */}
//         {/* <div className="flex items-center gap-3"> */}
//         <div className="flex items-center justify-center gap-3">
//           <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-400 text-white">
//             <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
//               <path
//                 d="M4 11h16M6 11a6 6 0 0 1 12 0M5 15h14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Z"
//                 stroke="currentColor"
//                 strokeWidth="1.6"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           </span>
//           <span className="text-2xl font-semibold tracking-tight text-brand-900">
//             Foodly
//           </span>
//         </div>

        

//         <h1 className="mt-10 text-center text-4xl font-semibold tracking-tight text-brand-900">
//           Sign in
//         </h1>
//         <p className="mt-3 text-center text-lg text-ink-muted">
//           Welcome back. Enter your details to continue.
//         </p>

//         {error && (
//           <div
//             role="alert"
//             className="mt-7 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
//           >
//             <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0">
//               <path
//                 fillRule="evenodd"
//                 d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5ZM10 14a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
//                 clipRule="evenodd"
//               />
//             </svg>
//             <span>{error}</span>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="mt-8 space-y-6">
//           <div>
//             <label
//               htmlFor="email"
//               className="mb-2 block text-lg font-medium text-brand-900"
//             >
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               autoComplete="email"
//               placeholder="you@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               disabled={isLoading}
//               className="w-full rounded-lg border border-line bg-white px-4 py-3 text-base text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-50 disabled:opacity-60"
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="password"
//               className="mb-2 block text-lg font-medium text-brand-900"
//             >
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 id="password"
//                 type={showPassword ? 'text' : 'password'}
//                 autoComplete="current-password"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 disabled={isLoading}
//                 className="w-full rounded-lg border border-line bg-white px-4 py-3 pr-12 text-base text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-50 disabled:opacity-60"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword((v) => !v)}
//                 aria-label={showPassword ? 'Hide password' : 'Show password'}
//                 className="absolute inset-y-0 right-0 grid w-12 place-items-center text-ink-muted transition hover:text-brand-600"
//               >
//                 <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
//                   {showPassword ? (
//                     <path
//                       d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.4 5.2A9.5 9.5 0 0112 5c5 0 9 4.5 9 7a11 11 0 01-2.3 3.3M6.2 6.7A11.6 11.6 0 003 12c0 2.5 4 7 9 7a9.6 9.6 0 003.6-.7"
//                       stroke="currentColor"
//                       strokeWidth="1.6"
//                       strokeLinecap="round"
//                     />
//                   ) : (
//                     <>
//                       <path
//                         d="M3 12s3.6-7 9-7 9 7 9 7-3.6 7-9 7-9-7-9-7Z"
//                         stroke="currentColor"
//                         strokeWidth="1.6"
//                       />
//                       <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
//                     </>
//                   )}
//                 </svg>
//               </button>
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={isLoading}
//             className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-400 px-4 py-3.5 text-lg font-medium text-white transition hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {isLoading && (
//               <svg viewBox="0 0 24 24" className="h-5 w-5 animate-spin" aria-hidden="true">
//                 <circle
//                   cx="12"
//                   cy="12"
//                   r="9"
//                   stroke="currentColor"
//                   strokeWidth="3"
//                   fill="none"
//                   opacity="0.25"
//                 />
//                 <path
//                   d="M21 12a9 9 0 0 0-9-9"
//                   stroke="currentColor"
//                   strokeWidth="3"
//                   fill="none"
//                   strokeLinecap="round"
//                 />
//               </svg>
//             )}
//             {isLoading ? 'Signing in…' : 'Sign in'}
//           </button>
//         </form>

//         <p className="mt-8 text-center text-lg text-ink-muted">
//           New here?{' '}
//           <Link
//             href="/signup"
//             className="font-medium text-brand-600 underline-offset-4 hover:underline"
//           >
//             Create an account
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }




'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      login(data.token);
      router.push('/dashboard');
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    'w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-brand-400 focus:ring-4 focus:ring-brand-50 disabled:opacity-60';

  return (
    <div
      className="relative flex flex-1 items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-4 py-10"
      style={{ backgroundImage: "url('/images/login-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-brand-900/70" aria-hidden="true" />

      <div className="relative w-full max-w-sm rounded-2xl bg-white px-7 py-8 shadow-2xl">
        <div className="flex items-center justify-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-400 text-white">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
              <path
                d="M4 11h16M6 11a6 6 0 0 1 12 0M5 15h14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight text-brand-900">
            Foodly
          </span>
        </div>

        <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-brand-900">
          Sign in
        </h1>
        <p className="mt-1.5 text-center text-sm text-ink-muted">
          Welcome back. Enter your details to continue.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5ZM10 14a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

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
              className={inputClasses}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-brand-900"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={`${inputClasses} pr-11`}
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