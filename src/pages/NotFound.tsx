import { Link } from 'react-router';
import { Arrow } from '../components/Shapes';
import { useTitle } from '../lib/useTitle';

export default function NotFound() {
  useTitle('Not found');
  return (
    <div className="grid animate-rise place-items-start gap-6 py-10">
      <div className="flex items-end gap-2" aria-hidden="true">
        <span className="size-12 bg-scarlet" />
        <span className="size-12 rounded-full border-2 border-ink" />
        <span className="size-0 border-x-[24px] border-b-[48px] border-x-transparent border-b-ink" />
      </div>
      <h1 className="text-5xl font-semibold tracking-tight">Nothing here.</h1>
      <p className="text-muted">That page doesn’t exist, or the school or dining hall isn’t on the site yet.</p>
      <Link to="/" className="inline-flex items-center gap-2 border border-ink px-5 py-3 text-sm font-medium hover:bg-ink hover:text-bg">
        <Arrow back className="size-4" /> Back to all schools
      </Link>
    </div>
  );
}
