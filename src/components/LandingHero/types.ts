/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LandingPageProps {
  onStartIntake: () => void;
  onOpenBlankTemplate: () => void;
  onSelectPersona: (type: 'individu' | 'kelompok_sipil' | 'badan_hukum') => void;
  onOpenLawyers?: () => void;
  onOpenKnowledgeBase?: () => void;
  onOpenPrivacy?: () => void;
}

export type CourtJurisdiction = 'MK' | 'MA';

export interface InteractiveCaseExample {
  id: string;
  ruleTitle: string;
  ruleCategory: 'UU' | 'PP' | 'Perpres' | 'Permen' | 'Perda';
  impactQuote: string;
  targetCourt: CourtJurisdiction;
  targetCourtFullName: string;
  benchmarkArticle: string;
  status: 'valid' | 'invalid_standing' | 'wrong_court';
  explanation: string;
}
