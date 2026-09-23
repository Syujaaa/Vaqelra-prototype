import { Link } from "react-router-dom";
import { ArrowRight, Ear, Brain, HeartHandshake } from "lucide-react";
import scenarios from "../data/scenarios.json";
import ScenarioCard from "../components/ScenarioCard";

const pillars = [
  {
    icon: Brain,
    title: "AI Life Simulation",
    body: "Bukan sekadar topik obrolan — kamu memilih kehidupan yang ingin dijalani: mahasiswa, karyawan baru, traveler, atau negosiator bisnis.",
  },
  {
    icon: Ear,
    title: "AI Memory of Your Mistakes",
    body: "Sistem mengingat pola kesalahanmu — tense, kosakata, jeda bicara — lalu menyusun latihan berikutnya di sekitar kelemahan itu.",
  },
  {
    icon: HeartHandshake,
    title: "AI Emotional Speaking Coach",
    body: "Feedback dari pola komunikasi yang teramati: terlalu diam, terburu-buru, atau kurang detail — bukan klaim membaca isi hati.",
  },
];

export default function Home() {
  const featured = scenarios.slice(0, 3);

  return (
    <div>
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-16">
        <div className="max-w-2xl">
          <span className="text-teal text-xs tracking-wide">AI English Life Simulator</span>
          <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] mt-4">
            Belajar speaking dengan menjalani kehidupan, bukan mengerjakan soal.
          </h1>
          <p className="text-ivory/70 mt-6 text-base sm:text-lg leading-relaxed max-w-xl">
            Vaqelra menempatkanmu dalam percakapan suara dengan karakter AI di dunia
            nyata — interview kerja, kampus internasional, perjalanan, hingga negosiasi bisnis.
            Setiap kesalahan dicatat, setiap sesi membentuk perjalanan belajarmu sendiri.
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-8">
            <Link
              to="/worlds"
              className="inline-flex items-center gap-2 bg-amber text-ink-950 px-5 py-3 rounded-md text-sm font-medium hover:bg-amber-soft transition-colors"
            >
              Pilih duniamu <ArrowRight size={16} />
            </Link>
            <Link
              to="/pricing"
              className="text-sm text-ivory/70 hover:text-ivory underline underline-offset-4 decoration-ivory/30"
            >
              Lihat paket harga
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-16">
        <div className="grid sm:grid-cols-3 gap-px bg-ink-800 rounded-lg overflow-hidden border border-ink-800">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-ink-900 p-6 sm:p-7">
              <Icon size={20} className="text-amber" />
              <h3 className="font-display text-xl mt-4">{title}</h3>
              <p className="text-ivory/65 text-sm mt-2 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 sm:px-8 pb-24">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl">Mulai dari dunia ini</h2>
            <p className="text-ivory/60 text-sm mt-1">Tiga skenario paling banyak dicoba pengguna baru.</p>
          </div>
          <Link to="/worlds" className="text-sm text-teal hover:text-ivory hidden sm:inline">
            Lihat semua dunia →
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {featured.map((s) => (
            <ScenarioCard key={s.id} scenario={s} />
          ))}
        </div>
      </section>

      <section className="border-t border-ink-800">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 grid sm:grid-cols-2 gap-10">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl">Root cause-nya sederhana</h2>
            <p className="text-ivory/70 mt-3 text-sm leading-relaxed max-w-md">
              Pengguna belum memiliki lingkungan latihan yang konsisten, aman untuk salah,
              dan relevan dengan kebutuhan komunikasi mereka sehari-hari.
            </p>
          </div>
          <ul className="text-sm text-ivory/70 space-y-3">
            <li className="flex gap-3"><span className="text-flag">•</span> Takut salah saat berbicara di depan orang lain.</li>
            <li className="flex gap-3"><span className="text-flag">•</span> Tidak selalu ada partner speaking yang bisa diajak rutin.</li>
            <li className="flex gap-3"><span className="text-flag">•</span> Latihan yang ada terasa berulang dan kurang kontekstual.</li>
            <li className="flex gap-3"><span className="text-flag">•</span> Sulit mengukur perkembangan kelancaran dan kepercayaan diri.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
