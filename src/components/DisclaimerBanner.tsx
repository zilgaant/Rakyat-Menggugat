/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-amber-50 border-l-4 border-amber-600 p-3 rounded-r-md text-amber-950 text-xs my-2 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-amber-900">Batas Hukum & Disclaimer AI:</strong> Hasil analisis dan draf dokumen disusun dengan bantuan kecerdasan buatan dan <span className="underline font-semibold">bukan merupakan nasihat hukum resmi</span>. Platform ini bertindak sebagai alat bantu penyusunan mandiri.
        </div>
      </div>
    );
  }

  return (
    <aside aria-label="Disclaimer Hukum Resmi" className="bg-amber-50/90 border border-amber-200 rounded-lg p-4 sm:p-5 text-amber-950 shadow-xs mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-200/80 flex items-center justify-center text-amber-800 shrink-0 mt-0.5 border border-amber-300">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
          <h4 className="font-serif font-bold text-amber-900 text-sm sm:text-base tracking-tight">
            Pemberitahuan Resmi: Posisi Hukum Platform & Batasan AI
          </h4>
          <p className="text-amber-900/90">
            Platform <strong>Rakyat Menggugat</strong> adalah inisiatif nirlaba pemberdayaan hukum masyarakat (<em>legal empowerment tool</em>). Seluruh analisis kelayakan dan draf permohonan disusun melalui sistem verifikasi ganda (<em>dual-agent AI</em>) yang berpijak pada basis hukum resmi Mahkamah Konstitusi dan Mahkamah Agung.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-amber-950 text-xs">
            <li>Platform <strong>bukan kantor hukum</strong> dan <strong>tidak mewakili Anda</strong> sebagai kuasa hukum di persidangan.</li>
            <li>Hasil asesmen bersifat probabilistik kelayakan formil dan <strong>tidak menjamin putusan persidangan</strong>.</li>
            <li>Anda sangat disarankan berkonsultasi dengan advokat atau Organisasi Bantuan Hukum (LBH) terakreditasi sebelum mendaftarkan permohonan ke kepaniteraan MK/MA.</li>
          </ul>
        </div>
      </div>
    </aside>
  );
};
