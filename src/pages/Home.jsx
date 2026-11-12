import scenarios from "../data/scenarios.json";
import ScenarioCard from "../components/ScenarioCard";
import {
  ActionLink,
  PageContainer,
  PageTitle,
  SectionTitle,
  Surface,
} from "../components/ui";

export default function Home() {
  const featured = scenarios.slice(0, 3);
  const firstScenario = featured[0];

  return (
    <div>
      <PageContainer
        as="section"
        className="grid items-end gap-10 pt-12 pb-14 lg:gap-16 sm:pb-20 sm:pt-20 lg:grid-cols-[1.2fr_0.8fr]"
      >
        <div>
          <p className="text-teal text-sm">Latihan bahasa Inggris berbasis situasi</p>
          <PageTitle size="hero" className="mt-5 max-w-3xl leading-[1.05]">
            Latihan bahasa Inggris lewat situasi sehari-hari.
          </PageTitle>
          <p className="text-muted mt-6 text-base sm:text-lg leading-relaxed max-w-xl">
            Pilih sebuah situasi, jawab dengan suara atau teks, lalu tinjau catatan
            latihanmu. Skenario percakapan dan evaluasi di Vaqelra masih berupa
            prototipe berbasis naskah.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-8">
            <ActionLink
              to="/worlds"
            >
              Pilih skenario
            </ActionLink>
            <ActionLink
              to="/dashboard"
              variant="text"
              className="px-3"
            >
              Lihat catatan latihan
            </ActionLink>
          </div>
        </div>

        <Surface as="aside" className="p-6 sm:p-8 lg:mb-1">
          <p className="font-display text-6xl leading-none text-amber" aria-hidden="true">01</p>
          <p className="text-xs text-muted mt-6">Skenario pembuka</p>
          <h2 className="font-display text-3xl mt-2">{firstScenario.world}</h2>
          <p className="text-sm text-muted mt-1">{firstScenario.role}</p>
          <p className="text-sm leading-relaxed mt-5">{firstScenario.tagline}</p>
          <ActionLink
            to={`/worlds/${firstScenario.id}`}
            variant="text"
            className="mt-5"
          >
            Buka skenario ini
          </ActionLink>
        </Surface>
      </PageContainer>

      <PageContainer
        as="section"
        className="pb-16 sm:pb-24"
      >
        <div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-8 lg:gap-16">
          <div className="lg:pt-5">
            <SectionTitle className="sm:text-4xl">Pilih suasana latihanmu.</SectionTitle>
            <p className="text-muted text-sm mt-4 leading-relaxed max-w-sm">
              Mulai dari ruang kelas sampai percakapan kerja. Setiap skenario
              memiliki konteks dan naskah percakapan sendiri.
            </p>
            <ActionLink
              to="/worlds"
              variant="text"
              className="mt-5"
            >
              Lihat semua {scenarios.length} dunia
            </ActionLink>
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
      </PageContainer>

      <section className="border-t border-ink-700">
        <PageContainer className="grid gap-3 py-8 sm:grid-cols-[10rem_1fr] sm:gap-8 sm:py-10">
          <SectionTitle size="small">Catatan prototipe</SectionTitle>
          <p className="text-sm text-muted leading-relaxed max-w-3xl">
            Sesi latihan memakai percakapan contoh dan penilaian sederhana, bukan
            model AI atau layanan evaluasi pengucapan. Riwayat disimpan di browser
            yang sedang digunakan.
          </p>
        </PageContainer>
      </section>
    </div>
  );
}
