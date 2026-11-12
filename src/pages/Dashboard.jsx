import { Link } from "react-router-dom";
import { RotateCcw, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import mistakeTags from "../data/mistakeTags.json";

export default function Dashboard() {
  const { progress, deleteSession, resetProgress, mistakeFrequency } = useApp();

  const xpPct = Math.round((progress.xp / progress.xpToNextLevel) * 100);
  const topMistakes = Object.entries(mistakeFrequency).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl sm:text-5xl">Catatan latihan</h1>
          <p className="text-muted text-sm mt-3">Ringkasan sesi tersimpan di browser ini. Data awal ditandai sebagai contoh prototipe.</p>
        </div>
        <button
          type="button"
          onClick={resetProgress}
          className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-flag border border-ink-700 px-3 py-2 rounded-sm"
        >
          <RotateCcw size={14} aria-hidden="true" />
          Reset data prototipe
        </button>
      </div>

      <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-16 mt-10 sm:mt-14">
        <div className="bg-ink-900 border border-ink-700 p-6 sm:p-8">
          <p className="text-sm text-muted">Level saat ini</p>
          <div className="flex items-baseline flex-wrap gap-x-3 mt-2">
            <p className="font-display text-6xl sm:text-7xl leading-none">{progress.level}</p>
            <p className="font-display text-2xl">{progress.levelLabel}</p>
          </div>
          <div
            className="h-2 bg-ink-700 mt-7"
            role="progressbar"
            aria-label="Progress menuju level berikutnya"
            aria-valuemin={0}
            aria-valuemax={progress.xpToNextLevel}
            aria-valuenow={progress.xp}
          >
            <div className="h-full bg-teal" style={{ width: `${xpPct}%` }} />
          </div>
          <p className="text-xs text-muted mt-2">
            {progress.xp} dari {progress.xpToNextLevel} XP menuju level berikutnya
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-6 content-start">
          <div className="border-b border-ink-700 pb-5">
            <p className="text-sm text-muted">Hari latihan berturut-turut, data contoh</p>
            <p className="font-display text-4xl mt-2">{progress.streakDays} hari</p>
            <p className="text-xs text-muted mt-2">Nilai ini berasal dari data awal prototipe.</p>
          </div>
          <div className="border-b border-ink-700 pb-5">
            <p className="text-sm text-muted">Target latihan, data contoh</p>
            <p className="font-display text-2xl mt-2">{progress.dailyMission.title}</p>
            <p className="text-xs text-teal mt-2">{progress.dailyMission.reward}</p>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-10 lg:gap-16 mt-14 sm:mt-20">
        <div>
          <h2 className="font-display text-3xl">Riwayat sesi</h2>
          {progress.completedSessions.length === 0 ? (
            <div className="border-t border-ink-700 mt-4 pt-4">
              <p className="text-sm text-muted">Belum ada sesi tersimpan.</p>
              <Link to="/worlds" className="inline-flex min-h-11 items-center text-sm text-teal underline underline-offset-4 hover:text-ink">
                Pilih skenario latihan
              </Link>
            </div>
          ) : (
            <ul className="mt-4">
              {progress.completedSessions.map((session, index) => {
                const avg = Math.round(
                  (session.scores.grammar + session.scores.vocabulary + session.scores.pronunciation + session.scores.fluency) / 4
                );
                const sessionId = session.id || `legacy-${index}`;
                return (
                  <li key={sessionId} className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-t border-ink-700 py-3">
                    <div className="min-w-0">
                      <p className="text-sm truncate">{session.world}</p>
                      <p className="text-xs text-muted mt-1">{session.date}</p>
                    </div>
                    <span className="font-display text-xl text-teal" aria-label={`Nilai rata-rata ${avg}`}>
                      {avg}
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteSession(sessionId)}
                      className="min-w-11 min-h-11 grid place-items-center text-muted hover:text-flag hover:bg-flag/10 rounded-sm"
                      aria-label={`Hapus sesi ${session.world}`}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <h2 className="font-display text-3xl">Pola yang perlu dilatih</h2>
          {topMistakes.length === 0 ? (
            <p className="border-t border-ink-700 mt-4 pt-4 text-sm text-muted">
              Belum ada pola kesalahan tercatat. Selesaikan sesi untuk melihat catatan di sini.
            </p>
          ) : (
            <ul className="mt-4">
              {topMistakes.map(([tag, count]) => (
                <li key={tag} className="border-t border-ink-700 py-3">
                  <div className="flex justify-between gap-4 text-sm">
                    <span>{mistakeTags[tag]?.label ?? tag}</span>
                    <span className="text-muted text-xs shrink-0">{count} sesi</span>
                  </div>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{mistakeTags[tag]?.detail}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
