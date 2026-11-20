import { Link } from "react-router-dom";

export default function ScenarioCard({ scenario, number }) {
  return (
    <Link
      to={`/worlds/${scenario.id}`}
      className="group grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-t border-ink-700 py-5 hover:bg-ink-900 sm:gap-6"
    >
      <span className="font-display text-2xl text-amber" aria-hidden="true">
        {number ?? "–"}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="font-display text-2xl group-hover:text-teal">{scenario.world}</h2>
          <span className="text-xs text-muted">
            {scenario.category} · {scenario.difficulty} · {scenario.estMinutes} menit
          </span>
        </div>
        <p className="text-sm text-muted mt-1">{scenario.role}</p>
        <p className="text-sm leading-relaxed mt-3">{scenario.tagline}</p>
        <p className="text-xs text-muted mt-3">{scenario.location}</p>
      </div>
    </Link>
  );
}
