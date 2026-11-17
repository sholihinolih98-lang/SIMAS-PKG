import { Eye, FileUp, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SECTION_LABELS, SECTION_ORDER } from '../data/instrumentData';
import {
  AdminChecklistItem,
  ArchiveDocument,
  ChecklistStatus,
  SectionCode,
} from '../types';

interface ChecklistViewProps {
  checklist: AdminChecklistItem[];
  archive: ArchiveDocument[];
  initialSection?: SectionCode | 'ALL';
  onUpdateItem: (id: string, patch: { status?: ChecklistStatus; keterangan?: string }) => Promise<void>;
  onOpenUploadForItem: (itemId: string) => void;
  onPreviewDoc: (doc: ArchiveDocument) => void;
}

export function ChecklistView({
  checklist,
  archive,
  initialSection = 'ALL',
  onUpdateItem,
  onOpenUploadForItem,
  onPreviewDoc,
}: ChecklistViewProps) {
  const [sectionFilter, setSectionFilter] = useState<SectionCode | 'ALL'>(initialSection);
  const [statusFilter, setStatusFilter] = useState<ChecklistStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');

  // Map checklist item ID -> linked archive documents
  const docsByItemId = useMemo(() => {
    const map = new Map<string, ArchiveDocument[]>();
    for (const doc of archive) {
      for (const itemId of doc.linkedItemIds) {
        const list = map.get(itemId) || [];
        list.push(doc);
        map.set(itemId, list);
      }
    }
    return map;
  }, [archive]);

  const sectionCounts = useMemo(() => {
    const counts: Record<string, { total: number; ada: number }> = {
      ALL: {
        total: checklist.length,
        ada: checklist.filter((c) => c.status === 'ada').length,
      },
    };
    for (const sec of SECTION_ORDER) {
      const items = checklist.filter((c) => c.bagian === sec);
      counts[sec] = {
        total: items.length,
        ada: items.filter((c) => c.status === 'ada').length,
      };
    }
    return counts;
  }, [checklist]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return checklist.filter((item) => {
      if (sectionFilter !== 'ALL' && item.bagian !== sectionFilter) return false;
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.kode.toLowerCase().includes(q) ||
        item.jenis.toLowerCase().includes(q) ||
        item.keterangan.toLowerCase().includes(q) ||
        String(item.no) === q
      );
    });
  }, [checklist, sectionFilter, statusFilter, searchQuery]);

  const startEditNote = (item: AdminChecklistItem) => {
    setEditingNoteId(item.id);
    setNoteDraft(item.keterangan);
  };

  const commitNote = async (item: AdminChecklistItem) => {
    setEditingNoteId(null);
    if (noteDraft !== item.keterangan) {
      await onUpdateItem(item.id, { keterangan: noteDraft });
    }
  };

  return (
    <div className="space-y-5">
      {/* Section Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSectionFilter('ALL')}
            className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              sectionFilter === 'ALL'
                ? 'bg-blue-800 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Bagian ({sectionCounts.ALL.ada}/{sectionCounts.ALL.total})
          </button>
          {SECTION_ORDER.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSectionFilter(sec)}
              className={`whitespace-nowrap shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                sectionFilter === sec
                  ? 'bg-blue-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {sec}. {SECTION_LABELS[sec].split(' ')[0]} ({sectionCounts[sec].ada}/
              {sectionCounts[sec].total})
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor, kode (PK.1, S-4, BKU), atau nama administrasi..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
            {(
              [
                { key: 'ALL', label: 'Semua' },
                { key: 'ada', label: 'Ada' },
                { key: 'tidak_ada', label: 'Tidak Ada' },
                { key: 'belum', label: 'Belum Cek' },
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
      </div>

      {/* Checklist Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <p className="text-xs font-semibold text-slate-800">
            {sectionFilter === 'ALL'
              ? 'Daftar Lengkap 116 Butir Instrumen Administrasi Kepala Sekolah'
              : `${sectionFilter}. ${SECTION_LABELS[sectionFilter]}`}
          </p>
          <p className="font-mono text-xs text-slate-500 tabular-nums">
            Menampilkan {filteredItems.length} butir
          </p>
        </div>

        {filteredItems.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">
              Tidak ada butir administrasi yang sesuai dengan filter saat ini.
            </p>
            <button
              type="button"
              onClick={() => {
                setSectionFilter('ALL');
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Atur Ulang Filter
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
                  <th className="w-12 px-4 py-3 font-semibold">No</th>
                  <th className="w-28 px-3 py-3 font-semibold">Kode</th>
                  <th className="px-3 py-3 font-semibold">Jenis Administrasi</th>
                  <th className="w-56 px-3 py-3 font-semibold">Status Pemeriksaan</th>
                  <th className="w-56 px-3 py-3 font-semibold">Arsip Digital Terkait</th>
                  <th className="w-64 px-4 py-3 font-semibold">Keterangan & Sumber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.map((item) => {
                  const linkedDocs = docsByItemId.get(item.id) || [];
                  const isEditing = editingNoteId === item.id;

                  return (
                    <tr key={item.id} className="align-top transition-colors hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono text-slate-500 tabular-nums">
                        {item.no}
                      </td>
                      <td className="px-3 py-3 font-mono font-semibold text-slate-900">
                        {item.kode}
                      </td>
                      <td className="px-3 py-3">
                        <p
                          className={`font-medium ${
                            item.priorityHighlight ? 'text-red-700' : 'text-slate-900'
                          }`}
                        >
                          {item.jenis}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          Bagian {item.bagian}
                          {item.linkedPkgRelated ? ' · Terintegrasi PKG' : ''}
                          {item.priorityHighlight ? ' · Perhatian khusus instrumen' : ''}
                        </p>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="inline-flex rounded-lg bg-slate-100 p-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateItem(item.id, { status: 'ada' })}
                            className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                              item.status === 'ada'
                                ? 'bg-emerald-700 text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Ada
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateItem(item.id, { status: 'tidak_ada' })}
                            className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                              item.status === 'tidak_ada'
                                ? 'bg-red-700 text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Tidak Ada
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateItem(item.id, { status: 'belum' })}
                            className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                              item.status === 'belum'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Belum
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        {linkedDocs.length > 0 ? (
                          <div className="space-y-1">
                            {linkedDocs.map((doc) => (
                              <button
                                key={doc.id}
                                type="button"
                                onClick={() => onPreviewDoc(doc)}
                                className="flex w-full items-center gap-1.5 text-left text-[11px] font-medium text-blue-800 hover:underline"
                              >
                                <Eye className="h-3 w-3 shrink-0" />
                                <span className="truncate">{doc.judul}</span>
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => onOpenUploadForItem(item.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800"
                            >
                              <FileUp className="h-3 w-3" />
                              Tambah berkas
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenUploadForItem(item.id)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
                          >
                            <FileUp className="h-3 w-3" />
                            Unggah & Tautkan
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        {isEditing ? (
                          <input
                            type="text"
                            autoFocus
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            onBlur={() => commitNote(item)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitNote(item);
                              if (e.key === 'Escape') setEditingNoteId(null);
                            }}
                            className="w-full rounded-md border border-blue-700 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditNote(item)}
                            className="w-full text-left group"
                          >
                            <p className="text-xs text-slate-700 group-hover:text-slate-900">
                              {item.keterangan || (
                                <span className="text-slate-400 italic">
                                  Klik untuk tambah keterangan...
                                </span>
                              )}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {item.syncSource === 'arsip_otomatis'
                                ? 'Sinkron: Arsip Otomatis'
                                : item.syncSource === 'pkg_otomatis'
                                  ? 'Sinkron: PKG Otomatis'
                                  : 'Input: Manual'}
                            </p>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
