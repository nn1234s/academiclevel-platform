import React from 'react';
import { YouTubeAdsLandingPage } from './YouTubeAdsLandingPage';

interface AdsLandingPageProps {
  onSuccessRegistered: () => void;
}

/**
 * AdsLandingPage - Re-routed to the informative YouTube Special UI
 * Supporting Classes 1 to 12, ₹49 Offer, Oda Class Design & Detailed Syllabus
 */
export const AdsLandingPage: React.FC<AdsLandingPageProps> = ({ onSuccessRegistered }) => {
  return <YouTubeAdsLandingPage onSuccessRegistered={onSuccessRegistered} />;
};
