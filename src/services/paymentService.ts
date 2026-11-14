import { Subscription, PlanTier } from '../core/types';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../core/storage/StorageRLSLayer';
import { UTRValidator } from '../core/security/utrValidator';
import { ApiClient } from '../core/api/apiClient';
import { SiteConfigService } from './siteConfigService';
import QRCode from 'qrcode';

export interface PlanPricing {
  tier: 'LITE' | 'PLUS';
  name: string;
  priceInr: number;
  durationDays: number;
  description: string;
  features: string[];
}

export const PLAN_PRICING: Record<'LITE' | 'PLUS', PlanPricing> = {
  LITE: {
    tier: 'LITE',
    name: 'AcademicLevel Lite',
    priceInr: 49,
    durationDays: 60,
    description: '60 days of unlimited access across your chosen Board and Class.',
    features: [
      'Unlimited Quizzes & Adaptive Assessments',
      'Full Access to All 4 Progression Levels',
      'Nova AI Socratic Tutor 24/7',
      'Level Mastery Certificates',
      'Max 1 Class Change during active cycle'
    ]
  },
  PLUS: {
    tier: 'PLUS',
    name: 'AcademicLevel Plus',
    priceInr: 129,
    durationDays: 180,
    description: '180 days (Half-Yearly) complete mastery with Olympiad prep & priority support.',
    features: [
      'Everything in Lite, Extended to 180 Days',
      'Olympiad & Competitive Reasoning Track',
      'Annual Master Certificate Eligibility',
      'Offline Question Bank Full Synchronization',
      'Bonus 40-Coin Referral Jackpot eligibility',
      'Max 1 Class Change during active cycle'
    ]
  }
};

export function getDynamicPlanPricing(tier: 'LITE' | 'PLUS'): PlanPricing {
  try {
    const cfg = SiteConfigService.getPricing();
    if (tier === 'LITE') {
      return {
        tier: 'LITE',
        name: 'AcademicLevel Lite',
        priceInr: cfg.litePriceInr || 49,
        durationDays: cfg.liteDurationDays || 60,
        description: `${cfg.liteDurationDays || 60} days of unlimited access across your chosen Board and Class.`,
        features: cfg.liteFeatures && cfg.liteFeatures.length > 0 ? cfg.liteFeatures : PLAN_PRICING.LITE.features
      };
    } else {
      return {
        tier: 'PLUS',
        name: 'AcademicLevel Plus',
        priceInr: cfg.plusPriceInr || 129,
        durationDays: cfg.plusDurationDays || 180,
        description: `${cfg.plusDurationDays || 180} days complete mastery with Olympiad prep & priority support.`,
        features: cfg.plusFeatures && cfg.plusFeatures.length > 0 ? cfg.plusFeatures : PLAN_PRICING.PLUS.features
      };
    }
  } catch {
    return PLAN_PRICING[tier];
  }
}

export class PaymentService {
  public static OFFICIAL_UPI_VPA = 'theattirebbsr@okicici';
  public static OFFICIAL_MERCHANT_NAME = 'Academic Level';

  /**
   * Retrieves official merchant QR code image path.
   */
  public static getOfficialQrImageUrl(tier: 'LITE' | 'PLUS'): string {
    return tier === 'LITE' ? '/qr-lite-49.jpg' : '/qr-plus-129.jpg';
  }

  /**
   * Generates a standard NPCI UPI URI string following the exact specification:
   * upi://pay?pa=merchant@bank&pn=Merchant%20Name&am=250.00&cu=INR&tn=Order123
   */
  public static buildStandardUpiUri(options: {
    amount: number;
    vpa?: string;
    merchantName?: string;
    note?: string;
  }): string {
    const cfg = SiteConfigService.getPricing();
    const vpa = (options.vpa || cfg.upiVpa || this.OFFICIAL_UPI_VPA).trim();
    const merchant = (options.merchantName || cfg.merchantName || this.OFFICIAL_MERCHANT_NAME).trim();
    const amountStr = Number(options.amount || 49).toFixed(2);
    const note = (options.note || `Order_AL_${Math.round(options.amount)}`).trim();

    return `upi://pay?pa=${vpa}&pn=${encodeURIComponent(merchant)}&am=${amountStr}&cu=INR&tn=${encodeURIComponent(note)}`;
  }

