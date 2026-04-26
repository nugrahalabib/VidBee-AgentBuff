# VidBee — Project Knowledge Base

> Dokumen ini adalah **single source of truth** untuk Claude (atau siapa pun) yang baru join project ini. Tujuannya: setelah membaca file ini, asisten **tidak perlu eksplorasi ulang** repo dari nol — semua konteks penting (arsitektur, alur kerja, dependency runtime, environment, konvensi, dan jebakan umum) sudah dirangkum di sini.
>
> **Lokasi project**: `c:\Users\nugra\Documents\Project\App-Skills\VidBee`
> **Upstream repo**: https://github.com/nexmoe/VidBee
> **Lisensi**: MIT
> **Bahasa konversasi user**: Indonesia (gaya santai). Komentar kode dan commit message dalam Bahasa Inggris.

---

## 1. Apa Itu VidBee?

VidBee adalah **video downloader open-source** untuk download video & audio dari **1000+ website** (YouTube, TikTok, Instagram, Twitter, Facebook, Bilibili, dll). Dibangun sebagai **monorepo pnpm workspaces** dengan beberapa target distribusi:

- **Desktop app** (Electron) — produk utama
- **Web app** (TanStack Start) — bisa self-host via Docker
- **API server** (Fastify + oRPC) — backend untuk web & ekstensi
- **Browser extension** (WXT, Chrome + Firefox) — kirim URL ke desktop app
- **Documentation site** (Next.js + Fumadocs)

### Fitur Inti
- Download dari 1000+ situs via **yt-dlp** engine
- **RSS Auto-Download**: subscribe channel YouTube/TikTok, otomatis download video baru di background
- Queue management dengan progress real-time (lewat **SSE — Server-Sent Events**)
- Cookies browser support (download video private/login-required)
- Multi-format selector (MP4 4K/1080p/720p, MP3, dll)
- Multi-language UI (14 bahasa)

### ⚠️ Klarifikasi Penting
- **TIDAK pakai LLM/AI sama sekali**. Tidak ada call ke OpenAI/Claude/Gemini.
- **TIDAK crack DRM** (Netflix, Disney+, Spotify premium) — di luar kemampuan yt-dlp.
- **TIDAK hosting/cache** video di server — download langsung dari CDN asli ke disk user.
- Semua "magic" download = yt-dlp (1500+ extractor Python yang reverse-engineer setiap website manual).

---

## 2. Tech Stack Lengkap

| Layer | Technology |
|---|---|
| **Package manager** | pnpm 10.24+ (workspace) |
| **Node version** | Node 24.x |
| **Linter / Formatter** | Biome 2.3 + **Ultracite** preset |
| **Desktop framework** | Electron 38.3 + electron-vite + electron-builder |
| **Desktop UI** | React 19 + Radix UI (25+ primitives) + Tailwind CSS 4.1 + shadcn/ui |
| **Desktop state** | Jotai (atomic state) + React Router 7.9 |
| **Desktop DB** | better-sqlite3 + Drizzle ORM (history) + electron-store (settings) |
| **Desktop telemetry** | Sentry + GlitchTip + electron-updater + electron-log |
| **API framework** | Fastify 5.7 + **oRPC** (type-safe RPC) + `@orpc/openapi` (auto-generate OpenAPI) |
| **API streaming** | SSE (Server-Sent Events) — for real-time download progress |
| **API DB** | better-sqlite3 + Drizzle ORM |
| **Web framework** | **TanStack Start 1.132** (React 19 + file-based routing + SSR) |
| **Web build** | Vite 7 |
| **Web ↔ API** | oRPC client (type-safe end-to-end) |
| **Docs framework** | Next.js 16.1 + Fumadocs (MDX) |
| **Extension framework** | WXT 0.20 (Chrome + Firefox dari satu codebase) |
| **i18n** | react-i18next 16 — 14 bahasa (EN, ZH-CN, ZH-TW, JA, KO, DE, FR, ES, IT, PT, RU, TR, AR, ID) |
| **Validation** | Zod (di semua layer) |
| **Forms** | React Hook Form + Zod resolver |
| **CI/CD** | GitHub Actions (8 workflow files) |
| **Container** | Docker (Alpine + yt-dlp + ffmpeg + Python3) |

