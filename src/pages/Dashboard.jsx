import { useApp } from "../context/AppContext";
import mistakeTags from "../data/mistakeTags.json";
import { Flame, Target, RotateCcw } from "lucide-react";

export default function Dashboard() {
  const { progress, resetProgress, mistakeFrequency } = useApp();

  const xpPct = Math.round((progress.xp / progress.xpToNextLevel) * 100);
  const topMistakes = Object.entries(mistakeFrequency).sort((a, b) => b[1] - a[1]);

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span className="text-teal text-xs">Progress</span>
          <h1 className="font-display text-3xl sm:text-4xl mt-2">Perjalanan belajarmu</h1>
        </div>
        <button
          onClick={resetProgress}
          className="flex items-center gap-1.5 text-xs text-ivory/50 hover:text-ivory border border-ink-800 rounded-md px-3 py-2"
        >
          <RotateCcw size={13} /> Reset data prototipe
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-10">
        <div className="rounded-lg border border-ink-800 bg-ink-900 p-6">
          <p className="text-xs text-ivory/50">Level</p>
          <p className="font-display text-3xl mt-1">
            {progress.level} <span className="text-base text-ivory/50">· {progress.levelLabel}</span>
          </p>
          <div className="h-2 rounded-full bg-ink-800 overflow-hidden mt-4">
            <div className="h-full bg-amber" style={{ width: `${xpPct}%` }} />
          </div>
          <p className="text-[11px] text-ivory/45 mt-2">{progress.xp} / {progress.xpToNextLevel} XP</p>
        </div>

        <div className="rounded-lg border border-ink-800 bg-ink-900 p-6">
          <p className="text-xs text-ivory/50 flex items-center gap-1"><Flame size={13} className="text-flag" /> Streak harian</p>
          <p className="font-display text-3xl mt-1">{progress.streakDays} hari</p>
          <p className="text-[11px] text-ivory/45 mt-2">Selesaikan minimal satu sesi tiap hari agar tetap menyala.</p>
        </div>

        <div className="rounded-lg border border-ink-800 bg-ink-900 p-6">
          <p className="text-xs text-ivory/50 flex items-center gap-1"><Target size={13} className="text-teal" /> AI Daily Mission</p>
          <p className="text-sm mt-2 leading-relaxed">{progress.dailyMission.title}</p>
          <p className="text-[11px] text-amber mt-2">{progress.dailyMission.reward}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-8 mt-14">
        <div>
          <h2 className="font-display text-xl">Riwayat sesi</h2>
          <div className="mt-4 space-y-3">
            {progress.completedSessions.length === 0 && (
              <p className="text-sm text-ivory/55">Belum ada sesi selesai. Mulai dari halaman Dunia Simulasi.</p>
            )}
            {progress.completedSessions.map((s, i) => {
              const avg = Math.round(
                (s.scores.grammar + s.scores.vocabulary + s.scores.pronunciation + s.scores.fluency) / 4
              );
              return (
                <div key={i} className="flex items-center justify-between rounded-md border border-ink-800 bg-ink-900 px-4 py-3">
                  <div>
                    <p className="text-sm">{s.world}</p>
                    <p className="text-[11px] text-ivory/45">{s.date}</p>
                  </div>
                  <span className="font-display text-lg text-teal">{avg}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl">Pola kesalahan (AI Memory)</h2>
          <div className="mt-4 space-y-3">
            {topMistakes.length === 0 && (
              <p className="text-sm text-ivory/55">Belum ada pola kesalahan tercatat.</p>
            )}
            {topMistakes.map(([tag, count]) => (
              <div key={tag} className="rounded-md border border-ink-800 bg-ink-900 px-4 py-3">
                <div className="flex justify-between text-sm">
                  <span>{mistakeTags[tag]?.label ?? tag}</span>
                  <span className="text-ivory/45 text-xs">{count}x</span>
                </div>
                <p className="text-[11px] text-ivory/50 mt-1">{mistakeTags[tag]?.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
