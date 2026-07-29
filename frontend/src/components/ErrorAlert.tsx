export default function ErrorAlert({ message }: { message: string }) {
  return (
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
      <span>{message}</span>
    </div>
  );
}