### Runtime External Binaries (CRITICAL)
VidBee TIDAK akan jalan tanpa 2 binary external ini:

1. **yt-dlp.exe** — engine download (ini "otak" aslinya)
2. **ffmpeg.exe** — merge audio+video, convert format

Sumber binary di mesin dev ini (sudah ter-install via winget):
```
yt-dlp:  C:\Users\nugra\AppData\Local\Microsoft\WinGet\Packages\yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe\yt-dlp.exe
ffmpeg:  C:\Users\nugra\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe
```

`apps/desktop` punya `ytdlp-manager.ts` yang **auto-download** binary saat first run; tapi `apps/api` (mode web) butuh binary di PATH atau env var `YTDLP_PATH` / `FFMPEG_PATH`.

---

## 3. Struktur Monorepo

```
VidBee/
├── apps/
│   ├── desktop/        ← Electron app (produk utama)
│   ├── api/            ← Fastify backend (untuk web & extension)
│   ├── web/            ← TanStack Start client (self-host friendly)
│   ├── docs/           ← Next.js + Fumadocs (https://docs.vidbee.org)
│   └── extension/      ← WXT browser extension (Chrome/Firefox)
├── packages/
│   ├── downloader-core/  ← Wrapper yt-dlp + ffmpeg (SHARED desktop+api)
│   ├── db/               ← Drizzle schema (SHARED desktop+api)
│   ├── i18n/             ← react-i18next setup + 14 locales JSON
│   └── ui/               ← Komponen Radix + shadcn (SHARED desktop+web)
├── pnpm-workspace.yaml
├── package.json          ← root scripts (delegate ke apps)
├── biome.json            ← Ultracite preset config
├── docker-compose.yml    ← Self-host API + Web
├── README.md
├── AGENTS.md             ← Konvensi project (lihat section 8)
├── CONTRIBUTING.md
├── LICENSE (MIT)
├── .github/workflows/    ← 8 file CI/CD (lihat section 7)
└── claude.md             ← FILE INI (knowledge base)
```

### Filosofi Monorepo
- **Core logic di `packages/downloader-core`** → di-share antara `desktop/main` dan `apps/api`
- **UI components di `packages/ui`** → di-share antara `desktop/renderer` dan `apps/web`
- Hasilnya: **desktop dan web look identical** — bedanya cuma platform (Electron IPC vs HTTP+SSE)
- DB schema di `packages/db` → desktop simpan di SQLite lokal, api juga SQLite di `VIDBEE_HISTORY_STORE_PATH`

---

## 4. Detail Per-App

### 4.1 `apps/desktop` — Electron App
**Entry main process**: [apps/desktop/src/main/index.ts](apps/desktop/src/main/index.ts)
**Entry renderer**: [apps/desktop/src/renderer/src/main.tsx](apps/desktop/src/renderer/src/main.tsx)

#### Main process (`src/main/`)
- `index.ts` — App lifecycle, window management, IPC handlers, auto-update
- `tray.ts` — System tray
- `local-api.ts` — HTTP server (port lokal) untuk bridge dengan browser extension
- `settings.ts` — App preferences via electron-store
- `ipc/services/` — Handler modules (download, subscription, settings, file ops) pakai `electron-ipc-decorator`
- `lib/` (file penting):
  - `download-engine.ts` (51 KB) — orkestrator download, queue, integrasi yt-dlp + ffmpeg
  - `subscription-manager.ts` — RSS feed polling
  - `subscription-scheduler.ts` — Cron-like scheduler untuk auto-download
  - `ytdlp-manager.ts` — auto-download yt-dlp binary saat first run, manage versi
  - `ffmpeg-manager.ts` — manage ffmpeg binary, audio/video merging
  - `history-manager.ts` — operasi DB lewat Drizzle
  - `database.ts` — SQLite connection (better-sqlite3)
- `config/logger-config.ts` — electron-log setup

#### Renderer (`src/renderer/src/`)
- `pages/` — Home, Settings, About, Subscriptions
- `components/` — UI widgets, modals, sidebars
- `hooks/` — Custom React hooks (terutama untuk IPC)
- `store/` — Jotai atoms (downloads, subscriptions state)
- `lib/` — Utilities (URL parsing, format validation)

