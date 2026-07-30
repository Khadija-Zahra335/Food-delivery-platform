'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, Role } from '../context/AuthContext';

type ProtectedRouteProps = {
  children: ReactNode;
  /** If provided, only these roles may view the page. Omit to allow any logged-in user. */
  allowedRoles?: Role[];
};

/** Where each role belongs when they land somewhere they shouldn't be. */
export function homeFor(role: Role | undefined): string {
  if (role === 'RESTAURANT_OWNER') return '/owner';
  if (role === 'CUSTOMER') return '/restaurants';
  return '/restaurants';
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();

  const isAllowed =
    !allowedRoles || (user ? allowedRoles.includes(user.role) : false);

  useEffect(() => {
    if (isLoading) return;

    if (!token) {
      router.push('/login');
      return;
    }

    if (!isAllowed) {
      router.push(homeFor(user?.role));
    }
  }, [token, user, isLoading, isAllowed, router]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <p className="text-sm text-ink-muted">Checking access…</p>
      </div>
    );
  }

  if (!token || !isAllowed) {
    return null;
  }

  return <>{children}</>;
}