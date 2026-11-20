import { useState } from "react";
import scenarios from "../data/scenarios.json";
import ScenarioCard from "../components/ScenarioCard";
import { PageContainer, PageTitle } from "../components/ui";

export default function Worlds() {
  const categories = ["Semua", ...new Set(scenarios.map((scenario) => scenario.category))];
  const [activeCategory, setActiveCategory] = useState("Semua");
  const visibleScenarios = activeCategory === "Semua"
    ? scenarios
    : scenarios.filter((scenario) => scenario.category === activeCategory);

  return (
    <PageContainer className="py-12 sm:py-16">
      <div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-8 lg:gap-16">
        <div>
          <PageTitle>
            Pilih tempat untuk mulai bicara.
          </PageTitle>
          <p className="text-muted text-sm sm:text-base mt-4 leading-relaxed">
            {scenarios.length} skenario dengan konteks percakapan yang berbeda.
            Pilih satu untuk melihat ringkasan sebelum sesi dimulai.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1" aria-label="Filter kategori dunia">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
                className={`min-h-11 border-b-2 px-0 py-2 text-sm transition-colors ${
                  activeCategory === category
                    ? "border-amber text-ink"
                    : "border-transparent text-muted hover:border-ink-700 hover:text-ink"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div>
          {visibleScenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              number={String(index + 1).padStart(2, "0")}
            />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