#### Scripts penting
```bash
pnpm dev               # Dev mode (electron-vite watch)
pnpm build             # Build production
pnpm build:win         # Build Windows installer
pnpm build:mac         # Build macOS
pnpm build:linux       # Build Linux AppImage
pnpm db:generate       # Drizzle generate migration
pnpm db:migrate        # Apply migration
pnpm release           # Bumpp + push tag → trigger GitHub release
```

### 4.2 `apps/api` — Fastify Backend Server
**Entry**: [apps/api/src/index.ts](apps/api/src/index.ts) → [apps/api/src/server.ts](apps/api/src/server.ts)

- **Framework**: Fastify 5.7 + oRPC + `@fastify/cors`
- **rpc-router.ts** (14.8 KB) — semua endpoint RPC: download, file ops, settings, cookies, clipboard, playlist info
- **sse.ts** — Server-Sent Events untuk streaming progress download
- **downloader.ts** — instansiasi `DownloaderCore` dari `packages/downloader-core`
- **history-store.ts** — query/insert ke SQLite via Drizzle
- **database-migrate.ts** — auto-run Drizzle migration saat boot
- **OpenAPI schema** auto-generated lewat `@orpc/openapi` (bisa dipakai client lain)
- **Security**: IP blocking (private IP detection), image proxy

#### Env Variables (api)
| Var | Default | Keterangan |
|---|---|---|
| `VIDBEE_API_HOST` | `0.0.0.0` | Bind address |
| `VIDBEE_API_PORT` | `1708` | Port server |
| `VIDBEE_DOWNLOAD_DIR` | (varies) | Folder hasil download |
| `VIDBEE_HISTORY_STORE_PATH` | (varies) | Path file SQLite |
| `YTDLP_PATH` | (auto-detect PATH) | Path explicit ke yt-dlp.exe |
| `FFMPEG_PATH` | (auto-detect PATH) | Path explicit ke ffmpeg.exe |

#### Dockerfile
Alpine + Python3 + yt-dlp + ffmpeg pre-installed — siap deploy.

### 4.3 `apps/web` — Web Client (TanStack Start)
**Entry**: [apps/web/src/router.tsx](apps/web/src/router.tsx)

- **Framework**: TanStack Start 1.132 (React 19, file-based routing, SSR-capable)
- **Routes** (`src/routes/`): `__root.tsx`, `index.tsx`, `about.tsx`, `settings.tsx`
- **API client**: oRPC client (`@orpc/client` + `@orpc/contract`) — type-safe end-to-end ke `apps/api`
- **UI**: pakai `@vidbee/ui` (shared package)
- **i18n**: pakai `@vidbee/i18n`
- **Routing state**: TanStack Router (URL state)
- **Testing**: Vitest + React Testing Library
- **Build**: Vite 7 dengan SSR

#### Env Variables (web)
| Var | Default | Keterangan |
|---|---|---|
| `VITE_API_URL` | `http://localhost:1708` | URL backend API |
| `VIDBEE_WEB_PORT` | `1707` | Port web (Docker) |

### 4.4 `apps/docs` — Documentation
- Next.js 16.1 + Fumadocs (framework docs MDX-first)
- Konten di `content/` dengan terjemahan `fr/`, `zh/`, `ru/`
- Halaman utama: index, cookies, protocol, rss, faq

### 4.5 `apps/extension` — Browser Extension (WXT)
- Build untuk Chrome & Firefox dari 1 codebase
- `background.ts` — service worker
- `popup/` — UI popup React
- Bridge ke desktop app via `http://127.0.0.1:*` (lewat `local-api.ts` di desktop main process)
- Permissions: `activeTab`, `storage`, `host_permissions: http://127.0.0.1/*`

---

## 5. Detail Per-Package (Shared)

### 5.1 `packages/downloader-core`
**Inti dari seluruh sistem** — di-share antara desktop dan api.

