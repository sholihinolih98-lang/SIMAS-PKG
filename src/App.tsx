import { useCallback, useEffect, useState } from 'react';
import {
  Archive,
  ClipboardList,
  FileText,
  FileUp,
  GraduationCap,
  LayoutDashboard,
  Printer,
} from 'lucide-react';
import { ArchiveView } from './components/ArchiveView';
import { ChecklistView } from './components/ChecklistView';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { ActiveTab, OverviewDashboard } from './components/OverviewDashboard';
import { PkgDashboardView } from './components/PkgDashboardView';
import { ReportView } from './components/ReportView';
import { UploadModal } from './components/UploadModal';
import { computeSectionSummaries } from './data/instrumentData';
import {
  AppState,
  ArchiveDocument,
  ChecklistStatus,
  SchoolIdentity,
  SectionCode,
  TeacherPkgRecord,
} from './types';

const NAV_ITEMS: Array<{
  id: ActiveTab;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'overview', label: 'Ringkasan Terpadu', icon: LayoutDashboard },
  { id: 'checklist', label: 'Ceklis Administrasi', icon: ClipboardList },
  { id: 'pkg', label: 'Penilaian Kinerja Guru', icon: GraduationCap },
  { id: 'archive', label: 'Arsip Dokumen Digital', icon: Archive },
  { id: 'report', label: 'Laporan & Rekapitulasi', icon: FileText },
];

