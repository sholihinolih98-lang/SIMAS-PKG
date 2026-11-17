export type SectionCode = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export type ChecklistStatus = 'ada' | 'tidak_ada' | 'belum';

export type SyncSource = 'manual' | 'arsip_otomatis' | 'pkg_otomatis';

export interface SchoolIdentity {
  namaSekolah: string;
  npsn: string;
  alamatSekolah: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  tahunPelajaran: string;
  tanggalPemeriksaan: string;
  namaPemeriksa: string;
  nipPemeriksa: string;
  tempatPenetapan: string;
  catatanPemeriksa: string;
  rekomendasiTindakLanjut: string;
}

export interface AdminChecklistItem {
  id: string;
  no: number;
  bagian: SectionCode;
  kode: string;
  jenis: string;
  status: ChecklistStatus;
  keterangan: string;
  syncSource: SyncSource;
  lastUpdated: string;
  priorityHighlight?: boolean;
  linkedPkgRelated?: boolean;
}

export interface PkgCompetencyScore {
  pedagogik: number[]; // 7 indicators, scale 1-4
  kepribadian: number[]; // 3 indicators, scale 1-4
  sosial: number[]; // 2 indicators, scale 1-4
  profesional: number[]; // 2 indicators, scale 1-4
}

export type PkgPredicate = 'Amat Baik' | 'Baik' | 'Cukup' | 'Sedang' | 'Kurang';

export type PkgStatus = 'selesai' | 'proses' | 'belum';

export interface TeacherPkgRecord {
  id: string;
  nama: string;
  nip: string;
  nuptk: string;
  jabatan: string;
  pangkatGolongan: string;
  mapelKelas: string;
  statusSertifikasi: 'Sudah Sertifikasi' | 'Belum Sertifikasi';
  tanggalSupervisi: string;
  statusPkg: PkgStatus;
  skorKompetensi: PkgCompetencyScore;
  skorTotal: number; // max 56
  nilaiKonversi: number; // 0 - 100
  sebutan: PkgPredicate;
  persentaseAngkaKredit: number; // 125% | 100% | 75% | 50% | 25%
  perangkatAjarLengkap: boolean;
  catatanSupervisi: string;
  rencanaTindakLanjut: string;
  archivedDocId?: string;
}

export interface ArchiveDocument {
  id: string;
  judul: string;
  namaFileAsli: string;
  mimeType: string;
  ukuranByte: number;
  tanggalUnggah: string;
  tahunPelajaran: string;
  pengunggah: string;
  sumber: 'unggah_pengguna' | 'generator_pkg' | 'lampiran_resmi';
  linkedItemIds: string[];
  matchedCodes: string[];
  autoMatchedConfidence: number;
  catatan: string;
  fileUrl: string;
}

export interface SyncLogEntry {
  id: string;
  timestamp: string;
  kategori: 'arsip' | 'pkg' | 'rekap';
  judul: string;
  detail: string;
  affectedCodes: string[];
}

export interface AppState {
  identity: SchoolIdentity;
  checklist: AdminChecklistItem[];
  teachers: TeacherPkgRecord[];
  archive: ArchiveDocument[];
  syncLogs: SyncLogEntry[];
}

export interface SectionSummary {
  bagian: SectionCode;
  uraian: string;
  jumlahButir: number;
  ada: number;
  tidakAda: number;
  belum: number;
  persenAda: number;
  terarsip: number;
}