#### Exports utama
- **Class `DownloaderCore`** — orchestrator utama
- **Functions**:
  - `buildDownloadArgs()` — generate argumen CLI yt-dlp
  - `buildPlaylistInfoArgs()`, `buildVideoInfoArgs()`
  - `formatYtDlpCommand()` — debug-friendly command stringification
  - `resolveVideoFormatSelector()`, `resolveAudioFormatSelector()` — format picker
  - `sanitizeFilenameTemplate()` — filename safety
- **`schemas.ts`** — Zod schemas untuk input validation (single source of truth)
- **`contract.ts`** — oRPC service contract (definisi RPC endpoints)
- **`types.ts`** — TypeScript interfaces

#### Dependency utama
- `yt-dlp-wrap-plus` — Node.js wrapper untuk spawn yt-dlp process
- `zod`, `@orpc/contract`

### 5.2 `packages/db`
- **ORM**: Drizzle (SQLite dialect)
- File: `src/history.ts` — single table `downloadHistoryTable`
- Kolom (32 total):
  - **Core**: id, url, title, type, status, error
  - **Media**: duration, fileSize, thumbnail, selectedFormat
  - **Metadata**: channel, uploader, viewCount, tags, description
  - **Playlist**: playlistId, playlistTitle, playlistIndex, playlistSize
  - **Telemetry**: ytDlpCommand, ytDlpLog, origin, subscriptionId
  - **Timestamps**: downloadedAt, completedAt, sortKey
- **Type exports**: `DownloadHistoryRow` (infer select), `DownloadHistoryInsert`

### 5.3 `packages/i18n`
- **14 bahasa**: EN, ZH-CN, ZH-TW, JA, KO, DE, FR, ES, IT, PT, RU, TR, AR, **ID** (Indonesian — relevan untuk user!)
- File:
  - `src/locales/*.json` — translation files
  - `src/languages.ts` — language definitions
  - `src/init.ts` — i18next config
- **Aturan AGENTS.md**: saat tulis fitur baru, **translate dulu di `en.json`**, bahasa lain menyusul. Jangan copy-paste bahasa Inggris ke file bahasa lain — translate beneran.
- Validation: `pnpm run check:i18n` — wajib clean sebelum commit

### 5.4 `packages/ui`
- **30+ komponen** dari shadcn/ui (Radix UI primitives) + komponen app-specific
- **Primitives**: button, input, label, badge, card, separator, dropdown-menu, dialog, popover, tabs, accordion, scroll-area, dll
- **App-specific**: add-url-popover, app-sidebar, download-dialog-layout, download-filter-bar, download-empty-state, feedback-link-buttons, image-with-placeholder, item, progress
- **Libs**:
  - `cn.ts` — class merger (clsx + tailwind-merge)
  - `url-kind.ts` — deteksi tipe URL (YouTube, playlist, dll)
  - `use-add-url-interaction.ts`, `use-add-url-shortcut.ts` — hooks input URL
- **Styling**: `theme.css` (6.3 KB) — tokens warna + dark mode (next-themes), `base.css` — global resets
- **Toast**: pakai `sonner`
- **Icons**: lucide-react

---

## 6. Cara Kerja End-to-End (Flow Download)

Misal user paste `https://www.youtube.com/watch?v=dQw4w9WgXcQ`:

1. **UI input** → `add-url-popover` di `packages/ui`
2. **Web client** panggil RPC `download.start({ url, format })` via oRPC → HTTP POST ke `http://localhost:1708`
3. **Fastify** terima → handler di `apps/api/src/lib/rpc-router.ts`
4. **`DownloaderCore.start()`** dipanggil
5. **`buildDownloadArgs()`** susun argumen:
   ```bash
   yt-dlp.exe -f "bv*[height<=1080]+ba/b" --merge-output-format mp4 \
     -o "C:/Downloads/%(title)s.%(ext)s" --newline \
     --progress-template "..." https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```
6. **Spawn child process** `yt-dlp.exe` via `yt-dlp-wrap-plus`
7. **yt-dlp internal**:
   a. Match URL → load `youtube.py` extractor
   b. Fetch HTML + extract `ytInitialPlayerResponse` JSON
   c. Decode YouTube signature (eksekusi JS yang di-obfuscate)
   d. Pilih format video + audio terbaik sesuai filter
   e. Download stream langsung dari CDN Google (HTTP Range)
