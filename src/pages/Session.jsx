import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Mic,
  Square,
  ArrowLeft,
  Volume2,
  VolumeX,
  Lightbulb,
  PhoneOff,
  History,
  X,
  Keyboard,
  Send,
} from "lucide-react";
import scenarios from "../data/scenarios.json";
import conversations from "../data/conversations.json";
import { useApp } from "../context/AppContext";
import { evaluateAnswer } from "../utils/evaluate";
import {
  createRecognizer,
  isRecognitionSupported,
  isSynthesisSupported,
  speak,
  stopSpeaking,
} from "../utils/speech";
import { PageContainer, PageTitle, Surface } from "../components/ui";

const accentText = { teal: "text-teal", amber: "text-amber", flag: "text-flag" };
const accentBg = { teal: "bg-teal", amber: "bg-amber", flag: "bg-flag" };
const accentRing = { teal: "text-teal", amber: "text-amber", flag: "text-flag" };
const accentBorder = { teal: "border-teal", amber: "border-amber", flag: "border-flag" };

const qualityLabel = {
  strong: { text: "Jawaban kuat", tone: "text-teal" },
  ok: { text: "Cukup, bisa dilengkapi", tone: "text-amber" },
  weak: { text: "Perlu diperbaiki", tone: "text-flag" },
};

function scoreFromQuality(history) {
  const weights = { strong: 92, ok: 74, weak: 52 };
  const base = { grammar: [], vocabulary: [], pronunciation: [], fluency: [] };
  history.forEach(({ quality, tag }) => {
    const v = weights[quality] ?? 70;
    base.grammar.push(tag === "tense" || tag === "grammar" ? v - 8 : v);
    base.vocabulary.push(tag === "vocabulary" || tag === "repetition" ? v - 8 : v);
    base.pronunciation.push(v - (tag === "pause" ? 6 : 0));
    base.fluency.push(tag === "pause" || tag === "short-answer" ? v - 10 : v);
  });
  const avg = (arr) => Math.max(30, Math.min(99, Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)));
  return {
    grammar: avg(base.grammar),
    vocabulary: avg(base.vocabulary),
    pronunciation: avg(base.pronunciation),
    fluency: avg(base.fluency),
  };
}

function estimateSpeakingMs(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.min(7000, Math.max(900, words * 340));
}

