import { Trees } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import BackendStatus from "./BackendStatus";

const links = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/predict", label: "Predict" },
  { to: "/about", label: "About the model" },
];

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-sage-200 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-forest-800 text-forest-100">
              <Trees size={20} aria-hidden />
            </span>
            <span className="font-serif text-lg font-semibold leading-tight">Forest Cover Type</span>
          </NavLink>
          <nav aria-label="Main" className="flex items-center gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? "bg-forest-100 text-forest-800" : "text-forest-700 hover:bg-sage-100"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden md:block">
            <BackendStatus />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-sage-200 py-6 text-center text-sm text-sage-500">
        Forest Cover Type Prediction. Built on a TensorFlow neural network trained on the Forest Cover Type dataset.
      </footer>
    </div>
  );
}