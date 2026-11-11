import React from 'react';
import { YouTubeAdsLandingPage } from './YouTubeAdsLandingPage';

interface SecretAdPageProps {
  onSuccessRegistered: () => void;
}

/**
 * SecretAdPage - Re-routed to the informative YouTube Special UI
 * Supporting Classes 1 to 12, ₹49 Offer, Oda Class Design & Detailed Syllabus
 */
export const SecretAdPage: React.FC<SecretAdPageProps> = ({ onSuccessRegistered }) => {
  return <YouTubeAdsLandingPage onSuccessRegistered={onSuccessRegistered} />;
};
