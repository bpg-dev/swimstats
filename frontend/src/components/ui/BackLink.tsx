import { Link } from 'react-router-dom';

interface BackLinkProps {
  to: string;
  label: string;
}

export function BackLink({ to, label }: BackLinkProps) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 text-sm text-cyan-600 hover:text-cyan-700 transition-colors"
    >
      <span aria-hidden="true">←</span>
      <span>Back to {label}</span>
    </Link>
  );
}
