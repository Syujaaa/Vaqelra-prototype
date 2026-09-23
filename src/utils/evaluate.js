// Evaluasi heuristik sederhana untuk prototipe: membandingkan transkrip ucapan
// pengguna dengan opsi jawaban terskrip (strong/ok/weak) untuk menaksir kualitas
// jawaban, tanpa memaksa pengguna memilih dari daftar. Ini pengganti sementara
// untuk model NLP/pronunciation-scoring sungguhan.

const FILLER_REGEX = /\b(um+|uh+|erm+|hmm+)\b/gi;

function tokenize(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

function jaccardSimilarity(a, b) {
  const setA = new Set(tokenize(a));
  const setB = new Set(tokenize(b));
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  setA.forEach((word) => {
    if (setB.has(word)) intersection += 1;
  });
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

export function evaluateAnswer(transcript, options) {
  const words = tokenize(transcript);
  const fillerCount = (transcript.match(FILLER_REGEX) || []).length;

  let bestOption = null;
  let bestScore = -1;
  options.forEach((option) => {
    const score = jaccardSimilarity(transcript, option.text);
    if (score > bestScore) {
      bestScore = score;
      bestOption = option;
    }
  });

  let quality = bestOption?.quality ?? "ok";
  let tag = bestOption?.tag;

  // Override heuristik: jawaban sangat pendek atau banyak jeda ("um", "uh")
  // diturunkan kualitasnya terlepas dari opsi mana yang paling mirip.
  if (words.length <= 2) {
    quality = "weak";
    tag = tag || "short-answer";
  } else if (fillerCount >= 2 && quality === "strong") {
    quality = "ok";
    tag = tag || "pause";
  }

  return {
    quality,
    tag,
    matchedOption: bestOption,
    wordCount: words.length,
    fillerCount,
    confidence: Math.round(bestScore * 100),
  };
}
