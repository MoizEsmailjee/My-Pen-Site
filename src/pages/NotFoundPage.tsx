import { Link } from 'react-router-dom';
import { usePageTitle } from '../lib/usePageTitle';

export function NotFoundPage({
  message = "The page you're looking for doesn't exist or has moved.",
}: {
  message?: string;
}) {
  usePageTitle('Page not found');
  return (
    <div className="max-w-[1280px] mx-auto px-6 py-24 text-center">
      <h1 className="font-serif-display text-3xl text-ink">Page not found</h1>
      <p className="mt-3 text-sm text-ink-soft">{message}</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center px-5 py-3 text-xs font-semibold tracking-wider uppercase bg-ink text-white rounded hover:bg-ink-hover transition-colors"
      >
        Back to the shop
      </Link>
    </div>
  );
}
