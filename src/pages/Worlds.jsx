import scenarios from "../data/scenarios.json";
import ScenarioCard from "../components/ScenarioCard";

export default function Worlds() {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
      <span className="text-teal text-xs tracking-wide">Dunia Simulasi</span>
      <h1 className="font-display text-3xl sm:text-4xl mt-3">Kehidupan mana yang ingin kamu jalani?</h1>
      <p className="text-ivory/65 text-sm sm:text-base mt-3 max-w-xl">
        Setiap dunia punya karakter AI, konteks, dan gaya percakapan sendiri. Pilih satu untuk
        memulai sesi speaking bersuara.
      </p>

      <div className="grid sm:grid-cols-3 auto-rows-fr gap-4 mt-10">
        {scenarios.map((s, i) => (
          <ScenarioCard key={s.id} scenario={s} size={i === 0 ? "lg" : "md"} />
        ))}
      </div>
    </div>
  );
}
