import scenarios from "../data/scenarios.json";
import ScenarioCard from "../components/ScenarioCard";

export default function Worlds() {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-8 lg:gap-16">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight">
            Pilih tempat untuk mulai bicara.
          </h1>
          <p className="text-muted text-sm sm:text-base mt-4 leading-relaxed">
            {scenarios.length} skenario dengan konteks percakapan yang berbeda.
            Pilih satu untuk melihat ringkasan sebelum sesi dimulai.
          </p>
        </div>
        <div>
          {scenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              number={String(index + 1).padStart(2, "0")}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
