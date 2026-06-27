const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const replacements = [
  [/Review Submission Tugas/g, 'Review Submission Latihan'],
  [/pengumpulan tugas/g, 'pengumpulan latihan'],
  [/Tugas Aktif/g, 'Latihan Aktif'],
  [/submission untuk tugas ini/g, 'submission untuk latihan ini'],
  [/Tambah Tugas Pertemuan/g, 'Tambah Latihan Pertemuan'],
  [/Edit Tugas Pertemuan/g, 'Edit Latihan Pertemuan'],
  [/Tambah Tugas/g, 'Tambah Latihan'],
  [/Edit Tugas/g, 'Edit Latihan'],
  [/Detail Tugas/g, 'Detail Latihan'],
  [/Upload Tugas/g, 'Kirim Jawaban Latihan'],
  [/Nilai Tugas/g, 'Nilai Latihan'],
  [/Atur tugas per pertemuan/g, 'Atur latihan per pertemuan'],
  [/Judul Tugas/g, 'Judul Latihan'],
  [/instruksi tugas,/g, 'instruksi latihan,'],
  [/Setelah tugas disimpan/g, 'Setelah latihan disimpan'],
  [/pada tugas ini sudah dinilai/g, 'pada latihan ini sudah dinilai'],
  [/Lampiran Tugas Opsional/g, 'Lampiran Latihan Opsional'],
  [/tugas disimpan/g, 'latihan disimpan'],
  [/Lampiran tugas boleh/g, 'Lampiran latihan boleh'],
  [/Simpan Tugas/g, 'Simpan Latihan'],
  [/Update Tugas/g, 'Update Latihan'],
  [/Tugas Pertemuan"/g, 'Latihan Pertemuan"'],
  [/>Tugas Pertemuan</g, '>Latihan Pertemuan<'],
  [/\} tugas/g, '} latihan'],
  [/Kelola tugas/g, 'Kelola latihan'],
  [/Hapus tugas ini/g, 'Hapus latihan ini'],
  [/Belum ada tugas/g, 'Belum ada latihan'],
  [/Tambahkan tugas baru/g, 'Tambahkan latihan baru'],
  [/"Tugas & Penilaian"/g, '"Latihan & Penilaian"'],
  [/"Tugas"/g, '"Latihan"'],
  [/"Tugas dan Penilaian"/g, '"Latihan dan Penilaian"'],
  [/mengatur tugas per pertemuan/g, 'mengatur latihan per pertemuan'],
  [/melihat nilai tugas dan/g, 'melihat nilai latihan dan'],
  [/tugas belum dinilai/g, 'latihan belum dinilai'],
  [/Tugas belum dinilai/g, 'Latihan belum dinilai'],
  [/tugas lewat deadline/g, 'latihan lewat deadline'],
  [/Tugas yang masih/g, 'Latihan yang masih'],
  [/"Tugas sudah aman"/g, '"Latihan sudah aman"'],
  [/"Tugas kelas belum bisa disimpan."/g, '"Latihan kelas belum bisa disimpan."'],
  [/"Tugas kelas belum bisa dihapus."/g, '"Latihan kelas belum bisa dihapus."'],
  [/"Tugas untuk penilaian belum dipilih."/g, '"Latihan untuk penilaian belum dipilih."'],
  [/"Nilai tugas belum bisa disimpan."/g, '"Nilai latihan belum bisa disimpan."'],
  [/"Tugas kelas tidak ditemukan."/g, '"Latihan kelas tidak ditemukan."'],
  [/"Daftar submission tugas belum bisa diambil."/g, '"Daftar submission latihan belum bisa diambil."'],
  [/"Submission tugas tidak ditemukan."/g, '"Submission latihan tidak ditemukan."'],
  [/"Detail submission tugas belum bisa diambil."/g, '"Detail submission latihan belum bisa diambil."'],
  [/lampiran tugas maksimal/g, 'lampiran latihan maksimal'],
  [/"Lengkapi judul tugas, deskripsi/g, '"Lengkapi judul latihan, deskripsi'],
  [/materi, tugas, dan penilaian tugas/g, 'materi, latihan, dan penilaian latihan'],
  [/label="Tugas Berjalan"/g, 'label="Latihan Berjalan"'],
  [/Seluruh tugas yang/g, 'Seluruh latihan yang'],
  [/Monitoring tugas kelas/g, 'Monitoring latihan kelas'],
  [/Semua tugas aman/g, 'Semua latihan aman'],
  [/Tidak ada tugas yang tertinggal/g, 'Tidak ada latihan yang tertinggal'],
  [/Semua tugas pada kelas/g, 'Semua latihan pada kelas'],
  [/tugas untuk kelas/g, 'latihan untuk kelas'],
  [/lampiran tugas/g, 'lampiran latihan'],
  [/submission tugas/g, 'submission latihan'],
  [/Submission tugas/g, 'Submission latihan'],
  [/tugas ini/g, 'latihan ini'],
  [/tugas pada kelas/g, 'latihan pada kelas'],
  [/tugas yang tertinggal/g, 'latihan yang tertinggal'],
  [/tugas per pertemuan/g, 'latihan per pertemuan'],
  [/tugas yang masih/g, 'latihan yang masih'],
  [/Seluruh tugas/g, 'Seluruh latihan'],
  [/tugas \$\{/g, 'latihan ${']
];

const files = getAllFiles('src/components/dashboard-guru');

let modifiedCount = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(([pattern, replacement]) => {
    content = content.replace(pattern, replacement);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Updated ${file}`);
  }
});
console.log(`Finished. Modified ${modifiedCount} files.`);
