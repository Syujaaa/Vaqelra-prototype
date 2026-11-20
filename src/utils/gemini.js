const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();
const API_KEY_PLACEHOLDER = "your_gemini_api_key";
const MODEL = import.meta.env.VITE_GEMINI_MODEL?.trim() || "gemini-3.8-flash";
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models";
const QUALITY_VALUES = ["strong", "ok", "weak"];
const MISTAKE_TAGS = [
  "tense",
  "grammar",
  "short-answer",
  "repetition",
  "pause",
  "vocabulary",
];
const SCORE_KEYS = ["grammar", "vocabulary", "relevance", "fluency"];
const MAX_TURNS = 5;

const SYSTEM_INSTRUCTION = `You are a warm, realistic English conversation partner for an Indonesian learner.
Use the scenario to stay in character. Speak to the learner in natural English with concise replies.
Ask one relevant question at a time and keep the conversation moving. Be encouraging, not overly formal.
Return only valid JSON with this shape:
{
  "reply": "The next spoken line in English",
  "hints": ["A useful example answer in English", "Another useful example answer in English"],
  "complete": false,
  "evaluation": null
}
For an opening turn, evaluation must be null and reply should start the conversation with one question.
For a learner turn, evaluate only the latest learner answer. Return evaluation as:
{
  "quality": "strong, ok, or weak",
  "tag": "tense, grammar, short-answer, repetition, pause, vocabulary, or null",
  "correction": "A concise improvement or encouragement in Indonesian",
  "scores": {
    "grammar": 0,
    "vocabulary": 0,
    "relevance": 0,
    "fluency": 0
  }
}
Scores must be integers from 0 to 100. Judge language from the transcript only; do not claim to assess pronunciation or audio quality.
The session lasts at most ${MAX_TURNS} learner turns. On the final turn, close the conversation naturally instead of asking another question and set complete to true. After other learner turns, reply naturally to what they said and ask one relevant follow-up question unless the conversation has already reached a natural ending. Hints should contain up to two short, relevant example answers for the learner's next turn.`;

function isScore(value) {
  return Number.isInteger(value) && value >= 0 && value <= 100;
}

function parseTurn(text, isOpening) {
  let turn;
  try {
    const json = text.replace(/^```(?:json)?\s*|\s*```$/g, "");
    turn = JSON.parse(json);
  } catch {
    throw new Error("Respons tidak dapat dibaca. Coba lagi.");
  }

  if (
    !turn ||
    typeof turn.reply !== "string" ||
    !turn.reply.trim() ||
    typeof turn.complete !== "boolean" ||
    !Array.isArray(turn.hints) ||
    turn.hints.some((hint) => typeof hint !== "string")
  ) {
    throw new Error("Respons belum lengkap. Coba lagi.");
  }
  const hints = turn.hints.map((hint) => hint.trim()).filter(Boolean).slice(0, 2);

  if (isOpening) {
    return {
      reply: turn.reply.trim(),
      hints,
      complete: false,
      evaluation: null,
    };
  }

  const evaluation = turn.evaluation;
  if (
    !evaluation ||
    !QUALITY_VALUES.includes(evaluation.quality) ||
    !(evaluation.tag === null || MISTAKE_TAGS.includes(evaluation.tag)) ||
    typeof evaluation.correction !== "string" ||
    !evaluation.correction.trim() ||
    !evaluation.scores ||
    !SCORE_KEYS.every((key) => isScore(evaluation.scores[key]))
  ) {
    throw new Error("Evaluasi belum lengkap. Coba kirim jawaban lagi.");
  }

  return {
    reply: turn.reply.trim(),
    hints,
    complete: turn.complete,
    evaluation: {
      quality: evaluation.quality,
      tag: evaluation.tag,
      correction: evaluation.correction.trim(),
      scores: Object.fromEntries(SCORE_KEYS.map((key) => [key, evaluation.scores[key]])),
    },
  };
}

export function isGeminiConfigured() {
  return Boolean(API_KEY && API_KEY.toLowerCase() !== API_KEY_PLACEHOLDER);
}