function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Session() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { recordSession } = useApp();

  const scenario = scenarios.find((s) => s.id === id);
  const script = scenario ? conversations[scenario.missionId] : null;

  const [phase, setPhase] = useState("briefing"); // briefing | call | ended
  const [turn, setTurn] = useState("ai"); // ai | awaiting | listening | reviewing
  const [stepIndex, setStepIndex] = useState(0);
  const [caption, setCaption] = useState(null); // {speaker, text, verdict?}
  const [liveText, setLiveText] = useState("");
  const [thread, setThread] = useState([]); // silent transcript log
  const [history, setHistory] = useState([]); // {quality, tag, text, correction}

  const [voiceOn, setVoiceOn] = useState(true);
  const [micError, setMicError] = useState("");
  const [showHints, setShowHints] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [typedMode, setTypedMode] = useState(false);
  const [typedDraft, setTypedDraft] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const recognizerRef = useRef(null);
  const finalTextRef = useRef("");
  const shouldContinueListeningRef = useRef(false);
  const fallbackTimerRef = useRef(null);
  const turnRef = useRef(turn);
  const speechSupported = isRecognitionSupported();
  const voiceSupported = isSynthesisSupported();

  const totalSteps = script?.steps.length ?? 0;
  const currentStep = script?.steps[stepIndex];
  const accent = scenario ? scenario.accent : "teal";

  // Call timer.
  useEffect(() => {
    if (phase !== "call") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Keep a ref of the current turn so async speech-recognition callbacks
  // (which fire outside React's render cycle) can read the latest value
  // without re-creating the recognizer or causing double side effects.
  useEffect(() => {
    turnRef.current = turn;
  }, [turn]);

  useEffect(() => {
    if (!showTranscript) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setShowTranscript(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [showTranscript]);

  // Cleanup mic / voice / timers on unmount.
  useEffect(() => {
    return () => {
      shouldContinueListeningRef.current = false;
      recognizerRef.current?.stop();
      stopSpeaking();
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  if (!scenario || !script) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-20 text-center">
        <p className="text-muted">Skenario tidak ditemukan.</p>
        <Link to="/worlds" className="text-teal text-sm mt-3 inline-block">
          Kembali ke daftar dunia
        </Link>
      </div>
    );
  }

  function goToAiLine(text) {
    setCaption({ speaker: "ai", text });
    setTurn("ai");
    setThread((t) => [...t, { from: "ai", text }]);
    setTypedMode(!speechSupported);
    setTypedDraft("");

    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);

    if (voiceOn && voiceSupported) {
      speak(text, {
        rate: 0.98,
        onEnd: () => setTurn((t) => (t === "ai" ? "awaiting" : t)),
      });
    } else {
      fallbackTimerRef.current = setTimeout(() => {
        setTurn((t) => (t === "ai" ? "awaiting" : t));
      }, estimateSpeakingMs(text));
    }
  }

  function stopAiSpeech() {
    stopSpeaking();
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    setTurn((currentTurn) => (currentTurn === "ai" ? "awaiting" : currentTurn));
  }

  function startSession() {
    setPhase("call");
    setElapsed(0);
    goToAiLine(script.opening);
  }

  function finalizeAnswer(rawText) {
    const text = rawText.trim();
    if (!text) {
      setTurn("awaiting");
      setMicError("Tidak terdengar suaramu. Coba tekan mic lagi dan bicara lebih jelas.");
      return;
    }
    setMicError("");
    const evalResult = evaluateAnswer(text, currentStep.options);
    const correction = evalResult.quality === "strong"
      ? "Jawabanmu sudah jelas dan natural."
      : currentStep.options.find((option) => option.quality === "strong")?.text;

    setCaption({ speaker: "user", text, verdict: evalResult.quality });
    setThread((t) => [...t, { from: "user", text, verdict: evalResult.quality }]);
    setHistory((h) => [
      ...h,
      { quality: evalResult.quality, tag: evalResult.tag, text, correction },
    ]);
    setTurn("reviewing");
    setTypedMode(false);
    setTypedDraft("");

    const nextAiLine = currentStep.aiReply;
    const nextIndex = stepIndex + 1;

    setTimeout(() => {
      setStepIndex(nextIndex);
      if (nextIndex >= totalSteps || !nextAiLine) {
        stopSpeaking();
        setPhase("ended");
      } else {
        goToAiLine(nextAiLine);
      }
    }, 1500);
  }

  function beginListening() {
    if (turn !== "awaiting") return;
    setMicError("");
    stopSpeaking();
    finalTextRef.current = "";
    setLiveText("");
    shouldContinueListeningRef.current = true;

    const recognizer = createRecognizer({
      onInterim: (text) => setLiveText(`${finalTextRef.current} ${text}`.trim()),
      onFinal: (text) => {
        finalTextRef.current = `${finalTextRef.current} ${text}`.trim();
        setLiveText(finalTextRef.current);
      },
      onEnd: () => {
        if (shouldContinueListeningRef.current && turnRef.current === "listening") {
          recognizer.start();
          return;
        }
        if (turnRef.current === "listening") finalizeAnswer(finalTextRef.current);
      },
      onError: (err) => {
        shouldContinueListeningRef.current = false;
        setTurn("awaiting");
        setMicError(
          err === "not-allowed"
            ? "Izin mikrofon ditolak. Aktifkan izin mic di browser, atau ketik jawabanmu."
            : "Mic tidak menangkap suara. Coba lagi atau ketik jawabanmu."
        );
      },
    });

    if (!recognizer) {
      setTypedMode(true);
      return;
    }
    recognizerRef.current = recognizer;
    setTurn("listening");
    recognizer.start();
  }

  function stopListening() {
    shouldContinueListeningRef.current = false;
    recognizerRef.current?.stop();
  }

  function applyHint(text) {
    setShowHints(false);
    if (turn === "listening") stopListening();
    finalizeAnswer(text);
  }

  function submitTyped() {
    if (!typedDraft.trim()) return;
    finalizeAnswer(typedDraft);
  }

  function endCallEarly() {
    shouldContinueListeningRef.current = false;
    stopSpeaking();
    recognizerRef.current?.stop();
    if (history.length === 0) {
      navigate("/worlds");
      return;
    }
    setPhase("ended");
  }

  function finishSession() {
    const scores = scoreFromQuality(history);
    const mistakes = [...new Set(history.map((h) => h.tag).filter(Boolean))];
    const corrections = history.map(({ text, quality, tag, correction }) => ({ text, quality, tag, correction }));
    recordSession({ scenarioId: scenario.id, world: scenario.world, scores, mistakes, corrections });
    navigate("/feedback", { state: { scenario, scores, mistakes, turns: history.length, corrections } });
  }

  const statusText = {
    ai: `${script.character} sedang berbicara…`,
    awaiting: "Giliranmu, tekan mic dan bicara",
    listening: "Mendengarkan… tekan lagi untuk berhenti",
    reviewing: "Menilai jawabanmu…",
  }[turn];

  return (
    <PageContainer size="narrow" className="py-8 min-h-[calc(100vh-4rem)] flex flex-col">
      {phase !== "briefing" && (
        <h1 className="sr-only">Sesi latihan bersama {script.character}</h1>
      )}
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link to="/worlds" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted hover:text-ivory">
          <ArrowLeft size={14} aria-hidden="true" /> Semua dunia
        </Link>
        {phase === "call" && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="text-xs text-muted tabular-nums">{formatClock(elapsed)}</span>
            <button
              type="button"
              onClick={() => setShowTranscript((v) => !v)}
              className="inline-flex min-h-11 items-center gap-1.5 text-xs text-muted hover:text-ivory border border-ink-700 rounded-sm px-2.5 py-1.5"
              aria-expanded={showTranscript}
            >
              <History size={13} aria-hidden="true" /> Transkrip
            </button>
            {voiceSupported && (
              <button
                type="button"
                onClick={() =>
                  turn === "ai"
                    ? stopAiSpeech()
                    : setVoiceOn((v) => !v)
                }
                className={`inline-flex min-h-11 items-center gap-1.5 text-xs border rounded-sm px-2.5 py-1.5 ${
                  turn === "ai"
                    ? "text-amber border-amber/50 hover:bg-amber/10"
                    : "text-muted border-ink-700 hover:text-ivory"
                }`}
                title={turn === "ai" ? "Klik untuk berhenti berbicara" : voiceOn ? "Nonaktifkan suara" : "Aktifkan suara"}
                aria-label={turn === "ai" ? "Hentikan suara percakapan" : voiceOn ? "Nonaktifkan suara" : "Aktifkan suara"}
              >
                {turn === "ai" ? <Square size={13} aria-hidden="true" /> : voiceOn ? <Volume2 size={13} aria-hidden="true" /> : <VolumeX size={13} aria-hidden="true" />}
                {turn === "ai" && "Klik untuk berhenti"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Briefing */}
      {phase === "briefing" && (
        <div className="flex-1 flex items-center">
          <Surface className="w-full rounded-lg p-8">
            <span className="text-xs text-teal">{scenario.difficulty} · {scenario.estMinutes} menit</span>
            <PageTitle size="compact" className="mt-2">{scenario.world}</PageTitle>
            <p className="text-muted text-sm mt-2">{scenario.location}</p>
            <p className="mt-5 leading-relaxed">{scenario.tagline}</p>

            <div className="mt-6 flex items-center gap-3 rounded-md bg-ink-950 border border-ink-800 p-4">
              <span className="w-10 h-10 rounded-full bg-teal/15 grid place-items-center text-teal shrink-0">
                {script.character.charAt(0)}
              </span>
              <div>
                <p className="text-sm">{script.character}</p>
                <p className="text-xs text-muted">{script.characterRole}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={startSession}
              className="mt-8 inline-flex min-h-11 items-center gap-2 bg-amber text-white px-5 py-3 rounded-sm text-sm font-medium hover:bg-amber-soft"
            >
              <Mic size={16} aria-hidden="true" /> Mulai percakapan suara
            </button>
            <p className="text-xs text-muted mt-3">
              {speechSupported
                ? "Jawab lewat mikrofon saat giliranmu tiba."
                : "Browser ini belum mendukung mikrofon. Kamu bisa mengetik jawaban."}
            </p>
          </Surface>
        </div>
      )}

      {/* Live call */}
      {phase === "call" && (
        <div className="flex-1 flex flex-col items-center justify-between py-6">
          {/* Progress segments */}
          <div className="w-full flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full bg-ink-700 overflow-hidden">
                <div
                  className={`h-full ${accentBg[accent]} transition-all duration-500`}
                  style={{
                    width:
                      i < stepIndex
                        ? "100%"
                        : i === stepIndex
                        ? `${{ ai: 20, awaiting: 45, listening: 70, reviewing: 100 }[turn] ?? 0}%`
                        : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Avatar with speaking / listening rings */}
          <div className="flex flex-col items-center mt-10">
            <div className="relative w-28 h-28">
              {(turn === "ai" || turn === "listening") && (
                <>
                  <span className={`call-ring ${accentRing[accent]}`} />
                  <span className={`call-ring delay-1 ${accentRing[accent]}`} />
                  <span className={`call-ring delay-2 ${accentRing[accent]}`} />
                </>
              )}
              <div
                className={`absolute inset-0 rounded-full grid place-items-center font-display text-3xl border-2 ${
                  turn === "listening" ? "border-flag text-flag" : `${accentBorder[accent]} ${accentText[accent]}`
                } bg-ink-900`}
              >
                {script.character.charAt(0)}
              </div>
            </div>
            <p className="text-sm mt-4">{script.character}</p>
            <p className="text-xs text-muted">{script.characterRole}</p>
          </div>

          {/* Equalizer */}
          <div className="flex items-end gap-1 h-6 mt-6">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                style={{ animationDelay: `${i * 0.12}s` }}
                className={`w-1.5 rounded-full ${
                  turn === "ai" ? `${accentBg[accent]} eq-bar h-6` : turn === "listening" ? "bg-flag eq-bar h-6" : "bg-ink-800 eq-bar still h-6"
                }`}
              />
            ))}
          </div>

          {/* Caption */}
          <div className="flex-1 flex items-center w-full">
            <div key={`${stepIndex}-${turn}-${caption?.text}`} className="caption-fade w-full text-center px-2">
              {turn === "listening" && liveText ? (
                <p className="font-display text-xl sm:text-2xl leading-snug text-muted italic">“{liveText}”</p>
              ) : caption ? (
                <>
                  <p className="font-display text-xl sm:text-2xl leading-snug">
                    {caption.speaker === "ai" ? caption.text : `“${caption.text}”`}
                  </p>
                  {caption.speaker === "user" && caption.verdict && (
                    <p className={`text-xs mt-2 ${qualityLabel[caption.verdict]?.tone}`}>
                      {qualityLabel[caption.verdict]?.text}
                    </p>
                  )}
                </>
              ) : null}
            </div>
          </div>

          <p className="text-xs text-muted mb-4" aria-live="polite">{statusText}</p>
          {micError && <p className="text-xs text-flag mb-3 text-center max-w-sm">{micError}</p>}

          {/* Typed fallback input */}
          {typedMode && turn === "awaiting" && (
            <div className="w-full flex items-end gap-2 mb-4">
              <div className="flex-1">
                <label htmlFor="typed-response" className="block text-xs text-muted mb-1">Jawabanmu</label>
                <input
                  id="typed-response"
                  autoFocus
                  value={typedDraft}
                  onChange={(e) => setTypedDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitTyped()}
                  placeholder="Ketik jawabanmu…"
                  className="w-full min-h-11 bg-ink-900 border border-ink-700 rounded-sm px-3 py-2.5 text-sm text-ivory placeholder:text-muted focus:border-teal"
                />
              </div>
              <button
                type="button"
                onClick={submitTyped}
                disabled={!typedDraft.trim()}
                className="w-11 h-11 rounded-sm grid place-items-center bg-teal text-white hover:bg-teal-deep disabled:bg-ink-800 disabled:text-muted"
                aria-label="Kirim jawaban"
              >
                <Send size={16} aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Hint sheet */}
          {showHints && turn === "awaiting" && (
            <div className="w-full grid gap-2 mb-4">
              {currentStep.options.map((opt, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => applyHint(opt.text)}
                  className="text-left text-sm bg-ink-900 border border-ink-700 hover:border-teal rounded-sm px-3 py-3 transition-colors"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setShowHints((v) => !v)}
              disabled={turn !== "awaiting"}
              className="w-11 h-11 rounded-sm grid place-items-center border border-ink-700 text-muted hover:text-ivory disabled:opacity-50"
              title="Contoh jawaban"
              aria-label="Tampilkan contoh jawaban"
              aria-expanded={showHints}
            >
              <Lightbulb size={16} aria-hidden="true" />
            </button>

            {!typedMode ? (
              <button
                type="button"
                onClick={turn === "listening" ? stopListening : beginListening}
                disabled={turn === "ai" || turn === "reviewing"}
                className={`w-16 h-16 rounded-full grid place-items-center transition-colors ${
                  turn === "listening"
                    ? "bg-flag text-white"
                    : "bg-amber text-white hover:bg-amber-soft disabled:bg-ink-800 disabled:text-muted"
                }`}
                aria-label={turn === "listening" ? "Berhenti merekam" : "Mulai bicara"}
              >
                {turn === "listening" ? <Square size={20} aria-hidden="true" /> : <Mic size={22} aria-hidden="true" />}
              </button>
            ) : (
              <div className="w-16 h-16 rounded-full grid place-items-center bg-ink-800 text-muted" aria-hidden="true">
                <Keyboard size={20} />
              </div>
            )}

            {speechSupported ? (
              <button
                type="button"
                onClick={() => setTypedMode((v) => !v)}
                disabled={turn !== "awaiting"}
                className="w-11 h-11 rounded-sm grid place-items-center border border-ink-700 text-muted hover:text-ivory disabled:opacity-50"
                title="Ketik alih-alih bicara"
                aria-label="Beralih ke mode mengetik"
              >
                <Keyboard size={16} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={endCallEarly}
                className="w-11 h-11 rounded-sm grid place-items-center border border-ink-700 text-flag hover:bg-flag/10"
                title="Akhiri sesi"
                aria-label="Akhiri sesi"
              >
                <PhoneOff size={16} aria-hidden="true" />
              </button>
            )}
          </div>

          {speechSupported && (
            <button
              type="button"
              onClick={endCallEarly}
              className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-xs text-muted hover:text-flag"
            >
              <PhoneOff size={12} aria-hidden="true" /> Akhiri sesi
            </button>
          )}
        </div>
      )}

      {/* Transcript drawer */}
      {phase === "call" && showTranscript && (
        <div className="fixed inset-x-0 bottom-0 z-40 max-h-[60vh] overflow-y-auto thin-scroll bg-ink-900 border-t border-ink-700 p-5" role="region" aria-label="Transkrip percakapan">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg">Transkrip percakapan</h3>
            <button type="button" onClick={() => setShowTranscript(false)} className="min-w-11 min-h-11 grid place-items-center text-muted hover:text-ivory" aria-label="Tutup transkrip">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="space-y-3">
            {thread.length === 0 && (
              <p className="text-sm text-muted">Transkrip akan muncul setelah percakapan dimulai.</p>
            )}
            {thread.map((msg, i) => (
              <div key={i} className={`text-sm ${msg.from === "user" ? "text-right" : "text-left"}`}>
                <p className="text-[11px] text-muted mb-0.5">
                  {msg.from === "user" ? "Kamu" : script.character}
                </p>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call ended */}
      {phase === "ended" && (
        <div className="flex-1 flex items-center">
          <div className="w-full border border-ink-700 bg-ink-900 p-8 text-center">
            <h2 className="font-display text-2xl">Sesi selesai!</h2>
            <p className="text-muted text-sm mt-2">
              Percakapan dengan {script.character} berlangsung {formatClock(elapsed)}. Lihat evaluasi speaking-mu.
            </p>
            <button
              onClick={finishSession}
              className="mt-6 inline-flex min-h-11 items-center gap-2 bg-amber text-white px-5 py-3 rounded-sm text-sm font-medium hover:bg-amber-soft"
            >
              Lihat evaluasi
            </button>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
