import { ApiClient } from '../core/api/apiClient';

export interface PricingConfig {
  litePriceInr: number;
  liteDurationDays: number;
  plusPriceInr: number;
  plusDurationDays: number;
  goldPriceInr: number;
  goldDurationDays: number;
  upiVpa: string;
  merchantName: string;
  discountBadge: string;
  liteFeatures: string[];
  plusFeatures: string[];
  goldFeatures: string[];
  updatedAt?: string;
}

export interface HomeConfig {
  heroTitle: string;
  heroSubtitle: string;
  announcementActive: boolean;
  announcementText: string;
  statsStudents: string;
  statsQuizzes: string;
  statsPassRate: string;
  bannerCtaText: string;
  updatedAt?: string;
}

export interface LegalConfig {
  contactEmail: string;
  lastUpdatedDate: string;
  privacyPolicyHeading: string;
  privacySummary: string;
  termsHeading: string;
  termsSummary: string;
  refundPolicySummary: string;
  updatedAt?: string;
}

export interface AdsConfig {
  mainHeading: string;
  subHeading: string;
  offerPriceInr: number;
  originalPriceInr: number;
  discountPercent: number;
  guaranteeDays: number;
  timerHours: number;
  ctaText: string;
  urgentNotice: string;
  updatedAt?: string;
}

export interface SiteConfig {
  pricing: PricingConfig;
  home: HomeConfig;
  legal: LegalConfig;
  ads: AdsConfig;
}

const DEFAULT_CONFIG: SiteConfig = {
  pricing: {
    litePriceInr: 49,
    liteDurationDays: 60,
    plusPriceInr: 129,
    plusDurationDays: 180,
    upiVpa: 'theattirebbsr@okicici',
    merchantName: 'Pratyusha Nanda',
    discountBadge: 'Special Launch Offer (95% Off)',
    liteFeatures: [
      'Unlimited Quizzes & Adaptive Assessments',
      'Full Access to All Syllabus Chapters',
      'Nova AI Tutor 24/7',
      'Level Mastery Certificates',
      'Max 1 Class Change during active cycle'
    ],
    plusFeatures: [
      'Everything in Lite, Extended to 180 Days',
      'Olympiad & Competitive Reasoning Track',
      'Annual Master Certificate Eligibility',
      'Offline Question Bank Full Synchronization',
      'Bonus 40-Coin Referral Jackpot eligibility',
      'Max 1 Class Change during active cycle'
    ],
    goldPriceInr: 205,
    goldDurationDays: 365,
    goldFeatures: [
      'Full 365-Day Academic Year Unrestricted Syllabus Coverage',
      'Both Terms, Midterms, Pre-Boards & Board Final Exams Covered',
      'VIP Priority Physical Store Rewards Eligibility (Pokémon Sets, Milton & Mystery Box)',
      'Exclusive Gold Scholar Profile Badge & Frame',
      'Olympiad, NTSE & National Foundation Track',
      'Annual Master Certificate of Academic Excellence',
      '24/7 Nova AI Tutor with Priority Pool',
      'Max 2 Class Changes during active cycle'
    ]
  },
  home: {
    heroTitle: 'Master Your School Curriculum with Adaptive AI Quizzes',
    heroSubtitle: 'CBSE Classes 1 to 12. Instant step-by-step Nova AI Tutor guidance, verifiable certificates, and an earnable Study Coin economy.',
    announcementActive: true,
    announcementText: '🚀 3,600+ CBSE Questions for Classes 1-12 live! Start free or unlock full Concept Booster access.',
    statsStudents: 'Nova AI Tutor 24/7',
    statsQuizzes: '3,600+ Questions',
    statsPassRate: 'CBSE Classes 1–12',
    bannerCtaText: 'Start Free Practice Now'
  },
  legal: {
    contactEmail: 'academiclevels@gmail.com',
    lastUpdatedDate: 'November 2026',
    privacyPolicyHeading: 'AcademicLevel Privacy & Data Protection Policy',
    privacySummary: 'We collect only what is strictly necessary for academic assessment, certificate generation, and parent reporting. Learner data is never sold or used for third-party ad tracking.',
    termsHeading: 'AcademicLevel Terms of Service & Learner Agreement',
    termsSummary: 'Subscriptions grant non-transferable access for the specified duration. Study Coins are gamified reward tokens redeemable for verified gift cards and platform cosmetics according to published rules.',
    refundPolicySummary: 'Subscriptions are eligible for a 100% full refund within 20 minutes of purchase for accidental transactions, incorrect plan selections, or duplicate payments. Contact academiclevels@gmail.com with your transaction UTR.'
  },
  ads: {
    mainHeading: 'Score 95%+ in School Exams Without Expensive Tuitions',
    subHeading: 'CBSE Classes 1 to 12: Adaptive Daily Quizzes, 24/7 Nova AI Tutor & Real Study Coin Rewards.',
    offerPriceInr: 49,
    originalPriceInr: 999,
    discountPercent: 95,
    guaranteeDays: 60,
    timerHours: 48,
    ctaText: 'Claim 60-Day Unlimited Pass for ₹49',
    urgentNotice: '⚡ FLASH OFFER: Only 17 spots remaining at ₹49 for today\'s cohort.'
  }
};

