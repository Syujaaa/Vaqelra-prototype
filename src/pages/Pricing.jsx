import pricing from "../data/pricing.json";

export default function Pricing() {
  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="max-w-2xl">
        <h1 className="font-display text-4xl sm:text-5xl">Rancangan paket</h1>
        <p className="text-muted text-sm sm:text-base mt-4 leading-relaxed">
          Paket dan harga berikut masih usulan awal, bukan penawaran resmi.
          Prototipe ini tidak memproses pembayaran.
        </p>
      </div>

      <div className="mt-10 sm:mt-14 border-t border-ink-700">
        {pricing.map((plan, index) => (
          <section
            key={plan.id}
            className="grid lg:grid-cols-[0.7fr_1.3fr] gap-5 lg:gap-16 border-b border-ink-700 py-7 sm:py-9"
          >
            <div>
              <p className="font-display text-5xl text-amber" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="font-display text-2xl mt-3">{plan.name}</h2>
              <p className="mt-2">
                <span className="font-display text-3xl">{plan.price}</span>{" "}
                <span className="text-sm text-muted">{plan.period}</span>
              </p>
            </div>
            <div>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="border-t border-ink-700 pt-3 text-sm leading-relaxed">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
