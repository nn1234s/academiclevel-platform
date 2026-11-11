import React from 'react';
import { Special49AdsLandingPage, Special49AdsLandingPageProps } from './Special49AdsLandingPage';

export type AdsLandingPageProps = Special49AdsLandingPageProps;

/**
 * AdsLandingPage - Re-routed to the Special 49 Offer UI
 * Supporting Classes 1 to 12, ₹49 Offer, Oda Class Design & Detailed Syllabus
 */
export const AdsLandingPage: React.FC<AdsLandingPageProps> = (props) => {
  return <Special49AdsLandingPage {...props} />;
};

export default AdsLandingPage;