const STORAGE_KEY = 'al_site_config_v1';

class SiteConfigServiceClass {
  private cache: SiteConfig = { ...DEFAULT_CONFIG };
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
    if (typeof window !== 'undefined') {
      this.fetchLiveConfig().catch(() => {});
    }
  }

  private sanitizeGroup<T extends Record<string, any>>(obj: T): T {
    const clean = (v: any) => typeof v === 'string'
      ? v
          .replace(/CBSE,?\s*ICSE\s*(&|and|\/)\s*Cambridge(\s*IGCSE)?/gi, 'CBSE')
          .replace(/CBSE,?\s*ICSE,?\s*and\s*Cambridge/gi, 'CBSE')
          .replace(/CBSE\s*(&|and|\/)\s*ICSE/gi, 'CBSE')
          .replace(/ICSE|IGCSE|Cambridge/gi, 'CBSE')
      : v;
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj || {})) out[k] = clean(v);
    return out as T;
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.cache = {
          pricing: { ...DEFAULT_CONFIG.pricing, ...parsed.pricing },
          home: this.sanitizeGroup({ ...DEFAULT_CONFIG.home, ...parsed.home }),
          legal: { ...DEFAULT_CONFIG.legal, ...parsed.legal },
          ads: this.sanitizeGroup({ ...DEFAULT_CONFIG.ads, ...parsed.ads })
        };
      }
    } catch {}
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cache));
    } catch {}
  }

  private notify() {
    this.listeners.forEach(fn => {
      try { fn(); } catch {}
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public async fetchLiveConfig(): Promise<void> {
    try {
      const res = await ApiClient.getPublicConfig();
      if (res && res.success && res.config) {
        // Safe intelligent merge: server values override cache, but local custom values are preserved
        // against being blanked out by empty responses.
        const serverPricing = res.config.pricing || {};
        const serverHome = res.config.home || {};
        const serverLegal = res.config.legal || {};
        const serverAds = res.config.ads || {};

        this.cache = {
          pricing: { ...DEFAULT_CONFIG.pricing, ...this.cache.pricing, ...serverPricing },
          home: { ...DEFAULT_CONFIG.home, ...this.cache.home, ...serverHome },
          legal: { ...DEFAULT_CONFIG.legal, ...this.cache.legal, ...serverLegal },
          ads: { ...DEFAULT_CONFIG.ads, ...this.cache.ads, ...serverAds }
        };
        this.saveToStorage();
        this.notify();
      }
    } catch {}
  }

  public getPricing(): PricingConfig {
    return { ...this.cache.pricing };
  }

  public getHome(): HomeConfig {
    return { ...this.cache.home };
  }

  public getLegal(): LegalConfig {
    return { ...this.cache.legal };
  }

  public getAds(): AdsConfig {
    return { ...this.cache.ads };
  }

  public async updatePricing(adminEmail: string, data: Partial<PricingConfig>): Promise<boolean> {
    const updated = { ...this.cache.pricing, ...data, updatedAt: new Date().toISOString() };
    this.cache.pricing = updated;
    this.saveToStorage();
    this.notify();

    try {
      const res = await ApiClient.adminUpdateSettings(adminEmail, 'pricing', updated);
      return Boolean(res && res.success);
    } catch {
      return true; // cached locally
    }
  }

  public async updateHome(adminEmail: string, data: Partial<HomeConfig>): Promise<boolean> {
    const updated = { ...this.cache.home, ...data, updatedAt: new Date().toISOString() };
    this.cache.home = updated;
    this.saveToStorage();
    this.notify();

    try {
      const res = await ApiClient.adminUpdateSettings(adminEmail, 'home', updated);
      return Boolean(res && res.success);
    } catch {
      return true;
    }
  }

  public async updateLegal(adminEmail: string, data: Partial<LegalConfig>): Promise<boolean> {
    const updated = { ...this.cache.legal, ...data, updatedAt: new Date().toISOString() };
    this.cache.legal = updated;
    this.saveToStorage();
    this.notify();

    try {
      const res = await ApiClient.adminUpdateSettings(adminEmail, 'legal', updated);
      return Boolean(res && res.success);
    } catch {
      return true;
    }
  }

  public async updateAds(adminEmail: string, data: Partial<AdsConfig>): Promise<boolean> {
    const updated = { ...this.cache.ads, ...data, updatedAt: new Date().toISOString() };
    this.cache.ads = updated;
    this.saveToStorage();
    this.notify();

    try {
      const res = await ApiClient.adminUpdateSettings(adminEmail, 'ads', updated);
      return Boolean(res && res.success);
    } catch {
      return true;
    }
  }
}

export const SiteConfigService = new SiteConfigServiceClass();
