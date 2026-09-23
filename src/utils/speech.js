// Tipis-tipis wrapper di atas Web Speech API bawaan browser.
// Tidak ada backend/API key: semua STT (mic) dan TTS (suara AI) jalan di browser.

export function isRecognitionSupported() {
  return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isSynthesisSupported() {
  return typeof window !== "undefined" && !!window.speechSynthesis;
}

// Buat instance SpeechRecognition baru (harus dibuat ulang tiap sesi rekam).
export function createRecognizer({ onInterim, onFinal, onEnd, onError } = {}) {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;

  const recognizer = new Ctor();
  recognizer.lang = "en-US";
  recognizer.interimResults = true;
  recognizer.continuous = false;
  recognizer.maxAlternatives = 1;

  recognizer.onresult = (event) => {
    let interim = "";
    let final = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const chunk = event.results[i];
      if (chunk.isFinal) final += chunk[0].transcript;
      else interim += chunk[0].transcript;
    }
    if (interim) onInterim?.(interim);
    if (final) onFinal?.(final.trim());
  };
  recognizer.onerror = (event) => onError?.(event.error);
  recognizer.onend = () => onEnd?.();

  return recognizer;
}

let cachedVoices = [];
if (isSynthesisSupported()) {
  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickVoice() {
  if (!cachedVoices.length) cachedVoices = window.speechSynthesis.getVoices();
  return (
    cachedVoices.find((v) => v.lang === "en-US" && /female|samantha|zira|jenny/i.test(v.name)) ||
    cachedVoices.find((v) => v.lang === "en-US") ||
    cachedVoices.find((v) => v.lang?.startsWith("en")) ||
    null
  );
}

// Ucapkan satu baris dialog AI. Mengembalikan fungsi cancel().
export function speak(text, { rate = 1, onEnd } = {}) {
  if (!isSynthesisSupported() || !text) {
    onEnd?.();
    return () => {};
  }
  window.speechSynthesis.cancel(); // hentikan ucapan sebelumnya biar tidak menumpuk
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();
  window.speechSynthesis.speak(utterance);
  return () => window.speechSynthesis.cancel();
}

export function stopSpeaking() {
  if (isSynthesisSupported()) window.speechSynthesis.cancel();
}
