interface NewPBBadgeProps {
  className?: string;
}

export function NewPBBadge({ className = '' }: NewPBBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 shadow-sm ${className}`}
    >
      <span className="text-amber-600">🏆</span>
      <span>PB!</span>
    </span>
  );
}

export default NewPBBadge;