export default function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [checklistInitialSection, setChecklistInitialSection] = useState<SectionCode | 'ALL'>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTargetItemId, setUploadTargetItemId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ArchiveDocument | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  const fetchState = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await fetch('/api/state');
      if (!res.ok) throw new Error('Gagal memuat data aplikasi');
      const data = (await res.json()) as AppState;
      setState(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const handleNavigate = (tab: ActiveTab, section?: SectionCode) => {
    if (tab === 'checklist') {
      setChecklistInitialSection(section || 'ALL');
    }
    setActiveTab(tab);
  };

  const handleRunSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync/run', { method: 'POST' });
      if (!res.ok) throw new Error('Gagal menyinkronkan');
      const data = (await res.json()) as { state: AppState; affectedCodes: string[] };
      setState(data.state);
      showToast(
        data.affectedCodes.length > 0
          ? `Sinkronisasi selesai: ${data.affectedCodes.length} butir diperbarui (${data.affectedCodes.join(', ')})`
          : 'Semua butir sudah sinkron dengan Arsip Digital & PKG.'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateChecklistItem = async (
    id: string,
    patch: { status?: ChecklistStatus; keterangan?: string }
  ) => {
    const res = await fetch(`/api/checklist/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) return;
    const { item } = await res.json();
    setState((prev) =>
      prev
        ? {
            ...prev,
            checklist: prev.checklist.map((c) => (c.id === id ? item : c)),
          }
        : prev
    );
  };

  const handleSaveTeacher = async (
    teacherId: string | null,
    payload: Partial<TeacherPkgRecord> & { publishToArchive?: boolean }
  ) => {
    const url = teacherId ? `/api/teachers/${teacherId}` : '/api/teachers';
    const method = teacherId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Gagal menyimpan data PKG');
    const data = (await res.json()) as { state: AppState };
    setState(data.state);
    showToast('Nilai PKG disimpan & disinkronkan ke Ceklis Administrasi serta Arsip Digital.');
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    const res = await fetch(`/api/teachers/${teacherId}`, { method: 'DELETE' });
    if (!res.ok) return;
    const data = (await res.json()) as { state: AppState };
    setState(data.state);
    showToast('Data guru diperbarui.');
  };

  const handleUploadDocument = async (payload: {
    judul: string;
    namaFileAsli: string;
    mimeType: string;
    base64Data: string;
    catatan: string;
    manualItemIds: string[];
    autoSyncChecklist: boolean;
  }) => {
    const res = await fetch('/api/archive/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || 'Gagal mengunggah dokumen');
    }
    const data = (await res.json()) as { state: AppState; syncedCodes: string[] };
    setState(data.state);
    showToast(
      data.syncedCodes.length > 0
        ? `Dokumen diarsipkan & otomatis menandai ADA: ${data.syncedCodes.join(', ')}`
        : 'Dokumen berhasil disimpan ke Arsip Digital.'
    );
  };

  const handleUpdateArchiveLinks = async (docId: string, linkedItemIds: string[]) => {
    const res = await fetch(`/api/archive/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkedItemIds }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { state: AppState };
    setState(data.state);
    showToast('Tautan dokumen & status ceklis diperbarui.');
  };

  const handleDeleteArchiveDoc = async (docId: string) => {
    const res = await fetch(`/api/archive/${docId}`, { method: 'DELETE' });
    if (!res.ok) return;
    const data = (await res.json()) as { state: AppState };
    setState(data.state);
    showToast('Dokumen dihapus dari arsip digital.');
  };

  const handleSaveIdentity = async (identity: SchoolIdentity) => {
    const res = await fetch('/api/identity', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(identity),
    });
    if (!res.ok) return;
    const data = await res.json();
    setState((prev) =>
      prev ? { ...prev, identity: data.identity, syncLogs: data.syncLogs } : prev
    );
    showToast('Identitas sekolah & catatan pemeriksaan tersimpan.');
  };

  const openUploadGeneral = () => {
    setUploadTargetItemId(null);
    setUploadOpen(true);
  };

  const openUploadForItem = (itemId: string) => {
    setUploadTargetItemId(itemId);
    setUploadOpen(true);
  };

  const currentNavLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label || 'Ringkasan';
  const summaryTotal = state
    ? computeSectionSummaries(state.checklist, state.archive).total
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      {/* Sidebar Navigation (260px) */}
      <aside className="no-print hidden lg:flex lg:w-[260px] lg:shrink-0 lg:flex-col lg:border-r lg:border-slate-200 lg:bg-white">
        <div className="flex h-16 items-center border-b border-slate-200 px-6">
          <button
            type="button"
            onClick={() => handleNavigate('overview')}
            className="text-left text-base font-bold tracking-tight text-slate-900 whitespace-nowrap"
          >
            SIMAS PKG
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4" aria-label="Menu Utama">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`flex w-full items-center gap-3 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-left text-xs font-medium transition-colors ${
                  active
                    ? 'bg-blue-800 text-white'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {state && summaryTotal && (
          <div className="border-t border-slate-200 p-5 text-xs">
            <p className="font-semibold text-slate-900 truncate">{state.identity.namaSekolah}</p>
            <p className="mt-0.5 font-mono text-[11px] text-slate-500">
              NPSN {state.identity.npsn} · TP {state.identity.tahunPelajaran}
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-600">
              <span>Kelengkapan Butir</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {summaryTotal.ada}/{summaryTotal.jumlahButir} ({summaryTotal.persenAda}%)
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-blue-800"
                style={{ width: `${summaryTotal.persenAda}%` }}
              />
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header Contract */}
        <header className="no-print sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <span className="font-semibold text-slate-900 whitespace-nowrap lg:hidden">
              SIMAS PKG
            </span>
            <span className="text-slate-400 lg:hidden" aria-hidden="true">
              /
            </span>
            <span className="hidden font-medium text-slate-500 whitespace-nowrap lg:inline">
              {state?.identity.namaSekolah || 'SDN 1 SUKAJAYA'}
            </span>
            <span className="hidden text-slate-400 lg:inline" aria-hidden="true">
              /
            </span>
            <span className="truncate font-semibold text-slate-900">{currentNavLabel}</span>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              onClick={openUploadGeneral}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <FileUp className="h-3.5 w-3.5" />
              Unggah Dokumen
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('report')}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-lg bg-blue-800 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-900"
            >
              <Printer className="h-3.5 w-3.5" />
              Laporan Resmi
            </button>
          </div>
        </header>

        {/* Mobile Tab Strip (< lg) */}
        <div className="no-print flex items-center gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigate(item.id)}
              className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-800 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="no-print mx-4 mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-medium text-blue-900 sm:mx-6 lg:mx-8">
            {toastMessage}
          </div>
        )}

        {/* Viewport Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 print:p-0">
          <div className="mx-auto max-w-[1280px]">
            {loading ? (
              <div className="space-y-4">
                <div className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white" />
                <div className="grid gap-4 sm:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white"
                    />
                  ))}
                </div>
                <div className="h-80 animate-pulse rounded-xl border border-slate-200 bg-white" />
              </div>
            ) : loadError || !state ? (
              <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
                <p className="text-sm font-semibold text-red-700">
                  {loadError || 'Gagal memuat data aplikasi.'}
                </p>
                <button
                  type="button"
                  onClick={fetchState}
                  className="mt-4 rounded-lg bg-blue-800 px-4 py-2 text-xs font-medium text-white hover:bg-blue-900"
                >
                  Muat Ulang
                </button>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && (
                  <OverviewDashboard
                    state={state}
                    isSyncing={isSyncing}
                    onRunSync={handleRunSync}
                    onNavigate={handleNavigate}
                    onOpenUpload={openUploadGeneral}
                  />
                )}
                {activeTab === 'checklist' && (
                  <ChecklistView
                    key={checklistInitialSection}
                    checklist={state.checklist}
                    archive={state.archive}
                    initialSection={checklistInitialSection}
                    onUpdateItem={handleUpdateChecklistItem}
                    onOpenUploadForItem={openUploadForItem}
                    onPreviewDoc={setPreviewDoc}
                  />
                )}
                {activeTab === 'pkg' && (
                  <PkgDashboardView
                    teachers={state.teachers}
                    archive={state.archive}
                    onSaveTeacher={handleSaveTeacher}
                    onDeleteTeacher={handleDeleteTeacher}
                    onPreviewDoc={setPreviewDoc}
                  />
                )}
                {activeTab === 'archive' && (
                  <ArchiveView
                    archive={state.archive}
                    checklist={state.checklist}
                    onOpenUpload={openUploadGeneral}
                    onPreviewDoc={setPreviewDoc}
                    onUpdateLinks={handleUpdateArchiveLinks}
                    onDeleteDoc={handleDeleteArchiveDoc}
                  />
                )}
                {activeTab === 'report' && (
                  <ReportView state={state} onSaveIdentity={handleSaveIdentity} />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {state && (
        <UploadModal
          isOpen={uploadOpen}
          checklist={state.checklist}
          preselectedItemId={uploadTargetItemId}
          onClose={() => setUploadOpen(false)}
          onUpload={handleUploadDocument}
        />
      )}
      <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
}
