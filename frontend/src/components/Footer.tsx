import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-brand-400 text-white">
      {/* <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-base sm:flex-row"> */}
      <div className="flex flex-col items-center justify-between gap-3 px-20 py-2 text-lg font-semibold sm:flex-row">
        <p className="text-white text-md font-semibold">
          © {new Date().getFullYear()} Foodly. Built by Khadija Zahra.
        </p>

        <nav className="flex items-center gap-6">
          <Link
            href="https://khadijazahra-portfolio.vercel.app/"
            className="text-white text-md font-semibold underline-offset-4 transition hover:text-white hover:underline"
          >
            About
          </Link>
          <a
            href="https://github.com/Khadija-Zahra335/Food-delivery-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white text-md font-semibold underline-offset-4 transition hover:text-white hover:underline"
          >
            GitHub
          </a>
          <a
            href="http://localhost:3000/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white text-md font-semibold underline-offset-4 transition hover:text-white hover:underline"
          >
            API docs
          </a>
        </nav>
      </div>
    </footer>
  );
}
