/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Legal Knowledge Base Explorer & ETL Ingestion Hub
 * Sources: JDIH Mahkamah Konstitusi, JDIHN, JDIH Mahkamah Agung
 * Conforms to:
 * - PRD Section 12.4 (Traceability with versions)
 * - Section 16 (Anti-Hallucination Legal Grounding)
 * - Strict Politeness Protocol (Robots.txt & Rate Limiting)
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  Filter, 
  History, 
  Scale, 
  ShieldCheck, 
  AlertTriangle,
  ChevronRight,
  BookOpen,
  FileText,
  Activity,
  Sliders
} from 'lucide-react';
import { LegalKnowledgeEntry, LegalKnowledgeVersion, ETLSyncJobResult } from '../types';

interface LegalKnowledgeBaseViewProps {
  onSelectPrecedentForIntake?: (citation: string) => void;
}

export const LegalKnowledgeBaseView: React.FC<LegalKnowledgeBaseViewProps> = ({
  onSelectPrecedentForIntake
}) => {
  const [entries, setEntries] = useState<LegalKnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');

  // Selected Entry & Version History Drawer
  const [selectedEntry, setSelectedEntry] = useState<LegalKnowledgeEntry | null>(null);
  const [entryVersions, setEntryVersions] = useState<LegalKnowledgeVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<LegalKnowledgeVersion | null>(null);
  const [loadingVersions, setLoadingVersions] = useState(false);

  // Sync Job State
  const [syncing, setSyncing] = useState(false);
  const [selectedSyncSource, setSelectedSyncSource] = useState<'all' | 'jdih_mk' | 'jdihn' | 'jdih_ma'>('all');
  const [syncDelayMs, setSyncDelayMs] = useState<number>(1000);
  const [lastSyncResult, setLastSyncResult] = useState<ETLSyncJobResult | null>(null);
  const [syncHistory, setSyncHistory] = useState<ETLSyncJobResult[]>([]);
  const [showSyncDrawer, setShowSyncDrawer] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchEntries();
    fetchSyncHistory();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/legal-knowledge/entries');
      if (!res.ok) throw new Error('Gagal memuat basis pengetahuan hukum.');
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err: any) {
      console.error('Fetch entries error:', err);
      setErrorMessage(err.message || 'Gagal memuat data basis pengetahuan.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSyncHistory = async () => {
    try {
      const res = await fetch('/api/legal-knowledge/sync-history');
      if (res.ok) {
        const data = await res.json();
        setSyncHistory(data.history || []);
      }
    } catch (err) {
      console.warn('Sync history error:', err);
    }
  };

  const handleSelectEntry = async (entry: LegalKnowledgeEntry) => {
    setSelectedEntry(entry);
    setLoadingVersions(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/legal-knowledge/entries/${entry.id}/versions`);
      if (!res.ok) throw new Error('Gagal memuat riwayat versi dokumen.');
      const data = await res.json();
      const versions: LegalKnowledgeVersion[] = data.versions || [];
      setEntryVersions(versions);
      // Select the latest version by default
      if (versions.length > 0) {
        setSelectedVersion(versions[versions.length - 1]);
      } else {
        setSelectedVersion(null);
      }
    } catch (err: any) {
      console.error('Fetch versions error:', err);
      setErrorMessage(err.message);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleTriggerSync = async () => {
    setSyncing(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/legal-knowledge/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: selectedSyncSource, delayMs: syncDelayMs })
      });
      if (!res.ok) throw new Error('Sinkronisasi ETL gagal.');
      const data = await res.json();
      setLastSyncResult(data.result);
      // Refresh entries & history
      await fetchEntries();
      await fetchSyncHistory();
    } catch (err: any) {
      console.error('Sync error:', err);
      setErrorMessage(err.message || 'Proses sinkronisasi terganggu.');
    } finally {
      setSyncing(false);
    }
  };

  // Filtered list
  const filteredEntries = entries.filter(e => {
    const matchesSource = sourceFilter === 'all' || e.sumber === sourceFilter;
    const matchesSector = sectorFilter === 'all' || (e.sektor_kategori && e.sektor_kategori.toLowerCase().includes(sectorFilter.toLowerCase()));
    const q = searchQuery.toLowerCase();
    const matchesQuery = !searchQuery || 
      e.nomor.toLowerCase().includes(q) || 
      e.judul.toLowerCase().includes(q) || 
      (e.ringkasan_kaidah_hukum && e.ringkasan_kaidah_hukum.toLowerCase().includes(q)) ||
      (e.keywords && e.keywords.some(k => k.toLowerCase().includes(q)));
    
    return matchesSource && matchesSector && matchesQuery;
  });

  const getSourceBadge = (sumber: string) => {
    switch (sumber) {
      case 'jdih_mk':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-[#881337] border border-rose-200">JDIH MKRI</span>;
      case 'jdihn':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-200">JDIHN Nasional</span>;
      case 'jdih_ma':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-200">JDIH MA (HUM)</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">Kompilasi Hukum</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'berlaku':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Berlaku / Tetap</span>;
      case 'inkonstitusional_bersyarat':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-300">Inkonstitusional Bersyarat</span>;
      case 'diubah':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">Diubah / Diamandemen</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-stone-100 text-stone-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Sync Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#881337] border border-rose-200 text-xs font-semibold uppercase tracking-wider mb-2">
            <Database className="w-3.5 h-3.5" />
            Basis Pengetahuan & Presedensi Hukum Terbuka
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Kompilasi Putusan MK, Uji Materiil MA & Regulasi Nasional
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-3xl">
            Basis data yurisprudensi dan norma hukum yang menjadi landasan pertimbangan Agen AI. Diperbarui secara teratur dari portal resmi pemerintah (JDIH MKRI, JDIHN, JDIH MA) dengan protokol perayapan beretika (robots.txt & rate limiting).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSyncDrawer(!showSyncDrawer)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold bg-stone-900 text-stone-50 hover:bg-stone-800 transition shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Menyinkronkan...' : 'Sinkronisasi ETL Portal'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Terjadi Kendala Sinkronisasi / Akses Data</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* ETL Ingestion Control Drawer (Expandable) */}
      {showSyncDrawer && (
        <div className="p-5 rounded-lg border border-stone-300 bg-stone-50/70 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
              <Sliders className="w-4 h-4 text-stone-700" />
              <span>Panel Kendali Ingestion & Perayapan Beretika (Politeness Protocol)</span>
            </div>
            <span className="text-xs text-stone-500 font-mono">User-Agent: RakyatMenggugat-LegalKnowledgeBot/1.0</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Target Sumber Data</label>
              <select
                value={selectedSyncSource}
                onChange={(e) => setSelectedSyncSource(e.target.value as any)}
                className="w-full bg-white border border-stone-300 rounded px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-rose-800"
              >
                <option value="all">Semua Portal (JDIH MK + JDIHN + JDIH MA)</option>
                <option value="jdih_mk">JDIH Mahkamah Konstitusi (jdih.mkri.id)</option>
                <option value="jdihn">JDIHN Nasional (jdihn.go.id)</option>
                <option value="jdih_ma">JDIH Mahkamah Agung HUM (jdih.mahkamahagung.go.id)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Courtesy Delay Antar-Request: <span className="font-mono font-bold text-rose-800">{syncDelayMs}ms</span>
              </label>
              <input
                type="range"
                min="500"
                max="3000"
                step="250"
                value={syncDelayMs}
                onChange={(e) => setSyncDelayMs(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-rose-800"
              />
              <span className="text-[11px] text-stone-500">Mencegah lonjakan beban server pemerintah</span>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleTriggerSync}
                disabled={syncing}
                className="w-full bg-[#881337] hover:bg-[#70102e] text-white px-4 py-2 rounded text-xs font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{syncing ? 'Sedang Memproses ETL...' : 'Jalankan Sinkronisasi Sekarang'}</span>
              </button>
            </div>
          </div>

          {/* Sync Output Log Details */}
          {lastSyncResult && (
            <div className="mt-4 p-3 rounded bg-stone-900 text-stone-100 font-mono text-xs space-y-1.5 max-h-48 overflow-y-auto">
              <div className="text-emerald-400 font-bold">
                ✓ Sync Selesai (Job: {lastSyncResult.job_id}) — Total: {lastSyncResult.total_crawled} diinspeksi, {lastSyncResult.total_inserted} baru, {lastSyncResult.total_updated} versi diperbarui ({lastSyncResult.durasi_ms}ms)
              </div>
              {lastSyncResult.log_pesan.map((log, idx) => (
                <div key={idx} className="text-stone-300 whitespace-pre-wrap">{log}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-lg border border-stone-200 shadow-xs">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor putusan, kata kunci, pasal UUD 1945, atau topik (contoh: standing, cipta kerja, amdal)..."
            className="w-full pl-9 pr-4 py-2 rounded-md border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-800/20 focus:border-rose-800"
          />
        </div>

        <div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full py-2 px-3 rounded-md border border-stone-300 text-sm bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-800/20 focus:border-rose-800"
          >
            <option value="all">Semua Sumber Resmi</option>
            <option value="jdih_mk">JDIH Mahkamah Konstitusi</option>
            <option value="jdihn">JDIHN Nasional (UU/PP)</option>
            <option value="jdih_ma">JDIH Mahkamah Agung (HUM)</option>
          </select>
        </div>

        <div>
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="w-full py-2 px-3 rounded-md border border-stone-300 text-sm bg-white text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-800/20 focus:border-rose-800"
          >
            <option value="all">Semua Sektor / Isu</option>
            <option value="standing">Legal Standing & Acara MK</option>
            <option value="ketenagakerjaan">Ketenagakerjaan & PHK</option>
            <option value="lingkungan">Lingkungan & Minerba</option>
            <option value="agraria">Agraria & Hak Adat</option>
            <option value="pembentukan">Tata Kelola & Legislasi</option>
            <option value="jaminan">Jaminan Sosial & Pelayanan</option>
          </select>
        </div>
      </div>

      {/* Main Content: List & Details Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Entries List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider px-1">
            <span>Daftar Presedensi & Dokumen Hukum ({filteredEntries.length} dokumen)</span>
            <span>Status / Versi</span>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white rounded-lg border border-stone-200 text-stone-500 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-stone-400" />
              Memuat basis data hukum...
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-lg border border-stone-200 text-stone-500 text-sm">
              Tidak ada dokumen hukum yang cocok dengan kriteria pencarian "{searchQuery}".
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isSelected = selectedEntry?.id === entry.id;
              return (
                <div
                  key={entry.id}
                  onClick={() => handleSelectEntry(entry)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer bg-white ${
                    isSelected 
                      ? 'border-[#881337] ring-1 ring-[#881337] shadow-xs' 
                      : 'border-stone-200 hover:border-stone-400 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {getSourceBadge(entry.sumber)}
                      <span className="font-mono text-xs font-bold text-stone-900">{entry.nomor}</span>
                      <span className="text-xs text-stone-500">({entry.tahun})</span>
                    </div>
                    {getStatusBadge(entry.status_berlaku)}
                  </div>

                  <h3 className="font-serif text-base font-bold text-stone-900 mt-2 line-clamp-2">
                    {entry.judul}
                  </h3>

                  {entry.ringkasan_kaidah_hukum && (
                    <p className="text-xs text-stone-600 mt-1.5 line-clamp-2 leading-relaxed">
                      {entry.ringkasan_kaidah_hukum}
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                    <div className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-stone-400" />
                      <span>{entry.total_versions || 1} Versi Terarsip</span>
                      <span className="text-stone-300">•</span>
                      <span className="truncate max-w-[200px]">{entry.sektor_kategori || 'Umum'}</span>
                    </div>
                    <span className="text-xs font-medium text-[#881337] flex items-center gap-0.5">
                      Lihat Rincian <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Document Inspector & Version Audit Trail */}
        <div className="lg:col-span-5">
          {selectedEntry ? (
            <div className="bg-white rounded-lg border border-stone-200 p-5 space-y-5 sticky top-24 shadow-xs">
              <div className="flex items-start justify-between border-b border-stone-200 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getSourceBadge(selectedEntry.sumber)}
                    <span className="font-mono text-xs font-bold text-stone-800">{selectedEntry.nomor}</span>
                  </div>
                  <h2 className="font-serif text-lg font-bold text-stone-900 leading-snug">
                    {selectedEntry.judul}
                  </h2>
                </div>
              </div>

              {/* Version History Selector */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
                  <span className="flex items-center gap-1">
                    <History className="w-3.5 h-3.5 text-stone-500" />
                    Audit Jejak Versi ({entryVersions.length} Versi):
                  </span>
                  <span className="text-[11px] text-stone-400">Subkoleksi Firestore</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {entryVersions.map((v) => {
                    const isVerActive = selectedVersion?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVersion(v)}
                        className={`px-2.5 py-1 rounded text-xs font-medium border transition ${
                          isVerActive
                            ? 'bg-[#881337] text-white border-[#881337]'
                            : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                        }`}
                      >
                        Versi {v.versi_ke} ({v.tanggal_berlaku_versi ? v.tanggal_berlaku_versi.slice(0, 4) : 'Init'})
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Version Content */}
              {selectedVersion && (
                <div className="space-y-4 text-xs text-stone-700">
                  {selectedVersion.ratio_decidendi && (
                    <div className="p-3 rounded-md bg-stone-50 border border-stone-200">
                      <div className="font-semibold text-stone-900 mb-1 flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-[#881337]" />
                        Pertimbangan Hukum (Ratio Decidendi):
                      </div>
                      <p className="leading-relaxed text-stone-800 italic">
                        "{selectedVersion.ratio_decidendi}"
                      </p>
                    </div>
                  )}

                  {selectedVersion.batu_uji_pasal_uud && selectedVersion.batu_uji_pasal_uud.length > 0 && (
                    <div>
                      <span className="font-semibold text-stone-900">Batu Uji Konstitusional / UUD 1945:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedVersion.batu_uji_pasal_uud.map((p, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-rose-50 text-[#881337] border border-rose-200 text-[11px] font-medium">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="font-semibold text-stone-900">Teks Normatif / Salinan Putusan:</span>
                    <div className="mt-1.5 p-3 rounded bg-stone-900 text-stone-100 font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                      {selectedVersion.isi_teks}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                    <div>
                      <span>Catatan: {selectedVersion.catatan_perubahan}</span>
                    </div>
                    {selectedVersion.url_sumber && (
                      <a
                        href={selectedVersion.url_sumber}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[#881337] hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <span>Portal Resmi</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-stone-50 rounded-lg border border-stone-200 border-dashed p-8 text-center text-stone-500 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-stone-400" />
              <p className="font-serif font-bold text-stone-800 text-base">Pilih Dokumen Hukum</p>
              <p className="text-xs max-w-xs mx-auto">
                Klik salah satu putusan atau undang-undang di sebelah kiri untuk melihat pertimbangan hukum, batu uji UUD 1945, dan riwayat versinya.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
