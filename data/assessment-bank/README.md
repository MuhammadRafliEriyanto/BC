# Bank Soal Review UTS, UAS, dan Tryout

Folder ini berisi **draft soal orisinal untuk direview guru**, bukan data yang sudah dimasukkan ke database.

## Cakupan

- 61 set soal unik: 17 UTS, 17 UAS, dan 27 Tryout.
- 610 soal pilihan ganda: 10 soal per set.
- 122 paket cabang: setiap set dipetakan untuk Slawi dan Adiwerna melalui `manifest.json`.
- UTS: kelas 4, 5, 7, 8, 10, dan 11 sesuai mata pelajaran aktif di sistem.
- UAS: kelas 4, 5, 7, 8, 10, dan 11 sesuai mata pelajaran aktif di sistem.
- Tryout 1-3: kelas 6, 9, dan 12 sesuai mata pelajaran aktif di sistem.
- Mata pelajaran: Matematika, Bahasa Indonesia, Bahasa Inggris, dan IPA sesuai kombinasi kelas yang tersedia.

## Struktur

- `all-question-sets.json`: seluruh set beserta soal, opsi, kunci, dan pembahasan.
- `manifest.json`: pemetaan paket ke cabang Slawi dan Adiwerna.
- `blueprint.json`: kisi-kisi per nomor soal.
- `validation-report.json`: hasil pemeriksaan struktur, jumlah, opsi, kunci, dan distribusi kesulitan.
- `uts/` dan `tryout/`: file terpisah agar mudah direview per kelas dan pelajaran.

## Standar Penyusunan

- Pemetaan fase: Fase B (kelas 3-4), Fase C (kelas 5-6), Fase D (kelas 7-9), Fase E (kelas 10), dan Fase F (kelas 11-12).
- Distribusi tiap set: 3 mudah, 5 sedang, dan 2 sulit.
- Level kognitif tiap set mencakup C2, C3, dan C4.
- Semua bacaan, konteks, angka, dan pertanyaan disusun orisinal untuk bank soal ini.
- Soal UAS dibedakan dari soal UTS pada kombinasi kelas dan mata pelajaran yang sama.
- Soal belum boleh dipublikasikan sebelum guru memeriksa kesesuaian dengan ATP, urutan materi, istilah, kunci, serta tingkat kesulitan siswa.

## Alur Review Guru

1. Buka file kelas dan mata pelajaran yang akan diperiksa.
2. Periksa indikator, pertanyaan, empat opsi, kunci, dan pembahasan.
3. Isi `reviewerNotes` bila perlu revisi dan ubah `reviewStatus` setelah disetujui.
4. Untuk Tryout, pastikan soal tahap 1-3 sesuai progres materi di cabang.
5. Impor ke sistem hanya setelah seluruh soal pada paket berstatus disetujui.

## Catatan Penting

Bank soal ini adalah titik awal yang terstruktur, bukan pengganti validasi akademik guru. Situs rujukan pemerintah tidak dapat diverifikasi otomatis saat pembuatan, sehingga tautan dan pemetaan kompetensi perlu dicek kembali ketika guru melakukan review.

## Referensi Umum

- Portal Kurikulum Kemendikbudristek: https://kurikulum.kemdikbud.go.id/
- Referensi Capaian Pembelajaran: https://guru.kemdikbud.go.id/kurikulum/referensi-penerapan/capaian-pembelajaran/
