import { Learner, Board, Grade, Subscription, GiftRequest, CoinLedgerEntry } from '../types';

const BASE_URL = '/api';

export class ApiClient {
  private static getAdminToken(): string {
    if (typeof window === 'undefined') return '';
    try {
      return sessionStorage.getItem('al_admin_token') || localStorage.getItem('al_admin_token') || '';
    } catch {
      return '';
    }
  }

  private static adminHeaders(adminEmail?: string): Record<string, string> {
    const token = this.getAdminToken();
    return {
      ...(adminEmail ? { 'x-admin-email': adminEmail } : {}),
      ...(token ? { 'x-admin-token': token } : {})
    };
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const adminToken = this.getAdminToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(adminToken ? { 'x-admin-token': adminToken } : {}),
      ...((options.headers as Record<string, string>) || {})
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}: Request failed`);
    }
    return data as T;
  }

  // ==========================================
  // Authentication
  // ==========================================
  public static async register(params: {
    fullName: string;
    email: string;
    board: Board;
    grade: Grade;
    parentName?: string;
    parentPin?: string;
    referredByCode?: string;
  }): Promise<{ success: boolean; learner: Learner; token: string }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  public static async login(email: string): Promise<{ success: boolean; learner: Learner; token: string }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  public static async getMe(learnerId?: string, email?: string): Promise<{ success: boolean; learner: Learner }> {
    const query = learnerId ? `?learnerId=${encodeURIComponent(learnerId)}` : `?email=${encodeURIComponent(email || '')}`;
    return this.request(`/auth/me${query}`);
  }

  // ==========================================
  // Student Actions & Quotas
  // ==========================================
  public static async getStudent(id: string): Promise<{
    success: boolean;
    learner: Learner;
    activeSub: Subscription | null;
    pendingSub: Subscription | null;
  }> {
    return this.request(`/students/${id}`);
  }

  public static async updateCurriculum(id: string, board: Board, grade: Grade): Promise<{ success: boolean; learner: Learner }> {
    return this.request(`/students/${id}/curriculum`, {
      method: 'PATCH',
      body: JSON.stringify({ board, grade })
    });
  }

  public static async spinWheel(id: string): Promise<{
    success: boolean;
    coinsWon: number;
    newBalance: number;
    isJackpot: boolean;
  }> {
    return this.request(`/students/${id}/spin`, {
      method: 'POST'
    });
  }

  // ==========================================
  // Payments
  // ==========================================
  public static async submitPayment(
    learnerId: string,
    tier: 'LITE' | 'PLUS',
    payerUpiId: string,
    utrReference?: string
  ): Promise<{ success: boolean; message: string; subscription: Subscription }> {
    return this.request('/payments/submit', {
      method: 'POST',
      body: JSON.stringify({ learnerId, tier, payerUpiId, utrReference })
    });
  }

  public static async getMySubscriptions(learnerId: string): Promise<{ success: boolean; subscriptions: Subscription[] }> {
    return this.request(`/payments/my-subscriptions?learnerId=${encodeURIComponent(learnerId)}`);
  }

  // ==========================================
  // Coins & Gift Store
  // ==========================================
  public static async transactCoins(
    learnerId: string,
    amount: number,
    transactionType: string,
    reasonCode: string,
    metadata?: any
  ): Promise<{ success: boolean; newBalance: number; entryId: string }> {
    return this.request('/coins/transact', {
      method: 'POST',
      body: JSON.stringify({ learnerId, amount, transactionType, reasonCode, metadata })
    });
  }

  public static async getCoinLedger(learnerId: string): Promise<{ success: boolean; entries: CoinLedgerEntry[] }> {
    return this.request(`/coins/${learnerId}/ledger`);
  }

  public static async redeemGift(params: {
    learnerId: string;
    level: number;
    brand: string;
    rsAmount: number;
    coinsCost: number;
    deliveryEmail: string;
    deliveryPhone: string;
    upiId?: string;
  }): Promise<{ success: boolean; reqId: string; newBalance: number; targetEmail: string; message: string }> {
    return this.request('/gifts/redeem', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  public static async getMyGifts(learnerId: string): Promise<{ success: boolean; requests: GiftRequest[] }> {
    return this.request(`/gifts/my-requests?learnerId=${encodeURIComponent(learnerId)}`);
  }

  // ==========================================
  // Super-Admin Control Plane
  // ==========================================
  public static async adminGetLearners(adminEmail: string): Promise<{
    success: boolean;
    learners: Learner[];
    activeSubscriptions: Subscription[];
    pendingSubscriptions: Subscription[];
  }> {
    return this.request('/admin/learners', {
      headers: this.adminHeaders(adminEmail)
    });
  }

  public static async adminGrantPremium(
    adminEmail: string,
    learnerId: string,
    tier: 'LITE' | 'PLUS',
    durationDays: number,
    note?: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/admin/learners/${learnerId}/grant-premium`, {
      method: 'POST',
      headers: this.adminHeaders(adminEmail),
      body: JSON.stringify({ tier, durationDays, note })
    });
  }

  public static async adminRevokePremium(
    adminEmail: string,
    learnerId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/admin/learners/${learnerId}/revoke-premium`, {
      method: 'POST',
      headers: this.adminHeaders(adminEmail)
    });
  }

  public static async adminAdjustCoins(
    adminEmail: string,
    learnerId: string,
    amount: number,
    note?: string
  ): Promise<{ success: boolean; newBalance: number; message: string }> {
    return this.request(`/admin/learners/${learnerId}/adjust-coins`, {
      method: 'POST',
      headers: this.adminHeaders(adminEmail),
      body: JSON.stringify({ amount, note })
    });
  }

  public static async adminOverrideCurriculum(
    adminEmail: string,
    learnerId: string,
    board: Board,
    grade: Grade
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/admin/learners/${learnerId}/override-curriculum`, {
      method: 'POST',
      headers: this.adminHeaders(adminEmail),
      body: JSON.stringify({ board, grade })
    });
  }

  public static async adminResetLocks(adminEmail: string, learnerId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/admin/learners/${learnerId}/reset-locks`, {
      method: 'POST',
      headers: this.adminHeaders(adminEmail)
    });
  }

  public static async adminResetQuotas(adminEmail: string, learnerId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/admin/learners/${learnerId}/reset-quotas`, {
      method: 'POST',
      headers: this.adminHeaders(adminEmail)
    });
  }

  public static async adminToggleSuspend(adminEmail: string, learnerId: string): Promise<{ success: boolean; isActive: boolean }> {
    return this.request(`/admin/learners/${learnerId}/toggle-suspend`, {
      method: 'POST',
      headers: this.adminHeaders(adminEmail)
    });
  }

  public static async adminGetPaymentsQueue(adminEmail: string): Promise<{ success: boolean; subscriptions: Subscription[] }> {
    return this.request('/admin/payments/queue', {
      headers: this.adminHeaders(adminEmail)
    });
  }

  public static async adminApprovePayment(adminEmail: string, subId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/admin/payments/${subId}/approve`, {
      method: 'POST',
      headers: this.adminHeaders(adminEmail)
    });
  }

  public static async adminRejectPayment(adminEmail: string, subId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/admin/payments/${subId}/reject`, {
      method: 'POST',
      headers: this.adminHeaders(adminEmail),
      body: JSON.stringify({ reason })
    });
  }

  public static async adminGetGifts(adminEmail: string): Promise<{ success: boolean; gifts: GiftRequest[] }> {
    return this.request('/admin/gifts', {
      headers: this.adminHeaders(adminEmail)
    });
  }

  public static async adminDispatchGift(
    adminEmail: string,
    reqId: string,
    voucherCode?: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/admin/gifts/${reqId}/dispatch`, {
      method: 'POST',
      headers: this.adminHeaders(adminEmail),
      body: JSON.stringify({ voucherCode })
    });
  }

  public static async adminRejectGift(adminEmail: string, reqId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/admin/gifts/${reqId}/reject`, {
      method: 'POST',
      headers: this.adminHeaders(adminEmail)
    });
  }

  public static async adminGetAuditLogs(adminEmail: string): Promise<{ success: boolean; logs: any[] }> {
    return this.request('/admin/audit-logs', {
      headers: this.adminHeaders(adminEmail)
    });
  }
}
