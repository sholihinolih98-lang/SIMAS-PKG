import {
  AdminChecklistItem,
  PkgCompetencyScore,
  PkgPredicate,
  SchoolIdentity,
  SectionCode,
  SectionSummary,
  TeacherPkgRecord,
} from '../types';

export const SECTION_LABELS: Record<SectionCode, string> = {
  A: 'PROGRAM PENGAJARAN',
  B: 'KESISWAAN',
  C: 'KEPEGAWAIAN',
  D: 'KEUANGAN',
  E: 'PERLENGKAPAN/PERALATAN',
  F: 'KEPALA SEKOLAH DAN KETATAUSAHAAN',
};

export const SECTION_ORDER: SectionCode[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export const DEFAULT_IDENTITY: SchoolIdentity = {
  namaSekolah: 'SDN 1 SUKAJAYA',
  npsn: '20602015',
  alamatSekolah: 'Jl. Raya Sobang-Cigemblong Km 01 Kp. Cilebang Ds. Sukajaya Kec. Sobang',
  namaKepalaSekolah: 'Sholihin, S.Pd., M.Pd',
  nipKepalaSekolah: '197505122008011010',
  tahunPelajaran: '2026/2027',
  tanggalPemeriksaan: '2026-11-16',
  namaPemeriksa: 'Haeriyan, S.Pd',
  nipPemeriksa: '197404202008012003',
  tempatPenetapan: 'Sobang',
  catatanPemeriksa:
    'Pelaksanaan administrasi sekolah secara umum berjalan tertib. Dokumen terkait Penilaian Kinerja Guru (PKG) dan supervisi kelas terintegrasi dengan arsip digital sekolah.',
  rekomendasiTindakLanjut:
    'Lengkapi arsip digital pada bagian Keuangan Komite, Tabungan Sekolah, dan Program Kerja Sekolah Jangka Panjang sebelum evaluasi semester berikutnya.',
};

interface RawChecklistSeed {
  no: number;
  bagian: SectionCode;
  kode: string;
  jenis: string;
  priorityHighlight?: boolean;
  linkedPkgRelated?: boolean;
}

export const INSTRUMENT_SEED: RawChecklistSeed[] = [
  // A. PROGRAM PENGAJARAN (20 butir)
  { no: 1, bagian: 'A', kode: 'PK.1', jenis: 'Jadwal Pelajaran Sekolah' },
  { no: 2, bagian: 'A', kode: 'P.Pk.1', jenis: 'Jadwal Kegiatan Ekstra Kurikuler' },
  { no: 3, bagian: 'A', kode: 'P.Pk.2', jenis: 'Kalender Pendidikan' },
  { no: 4, bagian: 'A', kode: 'P.Pk.3', jenis: 'Program Kegiatan Ekstra Kurikuler' },
  { no: 5, bagian: 'A', kode: 'P.Pk.4', jenis: 'Buku Catatan Kegiatan Keluar' },
  { no: 6, bagian: 'A', kode: 'P.Pk.5', jenis: 'Buku Agenda Kelas/Jurnal' },
  { no: 7, bagian: 'A', kode: 'PK.2', jenis: 'Daftar Pembagian Tugas Mengajar', linkedPkgRelated: true },
  { no: 8, bagian: 'A', kode: 'PK.3', jenis: 'Daftar Pemeriksaan Persiapan Mengajar', linkedPkgRelated: true },
  { no: 9, bagian: 'A', kode: 'PK.4', jenis: 'Daftar Penyelesaian Kasus di Sekolah' },
  { no: 10, bagian: 'A', kode: 'PK.5', jenis: 'Daftar Hasil Ujian Akhir Sekolah' },
  { no: 11, bagian: 'A', kode: 'PK.6', jenis: 'Rekap Kelas Kenaikan dan Kelulusan' },
  { no: 12, bagian: 'A', kode: 'PK.7', jenis: 'Daftar Penyerahan Ijazah dan STL' },
  { no: 13, bagian: 'A', kode: 'PK.8', jenis: 'Rekap Pelaksanaan Supervisi Kelas', linkedPkgRelated: true },
  { no: 14, bagian: 'A', kode: 'P.Pk.8.a', jenis: 'Rencana Program Supervisi', linkedPkgRelated: true },
  { no: 15, bagian: 'A', kode: 'P.Pk.8.b', jenis: 'Catatan Tindak Lanjut Hasil Supervisi', linkedPkgRelated: true },
  { no: 16, bagian: 'A', kode: 'P.Pk.8.c', jenis: 'Pengawasan Pelaksanaan Kegiatan Ekstrakurikuler, Perpustakaan, Ulangan Umum dan Ujian' },
  { no: 17, bagian: 'A', kode: 'PK.9', jenis: 'Hubungan Masyarakat' },
  { no: 18, bagian: 'A', kode: 'PK.10', jenis: 'Laporan Hasil Belajar (Buku Rapor)' },
  { no: 19, bagian: 'A', kode: 'PK.11', jenis: 'Program Tahunan Sekolah' },
  { no: 20, bagian: 'A', kode: 'PK.12', jenis: 'Ijazah dan Surat Tanda Lulus (FCopy/arsip)' },

  // B. KESISWAAN (28 butir)
  { no: 21, bagian: 'B', kode: 'S-1', jenis: 'Formulir Pendaftaran Siswa Baru' },
  { no: 22, bagian: 'B', kode: 'S-2', jenis: 'Daftar Calon Siswa Baru' },
  { no: 23, bagian: 'B', kode: 'S-3', jenis: 'Daftar Siswa Baru' },
  { no: 24, bagian: 'B', kode: 'S-4', jenis: 'Buku Induk' },
  { no: 25, bagian: 'B', kode: 'S-5', jenis: 'Buku Klaper' },
  { no: 26, bagian: 'B', kode: 'PS-5a', jenis: 'Buku Kunci Induk' },
  { no: 27, bagian: 'B', kode: 'PS-5b', jenis: 'Buku Pembantu Induk' },
  { no: 28, bagian: 'B', kode: 'S-6', jenis: 'Jumlah Siswa Menurut Kelas, Asal, dan Jenis Kelamin' },
  { no: 29, bagian: 'B', kode: 'S-7', jenis: 'Jumlah Siswa Menurut Usia, Kelas, dan Jenis Kelamin' },
  { no: 30, bagian: 'B', kode: 'PS-7a', jenis: 'Jumlah Siswa Menurut Kelas, Agama, dan Jenis Kelamin' },
  { no: 31, bagian: 'B', kode: 'S-8', jenis: 'Papan Absen Harian Siswa' },
  { no: 32, bagian: 'B', kode: 'S-9', jenis: 'Buku Rekap Absen Harian Siswa' },
  { no: 33, bagian: 'B', kode: 'S-10', jenis: 'Buku Absen Bulanan Siswa' },
  { no: 34, bagian: 'B', kode: 'S-11', jenis: 'Buku Rekap Absen Bulanan Siswa' },
  { no: 35, bagian: 'B', kode: 'S-12', jenis: 'Surat Permohonan Pindah Sekolah' },
  { no: 36, bagian: 'B', kode: 'S-13', jenis: 'Surat Keterangan Pindah Sekolah' },
  { no: 37, bagian: 'B', kode: 'S-14', jenis: 'Buku Mutasi Siswa Semesteran' },
  { no: 38, bagian: 'B', kode: 'PS-14a', jenis: 'Buku Mutasi Siswa Kelas' },
  { no: 39, bagian: 'B', kode: 'S-15', jenis: 'Daftar Calon Peserta UAS' },
  { no: 40, bagian: 'B', kode: 'S-16', jenis: 'Tanda Peserta UAS' },
  { no: 41, bagian: 'B', kode: 'S-17', jenis: 'Daftar Peserta UAS dan Prestasinya' },
  { no: 42, bagian: 'B', kode: 'S-18', jenis: 'Daftar Siswa Masuk SLTP/MTS' },
  { no: 43, bagian: 'B', kode: 'S-19', jenis: 'Daftar Kenaikan Kelas' },
  { no: 44, bagian: 'B', kode: 'S-20', jenis: 'Rekap Kelas Kenaikan dan Kelulusan' },
  { no: 45, bagian: 'B', kode: 'PS-21', jenis: 'Daftar Prestasi Siswa (Bibit Unggul)' },
  { no: 46, bagian: 'B', kode: 'PS-22', jenis: 'Daftar Siswa Berprestasi' },
  { no: 47, bagian: 'B', kode: 'PS-23', jenis: 'Buku Catatan Pencapaian Sasaran Kurikulum dan Taraf Serap' },
  { no: 48, bagian: 'B', kode: 'PS-24', jenis: 'Grafik Pencapaian Sasaran Kurikulum dan Taraf Serap' },

  // C. KEPEGAWAIAN (17 butir)
  { no: 49, bagian: 'C', kode: 'PEG.1', jenis: 'Rencana Kebutuhan Guru/Karyawan' },
  { no: 50, bagian: 'C', kode: 'PEG.3b', jenis: 'Daftar Riwayat Hidup/Formulir Isian Pegawai' },
  { no: 51, bagian: 'C', kode: 'PEG.5', jenis: 'DUPAK Kenaikan Jabatan/Pangkat Guru', linkedPkgRelated: true },
  { no: 52, bagian: 'C', kode: 'P.PEG.5a', jenis: 'Buku Catatan Kenaikan Pangkat' },
  { no: 53, bagian: 'C', kode: 'PEG.6', jenis: 'Buku Catatan Penilaian/Kinerja PNS', linkedPkgRelated: true },
  { no: 54, bagian: 'C', kode: 'P.PEG.6a', jenis: 'Buku Tertib Guru/Karyawan' },
  { no: 55, bagian: 'C', kode: 'P.PEG.6b', jenis: 'Buku Pembinaan Khusus', linkedPkgRelated: true },
  { no: 56, bagian: 'C', kode: 'PEG.7', jenis: 'Daftar Penilaian Pelaksanaan Pekerjaan', linkedPkgRelated: true },
  { no: 57, bagian: 'C', kode: 'PEG.8', jenis: 'Daftar Urut Kepangkatan (DUK) PNS' },
  { no: 58, bagian: 'C', kode: 'PEG.9', jenis: 'Buku Cuti Guru/Karyawan' },
  { no: 59, bagian: 'C', kode: 'PEG.10', jenis: 'Buku Permintaan Berhenti dari PNS dengan Hak Pensiun' },
  { no: 60, bagian: 'C', kode: 'PEG.11a', jenis: 'Pendaftaran Permintaan Pensiunan PNS' },
  { no: 61, bagian: 'C', kode: 'PEG.11b', jenis: 'Daftar Susunan Keluarga' },
  { no: 62, bagian: 'C', kode: 'PEG.17a', jenis: 'Daftar Hadir Guru/Karyawan' },
  { no: 63, bagian: 'C', kode: 'PEG.17b', jenis: 'Buku Rangkuman Hadir Guru/Karyawan' },
  { no: 64, bagian: 'C', kode: 'PEG.17c', jenis: 'Buku Rangkuman Tidak Hadir Guru/Karyawan' },
  { no: 65, bagian: 'C', kode: 'PEG.18', jenis: 'Data Kepegawaian', linkedPkgRelated: true },

  // D. KEUANGAN (14 butir)
  { no: 66, bagian: 'D', kode: 'Formulir.1', jenis: 'Rencana APBS' },
  { no: 67, bagian: 'D', kode: 'BKU', jenis: 'Buku Kas Umum' },
  { no: 68, bagian: 'D', kode: 'BKP', jenis: 'Buku Kas Pembantu' },
  { no: 69, bagian: 'D', kode: 'RPK', jenis: 'Buku Rangkuman Penerimaan dan Pengeluaran Keuangan Sekolah' },
  { no: 70, bagian: 'D', kode: 'P.Ku.1', jenis: 'Buku Penerimaan dan Pembayaran Gaji' },
  { no: 71, bagian: 'D', kode: 'P.Ku.2', jenis: 'Buku Kas Keuangan Komite Sekolah' },
  { no: 72, bagian: 'D', kode: 'P.Ku.3', jenis: 'Buku Iuran Komite Sekolah', priorityHighlight: true },
  { no: 73, bagian: 'D', kode: 'P.Ku.4', jenis: 'Buku Tabungan Sekolah', priorityHighlight: true },
  { no: 74, bagian: 'D', kode: 'P.Ku.5', jenis: 'Buku Keuangan Koperasi Sekolah' },
  { no: 75, bagian: 'D', kode: 'P.Ku.6', jenis: 'Buku Keuangan Serba-Serbi' },
  { no: 76, bagian: 'D', kode: 'P.Ku.7', jenis: 'SPJ Dana Bantuan Operasional (Kinerja, Kemajuan, Airmasi)' },
  { no: 77, bagian: 'D', kode: 'P.Ku.8', jenis: 'SPJ Kelebihan Mengajar' },
  { no: 78, bagian: 'D', kode: 'P.Ku.9', jenis: 'SPJ Bea Siswa' },
  { no: 79, bagian: 'D', kode: 'P.Ku.10', jenis: 'SPJ Bantuan Operasional Sekolah' },

  // E. PERLENGKAPAN/PERALATAN (8 butir)
  { no: 80, bagian: 'E', kode: 'PERL.1', jenis: 'Buku Pemeriksaan Perlengkapan/Barang' },
  { no: 81, bagian: 'E', kode: 'PERL.2', jenis: 'Kartu Inventaris Ruangan' },
  { no: 82, bagian: 'E', kode: 'PERL.3A', jenis: 'Kartu Inventaris Barang (Tanah)' },
  { no: 83, bagian: 'E', kode: 'PERL.3B', jenis: 'Kartu Inventaris Barang (Gedung)' },
  { no: 84, bagian: 'E', kode: 'PERL.3C', jenis: 'Kartu Inventaris Barang (Kendaraan)' },
  { no: 85, bagian: 'E', kode: 'PERL.3D', jenis: 'Kartu Inventaris Barang (Barang Inv. Lain)' },
  { no: 86, bagian: 'E', kode: 'PERL.4', jenis: 'Buku Inventaris Perlengkapan/Barang' },
  { no: 87, bagian: 'E', kode: 'P.Pust', jenis: 'Buku Inventaris Perpustakaan' },

  // F. KEPALA SEKOLAH DAN KETATAUSAHAAN (29 butir)
  { no: 88, bagian: 'F', kode: 'P.Kap.1', jenis: 'Buku Agenda Surat Masuk dan Keluar' },
  { no: 89, bagian: 'F', kode: 'P.Kap.2', jenis: 'Buku Pengantar Ekspedisi' },
  { no: 90, bagian: 'F', kode: 'P.Kap.3', jenis: 'Buku Tamu Khusus' },
  { no: 91, bagian: 'F', kode: 'P.Kap.4', jenis: 'Buku Tamu Umum' },
  { no: 92, bagian: 'F', kode: 'P.Kap.5', jenis: 'Buku Catatan Pengaduan, Kritik, Saran, Masyarakat' },
  { no: 93, bagian: 'F', kode: 'P.Kap.6', jenis: 'Buku Notula Rapat Dinas' },
  { no: 94, bagian: 'F', kode: 'P.Kap.7', jenis: 'Buku Notula Rapat Dewan Sekolah/Guru' },
  { no: 95, bagian: 'F', kode: 'P.Kap.8', jenis: 'Buku Notula Rapat Komite Sekolah' },
  { no: 96, bagian: 'F', kode: 'P.Kap.9', jenis: 'Daftar Hadir Rapat Komite Sekolah' },
  { no: 97, bagian: 'F', kode: 'P.Kap.10', jenis: 'Daftar Hadir Pertemuan Wali Siswa' },
  { no: 98, bagian: 'F', kode: 'P.Kap.11', jenis: 'Profil Sekolah' },
  { no: 99, bagian: 'F', kode: 'P.Kap.12', jenis: 'Visi dan Misi Sekolah' },
  { no: 100, bagian: 'F', kode: 'P.Kap.13', jenis: 'Rencana Pengembangan Sekolah' },
  { no: 101, bagian: 'F', kode: 'P.Kap.14', jenis: 'Program Kerja Umum Kepala Sekolah' },
  { no: 102, bagian: 'F', kode: 'P.Kap.15', jenis: 'Program Kerja Sekolah Jangka Panjang', priorityHighlight: true },
  { no: 103, bagian: 'F', kode: 'P.Kap.16', jenis: 'Program Kerja Sekolah Jangka Menengah' },
  { no: 104, bagian: 'F', kode: 'P.Kap.17', jenis: 'Program Kerja Sekolah Jangka Pendek' },
  { no: 105, bagian: 'F', kode: 'P.Kap.18', jenis: 'Program Peningkatan SDM', linkedPkgRelated: true },
  { no: 106, bagian: 'F', kode: 'P.Kap.19', jenis: 'Catatan Kegiatan Harian Kepala Sekolah' },
  { no: 107, bagian: 'F', kode: 'P.Kap.20', jenis: 'Catatan Membimbing Lomba' },
  { no: 108, bagian: 'F', kode: 'P.Kap.21', jenis: 'Catatan Gagasan Baru/Inovasi' },
  { no: 109, bagian: 'F', kode: 'P.Kap.22', jenis: 'Tata Tertib Guru' },
  { no: 110, bagian: 'F', kode: 'P.Kap.23', jenis: 'Tata Tertib Siswa' },
  { no: 111, bagian: 'F', kode: 'P.Kap.24', jenis: 'Peraturan Pemberian Sanksi Siswa' },
  { no: 112, bagian: 'F', kode: 'P.Kap.25', jenis: 'Peraturan Pemberian Hadiah/Penghargaan' },
  { no: 113, bagian: 'F', kode: 'P.Kap.26', jenis: 'Daftar Susunan Dewan Sekolah' },
  { no: 114, bagian: 'F', kode: 'P.Kap.27', jenis: 'Daftar Susunan Komite Sekolah' },
  { no: 115, bagian: 'F', kode: 'P.Kap.28', jenis: 'Data Bank Sekolah' },
  { no: 116, bagian: 'F', kode: 'P.Kap.29', jenis: 'Denah Sekolah' },
];

export const PKG_COMPETENCIES = [
  {
    key: 'pedagogik' as const,
    label: 'Kompetensi Pedagogik',
    indicators: [
      '1. Mengenal karakteristik peserta didik',
      '2. Menguasai teori belajar dan prinsip pembelajaran mendidik',
      '3. Pengembangan kurikulum dan silabus/ATP',
      '4. Kegiatan pembelajaran yang mendidik',
      '5. Memahami dan mengembangkan potensi peserta didik',
      '6. Komunikasi dengan peserta didik',
      '7. Penilaian dan evaluasi proses serta hasil belajar',
    ],
  },
  {
    key: 'kepribadian' as const,
    label: 'Kompetensi Kepribadian',
    indicators: [
      '8. Bertindak sesuai norma agama, hukum, sosial, dan budaya nasional',
      '9. Menunjukkan pribadi yang dewasa dan teladan',
      '10. Etos kerja, tanggung jawab tinggi, dan bangga menjadi guru',
    ],
  },
  {
    key: 'sosial' as const,
    label: 'Kompetensi Sosial',
    indicators: [
      '11. Bersikap inklusif, bertindak objektif, serta tidak diskriminatif',
      '12. Komunikasi sesama guru, tenaga kependidikan, orang tua, dan masyarakat',
    ],
  },
  {
    key: 'profesional' as const,
    label: 'Kompetensi Profesional',
    indicators: [
      '13. Penguasaan materi, struktur, konsep, dan pola pikir keilmuan',
      '14. Mengembangkan keprofesionalan melalui tindakan reflektif',
    ],
  },
];

export function calculatePkgMetrics(skorKompetensi: PkgCompetencyScore): {
  skorTotal: number;
  nilaiKonversi: number;
  sebutan: PkgPredicate;
  persentaseAngkaKredit: number;
} {
  const allScores = [
    ...skorKompetensi.pedagogik,
    ...skorKompetensi.kepribadian,
    ...skorKompetensi.sosial,
    ...skorKompetensi.profesional,
  ];
  const skorTotal = allScores.reduce((acc, v) => acc + Number(v || 0), 0);
  // 14 indicators x max 4 = 56
  const nilaiKonversi = Number(((skorTotal / 56) * 100).toFixed(2));

  let sebutan: PkgPredicate = 'Kurang';
  let persentaseAngkaKredit = 25;

  if (nilaiKonversi >= 91) {
    sebutan = 'Amat Baik';
    persentaseAngkaKredit = 125;
  } else if (nilaiKonversi >= 76) {
    sebutan = 'Baik';
    persentaseAngkaKredit = 100;
  } else if (nilaiKonversi >= 61) {
    sebutan = 'Cukup';
    persentaseAngkaKredit = 75;
  } else if (nilaiKonversi >= 51) {
    sebutan = 'Sedang';
    persentaseAngkaKredit = 50;
  }

  return { skorTotal, nilaiKonversi, sebutan, persentaseAngkaKredit };
}

export function createInitialChecklist(
  preCompletedCodes: Record<string, { status: 'ada' | 'tidak_ada'; keterangan: string; syncSource: 'manual' | 'arsip_otomatis' | 'pkg_otomatis' }> = {}
): AdminChecklistItem[] {
  const now = new Date().toISOString();
  return INSTRUMENT_SEED.map((item) => {
    const id = `item-${item.no}`;
    const preset = preCompletedCodes[item.kode];
    return {
      id,
      no: item.no,
      bagian: item.bagian,
      kode: item.kode,
      jenis: item.jenis,
      status: preset ? preset.status : 'belum',
      keterangan: preset ? preset.keterangan : '',
      syncSource: preset ? preset.syncSource : 'manual',
      lastUpdated: now,
      priorityHighlight: item.priorityHighlight,
      linkedPkgRelated: item.linkedPkgRelated,
    };
  });
}

export function computeSectionSummaries(
  checklist: AdminChecklistItem[],
  archive: { linkedItemIds: string[] }[]
): { sections: SectionSummary[]; total: SectionSummary } {
  const linkedSet = new Set<string>();
  archive.forEach((doc) => doc.linkedItemIds.forEach((id) => linkedSet.add(id)));

  const sections: SectionSummary[] = SECTION_ORDER.map((bagian) => {
    const items = checklist.filter((item) => item.bagian === bagian);
    const jumlahButir = items.length;
    const ada = items.filter((i) => i.status === 'ada').length;
    const tidakAda = items.filter((i) => i.status === 'tidak_ada').length;
    const belum = items.filter((i) => i.status === 'belum').length;
    const terarsip = items.filter((i) => linkedSet.has(i.id)).length;
    const persenAda = jumlahButir > 0 ? Number(((ada / jumlahButir) * 100).toFixed(1)) : 0;
    return {
      bagian,
      uraian: SECTION_LABELS[bagian],
      jumlahButir,
      ada,
      tidakAda,
      belum,
      persenAda,
      terarsip,
    };
  });

  const jumlahButir = checklist.length;
  const ada = checklist.filter((i) => i.status === 'ada').length;
  const tidakAda = checklist.filter((i) => i.status === 'tidak_ada').length;
  const belum = checklist.filter((i) => i.status === 'belum').length;
  const terarsip = checklist.filter((i) => linkedSet.has(i.id)).length;
  const persenAda = jumlahButir > 0 ? Number(((ada / jumlahButir) * 100).toFixed(1)) : 0;

  return {
    sections,
    total: {
      bagian: 'A',
      uraian: 'JUMLAH KESELURUHAN',
      jumlahButir,
      ada,
      tidakAda,
      belum,
      persenAda,
      terarsip,
    },
  };
}

/**
 * Automatic document-to-instrument matcher.
 * Matches exact code tokens (e.g. "PK.1", "P.Pk.8.a", "Formulir.1", "S-4", "PEG.6")
 * and semantic keywords in document titles/filenames against the 116 checklist items.
 */
export function matchDocumentToInstrument(
  fileName: string,
  title: string,
  checklist: AdminChecklistItem[]
): { itemIds: string[]; matchedCodes: string[]; confidence: number } {
  const haystack = `${fileName} ${title}`.toLowerCase();
  const normalizedHaystack = haystack.replace(/[_\-/]+/g, ' ');

  const exactMatches: AdminChecklistItem[] = [];
  const keywordMatches: { item: AdminChecklistItem; score: number }[] = [];

  for (const item of checklist) {
    const codeLower = item.kode.toLowerCase();
    const codeNoDots = codeLower.replace(/\./g, '');
    const codeSpaced = codeLower.replace(/[.-]/g, ' ');

    // Check exact code pattern bounded by non-alphanumeric chars
    const escaped = codeLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const codeRegex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    const noDotsRegex = new RegExp(`(^|[^a-z0-9])${codeNoDots}([^a-z0-9]|$)`, 'i');

    if (
      codeRegex.test(haystack) ||
      (codeNoDots.length >= 3 && noDotsRegex.test(haystack)) ||
      (codeSpaced.length >= 4 && normalizedHaystack.includes(codeSpaced))
    ) {
      exactMatches.push(item);
      continue;
    }

    // Semantic keyword matching against item.jenis
    const stopWords = new Set(['dan', 'di', 'dari', 'atau', 'yang', 'buku', 'daftar', 'surat', 'kartu', 'data', 'sekolah', 'siswa', 'guru', 'karyawan']);
    const tokens = item.jenis
      .toLowerCase()
      .replace(/[()/.,-]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !stopWords.has(w));

    let hits = 0;
    for (const token of tokens) {
      if (normalizedHaystack.includes(token)) {
        hits += 1;
      }
    }

    if (tokens.length > 0 && hits >= Math.min(2, tokens.length)) {
      keywordMatches.push({ item, score: hits / tokens.length });
    }
  }

  if (exactMatches.length > 0) {
    return {
      itemIds: exactMatches.map((i) => i.id),
      matchedCodes: exactMatches.map((i) => i.kode),
      confidence: 98,
    };
  }

  // Domain-specific shortcuts for common school administration documents
  const domainAliases: Array<{ patterns: string[]; codes: string[] }> = [
    { patterns: ['pkg', 'penilaian kinerja guru', 'kinerja pns'], codes: ['PEG.6', 'PEG.7', 'PK.8'] },
    { patterns: ['supervisi', 'observasi kelas'], codes: ['PK.8', 'P.Pk.8.a', 'P.Pk.8.b'] },
    { patterns: ['pembagian tugas', 'sk mengajar', 'tugas mengajar'], codes: ['PK.2'] },
    { patterns: ['modul ajar', 'rpp', 'persiapan mengajar', 'perangkat ajar'], codes: ['PK.3'] },
    { patterns: ['apbs', 'rkas', 'anggaran'], codes: ['Formulir.1'] },
    { patterns: ['bos', 'bantuan operasional', 'spj bos'], codes: ['P.Ku.10'] },
    { patterns: ['bku', 'kas umum'], codes: ['BKU'] },
    { patterns: ['kalender pendidikan', 'kaldik'], codes: ['P.Pk.2'] },
    { patterns: ['jadwal pelajaran'], codes: ['PK.1'] },
    { patterns: ['visi misi', 'visi dan misi'], codes: ['P.Kap.12'] },
    { patterns: ['profil sekolah'], codes: ['P.Kap.11'] },
    { patterns: ['denah'], codes: ['P.Kap.29'] },
    { patterns: ['duk', 'urut kepangkatan'], codes: ['PEG.8'] },
    { patterns: ['ppdb', 'pendaftaran siswa baru'], codes: ['S-1', 'S-2', 'S-3'] },
  ];

  for (const alias of domainAliases) {
    if (alias.patterns.some((p) => normalizedHaystack.includes(p))) {
      const found = checklist.filter((i) => alias.codes.includes(i.kode));
      if (found.length > 0) {
        return {
          itemIds: found.map((i) => i.id),
          matchedCodes: found.map((i) => i.kode),
          confidence: 90,
        };
      }
    }
  }

  if (keywordMatches.length > 0) {
    keywordMatches.sort((a, b) => b.score - a.score);
    const best = keywordMatches.slice(0, 2);
    return {
      itemIds: best.map((b) => b.item.id),
      matchedCodes: best.map((b) => b.item.kode),
      confidence: Math.round(best[0].score * 85),
    };
  }

  return { itemIds: [], matchedCodes: [], confidence: 0 };
}

export function buildSeedTeachers(): TeacherPkgRecord[] {
  const rawTeachers: Array<{
    id: string;
    nama: string;
    nip: string;
    nuptk: string;
    jabatan: string;
    pangkatGolongan: string;
    mapelKelas: string;
    statusSertifikasi: 'Sudah Sertifikasi' | 'Belum Sertifikasi';
    tanggalSupervisi: string;
    statusPkg: 'selesai' | 'proses' | 'belum';
    skorKompetensi: PkgCompetencyScore;
    perangkatAjarLengkap: boolean;
    catatanSupervisi: string;
    rencanaTindakLanjut: string;
  }> = [
    {
      id: 'guru-1',
      nama: 'Siti Aminah, S.Pd.SD',
      nip: '198204152009022004',
      nuptk: '7747760661300012',
      jabatan: 'Guru Kelas VI',
      pangkatGolongan: 'Pembina / IV.a',
      mapelKelas: 'Kelas VI A',
      statusSertifikasi: 'Sudah Sertifikasi',
      tanggalSupervisi: '2026-10-14',
      statusPkg: 'selesai',
      skorKompetensi: {
        pedagogik: [4, 4, 4, 4, 3, 4, 4],
        kepribadian: [4, 4, 4],
        sosial: [4, 4],
        profesional: [4, 3],
      },
      perangkatAjarLengkap: true,
      catatanSupervisi: 'Pengelolaan kelas aktif, asesmen formatif terdokumentasi dengan baik pada Modul Ajar.',
      rencanaTindakLanjut: 'Dilibatkan sebagai mentor penyusunan asesmen diagnostik bagi guru kelas rendah.',
    },
    {
      id: 'guru-2',
      nama: 'Ahmad Fauzi, S.Pd',
      nip: '198709212014031002',
      nuptk: '2253765666130043',
      jabatan: 'Guru Kelas V',
      pangkatGolongan: 'Penata / III.c',
      mapelKelas: 'Kelas V',
      statusSertifikasi: 'Sudah Sertifikasi',
      tanggalSupervisi: '2026-10-18',
      statusPkg: 'selesai',
      skorKompetensi: {
        pedagogik: [4, 3, 4, 3, 3, 4, 3],
        kepribadian: [4, 4, 3],
        sosial: [3, 4],
        profesional: [3, 3],
      },
      perangkatAjarLengkap: true,
      catatanSupervisi: 'Media pembelajaran kontekstual sudah diterapkan, perlu penguatan diferensiasi tugas.',
      rencanaTindakLanjut: 'Pendampingan KKG mini tentang pembelajaran berdiferensiasi pada bulan November.',
    },
    {
      id: 'guru-3',
      nama: 'Rina Marlina, S.Pd',
      nip: '199103112019032009',
      nuptk: '4643769670230072',
      jabatan: 'Guru Kelas IV',
      pangkatGolongan: 'Penata Muda Tk. I / III.b',
      mapelKelas: 'Kelas IV',
      statusSertifikasi: 'Sudah Sertifikasi',
      tanggalSupervisi: '2026-10-24',
      statusPkg: 'selesai',
      skorKompetensi: {
        pedagogik: [3, 3, 4, 4, 3, 3, 4],
        kepribadian: [4, 4, 4],
        sosial: [4, 3],
        profesional: [3, 4],
      },
      perangkatAjarLengkap: true,
      catatanSupervisi: 'Perangkat ajar lengkap dan sistematis; interaksi tanya jawab siswa sangat hidup.',
      rencanaTindakLanjut: 'Dokumentasikan praktik baik literasi kelas untuk diunggah ke arsip inovasi sekolah.',
    },
    {
      id: 'guru-4',
      nama: 'Dedi Kurniawan, S.Pd.I',
      nip: '198511072015021001',
      nuptk: '8439763665130083',
      jabatan: 'Guru PAI & Budi Pekerti',
      pangkatGolongan: 'Penata / III.c',
      mapelKelas: 'Kelas I - VI (PAI)',
      statusSertifikasi: 'Sudah Sertifikasi',
      tanggalSupervisi: '2026-11-04',
      statusPkg: 'selesai',
      skorKompetensi: {
        pedagogik: [3, 3, 3, 3, 3, 4, 3],
        kepribadian: [4, 4, 4],
        sosial: [4, 4],
        profesional: [3, 3],
      },
      perangkatAjarLengkap: true,
      catatanSupervisi: 'Pembiasaan karakter berjalan konsisten, perlu memperbanyak rubrik penilaian praktik ibadah.',
      rencanaTindakLanjut: 'Melengkapi bank instrumen penilaian praktik dan portofolio siswa.',
    },
    {
      id: 'guru-5',
      nama: 'Nurlaela Sari, S.Pd',
      nip: '199506182022212011',
      nuptk: '1950773674230022',
      jabatan: 'Guru Kelas II (PPPK)',
      pangkatGolongan: 'Ahli Pertama / IX',
      mapelKelas: 'Kelas II',
      statusSertifikasi: 'Belum Sertifikasi',
      tanggalSupervisi: '2026-11-10',
      statusPkg: 'proses',
      skorKompetensi: {
        pedagogik: [3, 3, 3, 3, 2, 3, 3],
        kepribadian: [4, 3, 3],
        sosial: [3, 3],
        profesional: [3, 3],
      },
      perangkatAjarLengkap: false,
      catatanSupervisi: 'Observasi tahap I selesai; ATP semester genap masih dalam penyempurnaan.',
      rencanaTindakLanjut: 'Jadwalkan supervisi klinis lanjutan setelah revisi modul ajar numerasi.',
    },
    {
      id: 'guru-6',
      nama: 'Yusuf Hidayat, S.Pd',
      nip: '199302272023211008',
      nuptk: '5559771672130052',
      jabatan: 'Guru PJOK (PPPK)',
      pangkatGolongan: 'Ahli Pertama / IX',
      mapelKelas: 'Kelas I - VI (PJOK)',
      statusSertifikasi: 'Belum Sertifikasi',
      tanggalSupervisi: '',
      statusPkg: 'belum',
      skorKompetensi: {
        pedagogik: [3, 3, 3, 3, 3, 3, 3],
        kepribadian: [3, 3, 3],
        sosial: [3, 3],
        profesional: [3, 3],
      },
      perangkatAjarLengkap: false,
      catatanSupervisi: 'Menunggu jadwal observasi praktik lapangan pada minggu ke-3 November 2026.',
      rencanaTindakLanjut: 'Unggah jadwal supervisi dan perangkat ajar PJOK sebelum pelaksanaan observasi.',
    },
  ];

  return rawTeachers.map((t) => {
    const metrics = calculatePkgMetrics(t.skorKompetensi);
    return {
      ...t,
      ...metrics,
    };
  });
}