  /**
   * Generates a standard NPCI UPI URI string for a plan tier or learner.
   */
  public static generateUpiPaymentString(tier: 'LITE' | 'PLUS', learnerId?: string): string {
    const plan = getDynamicPlanPricing(tier);
    const cleanId = (learnerId || '49').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
    return this.buildStandardUpiUri({
      amount: plan.priceInr,
      note: `Order_AL_${tier}_${cleanId || 'Pass'}`
    });
  }

  /**
   * Generates a data URL for dynamic QR code rendering using standard UPI true form.
   */
  public static async generateQrDataUrl(
    tierOrAmount: 'LITE' | 'PLUS' | number,
    learnerIdOrNote?: string
  ): Promise<string> {
    let upiUri: string;
    if (typeof tierOrAmount === 'number') {
      upiUri = this.buildStandardUpiUri({
        amount: tierOrAmount,
        note: learnerIdOrNote || `Order_AL_${Math.round(tierOrAmount)}`
      });
    } else {
      upiUri = this.generateUpiPaymentString(tierOrAmount, learnerIdOrNote);
    }

    try {
      return await QRCode.toDataURL(upiUri, {
        width: 360,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      });
    } catch {
      return '';
    }
  }

  /**
   * Submits a UPI transaction for human-in-the-loop verification.
   * STRICT: Never auto-grants premium. Status is set to PENDING_VERIFICATION.
   * Payer UPI ID is the primary required field. 12-Digit UTR is optional.
   */
  public static async submitUpiPayment(
    learnerId: string,
    tier: 'LITE' | 'PLUS',
    payerUpiId?: string,
    utrReference?: string
  ): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    // 1. Resolve Payer identifier (falls back cleanly to mobile/user ID if UPI ID is omitted)
    const rawPayer = (payerUpiId || '').trim();
    const resolvedPayerUpi = rawPayer.length > 0
      ? (rawPayer.includes('@') ? rawPayer : `${rawPayer.replace(/[^a-zA-Z0-9._-]/g, '')}@upi`)
      : `scholar_${learnerId.replace(/[^a-zA-Z0-9]/g, '')}@upi`;

    const cleanUtr = utrReference?.trim();
    let finalUtr = cleanUtr;

