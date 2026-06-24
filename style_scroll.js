const fs = require('fs');
const path = require('path');
const dir = 'D:/Skripsi/Next Js/bimbel-new/src/components/dashboard-guru/detail-kelas';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace plain overflow-x-auto border border-slate-200 with styled scrollbar
  content = content.replace(/className="overflow-x-auto border border-slate-200"/g, 'className="overflow-x-auto border border-slate-200 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"');

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Scrollbars styled.');
