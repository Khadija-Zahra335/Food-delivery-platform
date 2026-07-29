export default function BrandLogo() {
  return (
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
  );
}
