interface EmptyStateProps {
  message: string;
  detail?: string;
}

/**
 * Consistent empty state display with SVG icon, message, and optional detail text.
 */
export function EmptyState({ message, detail }: EmptyStateProps) {
  return (
    <div className="text-center py-12 text-slate-500">
      <svg
        className="mx-auto h-12 w-12 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <p className="mt-4">{message}</p>
      {detail && <p className="text-sm mt-2">{detail}</p>}
    </div>
  );
}
