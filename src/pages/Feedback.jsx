import { Link, Navigate, useLocation } from "react-router-dom";
import mistakeTags from "../data/mistakeTags.json";

const scoreLabels = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  pronunciation: "Pronunciation",
  fluency: "Fluency",
};

const qualityLabel = {
  strong: "Sudah bagus",
  ok: "Bisa dibuat lebih natural",
  weak: "Perlu diperbaiki",
};

function ScoreBar({ label, value }) {
  const tone = value >= 80 ? "bg-teal" : value >= 60 ? "bg-amber" : "bg-flag";
  return (
    <div>
      <div className="flex justify-between text-xs text-muted mb-1.5">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="h-2 rounded-full bg-ink-700 overflow-hidden">
        <div className={`h-full ${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default function Feedback() {
  const location = useLocation();
  const data = location.state;

  if (!data) {
    return <Navigate to="/worlds" replace />;
  }

  const { scenario, scores, mistakes, turns, corrections = [] } = data;
  const overall = Math.round(
    (scores.grammar + scores.vocabulary + scores.pronunciation + scores.fluency) / 4
  );

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <p className="text-sm text-teal">{scenario.world}</p>
      <h1 className="font-display text-4xl sm:text-5xl mt-3">Catatan setelah percakapan</h1>
      <p className="text-muted text-sm mt-3">
        {turns} jawaban ditinjau dari percakapan dengan {scenario.role}. Nilai dibuat dengan
        penilaian prototipe sederhana.
      </p>

      <div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-8 lg:gap-16 mt-10 sm:mt-14">
        <div className="border-t-2 border-teal pt-4">
          <p className="text-sm text-muted">Rata-rata sesi</p>
          <p className="font-display text-7xl mt-2">{overall}</p>
          <p className="text-xs text-muted mt-2">Dari empat kategori penilaian.</p>
        </div>
        <div className="space-y-4">
          {Object.entries(scores).map(([key, value]) => (
            <ScoreBar key={key} label={scoreLabels[key]} value={value} />
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-display text-3xl">Jawaban dan saran</h2>
        {corrections.length === 0 ? (
          <p className="border-t border-ink-700 mt-4 pt-4 text-sm text-muted">
            Belum ada jawaban untuk ditinjau pada sesi ini.
          </p>
        ) : (
          <div className="mt-4">
            {corrections.map((item, index) => (
              <article key={`${item.text}-${index}`} className="border-t border-ink-700 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-muted">Respons {index + 1}</span>
                  <span className={`text-xs font-medium ${item.quality === "strong" ? "text-teal" : item.quality === "ok" ? "text-amber" : "text-flag"}`}>
                    {qualityLabel[item.quality]}
                  </span>
                </div>
                <p className="text-sm mt-2">“{item.text}”</p>
                {item.quality !== "strong" && item.correction && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-muted">
                      Catatan: {mistakeTags[item.tag]?.detail ?? "Coba gunakan kalimat yang lebih lengkap dan spesifik."}
                    </p>
                    <p className="text-sm text-teal">Contoh yang lebih jelas: {item.correction}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="mt-12">
        <h2 className="font-display text-3xl">Pola yang muncul</h2>
        {mistakes.length === 0 ? (
          <p className="text-muted text-sm mt-3">
            Belum ada pola kesalahan yang tercatat pada sesi ini.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-x-8 mt-4">
            {mistakes.map((tag) => (
              <article key={tag} className="border-t border-ink-700 py-4">
                <p className="text-sm text-flag">{mistakeTags[tag]?.label ?? tag}</p>
                <p className="text-xs text-muted mt-1">{mistakeTags[tag]?.detail}</p>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mt-12">
        <Link
          to="/dashboard"
          className="inline-flex min-h-11 items-center gap-2 bg-amber text-white px-5 py-3 rounded-sm text-sm font-medium hover:bg-amber-soft"
        >
          Buka catatan latihan
        </Link>
        <Link
          to="/worlds"
          className="inline-flex min-h-11 items-center text-sm text-teal hover:text-ink underline underline-offset-4 self-center"
        >
          Pilih skenario lain
        </Link>
      </div>
    </div>
  );
}
