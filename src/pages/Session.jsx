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
        <p className="text-ivory/70">Skenario tidak ditemukan.</p>
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
    awaiting: "Giliranmu — tekan mic dan bicara",
    listening: "Mendengarkan… tekan lagi untuk berhenti",
    reviewing: "Menganalisis jawabanmu…",
  }[turn];

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-8 min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link to="/worlds" className="inline-flex items-center gap-1.5 text-xs text-ivory/50 hover:text-ivory">
          <ArrowLeft size={14} /> Semua dunia
        </Link>
        {phase === "call" && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-ivory/40 tabular-nums">{formatClock(elapsed)}</span>
            <button
              onClick={() => setShowTranscript((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs text-ivory/50 hover:text-ivory border border-ink-800 rounded-md px-2.5 py-1.5"
            >
              <History size={13} /> Transkrip
            </button>
            {voiceSupported && (
              <button
                onClick={() =>
                  turn === "ai"
                    ? stopAiSpeech()
                    : setVoiceOn((v) => !v)
                }
                className={`inline-flex items-center gap-1.5 text-xs border rounded-md px-2.5 py-1.5 ${
                  turn === "ai"
                    ? "text-amber border-amber/50 hover:bg-amber/10"
                    : "text-ivory/50 border-ink-800 hover:text-ivory"
                }`}
                title={turn === "ai" ? "Klik untuk berhenti berbicara" : voiceOn ? "Nonaktifkan suara" : "Aktifkan suara"}
              >
                {turn === "ai" ? <Square size={13} /> : voiceOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
                {turn === "ai" && "Klik untuk berhenti"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Briefing */}
      {phase === "briefing" && (
        <div className="flex-1 flex items-center">
          <div className="w-full rounded-lg border border-ink-700 bg-ink-900 p-8">
            <span className="text-xs text-teal">{scenario.difficulty} · {scenario.estMinutes} menit</span>
            <h1 className="font-display text-3xl mt-2">{scenario.world}</h1>
            <p className="text-ivory/70 text-sm mt-2">{scenario.location}</p>
            <p className="text-ivory/75 mt-5 leading-relaxed">{scenario.tagline}</p>

            <div className="mt-6 flex items-center gap-3 rounded-md bg-ink-950 border border-ink-800 p-4">
              <span className="w-10 h-10 rounded-full bg-teal/15 grid place-items-center text-teal shrink-0">
                {script.character.charAt(0)}
              </span>
              <div>
                <p className="text-sm">{script.character}</p>
                <p className="text-xs text-ivory/50">{script.characterRole}</p>
              </div>
            </div>

            <button
              onClick={startSession}
              className="mt-8 inline-flex items-center gap-2 bg-amber text-ink-950 px-5 py-3 rounded-md text-sm font-medium hover:bg-amber-soft transition-colors"
            >
              <Mic size={16} /> Mulai percakapan suara
            </button>
            <p className="text-[11px] text-ivory/40 mt-3">
              {speechSupported
                ? "Ini panggilan suara, bukan chat — bicaralah langsung ke mikrofon saat gilliranmu tiba."
                : "Browser ini belum mendukung mic — kamu akan mengetik jawabanmu saat gilliranmu tiba."}
            </p>
          </div>
        </div>
      )}

      {/* Live call */}
      {phase === "call" && (
        <div className="flex-1 flex flex-col items-center justify-between py-6">
          {/* Progress segments */}
          <div className="w-full flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="h-1 flex-1 rounded-full bg-ink-800 overflow-hidden">
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
            <p className="text-xs text-ivory/45">{script.characterRole}</p>
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
                <p className="font-display text-xl sm:text-2xl leading-snug text-ivory/60 italic">“{liveText}”</p>
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

          <p className="text-xs text-ivory/45 mb-4">{statusText}</p>
          {micError && <p className="text-xs text-flag mb-3 text-center max-w-sm">{micError}</p>}

          {/* Typed fallback input */}
          {typedMode && turn === "awaiting" && (
            <div className="w-full flex items-center gap-2 mb-4">
              <input
                autoFocus
                value={typedDraft}
                onChange={(e) => setTypedDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitTyped()}
                placeholder="Ketik jawabanmu…"
                className="flex-1 bg-ink-950 border border-ink-800 rounded-md px-3 py-2.5 text-sm text-ivory placeholder:text-ivory/30 focus:border-teal/60"
              />
              <button
                onClick={submitTyped}
                disabled={!typedDraft.trim()}
                className="w-11 h-11 rounded-full grid place-items-center bg-teal text-ink-950 disabled:bg-ink-800 disabled:text-ivory/30"
              >
                <Send size={16} />
              </button>
            </div>
          )}

          {/* Hint sheet */}
          {showHints && turn === "awaiting" && (
            <div className="w-full grid gap-2 mb-4">
              {currentStep.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => applyHint(opt.text)}
                  className="text-left text-xs text-ivory/70 bg-ink-950 border border-ink-800 hover:border-teal/50 rounded-md px-3 py-2 transition-colors"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setShowHints((v) => !v)}
              disabled={turn !== "awaiting"}
              className="w-11 h-11 rounded-full grid place-items-center border border-ink-800 text-ivory/60 hover:text-ivory disabled:opacity-30"
              title="Contoh jawaban"
            >
              <Lightbulb size={16} />
            </button>

            {!typedMode ? (
              <button
                onClick={turn === "listening" ? stopListening : beginListening}
                disabled={turn === "ai" || turn === "reviewing"}
                className={`w-16 h-16 rounded-full grid place-items-center transition-colors ${
                  turn === "listening"
                    ? "bg-flag text-white"
                    : "bg-amber text-ink-950 hover:bg-amber-soft disabled:bg-ink-800 disabled:text-ivory/30"
                }`}
              >
                {turn === "listening" ? <Square size={20} /> : <Mic size={22} />}
              </button>
            ) : (
              <div className="w-16 h-16 rounded-full grid place-items-center bg-ink-800 text-ivory/30">
                <Keyboard size={20} />
              </div>
            )}

            {speechSupported ? (
              <button
                onClick={() => setTypedMode((v) => !v)}
                disabled={turn !== "awaiting"}
                className="w-11 h-11 rounded-full grid place-items-center border border-ink-800 text-ivory/60 hover:text-ivory disabled:opacity-30"
                title="Ketik alih-alih bicara"
              >
                <Keyboard size={16} />
              </button>
            ) : (
              <button
                onClick={endCallEarly}
                className="w-11 h-11 rounded-full grid place-items-center border border-ink-800 text-flag hover:bg-flag/10"
                title="Akhiri sesi"
              >
                <PhoneOff size={16} />
              </button>
            )}
          </div>

          {speechSupported && (
            <button
              onClick={endCallEarly}
              className="mt-5 inline-flex items-center gap-1.5 text-[11px] text-ivory/40 hover:text-flag"
            >
              <PhoneOff size={12} /> Akhiri sesi
            </button>
          )}
        </div>
      )}

      {/* Transcript drawer */}
      {phase === "call" && showTranscript && (
        <div className="fixed inset-x-0 bottom-0 z-40 max-h-[60vh] overflow-y-auto thin-scroll bg-ink-950 border-t border-ink-800 rounded-t-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg">Transkrip percakapan</h3>
            <button onClick={() => setShowTranscript(false)} className="text-ivory/50 hover:text-ivory">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-3">
            {thread.map((msg, i) => (
              <div key={i} className={`text-sm ${msg.from === "user" ? "text-right" : "text-left"}`}>
                <p className="text-[11px] text-ivory/40 mb-0.5">
                  {msg.from === "user" ? "Kamu" : script.character}
                </p>
                <p className="text-ivory/85">{msg.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Call ended */}
      {phase === "ended" && (
        <div className="flex-1 flex items-center">
          <div className="w-full rounded-lg border border-ink-700 bg-ink-900 p-8 text-center">
            <h2 className="font-display text-2xl">Sesi selesai!</h2>
            <p className="text-ivory/65 text-sm mt-2">
              Percakapan dengan {script.character} berlangsung {formatClock(elapsed)}. Lihat evaluasi speaking-mu.
            </p>
            <button
              onClick={finishSession}
              className="mt-6 inline-flex items-center gap-2 bg-amber text-ink-950 px-5 py-3 rounded-md text-sm font-medium hover:bg-amber-soft transition-colors"
            >
              Lihat evaluasi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