export async function generateCustomerSupportReply(message, history) {
  if (!isGeminiConfigured()) {
    throw new Error("Layanan bantuan belum dikonfigurasi. Isi VITE_GEMINI_API_KEY dengan API key Gemini yang valid di file .env, lalu jalankan ulang aplikasi.");
  }

  const supportInstruction = `You are the customer support assistant for Vaqelra, an Indonesian English-practice app.
Answer only questions about Vaqelra's practice scenarios, dialogue sessions, speech and text input, evaluation scores, mistake tags, progress, browser storage, pricing, API configuration, or application troubleshooting.
Vaqelra is a local prototype. It has no backend, and session history is stored in the user's browser. Gemini generates dialogue and evaluation. Pronunciation cannot be assessed from text transcripts.
Be concise, practical, and helpful. If you do not know an app-specific answer, say that the information is not available instead of inventing it.
Respond in the same language as the user's question. Do not use markdown tables.`;

  const contents = history.map((item) => ({
    role: item.role === "assistant" ? "model" : "user",
    parts: [{ text: item.text }],
  }));
  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  const response = await fetch(
    `${API_URL}/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: supportInstruction }] },
        contents,
        generationConfig: { temperature: 0.4 },
      }),
    }
  );

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Respons layanan bantuan tidak dapat dibaca (HTTP ${response.status}).`);
  }
  if (!response.ok) {
    const guidance = response.status === 401 || response.status === 403
      ? "Periksa API key dan izinnya."
      : response.status === 429
      ? "Batas permintaan tercapai. Tunggu sebentar lalu coba lagi."
      : "Periksa konfigurasi lalu coba lagi.";
    const apiMessage = typeof payload?.error?.message === "string"
      ? `Detail Gemini: ${payload.error.message}`
      : guidance;
    throw new Error(`Layanan bantuan gagal memproses permintaan (HTTP ${response.status}). ${apiMessage}`);
  }

  const reply = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!reply) {
    throw new Error("Layanan bantuan tidak mengirim respons. Coba lagi.");
  }
  return reply;
}

export async function generateConversationTurn(scenario, thread) {
  if (!isGeminiConfigured()) {
    throw new Error("Isi VITE_GEMINI_API_KEY dengan API key Gemini yang valid di file .env, lalu jalankan ulang aplikasi.");
  }

  const isOpening = thread.length === 0;
  const contents = isOpening
    ? [{
        role: "user",
        parts: [{
          text: `Start a conversation for this scenario:\nWorld: ${scenario.world}\nLocation: ${scenario.location}\nSituation: ${scenario.tagline}\nLearner level: ${scenario.difficulty}\nPartner role: ${scenario.role}`,
        }],
      }]
    : thread.map((message) => ({
        role: message.from === "ai" ? "model" : "user",
        parts: [{ text: message.text }],
      }));

  const response = await fetch(
    `${API_URL}/${encodeURIComponent(MODEL)}:generateContent?key=${encodeURIComponent(API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents,
        generationConfig: { temperature: 0.7, responseMimeType: "application/json" },
      }),
    }
  );

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Respons layanan AI tidak dapat dibaca (HTTP ${response.status}).`);
  }
  if (!response.ok) {
    const guidance = response.status === 401 || response.status === 403
      ? "Periksa API key dan izinnya."
      : response.status === 429
      ? "Batas permintaan tercapai. Tunggu sebentar lalu coba lagi."
      : "Periksa konfigurasi lalu coba lagi.";
    throw new Error(`Layanan AI gagal memproses permintaan (HTTP ${response.status}). ${guidance}`);
  }

  const generatedText = payload.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!generatedText) {
    throw new Error("Layanan AI tidak mengirim respons. Coba lagi.");
  }

  const learnerTurns = thread.filter((message) => message.from === "user").length;
  const turn = parseTurn(generatedText, isOpening);
  return {
    ...turn,
    complete: !isOpening && learnerTurns >= MAX_TURNS ? true : turn.complete,
  };
}
