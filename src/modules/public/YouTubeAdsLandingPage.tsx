import React from 'react';
import { Special49AdsLandingPage, Special49AdsLandingPageProps } from './Special49AdsLandingPage';

export type YouTubeAdsLandingPageProps = Special49AdsLandingPageProps;

/**
 * YouTubeAdsLandingPage - Re-routed to the comprehensive "Special 49 Offer" landing page.
 * All marketing campaigns now use the unified "Special 49 Offer" branding without platform-specific names.
 */
export const YouTubeAdsLandingPage: React.FC<YouTubeAdsLandingPageProps> = (props) => {
  return <Special49AdsLandingPage {...props} />;
};

export default YouTubeAdsLandingPage;
