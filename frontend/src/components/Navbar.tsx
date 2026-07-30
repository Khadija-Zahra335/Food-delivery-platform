'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';

const CUSTOMER_LINKS = [
  { href: '/restaurants', label: 'Restaurants' },
  { href: '/orders', label: 'My orders' },
  { href: '/addresses', label: 'Addresses' },
];

const OWNER_LINKS = [
  { href: '/owner', label: 'My restaurant' },
  { href: '/owner/menu', label: 'Menu' },
  { href: '/owner/orders', label: 'Orders' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const links =
    user?.role === 'RESTAURANT_OWNER' ? OWNER_LINKS : CUSTOMER_LINKS;

  const home = user?.role === 'RESTAURANT_OWNER' ? '/owner' : '/restaurants';

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link href={home} className="flex shrink-0 items-center gap-2.5">
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
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== '/owner' && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-brand-50 text-brand-800'
                    : 'text-ink-muted hover:bg-brand-50 hover:text-brand-800'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Button bg-brand-400 size="sm" onClick={logout}>
          Log out
        </Button>
      </div>
    </header>
  );
}