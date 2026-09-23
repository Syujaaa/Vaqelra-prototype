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
      <div className="flex justify-between text-xs text-ivory/60 mb-1.5">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="h-2 rounded-full bg-ink-800 overflow-hidden">
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
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-14">
      <span className="text-teal text-xs">{scenario.world}</span>
      <h1 className="font-display text-3xl sm:text-4xl mt-2">Evaluasi sesi speaking-mu</h1>
      <p className="text-ivory/65 text-sm mt-2">
        {turns} respons dianalisis dari percakapan dengan {scenario.role}.
      </p>

      <div className="grid sm:grid-cols-[auto,1fr] gap-8 mt-10">
        <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-2">
          <div className="w-24 h-24 rounded-full border-4 border-teal grid place-items-center">
            <span className="font-display text-2xl">{overall}</span>
          </div>
          <p className="text-xs text-ivory/50 sm:max-w-[7rem]">Skor keseluruhan sesi ini</p>
        </div>

        <div className="space-y-4">
          {Object.entries(scores).map(([key, value]) => (
            <ScoreBar key={key} label={scoreLabels[key]} value={value} />
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-display text-xl">Koreksi jawaban</h2>
        <div className="space-y-3 mt-4">
          {corrections.map((item, index) => (
            <div key={`${item.text}-${index}`} className="rounded-md border border-ink-800 bg-ink-900 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-ivory/45">Respons {index + 1}</span>
                <span className={`text-xs ${item.quality === "strong" ? "text-teal" : item.quality === "ok" ? "text-amber" : "text-flag"}`}>
                  {qualityLabel[item.quality]}
                </span>
              </div>
              <p className="text-sm mt-2">“{item.text}”</p>
              {item.quality !== "strong" && item.correction && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-ivory/55">
                    Catatan: {mistakeTags[item.tag]?.detail ?? "Coba gunakan kalimat yang lebih lengkap dan spesifik."}
                  </p>
                  <p className="text-xs text-teal">Contoh yang lebih kuat: {item.correction}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-display text-xl">AI Memory of Your Mistakes</h2>
        {mistakes.length === 0 ? (
          <p className="text-ivory/65 text-sm mt-2">
            Tidak ada pola kesalahan menonjol terdeteksi pada sesi ini — kerja bagus!
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {mistakes.map((tag) => (
              <div key={tag} className="rounded-md border border-ink-800 bg-ink-900 p-4">
                <p className="text-sm text-flag">{mistakeTags[tag]?.label ?? tag}</p>
                <p className="text-xs text-ivory/55 mt-1">{mistakeTags[tag]?.detail}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mt-12">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-amber text-ink-950 px-5 py-3 rounded-md text-sm font-medium hover:bg-amber-soft transition-colors"
        >
          Lihat progress lengkap
        </Link>
        <Link
          to="/worlds"
          className="text-sm text-ivory/70 hover:text-ivory underline underline-offset-4 decoration-ivory/30 self-center"
        >
          Coba dunia lain
        </Link>
      </div>
    </div>
  );
}
