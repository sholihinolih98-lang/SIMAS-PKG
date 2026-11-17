import { Download, Eye, FileUp, Link2, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SECTION_LABELS } from '../data/instrumentData';
import { AdminChecklistItem, ArchiveDocument, SectionCode } from '../types';

interface ArchiveViewProps {
  archive: ArchiveDocument[];
  checklist: AdminChecklistItem[];
  onOpenUpload: () => void;
  onPreviewDoc: (doc: ArchiveDocument) => void;
  onUpdateLinks: (docId: string, linkedItemIds: string[]) => Promise<void>;
  onDeleteDoc: (docId: string) => Promise<void>;
}

export function ArchiveView({
  archive,
  checklist,
  onOpenUpload,
  onPreviewDoc,
  onUpdateLinks,
  onDeleteDoc,
}: ArchiveViewProps) {
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | ArchiveDocument['sumber']>('ALL');
  const [linkingDoc, setLinkingDoc] = useState<ArchiveDocument | null>(null);
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
  const [linkSearch, setLinkSearch] = useState('');

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return archive.filter((doc) => {
      if (sourceFilter !== 'ALL' && doc.sumber !== sourceFilter) return false;
      if (!q) return true;
      return (
        doc.judul.toLowerCase().includes(q) ||
        doc.namaFileAsli.toLowerCase().includes(q) ||
        doc.matchedCodes.some((c) => c.toLowerCase().includes(q)) ||
        doc.catatan.toLowerCase().includes(q)
      );
    });
  }, [archive, search, sourceFilter]);

  const openLinkEditor = (doc: ArchiveDocument) => {
    setLinkingDoc(doc);
    setSelectedLinkIds(doc.linkedItemIds);
    setLinkSearch('');
  };

  const filteredChecklistForLink = useMemo(() => {
    const q = linkSearch.trim().toLowerCase();
    if (!q) return checklist;
    return checklist.filter(
      (c) =>
        c.kode.toLowerCase().includes(q) ||
        c.jenis.toLowerCase().includes(q) ||
        String(c.no) === q
    );
  }, [checklist, linkSearch]);

  const handleSaveLinks = async () => {
    if (!linkingDoc) return;
    await onUpdateLinks(linkingDoc.id, selectedLinkIds);
    setLinkingDoc(null);
  };

  const linkedItemCount = useMemo(() => {
    const s = new Set<string>();
    archive.forEach((d) => d.linkedItemIds.forEach((id) => s.add(id)));
    return s.size;
  }, [archive]);

  return (
    <div className="space-y-5">
      {/* Header & Stats */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Arsip Dokumen Digital Sekolah</h2>
            <p className="mt-1 text-xs text-slate-600">
              Total <span className="font-mono font-semibold">{archive.length}</span> berkas terarsip
              <span aria-hidden="true"> · </span>
              Menautkan <span className="font-mono font-semibold">{linkedItemCount}/116</span> butir administrasi secara otomatis.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-blue-800 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-900"
          >
            <FileUp className="h-3.5 w-3.5" />
            Unggah Dokumen Baru
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul dokumen, nama berkas, atau kode (PK.1, BKU)..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            {(
              [
                { key: 'ALL', label: 'Semua Sumber' },
                { key: 'unggah_pengguna', label: 'Unggahan Sekolah' },
                { key: 'generator_pkg', label: 'Otomatis PKG' },
                { key: 'lampiran_resmi', label: 'Template PDF' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSourceFilter(opt.key)}
                className={`whitespace-nowrap shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  sourceFilter === opt.key
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Archive Table */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filteredDocs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">
              Belum ada dokumen yang sesuai pencarian.
            </p>
            <button
              type="button"
              onClick={onOpenUpload}
              className="mt-3 rounded-lg bg-blue-800 px-4 py-2 text-xs font-medium text-white hover:bg-blue-900"
            >
              Unggah Dokumen Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="px-5 py-3 font-semibold">Judul & Berkas</th>
                  <th className="w-40 px-3 py-3 font-semibold">Sumber</th>
                  <th className="w-48 px-3 py-3 font-semibold">Kode Instrumen Tertaut</th>
                  <th className="w-32 px-3 py-3 font-semibold">Tanggal</th>
                  <th className="w-48 px-5 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDocs.map((doc) => {
                  const downloadUrl =
                    doc.sumber === 'lampiran_resmi'
                      ? doc.fileUrl
                      : `${doc.fileUrl}?download=1`;
                  return (
                    <tr key={doc.id} className="align-top transition-colors hover:bg-slate-50">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{doc.judul}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                          {doc.namaFileAsli} · {(doc.ukuranByte / 1024).toFixed(1)} KB
                        </p>
                        {doc.catatan && (
                          <p className="mt-1 text-xs text-slate-600">{doc.catatan}</p>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-slate-700">
                        <p className="font-medium">
                          {doc.sumber === 'generator_pkg'
                            ? 'Otomatis PKG'
                            : doc.sumber === 'lampiran_resmi'
                              ? 'Instrumen Resmi'
                              : 'Unggahan'}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">{doc.pengunggah}</p>
                      </td>
                      <td className="px-3 py-3.5">
                        {doc.matchedCodes.length > 0 ? (
                          <div>
                            <p className="font-mono font-medium text-blue-800">
                              {doc.matchedCodes.join(', ')}
                            </p>
                            <p className="mt-0.5 text-[11px] text-emerald-700">
                              Tersinkron ke Ceklis ({doc.autoMatchedConfidence}%)
                            </p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            {doc.sumber === 'lampiran_resmi'
                              ? 'Referensi Master 116 Butir'
                              : 'Belum tertaut ke butir'}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 font-mono text-slate-600 tabular-nums">
                        {new Date(doc.tanggalUnggah).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onPreviewDoc(doc)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="h-3 w-3" />
                            Pratinjau
                          </button>
                          <a
                            href={downloadUrl}
                            download={doc.namaFileAsli}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                            title="Unduh berkas"
                          >
                            <Download className="h-3 w-3" />
                          </a>
                          {doc.sumber !== 'lampiran_resmi' && (
                            <>
                              <button
                                type="button"
                                onClick={() => openLinkEditor(doc)}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                                title="Tautkan ke kode instrumen"
                              >
                                <Link2 className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteDoc(doc.id)}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-red-700 hover:bg-red-50"
                                title="Hapus arsip"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </>
                          )}
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

      {/* Link Editor Modal */}
      {linkingDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Tautkan Dokumen ke Butir Administrasi
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {linkingDoc.judul} · Butir yang dipilih otomatis ditandai ADA.
              </p>
            </div>
            <div className="p-4 border-b border-slate-200">
              <input
                type="text"
                value={linkSearch}
                onChange={(e) => setLinkSearch(e.target.value)}
                placeholder="Cari kode atau nama jenis administrasi..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-700 focus:outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
              {filteredChecklistForLink.map((item) => {
                const checked = selectedLinkIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-center gap-3 px-5 py-2.5 text-xs hover:bg-slate-50 ${
                      checked ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setSelectedLinkIds((prev) =>
                          prev.includes(item.id)
                            ? prev.filter((x) => x !== item.id)
                            : [...prev, item.id]
                        )
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-800"
                    />
                    <span className="w-8 font-mono text-slate-400 tabular-nums">#{item.no}</span>
                    <span className="w-20 font-mono font-semibold text-slate-900">{item.kode}</span>
                    <span className="flex-1 text-slate-700">{item.jenis}</span>
                    <span className="text-[11px] text-slate-500">
                      {SECTION_LABELS[item.bagian as SectionCode].split(' ')[0]}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setLinkingDoc(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveLinks}
                className="rounded-lg bg-blue-800 px-4 py-2 text-xs font-medium text-white hover:bg-blue-900"
              >
                Simpan & Sinkronkan ({selectedLinkIds.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
