'use client';

import React from 'react';
import SafeAIChat from '../../../components/ai/SafeAIChat';
import DisclaimerBanner from '../../../components/ui/DisclaimerBanner';

export default function SafeAIPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <SafeAIChat />
      <DisclaimerBanner />
    </div>
  );
}
