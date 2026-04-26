<div align="left">
  <a href="https://github.com/nugrahalabib/VidBee-AgentBuff">
    <img src="apps/desktop/build/icon.png" alt="Logo" width="80" height="80">
  </a>

  <h3>VidBee AgentBuff</h3>
  <p>
    <strong>Aplikasi gratis untuk download video & audio dari ribuan situs sosmed favoritmu — YouTube, TikTok, Instagram, Twitter, Facebook, dan lainnya.</strong>
  </p>
</div>

> 🇮🇩 **Buat siapa aja, bukan cuma developer.** Kalau kamu cuma mau download video TikTok atau YouTube tanpa ribet — langsung lompat ke section [Cara Pakai Cepat](#-cara-pakai-cepat-untuk-pengguna-biasa) di bawah.
>
> Buat developer/yang mau ngembangin sendiri — section setup teknis ada di bawahnya.

---

## 🤔 Apa Itu VidBee AgentBuff?

VidBee AgentBuff adalah aplikasi **video downloader gratis & open-source** yang bisa kamu pakai buat:

- 🎬 Download video dari **1000+ website** (YouTube, TikTok, Instagram, Twitter/X, Facebook, Bilibili, Twitch, dll)
- 🎵 Ambil audio aja (jadi MP3) dari video apapun
- 📺 Download playlist YouTube sekaligus
- 📡 **Auto-download** video baru dari channel favoritmu (RSS subscription) — set sekali, lupakan
- 💾 Semua tersimpan di komputer kamu — **bukan di cloud**, **bukan di server orang lain**
- 🌍 UI tersedia dalam **14 bahasa** termasuk Bahasa Indonesia

### Beda Sama Tools Online Sebelah?

| Hal | Tools Online (savefrom dll) | VidBee AgentBuff |
|---|---|---|
| Iklan & popup | Banyak banget 😩 | Tidak ada sama sekali ✨ |
| Limit ukuran/kualitas | Sering dibatasi 720p | Sampai **4K / 8K** kalau ada |
| Privasi | Server tahu apa yang kamu download | 100% di komputer kamu sendiri |
| Bayar/subscribe | Sering paksa premium | **Gratis selamanya** |
| Banyak video sekaligus | Manual satu-satu | Bisa antrian otomatis |
| Auto-download channel baru | Tidak ada | ✅ Pakai RSS |

---

## ✨ Fitur Utama

### 🌍 Download Dari Hampir Semua Website
Tinggal **copy-paste link** video, app langsung deteksi dan download. Support lebih dari 1000 situs.

### 🎨 Tampilan Modern & Mudah
Sekali klik untuk pause/lanjutin/coba lagi. Progress download keliatan real-time. Bisa antri banyak video sekaligus tanpa bingung.

### 📡 Auto-Download Channel Favorit (RSS)
Subscribe ke channel YouTube atau creator TikTok. Setiap kali mereka upload video baru, **VidBee otomatis download** ke komputer kamu — tanpa perlu kamu buka app-nya.

Cocok buat kamu yang:
- Suka nge-archive video belajar
- Punya channel favorit yang takut suatu saat dihapus
- Sering nonton offline pas ngetrip / ga ada sinyal

### 🔒 Privasi Total
- Tidak ada akun yang harus dibuat
- Tidak ada data yang dikirim ke server VidBee
- Video langsung download dari sumber asli ke laptop/HP kamu

---

## 🚀 Cara Pakai Cepat (Untuk Pengguna Biasa)

### 1️⃣ Download Aplikasinya
Pilih sesuai sistem operasi kamu di halaman [Releases](https://github.com/nugrahalabib/VidBee-AgentBuff/releases):

- 🪟 **Windows**: file `.exe` (installer)
- 🍎 **macOS**: file `.dmg`
- 🐧 **Linux**: file `.AppImage`

### 2️⃣ Install & Buka
Double-click file installer-nya, ikutin wizard biasa kayak install aplikasi lain.

### 3️⃣ Mulai Download
1. Buka aplikasi VidBee
2. Copy link video (misal dari YouTube atau TikTok)
3. Paste di kolom URL di atas
4. Pilih kualitas (1080p / 720p / Audio MP3 / dll)
5. Klik **Download**
6. Selesai! File ada di folder Downloads (bisa diubah di Settings)

### 💡 Tips
- **Mau download playlist YouTube?** Paste link playlist-nya, app akan tanya mau download semua atau pilih video tertentu
- **Mau ambil audio aja (jadi MP3)?** Pilih format `Audio Only` waktu download
- **Mau hemat ruang?** Atur kualitas default di Settings (720p biasanya cukup buat kebanyakan video)
- **Auto-download channel?** Buka tab Subscriptions → Add RSS → masukin URL channel YouTube/feed creator

---

## 🛠️ Buat Developer / Yang Mau Ngembangin Sendiri

> Section ini buat kamu yang ngerti coding dan mau modify VidBee atau jalankan sebagai web app sendiri.

### Tech Stack

- **Bahasa**: TypeScript (semua layer)
- **Desktop**: Electron 38 + React 19 + Tailwind 4 + shadcn/ui
- **Backend Web**: Fastify + oRPC + SSE
- **Frontend Web**: TanStack Start (React 19, file-based routing)
- **Engine Download**: yt-dlp (CLI Python) — yang sebenarnya melakukan reverse-engineering ke setiap website
- **Media Processing**: FFmpeg
- **Database**: better-sqlite3 + Drizzle ORM
- **Monorepo**: pnpm workspaces

📚 **Dokumentasi lengkap arsitektur**: lihat [`claude.md`](claude.md) di root repo — berisi semua detail file-level, struktur folder, alur kerja, dan jebakan umum.

### Prerequisite (Sebelum Setup)

| Tool | Versi | Catatan |
|---|---|---|
| **Node.js** | 24.x | Download di [nodejs.org](https://nodejs.org) |
| **pnpm** | 10.24+ | `npm install -g pnpm` |
| **Git** | latest | [git-scm.com](https://git-scm.com) |
| **yt-dlp** | latest | Lihat di bawah |
| **FFmpeg** | latest | Lihat di bawah |

### Install yt-dlp & FFmpeg

**Windows (rekomendasi pakai winget):**
```bash
winget install yt-dlp.yt-dlp
winget install Gyan.FFmpeg
```

**macOS (pakai Homebrew):**
```bash
brew install yt-dlp ffmpeg
```

**Linux:**
```bash
# Debian/Ubuntu
sudo apt install yt-dlp ffmpeg

# Arch
sudo pacman -S yt-dlp ffmpeg
```

### Clone & Install

```bash
git clone https://github.com/nugrahalabib/VidBee-AgentBuff.git
cd VidBee-AgentBuff
pnpm install
```

### Mode Development

#### Desktop App (Produk Utama)
```bash
pnpm dev
```
Aplikasi Electron akan terbuka otomatis.

#### Web Mode (API + Web bersamaan)
```bash
pnpm start:web
```
Lalu buka:
- 🌐 Web UI: **http://localhost:1707**
- 🔌 API: **http://localhost:1708**

> ⚠️ **Note**: Kalau pas dijalankan API gagal dengan error `yt-dlp binary not found`, set environment variable `YTDLP_PATH` dan `FFMPEG_PATH` ke lokasi binary kamu. Lihat detail di [`claude.md`](claude.md) section 9.

#### Lainnya
```bash
pnpm dev:docs        # Dokumentasi (Next.js + Fumadocs)
pnpm dev:extension   # Browser extension (Chrome/Firefox)
```

### Build Production

```bash
pnpm build:win       # Windows installer
pnpm build:mac       # macOS DMG
pnpm build:linux     # Linux AppImage
pnpm build:web       # Web app build
pnpm build:extension # Browser extension
```

### Self-Host Web App (Docker)

```bash
docker compose up -d --build
```

Lalu akses **http://localhost:1707** dari browser kamu (atau dari device lain di jaringan yang sama).

### Code Quality

```bash
pnpm run check       # TypeScript check + lint
pnpm run check:i18n  # Cek translation lengkap di 14 bahasa
pnpm run fix         # Auto-fix lint issues
```

---

## 📂 Struktur Project (Singkat)

```
VidBee-AgentBuff/
├── apps/
│   ├── desktop/    ← Electron app (produk utama)
│   ├── api/        ← Backend Fastify (untuk web)
│   ├── web/        ← Web client (TanStack Start)
│   ├── docs/       ← Dokumentasi (Next.js)
│   └── extension/  ← Browser extension
├── packages/
│   ├── downloader-core/  ← Logic download (shared)
│   ├── db/               ← Schema database
│   ├── i18n/             ← 14 bahasa (termasuk Indonesia)
│   └── ui/               ← Komponen UI (shared)
├── README.md       ← File yang sedang kamu baca
├── README.en.md    ← Versi bahasa Inggris (original upstream)
├── claude.md       ← Dokumentasi teknis lengkap untuk AI assistant
└── LICENSE         ← MIT License
```

---

## 🌐 Website yang Didukung

VidBee mendukung **1000+ situs** lewat engine yt-dlp. Beberapa yang populer:

🎥 **Video**: YouTube, TikTok, Instagram, Twitter/X, Facebook, Vimeo, Twitch, Dailymotion, Bilibili, Niconico, Reddit
🎵 **Audio/Musik**: SoundCloud, Bandcamp, Mixcloud
📺 **Streaming**: Periscope, Streamable, Vlive
📰 **News**: BBC, CNN, Reuters
🎓 **Edukasi**: Coursera, Khan Academy, TED

Daftar lengkap: [https://vidbee.org/supported-sites/](https://vidbee.org/supported-sites/)

---

## ❓ FAQ

### Apakah VidBee aman?
**Iya.** Open-source 100%, kode bisa kamu lihat sendiri. Tidak ada akun, tidak kirim data, tidak install bloatware. Semua download langsung dari server video aslinya ke komputer kamu.

### Apakah download video melanggar hukum?
Download video buat **konsumsi pribadi** dari konten yang **publik** umumnya OK di banyak negara — termasuk Indonesia. Tapi:
- ❌ Jangan re-upload tanpa izin pemilik
- ❌ Jangan komersialisasi konten orang lain
- ❌ Hormati hak cipta

Kamu bertanggung jawab atas penggunaan tool ini.

### Bisa download video DRM kayak Netflix/Disney+?
**Tidak.** Konten dengan DRM (Widevine/PlayReady) di luar kemampuan yt-dlp dan VidBee. Tools ini hanya buat konten publik.

### Kenapa download saya gagal/error?
Beberapa kemungkinan:
1. URL tidak valid atau video sudah dihapus
2. Video private/butuh login → lihat fitur "Cookies" di Settings
3. yt-dlp perlu di-update (situs target mungkin ubah API mereka) → tunggu update terbaru
4. Geo-blocked di negara kamu → coba pakai VPN

### Apakah pakai AI?
**Tidak.** VidBee tidak panggil LLM/AI sama sekali. Semua "magic"-nya berasal dari yt-dlp (open-source CLI) dan FFmpeg.

### Bisa di-customize warna/UI-nya?
Bisa banget — repo ini open-source. Edit `packages/ui/src/theme.css` untuk ubah warna, atau modify komponen di `packages/ui/src/components/`.

---

## 🤝 Kontribusi

Repo ini **fork** dari [nexmoe/VidBee](https://github.com/nexmoe/VidBee) (project asli) dengan customisasi:
- 🇮🇩 Localized README untuk pengguna Indonesia
- 🔧 Custom port (1707 web, 1708 API) supaya tidak bentrok dengan service lain
- 🎯 Dimaintain oleh [@nugrahalabib](https://github.com/nugrahalabib) untuk roadmap pengembangan AgentBuff

Mau berkontribusi? Welcome banget!

1. Fork repo ini
2. Buat branch fitur: `git checkout -b feat/fitur-keren`
3. Commit: `git commit -m "feat: tambah fitur keren"` (pakai [Conventional Commits](https://www.conventionalcommits.org/))
4. Push & buka Pull Request

Sebelum PR, jalankan dulu:
```bash
pnpm run check
pnpm run check:i18n
```

---

## 📄 Lisensi

Project ini dirilis di bawah **MIT License**. Lihat file [`LICENSE`](LICENSE) untuk detail lengkap.

**Copyright:**
- © 2025 VidBee (project asli — [nexmoe](https://github.com/nexmoe))
- © 2026 Nugraha Labib Mujaddid (fork & kustomisasi VidBee AgentBuff)

Sesuai MIT License, kamu **boleh** memakai, modify, dan distribusikan ulang — termasuk untuk komersial. Yang penting tetap include attribution di file LICENSE.

---

## 🙏 Terima Kasih

Project ini berdiri di bahu raksasa-raksasa berikut:

- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** — Engine download legendaris yang mengerti 1000+ website
- **[FFmpeg](https://ffmpeg.org/)** — Toolkit multimedia universal
- **[Electron](https://www.electronjs.org/)** — Framework cross-platform desktop
- **[React](https://react.dev/)** — UI library
- **[TanStack Start](https://tanstack.com/start)** — Full-stack React framework
- **[Vite](https://vitejs.dev/)** — Build tool tercepat
- **[Tailwind CSS](https://tailwindcss.com/)** — Utility-first CSS
- **[shadcn/ui](https://ui.shadcn.com/)** — Komponen UI yang elegant
- **[nexmoe](https://github.com/nexmoe)** — Author asli VidBee

---

<div align="center">

**Kalau kamu suka project ini, jangan lupa kasih ⭐ di GitHub!**

Made with ❤️ in Indonesia

</div>
