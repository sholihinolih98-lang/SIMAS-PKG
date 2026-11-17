import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  buildSeedTeachers,
  calculatePkgMetrics,
  createInitialChecklist,
  DEFAULT_IDENTITY,
  matchDocumentToInstrument,
} from './src/data/instrumentData.ts';
import type {
  AdminChecklistItem,
  AppState,
  ArchiveDocument,
  SyncLogEntry,
  TeacherPkgRecord,
} from './src/types.ts';

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const STORE_PATH = path.resolve(DATA_DIR, 'store.json');

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function formatDateId(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function createReadableSeedDocumentHtml(title: string, code: string, bodyHtml: string, identity = DEFAULT_IDENTITY): string {
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>${title} (${code})</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; margin: 36px; line-height: 1.55; }
    .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 20px; }
    .kicker { font-size: 12px; color: #475569; letter-spacing: 0.04em; text-transform: uppercase; }
    h1 { font-size: 20px; margin: 4px 0; color: #1e3a8a; }
    .meta { font-size: 13px; color: #334155; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    th { background: #f1f5f9; color: #0f172a; }
    .footer { margin-top: 32px; display: flex; justify-content: space-between; font-size: 13px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="kicker">Arsip Dokumen Digital Resmi · Kode ${code}</div>
    <h1>${title}</h1>
    <div class="meta">${identity.namaSekolah} (NPSN ${identity.npsn}) · Tahun Pelajaran ${identity.tahunPelajaran}</div>
  </div>
  ${bodyHtml}
  <div class="footer">
    <div>Kepala Sekolah<br><br><br><strong>${identity.namaKepalaSekolah}</strong><br>NIP. ${identity.nipKepalaSekolah}</div>
    <div>Pemeriksa / Pengawas<br><br><br><strong>${identity.namaPemeriksa}</strong><br>NIP. ${identity.nipPemeriksa}</div>
  </div>
</body>
</html>`;
}

function buildSeedState(): AppState {
  ensureDirs();
  const now = new Date().toISOString();

  const teachers = buildSeedTeachers();

  // Create real viewable HTML files in data/uploads for seeded digital archives
  const seedDocsSpec: Array<{
    id: string;
    fileName: string;
    judul: string;
    codes: string[];
    sumber: ArchiveDocument['sumber'];
    catatan: string;
    htmlBody: string;
  }> = [
    {
      id: 'doc-seed-pk1',
      fileName: 'PK.1_Jadwal_Pelajaran_2026_2027.html',
      judul: 'Jadwal Pelajaran Sekolah Tahun Pelajaran 2026/2027',
      codes: ['PK.1'],
      sumber: 'unggah_pengguna',
      catatan: 'Terverifikasi lengkap untuk Kelas I s.d. VI.',
      htmlBody: `<p>Dokumen jadwal pelajaran mingguan SDN 1 Sukajaya mengacu pada struktur Kurikulum Merdeka dan pembagian jam tatap muka guru kelas serta guru mata pelajaran PAI dan PJOK.</p>
      <table><thead><tr><th>Hari</th><th>Kelas I-II</th><th>Kelas III-IV</th><th>Kelas V-VI</th></tr></thead>
      <tbody>
        <tr><td>Senin</td><td>Upacara, Bahasa Indonesia, Matematika</td><td>Upacara, IPAS, Matematika</td><td>Upacara, Matematika, Bahasa Indonesia</td></tr>
        <tr><td>Selasa</td><td>Matematika, PPKn, Seni</td><td>PAI, Bahasa Indonesia, PJOK</td><td>IPAS, PAI, Bahasa Inggris</td></tr>
        <tr><td>Rabu</td><td>PJOK, Bahasa Indonesia, P5</td><td>Matematika, IPAS, Seni</td><td>Matematika, PJOK, PPKn</td></tr>
      </tbody></table>`,
    },
    {
      id: 'doc-seed-ppk2',
      fileName: 'P.Pk.2_Kalender_Pendidikan_2026_2027.html',
      judul: 'Kalender Pendidikan SDN 1 Sukajaya 2026/2027',
      codes: ['P.Pk.2'],
      sumber: 'unggah_pengguna',
      catatan: 'Sesuai ketetapan Dinas Pendidikan Kabupaten dan agenda sekolah.',
      htmlBody: `<p>Kalender Pendidikan mencakup hari efektif belajar semester ganjil & genap, jadwal Asesmen Sumatif Tengah Semester, Asesmen Sumatif Akhir Semester, dan jadwal pembagian rapor.</p>`,
    },
    {
      id: 'doc-seed-pk2',
      fileName: 'PK.2_SK_Pembagian_Tugas_Mengajar_2026.html',
      judul: 'SK Pembagian Tugas Mengajar Guru & Tugas Tambahan',
      codes: ['PK.2'],
      sumber: 'generator_pkg',
      catatan: 'Disinkronkan otomatis dari daftar penugasan guru pada modul PKG.',
      htmlBody: `<p>Daftar resmi pembagian tugas mengajar guru SDN 1 Sukajaya Tahun Pelajaran 2026/2027.</p>
      <table><thead><tr><th>No</th><th>Nama Guru</th><th>NIP</th><th>Jabatan / Kelas</th></tr></thead>
      <tbody>${teachers
        .map((t, idx) => `<tr><td>${idx + 1}</td><td>${t.nama}</td><td>${t.nip}</td><td>${t.jabatan} (${t.mapelKelas})</td></tr>`)
        .join('')}</tbody></table>`,
    },
    {
      id: 'doc-seed-pkg-rekap',
      fileName: 'PK.8_PEG.6_Rekap_Supervisi_dan_PKG_2026.html',
      judul: 'Rekap Pelaksanaan Supervisi Kelas & PKG Tahun 2026',
      codes: ['PK.8', 'P.Pk.8.a', 'P.Pk.8.b', 'PEG.6', 'PEG.7'],
      sumber: 'generator_pkg',
      catatan: 'Diterbitkan otomatis dari hasil Penilaian Kinerja Guru (4 guru selesai dinilai).',
      htmlBody: `<p>Rekapitulasi hasil Penilaian Kinerja Guru (PKG) dan Supervisi Akademik SDN 1 Sukajaya.</p>
      <table><thead><tr><th>Nama Guru</th><th>Status</th><th>Skor Total</th><th>Nilai Konversi</th><th>Sebutan</th><th>Tindak Lanjut</th></tr></thead>
      <tbody>${teachers
        .map(
          (t) =>
            `<tr><td>${t.nama}</td><td>${t.statusPkg.toUpperCase()}</td><td>${t.skorTotal}/56</td><td>${t.nilaiKonversi}</td><td>${t.sebutan}</td><td>${t.rencanaTindakLanjut}</td></tr>`
        )
        .join('')}</tbody></table>`,
    },
    {
      id: 'doc-seed-apbs',
      fileName: 'Formulir.1_Rencana_APBS_2026.html',
      judul: 'Rencana Anggaran Pendapatan dan Belanja Sekolah (APBS / RKAS)',
      codes: ['Formulir.1'],
      sumber: 'unggah_pengguna',
      catatan: 'Dokumen RKAS tahun anggaran berjalan telah disahkan.',
      htmlBody: `<p>Rencana APBS SDN 1 Sukajaya mencakup alokasi Dana BOS Reguler untuk pengembangan standar isi, proses, sarpras, dan peningkatan mutu pendidik.</p>`,
    },
    {
      id: 'doc-seed-bku',
      fileName: 'BKU_Buku_Kas_Umum_Triwulan_3_2026.html',
      judul: 'Buku Kas Umum (BKU) Realisasi Dana BOS 2026',
      codes: ['BKU', 'P.Ku.10'],
      sumber: 'unggah_pengguna',
      catatan: 'Tutup buku kas per akhir bulan berjalan dan SPJ BOS terlampir.',
      htmlBody: `<p>Laporan Buku Kas Umum dan rekapitulasi SPJ Bantuan Operasional Sekolah SDN 1 Sukajaya.</p>`,
    },
    {
      id: 'doc-seed-kap11',
      fileName: 'P.Kap.11_P.Kap.12_Profil_dan_Visi_Misi_Sekolah.html',
      judul: 'Dokumen Profil Sekolah serta Visi & Misi SDN 1 Sukajaya',
      codes: ['P.Kap.11', 'P.Kap.12'],
      sumber: 'unggah_pengguna',
      catatan: 'Profil sekolah dan rumusan visi-misi tahun pelajaran 2026/2027.',
      htmlBody: `<p>Profil lengkap SDN 1 Sukajaya (NPSN 20602015) beserta visi, misi, dan tujuan strategis satuan pendidikan.</p>`,
    },
  ];

  const initialChecklist = createInitialChecklist({
    'PK.1': { status: 'ada', keterangan: 'Terarsip: PK.1_Jadwal_Pelajaran_2026_2027.html', syncSource: 'arsip_otomatis' },
    'P.Pk.2': { status: 'ada', keterangan: 'Terarsip: P.Pk.2_Kalender_Pendidikan_2026_2027.html', syncSource: 'arsip_otomatis' },
    'PK.2': { status: 'ada', keterangan: 'Tersinkron otomatis dari 6 data penugasan guru PKG', syncSource: 'pkg_otomatis' },
    'PK.3': { status: 'ada', keterangan: '4/6 guru perangkat ajar lengkap pada modul PKG', syncSource: 'pkg_otomatis' },
    'PK.8': { status: 'ada', keterangan: '4 guru selesai supervisi kelas & PKG', syncSource: 'pkg_otomatis' },
    'P.Pk.8.a': { status: 'ada', keterangan: 'Tersinkron dari jadwal & program supervisi guru', syncSource: 'pkg_otomatis' },
    'P.Pk.8.b': { status: 'ada', keterangan: 'Catatan tindak lanjut supervisi tersedia untuk 5 guru', syncSource: 'pkg_otomatis' },
    'PK.11': { status: 'ada', keterangan: 'Program Tahunan Sekolah telah disahkan kepala sekolah', syncSource: 'manual' },
    'S-1': { status: 'ada', keterangan: 'Formulir SPMB tersedia di ruang tata usaha', syncSource: 'manual' },
    'S-3': { status: 'ada', keterangan: 'Daftar siswa baru tahun 2026/2027 lengkap', syncSource: 'manual' },
    'S-4': { status: 'ada', keterangan: 'Buku Induk Register siswa diperbarui', syncSource: 'manual' },
    'S-8': { status: 'ada', keterangan: 'Papan absen harian terpasang di setiap kelas', syncSource: 'manual' },
    'PEG.6': { status: 'ada', keterangan: 'Otomatis terhubung dengan Rekap Nilai PKG 2026', syncSource: 'pkg_otomatis' },
    'PEG.7': { status: 'ada', keterangan: 'Otomatis terhubung dengan SKP / Penilaian Kinerja Guru', syncSource: 'pkg_otomatis' },
    'PEG.17a': { status: 'ada', keterangan: 'Daftar hadir harian guru & tendik terisi rutin', syncSource: 'manual' },
    'PEG.18': { status: 'ada', keterangan: 'Data kepegawaian 6 guru sinkron dengan daftar PKG', syncSource: 'pkg_otomatis' },
    'Formulir.1': { status: 'ada', keterangan: 'Terarsip: Formulir.1_Rencana_APBS_2026.html', syncSource: 'arsip_otomatis' },
    BKU: { status: 'ada', keterangan: 'Terarsip: BKU_Buku_Kas_Umum_Triwulan_3_2026.html', syncSource: 'arsip_otomatis' },
    'P.Ku.10': { status: 'ada', keterangan: 'Terarsip bersama laporan realisasi SPJ BOS', syncSource: 'arsip_otomatis' },
    'P.Ku.3': { status: 'tidak_ada', keterangan: 'Tidak memungut iuran komite (sekolah negeri bebas pungutan)', syncSource: 'manual' },
    'P.Ku.4': { status: 'tidak_ada', keterangan: 'Belum tersedia buku tabungan khusus sekolah', syncSource: 'manual' },
    'PERL.2': { status: 'ada', keterangan: 'KIR terpasang di Ruang Kelas I-VI dan Ruang Guru', syncSource: 'manual' },
    'P.Kap.1': { status: 'ada', keterangan: 'Buku agenda surat masuk & keluar terisi aktif', syncSource: 'manual' },
    'P.Kap.11': { status: 'ada', keterangan: 'Terarsip: P.Kap.11_P.Kap.12_Profil_dan_Visi_Misi_Sekolah.html', syncSource: 'arsip_otomatis' },
    'P.Kap.12': { status: 'ada', keterangan: 'Terarsip: P.Kap.11_P.Kap.12_Profil_dan_Visi_Misi_Sekolah.html', syncSource: 'arsip_otomatis' },
    'P.Kap.15': { status: 'tidak_ada', keterangan: 'Program Kerja Jangka Panjang (RKJM 4-8 tahun) sedang disusun ulang', syncSource: 'manual' },
  });

  const archive: ArchiveDocument[] = [
    {
      id: 'doc-official-pdf',
      judul: 'Template Resmi Instrumen Administrasi Kepala Sekolah (PDF)',
      namaFileAsli: 'CEKLIS_ADMINISTRASI_KEPALA_SEKOLAH_76cd8597.pdf',
      mimeType: 'application/pdf',
      ukuranByte: 428500,
      tanggalUnggah: now,
      tahunPelajaran: DEFAULT_IDENTITY.tahunPelajaran,
      pengunggah: DEFAULT_IDENTITY.namaPemeriksa,
      sumber: 'lampiran_resmi',
      linkedItemIds: [],
      matchedCodes: [],
      autoMatchedConfidence: 100,
      catatan: 'Dokumen sumber instrumen pemeriksaan 116 butir SDN 1 Sukajaya.',
      fileUrl: '/assets/aistudio/CEKLIS_ADMINISTRASI_KEPALA_SEKOLAH_76cd8597.pdf',
    },
  ];

  for (const spec of seedDocsSpec) {
    const filePath = path.join(UPLOADS_DIR, spec.fileName);
    const html = createReadableSeedDocumentHtml(spec.judul, spec.codes.join(', '), spec.htmlBody);
    fs.writeFileSync(filePath, html, 'utf-8');
    const stat = fs.statSync(filePath);
    const linkedIds = initialChecklist.filter((c) => spec.codes.includes(c.kode)).map((c) => c.id);
    archive.push({
      id: spec.id,
      judul: spec.judul,
      namaFileAsli: spec.fileName,
      mimeType: 'text/html',
      ukuranByte: stat.size,
      tanggalUnggah: now,
      tahunPelajaran: DEFAULT_IDENTITY.tahunPelajaran,
      pengunggah: DEFAULT_IDENTITY.namaKepalaSekolah,
      sumber: spec.sumber,
      linkedItemIds: linkedIds,
      matchedCodes: spec.codes,
      autoMatchedConfidence: 98,
      catatan: spec.catatan,
      fileUrl: `/api/archive/file/${spec.id}`,
    });
  }

  const syncLogs: SyncLogEntry[] = [
    {
      id: 'log-init-1',
      timestamp: now,
      kategori: 'pkg',
      judul: 'Sinkronisasi Otomatis PKG ke Administrasi Sekolah',
      detail: '4 dari 6 guru berstatus Selesai PKG. Butir PK.2, PK.3, PK.8, P.Pk.8.a, P.Pk.8.b, PEG.6, PEG.7, dan PEG.18 otomatis ditandai ADA.',
      affectedCodes: ['PK.2', 'PK.3', 'PK.8', 'P.Pk.8.a', 'P.Pk.8.b', 'PEG.6', 'PEG.7', 'PEG.18'],
    },
    {
      id: 'log-init-2',
      timestamp: now,
      kategori: 'arsip',
      judul: 'Pemetaan Otomatis Arsip Dokumen Digital',
      detail: '6 dokumen sekolah berhasil dipetakan ke kode instrumen terkait (PK.1, P.Pk.2, Formulir.1, BKU, P.Ku.10, P.Kap.11, P.Kap.12).',
      affectedCodes: ['PK.1', 'P.Pk.2', 'Formulir.1', 'BKU', 'P.Ku.10', 'P.Kap.11', 'P.Kap.12'],
    },
  ];

  return {
    identity: DEFAULT_IDENTITY,
    checklist: initialChecklist,
    teachers,
    archive,
    syncLogs,
  };
}

function loadState(): AppState {
  ensureDirs();
  if (!fs.existsSync(STORE_PATH)) {
    const initial = buildSeedState();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw) as AppState;
  } catch {
    const initial = buildSeedState();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function saveState(state: AppState) {
  ensureDirs();
  fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), 'utf-8');
}

function appendSyncLog(state: AppState, entry: Omit<SyncLogEntry, 'id' | 'timestamp'>) {
  const log: SyncLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  state.syncLogs = [log, ...state.syncLogs].slice(0, 40);
}

/**
 * Automatically reconciles PKG evaluations & Digital Archive items with the 116 checklist items,
 * and regenerates the live PKG Rekap HTML archive file when teachers are updated.
 */
function runAutoSync(state: AppState, reason: 'pkg' | 'arsip' | 'rekap' = 'rekap'): string[] {
  const now = new Date().toISOString();
  const affectedCodes = new Set<string>();

  // 1. Sync Archive Documents -> Checklist
  for (const doc of state.archive) {
    if (doc.linkedItemIds.length === 0) continue;
    for (const itemId of doc.linkedItemIds) {
      const item = state.checklist.find((c) => c.id === itemId);
      if (!item) continue;
      if (item.status !== 'ada') {
        item.status = 'ada';
        item.syncSource = doc.sumber === 'generator_pkg' ? 'pkg_otomatis' : 'arsip_otomatis';
        item.lastUpdated = now;
        if (!item.keterangan || item.keterangan.trim() === '') {
          item.keterangan = `Tersedia di Arsip Digital: ${doc.namaFileAsli} (${formatDateId(doc.tanggalUnggah)})`;
        }
        affectedCodes.add(item.kode);
      }
    }
  }

  // 2. Sync Teacher PKG Roster -> Related Checklist Items & Live Rekap Archive Document
  const completedTeachers = state.teachers.filter((t) => t.statusPkg === 'selesai');
  const inProgressOrDone = state.teachers.filter((t) => t.statusPkg !== 'belum');
  const completePrepCount = state.teachers.filter((t) => t.perangkatAjarLengkap).length;

  const pkgSyncMap: Record<string, { condition: boolean; note: string }> = {
    'PK.2': {
      condition: state.teachers.length > 0,
      note: `Tersinkron otomatis dari ${state.teachers.length} data penugasan guru PKG`,
    },
    'PK.3': {
      condition: completePrepCount > 0,
      note: `${completePrepCount}/${state.teachers.length} guru perangkat ajar lengkap pada modul PKG`,
    },
    'PK.8': {
      condition: completedTeachers.length > 0,
      note: `${completedTeachers.length} guru selesai supervisi kelas & PKG (${
        completedTeachers.length > 0
          ? (
              completedTeachers.reduce((s, t) => s + t.nilaiKonversi, 0) / completedTeachers.length
            ).toFixed(1)
          : '0'
      } rata-rata)`,
    },
    'P.Pk.8.a': {
      condition: inProgressOrDone.length > 0,
      note: `Tersinkron dari jadwal supervisi ${inProgressOrDone.length} guru`,
    },
    'P.Pk.8.b': {
      condition: state.teachers.some((t) => t.rencanaTindakLanjut.trim().length > 0),
      note: `Catatan tindak lanjut supervisi tersedia untuk ${
        state.teachers.filter((t) => t.rencanaTindakLanjut.trim().length > 0).length
      } guru`,
    },
    'PEG.6': {
      condition: completedTeachers.length > 0,
      note: `Otomatis terhubung dengan Rekap Nilai PKG (${completedTeachers.length} guru terverifikasi)`,
    },
    'PEG.7': {
      condition: completedTeachers.length > 0,
      note: `Otomatis terhubung dengan SKP / Penilaian Kinerja Guru`,
    },
    'PEG.18': {
      condition: state.teachers.length > 0,
      note: `Data kepegawaian ${state.teachers.length} guru sinkron dengan daftar PKG`,
    },
  };

  for (const [kode, rule] of Object.entries(pkgSyncMap)) {
    const item = state.checklist.find((c) => c.kode === kode);
    if (!item) continue;
    if (rule.condition) {
      if (item.status !== 'ada' || item.syncSource === 'pkg_otomatis') {
        if (item.status !== 'ada') affectedCodes.add(kode);
        item.status = 'ada';
        item.syncSource = 'pkg_otomatis';
        item.keterangan = rule.note;
        item.lastUpdated = now;
      }
    }
  }

  // Update the live PKG Rekap HTML file so downloading/previewing it always shows latest PKG scores
  const pkgArchiveDoc = state.archive.find((d) => d.id === 'doc-seed-pkg-rekap');
  if (pkgArchiveDoc) {
    const bodyHtml = `<p>Rekapitulasi otomatis hasil Penilaian Kinerja Guru (PKG) dan Supervisi Akademik ${state.identity.namaSekolah} Tahun Pelajaran ${state.identity.tahunPelajaran}.</p>
    <table>
      <thead><tr><th>No</th><th>Nama Guru</th><th>NIP</th><th>Jabatan</th><th>Status</th><th>Skor</th><th>Nilai</th><th>Sebutan</th><th>Tindak Lanjut</th></tr></thead>
      <tbody>
        ${state.teachers
          .map(
            (t, idx) =>
              `<tr><td>${idx + 1}</td><td>${t.nama}</td><td>${t.nip}</td><td>${t.jabatan}</td><td>${t.statusPkg.toUpperCase()}</td><td>${t.skorTotal}/56</td><td>${t.nilaiKonversi}</td><td>${t.sebutan}</td><td>${t.rencanaTindakLanjut || '-'}</td></tr>`
          )
          .join('')}
      </tbody>
    </table>`;
    const filePath = path.join(UPLOADS_DIR, pkgArchiveDoc.namaFileAsli);
    fs.writeFileSync(
      filePath,
      createReadableSeedDocumentHtml(pkgArchiveDoc.judul, pkgArchiveDoc.matchedCodes.join(', '), bodyHtml, state.identity),
      'utf-8'
    );
    pkgArchiveDoc.ukuranByte = fs.statSync(filePath).size;
    pkgArchiveDoc.tanggalUnggah = now;
    pkgArchiveDoc.catatan = `Diterbitkan otomatis dari modul PKG (${completedTeachers.length} dari ${state.teachers.length} guru selesai dinilai).`;
  }

  if (affectedCodes.size > 0 && reason === 'rekap') {
    appendSyncLog(state, {
      kategori: 'rekap',
      judul: 'Rekonsiliasi Otomatis Selesai',
      detail: `${affectedCodes.size} butir administrasi diperbarui otomatis dari arsip digital & penilaian kinerja guru.`,
      affectedCodes: Array.from(affectedCodes),
    });
  }

  return Array.from(affectedCodes);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // API Routes
  app.get('/api/state', (_req, res) => {
    const state = loadState();
    res.json(state);
  });

  app.put('/api/identity', (req, res) => {
    const state = loadState();
    state.identity = { ...state.identity, ...req.body };
    runAutoSync(state, 'rekap');
    saveState(state);
    res.json({ identity: state.identity, syncLogs: state.syncLogs });
  });

  app.patch('/api/checklist/:id', (req, res) => {
    const state = loadState();
    const item = state.checklist.find((c) => c.id === req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Butir administrasi tidak ditemukan' });
      return;
    }

    const { status, keterangan } = req.body as { status?: AdminChecklistItem['status']; keterangan?: string };
    if (status) {
      item.status = status;
      item.syncSource = 'manual';
    }
    if (typeof keterangan === 'string') {
      item.keterangan = keterangan;
    }
    item.lastUpdated = new Date().toISOString();

    saveState(state);
    res.json({ item });
  });

  app.post('/api/sync/run', (_req, res) => {
    const state = loadState();
    const affectedCodes = runAutoSync(state, 'rekap');
    saveState(state);
    res.json({ state, affectedCodes });
  });

  app.post('/api/teachers', (req, res) => {
    const state = loadState();
    const body = req.body as Partial<TeacherPkgRecord>;
    const skorKompetensi = body.skorKompetensi || {
      pedagogik: [3, 3, 3, 3, 3, 3, 3],
      kepribadian: [3, 3, 3],
      sosial: [3, 3],
      profesional: [3, 3],
    };
    const metrics = calculatePkgMetrics(skorKompetensi);
    const newTeacher: TeacherPkgRecord = {
      id: `guru-${Date.now()}`,
      nama: body.nama || 'Guru Baru',
      nip: body.nip || '-',
      nuptk: body.nuptk || '-',
      jabatan: body.jabatan || 'Guru Kelas',
      pangkatGolongan: body.pangkatGolongan || 'Penata Muda / III.a',
      mapelKelas: body.mapelKelas || 'Kelas I',
      statusSertifikasi: body.statusSertifikasi || 'Belum Sertifikasi',
      tanggalSupervisi: body.tanggalSupervisi || new Date().toISOString().slice(0, 10),
      statusPkg: body.statusPkg || 'proses',
      skorKompetensi,
      ...metrics,
      perangkatAjarLengkap: Boolean(body.perangkatAjarLengkap),
      catatanSupervisi: body.catatanSupervisi || '',
      rencanaTindakLanjut: body.rencanaTindakLanjut || '',
    };

    state.teachers.push(newTeacher);
    const affected = runAutoSync(state, 'pkg');
    appendSyncLog(state, {
      kategori: 'pkg',
      judul: `Data PKG Ditambahkan: ${newTeacher.nama}`,
      detail: `Nilai PKG ${newTeacher.nilaiKonversi} (${newTeacher.sebutan}) tersinkron ke administrasi kepegawaian & supervisi.`,
      affectedCodes: affected.length > 0 ? affected : ['PK.2', 'PEG.18'],
    });

    saveState(state);
    res.json({ teacher: newTeacher, state });
  });

  app.put('/api/teachers/:id', (req, res) => {
    const state = loadState();
    const idx = state.teachers.findIndex((t) => t.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Data guru tidak ditemukan' });
      return;
    }

    const existing = state.teachers[idx];
    const body = req.body as Partial<TeacherPkgRecord> & { publishToArchive?: boolean };
    const skorKompetensi = body.skorKompetensi || existing.skorKompetensi;
    const metrics = calculatePkgMetrics(skorKompetensi);

    const updated: TeacherPkgRecord = {
      ...existing,
      ...body,
      skorKompetensi,
      ...metrics,
    };
    state.teachers[idx] = updated;

    // Optional / automatic individual PKG report generation to Digital Archive when status is 'selesai'
    if (body.publishToArchive || updated.statusPkg === 'selesai') {
      const docId = updated.archivedDocId || `doc-pkg-${updated.id}`;
      const safeName = updated.nama.replace(/[^a-zA-Z0-9]+/g, '_');
      const fileName = `PEG.6_PK.8_Laporan_PKG_${safeName}.html`;
      const htmlContent = createReadableSeedDocumentHtml(
        `Laporan Penilaian Kinerja Guru (PKG) — ${updated.nama}`,
        'PEG.6, PEG.7, PK.8',
        `<p><strong>Nama Guru:</strong> ${updated.nama} (NIP. ${updated.nip})<br>
        <strong>Jabatan / Tugas:</strong> ${updated.jabatan} (${updated.mapelKelas})<br>
        <strong>Tanggal Supervisi:</strong> ${updated.tanggalSupervisi || '-'}<br>
        <strong>Status Perangkat Ajar:</strong> ${updated.perangkatAjarLengkap ? 'Lengkap' : 'Dalam Proses'}</p>
        <table>
          <thead><tr><th>Kompetensi</th><th>Skor Tiap Indikator</th></tr></thead>
          <tbody>
            <tr><td>Pedagogik (7 Indikator)</td><td>${updated.skorKompetensi.pedagogik.join(', ')}</td></tr>
            <tr><td>Kepribadian (3 Indikator)</td><td>${updated.skorKompetensi.kepribadian.join(', ')}</td></tr>
            <tr><td>Sosial (2 Indikator)</td><td>${updated.skorKompetensi.sosial.join(', ')}</td></tr>
            <tr><td>Profesional (2 Indikator)</td><td>${updated.skorKompetensi.profesional.join(', ')}</td></tr>
          </tbody>
        </table>
        <p style="margin-top:16px"><strong>Skor Total:</strong> ${updated.skorTotal}/56 · <strong>Nilai Konversi:</strong> ${updated.nilaiKonversi} · <strong>Sebutan:</strong> ${updated.sebutan} (${updated.persentaseAngkaKredit}% Angka Kredit)</p>
        <p><strong>Catatan Supervisi:</strong> ${updated.catatanSupervisi || '-'}</p>
        <p><strong>Rencana Tindak Lanjut:</strong> ${updated.rencanaTindakLanjut || '-'}</p>`,
        state.identity
      );

      const filePath = path.join(UPLOADS_DIR, fileName);
      fs.writeFileSync(filePath, htmlContent, 'utf-8');
      const stat = fs.statSync(filePath);
      const targetCodes = ['PEG.6', 'PEG.7', 'PK.8', 'P.Pk.8.b'];
      const linkedIds = state.checklist.filter((c) => targetCodes.includes(c.kode)).map((c) => c.id);

      const existingDocIdx = state.archive.findIndex((d) => d.id === docId);
      const docRecord: ArchiveDocument = {
        id: docId,
        judul: `Laporan PKG & Supervisi — ${updated.nama}`,
        namaFileAsli: fileName,
        mimeType: 'text/html',
        ukuranByte: stat.size,
        tanggalUnggah: new Date().toISOString(),
        tahunPelajaran: state.identity.tahunPelajaran,
        pengunggah: state.identity.namaKepalaSekolah,
        sumber: 'generator_pkg',
        linkedItemIds: linkedIds,
        matchedCodes: targetCodes,
        autoMatchedConfidence: 100,
        catatan: `Nilai PKG ${updated.nilaiKonversi} (${updated.sebutan}) · Diarsipkan otomatis`,
        fileUrl: `/api/archive/file/${docId}`,
      };

      if (existingDocIdx >= 0) {
        state.archive[existingDocIdx] = docRecord;
      } else {
        state.archive.unshift(docRecord);
      }
      updated.archivedDocId = docId;
      state.teachers[idx] = updated;
    }

    const affected = runAutoSync(state, 'pkg');
    appendSyncLog(state, {
      kategori: 'pkg',
      judul: `PKG Diperbarui: ${updated.nama}`,
      detail: `Skor ${updated.skorTotal}/56 (${updated.nilaiKonversi} · ${updated.sebutan}) disinkronkan ke butir administrasi & arsip digital.`,
      affectedCodes: affected.length > 0 ? affected : ['PK.8', 'PEG.6', 'PEG.7'],
    });

    saveState(state);
    res.json({ teacher: updated, state });
  });

  app.delete('/api/teachers/:id', (req, res) => {
    const state = loadState();
    const target = state.teachers.find((t) => t.id === req.params.id);
    if (!target) {
      res.status(404).json({ error: 'Guru tidak ditemukan' });
      return;
    }
    state.teachers = state.teachers.filter((t) => t.id !== req.params.id);
    runAutoSync(state, 'pkg');
    saveState(state);
    res.json({ state });
  });

  app.post('/api/archive/upload', (req, res) => {
    const state = loadState();
    const {
      judul,
      namaFileAsli,
      mimeType,
      base64Data,
      catatan,
      manualItemIds,
      autoSyncChecklist = true,
    } = req.body as {
      judul: string;
      namaFileAsli: string;
      mimeType: string;
      base64Data: string;
      catatan?: string;
      manualItemIds?: string[];
      autoSyncChecklist?: boolean;
    };

    if (!namaFileAsli || !base64Data) {
      res.status(400).json({ error: 'File tidak valid' });
      return;
    }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const cleanFileName = namaFileAsli.replace(/[^a-zA-Z0-9._-]/g, '_');
    const diskFileName = `${docId}_${cleanFileName}`;
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(path.join(UPLOADS_DIR, diskFileName), buffer);

    // Run Smart Auto-Matcher if manualItemIds not explicitly provided or empty
    const autoMatch = matchDocumentToInstrument(namaFileAsli, judul || namaFileAsli, state.checklist);
    const finalItemIds =
      manualItemIds && manualItemIds.length > 0 ? manualItemIds : autoMatch.itemIds;
    const finalCodes = state.checklist
      .filter((c) => finalItemIds.includes(c.id))
      .map((c) => c.kode);

    const newDoc: ArchiveDocument = {
      id: docId,
      judul: judul?.trim() || namaFileAsli,
      namaFileAsli: diskFileName,
      mimeType: mimeType || 'application/octet-stream',
      ukuranByte: buffer.length,
      tanggalUnggah: new Date().toISOString(),
      tahunPelajaran: state.identity.tahunPelajaran,
      pengunggah: state.identity.namaKepalaSekolah,
      sumber: 'unggah_pengguna',
      linkedItemIds: finalItemIds,
      matchedCodes: finalCodes,
      autoMatchedConfidence: manualItemIds && manualItemIds.length > 0 ? 100 : autoMatch.confidence,
      catatan: catatan || '',
      fileUrl: `/api/archive/file/${docId}`,
    };

    state.archive.unshift(newDoc);

    const syncedCodes: string[] = [];
    if (autoSyncChecklist && finalItemIds.length > 0) {
      const now = new Date().toISOString();
      for (const itemId of finalItemIds) {
        const item = state.checklist.find((c) => c.id === itemId);
        if (item) {
          item.status = 'ada';
          item.syncSource = 'arsip_otomatis';
          item.lastUpdated = now;
          item.keterangan = `Tersedia di Arsip Digital: ${namaFileAsli} (${formatDateId(now)})`;
          syncedCodes.push(item.kode);
        }
      }
    }

    appendSyncLog(state, {
      kategori: 'arsip',
      judul: `Dokumen Diarsipkan: ${newDoc.judul}`,
      detail:
        syncedCodes.length > 0
          ? `Otomatis menautkan & menandai ADA pada butir: ${syncedCodes.join(', ')}.`
          : 'Dokumen tersimpan di arsip digital (belum ditautkan ke kode butir instrumen).',
      affectedCodes: syncedCodes,
    });

    saveState(state);
    res.json({ document: newDoc, syncedCodes, state });
  });

  app.patch('/api/archive/:id', (req, res) => {
    const state = loadState();
    const doc = state.archive.find((d) => d.id === req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Dokumen tidak ditemukan' });
      return;
    }

    const { judul, catatan, linkedItemIds } = req.body as {
      judul?: string;
      catatan?: string;
      linkedItemIds?: string[];
    };

    if (typeof judul === 'string') doc.judul = judul;
    if (typeof catatan === 'string') doc.catatan = catatan;
    if (Array.isArray(linkedItemIds)) {
      doc.linkedItemIds = linkedItemIds;
      doc.matchedCodes = state.checklist
        .filter((c) => linkedItemIds.includes(c.id))
        .map((c) => c.kode);
      doc.autoMatchedConfidence = 100;

      const now = new Date().toISOString();
      const syncedCodes: string[] = [];
      for (const itemId of linkedItemIds) {
        const item = state.checklist.find((c) => c.id === itemId);
        if (item) {
          item.status = 'ada';
          item.syncSource = 'arsip_otomatis';
          item.lastUpdated = now;
          item.keterangan = `Tersedia di Arsip Digital: ${doc.judul}`;
          syncedCodes.push(item.kode);
        }
      }
      if (syncedCodes.length > 0) {
        appendSyncLog(state, {
          kategori: 'arsip',
          judul: `Tautan Dokumen Diperbarui: ${doc.judul}`,
          detail: `Menandai ADA secara otomatis untuk kode: ${syncedCodes.join(', ')}.`,
          affectedCodes: syncedCodes,
        });
      }
    }

    saveState(state);
    res.json({ document: doc, state });
  });

  app.delete('/api/archive/:id', (req, res) => {
    const state = loadState();
    const doc = state.archive.find((d) => d.id === req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Dokumen tidak ditemukan' });
      return;
    }

    if (doc.sumber !== 'lampiran_resmi') {
      const diskPath = path.join(UPLOADS_DIR, doc.namaFileAsli);
      if (fs.existsSync(diskPath)) {
        fs.unlinkSync(diskPath);
      }
    }

    state.archive = state.archive.filter((d) => d.id !== req.params.id);
    saveState(state);
    res.json({ state });
  });

  app.get('/api/archive/file/:id', (req, res) => {
    const state = loadState();
    const doc = state.archive.find((d) => d.id === req.params.id);
    if (!doc) {
      res.status(404).send('Dokumen tidak ditemukan');
      return;
    }

    if (doc.sumber === 'lampiran_resmi') {
      const publicPdf = path.resolve(process.cwd(), 'public', 'assets', 'aistudio', 'CEKLIS_ADMINISTRASI_KEPALA_SEKOLAH_76cd8597.pdf');
      if (fs.existsSync(publicPdf)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${doc.namaFileAsli}"`);
        fs.createReadStream(publicPdf).pipe(res);
        return;
      }
    }

    const filePath = path.join(UPLOADS_DIR, doc.namaFileAsli);
    if (!fs.existsSync(filePath)) {
      res.status(404).send('Berkas fisik tidak ditemukan');
      return;
    }

    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
    const disposition = req.query.download === '1' ? 'attachment' : 'inline';
    res.setHeader('Content-Disposition', `${disposition}; filename="${doc.namaFileAsli}"`);
    fs.createReadStream(filePath).pipe(res);
  });

  // Vite middleware in dev, static dist in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIMAS PKG server running on http://localhost:${PORT}`);
  });
}

startServer();
