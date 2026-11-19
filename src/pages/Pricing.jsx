import pricing from "../data/pricing.json";
import { PageContainer, PageTitle } from "../components/ui";

export default function Pricing() {
  return (
    <PageContainer className="py-12 sm:py-16">
      <div className="max-w-2xl">
        <PageTitle>Rancangan paket</PageTitle>
        <p className="text-muted text-sm sm:text-base mt-4 leading-relaxed">
          Paket dan harga berikut masih usulan awal, bukan penawaran resmi.
          Prototipe ini tidak memproses pembayaran.
        </p>
      </div>

      <div className="mt-10 sm:mt-14 grid gap-4 lg:grid-cols-3">
        {pricing.map((plan) => (
          <article
            key={plan.id}
            aria-labelledby={`plan-${plan.id}`}
            className={`flex h-full flex-col border bg-ink-900 p-6 sm:p-7 ${
              plan.highlight ? "border-amber" : "border-ink-700"
            }`}
          >
            <div>
              <h2 id={`plan-${plan.id}`} className="font-display text-2xl">{plan.name}</h2>
              <p className="mt-2">
                <span className="font-display text-3xl">{plan.price}</span>{" "}
                <span className="text-sm text-muted">{plan.period}</span>
              </p>
            </div>
            <ul className="mt-6 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="border-t border-ink-700 py-3 text-sm leading-relaxed">
                  {feature}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </PageContainer>
  );
}
