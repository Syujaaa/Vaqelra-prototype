import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { generateCustomerSupportReply } from "../utils/gemini";

const QUICK_TOPICS = [
  "Cara mulai latihan",
  "Arti nilai jawaban",
  "Data disimpan di mana",
];
const INITIAL_SUPPORT_MESSAGE =
  "Halo. Saya bisa membantu pertanyaan tentang skenario, penilaian, atau riwayat latihan Vaqelra.";

export default function CustomerSupport() {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: INITIAL_SUPPORT_MESSAGE,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastMessage, setLastMessage] = useState("");

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
      closeButtonRef.current?.focus();
    } else if (dialogRef.current?.open) {
      dialogRef.current.close();
    }
  }, [open]);

  async function sendMessage(text) {
    const cleanText = text.trim();
    if (!cleanText || loading) return;

    setMessage("");
    setError("");
    setLastMessage(cleanText);
    setLoading(true);
    setMessages((current) => [...current, { role: "user", text: cleanText }]);

    try {
      const reply = await generateCustomerSupportReply(
        cleanText,
        messages
          .slice(1)
          .map((item) => ({ role: item.role, text: item.text }))
      );
      setMessages((current) => [...current, { role: "assistant", text: reply }]);
    } catch (err) {
      setMessages((current) => current.slice(0, -1));
      setError(err instanceof Error ? err.message : "Layanan bantuan gagal dijalankan.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage(message);
  }

  function closeSupport() {
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex min-h-12 items-center gap-2 rounded-sm border border-ink-700 bg-ink-900 px-4 text-sm font-medium text-ink shadow-[0_6px_18px_rgba(41,39,32,0.16)] hover:bg-ink-800"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        Bantuan
      </button>

      <dialog
        ref={dialogRef}
        onCancel={(event) => {
          event.preventDefault();
          closeSupport();
        }}
        onClose={() => setOpen(false)}
        className="fixed inset-auto bottom-20 right-5 z-50 m-0 h-[min(620px,calc(100vh-7rem))] w-[min(380px,calc(100vw-2.5rem))] overflow-hidden rounded-md border border-ink-700 bg-ink-900 p-0 text-ink shadow-[0_18px_48px_rgba(41,39,32,0.24)] backdrop:bg-ink/30"
        aria-labelledby="support-title"
      >
        <div className="flex min-h-14 items-center justify-between border-b border-ink-800 px-4">
          <div>
            <p className="text-xs text-teal">Customer support</p>
            <h2 id="support-title" className="font-display text-xl">Bantuan Vaqelra</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeSupport}
            className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-muted hover:bg-ink-800 hover:text-ink"
            aria-label="Tutup bantuan"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex h-[calc(100%-3.5rem)] flex-col">
          <div className="thin-scroll flex-1 overflow-y-auto px-4 py-4" aria-live="polite">
            <div className="space-y-3">
              {messages.map((item, index) => (
                <div
                  key={`${item.role}-${index}`}
                  className={`max-w-[85%] rounded-md px-3 py-2 text-sm leading-relaxed ${
                    item.role === "assistant"
                      ? "border border-ink-800 bg-canvas"
                      : "ml-auto bg-teal text-white"
                  }`}
                >
                  {item.text}
                </div>
              ))}
              {loading && (
                <div className="inline-flex items-center gap-2 rounded-md border border-ink-800 bg-canvas px-3 py-2 text-sm text-muted" role="status">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-teal" aria-hidden="true" />
                  Menyiapkan jawaban
                </div>
              )}
              {error && (
                <div className="rounded-sm border border-flag/40 bg-flag-soft px-3 py-3 text-sm text-flag" role="alert">
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={() => sendMessage(lastMessage)}
                    disabled={!lastMessage}
                    className="mt-2 min-h-11 text-left font-medium underline underline-offset-4"
                  >
                    Coba kirim lagi
                  </button>
                </div>
              )}
            </div>

            {messages.length === 1 && (
              <div className="mt-4 flex flex-wrap gap-2" aria-label="Pertanyaan umum">
                {QUICK_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => sendMessage(topic)}
                    className="min-h-11 rounded-sm border border-ink-700 px-3 text-xs text-teal hover:bg-canvas"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-ink-800 p-3">
            <label htmlFor="support-message" className="text-xs font-medium text-muted">
              Tulis pertanyaan
            </label>
            <div className="mt-2 flex items-end gap-2">
              <textarea
                id="support-message"
                rows={2}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Contoh: bagaimana cara mengulang sesi?"
                className="min-h-12 max-h-28 flex-1 resize-none border border-ink-700 bg-white px-3 py-2 text-sm leading-relaxed"
              />
              <button
                type="submit"
                disabled={!message.trim() || loading}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-amber text-white hover:bg-amber-soft disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Kirim pertanyaan"
              >
                <Send className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
