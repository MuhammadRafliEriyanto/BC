const fs = require('fs');

// 1. SiswaUserProfileDialog.tsx
const siswaPath = 'D:/Skripsi/Next Js/bimbel-new/src/components/dashboard-siswa/SiswaUserProfileDialog.tsx';
let siswaCode = fs.readFileSync(siswaPath, 'utf8');

// Hide TabsTrigger Lupa Password
siswaCode = siswaCode.replace(/<TabsTrigger value="forgot-password">Lupa Password<\/TabsTrigger>/g, '');

// Remove the Email input field block from Profile tab
siswaCode = siswaCode.replace(/<div>\s*<label\s+htmlFor="siswa-profile-email"[\s\S]*?<InputError message=\{profileFieldErrors\.email\} \/>\s*<\/div>/g, '');

// Also remove the entire TabsContent for forgot-password
siswaCode = siswaCode.replace(/<TabsContent value="forgot-password" className="space-y-6">[\s\S]*?<\/TabsContent>/g, '');

// Fix scrollbar on DialogContent
siswaCode = siswaCode.replace(/<DialogContent className="max-h-\[88vh\] overflow-y-auto sm:max-w-2xl">/g, '<DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl [&::-webkit-scrollbar]:hidden">');

// Update grid cols since email is removed (from sm:grid-cols-2 to sm:grid-cols-1)
siswaCode = siswaCode.replace(/<div className="grid gap-4 sm:grid-cols-2">/g, '<div className="grid gap-4 sm:grid-cols-1">');

fs.writeFileSync(siswaPath, siswaCode, 'utf8');

// 2. GuruUserProfileDialog.tsx
const guruPath = 'D:/Skripsi/Next Js/bimbel-new/src/components/dashboard-guru/components/GuruUserProfileDialog.tsx';
let guruCode = fs.readFileSync(guruPath, 'utf8');

// Fix scrollbar on DialogContent
guruCode = guruCode.replace(/<DialogContent className="max-h-\[88vh\] overflow-y-auto sm:max-w-md">/g, '<DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-md [&::-webkit-scrollbar]:hidden">');

fs.writeFileSync(guruPath, guruCode, 'utf8');

console.log('Dialogs cleaned and scroll fixed.');
