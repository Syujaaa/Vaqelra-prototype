import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";

const accentMap = {
  teal: { bar: "bg-teal", chip: "bg-teal/15 text-teal" },
  amber: { bar: "bg-amber", chip: "bg-amber/15 text-amber" },
  flag: { bar: "bg-flag", chip: "bg-flag/15 text-flag" },
};

export default function ScenarioCard({ scenario, size = "md" }) {
  const accent = accentMap[scenario.accent] || accentMap.teal;
  const tall = size === "lg";

  return (
    <Link
      to={`/worlds/${scenario.id}`}
      className={`group relative flex flex-col justify-between rounded-lg border border-ink-700 bg-ink-900 p-6 overflow-hidden hover:border-ink-700/0 transition-colors ${
        tall ? "sm:row-span-2 sm:p-8" : ""
      }`}
    >
      <span className={`absolute left-0 top-0 h-full w-1 ${accent.bar}`} />

      <div>
        <div className="flex items-center justify-between gap-3">
          <span className={`text-[11px] px-2 py-1 rounded-sm ${accent.chip}`}>
            {scenario.difficulty}
          </span>
          <ArrowUpRight
            size={18}
            className="text-ivory/30 group-hover:text-ivory transition-colors"
          />
        </div>

        <h3 className={`font-display mt-4 ${tall ? "text-3xl" : "text-2xl"}`}>
          {scenario.world}
        </h3>
        <p className="text-ivory/60 text-sm mt-1">{scenario.role}</p>
        <p className="text-ivory/75 text-sm mt-4 leading-relaxed">{scenario.tagline}</p>
      </div>

      <div className="flex items-center gap-4 mt-6 text-xs text-ivory/50">
        <span className="flex items-center gap-1">
          <MapPin size={13} /> {scenario.location}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={13} /> {scenario.estMinutes} menit
        </span>
      </div>
    </Link>
  );
}
