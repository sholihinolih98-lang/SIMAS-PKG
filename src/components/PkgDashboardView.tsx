import React, { useMemo, useState } from 'react';
import { ClipboardCheck, Eye, Plus, Search, Trash2, X } from 'lucide-react';
import { calculatePkgMetrics, PKG_COMPETENCIES } from '../data/instrumentData';
import {
  ArchiveDocument,
  PkgCompetencyScore,
  PkgStatus,
  TeacherPkgRecord,
} from '../types';

interface PkgDashboardViewProps {
  teachers: TeacherPkgRecord[];
  archive: ArchiveDocument[];
  onSaveTeacher: (
    teacherId: string | null,
    payload: Partial<TeacherPkgRecord> & { publishToArchive?: boolean }
  ) => Promise<void>;
  onDeleteTeacher: (teacherId: string) => Promise<void>;
  onPreviewDoc: (doc: ArchiveDocument) => void;
}

const DEFAULT_SCORES: PkgCompetencyScore = {
  pedagogik: [3, 3, 3, 3, 3, 3, 3],
  kepribadian: [3, 3, 3],
  sosial: [3, 3],
  profesional: [3, 3],
};

export function PkgDashboardView({
  teachers,
  archive,
  onSaveTeacher,
  onDeleteTeacher,
  onPreviewDoc,
}: PkgDashboardViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PkgStatus>('ALL');
  const [editingTeacher, setEditingTeacher] = useState<TeacherPkgRecord | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Modal Form State
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [nuptk, setNuptk] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [pangkatGolongan, setPangkatGolongan] = useState('');
  const [mapelKelas, setMapelKelas] = useState('');
  const [statusSertifikasi, setStatusSertifikasi] = useState<'Sudah Sertifikasi' | 'Belum Sertifikasi'>('Sudah Sertifikasi');
  const [tanggalSupervisi, setTanggalSupervisi] = useState('');
  const [statusPkg, setStatusPkg] = useState<PkgStatus>('selesai');
  const [perangkatAjarLengkap, setPerangkatAjarLengkap] = useState(true);
  const [catatanSupervisi, setCatatanSupervisi] = useState('');
  const [rencanaTindakLanjut, setRencanaTindakLanjut] = useState('');
  const [skorKompetensi, setSkorKompetensi] = useState<PkgCompetencyScore>(DEFAULT_SCORES);
  const [publishToArchive, setPublishToArchive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const liveMetrics = useMemo(() => calculatePkgMetrics(skorKompetensi), [skorKompetensi]);

  const stats = useMemo(() => {
    const selesai = teachers.filter((t) => t.statusPkg === 'selesai');
    const proses = teachers.filter((t) => t.statusPkg === 'proses');
    const belum = teachers.filter((t) => t.statusPkg === 'belum');
    const avg =
      selesai.length > 0
        ? (selesai.reduce((s, t) => s + t.nilaiKonversi, 0) / selesai.length).toFixed(1)
        : '0.0';
    const amatBaik = selesai.filter((t) => t.sebutan === 'Amat Baik').length;
    const lengkapRpp = teachers.filter((t) => t.perangkatAjarLengkap).length;
    return {
      total: teachers.length,
      selesai: selesai.length,
      proses: proses.length,
      belum: belum.length,
      avg,
      amatBaik,
      lengkapRpp,
    };
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return teachers.filter((t) => {
      if (statusFilter !== 'ALL' && t.statusPkg !== statusFilter) return false;
      if (!q) return true;
      return (
        t.nama.toLowerCase().includes(q) ||
        t.nip.toLowerCase().includes(q) ||
        t.jabatan.toLowerCase().includes(q) ||
        t.mapelKelas.toLowerCase().includes(q)
      );
    });
  }, [teachers, search, statusFilter]);

  const openEditModal = (teacher: TeacherPkgRecord) => {
    setIsAddingNew(false);
    setEditingTeacher(teacher);
    setNama(teacher.nama);
    setNip(teacher.nip);
    setNuptk(teacher.nuptk);
    setJabatan(teacher.jabatan);
    setPangkatGolongan(teacher.pangkatGolongan);
    setMapelKelas(teacher.mapelKelas);
    setStatusSertifikasi(teacher.statusSertifikasi);
    setTanggalSupervisi(teacher.tanggalSupervisi);
    setStatusPkg(teacher.statusPkg);
    setPerangkatAjarLengkap(teacher.perangkatAjarLengkap);
    setCatatanSupervisi(teacher.catatanSupervisi);
    setRencanaTindakLanjut(teacher.rencanaTindakLanjut);
    setSkorKompetensi({
      pedagogik: [...teacher.skorKompetensi.pedagogik],
      kepribadian: [...teacher.skorKompetensi.kepribadian],
      sosial: [...teacher.skorKompetensi.sosial],
      profesional: [...teacher.skorKompetensi.profesional],
    });
    setPublishToArchive(true);
  };

  const openAddModal = () => {
    setIsAddingNew(true);
    setEditingTeacher(null);
    setNama('');
    setNip('');
    setNuptk('');
    setJabatan('Guru Kelas');
    setPangkatGolongan('Penata Muda / III.a');
    setMapelKelas('Kelas I');
    setStatusSertifikasi('Belum Sertifikasi');
    setTanggalSupervisi(new Date().toISOString().slice(0, 10));
    setStatusPkg('proses');
    setPerangkatAjarLengkap(false);
    setCatatanSupervisi('');
    setRencanaTindakLanjut('');
    setSkorKompetensi({
      pedagogik: [...DEFAULT_SCORES.pedagogik],
      kepribadian: [...DEFAULT_SCORES.kepribadian],
      sosial: [...DEFAULT_SCORES.sosial],
      profesional: [...DEFAULT_SCORES.profesional],
    });
    setPublishToArchive(true);
  };

  const closeModal = () => {
    setEditingTeacher(null);
    setIsAddingNew(false);
  };

  const updateIndicatorScore = (
    compKey: keyof PkgCompetencyScore,
    index: number,
    value: number
  ) => {
    setSkorKompetensi((prev) => {
      const next = [...prev[compKey]];
      next[index] = value;
      return { ...prev, [compKey]: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;
    setIsSaving(true);
    try {
      await onSaveTeacher(editingTeacher ? editingTeacher.id : null, {
        nama: nama.trim(),
        nip: nip.trim() || '-',
        nuptk: nuptk.trim() || '-',
        jabatan: jabatan.trim() || 'Guru Kelas',
        pangkatGolongan: pangkatGolongan.trim() || '-',
        mapelKelas: mapelKelas.trim() || '-',
        statusSertifikasi,
        tanggalSupervisi,
        statusPkg,
        perangkatAjarLengkap,
        catatanSupervisi: catatanSupervisi.trim(),
        rencanaTindakLanjut: rencanaTindakLanjut.trim(),
        skorKompetensi,
        publishToArchive: publishToArchive && statusPkg === 'selesai',
      });
      closeModal();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top PKG Summary Strip */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Progres Evaluasi PKG</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {stats.selesai}/{stats.total}
            </span>
            <span className="font-mono text-xs text-slate-600 tabular-nums">
              {stats.proses} proses · {stats.belum} belum
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Menyinkronkan butir PK.8 & PEG.6 otomatis.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Rata-rata Nilai Konversi</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {stats.avg}
            </span>
            <span className="text-xs font-medium text-emerald-700">
              {stats.amatBaik} guru Amat Baik
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Skala 14 indikator kompetensi (Permendiknas 35/2010).
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Kesiapan Perangkat Ajar</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {stats.lengkapRpp}/{stats.total}
            </span>
            <span className="font-mono text-xs text-slate-600 tabular-nums">
              {stats.total > 0 ? Math.round((stats.lengkapRpp / stats.total) * 100) : 0}% lengkap
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Terhubung langsung dengan butir PK.3.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Sinkronisasi ke Instrumen</p>
          <p className="mt-2 font-mono text-xs font-semibold text-blue-900">
            PK.2 · PK.3 · PK.8 · P.Pk.8.a · P.Pk.8.b · PEG.6 · PEG.7 · PEG.18
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Laporan PKG selesai otomatis terbit di Arsip Digital.
          </p>
        </div>
      </section>

      {/* Toolbar */}
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama guru, NIP, jabatan, atau kelas..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {(
                [
                  { key: 'ALL', label: 'Semua' },
                  { key: 'selesai', label: 'Selesai' },
                  { key: 'proses', label: 'Proses' },
                  { key: 'belum', label: 'Belum' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setStatusFilter(opt.key)}
                  className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === opt.key
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 rounded-lg bg-blue-800 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-900"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah Guru
          </button>
        </div>
      </section>

      {/* Teacher Roster Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filteredTeachers.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">
              Tidak ada data guru yang sesuai filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-5 py-3 font-semibold">Pendidik & NIP</th>
                  <th className="px-3 py-3 font-semibold">Jabatan & Tugas</th>
                  <th className="px-3 py-3 font-semibold">Status PKG & Perangkat</th>
                  <th className="px-3 py-3 text-right font-semibold">Skor (56)</th>
                  <th className="px-3 py-3 text-right font-semibold">Nilai PKG</th>
                  <th className="px-3 py-3 font-semibold">Sebutan</th>
                  <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTeachers.map((teacher) => {
                  const linkedDoc =
                    archive.find((d) => d.id === teacher.archivedDocId) ||
                    archive.find((d) => d.id === 'doc-seed-pkg-rekap');

                  return (
                    <tr key={teacher.id} className="align-top transition-colors hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{teacher.nama}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                          NIP. {teacher.nip} · {teacher.pangkatGolongan}
                        </p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-medium text-slate-800">{teacher.jabatan}</p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {teacher.mapelKelas} · {teacher.statusSertifikasi}
                        </p>
                      </td>
                      <td className="px-3 py-3.5">
                        <p
                          className={`font-medium ${
                            teacher.statusPkg === 'selesai'
                              ? 'text-emerald-700'
                              : teacher.statusPkg === 'proses'
                                ? 'text-amber-700'
                                : 'text-slate-600'
                          }`}
                        >
                          {teacher.statusPkg === 'selesai'
                            ? 'Selesai Dinilai'
                            : teacher.statusPkg === 'proses'
                              ? 'Sedang Proses'
                              : 'Belum Dinilai'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Perangkat ajar: {teacher.perangkatAjarLengkap ? 'Lengkap' : 'Belum Lengkap'}
                        </p>
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono text-slate-700 tabular-nums">
                        {teacher.skorTotal}/56
                      </td>
                      <td className="px-3 py-3.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {teacher.nilaiKonversi.toFixed(1)}
                      </td>
                      <td className="px-3 py-3.5">
                        <p className="font-medium text-slate-900">{teacher.sebutan}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                          AK {teacher.persentaseAngkaKredit}%
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditModal(teacher)}
                            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
                          >
                            <ClipboardCheck className="h-3.5 w-3.5 text-blue-800" />
                            Nilai PKG
                          </button>
                          {linkedDoc && (
                            <button
                              type="button"
                              onClick={() => onPreviewDoc(linkedDoc)}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                              title="Pratinjau Laporan PKG di Arsip"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onDeleteTeacher(teacher.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-medium text-red-700 hover:bg-red-50"
                            title="Hapus data guru"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal Penilaian PKG 14 Indikator */}
      {(editingTeacher || isAddingNew) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-label="Formulir Penilaian Kinerja Guru"
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  {isAddingNew ? 'Tambah Data Guru & Penilaian PKG' : `Instrumen PKG — ${editingTeacher?.nama}`}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Penilaian 14 indikator terhubung otomatis dengan Ceklis PK.2, PK.3, PK.8, PEG.6, dan Arsip Digital.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto p-6">
              {/* Live Score Banner */}
              <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Skor Total</p>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">
                    {liveMetrics.skorTotal} / 56
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Nilai Konversi PKG</p>
                  <p className="mt-1 font-mono text-lg font-bold text-blue-900 tabular-nums">
                    {liveMetrics.nilaiKonversi.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Sebutan Predikat</p>
                  <p className="mt-1 text-base font-bold text-emerald-700">{liveMetrics.sebutan}</p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Persentase Angka Kredit</p>
                  <p className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">
                    {liveMetrics.persentaseAngkaKredit}%
                  </p>
                </div>
              </div>

              {/* Teacher Profile Fields */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">NIP / NI PPPK</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">NUPTK</label>
                  <input
                    type="text"
                    value={nuptk}
                    onChange={(e) => setNuptk(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Jabatan</label>
                  <input
                    type="text"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Pangkat / Golongan</label>
                  <input
                    type="text"
                    value={pangkatGolongan}
                    onChange={(e) => setPangkatGolongan(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Kelas / Mata Pelajaran</label>
                  <input
                    type="text"
                    value={mapelKelas}
                    onChange={(e) => setMapelKelas(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Status Sertifikasi</label>
                  <select
                    value={statusSertifikasi}
                    onChange={(e) =>
                      setStatusSertifikasi(e.target.value as 'Sudah Sertifikasi' | 'Belum Sertifikasi')
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
                  >
                    <option value="Sudah Sertifikasi">Sudah Sertifikasi</option>
                    <option value="Belum Sertifikasi">Belum Sertifikasi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Tanggal Supervisi</label>
                  <input
                    type="date"
                    value={tanggalSupervisi}
                    onChange={(e) => setTanggalSupervisi(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">Status Penilaian PKG</label>
                  <select
                    value={statusPkg}
                    onChange={(e) => setStatusPkg(e.target.value as PkgStatus)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
                  >
                    <option value="selesai">Selesai Dinilai</option>
                    <option value="proses">Sedang Proses</option>
                    <option value="belum">Belum Dinilai</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={perangkatAjarLengkap}
                    onChange={(e) => setPerangkatAjarLengkap(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-800"
                  />
                  Perangkat Ajar Lengkap (Sinkron ke butir PK.3)
                </label>
                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={publishToArchive}
                    onChange={(e) => setPublishToArchive(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-800"
                  />
                  Otomatis terbitkan Laporan PKG ke Arsip Digital saat status Selesai
                </label>
              </div>

              {/* 14-Indicator Scoring Matrix */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-900">
                    Skor 14 Indikator Kompetensi Guru (Skala 1 = Kurang, 2 = Cukup, 3 = Baik, 4 = Amat Baik)
                  </h4>
                </div>
                {PKG_COMPETENCIES.map((comp) => (
                  <div key={comp.key} className="overflow-hidden rounded-lg border border-slate-200">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-800">
                      {comp.label}
                    </div>
                    <div className="divide-y divide-slate-200">
                      {comp.indicators.map((label, idx) => {
                        const val = skorKompetensi[comp.key][idx] ?? 3;
                        return (
                          <div
                            key={label}
                            className="flex flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <span className="text-xs text-slate-700">{label}</span>
                            <div className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-slate-100 p-0.5">
                              {[1, 2, 3, 4].map((score) => (
                                <button
                                  key={score}
                                  type="button"
                                  onClick={() => updateIndicatorScore(comp.key, idx, score)}
                                  className={`h-7 w-9 rounded-md font-mono text-xs font-semibold transition-colors ${
                                    val === score
                                      ? 'bg-blue-800 text-white'
                                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                                  }`}
                                >
                                  {score}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Supervisi Notes */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Catatan Hasil Supervisi Kelas
                  </label>
                  <textarea
                    rows={3}
                    value={catatanSupervisi}
                    onChange={(e) => setCatatanSupervisi(e.target.value)}
                    placeholder="Temuan kekuatan dan aspek pengembangan dalam pembelajaran..."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700">
                    Rencana Tindak Lanjut (Sinkron ke P.Pk.8.b)
                  </label>
                  <textarea
                    rows={3}
                    value={rencanaTindakLanjut}
                    onChange={(e) => setRencanaTindakLanjut(e.target.value)}
                    placeholder="Langkah pendampingan, KKG, atau workshop lanjutan..."
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-blue-800 px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-900 disabled:opacity-60"
                >
                  {isSaving ? 'Menyimpan & Menyinkronkan...' : 'Simpan & Sinkronkan PKG'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
