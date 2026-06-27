# Laporan Audit Sidang Skripsi - LMS Bina Cendekia

Dokumen ini disusun khusus sebagai bahan panduan komprehensif untuk persiapan sidang skripsi. Dokumen ini merangkum arsitektur, alur, audit fitur per *role*, serta strategi presentasi dan tanya-jawab.

---

## 1. Ringkasan Arsitektur Sistem

Aplikasi LMS Bina Cendekia dibangun menggunakan arsitektur modern terpisah (Decoupled Architecture) dengan komponen sebagai berikut:

- **Frontend (Client-Side):** 
  - Dibangun dengan **Next.js 14+** (React.js) menggunakan *App Router*.
  - *Styling* menggunakan **Tailwind CSS** dipadukan dengan komponen UI **Radix UI** dan **Shadcn**.
  - Digunakan untuk merender antarmuka pengguna, navigasi (*client-side routing*), serta manajemen form dan validasi UI.
- **Backend (Server-Side/API):**
  - Dibangun menggunakan **Node.js** dan framework **Express.js**.
  - Menggunakan arsitektur *MVC/Controller-Service-Model* untuk memisahkan *logic* bisnis.
  - Endpoint API merespons format JSON untuk dikonsumsi oleh Frontend.
- **Database:**
  - Menggunakan **MongoDB** (NoSQL) yang di-hosting di **MongoDB Atlas**.
  - Pengelolaan skema dan relasi data menggunakan ODM **Mongoose**.
- **Autentikasi & Keamanan:**
  - Menggunakan **JWT (JSON Web Token)** untuk otorisasi akses (stateless authentication).
  - Terdapat mekanisme verifikasi email dan enkripsi password menggunakan **Bcrypt**.
  - Autentikasi OAuth2 menggunakan **Google Sign-In**.
- **Third-Party Integrations:**
  - **Xendit:** Digunakan sebagai *Payment Gateway* untuk pembayaran pendaftaran atau *subscription*.
  - **Nodemailer:** Digunakan untuk mengirimkan email otomatis (OTP/verifikasi/notifikasi).

---

## 2. Alur Sistem Utama

### A. Alur Register Online & Pembayaran (Siswa)
1. Calon siswa masuk ke landing page dan memilih paket bimbel.
2. Siswa mengisi formulir **Register Online**.
3. Sistem akan membuat akun *pending* dan meneruskan data ke **Payment Gateway (Xendit)**.
4. Siswa melakukan pembayaran sesuai Virtual Account / QRIS yang muncul.
5. *Webhook* Xendit memberi sinyal ke backend bahwa pembayaran berhasil.
6. Status siswa aktif, email verifikasi dikirim, dan siswa bisa mengakses sistem.

### B. Alur Login & Role-Based Routing
1. Semua pengguna masuk lewat 1 pintu (`/login`).
2. Masukkan email dan password (atau klik Google Login).
3. Backend memverifikasi kredensial dan mengembalikan JWT beserta data `role` user.
4. Frontend menyimpan token dan secara dinamis me-redirect user:
   - Jika `role === "owner"`, arahkan ke `/dashboard-owner`.
   - Jika `role === "admin"`, arahkan ke `/dashboard-admin`.
   - Jika `role === "teacher"`, arahkan ke `/dashboard-guru`.
   - Jika `role === "student"`, arahkan ke `/dashboard-siswa`.

---

## 3. Audit Fitur per Role (Status API & Konektivitas)

Fitur-fitur utama yang telah berjalan dikelompokkan berdasarkan hak akses. Saat sidang, jika fitur dilabeli **"Partial"** atau **"Terbatas"**, sebutkan secara transparan sebagai **batasan sistem** dari skripsi Anda.

### 3.1. Dashboard Owner (Pemilik)
Fokus: Manajemen pusat, memantau keuangan dan aktivitas seluruh cabang.

| Nama Fitur | File Frontend Utama | Endpoint API (Backend) | Status | Catatan Sidang |
|---|---|---|---|---|
| **Ringkasan Keuangan** | `owner-finances.ts` | `/api/branch-incomes`, `/api/expenses` | ✅ Terkoneksi | Menampilkan profit, pengeluaran lintas cabang. |
| **Manajemen Admin Cabang** | `owner-branch-admins.ts` | `/api/admin` (via admin routes) | ✅ Terkoneksi | Bisa menambah dan mengatur admin setiap cabang. |
| **Log Aktivitas** | `owner-activities.ts` | `/api/owner/notifications` | ✅ Terkoneksi | Menampilkan histori aktivitas sistem secara global. |

### 3.2. Dashboard Admin Cabang
Fokus: Operasional cabang, menyetujui pendaftaran, mengatur kelas dan pengeluaran harian.