    // 2. Validate UTR syntax IF provided by student
    if (cleanUtr) {
      const validation = UTRValidator.validateFormat(cleanUtr);
      if (!validation.isValid) {
        return { success: false, error: validation.message };
      }

      // Enforce global database uniqueness to block duplicate/replay fraud
      if (StorageRLSLayer.isUtrRegistered(cleanUtr)) {
        StorageRLSLayer.recordSecurityViolation(
          learnerId,
          'DUPLICATE_UTR_REPLAY_ATTEMPT',
          cleanUtr
        );
        return {
          success: false,
          error: 'Duplicate UTR Reference! This 12-digit bank reference number has already been recorded in the platform.'
        };
      }
    } else {
      // Auto-generate clean reference when UTR is omitted
      finalUtr = `UPI-REF-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Call real SQLite backend endpoint POST /api/payments/submit
    let serverSub: Subscription | undefined;
    try {
      const res = await ApiClient.submitPayment(learnerId, tier, resolvedPayerUpi, finalUtr);
      if (res.success && res.subscription) {
        serverSub = res.subscription;
      }
    } catch (apiErr: any) {
      console.warn('Backend payment submission warning:', apiErr.message);
      if (apiErr.message && apiErr.message.includes('Duplicate UTR Reference')) {
        return { success: false, error: apiErr.message };
      }
    }

    const plan = getDynamicPlanPricing(tier);
    const subId = 'sub_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

    const subscription: Subscription = serverSub || {
      id: subId,
      learnerId,
      planTier: tier,
      status: 'PENDING_VERIFICATION',
      paymentMethod: 'UPI_QR',
      utrReference: finalUtr,
      payerUpiId: resolvedPayerUpi,
      amountInr: plan.priceInr,
      durationDays: plan.durationDays,
      createdAt: new Date().toISOString(),
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
    };

    StorageRLSLayer.saveSubscription(subscription);

    return {
      success: true,
      subscription
    };
  }

  /**
   * Super-Admin One-Tick Approval of Pending Payment
   * ONLY executable by authenticated administrator
   */
  public static async approvePaymentAdmin(
    adminEmail: string,
    subscriptionId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!StorageRLSLayer.isAdminAuthorized(adminEmail)) {
      StorageRLSLayer.recordSecurityViolation(adminEmail, 'UNAUTHORIZED_PAYMENT_APPROVAL_ATTEMPT', subscriptionId);
      throw new Error('403 Forbidden: Only Super-Admin may approve subscriptions.');
    }

    try {
      await ApiClient.adminApprovePayment(adminEmail, subscriptionId);
    } catch (apiErr: any) {
      console.warn('Backend adminApprovePayment error:', apiErr.message);
    }

    const allSubs = StorageRLSLayer.getAllSubscriptionsAdmin(adminEmail);
    const sub = allSubs.find(s => s.id === subscriptionId);
    if (sub) {
      if (sub.status === 'ACTIVE') {
        return { success: false, error: 'Subscription is already active.' };
      }

      const now = new Date();
      const expiry = new Date(now.getTime() + sub.durationDays * 24 * 60 * 60 * 1000);

      sub.status = 'ACTIVE';
      sub.startsAt = now.toISOString();
      sub.expiresAt = expiry.toISOString();
      sub.verifiedByAdmin = adminEmail;
      sub.verifiedAt = now.toISOString();

      StorageRLSLayer.saveSubscription(sub);

      // Audit log
      StorageRLSLayer.recordAdminAction(
        adminEmail,
        'APPROVE_UPI_PAYMENT',
        sub.id,
        `Activated ${sub.planTier} plan (${sub.durationDays} days) for learner ${sub.learnerId}. UTR: ${sub.utrReference}`
      );
    }

    return { success: true };
  }

  /**
   * Super-Admin Rejection of Invalid UTR
   */
  public static async rejectPaymentAdmin(
    adminEmail: string,
    subscriptionId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!StorageRLSLayer.isAdminAuthorized(adminEmail)) {
      throw new Error('403 Forbidden');
    }

    try {
      await ApiClient.adminRejectPayment(adminEmail, subscriptionId, reason);
    } catch (apiErr: any) {
      console.warn('Backend adminRejectPayment error:', apiErr.message);
    }

    const allSubs = StorageRLSLayer.getAllSubscriptionsAdmin(adminEmail);
    const sub = allSubs.find(s => s.id === subscriptionId);
    if (sub) {
      sub.status = 'REVOKED';
      sub.verifiedByAdmin = adminEmail;
      sub.verifiedAt = new Date().toISOString();

      StorageRLSLayer.saveSubscription(sub);

      StorageRLSLayer.recordAdminAction(
        adminEmail,
        'REJECT_UPI_PAYMENT',
        sub.id,
        `Rejected subscription for learner ${sub.learnerId}. Reason: ${reason}`
      );
    }

    return { success: true };
  }

  /**
   * Super-Admin Direct Trial / Subscription Grant
   */
  public static async grantTrialAdmin(
    adminEmail: string,
    learnerId: string,
    days: number,
    tier: 'LITE' | 'PLUS' = 'PLUS'
  ): Promise<{ success: boolean; error?: string }> {
    if (!StorageRLSLayer.isAdminAuthorized(adminEmail)) {
      throw new Error('403 Forbidden');
    }

    try {
      await ApiClient.adminGrantPremium(adminEmail, learnerId, tier, days, 'Admin Trial Grant');
    } catch (apiErr: any) {
      console.warn('Backend grantTrialAdmin error:', apiErr.message);
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const subId = 'trial_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

    const subscription: Subscription = {
      id: subId,
      learnerId,
      planTier: tier,
      status: 'ACTIVE',
      paymentMethod: 'ADMIN_TRIAL',
      amountInr: 0,
      durationDays: days,
      startsAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      verifiedByAdmin: adminEmail,
      verifiedAt: now.toISOString(),
      createdAt: now.toISOString(),
      invoiceNumber: `TRIAL-${Math.floor(10000 + Math.random() * 90000)}`
    };

    StorageRLSLayer.saveSubscription(subscription);

    StorageRLSLayer.recordAdminAction(
      adminEmail,
      'GRANT_TRIAL_SUBSCRIPTION',
      learnerId,
      `Granted complimentary ${days}-day ${tier} entitlement to learner ${learnerId}.`
    );

    return { success: true };
  }

  /**
   * Super-Admin Revocation of an active subscription
   */
  public static async revokeSubscriptionAdmin(
    adminEmail: string,
    subscriptionId: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!StorageRLSLayer.isAdminAuthorized(adminEmail)) {
      throw new Error('403 Forbidden');
    }

    const allSubs = StorageRLSLayer.getAllSubscriptionsAdmin(adminEmail);
    const sub = allSubs.find(s => s.id === subscriptionId);
    if (!sub) return { success: false, error: 'Subscription not found.' };

    try {
      await ApiClient.adminRevokePremium(adminEmail, sub.learnerId);
    } catch (apiErr: any) {
      console.warn('Backend revokeSubscriptionAdmin error:', apiErr.message);
    }

    sub.status = 'REVOKED';
    StorageRLSLayer.saveSubscription(sub);

    StorageRLSLayer.recordAdminAction(
      adminEmail,
      'REVOKE_SUBSCRIPTION',
      sub.id,
      `Revoked subscription for learner ${sub.learnerId}. Reason: ${reason}`
    );

    return { success: true };
  }

  /**
   * Super-Admin Direct One-Click Grant of Premium to any student
   */
  public static async grantPremiumDirect(
    adminEmail: string,
    learnerId: string,
    tier: 'LITE' | 'PLUS',
    durationDays: number,
    note?: string
  ): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    if (!StorageRLSLayer.isAdminAuthorized(adminEmail)) {
      throw new Error('403 Forbidden: Only Super-Admin may grant premium.');
    }

    // Call real SQLite backend API
    let serverSub: Subscription | undefined;
    try {
      const res = await ApiClient.adminGrantPremium(adminEmail, learnerId, tier, durationDays, note);
      if (res.success) {
        const studentRes = await ApiClient.getStudent(learnerId);
        if (studentRes.success && studentRes.activeSub) {
          serverSub = studentRes.activeSub;
        }
      }
    } catch (apiErr: any) {
      console.warn('Backend adminGrantPremium error:', apiErr.message);
    }

    const allSubs = StorageRLSLayer.getAllSubscriptionsAdmin(adminEmail);
    // Mark previous active/pending subscriptions as superseded
    allSubs.forEach(s => {
      if (s.learnerId === learnerId && (s.status === 'ACTIVE' || s.status === 'PENDING_VERIFICATION')) {
        s.status = 'REVOKED';
        StorageRLSLayer.saveSubscription(s);
      }
    });

    const now = new Date();
    const expiry = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const subId = 'admin_grant_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

    const subscription: Subscription = serverSub || {
      id: subId,
      learnerId,
      planTier: tier,
      status: 'ACTIVE',
      paymentMethod: 'ADMIN_TRIAL',
      amountInr: 0,
      durationDays,
      startsAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      verifiedByAdmin: adminEmail,
      verifiedAt: now.toISOString(),
      createdAt: now.toISOString(),
      invoiceNumber: `ADMIN-${Math.floor(100000 + Math.random() * 900000)}`
    };

    StorageRLSLayer.saveSubscription(subscription);

    StorageRLSLayer.recordAdminAction(
      adminEmail,
      'GRANT_PREMIUM_DIRECT',
      learnerId,
      `Super-Admin granted ${tier} (${durationDays} days) to learner ${learnerId}. Note: ${note || 'Admin One-Click Grant'}`
    );

    return { success: true, subscription };
  }

  /**
   * Super-Admin Direct One-Click Ungrant / Revocation of Premium for any student
   */
  public static async revokePremiumDirect(
    adminEmail: string,
    learnerId: string,
    reason: string = 'Super-Admin manual ungrant'
  ): Promise<{ success: boolean; revokedCount: number; error?: string }> {
    if (!StorageRLSLayer.isAdminAuthorized(adminEmail)) {
      throw new Error('403 Forbidden: Only Super-Admin may ungrant premium.');
    }

    try {
      await ApiClient.adminRevokePremium(adminEmail, learnerId);
    } catch (apiErr: any) {
      console.warn('Backend adminRevokePremium error:', apiErr.message);
    }

    const allSubs = StorageRLSLayer.getAllSubscriptionsAdmin(adminEmail);
    let count = 0;
    allSubs.forEach(s => {
      if (s.learnerId === learnerId && (s.status === 'ACTIVE' || s.status === 'PENDING_VERIFICATION')) {
        s.status = 'REVOKED';
        s.verifiedByAdmin = adminEmail;
        s.verifiedAt = new Date().toISOString();
        StorageRLSLayer.saveSubscription(s);
        count++;
      }
    });

    StorageRLSLayer.recordAdminAction(
      adminEmail,
      'REVOKE_PREMIUM_DIRECT',
      learnerId,
      `Revoked ${count} subscription(s) for learner ${learnerId}. Reason: ${reason}`
    );

    return { success: true, revokedCount: count };
  }

  /**
   * Redeem ACode promotional/scholarship voucher
   */
  public static async redeemACode(learnerId: string, codeInput: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await ApiClient.redeemACode(learnerId, codeInput.trim().toUpperCase());
      if (res.success) {
        if (res.subscription) {
          StorageRLSLayer.saveSubscription(res.subscription);
        }
        return { success: true, message: res.message };
      }
    } catch (apiErr: any) {
      if (apiErr.message && !apiErr.message.includes('Failed to fetch') && !apiErr.message.includes('NetworkError')) {
        return { success: false, message: apiErr.message };
      }
    }

    // Offline / Local fallback
    const acode = StorageRLSLayer.getACode(codeInput);
    if (!acode) {
      return { success: false, message: 'Invalid ACode. Please verify your promotional voucher key.' };
    }

    if (acode.isRedeemed) {
      return { success: false, message: 'This ACode has already been redeemed.' };
    }

    if (new Date(acode.expiresAt).getTime() < Date.now()) {
      return { success: false, message: 'This ACode has expired.' };
    }

    // Activate subscription
    const now = new Date();
    const expiry = new Date(now.getTime() + acode.durationDays * 24 * 60 * 60 * 1000);
    const subId = 'acode_sub_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

    const subscription: Subscription = {
      id: subId,
      learnerId,
      planTier: acode.planTier,
      status: 'ACTIVE',
      paymentMethod: 'ACODE_SCHOLARSHIP',
      amountInr: 0,
      durationDays: acode.durationDays,
      startsAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      verifiedByAdmin: acode.createdBy,
      verifiedAt: now.toISOString(),
      createdAt: now.toISOString(),
      invoiceNumber: `SCHOLAR-${acode.code}`
    };

    StorageRLSLayer.saveSubscription(subscription);

    // Mark ACode as redeemed
    acode.isRedeemed = true;
    acode.redeemedBy = learnerId;
    acode.redeemedAt = now.toISOString();
    StorageRLSLayer.saveACode(acode);

    return {
      success: true,
      message: `Success! Redeemed ${acode.code}. You now have ${acode.durationDays} days of ${acode.planTier} Premium access!`
    };
  }
}
