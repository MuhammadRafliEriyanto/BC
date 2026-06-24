const fs = require('fs');
const path = require('path');
const dir = 'D:/Skripsi/Next Js/bimbel-new/src/components/dashboard-guru/detail-kelas';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace common orange classes with slate/clean classes
  content = content.replace(/border-orange-100(\/80)?/g, 'border-slate-200');
  content = content.replace(/border-orange-200(\/80)?/g, 'border-slate-200');
  content = content.replace(/bg-orange-50(\/80|\/40|\/70|\/90)?/g, 'bg-slate-50');
  content = content.replace(/to-amber-50(\/60|\/70)?/g, 'to-slate-50');
  content = content.replace(/from-orange-50(\/70|\/80|\/90)?/g, 'from-slate-50');
  content = content.replace(/via-white/g, 'via-white'); // keep via-white but it will be slate -> white -> slate
  content = content.replace(/bg-gradient-to-r from-orange-[^\s]+/g, 'bg-white');
  content = content.replace(/bg-gradient-to-b from-orange-[^\s]+/g, 'bg-white');
  
  // Replace orange shadows
  content = content.replace(/shadow-\[0_22px_48px_-38px_rgba\(15,23,42,0\.24\)\]/g, 'shadow-sm');
  content = content.replace(/shadow-\[0_28px_72px_-42px_rgba\(15,23,42,0\.4\)\]/g, 'shadow-lg');
  
  // Clean up primary elements to neutral or primary dark if they were orange
  content = content.replace(/text-orange-500/g, 'text-slate-500');
  content = content.replace(/text-orange-700/g, 'text-slate-700');
  content = content.replace(/text-orange-600/g, 'text-slate-600');
  content = content.replace(/hover:border-orange-200/g, 'hover:border-slate-300');
  content = content.replace(/hover:text-orange-700/g, 'hover:text-slate-900');
  content = content.replace(/hover:bg-orange-50/g, 'hover:bg-slate-100');
  
  // Ensure the main card wrapper gets a border radius
  content = content.replace(/className="border border-slate-200 bg-white shadow-sm/g, 'className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm');
  content = content.replace(/className="border border-slate-200 bg-white transition-all duration-200"/g, 'className="overflow-hidden rounded-[24px] border border-slate-200 bg-white transition-all duration-200"');
  
  // Dialog rounding
  content = content.replace(/rounded-none/g, 'rounded-[24px]');

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Styles cleaned up.');