| Nama Fitur | File Frontend Utama | Endpoint API (Backend) | Status | Catatan Sidang |
|---|---|---|---|---|
| **Pendaftaran & Pembayaran** | `admin-payments.ts` | `/api/payments`, `/api/subscriptions` | ✅ Terkoneksi | Validasi Xendit berjalan di backend, Admin dapat memantau status tagihan. |
| **Manajemen Jadwal** | `admin-dashboard-config.ts` | `/api/schedules`, `/api/rooms` | ✅ Terkoneksi | Penjadwalan kelas dan ruangan untuk guru & siswa. |
| **Pencatatan Pengeluaran** | `admin-finances.ts` | `/api/expenses` | ✅ Terkoneksi | Pencatatan kas keluar harian operasional cabang. |

### 3.3. Dashboard Guru
Fokus: Mengajar, absensi kelas, penilaian, dan penjadwalan.

| Nama Fitur | File Frontend Utama | Endpoint API (Backend) | Status | Catatan Sidang |
|---|---|---|---|---|
| **Jadwal & Detail Kelas** | `DetailKelasGuruSection.tsx` | `/api/teacher/...` | ✅ Terkoneksi | Melihat siswa yang terdaftar di kelas yang diampunya. |
| **Absensi QR Code** | *Sub-komponen kelas* | `/api/teacher/attendance` | ✅ Terkoneksi | Guru men-generate QR Code, siswa melakukan scan. |
| **Manajemen Tryout** | `TryoutGuruSection.tsx` | `/api/teacher/exams` | ✅ Terkoneksi | Zona waktu sudah di-fix (UTC/WIB matching). Guru bisa membuat & mengedit Tryout. |
| **Input Nilai & Tugas** | `MateriFormDialog.tsx` | `/api/teacher/grades` | ✅ Terkoneksi | Pemberian tugas dan penilaian. |

### 3.4. Dashboard Siswa
Fokus: Belajar, mengerjakan ujian, melihat tagihan dan absensi.

| Nama Fitur | File Frontend Utama | Endpoint API (Backend) | Status | Catatan Sidang |
|---|---|---|---|---|
| **Scan Absensi** | `dashboard-siswa/...` | `/api/student/attendance` | ✅ Terkoneksi | Siswa memindai QR Code dari layar guru untuk absen. |
| **Ujian / Tryout** | `ActiveTryoutPageView.tsx` | `/api/student/exams/:id` | ✅ Terkoneksi | Terdapat *Anti-Cheat* (tab change detection), timer berjalan mundur. Sistem *auto-submit* berjalan. |
| **Tagihan & Profil** | `subscription.ts` | `/api/subscriptions` | ✅ Terkoneksi | Melihat sisa masa aktif langganan bimbel. |

---

## 4. Daftar File Penting (Wajib Dipelajari)

Sebelum sidang, pastikan Anda memahami isi file-file berikut jika dosen meminta "Tolong buka kodenya":

1. `backend/src/server.ts` & `backend/src/app.ts`
   * **Fungsi:** Titik masuk (entry point) backend. Tempat di mana Express.js berjalan, koneksi ke MongoDB dibuat, dan rute-rute API didefinisikan.
2. `src/lib/auth-server.ts` & `backend/src/controllers/authController.ts`
   * **Fungsi:** Jantung dari sistem login. Mengatur verifikasi JWT token, *cookie session*, dan *redirect role* pengguna ke dashboard yang tepat.
3. `src/components/dashboard-siswa/pages/ActiveTryoutPageView.tsx`
   * **Fungsi:** Tempat logika Ujian/Tryout berjalan. Jika Dosen bertanya soal *Anti-cheat*, buka file ini (cari bagian `visibilitychange` dan *blur*).
4. `backend/src/controllers/paymentController.ts`
   * **Fungsi:** Mengatur logika validasi pembayaran, terhubung dengan *webhook* Xendit.
5. `backend/src/models/StudentTryoutAttempt.ts`
   * **Fungsi:** Jika ditanya Dosen, "Bagaimana cara agar nilai siswa tidak tertukar?", buka file schema database ini. Sistem membuat ID unik (contoh: `STA-001`) untuk tiap pengerjaan.

---

## 5. Daftar Pertanyaan Sidang & Cara Menjawabnya

### Pertanyaan 1: "Kenapa Anda memisahkan Frontend (Next.js) dan Backend (Express) padahal Next.js bisa full-stack?"
**Jawaban:** "Saya menggunakan arsitektur *decoupled* agar sistem lebih *scalable* (mudah diperbesar skalanya). Dengan memisahkan API Express, backend ini bisa dengan mudah dihubungkan ke aplikasi *mobile* Android/iOS ke depannya tanpa perlu merombak Frontend Next.js yang fokus untuk web."

### Pertanyaan 2: "Bagaimana cara sistem Anda mencegah siswa mencontek saat Tryout?"
**Jawaban:** "Pada sistem *frontend* (Next.js), saya memasang *event listener* `visibilitychange` dan `blur` pada *window browser*. Jika siswa berpindah *tab* atau membuka aplikasi lain, sistem akan otomatis mendeteksi, mencatat, dan memunculkan notifikasi peringatan pelanggaran. Kami memiliki limit pelanggaran sebelum ujian ditutup otomatis."