8. **Spawn ffmpeg** untuk merge video + audio jadi MP4 final
9. **Progress streaming**: yt-dlp print baris ke stdout → API parse → kirim ke web via SSE → progress bar update real-time
10. **Save history**: insert row ke SQLite via Drizzle (`packages/db`)

### Di Desktop (Electron)
Skip step 2-3 (no HTTP). Langsung dari renderer ke main process via **IPC** (electron-ipc-decorator), terus ke `download-engine.ts` yang juga pakai `DownloaderCore` dari `packages/downloader-core`. Logic identik, hanya transport berbeda.

---

## 7. CI/CD — `.github/workflows/`

| File | Fungsi |
|---|---|
| `ci.yml` | TypeScript check + Biome lint/format check |
| `build.yml` | Build desktop installer (Win/Mac/Linux) |
| `release.yml` | Bumpp versioning + GitHub Releases |
| `docker-publish.yml` | Build & publish image API + Web ke `ghcr.io/nexmoe/vidbee-api` & `vidbee-web` |
| `extension-*.yml` | Build & publish browser extension |
| `ytdlp-auto-release.yml` | **Auto-track update yt-dlp upstream** dan bump versi |

---

## 8. Konvensi Project (dari `AGENTS.md`)

1. **Pakai pnpm** — bukan npm/yarn
2. **Setelah selesai task: jalankan `pnpm run check`** untuk verifikasi kode
3. **i18n wajib**: tulis logic baru → translate dulu di `en.json` (file lain menyusul; jangan copy-paste English)
4. **Komentar & console.log dalam Bahasa Inggris** (meski user bicara Indonesia)
5. **KISS + YAGNI** — Keep It Simple, You Aren't Gonna Need It
6. **Conventional Commits**: `type(scope): subject`
   - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`
   - PR title juga harus ikut format ini
7. **`pnpm run check:i18n` harus clean** — kalau gagal, lengkapi field translation yang missing (di-translate beneran, bukan copy English)
8. **UI/UX web & desktop harus konsisten** — share UI dan schema sebanyak mungkin

### Ultracite (Biome preset) — Aturan Code Quality
File [.claude/CLAUDE.md](.claude/CLAUDE.md) berisi aturan lengkap. Highlight:
- Pakai `unknown` daripada `any`
- `for...of` daripada `.forEach()`
- `?.` dan `??` untuk safer access
- Template literals daripada string concatenation
- `const` default, `let` jika perlu reassign, **never `var`**
- Hapus `console.log`, `debugger`, `alert` dari production code
- Throw `Error` object, jangan throw string
- Function components > class components
- Hooks di top level only
- React 19+: pakai `ref` sebagai prop, **bukan** `forwardRef`
- Avoid spread di accumulator dalam loop
- Avoid `dangerouslySetInnerHTML`
- `target="_blank"` → wajib `rel="noopener"`

---

## 9. Cara Menjalankan (Dev)

### Prerequisite (sudah ter-install di mesin user ini)
- Node 24.x ✓
- pnpm 10.24.0 ✓
- Git ✓
- yt-dlp.exe (winget) ✓ — di `C:\Users\nugra\AppData\Local\Microsoft\WinGet\Packages\yt-dlp.yt-dlp_*\`
- ffmpeg.exe (winget Gyan.FFmpeg) ✓ — di `C:\Users\nugra\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_*\ffmpeg-8.1-full_build\bin\`

### Install dependencies
```bash
pnpm install
```
Catatan: setelah install, ada warning "Ignored build scripts: @sentry/cli, sharp, spawn-sync" — **safe to ignore** untuk dev. Aktifkan kalau mau publish (`pnpm approve-builds`).

### Mode Development

#### Desktop (Electron) — produk utama
```bash
pnpm dev
```

#### Web mode (API + Web bersamaan)
```bash
# Set env var ke binary terlebih dahulu (untuk Bash di Windows)
export PATH="/c/Users/nugra/AppData/Local/Microsoft/WinGet/Packages/yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe:/c/Users/nugra/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin:$PATH"
export YTDLP_PATH="/c/Users/nugra/AppData/Local/Microsoft/WinGet/Packages/yt-dlp.yt-dlp_Microsoft.Winget.Source_8wekyb3d8bbwe/yt-dlp.exe"
export FFMPEG_PATH="/c/Users/nugra/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe"

