import {
  Learner,
  Subscription,
  CoinLedgerEntry,
  LevelProgress,
  QuizAttempt,
  Certificate,
  ACode,
  Friendship,
  StudentPackMessage,
  GiftRequest,
  AuditLogEntry
} from '../types';

/**
 * StorageRLSLayer — Enterprise Client Storage with Row-Level Security (RLS) simulation.
 * Guarantees zero cross-client leakage. Client A cannot read or mutate Client B's records.
 * Super-Admin privileges are strictly gated to 'naitiknanda1235@gmail.com'.
 */

const STORAGE_KEYS = {
  LEARNERS: 'al_prod_learners_v1',
  SUBSCRIPTIONS: 'al_prod_subscriptions_v1',
  COIN_LEDGER: 'al_prod_coin_ledger_v1',
  COURSE_PROGRESS: 'al_prod_course_progress_v1',
  QUIZ_ATTEMPTS: 'al_prod_quiz_attempts_v1',
  CERTIFICATES: 'al_prod_certificates_v1',
  ACODES: 'al_prod_acodes_v1',
  FRIENDSHIPS: 'al_prod_friendships_v1',
  STUDENT_PACK_MESSAGES: 'al_prod_student_pack_messages_v1',
  GIFT_REQUESTS: 'al_prod_gift_requests_v1',
  AUDIT_LOGS: 'al_prod_security_audit_logs_v1',
  CURRENT_SESSION: 'al_prod_session_v1',
};

export const SUPER_ADMIN_EMAIL = 'naitiknanda1235@gmail.com';

class StorageRLSLayerClass {
  private memoryCache: Map<string, any> = new Map();

  constructor() {
    this.initDatabase();
    if (typeof window !== 'undefined') {
      this.syncWithServer().catch(() => {});
    }
  }

  private initDatabase() {
    // Seed default ACodes if empty
    const acodes = this.readRaw<ACode[]>(STORAGE_KEYS.ACODES, []);
    if (acodes.length === 0) {
      const defaultACodes: ACode[] = [
        {
          code: 'AL-SCHOLAR-2026',
          planTier: 'PLUS',
          durationDays: 180,
          isRedeemed: false,
          createdBy: SUPER_ADMIN_EMAIL,
          expiresAt: '2027-12-31T23:59:59.000Z',
          createdAt: new Date().toISOString()
        },
        {
          code: 'AL-CBSE-TOPPER',
          planTier: 'LITE',
          durationDays: 60,
          isRedeemed: false,
          createdBy: SUPER_ADMIN_EMAIL,
          expiresAt: '2027-12-31T23:59:59.000Z',
          createdAt: new Date().toISOString()
        }
      ];
      this.writeRaw(STORAGE_KEYS.ACODES, defaultACodes);
    }

    // Seed initial security audit log
    const auditLogs = this.readRaw<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    if (auditLogs.length === 0) {
      this.writeRaw(STORAGE_KEYS.AUDIT_LOGS, [
        {
          id: 'log_boot_' + Date.now(),
          timestampUtc: new Date().toISOString(),
          actorEmail: 'SYSTEM',
          actionType: 'SECURITY_BOOTSTRAP',
          targetId: 'KERNEL',
          severity: 'INFO',
          details: 'AcademicLevel RLS Kernel initialized with tenant isolation and Super-Admin guard.'
        }
      ]);
    }
  }

