// The page frame (header, footer) and the routes:
//   /               pick your school
//   /bu             pick a dining hall
//   /bu/warren      that hall's meal plan and menu (?date=YYYY-MM-DD&view=menu)
import { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router';
import { Logo } from './components/Shapes';
import ThemeToggle from './components/ThemeToggle';
import HallPage from './pages/HallPage';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import SchoolPage from './pages/SchoolPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link to="/" className="relative flex items-center gap-3 font-display text-[1.05rem] font-semibold tracking-tight after:absolute after:inset-x-0 after:-inset-y-4">
              <Logo />
              <span>Dining Hall Planner</span>
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:schoolId" element={<SchoolPage />} />
            <Route path="/:schoolId/:hallId" element={<HallPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p>Menus come from each school's dining website and refresh twice a day.</p>
            <p>Nutrition is an estimate, not medical advice.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
