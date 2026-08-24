/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { HeroSection } from './HeroSection';
import { QuestionNarrativeSection } from './QuestionNarrativeSection';
import { StoryAssemblySection } from './StoryAssemblySection';
import { LegalPathBranchingSection } from './LegalPathBranchingSection';
import { ArgumentFormulationSection } from './ArgumentFormulationSection';
import { AIReasoningSection } from './AIReasoningSection';
import { TrustArchitectureSection } from './TrustArchitectureSection';
import { PersonaPathsSection } from './PersonaPathsSection';
import { LandingPageProps } from './types';
import { ArrowRight, Scale, ShieldCheck, FileText, Landmark, BookOpen } from 'lucide-react';

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartIntake,
  onOpenBlankTemplate,
  onSelectPersona,
  onOpenLawyers,
  onOpenKnowledgeBase,
  onOpenPrivacy,
}) => {
  const narrativeRef = useRef<HTMLDivElement>(null);

  const handleScrollToNarrative = () => {
    narrativeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full bg-[#FAF9F5] text-stone-900 selection:bg-[#881337] selection:text-white">
      
      {/* 1. Hero Experience (Asymmetric Editorial + Procedural Visual System) */}
      <HeroSection
        onStartIntake={onStartIntake}
        onOpenBlankTemplate={onOpenBlankTemplate}
        onOpenLawyers={onOpenLawyers}
        onScrollToNarrative={handleScrollToNarrative}
      />

      {/* Anchor for Scroll Narrative */}
      <div ref={narrativeRef} />

      {/* 2. Section 01: The Question & Basic Constitutional Right */}
      <QuestionNarrativeSection onStartIntake={onStartIntake} />

      {/* 3. Section 02: Story Transformation (From Raw Messy Voice to Structured Petition) */}
      <StoryAssemblySection />

      {/* 4. Section 03: Law Hierarchy & Spatial Branching (MK vs MA) */}
      <LegalPathBranchingSection />

      {/* 5. Section 04: Anatomy of Constitutional Argument (Fact + Rule + Harm + UUD = Posita) */}
      <ArgumentFormulationSection />

      {/* 6. Section 05: Structured Reasoning AI Engine (No robot gimmick, real retrieval & dual-agent verification) */}
      <AIReasoningSection />

      {/* 7. Section 06: Trust & 4-Layer Sequential Evaluation Methodology */}
      <TrustArchitectureSection />

      {/* 8. Section 07: Persona Pathways & Lawyer Directory Connection */}
      <PersonaPathsSection
        onSelectPersona={onSelectPersona}
        onOpenLawyers={onOpenLawyers}
      />

      {/* 9. Final Grand Call-to-Action Section */}
      <section className="bg-stone-900 text-stone-100 py-20 sm:py-28 relative overflow-hidden border-t border-stone-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-800 border border-stone-700 rounded-xs text-xs font-mono font-semibold uppercase tracking-widest text-amber-400">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>Kedaulatan di Tangan Rakyat (Pasal 1 Ayat 2 UUD 1945)</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl mx-auto">
            Hukum Ada Untuk Melindungi Anda, Bukan Membungkam Anda.
          </h2>

          <p className="text-stone-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
            Mulai periksa apakah kerugian yang Anda alami memenuhi syarat untuk digugat ke Mahkamah Konstitusi atau Mahkamah Agung hari ini.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={onStartIntake}
              className="w-full sm:w-auto bg-[#881337] hover:bg-[#70102e] text-white px-8 py-4 rounded-xs text-base font-semibold transition flex items-center justify-center gap-3 shadow-lg cursor-pointer border border-rose-600"
            >
              <span>Mulai Menggugat Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenBlankTemplate}
              className="w-full sm:w-auto bg-stone-800 hover:bg-stone-700 text-stone-200 px-6 py-4 rounded-xs text-sm font-medium transition flex items-center justify-center gap-2 border border-stone-700 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-stone-400" />
              <span>Gunakan Template Kosong</span>
            </button>
          </div>

          <div className="pt-8 border-t border-stone-800 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500 font-mono">
            <span>• 100% Inisiatif Nirlaba</span>
            <span>• Terbuka Untuk Semua WNI</span>
            <span>• Berbasis Putusan MK RI</span>
          </div>

        </div>
      </section>

    </div>
  );
};