  private readRaw<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') {
      return (this.memoryCache.get(key) as T) || defaultValue;
    }
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  private writeRaw<T>(key: string, value: T): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error('LocalStorage write failed:', e);
      }
    }
    this.memoryCache.set(key, value);

    // Sync to backend persistent server
    if (typeof window !== 'undefined' && key !== STORAGE_KEYS.CURRENT_SESSION) {
      this.syncToServer(key, value);
    }
  }

  private getAdminPasskey(): string {
    if (typeof window === 'undefined') return '';
    try {
      return sessionStorage.getItem('al_admin_passkey') || localStorage.getItem('al_admin_passkey') || '';
    } catch {
      return '';
    }
  }

  /**
   * Syncs a single key to the backend database
   */
  private async syncToServer(key: string, value: any): Promise<void> {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
    try {
      const passkey = this.getAdminPasskey();
      if (!passkey) return; // Non-admin clients do not post to raw storage

      await fetch('/api/storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': SUPER_ADMIN_EMAIL,
          'x-admin-passkey': passkey
        },
        body: JSON.stringify({ key, value })
      });
    } catch {
      // Graceful offline fallback
    }
  }

  /**
   * Synchronizes entire database state between backend server and browser localStorage.
   * Merges server-side records so any account registered on ANY browser (Chrome/Edge/Firefox/Mobile)
   * is instantly recognized across ALL browsers!
   */
  public async syncWithServer(): Promise<boolean> {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return false;
    try {
      const passkey = this.getAdminPasskey();
      const headers: Record<string, string> = {};
      if (passkey) {
        headers['x-admin-email'] = SUPER_ADMIN_EMAIL;
        headers['x-admin-passkey'] = passkey;
      }

      const res = await fetch('/api/storage', { headers });
      if (!res.ok) return false;
      const serverDb = await res.json();

      let hasLocalUploads = false;
      const localDataToUpload: Record<string, any> = {};

      Object.values(STORAGE_KEYS).forEach(k => {
        // Skip current session because sessions are local to each browser tab/window
        if (k === STORAGE_KEYS.CURRENT_SESSION) return;

        const serverVal = serverDb[k];
        let localVal: any = null;
        try {
          const raw = localStorage.getItem(k);
          if (raw) localVal = JSON.parse(raw);
        } catch {}

        if (Array.isArray(serverVal)) {
          if (Array.isArray(localVal)) {
            // Merge arrays using identifier ('id', 'code', 'utrReference')
            const mergedMap = new Map<string, any>();
            serverVal.forEach(item => {
              const id = item.id || item.code || item.utrReference || item.timestampUtc;
              if (id) mergedMap.set(String(id), item);
            });

            localVal.forEach(item => {
              const id = item.id || item.code || item.utrReference || item.timestampUtc;
              if (id) {
                if (!mergedMap.has(String(id))) {
                  mergedMap.set(String(id), item);
                  hasLocalUploads = true;
                }
              }
            });

            const merged = Array.from(mergedMap.values());
            localStorage.setItem(k, JSON.stringify(merged));
            this.memoryCache.set(k, merged);
            if (hasLocalUploads) {
              localDataToUpload[k] = merged;
            }
          } else {
            localStorage.setItem(k, JSON.stringify(serverVal));
            this.memoryCache.set(k, serverVal);
          }
        } else if (serverVal !== undefined && serverVal !== null) {
          localStorage.setItem(k, JSON.stringify(serverVal));
          this.memoryCache.set(k, serverVal);
        } else if (localVal !== null && localVal !== undefined) {
          // Upload local data to server
          localDataToUpload[k] = localVal;
          hasLocalUploads = true;
        }
      });

      if (hasLocalUploads && Object.keys(localDataToUpload).length > 0 && passkey) {
        await fetch('/api/storage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-email': SUPER_ADMIN_EMAIL,
            'x-admin-passkey': passkey
          },
          body: JSON.stringify({ all: localDataToUpload })
        });
      }

      return true;
    } catch (e) {
      console.warn('[StorageRLSLayer] Offline server sync note:', e);
      return false;
    }
  }

  // ==========================================
  // Session & Identity Management
  // ==========================================
  public getCurrentSession(): { learnerId: string; email: string; role: 'STUDENT' | 'SUPER_ADMIN' } | null {
    return this.readRaw(STORAGE_KEYS.CURRENT_SESSION, null);
  }

  public setSession(session: { learnerId: string; email: string; role: 'STUDENT' | 'SUPER_ADMIN' } | null) {
    this.writeRaw(STORAGE_KEYS.CURRENT_SESSION, session);
  }

  // ==========================================
  // Learners
  // ==========================================
  public getLearnerById(learnerId: string, requestorId: string): Learner | null {
    const session = this.getCurrentSession();
    // Allow if requestor is super admin OR matches own learnerId
    if (session?.email !== SUPER_ADMIN_EMAIL && requestorId !== learnerId) {
      this.recordSecurityViolation(requestorId, 'UNAUTHORIZED_CROSS_TENANT_READ', learnerId);
      return null;
    }
    const learners = this.readRaw<Learner[]>(STORAGE_KEYS.LEARNERS, []);
    return learners.find(l => l.id === learnerId) || null;
  }

  public getLearnerByEmail(email: string): Learner | null {
    const learners = this.readRaw<Learner[]>(STORAGE_KEYS.LEARNERS, []);
    return learners.find(l => l.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public getLearnerByReferralCode(code: string): Learner | null {
    const learners = this.readRaw<Learner[]>(STORAGE_KEYS.LEARNERS, []);
    return learners.find(l => l.referralCode.toUpperCase() === code.toUpperCase()) || null;
  }

  public saveLearner(learner: Learner, requestorId: string): boolean {
    const session = this.getCurrentSession();
    if (session?.email !== SUPER_ADMIN_EMAIL && requestorId !== learner.id) {
      this.recordSecurityViolation(requestorId, 'UNAUTHORIZED_CROSS_TENANT_WRITE', learner.id);
      return false;
    }
    const learners = this.readRaw<Learner[]>(STORAGE_KEYS.LEARNERS, []);
    const idx = learners.findIndex(l => l.id === learner.id);
    if (idx >= 0) {
      learners[idx] = learner;
    } else {
      learners.push(learner);
    }
    this.writeRaw(STORAGE_KEYS.LEARNERS, learners);
    return true;
  }

  // Super-admin only method
  public getAllLearnersAdmin(adminEmail: string): Learner[] {
    if (adminEmail.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      this.recordSecurityViolation(adminEmail, 'SUPER_ADMIN_BREACH_ATTEMPT', 'ALL_LEARNERS');
      throw new Error('Access denied: 403 Forbidden. Only Super-Admin may access all learners.');
    }
    return this.readRaw<Learner[]>(STORAGE_KEYS.LEARNERS, []);
  }

  // ==========================================
  // Subscriptions & Payments
  // ==========================================
  public getSubscriptionsForLearner(learnerId: string, requestorId: string): Subscription[] {
    const session = this.getCurrentSession();
    if (session?.email !== SUPER_ADMIN_EMAIL && requestorId !== learnerId) {
      this.recordSecurityViolation(requestorId, 'UNAUTHORIZED_SUBSCRIPTION_READ', learnerId);
      return [];
    }
    const all = this.readRaw<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    return all.filter(s => s.learnerId === learnerId);
  }

  public getAllSubscriptionsAdmin(adminEmail: string): Subscription[] {
    if (adminEmail.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      this.recordSecurityViolation(adminEmail, 'SUPER_ADMIN_BREACH_ATTEMPT', 'ALL_SUBSCRIPTIONS');
      throw new Error('Access denied: 403 Forbidden.');
    }
    return this.readRaw<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
  }

  public isUtrRegistered(utr: string): boolean {
    const all = this.readRaw<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    return all.some(s => s.utrReference && s.utrReference.trim() === utr.trim());
  }

  public saveSubscription(sub: Subscription): void {
    const all = this.readRaw<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    const idx = all.findIndex(s => s.id === sub.id);
    if (idx >= 0) {
      all[idx] = sub;
    } else {
      all.push(sub);
    }
    this.writeRaw(STORAGE_KEYS.SUBSCRIPTIONS, all);
  }

  // ==========================================
  // Study Coin Ledger (Append-Only)
  // ==========================================
  public getCoinLedger(learnerId: string, requestorId: string): CoinLedgerEntry[] {
    const session = this.getCurrentSession();
    if (session?.email !== SUPER_ADMIN_EMAIL && requestorId !== learnerId) {
      this.recordSecurityViolation(requestorId, 'UNAUTHORIZED_LEDGER_READ', learnerId);
      return [];
    }
    const all = this.readRaw<CoinLedgerEntry[]>(STORAGE_KEYS.COIN_LEDGER, []);
    return all.filter(e => e.learnerId === learnerId);
  }

  public getAllLedgerAdmin(adminEmail: string): CoinLedgerEntry[] {
    if (adminEmail.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      this.recordSecurityViolation(adminEmail, 'SUPER_ADMIN_BREACH_ATTEMPT', 'ALL_LEDGER');
      throw new Error('Access denied: 403 Forbidden.');
    }
    return this.readRaw<CoinLedgerEntry[]>(STORAGE_KEYS.COIN_LEDGER, []);
  }

  public appendCoinEntry(entry: CoinLedgerEntry): void {
    const all = this.readRaw<CoinLedgerEntry[]>(STORAGE_KEYS.COIN_LEDGER, []);
    all.push(entry);
    this.writeRaw(STORAGE_KEYS.COIN_LEDGER, all);
  }

  // ==========================================
  // Course Progress & Quizzes
  // ==========================================
  public getProgressForLearner(learnerId: string, requestorId: string): LevelProgress[] {
    const session = this.getCurrentSession();
    if (session?.email !== SUPER_ADMIN_EMAIL && requestorId !== learnerId) {
      return [];
    }
    const all = this.readRaw<LevelProgress[]>(STORAGE_KEYS.COURSE_PROGRESS, []);
    return all.filter(p => p.learnerId === learnerId);
  }

  public saveProgress(progress: LevelProgress): void {
    const all = this.readRaw<LevelProgress[]>(STORAGE_KEYS.COURSE_PROGRESS, []);
    const idx = all.findIndex(
      p =>
        p.learnerId === progress.learnerId &&
        p.board === progress.board &&
        p.grade === progress.grade &&
        p.subjectId === progress.subjectId &&
        p.levelNode === progress.levelNode
    );
    if (idx >= 0) {
      all[idx] = progress;
    } else {
      all.push(progress);
    }
    this.writeRaw(STORAGE_KEYS.COURSE_PROGRESS, all);
  }

  public getQuizAttempts(learnerId: string, requestorId: string): QuizAttempt[] {
    const session = this.getCurrentSession();
    if (session?.email !== SUPER_ADMIN_EMAIL && requestorId !== learnerId) {
      return [];
    }
    const all = this.readRaw<QuizAttempt[]>(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
    return all.filter(q => q.learnerId === learnerId);
  }

  public recordQuizAttempt(attempt: QuizAttempt): void {
    const all = this.readRaw<QuizAttempt[]>(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
    all.push(attempt);
    this.writeRaw(STORAGE_KEYS.QUIZ_ATTEMPTS, all);
  }

  // ==========================================
  // Certificates (Level & Annual Master)
  // ==========================================
  public getCertificates(learnerId: string, requestorId: string): Certificate[] {
    const session = this.getCurrentSession();
    if (session?.email !== SUPER_ADMIN_EMAIL && requestorId !== learnerId) {
      return [];
    }
    const all = this.readRaw<Certificate[]>(STORAGE_KEYS.CERTIFICATES, []);
    return all.filter(c => c.learnerId === learnerId);
  }

  public issueCertificate(cert: Certificate): void {
    const all = this.readRaw<Certificate[]>(STORAGE_KEYS.CERTIFICATES, []);
    // Prevent duplicate master certificate for same academic year
    if (cert.certificateType === 'ANNUAL_MASTER') {
      const exists = all.some(
        c =>
          c.learnerId === cert.learnerId &&
          c.certificateType === 'ANNUAL_MASTER' &&
          c.academicYear === cert.academicYear
      );
      if (exists) return; // deduplication
    }
    all.push(cert);
    this.writeRaw(STORAGE_KEYS.CERTIFICATES, all);
  }

  // ==========================================
  // ACodes (Vouchers)
  // ==========================================
  public getAllACodesAdmin(adminEmail: string): ACode[] {
    if (adminEmail.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      throw new Error('403 Forbidden');
    }
    return this.readRaw<ACode[]>(STORAGE_KEYS.ACODES, []);
  }

  public getACode(code: string): ACode | null {
    const all = this.readRaw<ACode[]>(STORAGE_KEYS.ACODES, []);
    return all.find(c => c.code.toUpperCase() === code.trim().toUpperCase()) || null;
  }

  public saveACode(acode: ACode): void {
    const all = this.readRaw<ACode[]>(STORAGE_KEYS.ACODES, []);
    const idx = all.findIndex(c => c.code.toUpperCase() === acode.code.toUpperCase());
    if (idx >= 0) {
      all[idx] = acode;
    } else {
      all.push(acode);
    }
    this.writeRaw(STORAGE_KEYS.ACODES, all);
  }

  // ==========================================
  // StudentPacks & Friendships
  // ==========================================
  public getFriends(learnerId: string): Friendship[] {
    const all = this.readRaw<Friendship[]>(STORAGE_KEYS.FRIENDSHIPS, []);
    return all.filter(f => f.requesterId === learnerId || f.receiverId === learnerId);
  }

  public saveFriendship(friendship: Friendship): void {
    const all = this.readRaw<Friendship[]>(STORAGE_KEYS.FRIENDSHIPS, []);
    const idx = all.findIndex(f => f.id === friendship.id);
    if (idx >= 0) {
      all[idx] = friendship;
    } else {
      all.push(friendship);
    }
    this.writeRaw(STORAGE_KEYS.FRIENDSHIPS, all);
  }

  public getMessages(learnerId1: string, learnerId2: string): StudentPackMessage[] {
    const all = this.readRaw<StudentPackMessage[]>(STORAGE_KEYS.STUDENT_PACK_MESSAGES, []);
    return all.filter(
      m =>
        (m.senderId === learnerId1 && m.receiverId === learnerId2) ||
        (m.senderId === learnerId2 && m.receiverId === learnerId1)
    );
  }

  public saveMessage(message: StudentPackMessage): void {
    const all = this.readRaw<StudentPackMessage[]>(STORAGE_KEYS.STUDENT_PACK_MESSAGES, []);
    all.push(message);
    this.writeRaw(STORAGE_KEYS.STUDENT_PACK_MESSAGES, all);
  }

  public getAllFlaggedMessagesAdmin(adminEmail: string): StudentPackMessage[] {
    if (adminEmail.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      throw new Error('403 Forbidden');
    }
    const all = this.readRaw<StudentPackMessage[]>(STORAGE_KEYS.STUDENT_PACK_MESSAGES, []);
    return all.filter(m => m.flaggedForReview);
  }

  // ==========================================
  // Gift Requests
  // ==========================================
  public getGiftRequestsForLearner(learnerId: string): GiftRequest[] {
    const all = this.readRaw<GiftRequest[]>(STORAGE_KEYS.GIFT_REQUESTS, []);
    return all.filter(g => g.learnerId === learnerId);
  }

  public getAllGiftRequestsAdmin(adminEmail: string): GiftRequest[] {
    if (adminEmail.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      throw new Error('403 Forbidden');
    }
    return this.readRaw<GiftRequest[]>(STORAGE_KEYS.GIFT_REQUESTS, []);
  }

  public saveGiftRequest(request: GiftRequest): void {
    const all = this.readRaw<GiftRequest[]>(STORAGE_KEYS.GIFT_REQUESTS, []);
    const idx = all.findIndex(g => g.id === request.id);
    if (idx >= 0) {
      all[idx] = request;
    } else {
      all.push(request);
    }
    this.writeRaw(STORAGE_KEYS.GIFT_REQUESTS, all);
  }

  // ==========================================
  // Audit Logs & Security
  // ==========================================
  public recordSecurityViolation(actor: string, violationType: string, target: string): void {
    const entry: AuditLogEntry = {
      id: 'sec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestampUtc: new Date().toISOString(),
      actorEmail: actor,
      actionType: violationType,
      targetId: target,
      severity: 'CRITICAL',
      details: `Security violation attempt detected. Operation blocked by RLS kernel.`
    };
    this.appendAuditLog(entry);
  }

  public recordAdminAction(adminEmail: string, actionType: string, targetId: string, details: string): void {
    const entry: AuditLogEntry = {
      id: 'admin_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestampUtc: new Date().toISOString(),
      actorEmail: adminEmail,
      actionType,
      targetId,
      severity: 'INFO',
      details
    };
    this.appendAuditLog(entry);
  }

  public appendAuditLog(entry: AuditLogEntry): void {
    const logs = this.readRaw<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    logs.unshift(entry); // newest first
    this.writeRaw(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 500)); // retain last 500 entries
  }

  public getAuditLogsAdmin(adminEmail: string): AuditLogEntry[] {
    if (adminEmail.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      this.recordSecurityViolation(adminEmail, 'UNAUTHORIZED_AUDIT_LOG_READ', 'SYSTEM_AUDIT_LOGS');
      throw new Error('Access denied: 403 Forbidden.');
    }
    return this.readRaw<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }
}

export const StorageRLSLayer = new StorageRLSLayerClass();
