import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Buat direktori jika belum ada
const createDir = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const BASE_URL = 'http://localhost:3000';

const PUBLIC_PAGES = [
  { url: '/register', name: 'register' },
  { url: '/forgot-password', name: 'forgot-password' },
  { url: '/reset-password?email=raflieriyanto810@gmail.com', name: 'reset-password' },
];

const OWNER_PAGES = [
  { url: '/dashboard-owner', name: 'dashboard-owner' },
  { url: '/dashboard-owner/cabang', name: 'cabang' },
  { url: '/dashboard-owner/admin-cabang', name: 'admin-cabang' },
  { url: '/dashboard-owner/aktivitas', name: 'aktivitas' },
  { url: '/dashboard-owner/profil', name: 'profil' },
];

const ADMIN_PAGES = [
  { url: '/dashboard-admin', name: 'dashboard-admin' },
  { url: '/dashboard-admin/siswa', name: 'siswa' },
  { url: '/dashboard-admin/guru', name: 'guru' },
  { url: '/dashboard-admin/jadwal', name: 'jadwal' },
  { url: '/dashboard-admin/pembayaran', name: 'pembayaran' },
  { url: '/dashboard-admin/profil', name: 'profil' },
];

const GURU_PAGES = [
  { url: '/dashboard-guru', name: 'dashboard-guru' },
  { url: '/dashboard-guru/jadwal', name: 'jadwal' },
  { url: '/dashboard-guru/detail-kelas?academicYear=2025/2026&kelasId=class-tch-009-adiwerna-sma-10', name: 'detail-kelas' },
  { url: '/dashboard-guru/ujian?academicYear=2025/2026', name: 'ujian' },
];

const SISWA_PAGES = [
  { url: '/dashboard-siswa', name: 'dashboard-siswa' },
  { url: '/dashboard-siswa/absensi', name: 'absensi' },
  { url: '/dashboard-siswa/nilai', name: 'nilai' },
  { url: '/dashboard-siswa/tagihan', name: 'tagihan' },
  { url: '/dashboard-siswa/materi', name: 'materi' },
  { url: '/dashboard-siswa/tugas', name: 'tugas' },
  { url: '/dashboard-siswa/kirim-tugas', name: 'kirim-tugas' },
];

const ACCOUNTS = {
  owner: { email: 'raflimhmmd621@gmail.com', password: 'password123' },
  admin: { email: 'dolphnss815@gmail.com', password: 'password123' },
  guru: { email: 'guru001@bimbel.local', password: 'password123' },
  siswa: { email: 'siswa001@bimbel.local', password: 'password123' },
};

async function login(page: any, role: keyof typeof ACCOUNTS) {
  // Listen for console messages from the page
  page.on('console', (msg: any) => {
    console.log(`[PAGE CONSOLE ${role}] ${msg.type()}: ${msg.text()}`);
  });

  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', ACCOUNTS[role].email);
  await page.fill('input[type="password"]', ACCOUNTS[role].password);
  
  await page.click('button[type="submit"]');
  
  // Tunggu redirect selesai, atau manual navigation kalau form submitnya SPA routing
  try {
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 });
  } catch (e) {
      console.log(`[LOGIN ${role}] Navigation timeout, let's wait a bit and check URL...`);
      await page.waitForTimeout(5000);
  }
  
  const url = page.url();
  console.log(`[LOGIN ${role}] Current URL: ${url}`);
  
  if (url.includes('/login')) {
      const dir = `screenshots/error`;
      createDir(dir);
      await page.screenshot({ path: `${dir}/login-failed-${role}.png`, fullPage: true });
      
      const errorMsg = await page.locator('.text-red-500, .bg-red-50, [role="alert"], .text-destructive, .text-red-600').textContent().catch(() => null);
      if (errorMsg) {
          throw new Error(`Login failed for ${role}. Message: ${errorMsg}`);
      } else {
          // Coba cari text "Email" atau "Password" buat check error form
          const text = await page.innerText('body');
          throw new Error(`Login failed for ${role}. Stuck on login page. Body: ${text.substring(0, 150)}`);
      }
  }
}

let report = {
  success: [] as string[],
  failed: [] as { url: string; reason: string }[]
};

async function handleModals(page: any) {
  // Tambahkan logika untuk menutup modal, toast, atau loading jika ada
  // Contoh:
  // await page.locator('.toast-close').click({ force: true }).catch(() => {});
  // await page.locator('.modal-close').click({ force: true }).catch(() => {});
  
  // Tunggu loading spinner hilang
  await page.waitForSelector('.loading-spinner', { state: 'hidden', timeout: 5000 }).catch(() => {});
}

async function takeScreenshot(page: any, role: string, url: string, name: string) {
  try {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
    await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Cek redirect ke login (kecuali halaman public)
    if (role !== 'public' && page.url().includes('/login')) {
      throw new Error('Redirected to login');
    }
    
    // Cek error page
    const bodyText = await page.innerText('body');
    if (bodyText.includes('404') || bodyText.includes('500') || bodyText.includes('An error occurred')) {
      throw new Error('Error page detected');
    }

    await handleModals(page);
    
    const dir = `screenshots/${role}`;
    createDir(dir);
    
    await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true });
    report.success.push(`[${role.toUpperCase()}] ${url}`);
  } catch (error: any) {
    report.failed.push({ url: `[${role.toUpperCase()}] ${url}`, reason: error.message });
  }
}

test.describe('LMS Documentation Screenshots', () => {
  // Use a longer timeout for tests that include multiple page navigations and screenshots
  test.setTimeout(120000);
  test.afterAll(() => {
    console.log('\n=== Laporan Eksekusi ===');
    console.log('Berhasil:');
    report.success.forEach(item => console.log(`- ${item}`));
    
    console.log('\nGagal:');
    report.failed.forEach(item => console.log(`- ${item.url} (${item.reason})`));
  });

  test('Public Pages', async ({ page }) => {
    for (const p of PUBLIC_PAGES) {
      await takeScreenshot(page, 'public', p.url, p.name);
    }
  });

  test('Owner Pages', async ({ page }) => {
    try {
      await login(page, 'owner');
      for (const p of OWNER_PAGES) {
        await takeScreenshot(page, 'owner', p.url, p.name);
      }
    } catch (e: any) {
      report.failed.push({ url: '[OWNER] Login', reason: e.message });
    }
  });

  test('Admin Pages', async ({ page }) => {
    try {
      await login(page, 'admin');
      for (const p of ADMIN_PAGES) {
        await takeScreenshot(page, 'admin', p.url, p.name);
      }
    } catch (e: any) {
      report.failed.push({ url: '[ADMIN] Login', reason: e.message });
    }
  });

  test('Guru Pages', async ({ page }) => {
    try {
      await login(page, 'guru');
      for (const p of GURU_PAGES) {
        await takeScreenshot(page, 'guru', p.url, p.name);
      }
    } catch (e: any) {
      report.failed.push({ url: '[GURU] Login', reason: e.message });
    }
  });

  test('Siswa Pages', async ({ page }) => {
    try {
      await login(page, 'siswa');
      for (const p of SISWA_PAGES) {
        await takeScreenshot(page, 'siswa', p.url, p.name);
      }
    } catch (e: any) {
      report.failed.push({ url: '[SISWA] Login', reason: e.message });
    }
  });
});
