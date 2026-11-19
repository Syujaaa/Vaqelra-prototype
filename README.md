# Vaqelra — AI English Life Simulator (Prototype)

Prototype front-end untuk ide bisnis startup **VAQELRA**, dibangun dengan React + Vite.
Belum ada backend. Gemini API dipanggil langsung dari browser untuk membuat percakapan dan
menilai jawaban; progress belajar pengguna disimpan di `localStorage`.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Lalu buka URL yang ditampilkan (biasanya `http://localhost:5173`).

## Menyiapkan Gemini

Salin `.env.example` menjadi `.env`, lalu isi `VITE_GEMINI_API_KEY` dengan API key dari
Google AI Studio. `VITE_GEMINI_MODEL` dapat diubah untuk memilih model yang tersedia di akunmu.
Setelah mengubah `.env`, jalankan ulang server Vite.

Karena tidak ada backend, API key dimasukkan ke bundle browser dan dapat dilihat oleh pengguna
situs. Batasi penggunaan key di Google AI Studio dan gunakan pendekatan ini hanya untuk demo
lokal/prototipe. Jangan gunakan key produksi atau publikasikan deploy yang memuat key ini.

Untuk build produksi statis:

```bash
npm run build
npm run preview
```

## Struktur

- `src/data/scenarios.json` — daftar 5 dunia simulasi (Campus Life, First Job, Travel
  Adventure, Social Life, Business World).
- `src/data/mistakeTags.json` — kamus label & penjelasan tiap jenis kesalahan.
- `src/data/pricing.json` — paket FREE / PRO / INSTITUTION.
- `src/data/defaultProgress.json` — data awal level, XP, streak, dan riwayat sesi contoh.
- `src/utils/speech.js` — wrapper Web Speech API browser: `SpeechRecognition` untuk mic
  (input suara) dan `SpeechSynthesis` untuk suara AI (output), tanpa server/API key.
- `src/utils/gemini.js` — panggilan Gemini dari browser untuk menghasilkan dialog, contoh
  jawaban, dan evaluasi berdasarkan transkrip.
- `src/context/AppContext.jsx` — state global (progress, XP, riwayat sesi, frekuensi
  kesalahan), tersimpan ke `localStorage`.
- `src/pages/` — Home, Worlds (pilih dunia), Session (percakapan), Feedback (evaluasi
  per sesi), Dashboard (progress & pola kesalahan), Pricing.

## Mengganti data

Data skenario dan harga ada di `src/data/*.json`. Dialog dan evaluasi dibuat Gemini berdasarkan
konteks skenario, sehingga tidak ada naskah jawaban baku.

## Interaksi seperti panggilan suara sungguhan, bukan chat

Halaman sesi (`Session.jsx`) sengaja tidak dibuat seperti UI chat (bubble yang menumpuk ke bawah).
Sebaliknya, tampilannya seperti panggilan suara/video call:

- Avatar partner di tengah, dengan **ring animasi** yang berdenyut saat AI berbicara atau saat
  mic sedang mendengarkan, plus indikator equalizer kecil.
- **Satu caption besar** di tengah layar yang berganti tiap giliran (bukan daftar chat yang
  menumpuk) — menampilkan baris AI saat AI bicara, lalu transkrip ucapanmu saat kamu menjawab.
- Status singkat di bawah caption: "Partner latihan sedang berbicara…", "Giliranmu, tekan mic",
  "Mendengarkan…", dsb — seperti status panggilan sungguhan.
- Progress bar berbentuk segmen di atas mewakili sampai lima giliran jawaban, plus timer durasi
  panggilan.
- Tombol besar di tengah bawah adalah **mic**: tekan sekali untuk mulai bicara, tekan lagi
  (atau diam sejenak) untuk berhenti — lalu Gemini menilai jawaban dan merespons secara dinamis.
- Transkrip lengkap tetap tersimpan dan bisa dibuka lewat tombol **"Transkrip"** di pojok atas
  (drawer yang muncul dari bawah), untuk yang tetap ingin membaca ulang secara teks — tapi ini
  bukan tampilan utama.
- Ada tombol **"Akhiri sesi"** untuk keluar dari panggilan kapan saja, seperti mengakhiri
  telepon sungguhan.

Di balik layar memakai Gemini API dan Web Speech API browser:

- **Mic (Speech-to-Text)** — `SpeechRecognition` (Chrome/Edge) menangkap ucapanmu jadi teks
  secara live, ditampilkan sebagai caption berjalan selama kamu bicara. Kalau mic tidak
  didukung/bermasalah, kontrolnya otomatis berganti ke mode ketik (ikon keyboard) tanpa
  mengubah alur "panggilan" secara keseluruhan.
- **Suara AI (Text-to-Speech)** — tiap baris AI diucapkan lewat `SpeechSynthesis`; ada tombol
  mute di pojok atas.
- **Dialog dan evaluasi** — Gemini merespons jawabanmu, memberi contoh jawaban berikutnya, dan
  menilai grammar, vocabulary, relevansi, serta fluency dari transkrip. Pronunciation tidak
  dinilai karena input suara dikonversi ke teks di browser. Transkrip dikirim langsung ke
  Gemini API.

Catatan: fitur mic butuh izin mikrofon dari browser dan hanya jalan di browser berbasis
Chromium (Chrome/Edge) karena `SpeechRecognition` belum didukung luas di browser lain.

Untuk penggunaan publik, pindahkan panggilan Gemini ke backend agar API key tidak terekspos.
