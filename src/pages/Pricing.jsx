import { Check } from "lucide-react";
import pricing from "../data/pricing.json";

export default function Pricing() {
  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14">
      <span className="text-teal text-xs tracking-wide">Paket</span>
      <h1 className="font-display text-3xl sm:text-4xl mt-3">Freemium SaaS, tumbuh bersama levelmu</h1>
      <p className="text-ivory/65 text-sm sm:text-base mt-3 max-w-xl">
        Harga di bawah ini adalah usulan awal dan perlu divalidasi melalui survei pasar serta
        perhitungan biaya API AI voice, server, dan operasional.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mt-10 items-stretch">
        {pricing.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col rounded-lg border p-6 sm:p-7 ${
              plan.highlight
                ? "border-amber bg-ink-900 sm:-translate-y-2 shadow-[0_0_0_1px_rgba(230,169,48,0.3)]"
                : "border-ink-800 bg-ink-900"
            }`}
          >
            {plan.highlight && (
              <span className="text-[11px] text-amber mb-3">Paling banyak dipilih</span>
            )}
            <h2 className="font-display text-2xl">{plan.name}</h2>
            <p className="mt-2">
              <span className="text-3xl font-display">{plan.price}</span>{" "}
              <span className="text-ivory/50 text-sm">{plan.period}</span>
            </p>

            <ul className="mt-6 space-y-3 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-ivory/75">
                  <Check size={15} className="text-teal shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              className={`mt-7 w-full rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                plan.highlight
                  ? "bg-amber text-ink-950 hover:bg-amber-soft"
                  : "bg-ink-800 text-ivory hover:bg-ink-700"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-ivory/40 mt-8">
        Prototipe ini belum memproses pembayaran sungguhan — tombol di atas hanya ilustrasi alur produk.
      </p>
    </div>
  );
}
