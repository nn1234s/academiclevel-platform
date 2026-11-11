import React from 'react';
import { Special49AdsLandingPage, Special49AdsLandingPageProps } from './Special49AdsLandingPage';

export type SecretAdPageProps = Special49AdsLandingPageProps;

/**
 * SecretAdPage - Re-routed to the Special 49 Offer UI
 * Supporting Classes 1 to 12, ₹49 Offer, Oda Class Design & Detailed Syllabus
 */
export const SecretAdPage: React.FC<SecretAdPageProps> = (props) => {
  return <Special49AdsLandingPage {...props} />;
};

export default SecretAdPage;
