import { ArrowRight, RefreshCw } from 'lucide-react';
import { computeSectionSummaries } from '../data/instrumentData';
import { AppState, SectionCode } from '../types';

export type ActiveTab = 'overview' | 'checklist' | 'pkg' | 'archive' | 'report';

interface OverviewDashboardProps {
  state: AppState;
  isSyncing: boolean;
  onRunSync: () => Promise<void>;
  onNavigate: (tab: ActiveTab, section?: SectionCode) => void;
  onOpenUpload: () => void;
}

export function OverviewDashboard({
  state,
  isSyncing,
  onRunSync,
  onNavigate,
  onOpenUpload,
}: OverviewDashboardProps) {
  const { sections, total } = computeSectionSummaries(state.checklist, state.archive);

  const completedTeachers = state.teachers.filter((t) => t.statusPkg === 'selesai');
  const avgPkgScore =
    completedTeachers.length > 0
      ? (
          completedTeachers.reduce((sum, t) => sum + t.nilaiKonversi, 0) /
          completedTeachers.length
        ).toFixed(1)
      : '0.0';

  const pkgLinkedItems = state.checklist.filter((c) => c.linkedPkgRelated);
  const pkgLinkedDone = pkgLinkedItems.filter((c) => c.status === 'ada').length;

  return (
    <div className="space-y-6">
      {/* School Identity Banner (Single-elevation crisp container) */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-500">
              Instrumen Administrasi Kepala Sekolah · Tahun Pelajaran{' '}
              <span className="font-mono text-slate-700">{state.identity.tahunPelajaran}</span>
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {state.identity.namaSekolah}
            </h1>
            <p className="text-xs text-slate-600">
              NPSN <span className="font-mono">{state.identity.npsn}</span>
              <span aria-hidden="true"> · </span>
              Kepala Sekolah: <span className="font-medium text-slate-800">{state.identity.namaKepalaSekolah}</span>
              <span aria-hidden="true"> · </span>
              Pemeriksa: <span className="font-medium text-slate-800">{state.identity.namaPemeriksa}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onRunSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Otomatis'}
            </button>
            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-800 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-900"
            >
              Unggah & Petakan Dokumen
            </button>
          </div>
        </div>
      </section>

      {/* 4-Column KPI Strip */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Kepatuhan Administrasi</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {total.persenAda}%
            </span>
            <span className="font-mono text-xs text-slate-600 tabular-nums">
              {total.ada}/{total.jumlahButir} butir Ada
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-blue-800 transition-all"
              style={{ width: `${total.persenAda}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Cakupan Arsip Digital</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {total.terarsip}
            </span>
            <span className="font-mono text-xs text-slate-600 tabular-nums">
              butir tertaut · {state.archive.length} berkas
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Setiap unggahan berkas otomatis memperbarui status ceklis.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Rata-rata PKG Guru</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {avgPkgScore}
            </span>
            <span className="font-mono text-xs text-emerald-700 tabular-nums">
              {completedTeachers.length}/{state.teachers.length} guru selesai
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Sinkron dengan {pkgLinkedDone}/{pkgLinkedItems.length} butir supervisi & kepegawaian.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Butir Belum Tersedia / Belum Cek</p>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {total.tidakAda + total.belum}
            </span>
            <span className="font-mono text-xs text-amber-700 tabular-nums">
              {total.tidakAda} Tidak Ada · {total.belum} Belum
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('checklist')}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-800 hover:underline"
          >
            Tindak lanjuti di Ceklis
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </section>

      {/* Main Split: Rekapitulasi A-F Table + Automatic Integration Feed */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left 7 cols: Rekapitulasi Per Bagian */}
        <section className="rounded-xl border border-slate-200 bg-white lg:col-span-7">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Rekapitulasi Administrasi per Bagian (A–F)
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Klik baris bagian untuk membuka daftar butir terkait.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('report')}
              className="whitespace-nowrap text-xs font-medium text-blue-800 hover:underline"
            >
              Lihat Format Resmi
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-4 py-3 font-semibold">Bagian & Uraian</th>
                  <th className="px-3 py-3 text-right font-semibold">Butir</th>
                  <th className="px-3 py-3 text-right font-semibold">Ada</th>
                  <th className="px-3 py-3 text-right font-semibold">Tidak Ada</th>
                  <th className="px-3 py-3 text-right font-semibold">Arsip</th>
                  <th className="px-4 py-3 text-right font-semibold">Capaian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sections.map((sec) => (
                  <tr
                    key={sec.bagian}
                    onClick={() => onNavigate('checklist', sec.bagian)}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <span className="mr-2 font-mono text-blue-800">{sec.bagian}.</span>
                      {sec.uraian}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700 tabular-nums">
                      {sec.jumlahButir}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-medium text-emerald-700 tabular-nums">
                      {sec.ada}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-red-700 tabular-nums">
                      {sec.tidakAda}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700 tabular-nums">
                      {sec.terarsip}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 sm:block">
                          <div
                            className="h-full bg-blue-800"
                            style={{ width: `${sec.persenAda}%` }}
                          />
                        </div>
                        <span className="w-11 font-mono font-medium text-slate-900 tabular-nums">
                          {sec.persenAda}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-300 bg-slate-50 font-semibold text-slate-900">
                  <td className="px-4 py-3">JUMLAH KESELURUHAN</td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums">{total.jumlahButir}</td>
                  <td className="px-3 py-3 text-right font-mono text-emerald-700 tabular-nums">{total.ada}</td>
                  <td className="px-3 py-3 text-right font-mono text-red-700 tabular-nums">{total.tidakAda}</td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums">{total.terarsip}</td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{total.persenAda}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Right 5 cols: Automatic Integration Matrix & Recent Sync Log */}
        <section className="flex flex-col rounded-xl border border-slate-200 bg-white lg:col-span-5">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Riwayat Integrasi Otomatis
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Pembaruan otomatis dari Arsip Digital & Modul PKG Guru.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('pkg')}
              className="whitespace-nowrap text-xs font-medium text-blue-800 hover:underline"
            >
              Buka PKG
            </button>
          </div>

          <div className="divide-y divide-slate-200 overflow-y-auto px-6 py-2 max-h-[380px]">
            {state.syncLogs.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-500">
                Belum ada catatan sinkronisasi otomatis.
              </p>
            ) : (
              state.syncLogs.slice(0, 8).map((log) => (
                <div key={log.id} className="py-3.5">
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span className="font-medium text-blue-800">
                      {log.kategori === 'pkg'
                        ? 'Modul PKG Guru'
                        : log.kategori === 'arsip'
                          ? 'Arsip Digital'
                          : 'Rekapitulasi'}
                    </span>
                    <span className="font-mono tabular-nums">
                      {new Date(log.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-900">{log.judul}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{log.detail}</p>
                  {log.affectedCodes.length > 0 && (
                    <p className="mt-1 font-mono text-[11px] text-slate-500">
                      Butir terdampak: {log.affectedCodes.join(', ')}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
