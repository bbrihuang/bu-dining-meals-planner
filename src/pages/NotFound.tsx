import { Link } from 'react-router';
import { Arrow } from '../components/Shapes';
import { useTitle } from '../lib/useTitle';

export default function NotFound() {
  useTitle('Not found');
  return (
    <div className="card grid max-w-xl place-items-start gap-4 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Nothing here.</h1>
      <p className="text-muted">That page doesn’t exist, or the school or dining hall isn’t on the site yet.</p>
      <Link to="/" className="button button-ink mt-2">
        <Arrow back className="size-4" /> Back to all schools
      </Link>
    </div>
  );
}
