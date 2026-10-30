import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import BackendStatus from "./BackendStatus";
import Logo from "./Logo";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/predict", label: "Predict" },
  { to: "/forests", label: "Forest Types" },
  { to: "/about", label: "About Forests" },
];

export default function Layout() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
    setOpen(false);
  }, [pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-white/15 text-white" : "text-forest-100 hover:bg-white/10 hover:text-white"
    }`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-forest-950/95 text-white backdrop-blur">
        <div className="wrap flex h-16 items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-3" aria-label="ForestSphere home">
            <Logo />
            <span className="leading-tight">
              <span className="block font-serif text-xl font-semibold">ForestSphere</span>
              <span className="hidden text-[10px] uppercase tracking-[0.2em] text-forest-200 sm:block">Forest Intelligence</span>
            </span>
          </NavLink>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <BackendStatus />
            <Link to="/predict" className="btn-light !px-5 !py-2">Start a Prediction</Link>
          </div>
          <button className="rounded-lg p-2 md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {open && (
          <nav aria-label="Mobile" className="wrap flex flex-col gap-1 pb-4 md:hidden">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-forest-950 text-forest-100">
        <div className="wrap grid gap-10 py-14 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <Logo size={32} />
              <span className="font-serif text-xl font-semibold text-white">ForestSphere</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-forest-200">
              Explore forest ecosystems and identify forest cover types from the terrain and environment of a site.
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-2 text-sm">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="hover:text-white">
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs leading-relaxed text-forest-300">
            Forest photographs are provided by Wikipedia and Wikimedia Commons contributors under their respective free licences.
          </p>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-forest-300">© {new Date().getFullYear()} ForestSphere</div>
      </footer>
    </div>
  );
}