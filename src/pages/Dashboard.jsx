import { RotateCcw, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import mistakeTags from "../data/mistakeTags.json";
import { ActionLink, PageContainer, PageTitle, SectionTitle } from "../components/ui";

const scoreLabels = {
  grammar: "Grammar",
  vocabulary: "Vocabulary",
  relevance: "Relevansi",
  fluency: "Fluency",
  pronunciation: "Pronunciation",
};

const qualityLabels = {
  strong: "Jawaban kuat",
  ok: "Bisa dilengkapi",
  weak: "Perlu diperbaiki",
};

function SessionDetails({ session }) {
  const transcript = Array.isArray(session.transcript) ? session.transcript : [];
  const corrections = Array.isArray(session.corrections) ? session.corrections : [];
  const scores = Object.entries(session.scores || {});

  return (
    <details className="col-span-3 w-full">
      <summary className="inline-flex min-h-11 items-center text-sm text-teal underline underline-offset-4">
        Lihat riwayat lengkap
      </summary>
      <div className="mt-2 space-y-5 border-l-2 border-teal pl-4">
        <section>
          <h3 className="text-xs text-muted">Nilai sesi</h3>
          <dl className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {scores.map(([key, value]) => (
              <div key={key}>
                <dt className="text-xs text-muted">{scoreLabels[key] || key}</dt>
                <dd className="font-display text-xl">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h3 className="text-xs text-muted">Transkrip percakapan</h3>
          {transcript.length > 0 ? (
            <ol className="mt-2 space-y-3">
              {transcript.map((message, messageIndex) => (
                <li key={`${message.from}-${messageIndex}`} className="text-sm">
                  <p className="text-xs text-muted mb-1">
                    {message.from === "user" ? "Kamu" : "Partner latihan"}
                  </p>
                  <p className="break-words">{message.text}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-sm text-muted">
              Transkrip tidak tersedia untuk sesi contoh atau sesi lama ini.
            </p>
          )}
        </section>

        {corrections.length > 0 && (
          <section>
            <h3 className="text-xs text-muted">Catatan jawaban</h3>
            <ol className="mt-2 space-y-3">
              {corrections.map((item, itemIndex) => (
                <li key={`correction-${itemIndex}`} className="border-t border-ink-700 pt-3">
                  <div className="flex flex-wrap justify-between gap-2 text-xs">
                    <span className="text-muted">Jawaban {itemIndex + 1}</span>
                    <span>{qualityLabels[item.quality] || item.quality}</span>
                  </div>
                  <p className="mt-1 break-words text-sm">{item.text}</p>
                  {item.correction && (
                    <p className="mt-1 break-words text-sm text-teal">{item.correction}</p>
                  )}
                  {item.scores && (
                    <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {Object.entries(item.scores).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-xs text-muted">{scoreLabels[key] || key}</dt>
                          <dd className="text-sm">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {item.tag && mistakeTags[item.tag] && (
                    <p className="mt-1 text-xs text-muted">{mistakeTags[item.tag].detail}</p>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </details>
  );
}

export default function Dashboard() {
  const { progress, deleteSession, resetProgress, mistakeFrequency } = useApp();

  const xpPct = Math.round((progress.xp / progress.xpToNextLevel) * 100);
  const topMistakes = Object.entries(mistakeFrequency).sort((a, b) => b[1] - a[1]);

  return (
    <PageContainer className="py-12 sm:py-16">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <PageTitle>Catatan latihan</PageTitle>
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
          <SectionTitle>Riwayat sesi</SectionTitle>
          {progress.completedSessions.length === 0 ? (
            <div className="border-t border-ink-700 mt-4 pt-4">
              <p className="text-sm text-muted">Belum ada sesi tersimpan.</p>
              <ActionLink to="/worlds" variant="text">
                Pilih skenario latihan
              </ActionLink>
            </div>
          ) : (
            <ul className="mt-4">
              {progress.completedSessions.map((session, index) => {
                const values = Object.values(session.scores || {});
                const avg = values.length
                  ? Math.round(values.reduce((total, score) => total + score, 0) / values.length)
                  : 0;
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
                    <SessionDetails session={session} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <SectionTitle>Pola yang perlu dilatih</SectionTitle>
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
    </PageContainer>
  );
}
