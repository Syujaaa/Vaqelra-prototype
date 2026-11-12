import { NavLink, Outlet } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { PageContainer } from "./ui";

const navItems = [
  { to: "/", label: "Beranda", end: true },
  { to: "/worlds", label: "Dunia latihan" },
  { to: "/dashboard", label: "Progress" },
  { to: "/pricing", label: "Paket" },
];

export default function Layout() {
  const { progress } = useApp();

  return (
    <div className="min-h-screen bg-canvas text-ivory">
      <header className="sticky top-0 z-30 border-b border-ink-700 bg-ink-900">
        <PageContainer className="min-h-16 flex items-center justify-between gap-4">
          <NavLink to="/" className="inline-flex min-h-11 items-center shrink-0">
            <span className="font-display text-2xl tracking-tight">Vaqelra</span>
          </NavLink>

          <nav aria-label="Navigasi utama" className="hidden sm:flex items-center gap-1">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `inline-flex min-h-11 items-center px-3 rounded-sm text-sm ${
                    isActive
                      ? "text-teal underline underline-offset-8 decoration-2"
                      : "text-muted hover:text-ivory hover:bg-ink-950"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:block text-right text-xs text-muted">
            <span>Level {progress.level}</span>
            <span className="px-2" aria-hidden="true">/</span>
            <span>{progress.streakDays} hari berlatih</span>
          </div>
        </PageContainer>

        <nav aria-label="Navigasi utama" className="mobile-nav sm:hidden flex items-stretch justify-around border-t border-ink-800 min-h-14 px-1">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-1 items-center justify-center px-1 text-[11px] text-center ${
                  isActive ? "text-teal underline underline-offset-4 decoration-2" : "text-muted"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-ink-900 focus:px-4 focus:py-3"
        >
          Lewati ke konten
        </a>
        <div id="main-content">
        <Outlet />
        </div>
      </main>

      <footer className="border-t border-ink-800/80 mt-24">
        <PageContainer className="py-8 text-xs text-muted flex flex-col sm:flex-row gap-2 justify-between">
          <p>Vaqelra | Latihan bahasa Inggris berbasis skenario.</p>
          <p>Prototipe lokal. Data sesi tersimpan di browser.</p>
        </PageContainer>
      </footer>
    </div>
  );
}
