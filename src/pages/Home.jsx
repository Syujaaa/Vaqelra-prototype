import { Link } from "react-router-dom";
import scenarios from "../data/scenarios.json";
import ScenarioCard from "../components/ScenarioCard";

export default function Home() {
  const featured = scenarios.slice(0, 3);
  const firstScenario = featured[0];

  return (
    <div>
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-14 sm:pb-20 grid lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-16 items-end">
        <div>
          <p className="text-teal text-sm">Latihan bahasa Inggris berbasis situasi</p>
          <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] mt-5 max-w-3xl">
            Latihan bahasa Inggris lewat situasi sehari-hari.
          </h1>
          <p className="text-muted mt-6 text-base sm:text-lg leading-relaxed max-w-xl">
            Pilih sebuah situasi, jawab dengan suara atau teks, lalu tinjau catatan
            latihanmu. Skenario percakapan dan evaluasi di Vaqelra masih berupa
            prototipe berbasis naskah.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <Link
              to="/worlds"
              className="inline-flex min-h-11 items-center bg-amber text-white px-5 py-3 rounded-sm text-sm font-medium hover:bg-amber-soft active:translate-y-px"
            >
              Pilih skenario
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex min-h-11 items-center px-3 text-sm text-teal underline underline-offset-4 hover:text-ink"
            >
              Lihat catatan latihan
            </Link>
          </div>
        </div>

        <aside className="bg-ink-900 border border-ink-700 p-6 sm:p-8 lg:mb-1">
          <p className="font-display text-6xl leading-none text-amber" aria-hidden="true">01</p>
          <p className="text-xs text-muted mt-6">Skenario pembuka</p>
          <h2 className="font-display text-3xl mt-2">{firstScenario.world}</h2>
          <p className="text-sm text-muted mt-1">{firstScenario.role}</p>
          <p className="text-sm leading-relaxed mt-5">{firstScenario.tagline}</p>
          <Link
            to={`/worlds/${firstScenario.id}`}
            className="inline-flex min-h-11 items-center mt-5 text-sm text-teal underline underline-offset-4 hover:text-ink"
          >
            Buka skenario ini
          </Link>
        </aside>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16 sm:pb-24">
        <div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-8 lg:gap-16">
          <div className="lg:pt-5">
            <h2 className="font-display text-3xl sm:text-4xl">Pilih suasana latihanmu.</h2>
            <p className="text-muted text-sm mt-4 leading-relaxed max-w-sm">
              Mulai dari ruang kelas sampai percakapan kerja. Setiap skenario
              memiliki konteks dan naskah percakapan sendiri.
            </p>
            <Link
              to="/worlds"
              className="inline-flex min-h-11 items-center mt-5 text-sm text-teal underline underline-offset-4 hover:text-ink"
            >
              Lihat semua {scenarios.length} dunia
            </Link>
          </div>
          <div>
            {featured.map((scenario, index) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                number={String(index + 1).padStart(2, "0")}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-ink-700">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-10 grid sm:grid-cols-[10rem_1fr] gap-3 sm:gap-8">
          <h2 className="font-display text-xl">Catatan prototipe</h2>
          <p className="text-sm text-muted leading-relaxed max-w-3xl">
            Sesi latihan memakai percakapan contoh dan penilaian sederhana, bukan
            model AI atau layanan evaluasi pengucapan. Riwayat disimpan di browser
            yang sedang digunakan.
          </p>
        </div>
      </section>
    </div>
  );
}
