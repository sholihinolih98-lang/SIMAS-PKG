import React, { useState } from 'react';
import { Download, ExternalLink, Printer, Save } from 'lucide-react';
import { computeSectionSummaries, SECTION_LABELS, SECTION_ORDER } from '../data/instrumentData';
import { AppState, SchoolIdentity } from '../types';

interface ReportViewProps {
  state: AppState;
  onSaveIdentity: (identity: SchoolIdentity) => Promise<void>;
}

export function ReportView({ state, onSaveIdentity }: ReportViewProps) {
  const [form, setForm] = useState<SchoolIdentity>(state.identity);
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const { sections, total } = computeSectionSummaries(state.checklist, state.archive);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedNotice(false);
    try {
      await onSaveIdentity(form);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCsv = () => {
    const header = ['No', 'Bagian', 'Kode', 'Jenis Administrasi', 'Status', 'Sumber Sinkronisasi', 'Keterangan'];
    const rows = state.checklist.map((c) => [
      c.no,
      `${c.bagian}. ${SECTION_LABELS[c.bagian]}`,
      c.kode,
      `"${c.jenis.replace(/"/g, '""')}"`,
      c.status === 'ada' ? 'ADA' : c.status === 'tidak_ada' ? 'TIDAK ADA' : 'BELUM DIPERIKSA',
      c.syncSource,
      `"${c.keterangan.replace(/"/g, '""')}"`,
    ]);
    const csv = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Instrumen_Administrasi_${form.namaSekolah.replace(/\s+/g, '_')}_${form.tahunPelajaran.replace('/', '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar (Hidden on print) */}
      <section className="no-print rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Laporan Resmi Instrumen & Rekapitulasi Pemeriksaan
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Format identik dengan Instrumen Administrasi Kepala Sekolah (116 butir + tanda tangan pengesahan).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="/assets/aistudio/CEKLIS_ADMINISTRASI_KEPALA_SEKOLAH_76cd8597.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Template PDF Asli
            </a>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              Ekspor CSV
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-blue-800 px-4 py-2 text-xs font-medium text-white hover:bg-blue-900"
            >
              <Printer className="h-3.5 w-3.5" />
              Cetak / Simpan PDF (A4)
            </button>
          </div>
        </div>
      </section>

      {/* Editable Identity & Examiner Notes (Hidden on print) */}
      <form
        onSubmit={handleSave}
        className="no-print rounded-xl border border-slate-200 bg-white p-6 space-y-5"
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Identitas Sekolah, Pemeriksa & Catatan Rekomendasi
          </h3>
          <div className="flex items-center gap-3">
            {savedNotice && (
              <span className="text-xs font-medium text-emerald-700">
                Perubahan tersimpan
              </span>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              {isSaving ? 'Menyimpan...' : 'Simpan Identitas'}
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-slate-700">Nama Sekolah</label>
            <input
              type="text"
              value={form.namaSekolah}
              onChange={(e) => setForm({ ...form, namaSekolah: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">NPSN</label>
            <input
              type="text"
              value={form.npsn}
              onChange={(e) => setForm({ ...form, npsn: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-blue-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Tahun Pelajaran</label>
            <input
              type="text"
              value={form.tahunPelajaran}
              onChange={(e) => setForm({ ...form, tahunPelajaran: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-blue-700 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-slate-700">Alamat Sekolah</label>
            <input
              type="text"
              value={form.alamatSekolah}
              onChange={(e) => setForm({ ...form, alamatSekolah: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Nama Kepala Sekolah</label>
            <input
              type="text"
              value={form.namaKepalaSekolah}
              onChange={(e) => setForm({ ...form, namaKepalaSekolah: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">NIP Kepala Sekolah</label>
            <input
              type="text"
              value={form.nipKepalaSekolah}
              onChange={(e) => setForm({ ...form, nipKepalaSekolah: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-blue-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Tanggal Pemeriksaan</label>
            <input
              type="date"
              value={form.tanggalPemeriksaan}
              onChange={(e) => setForm({ ...form, tanggalPemeriksaan: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-blue-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Nama Pemeriksa / Pengawas</label>
            <input
              type="text"
              value={form.namaPemeriksa}
              onChange={(e) => setForm({ ...form, namaPemeriksa: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">NIP Pemeriksa</label>
            <input
              type="text"
              value={form.nipPemeriksa}
              onChange={(e) => setForm({ ...form, nipPemeriksa: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:border-blue-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700">Tempat Penetapan</label>
            <input
              type="text"
              value={form.tempatPenetapan}
              onChange={(e) => setForm({ ...form, tempatPenetapan: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-700 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700">Catatan Pemeriksa</label>
              <textarea
                rows={3}
                value={form.catatanPemeriksa}
                onChange={(e) => setForm({ ...form, catatanPemeriksa: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">Rekomendasi / Tindak Lanjut</label>
              <textarea
                rows={3}
                value={form.rekomendasiTindakLanjut}
                onChange={(e) => setForm({ ...form, rekomendasiTindakLanjut: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-700 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Official Printable Document Layout */}
      <article className="rounded-xl border border-slate-200 bg-white p-8 print:border-0 print:p-0">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-wider text-blue-900">INSTRUMEN</p>
          <h1 className="mt-1 text-xl font-bold text-slate-900">
            INSTRUMEN ADMINISTRASI KEPALA SEKOLAH
          </h1>
          <p className="text-xs italic text-slate-600">Daftar Kode dan Jenis Administrasi Sekolah</p>
        </div>

        {/* Identitas Table */}
        <div className="mt-6">
          <h2 className="mb-2 text-xs font-bold text-slate-900">Identitas</h2>
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <tbody>
              {[
                ['Nama Sekolah', form.namaSekolah],
                ['NPSN', form.npsn],
                ['Alamat Sekolah', form.alamatSekolah],
                ['Nama Kepala Sekolah', form.namaKepalaSekolah],
                ['NIP', form.nipKepalaSekolah],
                ['Tahun Pelajaran', form.tahunPelajaran],
                [
                  'Hari / Tanggal Pemeriksaan',
                  form.tanggalPemeriksaan
                    ? new Date(form.tanggalPemeriksaan).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-',
                ],
                ['Nama Pemeriksa', form.namaPemeriksa],
              ].map(([label, value]) => (
                <tr key={label} className="border-b border-slate-300">
                  <td className="w-56 bg-slate-50 px-3 py-1.5 font-medium text-slate-800">{label}</td>
                  <td className="px-3 py-1.5 text-slate-900">: {value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Full 6 Sections Checklist */}
        <div className="mt-6 space-y-5">
          {SECTION_ORDER.map((sec) => {
            const items = state.checklist.filter((c) => c.bagian === sec);
            return (
              <div key={sec}>
                <div className="bg-blue-950 px-3 py-1.5 text-xs font-bold text-white">
                  {sec}. {SECTION_LABELS[sec]}
                </div>
                <table className="w-full border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="w-10 border border-slate-300 px-2 py-1.5 text-center">NO</th>
                      <th className="w-24 border border-slate-300 px-2 py-1.5">KODE</th>
                      <th className="border border-slate-300 px-2 py-1.5 text-left">JENIS ADMINISTRASI</th>
                      <th className="w-16 border border-slate-300 px-2 py-1.5 text-center">ADA</th>
                      <th className="w-20 border border-slate-300 px-2 py-1.5 text-center">TIDAK ADA</th>
                      <th className="w-56 border border-slate-300 px-2 py-1.5 text-left">KETERANGAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="border border-slate-300 px-2 py-1 text-center font-mono tabular-nums">
                          {item.no}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 font-mono font-medium">
                          {item.kode}
                        </td>
                        <td className="border border-slate-300 px-2 py-1">{item.jenis}</td>
                        <td className="border border-slate-300 px-2 py-1 text-center font-bold">
                          {item.status === 'ada' ? '✓' : ''}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-center font-bold">
                          {item.status === 'tidak_ada' ? '✓' : ''}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 text-slate-700">
                          {item.keterangan}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>

        {/* Rekapitulasi Hasil Pemeriksaan (Exact Page 4 Table) */}
        <div className="print-break-inside-avoid mt-8">
          <h2 className="mb-2 text-sm font-bold text-blue-950">Rekapitulasi Hasil Pemeriksaan</h2>
          <table className="w-full border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-blue-950 text-white">
                <th className="w-16 border border-slate-300 px-2 py-2 text-center">BAGIAN</th>
                <th className="border border-slate-300 px-3 py-2 text-left">URAIAN</th>
                <th className="w-28 border border-slate-300 px-2 py-2 text-center">JUMLAH BUTIR</th>
                <th className="w-20 border border-slate-300 px-2 py-2 text-center">ADA</th>
                <th className="w-24 border border-slate-300 px-2 py-2 text-center">TIDAK ADA</th>
                <th className="w-24 border border-slate-300 px-2 py-2 text-center">PERSEN (%)</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((sec) => (
                <tr key={sec.bagian}>
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-semibold">
                    {sec.bagian}
                  </td>
                  <td className="border border-slate-300 px-3 py-1.5 font-medium">{sec.uraian}</td>
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-mono tabular-nums">
                    {sec.jumlahButir}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-mono tabular-nums">
                    {sec.ada}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-mono tabular-nums">
                    {sec.tidakAda}
                  </td>
                  <td className="border border-slate-300 px-2 py-1.5 text-center font-mono tabular-nums">
                    {sec.persenAda}%
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-100 font-bold">
                <td colSpan={2} className="border border-slate-300 px-3 py-2 text-center">
                  JUMLAH KESELURUHAN
                </td>
                <td className="border border-slate-300 px-2 py-2 text-center font-mono tabular-nums">
                  {total.jumlahButir}
                </td>
                <td className="border border-slate-300 px-2 py-2 text-center font-mono tabular-nums">
                  {total.ada}
                </td>
                <td className="border border-slate-300 px-2 py-2 text-center font-mono tabular-nums">
                  {total.tidakAda}
                </td>
                <td className="border border-slate-300 px-2 py-2 text-center font-mono tabular-nums">
                  {total.persenAda}%
                </td>
              </tr>
            </tbody>
          </table>

          {/* Catatan & Rekomendasi */}
          <div className="mt-5 space-y-4">
            <div className="border border-slate-800">
              <div className="border-b border-slate-800 bg-slate-200 px-3 py-1 text-xs font-bold text-slate-900">
                Catatan Pemeriksa
              </div>
              <div className="min-h-[60px] px-3 py-2 text-xs text-slate-800">
                {form.catatanPemeriksa || '-'}
              </div>
            </div>

            <div className="border border-slate-800">
              <div className="border-b border-slate-800 bg-slate-200 px-3 py-1 text-xs font-bold text-slate-900">
                Rekomendasi / Tindak Lanjut
              </div>
              <div className="min-h-[60px] px-3 py-2 text-xs text-slate-800">
                {form.rekomendasiTindakLanjut || '-'}
              </div>
            </div>
          </div>

          {/* Signature Block */}
          <div className="mt-10 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Kepala Sekolah</p>
              <div className="h-16" />
              <p className="font-bold underline">{form.namaKepalaSekolah}</p>
              <p className="font-mono">NIP. {form.nipKepalaSekolah}</p>
            </div>
            <div>
              <p>
                {form.tempatPenetapan},{' '}
                {form.tanggalPemeriksaan
                  ? new Date(form.tanggalPemeriksaan).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '.................... 2026'}
              </p>
              <p className="font-bold">Pemeriksa / Pengawas Sekolah</p>
              <div className="h-16" />
              <p className="font-bold underline">{form.namaPemeriksa}</p>
              <p className="font-mono">NIP. {form.nipPemeriksa}</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
