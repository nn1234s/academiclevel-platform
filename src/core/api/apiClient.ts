import { Learner, Board, Grade, Subscription, GiftRequest, CoinLedgerEntry, QuizAttempt, LevelProgress, Certificate, Friendship, StudentPackMessage, Scholarship, ScholarshipClaim } from '../types';

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

  private static getStudentToken(): string {
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem('al_student_token') || sessionStorage.getItem('al_student_token') || '';
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
    const studentToken = this.getStudentToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(adminToken ? { 'x-admin-token': adminToken } : {}),
      ...(studentToken ? { 'x-session-token': studentToken } : {}),
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
  // Quiz Attempts & Progress Tracking
  // ==========================================
  public static async recordQuizAttempt(attempt: QuizAttempt): Promise<{
    success: boolean;
    attemptId: string;
    quizzesCompletedCount: number;
    referralBonusAwarded?: boolean;
  }> {
    return this.request('/quizzes/attempt', {
      method: 'POST',
      body: JSON.stringify({
        learnerId: attempt.learnerId,
        board: attempt.board,
        grade: attempt.grade,
        subjectId: attempt.subjectId,
        levelNode: attempt.levelNode,
        score: attempt.correctCount,
        maxScore: attempt.totalQuestions,
        passed: attempt.accuracyPercent >= 70,
        totalDurationSeconds: attempt.totalDurationSeconds,
        antiCheatPassed: attempt.antiCheatPassed
      })
    });
  }

  public static async recordLevelProgress(progress: LevelProgress): Promise<{
    success: boolean;
    progressId: string;
    newlyCompleted: boolean;
  }> {
    return this.request('/progress/level', {
      method: 'POST',
      body: JSON.stringify({
        learnerId: progress.learnerId,
        board: progress.board,
        grade: progress.grade,
        subjectId: progress.subjectId,
        levelNode: progress.levelNode,
        accuracy: progress.bestScorePercent,
        passed: progress.isCompleted,
        bestScorePercent: progress.bestScorePercent,
        calendarYear: progress.calendarYear
      })
    });
  }

  public static async getLearnerProgress(learnerId: string): Promise<{
    success: boolean;
    progress: LevelProgress[];
    attempts: QuizAttempt[];
  }> {
    return this.request(`/progress/${learnerId}`);
  }

  // ==========================================
  // Certificates
  // ==========================================
  public static async issueCertificate(cert: Certificate): Promise<{
    success: boolean;
    certificateId: string;
  }> {
    return this.request('/certificates/issue', {
      method: 'POST',
      body: JSON.stringify(cert)
    });
  }

  public static async getCertificates(learnerId: string): Promise<{
    success: boolean;
    certificates: Certificate[];
  }> {
    return this.request(`/certificates/${learnerId}`);
  }

  // ==========================================
  // ACode Scholarships
  // ==========================================
  public static async redeemACode(learnerId: string, code: string): Promise<{
    success: boolean;
    message: string;
    subscription: Subscription;
  }> {
    return this.request('/acodes/redeem', {
      method: 'POST',
      body: JSON.stringify({ learnerId, code })
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
  // StudentPacks — Real-Time Peer & Messaging
  // ==========================================
  public static async getDiscoverablePeers(learnerId: string): Promise<{ success: boolean; peers: Learner[] }> {
    return this.request(`/student-packs/peers?learnerId=${encodeURIComponent(learnerId)}`);
  }

  public static async getFriendships(learnerId: string): Promise<{ success: boolean; friends: Friendship[] }> {
    return this.request(`/student-packs/friends?learnerId=${encodeURIComponent(learnerId)}`);
  }

  public static async sendFriendRequest(requesterId: string, receiverId: string): Promise<{
    success: boolean;
    friendship?: Friendship;
    message: string;
  }> {
    return this.request('/student-packs/request', {
      method: 'POST',
      body: JSON.stringify({ requesterId, receiverId })
    });
  }

  public static async respondToFriendRequest(
    learnerId: string,
    friendshipId: string,
    action: 'ACCEPT' | 'DECLINE' | 'BLOCK'
  ): Promise<{ success: boolean; friendship?: Friendship; message: string }> {
    return this.request('/student-packs/respond', {
      method: 'POST',
      body: JSON.stringify({ learnerId, friendshipId, action })
    });
  }

  public static async getStudentMessages(learnerId: string, peerId: string): Promise<{ success: boolean; messages: any[] }> {
    return this.request(`/student-packs/messages?learnerId=${encodeURIComponent(learnerId)}&peerId=${encodeURIComponent(peerId)}`);
  }

  public static async sendStudentMessage(
    senderId: string,
    receiverId: string,
    content: string
  ): Promise<{ success: boolean; message: any; warning?: string }> {
    return this.request('/student-packs/message', {
      method: 'POST',
      body: JSON.stringify({ senderId, receiverId, content })
    });
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

  // ==========================================
  // Worldwide Scholarships & Sprints
  // ==========================================
  public static async getScholarships(learnerId?: string): Promise<{
    success: boolean;
    scholarships: (Scholarship & {
      isClaimed: boolean;
      completedQuizzesInWindow: number;
      isExpired: boolean;
      isCapacityReached: boolean;
      canClaim: boolean;
      progressPercent: number;
    })[];
  }> {
    const query = learnerId ? `?learnerId=${encodeURIComponent(learnerId)}` : '';
    return this.request(`/scholarships${query}`);
  }

  public static async claimScholarship(scholarshipId: string, learnerId: string): Promise<{
    success: boolean;
    message: string;
    coinsAwarded: number;
    newBalance: number;
    badgeTitle?: string;
  }> {
    return this.request(`/scholarships/${scholarshipId}/claim`, {
      method: 'POST',
      body: JSON.stringify({ learnerId })
    });
  }

  public static async adminGetScholarships(adminEmail: string): Promise<{
    success: boolean;
    scholarships: Scholarship[];
    claims: (ScholarshipClaim & {
      learnerName?: string;
      learnerEmail?: string;
      learnerGrade?: number;
      scholarshipTitle?: string;
    })[];
    metrics: {
      totalScholarships: number;
      activeScholarships: number;
      totalClaims: number;
      totalCoinsDisbursed: number;
    };
  }> {
    return this.request('/admin/scholarships', {
      headers: this.adminHeaders(adminEmail)
    });
  }

  public static async adminCreateScholarship(
    adminEmail: string,
    params: {
      title: string;
      description?: string;
      targetQuizCount: number;
      rewardCoins: number;
      durationDays?: number;
      targetGrade?: number | 'ALL';
      targetBoard?: Board | 'ALL';
      badgeTitle?: string;
      maxRecipients?: number;
    }
  ): Promise<{ success: boolean; scholarship: Scholarship; message: string }> {
    return this.request('/admin/scholarships', {
      method: 'POST',
      headers: this.adminHeaders(adminEmail),
      body: JSON.stringify(params)
    });
  }

  public static async adminToggleScholarship(
    adminEmail: string,
    scholarshipId: string
  ): Promise<{ success: boolean; isActive: boolean; message: string }> {
    return this.request(`/admin/scholarships/${scholarshipId}/toggle`, {
      method: 'PATCH',
      headers: this.adminHeaders(adminEmail)
    });
  }

  public static async adminDeleteScholarship(
    adminEmail: string,
    scholarshipId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/admin/scholarships/${scholarshipId}`, {
      method: 'DELETE',
      headers: this.adminHeaders(adminEmail)
    });
  }
}
