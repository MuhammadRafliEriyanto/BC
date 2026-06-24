const fs = require('fs');
const path = require('path');
const dir = 'D:/Skripsi/Next Js/bimbel-new/src/components/dashboard-guru/detail-kelas';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace shadow-sm with a nicer soft shadow and hover effect on the main wrapper
  content = content.replace(/shadow-sm transition-all duration-200/g, 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]');

  // Make table header more "alive"
  content = content.replace(/className="bg-slate-50 text-left"/g, 'className="bg-slate-50/80 text-left backdrop-blur-sm"');
  
  // Make the top bar of the table card a subtle gradient instead of solid bg
  content = content.replace(/bg-gradient-to-r from-slate-50 via-white to-slate-50/g, 'bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50');
  
  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Depth added.');
