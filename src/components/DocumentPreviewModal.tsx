import { Download, ExternalLink, X } from 'lucide-react';
import { ArchiveDocument } from '../types';

interface DocumentPreviewModalProps {
  doc: ArchiveDocument | null;
  onClose: () => void;
}

export function DocumentPreviewModal({ doc, onClose }: DocumentPreviewModalProps) {
  if (!doc) return null;

  const isImage = doc.mimeType.startsWith('image/');
  const isPdfOrHtml =
    doc.mimeType === 'application/pdf' ||
    doc.mimeType === 'text/html' ||
    doc.namaFileAsli.toLowerCase().endsWith('.pdf') ||
    doc.namaFileAsli.toLowerCase().endsWith('.html');

  const downloadUrl =
    doc.sumber === 'lampiran_resmi' ? doc.fileUrl : `${doc.fileUrl}?download=1`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label={`Pratinjau ${doc.judul}`}
    >
      <div className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900">{doc.judul}</h3>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              <span className="font-mono">{doc.namaFileAsli}</span>
              <span aria-hidden="true"> · </span>
              <span>
                {doc.matchedCodes.length > 0
                  ? `Tertaut: ${doc.matchedCodes.join(', ')}`
                  : 'Dokumen Referensi'}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href={downloadUrl}
              download={doc.namaFileAsli}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              Unduh
            </a>
            <a
              href={doc.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Tab Baru
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Tutup pratinjau"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-slate-100 p-4">
          {isImage ? (
            <div className="flex h-full items-center justify-center">
              <img
                src={doc.fileUrl}
                alt={doc.judul}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full rounded-lg border border-slate-200 bg-white object-contain"
              />
            </div>
          ) : isPdfOrHtml ? (
            <iframe
              src={doc.fileUrl}
              title={doc.judul}
              className="h-full w-full rounded-lg border border-slate-200 bg-white"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-8 text-center">
              <p className="text-sm font-medium text-slate-900">
                Pratinjau langsung tidak tersedia untuk tipe berkas ini ({doc.mimeType}).
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Silakan unduh berkas untuk membukanya pada aplikasi pengolah dokumen Anda.
              </p>
              <a
                href={downloadUrl}
                download={doc.namaFileAsli}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-800 px-4 py-2 text-xs font-medium text-white hover:bg-blue-900"
              >
                <Download className="h-3.5 w-3.5" />
                Unduh Berkas ({(doc.ukuranByte / 1024).toFixed(1)} KB)
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
