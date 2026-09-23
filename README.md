# Vaqelra — AI English Life Simulator (Prototype)

Prototype front-end untuk ide bisnis startup **VAQELRA**, dibangun dengan React + Vite.
Belum ada backend — semua data (skenario, naskah percakapan, paket harga, progress default)
disimpan sebagai file JSON statis di `src/data/`. Progress belajar pengguna disimpan di
`localStorage` browser supaya terasa persisten selama demo, tanpa perlu server.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Lalu buka URL yang ditampilkan (biasanya `http://localhost:5173`).

Untuk build produksi statis:

```bash
npm run build
npm run preview
```

## Struktur

- `src/data/scenarios.json` — daftar 5 dunia simulasi (Campus Life, First Job, Travel
  Adventure, Social Life, Business World).
- `src/data/conversations.json` — naskah percakapan AI per skenario. Karena belum ada AI/voice
  API sungguhan, "berbicara" disimulasikan lewat pilihan jawaban (strong/ok/weak) yang meniru
  respons suara pengguna dan menandai kesalahan (tense, grammar, pengulangan, dll).
- `src/data/mistakeTags.json` — kamus label & penjelasan tiap jenis kesalahan.
- `src/data/pricing.json` — paket FREE / PRO / INSTITUTION.
- `src/data/defaultProgress.json` — data awal level, XP, streak, dan riwayat sesi contoh.
- `src/utils/speech.js` — wrapper Web Speech API browser: `SpeechRecognition` untuk mic
  (input suara) dan `SpeechSynthesis` untuk suara AI (output), tanpa server/API key.
- `src/utils/evaluate.js` — heuristik sederhana yang membandingkan transkrip ucapan
  pengguna dengan opsi jawaban terskrip untuk menaksir kualitas jawaban (strong/ok/weak).
- `src/context/AppContext.jsx` — state global (progress, XP, riwayat sesi, frekuensi
  kesalahan), tersimpan ke `localStorage`.
- `src/pages/` — Home, Worlds (pilih dunia), Session (percakapan), Feedback (evaluasi
  per sesi), Dashboard (progress & pola kesalahan), Pricing.

## Mengganti data

Karena ini masih prototype tanpa backend, cukup edit file-file di `src/data/*.json` untuk
menambah dunia baru, mengubah naskah percakapan, atau mengubah harga paket — tidak perlu
mengubah komponen React.

## Interaksi seperti panggilan suara sungguhan, bukan chat

Halaman sesi (`Session.jsx`) sengaja tidak dibuat seperti UI chat (bubble yang menumpuk ke bawah).
Sebaliknya, tampilannya seperti panggilan suara/video call:

- Avatar karakter di tengah, dengan **ring animasi** yang berdenyut saat AI berbicara atau saat
  mic sedang mendengarkan, plus indikator equalizer kecil.
- **Satu caption besar** di tengah layar yang berganti tiap giliran (bukan daftar chat yang
  menumpuk) — menampilkan baris AI saat AI bicara, lalu transkrip ucapanmu saat kamu menjawab.
- Status singkat di bawah caption: "Dr. Amelia sedang berbicara…", "Giliranmu — tekan mic",
  "Mendengarkan…", dsb — seperti status panggilan sungguhan.
- Progress bar berbentuk segmen di atas (mirip Instagram Stories) mewakili tiap giliran
  percakapan, plus timer durasi panggilan.
- Tombol besar di tengah bawah adalah **mic**: tekan sekali untuk mulai bicara, tekan lagi
  (atau diam sejenak) untuk berhenti — lalu AI otomatis melanjutkan ke baris berikutnya setelah
  jawabanmu dianalisis sekilas.
- Transkrip lengkap tetap tersimpan dan bisa dibuka lewat tombol **"Transkrip"** di pojok atas
  (drawer yang muncul dari bawah), untuk yang tetap ingin membaca ulang secara teks — tapi ini
  bukan tampilan utama.
- Ada tombol **"Akhiri sesi"** untuk keluar dari panggilan kapan saja, seperti mengakhiri
  telepon sungguhan.

Di balik layar tetap memakai Web Speech API browser:

- **Mic (Speech-to-Text)** — `SpeechRecognition` (Chrome/Edge) menangkap ucapanmu jadi teks
  secara live, ditampilkan sebagai caption berjalan selama kamu bicara. Kalau mic tidak
  didukung/bermasalah, kontrolnya otomatis berganti ke mode ketik (ikon keyboard) tanpa
  mengubah alur "panggilan" secara keseluruhan.
- **Suara AI (Text-to-Speech)** — tiap baris AI diucapkan lewat `SpeechSynthesis`; ada tombol
  mute di pojok atas.
- **Penilaian jawaban** — `evaluate.js` membandingkan ucapanmu dengan contoh jawaban
  strong/ok/weak di `conversations.json` untuk menaksir kualitas jawaban + tag kesalahan secara
  heuristik. Ini pendekatan kasar untuk prototipe, bukan pronunciation-scoring sungguhan.

Catatan: fitur mic butuh izin mikrofon dari browser dan hanya jalan di browser berbasis
Chromium (Chrome/Edge) karena `SpeechRecognition` belum didukung luas di browser lain.

## Menyambungkan ke AI/voice sungguhan (langkah berikutnya)

Saat siap, `conversations.json` bisa diganti dengan panggilan ke API voice/LLM sungguhan di
`Session.jsx` (mis. Web Speech API untuk mikrofon + Anthropic API untuk respons AI dinamis),
dan `AppContext.jsx` bisa disambungkan ke backend/database alih-alih `localStorage`.