### Pertanyaan 3: "Bagaimana sistem pembayaran Xendit Anda bekerja secara *real-time*?"
**Jawaban:** "Saya memanfaatkan fitur *Webhook* dari Xendit. Ketika siswa membayar melalui *Virtual Account* atau QRIS, server Xendit akan mengirimkan *request HTTP POST* secara otomatis ke *endpoint webhook backend* saya. Backend memvalidasi *header signature* dan langsung mengubah status `Payment` siswa menjadi `PAID` di *database* MongoDB."

### Pertanyaan 4: "Bagaimana cara sistem menghitung Nilai Tugas jika dari 24 pertemuan guru hanya memberikan 7 tugas?"
**Jawaban:** "Nilai tugas dihitung secara dinamis dan *real-time*. Di dalam fungsi `buildNilaiRows` pada *frontend*, sistem akan menjumlahkan nilai dari tugas-tugas yang *sudah dinilai*, lalu membaginya dengan total tugas yang dikerjakan tersebut (`studentGrades.length`), bukan dibagi 24 pertemuan. Dengan demikian, rata-rata tugas tetap adil dan akurat sesuai jumlah tugas yang riil diberikan guru."

### Pertanyaan 5: "Bagaimana Anda membedakan tampilan antara Owner, Admin, Guru, dan Siswa?"
**Jawaban:** "Saya menerapkan *Role-Based Access Control* (RBAC) dengan JSON Web Token (JWT). Saat *login*, backend mengirimkan token yang berisi data `role`. Middleware di frontend akan membaca `role` tersebut dan me-redirect pengguna. Jika Siswa memaksa membuka URL `/dashboard-owner`, middleware akan memblokir dan mengembalikannya ke halaman siswa."

### Pertanyaan 6: "Apa batasan dari sistem yang Anda buat ini?" (Penting untuk dijawab jujur)
**Jawaban:** "Batasan sistem saat ini adalah aplikasi belum bersifat *Progressive Web App* (PWA) penuh untuk akses *offline*, dan *anti-cheat* saat ujian masih berbasis aktivitas *browser*, sehingga belum mengunci sistem operasi secara penuh seperti *Safe Exam Browser*. Namun, fitur ini sudah cukup mencegah kecurangan pasif."

---

## 6. Narasi Presentasi Sidang (3-5 Menit)

**[Pembukaan - 30 Detik]**
"Assalamualaikum Wr. Wb. Yang terhormat Bapak/Ibu Dewan Penguji. Pada hari ini saya akan mempresentasikan hasil skripsi saya yang berjudul *[Sebutkan Judul Skripsi Anda]*. Aplikasi ini adalah sebuah *Learning Management System* (LMS) komprehensif untuk Bimbingan Belajar."

**[Latar Belakang & Masalah - 45 Detik]**
"Permasalahan utama yang melatarbelakangi sistem ini adalah manajemen operasional bimbel yang masih terpisah-pisah. Pendaftaran dan pembayaran seringkali manual, jadwal sering bentrok antar cabang, dan ujian siswa masih menggunakan kertas atau platform eksternal yang sulit dimonitor secara terpusat oleh *Owner*."

**[Solusi & Teknologi - 45 Detik]**
"Oleh karena itu, saya membangun LMS terintegrasi yang menjembatani 4 peran sekaligus: *Owner*, *Admin*, *Guru*, dan *Siswa*. Aplikasi ini dibangun menggunakan *Next.js* untuk antarmuka yang cepat, *Node.js & MongoDB* untuk *backend* yang tangguh, serta *Xendit Gateway* agar pembayaran berjalan otomatis."

**[Demo & Fitur Unggulan - 2 Menit]**
*(Sambil menampilkan layar atau mendemonstrasikan aplikasi)*
"Berikut adalah alurnya. Calon siswa mendaftar lewat web, memilih paket, dan sistem langsung menerbitkan tagihan. Setelah dibayar, siswa mendapat akses *Dashboard*.
Bagi Guru, mereka bisa melihat jadwal, melakukan absensi murid menggunakan *QR Code*, dan membuat *Tryout*. 
Fitur unggulan di sisi Siswa adalah pengerjaan *Tryout* yang dilengkapi fitur *Anti-Cheat* untuk mendeteksi perpindahan *tab*. Sementara itu, semua aktivitas dan transaksi harian dapat langsung diawasi oleh *Owner* secara *real-time* di *dashboard* utama."

**[Penutup - 30 Detik]**
"Kesimpulannya, sistem ini tidak hanya mengubah proses bisnis bimbel menjadi *paperless*, namun juga menjamin keamanan transaksi keuangan dan keaslian nilai *tryout* siswa. Demikian presentasi dari saya, atas perhatian Bapak/Ibu, saya ucapkan terima kasih."