pnpm start:web
```
Output:
- Web: http://localhost:1707
- API: http://localhost:1708 (health endpoint: `/health`)

⚠️ **JEBAKAN**: kalau port 1707 sudah dipakai, Vite fallback ke 3001. API akan tetap di 1708.

#### Individual
```bash
pnpm dev:api          # Fastify only
pnpm dev:web          # TanStack Start only
pnpm dev:docs         # Next.js docs
pnpm dev:extension    # WXT extension
```

#### Docker (production self-host)
```bash
docker compose up -d --build
```
Image juga tersedia di `ghcr.io/nexmoe/vidbee-api:latest` & `ghcr.io/nexmoe/vidbee-web:latest`.

### Build production
```bash
pnpm build              # desktop default
pnpm build:win          # Windows installer
pnpm build:web          # Web app
pnpm build:extension    # Browser extension
pnpm zip:extension      # Zip untuk publish ke Chrome/Firefox store
```

### Code quality
```bash
pnpm run check          # type check + biome
pnpm run check:i18n     # i18n keys check
pnpm run fix            # auto-fix biome issues
pnpm dlx ultracite fix  # Ultracite full fix
```

---

## 10. Jebakan & Catatan untuk Sesi Mendatang

### Saat menjalankan `pnpm start:web`
1. **API butuh yt-dlp & ffmpeg** di PATH atau env var. Tanpa itu, API crash dengan: `Error: yt-dlp binary not found. Set YTDLP_PATH or install yt-dlp in PATH.`
2. **Port conflict**: 1707 (web) sering bentrok dengan dev server lain. Cek dulu: `Get-NetTCPConnection -LocalPort 1707 -State Listen`.
3. **Background task**: kalau jalankan `pnpm start:web` via `run_in_background`, **harus monitor stdout** untuk URL siap. Jangan asumsi langsung ready.

### Saat develop fitur baru
1. **Logic download** → edit di `packages/downloader-core` (di-share desktop+api)
2. **UI baru** → masukkan di `packages/ui` agar dipakai desktop & web sekaligus
3. **Schema DB baru** → edit `packages/db/src/history.ts` → `pnpm db:generate` → `pnpm db:migrate`
4. **String UI baru** → tambahkan di `packages/i18n/src/locales/en.json` dulu, baru bahasa lain
5. **RPC endpoint baru** → tambahkan ke `packages/downloader-core/src/contract.ts` + handler di `apps/api/src/lib/rpc-router.ts` + jika dipakai desktop, expose juga via IPC

### Native modules
`better-sqlite3`, `electron`, `esbuild` masuk `pnpm.onlyBuiltDependencies` di root `package.json` — pnpm akan rebuild native binary mereka. Kalau ada error build, kemungkinan butuh `windows-build-tools` atau Visual Studio Build Tools.

### Sentry/GlitchTip
Desktop pakai Sentry + GlitchTip untuk telemetry. `.env.example` di `apps/desktop` punya `GLITCHTIP_DSN`, `SENTRY_AUTH_TOKEN`. **Tidak wajib** untuk dev — biarkan kosong, telemetry akan di-skip.

### Build script ignored
`@sentry/cli` (upload sourcemap), `sharp` (image processing di docs), `spawn-sync` (legacy polyfill) — tiga script ini di-skip pnpm. Hanya aktifkan dengan `pnpm approve-builds` kalau benar-benar perlu (biasanya tidak untuk dev).

### `claude.md` vs `.claude/`
- `claude.md` (file ini) → user knowledge base, **tidak ter-track Git** (cek `.gitignore`)
- `.claude/` (folder) → config Claude Code dari upstream repo, ter-track Git
- Jangan campur aduk.

---

## 11. Komponen Eksternal yang Wajib Tahu

### yt-dlp
- **Bukan** library Node.js — adalah **CLI Python** yang di-spawn sebagai child process
- 1500+ extractor (modul Python per-website) — di-update terus oleh komunitas
- Extractor di-tulis dengan **reverse engineering** website target
- Bisa pakai cookies browser untuk akses video private
- Update sering — bila YouTube/TikTok ubah API, yt-dlp harus update extractor → VidBee dapat patch via `ytdlp-auto-release.yml`
- Repo: https://github.com/yt-dlp/yt-dlp

### FFmpeg
- Multimedia toolkit (C/C++)
- VidBee pakai untuk:
  - Merge video stream + audio stream → single MP4
  - Convert format (MP4 ↔ MKV ↔ WebM)
  - Extract audio (MP3, AAC, M4A)
  - Transcode jika diperlukan

### oRPC
- Type-safe RPC framework (mirip tRPC tapi framework-agnostic)
- Bisa generate OpenAPI schema otomatis
- Contract-first: definisi di `packages/downloader-core/src/contract.ts`
- Server di `apps/api`, client di `apps/web` (atau extension)

### TanStack Start
- React framework modern (mirip Next.js / Remix)
- File-based routing di `src/routes/`
- SSR-capable
- Auto-generate type-safe routes (`routeTree.gen.ts`)

### WXT
- Cross-browser extension framework (Chrome + Firefox + Edge dari 1 codebase)
- Hot reload, type-safe browser APIs
- Mirip Vite-untuk-extension

---

## 12. Ide Pengembangan (Discussed dengan User)

User tertarik mengembangkan project ini lebih jauh. Beberapa arah:

### Integrasi AI (jika ditambahkan)
- **Auto-transcript** — Whisper lokal atau OpenAI Whisper API
- **Video summary** — kirim transcript ke Claude/GPT
- **Smart tagging** — auto-tag konten (tutorial/music/vlog)
- **Auto-translate subtitle** ke bahasa Indonesia
- **Highlight extraction** — deteksi bagian penting di video panjang
- **Voice clone removal / AI dubbing**

### Fitur lain
- Re-brand jadi produk Indonesia (UI ID sudah tersedia)
- Niche product: podcast archiver, course downloader, lecture organizer
- Cloud sync untuk RSS subscription antar device
- Mobile companion app (PWA dari `apps/web`?)

⚠️ Setiap kali tambah fitur AI: **konsisten dengan AGENTS.md** — KISS + YAGNI, jangan over-engineer. Tambah toggle di settings agar user bisa disable AI features.

---

## 13. Profil User (untuk konteks)

- Nama: Nugraha Labib Mujaddid
- Email: agentbuff.id@gmail.com
- Bahasa: Indonesia (gaya santai, casual)
- Folder kerja: `c:\Users\nugra\Documents\Project\App-Skills\VidBee`
- Workspace VSCode: native extension Claude Code
- OS: Windows 11 Home Single Language (10.0.26200)
- Shell: Bash (Git Bash) + PowerShell available
- Preferensi: pakai dedicated tool (Edit, Read, Glob, Grep) bukan bash equivalents

---

## 14. Status Saat Dokumen Ini Ditulis

- ✅ Repo cloned dari https://github.com/nexmoe/VidBee
- ✅ `pnpm install` berhasil (1364 package, 4m 37s)
- ✅ yt-dlp + ffmpeg ter-install via winget
- ✅ `pnpm start:web` berhasil dijalankan (web di :1707, API di :1708)
- ✅ Belum ada perubahan kode — masih state default upstream
- ⚠️ User belum coba download video sebenarnya di UI

---

## 15. Quick Reference Commands

```bash
# Install dependencies
pnpm install

# Run web mode (need yt-dlp + ffmpeg in PATH)
pnpm start:web

# Run desktop
pnpm dev

# Code quality
pnpm run check
pnpm run check:i18n
pnpm run fix

# Database
pnpm db:generate
pnpm db:migrate

# Build
pnpm build:web
pnpm build:win

# Docker
docker compose up -d --build
docker compose down
```

---

**Last updated**: dokumen ini ditulis saat baseline state (project baru di-clone, belum ada modifikasi). Update file ini setiap kali ada perubahan arsitektur signifikan, dependency baru, atau konvensi baru yang ditetapkan.
