import { NavLink, Outlet } from "react-router-dom";
import { Compass, Home, LayoutDashboard, Sparkles, Tag } from "lucide-react";
import { useApp } from "../context/AppContext";

const navItems = [
  { to: "/", label: "Beranda", icon: Home, end: true },
  { to: "/worlds", label: "Dunia Simulasi", icon: Compass },
  { to: "/dashboard", label: "Progress", icon: LayoutDashboard },
  { to: "/pricing", label: "Paket", icon: Tag },
];

export default function Layout() {
  const { progress } = useApp();

  return (
    <div className="min-h-full bg-ink-950 text-ivory">
      <header className="border-b border-ink-800/80 sticky top-0 z-30 bg-ink-950/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <span className="w-8 h-8 rounded-md bg-amber grid place-items-center text-ink-950">
              <Sparkles size={16} strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg tracking-tight">Vaqelra</span>
          </NavLink>

          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-ink-800 text-amber"
                      : "text-ivory/70 hover:text-ivory hover:bg-ink-900"
                  }`
                }
              >
                <Icon size={15} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 text-xs text-ivory/70">
            <span className="hidden md:inline">Level {progress.level}</span>
            <span className="w-1 h-1 rounded-full bg-ivory/30 hidden md:inline" />
            <span className="flex items-center gap-1">
              🔥 {progress.streakDays}h
            </span>
          </div>
        </div>

        <nav className="sm:hidden flex items-center justify-around border-t border-ink-800/80 h-12">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 text-[10px] ${
                  isActive ? "text-amber" : "text-ivory/60"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-ink-800/80 mt-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 text-xs text-ivory/50 flex flex-col sm:flex-row gap-2 justify-between">
          <p>Vaqelra — AI English Life Simulator. Prototype, data lokal (JSON), tanpa backend.</p>
          <p>Dibuat dari dokumen proposal ide bisnis startup.</p>
        </div>
      </footer>
    </div>
  );
}
