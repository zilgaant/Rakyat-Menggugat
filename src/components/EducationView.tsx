/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LandingPage } from './LandingHero/LandingPage';

interface EducationViewProps {
  onStartIntake: () => void;
  onOpenBlankTemplate: () => void;
  onSelectPersona: (type: 'individu' | 'kelompok_sipil' | 'badan_hukum') => void;
  onOpenLawyers?: () => void;
  onOpenKnowledgeBase?: () => void;
  onOpenPrivacy?: () => void;
}

export const EducationView: React.FC<EducationViewProps> = ({
  onStartIntake,
  onOpenBlankTemplate,
  onSelectPersona,
  onOpenLawyers,
  onOpenKnowledgeBase,
  onOpenPrivacy,
}) => {
  return (
    <LandingPage
      onStartIntake={onStartIntake}
      onOpenBlankTemplate={onOpenBlankTemplate}
      onSelectPersona={onSelectPersona}
      onOpenLawyers={onOpenLawyers}
      onOpenKnowledgeBase={onOpenKnowledgeBase}
      onOpenPrivacy={onOpenPrivacy}
    />
  );
};

