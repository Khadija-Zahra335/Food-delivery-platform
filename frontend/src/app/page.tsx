'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

/**
 * The app's front door. Sends people wherever they belong:
 * customers browse restaurants, owners manage theirs, and
 * anyone not logged in goes to the login page.
 */
export default function Home() {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!token) {
      router.replace('/login');
      return;
    }

    if (user?.role === 'RESTAURANT_OWNER') {
      router.replace('/owner');
    } else {
      router.replace('/restaurants');
    }
  }, [token, user, isLoading, router]);

  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <p className="text-sm text-ink-muted">Loading…</p>
    </div>
  );
}