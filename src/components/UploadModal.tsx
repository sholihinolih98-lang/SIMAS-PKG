import React, { useEffect, useMemo, useState } from 'react';
import { FileUp, Search, X } from 'lucide-react';
import { matchDocumentToInstrument, SECTION_LABELS } from '../data/instrumentData';
import { AdminChecklistItem, SectionCode } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  checklist: AdminChecklistItem[];
  preselectedItemId?: string | null;
  onClose: () => void;
  onUpload: (payload: {
    judul: string;
    namaFileAsli: string;
    mimeType: string;
    base64Data: string;
    catatan: string;
    manualItemIds: string[];
    autoSyncChecklist: boolean;
  }) => Promise<void>;
}

export function UploadModal({
  isOpen,
  checklist,
  preselectedItemId,
  onClose,
  onUpload,
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [judul, setJudul] = useState('');
  const [catatan, setCatatan] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [autoSyncChecklist, setAutoSyncChecklist] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [sectionFilter, setSectionFilter] = useState<SectionCode | 'ALL'>('ALL');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setJudul('');
      setCatatan('');
      setSearchCode('');
      setErrorMsg(null);
      setAutoSyncChecklist(true);
      if (preselectedItemId) {
        const target = checklist.find((c) => c.id === preselectedItemId);
        setSelectedItemIds([preselectedItemId]);
        if (target) {
          setSectionFilter(target.bagian);
          setJudul(`${target.kode} — ${target.jenis}`);
        }
      } else {
        setSelectedItemIds([]);
        setSectionFilter('ALL');
      }
    }
  }, [isOpen, preselectedItemId, checklist]);

  const autoSuggestion = useMemo(() => {
    if (!file && !judul.trim()) return { itemIds: [], matchedCodes: [], confidence: 0 };
    return matchDocumentToInstrument(file?.name || '', judul, checklist);
  }, [file, judul, checklist]);

  const handleFileSelected = (picked: File | null) => {
    if (!picked) return;
    setFile(picked);
    setErrorMsg(null);
    const derivedTitle = picked.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ');
    const nextTitle = judul.trim() ? judul : derivedTitle;
    if (!judul.trim()) setJudul(derivedTitle);

    if (!preselectedItemId) {
      const match = matchDocumentToInstrument(picked.name, nextTitle, checklist);
      if (match.itemIds.length > 0) {
        setSelectedItemIds(match.itemIds);
      }
    }
  };

  const filteredChecklist = useMemo(() => {
    const q = searchCode.trim().toLowerCase();
    return checklist.filter((item) => {
      if (sectionFilter !== 'ALL' && item.bagian !== sectionFilter) return false;
      if (!q) return true;
      return (
        item.kode.toLowerCase().includes(q) ||
        item.jenis.toLowerCase().includes(q) ||
        String(item.no) === q
      );
    });
  }, [checklist, searchCode, sectionFilter]);

  const toggleItemId = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Pilih berkas dokumen terlebih dahulu.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('Ukuran berkas maksimal 15 MB.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = String(reader.result || '');
          const commaIdx = result.indexOf(',');
          resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
        };
        reader.onerror = () => reject(new Error('Gagal membaca berkas.'));
        reader.readAsDataURL(file);
      });

      await onUpload({
        judul: judul.trim() || file.name,
        namaFileAsli: file.name,
        mimeType: file.type || 'application/octet-stream',
        base64Data,
        catatan: catatan.trim(),
        manualItemIds: selectedItemIds,
        autoSyncChecklist,
      });
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal mengunggah dokumen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Unggah Dokumen ke Arsip Digital"
    >
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Unggah Dokumen ke Arsip Digital
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Sistem mendeteksi kode & judul dokumen secara otomatis untuk memperbarui ceklis administrasi.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Tutup modal unggah"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto p-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const dropped = e.dataTransfer.files?.[0] || null;
              handleFileSelected(dropped);
            }}
            className={`flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-7 text-center transition-colors ${
              isDragging
                ? 'border-blue-700 bg-blue-50/60'
                : 'border-slate-300 bg-slate-50 hover:border-slate-400'
            }`}
          >
            <FileUp className="h-7 w-7 text-slate-500" />
            <p className="mt-2 text-sm font-medium text-slate-800">
              {file ? file.name : 'Seret berkas ke sini atau pilih dari perangkat'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {file
                ? `${(file.size / 1024).toFixed(1)} KB · ${file.type || 'Dokumen'}`
                : 'Mendukung PDF, Word, Excel, HTML, atau gambar (maks. 15 MB). Contoh nama: PK.1_Jadwal_Pelajaran.pdf'}
            </p>
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">
              Pilih Berkas
              <input
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.html,.txt"
                onChange={(e) => handleFileSelected(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Judul Dokumen Arsip
              </label>
              <input
                type="text"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Misal: Jadwal Pelajaran Semester Ganjil"
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700">
                Catatan / Keterangan Berkas
              </label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Misal: Disahkan kepala sekolah, versi revisi"
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-semibold text-slate-800">
                  Pemetaan Otomatis ke Butir Instrumen (116 Butir)
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {autoSuggestion.matchedCodes.length > 0
                    ? `Deteksi otomatis: ${autoSuggestion.matchedCodes.join(', ')} (kecocokan ${autoSuggestion.confidence}%)`
                    : 'Pilih satu atau lebih kode administrasi yang dibuktikan oleh dokumen ini.'}
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-800">
                <input
                  type="checkbox"
                  checked={autoSyncChecklist}
                  onChange={(e) => setAutoSyncChecklist(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-800 focus:ring-blue-700"
                />
                Otomatis tandai ADA pada ceklis
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Cari kode (PK.1, BKU) atau jenis administrasi..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
                />
              </div>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value as SectionCode | 'ALL')}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 focus:border-blue-700 focus:outline-none"
              >
                <option value="ALL">Semua Bagian (A–F)</option>
                {(Object.keys(SECTION_LABELS) as SectionCode[]).map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}. {SECTION_LABELS[sec]}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-3 max-h-44 overflow-y-auto divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {filteredChecklist.map((item) => {
                const checked = selectedItemIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-xs transition-colors hover:bg-slate-50 ${
                      checked ? 'bg-blue-50/60' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleItemId(item.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-800"
                    />
                    <span className="w-8 shrink-0 font-mono text-slate-400 tabular-nums">
                      #{item.no}
                    </span>
                    <span className="w-20 shrink-0 font-mono font-medium text-slate-900">
                      {item.kode}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-slate-700">{item.jenis}</span>
                    <span className="shrink-0 text-[11px] text-slate-500">
                      {item.status === 'ada'
                        ? 'Sudah Ada'
                        : item.status === 'tidak_ada'
                          ? 'Tidak Ada'
                          : 'Belum Diperiksa'}
                    </span>
                  </label>
                );
              })}
            </div>

            {selectedItemIds.length > 0 && (
              <p className="mt-2 text-xs font-medium text-blue-900">
                Terpilih ({selectedItemIds.length} butir):{' '}
                <span className="font-mono">
                  {checklist
                    .filter((c) => selectedItemIds.includes(c.id))
                    .map((c) => c.kode)
                    .join(', ')}
                </span>
              </p>
            )}
          </div>

          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
              {errorMsg}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-800 px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-900 disabled:opacity-60"
            >
              {isSubmitting ? 'Mengunggah & Menyinkronkan...' : 'Simpan ke Arsip Digital'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
