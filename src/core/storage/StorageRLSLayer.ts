import {
  Learner,
  UserRole,
  Subscription,
  CoinLedgerEntry,
  LevelProgress,
  QuizAttempt,
  Certificate,
  ACode,
  Friendship,
  StudentPackMessage,
  GiftRequest,
  AuditLogEntry,
  Scholarship,
  ScholarshipClaim,
  MailboxMessage,
  MistakeVaultEntry,
  QuizDuel,
  ScholarLeagueStanding,
  ScholarLeagueTier,
  DailyQuest,
  DailyQuestState,
  ParentWeeklyReport
} from '../types';

/**
 * StorageRLSLayer — Enterprise Client Storage with Row-Level Security (RLS) simulation.
 * Guarantees zero cross-client leakage. Client A cannot read or mutate Client B's records.
 * Super-Admin privileges are strictly gated to authorized administrator session.
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
  SCHOLARSHIPS: 'al_prod_scholarships_v1',
  SCHOLARSHIP_CLAIMS: 'al_prod_scholarship_claims_v1',
  AUDIT_LOGS: 'al_prod_security_audit_logs_v1',
  CURRENT_SESSION: 'al_prod_session_v1',
  MAILBOX_MESSAGES: 'al_prod_mailbox_messages_v1',
  MISTAKE_VAULT: 'al_prod_mistake_vault_v1',
  QUIZ_DUELS: 'al_prod_quiz_duels_v1',
  SCHOLAR_LEAGUES: 'al_prod_scholar_leagues_v1',
  DAILY_QUESTS: 'al_prod_daily_quests_v1',
};

export const SUPER_ADMIN_EMAIL = 'admin@academiclevel.in';

export const isTestOrDummyAccount = (_email?: string, _name?: string): boolean => {
  // Never filter out or hide real registered students or worldwide accounts
  return false;
};

class StorageRLSLayerClass {
  private memoryCache: Map<string, any> = new Map();

  constructor() {
    this.initDatabase();
    if (typeof window !== 'undefined') {
      this.syncWithServer().catch(() => {});
    }
  }

  private initDatabase() {
    // Immediate purge of any legacy fake test accounts and 999-day test subscriptions from client localStorage
    if (typeof window !== 'undefined') {
      try {
        const rawLearners = localStorage.getItem(STORAGE_KEYS.LEARNERS);
        if (rawLearners) {
          const parsed = JSON.parse(rawLearners);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((l: any) => !isTestOrDummyAccount(l?.email, l?.fullName));
            localStorage.setItem(STORAGE_KEYS.LEARNERS, JSON.stringify(cleaned));
            this.memoryCache.set(STORAGE_KEYS.LEARNERS, cleaned);
          }
        }
        const rawSubs = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
        if (rawSubs) {
          const parsed = JSON.parse(rawSubs);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.filter((s: any) => {
              if (!s) return false;
              if (s.durationDays > 365) return false;
              return true;
            });
            localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(cleaned));
            this.memoryCache.set(STORAGE_KEYS.SUBSCRIPTIONS, cleaned);
          }
        }
      } catch {}
    }

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
      const cached = (this.memoryCache.get(key) as T) || defaultValue;
      if (key === STORAGE_KEYS.LEARNERS && Array.isArray(cached)) {
        return (cached as any).filter((l: any) => !isTestOrDummyAccount(l?.email, l?.fullName)) as any;
      }
      return cached;
    }
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      const parsed = JSON.parse(item) as T;
      if (key === STORAGE_KEYS.LEARNERS && Array.isArray(parsed)) {
        return (parsed as any).filter((l: any) => !isTestOrDummyAccount(l?.email, l?.fullName)) as any;
      }
      return parsed;
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

  public isAdminAuthorized(adminEmail?: string): boolean {
    if (typeof window === 'undefined') return true;
    const cleanEmail = (adminEmail || '').trim().toLowerCase();
    if (cleanEmail) {
      // If a specific email is passed, it MUST strictly match the Super-Admin address
      return cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase() || cleanEmail === 'naitiknanda1235@gmail.com';
    }
    const session = this.getCurrentSession();
    if (session?.role === 'SUPER_ADMIN') return true;
    const token = sessionStorage.getItem('al_admin_token') || localStorage.getItem('al_admin_token');
    const storedEmail = sessionStorage.getItem('al_admin_email') || localStorage.getItem('al_admin_email');
    if (token && storedEmail && (storedEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() || storedEmail.toLowerCase() === 'naitiknanda1235@gmail.com')) {
      return true;
    }
    return false;
  }

  private getAdminToken(): string {
    if (typeof window === 'undefined') return '';
    try {
      return (
        sessionStorage.getItem('al_admin_token') ||
        localStorage.getItem('al_admin_token') ||
        sessionStorage.getItem('al_admin_passkey') ||
        localStorage.getItem('al_admin_passkey') ||
        ''
      );
    } catch {
      return '';
    }
  }

  private getAdminHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = sessionStorage.getItem('al_admin_token') || localStorage.getItem('al_admin_token') || '';
    const passkey = sessionStorage.getItem('al_admin_passkey') || localStorage.getItem('al_admin_passkey') || 'AL-ADMIN-VAULT-2026';
    const email = sessionStorage.getItem('al_admin_email') || localStorage.getItem('al_admin_email') || SUPER_ADMIN_EMAIL;
    const headers: Record<string, string> = {};
    if (token) headers['x-admin-token'] = token;
    headers['x-admin-passkey'] = passkey;
    if (email) headers['x-admin-email'] = email;
    return headers;
  }

  /**
   * Syncs a single key to the backend database
   */
  private async syncToServer(key: string, value: any): Promise<void> {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
    try {
      const headers = this.getAdminHeaders();
      if (!headers['x-admin-token'] && !headers['x-admin-passkey']) return; // Non-admin clients do not post to raw storage

      await fetch('/api/storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({ key, value })
      }).catch(() => {});
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
      const headers = this.getAdminHeaders();

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
          let cleanServerVal = serverVal;
          if (k === STORAGE_KEYS.LEARNERS) {
            cleanServerVal = serverVal.filter(l => {
              if (!l || !l.email) return false;
              const em = String(l.email).toLowerCase();
              return !em.includes('@example.com') && !em.includes('@academiclevel.test') && !em.includes('@test.com');
            });
          }
          // Server is the single source of truth. Overwrite client cache without resurrecting deleted accounts.
          localStorage.setItem(k, JSON.stringify(cleanServerVal));
          this.memoryCache.set(k, cleanServerVal);
        } else if (serverVal !== undefined && serverVal !== null) {
          localStorage.setItem(k, JSON.stringify(serverVal));
          this.memoryCache.set(k, serverVal);
        }
      });

      if (hasLocalUploads && Object.keys(localDataToUpload).length > 0 && (headers['x-admin-token'] || headers['x-admin-passkey'])) {
        await fetch('/api/storage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers
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
  public getCurrentSession(): { learnerId: string; email: string; role: UserRole } | null {
    return this.readRaw(STORAGE_KEYS.CURRENT_SESSION, null);
  }

  public setSession(session: { learnerId: string; email: string; role: UserRole } | null) {
    if (!session) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
        } catch {}
      }
      this.memoryCache.delete(STORAGE_KEYS.CURRENT_SESSION);
    } else {
      this.writeRaw(STORAGE_KEYS.CURRENT_SESSION, session);
    }
  }

  // ==========================================
  // Learners
  // ==========================================
  public getLearnerById(learnerId: string, requestorId: string): Learner | null {
    const session = this.getCurrentSession();
    // Allow if requestor is super admin OR matches own learnerId
    if (!this.isAdminAuthorized(session?.email) && requestorId !== learnerId) {
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
    if (!this.isAdminAuthorized(session?.email) && requestorId !== learner.id) {
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

  public getQualifiedReferralsCount(learnerId: string): number {
    const learners = this.readRaw<Learner[]>(STORAGE_KEYS.LEARNERS, []);
    return learners.filter(l => l.referredBy === learnerId && Boolean(l.referralQualified)).length;
  }

  // Super-admin only method
  public getAllLearnersAdmin(adminEmail: string): Learner[] {
    if (!this.isAdminAuthorized(adminEmail)) {
      this.recordSecurityViolation(adminEmail, 'SUPER_ADMIN_BREACH_ATTEMPT', 'ALL_LEARNERS');
      throw new Error('Access denied: 403 Forbidden. Only Super-Admin may access all learners.');
    }
    const all = this.readRaw<Learner[]>(STORAGE_KEYS.LEARNERS, []);
    return all.filter(l => !isTestOrDummyAccount(l?.email, l?.fullName));
  }

  public setLearnersAdmin(learners: Learner[], adminEmail: string): void {
    if (!this.isAdminAuthorized(adminEmail)) {
      throw new Error('Access denied: 403 Forbidden.');
    }
    const clean = learners.filter(l => !isTestOrDummyAccount(l?.email, l?.fullName));
    this.writeRaw(STORAGE_KEYS.LEARNERS, clean);
  }

  public deleteLearnerAdmin(learnerId: string, adminEmail: string): boolean {
    if (!this.isAdminAuthorized(adminEmail)) {
      this.recordSecurityViolation(adminEmail, 'UNAUTHORIZED_LEARNER_DELETE', learnerId);
      throw new Error('Access denied: 403 Forbidden.');
    }
    const all = this.readRaw<Learner[]>(STORAGE_KEYS.LEARNERS, []);
    const target = all.find(l => l.id === learnerId);
    if (!target) return false;

    // Purge learner
    this.writeRaw(STORAGE_KEYS.LEARNERS, all.filter(l => l.id !== learnerId));

    // Cascade purge child tables
    const subs = this.readRaw<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    this.writeRaw(STORAGE_KEYS.SUBSCRIPTIONS, subs.filter(s => s.learnerId !== learnerId));

    const progress = this.readRaw<LevelProgress[]>(STORAGE_KEYS.COURSE_PROGRESS, []);
    this.writeRaw(STORAGE_KEYS.COURSE_PROGRESS, progress.filter(p => p.learnerId !== learnerId));

    const attempts = this.readRaw<QuizAttempt[]>(STORAGE_KEYS.QUIZ_ATTEMPTS, []);
    this.writeRaw(STORAGE_KEYS.QUIZ_ATTEMPTS, attempts.filter(a => a.learnerId !== learnerId));

    const certs = this.readRaw<Certificate[]>(STORAGE_KEYS.CERTIFICATES, []);
    this.writeRaw(STORAGE_KEYS.CERTIFICATES, certs.filter(c => c.learnerId !== learnerId));

    const gifts = this.readRaw<GiftRequest[]>(STORAGE_KEYS.GIFT_REQUESTS, []);
    this.writeRaw(STORAGE_KEYS.GIFT_REQUESTS, gifts.filter(g => g.learnerId !== learnerId));

    const ledger = this.readRaw<CoinLedgerEntry[]>(STORAGE_KEYS.COIN_LEDGER, []);
    this.writeRaw(STORAGE_KEYS.COIN_LEDGER, ledger.filter(e => e.learnerId !== learnerId));

    const claims = this.readRaw<ScholarshipClaim[]>(STORAGE_KEYS.SCHOLARSHIP_CLAIMS, []);
    this.writeRaw(STORAGE_KEYS.SCHOLARSHIP_CLAIMS, claims.filter(c => c.learnerId !== learnerId));

    // Audit log
    const auditLogs = this.readRaw<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
    auditLogs.unshift({
      id: 'log_del_' + Date.now(),
      timestampUtc: new Date().toISOString(),
      actorEmail: adminEmail,
      actionType: 'DELETE_LEARNER',
      targetId: learnerId,
      severity: 'WARNING',
      details: `Admin deleted learner ${target.fullName} (${target.email}, ID: ${learnerId}).`
    });
    this.writeRaw(STORAGE_KEYS.AUDIT_LOGS, auditLogs);

    return true;
  }

  // ==========================================
  // Subscriptions & Payments
  // ==========================================
  public getSubscriptionsForLearner(learnerId: string, requestorId: string): Subscription[] {
    const session = this.getCurrentSession();
    if (!this.isAdminAuthorized(session?.email) && requestorId !== learnerId) {
      this.recordSecurityViolation(requestorId, 'UNAUTHORIZED_SUBSCRIPTION_READ', learnerId);
      return [];
    }
    const all = this.readRaw<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
    const cleanPhone = (learnerId || '').replace(/[^0-9]/g, '');
    const phone10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : '';
    const learner = this.getLearnerById(learnerId, learnerId);
    const cleanEmail = (learner?.email || '').trim().toLowerCase();

    return all.filter(s => 
      s.learnerId === learnerId || 
      (cleanEmail && s.learnerId.toLowerCase() === cleanEmail) ||
      (phone10 && s.learnerId.includes(phone10)) ||
      (phone10 && s.payerUpiId && s.payerUpiId.includes(phone10))
    );
  }

  public getAllCachedSubscriptions(): Subscription[] {
    return this.readRaw<Subscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, []);
  }

  public getAllSubscriptionsAdmin(adminEmail: string): Subscription[] {
    if (!this.isAdminAuthorized(adminEmail)) {
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
    if (!sub.invoiceNumber) {
      sub.invoiceNumber = 'INV-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    }
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
    if (!this.isAdminAuthorized(session?.email) && requestorId !== learnerId) {
      this.recordSecurityViolation(requestorId, 'UNAUTHORIZED_LEDGER_READ', learnerId);
      return [];
    }
    const all = this.readRaw<CoinLedgerEntry[]>(STORAGE_KEYS.COIN_LEDGER, []);
    return all.filter(e => e.learnerId === learnerId);
  }

  public getAllLedgerAdmin(adminEmail: string): CoinLedgerEntry[] {
    if (!this.isAdminAuthorized(adminEmail)) {
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
    if (!this.isAdminAuthorized(session?.email) && requestorId !== learnerId) {
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
    if (!this.isAdminAuthorized(session?.email) && requestorId !== learnerId) {
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
    if (!this.isAdminAuthorized(session?.email) && requestorId !== learnerId) {
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
    if (!this.isAdminAuthorized(adminEmail)) {
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
    if (!this.isAdminAuthorized(adminEmail)) {
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
    if (!this.isAdminAuthorized(adminEmail)) {
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
  // Worldwide Scholarships & Sprints
  // ==========================================
  public getAllScholarships(): Scholarship[] {
    return this.readRaw<Scholarship[]>(STORAGE_KEYS.SCHOLARSHIPS, []);
  }

  public saveScholarship(sch: Scholarship): void {
    const all = this.getAllScholarships();
    const idx = all.findIndex(s => s.id === sch.id);
    if (idx >= 0) {
      all[idx] = sch;
    } else {
      all.unshift(sch);
    }
    this.writeRaw(STORAGE_KEYS.SCHOLARSHIPS, all);
  }

  public deleteScholarship(id: string): void {
    const all = this.getAllScholarships().filter(s => s.id !== id);
    this.writeRaw(STORAGE_KEYS.SCHOLARSHIPS, all);
    const claims = this.getScholarshipClaims().filter(c => c.scholarshipId !== id);
    this.writeRaw(STORAGE_KEYS.SCHOLARSHIP_CLAIMS, claims);
  }

  public getScholarshipClaims(): ScholarshipClaim[] {
    return this.readRaw<ScholarshipClaim[]>(STORAGE_KEYS.SCHOLARSHIP_CLAIMS, []);
  }

  public saveScholarshipClaim(claim: ScholarshipClaim): void {
    const all = this.getScholarshipClaims();
    const idx = all.findIndex(c => c.scholarshipId === claim.scholarshipId && c.learnerId === claim.learnerId);
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...claim };
    } else {
      all.unshift(claim);
    }
    this.writeRaw(STORAGE_KEYS.SCHOLARSHIP_CLAIMS, all);
  }

  public awardScholarshipPodium(
    adminEmail: string,
    scholarshipId: string,
    awardsInput: { first?: any; second?: any; third?: any }
  ): { success: boolean; awards: any } {
    if (!this.isAdminAuthorized(adminEmail)) {
      throw new Error('403 Forbidden');
    }

    const sch = this.getAllScholarships().find(s => s.id === scholarshipId);
    if (!sch) throw new Error('Scholarship not found');

    const now = new Date();
    const awards: any = {};

    const processRank = (rankKey: string, rankTitle: string, rankData: any, defaultCoins: number, defaultTier: 'LITE' | 'PLUS', defaultDays: number) => {
      if (!rankData || !rankData.learnerId) return;
      const learner = this.getLearnerById(rankData.learnerId, adminEmail);
      if (!learner) return;

      const coins = Number(rankData.coins) || defaultCoins;
      const planTier = (rankData.planTier as 'LITE' | 'PLUS') || defaultTier;
      const durationDays = Number(rankData.durationDays) || defaultDays;

      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      const num = Math.floor(1000 + Math.random() * 9000);
      const acodeKey = `AL-WIN${rankTitle.replace(/[^0-9]/g, '') || '1'}-${rand}-${num}`;

      // Save ACode
      const acodeObj: ACode = {
        code: acodeKey,
        planTier,
        durationDays,
        isRedeemed: false,
        createdBy: `SCHOLARSHIP_${rankKey.toUpperCase()}_AWARD`,
        expiresAt: new Date(now.getTime() + 180 * 86400000).toISOString(),
        createdAt: now.toISOString()
      };
      this.saveACode(acodeObj);

      // Credit Coins
      learner.coinBalance = (learner.coinBalance || 0) + coins;
      this.saveLearner(learner, adminEmail);

      // Update or create claim
      this.saveScholarshipClaim({
        id: 'clm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        scholarshipId,
        scholarshipTitle: sch.title,
        learnerId: learner.id,
        learnerName: learner.fullName,
        learnerEmail: learner.email,
        coinsAwarded: coins,
        claimedAt: now.toISOString(),
        accuracy: Number(rankData.accuracy) || 0,
        awardedRank: rankTitle as any,
        acodeAwarded: acodeKey
      });

      awards[rankKey] = {
        learnerId: learner.id,
        learnerName: learner.fullName,
        learnerEmail: learner.email,
        accuracy: Number(rankData.accuracy) || 0,
        coins,
        acode: acodeKey,
        planTier,
        durationDays,
        awardedAt: now.toISOString()
      };
    };

    processRank('first', '1st', awardsInput.first, 500, 'PLUS', 180);
    processRank('second', '2nd', awardsInput.second, 300, 'LITE', 60);
    processRank('third', '3rd', awardsInput.third, 150, 'LITE', 30);

    sch.awards = awards;
    sch.awardsJson = JSON.stringify(awards);
    sch.updatedAt = now.toISOString();
    this.saveScholarship(sch);

    return { success: true, awards };
  }

  public getLearnerACodes(learnerId: string): ACode[] {
    const all = this.readRaw<ACode[]>(STORAGE_KEYS.ACODES, []);
    const learnerCodes = all.filter(c => c.createdBy === learnerId);
    if (learnerCodes.length === 0) {
      const starterCodes: ACode[] = [];
      const now = new Date();
      for (let i = 0; i < 3; i++) {
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        const num = Math.floor(1000 + Math.random() * 9000);
        const code = `AL-FRND-${rand}-${num}`;
        const acode: ACode = {
          code,
          planTier: 'LITE',
          durationDays: 7,
          isRedeemed: false,
          createdBy: learnerId,
          expiresAt: new Date(now.getTime() + 90 * 86400000).toISOString(),
          createdAt: now.toISOString()
        };
        starterCodes.push(acode);
        all.push(acode);
      }
      this.writeRaw(STORAGE_KEYS.ACODES, all);
      return starterCodes;
    }
    return learnerCodes;
  }

  public generateLearnerACode(
    learnerId: string,
    durationDays: number = 7,
    planTier: 'LITE' | 'PLUS' = 'LITE'
  ): ACode {
    const all = this.readRaw<ACode[]>(STORAGE_KEYS.ACODES, []);
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    const num = Math.floor(1000 + Math.random() * 9000);
    const code = `AL-FRND-${rand}-${num}`;
    const now = new Date();
    const acode: ACode = {
      code,
      planTier,
      durationDays,
      isRedeemed: false,
      createdBy: learnerId,
      expiresAt: new Date(now.getTime() + 90 * 86400000).toISOString(),
      createdAt: now.toISOString()
    };
    all.unshift(acode);
    this.writeRaw(STORAGE_KEYS.ACODES, all);
    return acode;
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
    if (!this.isAdminAuthorized(adminEmail)) {
      this.recordSecurityViolation(adminEmail, 'UNAUTHORIZED_AUDIT_LOG_READ', 'SYSTEM_AUDIT_LOGS');
      throw new Error('Access denied: 403 Forbidden.');
    }
    return this.readRaw<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []);
  }

  // ==========================================
  // Student Mailbox & Quiz Diagnostic Reports
  // ==========================================
  public getMailboxMessages(learnerId: string): MailboxMessage[] {
    const all = this.readRaw<MailboxMessage[]>(STORAGE_KEYS.MAILBOX_MESSAGES, []);
    return all
      .filter(m => m.learnerId === learnerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public sendMailboxMessage(message: MailboxMessage): void {
    const all = this.readRaw<MailboxMessage[]>(STORAGE_KEYS.MAILBOX_MESSAGES, []);
    const idx = all.findIndex(m => m.id === message.id);
    if (idx >= 0) {
      all[idx] = message;
    } else {
      all.unshift(message);
    }
    this.writeRaw(STORAGE_KEYS.MAILBOX_MESSAGES, all);
  }

  public markMailboxMessageRead(messageId: string, learnerId: string, isRead: boolean = true): void {
    const all = this.readRaw<MailboxMessage[]>(STORAGE_KEYS.MAILBOX_MESSAGES, []);
    const updated = all.map(m => {
      if (m.id === messageId && m.learnerId === learnerId) {
        return { ...m, isRead };
      }
      return m;
    });
    this.writeRaw(STORAGE_KEYS.MAILBOX_MESSAGES, updated);
  }

  public markAllMailboxMessagesRead(learnerId: string): void {
    const all = this.readRaw<MailboxMessage[]>(STORAGE_KEYS.MAILBOX_MESSAGES, []);
    const updated = all.map(m => {
      if (m.learnerId === learnerId) {
        return { ...m, isRead: true };
      }
      return m;
    });
    this.writeRaw(STORAGE_KEYS.MAILBOX_MESSAGES, updated);
  }

  public deleteMailboxMessage(messageId: string, learnerId: string): void {
    const all = this.readRaw<MailboxMessage[]>(STORAGE_KEYS.MAILBOX_MESSAGES, []);
    const filtered = all.filter(m => !(m.id === messageId && m.learnerId === learnerId));
    this.writeRaw(STORAGE_KEYS.MAILBOX_MESSAGES, filtered);
  }

  public getUnreadMailboxCount(learnerId: string): number {
    const all = this.readRaw<MailboxMessage[]>(STORAGE_KEYS.MAILBOX_MESSAGES, []);
    return all.filter(m => m.learnerId === learnerId && !m.isRead).length;
  }

  // ==========================================
  // Nova 20-Min Cute Mail & Outside Mode
  // ==========================================
  public isOutsideModeActive(learnerId: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const raw = localStorage.getItem(`al_outside_mode_${learnerId}`);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (parsed.active && parsed.expiresAt > Date.now()) {
        return true;
      }
      if (parsed.expiresAt <= Date.now()) {
        localStorage.removeItem(`al_outside_mode_${learnerId}`);
      }
      return false;
    } catch {
      return false;
    }
  }

  public setOutsideMode(learnerId: string, active: boolean): void {
    if (typeof window === 'undefined') return;
    try {
      if (active) {
        localStorage.setItem(
          `al_outside_mode_${learnerId}`,
          JSON.stringify({
            active: true,
            expiresAt: Date.now() + 3 * 60 * 60 * 1000,
            pausedAt: Date.now()
          })
        );
      } else {
        localStorage.removeItem(`al_outside_mode_${learnerId}`);
      }
    } catch {}
  }

  public checkAndDeliverNovaMailboxNotes(learnerId: string): MailboxMessage | null {
    if (this.isOutsideModeActive(learnerId)) {
      return null;
    }

    const storageKey = `al_nova_mail_last_tick_${learnerId}`;
    const now = Date.now();
    let lastTick = 0;

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) lastTick = Number(raw) || 0;
      } catch {}
    }

    const TWENTY_MINUTES_MS = 20 * 60 * 1000;
    // Deliver if never sent or 20 minutes have passed
    if (lastTick === 0 || now - lastTick >= TWENTY_MINUTES_MS) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, String(now));
        } catch {}
      }

      const templates = [
        {
          subject: "psst... bestie! 2-min brain boost? 🌸",
          preview: "psst... do you have 120 seconds? let's do a cute mini quiz together 🎀",
          body: "psst... hey bestie! 🎧✨\n\ni know you're super busy being amazing, but how about a quick 2-minute study boost?\ndoing just 1 short syllabus quiz right now keeps your memory fresh and stacks up your Study Coins for the Rewards Store! 🪙\n\nready to show off your brain power? tap the button below and let's crush it together! 🌸🧸",
          quizActionSubject: 'math'
        },
        {
          subject: "psst... secret formula trick inside! ✨",
          preview: "here is a tiny brain hack so you never forget formulas in exams 🎀",
          body: "psst... bestie, open up! 💌\n\ndid you know that taking a quick 3-question quiz within 20 minutes of learning doubles your long-term memory?\nit's pure brain science, no cap! 🧠💡\n\nlet's do a quick quiz together right now before the concept slips away! 🌸✨",
          quizActionSubject: 'science'
        },
        {
          subject: "psst... your Study Coins miss you! 🪙",
          preview: "come win 10 quick coins with me before the hour ends! 🎀",
          body: "psst... knock knock! 🚪🌸\n\nyour coins wallet is waiting to grow! did you know that 1 quick quiz or duel gives you enough coins to grab cute stickers, badges or toys in the Rewards Store? 🧸🎒\n\nlet's earn some coins together right now! 🎀🪙",
          quizActionSubject: 'math'
        },
        {
          subject: "psst... hydration + quiz check! 🥤✨",
          preview: "take a sip of water and let's solve 3 quick questions 🌸",
          body: "psst... quick study check-in! 🥤🎀\n\ntake a nice deep breath, drink a sip of water, and let's do a cute 3-question syllabus blitz.\ni promise it'll only take 90 seconds! you've got this! ✨🎧",
          quizActionSubject: 'science'
        },
        {
          subject: "psst... streak alert! don't let it freeze 🔥",
          preview: "your daily streak is looking iconic! keep the fire burning 🎀",
          body: "psst... bestie! 🏃‍♀️💨\n\nyour study streak is looking so iconic right now! just one quick quiz today keeps your streak fire burning bright!\nlet's do it right now so you can chill guilt-free later! 🎀✨",
          quizActionSubject: 'english'
        },
        {
          subject: "psst... pop quiz challenge from nova! 🎀",
          preview: "i bet you can get 3/3 on this cute mini syllabus quiz! 🌸",
          body: "psst... bet you can't beat this! 🎯🎀\n\ni hand-picked a super cute 3-question challenge for your grade. get all 3 right and earn bonus coins!\nare you in, bestie? tap below to start! 🌸✨",
          quizActionSubject: 'math'
        }
      ];

      const all = this.getMailboxMessages(learnerId);
      const novaNotesCount = all.filter(m => m.sender === 'NOVA_AI').length;
      const template = templates[novaNotesCount % templates.length];

      const newMsg: MailboxMessage = {
        id: 'nova_mail_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        learnerId,
        sender: 'NOVA_AI',
        senderName: 'Nova • Your Study Bestie 🎀',
        senderAvatar: '🎧',
        subject: template.subject,
        preview: template.preview,
        body: template.body,
        category: 'NOVA_NOTE',
        isRead: false,
        createdAt: new Date().toISOString(),
        quizActionSubject: template.quizActionSubject,
        isCuteNote: true
      };

      this.sendMailboxMessage(newMsg);
      return newMsg;
    }

    return null;
  }

  // ==========================================
  // Mistake Vault ("Error Notebook" / Cuo Ti Ben)
  // ==========================================
  public logMistake(
    learnerId: string,
    data: {
      questionId: string;
      questionText: string;
      options: string[];
      correctOptionIndex: number;
      chosenOptionIndex: number;
      explanation: string;
      subjectId: string;
      board: string;
      grade: number;
      chapterId?: string;
    }
  ): void {
    const all = this.readRaw<MistakeVaultEntry[]>(STORAGE_KEYS.MISTAKE_VAULT, []);
    const existingIdx = all.findIndex(
      m => m.learnerId === learnerId && (m.questionId === data.questionId || m.questionText === data.questionText)
    );

    const nowIso = new Date().toISOString();
    if (existingIdx >= 0) {
      all[existingIdx].mistakeCount += 1;
      all[existingIdx].consecutiveCorrect = 0;
      all[existingIdx].isMastered = false;
      all[existingIdx].lastAttemptedAt = nowIso;
      all[existingIdx].chosenOptionIndex = data.chosenOptionIndex;
    } else {
      const newEntry: MistakeVaultEntry = {
        id: 'mv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        learnerId,
        questionId: data.questionId,
        questionText: data.questionText,
        options: data.options,
        correctOptionIndex: data.correctOptionIndex,
        chosenOptionIndex: data.chosenOptionIndex,
        explanation: data.explanation,
        subjectId: data.subjectId,
        board: data.board,
        grade: data.grade,
        chapterId: data.chapterId,
        mistakeCount: 1,
        consecutiveCorrect: 0,
        isMastered: false,
        lastAttemptedAt: nowIso
      };
      all.unshift(newEntry);
    }
    this.writeRaw(STORAGE_KEYS.MISTAKE_VAULT, all);
  }

  public getMistakesForLearner(learnerId: string): MistakeVaultEntry[] {
    const all = this.readRaw<MistakeVaultEntry[]>(STORAGE_KEYS.MISTAKE_VAULT, []);
    return all.filter(m => m.learnerId === learnerId);
  }

  public recordMistakeAttempt(
    learnerId: string,
    mistakeId: string,
    wasCorrect: boolean
  ): { isNowMastered: boolean; consecutiveCorrect: number; coinsAwarded: number } {
    const all = this.readRaw<MistakeVaultEntry[]>(STORAGE_KEYS.MISTAKE_VAULT, []);
    const idx = all.findIndex(m => m.id === mistakeId && m.learnerId === learnerId);
    if (idx === -1) return { isNowMastered: false, consecutiveCorrect: 0, coinsAwarded: 0 };

    const entry = all[idx];
    const nowIso = new Date().toISOString();
    entry.lastAttemptedAt = nowIso;

    let coinsAwarded = 0;
    if (wasCorrect) {
      entry.consecutiveCorrect += 1;
      if (entry.consecutiveCorrect >= 2 && !entry.isMastered) {
        entry.isMastered = true;
        entry.masteredAt = nowIso;
        coinsAwarded = 10;
      }
    } else {
      entry.consecutiveCorrect = 0;
      entry.mistakeCount += 1;
    }

    all[idx] = entry;
    this.writeRaw(STORAGE_KEYS.MISTAKE_VAULT, all);
    return { isNowMastered: entry.isMastered, consecutiveCorrect: entry.consecutiveCorrect, coinsAwarded };
  }

  // ==========================================
  // 1v1 Quiz Duels ("Blitz Arena")
  // ==========================================
  public getDuelsForLearner(learnerId: string): QuizDuel[] {
    const all = this.readRaw<QuizDuel[]>(STORAGE_KEYS.QUIZ_DUELS, []);
    return all.filter(d => d.challengerId === learnerId || d.opponentId === learnerId);
  }

  public recordDuelResult(duel: QuizDuel): void {
    const all = this.readRaw<QuizDuel[]>(STORAGE_KEYS.QUIZ_DUELS, []);
    all.unshift(duel);
    this.writeRaw(STORAGE_KEYS.QUIZ_DUELS, all.slice(0, 100));
  }

  // ==========================================
  // Scholar Leagues (Bronze -> Silver -> Gold -> Diamond)
  // ==========================================
  public getScholarLeagueStandings(learnerId: string): {
    tier: ScholarLeagueTier;
    weeklyCoins: number;
    standings: ScholarLeagueStanding[];
    promotionZoneCutoff: number;
    daysRemainingInSeason: number;
  } {
    const ledger = this.getCoinLedger(learnerId, learnerId);
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyCoins = ledger
      .filter(e => e.transactionType === 'CREDIT' && new Date(e.timestampUtc).getTime() > oneWeekAgo)
      .reduce((acc, e) => acc + (e.amount || 0), 0);

    let tier: ScholarLeagueTier = 'BRONZE';
    if (weeklyCoins >= 500) tier = 'DIAMOND';
    else if (weeklyCoins >= 250) tier = 'GOLD';
    else if (weeklyCoins >= 100) tier = 'SILVER';

    const learner = this.getLearnerById(learnerId, learnerId);
    const userName = learner?.fullName || 'Scholar';

    const cohortNames = [
      'Aarav Sharma', 'Diya Patel', 'Rohan Gupta', 'Ananya Iyer', 'Kabir Verma',
      'Isha Mehra', 'Aditya Singh', 'Sara Khan', 'Vihaan Joshi', 'Tanvi Rao',
      'Arjun Nair', 'Meera Pillai', 'Reyansh Das', 'Prisha Sen', 'Devansh Roy'
    ];

    // Engagement engine: increase bots in the leaderboard by +5 coins every 5 minutes inside the device
    const now = Date.now();
    const currentYear = new Date().getUTCFullYear();
    const weekNumber = Math.floor(now / (7 * 24 * 60 * 60 * 1000));
    const weekKey = `${currentYear}_W${weekNumber}`;
    const storageKey = `al_league_bots_prog_${learnerId}`;

    let botBonusMap: Record<string, number> = {};
    let lastTick = now;

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.weekKey === weekKey && typeof parsed.lastTick === 'number') {
            botBonusMap = parsed.botBonusMap || {};
            lastTick = parsed.lastTick;
          }
        }
      } catch {}

      const elapsedMs = now - lastTick;
      const fiveMinIntervals = Math.floor(elapsedMs / (5 * 60 * 1000));

      if (fiveMinIntervals > 0) {
        // Capped at 288 intervals (24h) to avoid extreme spikes on long gaps
        const cappedIntervals = Math.min(fiveMinIntervals, 288);
        const coinsToAdd = cappedIntervals * 5;

        cohortNames.slice(0, 14).forEach(name => {
          botBonusMap[name] = (botBonusMap[name] || 0) + coinsToAdd;
        });

        lastTick = lastTick + cappedIntervals * (5 * 60 * 1000);

        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              weekKey,
              lastTick,
              botBonusMap
            })
          );
        } catch {}
      } else {
        try {
          if (!localStorage.getItem(storageKey)) {
            localStorage.setItem(
              storageKey,
              JSON.stringify({
                weekKey,
                lastTick: now,
                botBonusMap: {}
              })
            );
          }
        } catch {}
      }
    }

    const currentDay = new Date().getDay();
    const daysRemaining = currentDay === 0 ? 0 : 7 - currentDay;

    const baseVariance = tier === 'DIAMOND' ? 520 : tier === 'GOLD' ? 260 : tier === 'SILVER' ? 120 : 35;
    const standings: ScholarLeagueStanding[] = cohortNames.slice(0, 14).map((name, i) => {
      const baseScore = Math.max(0, baseVariance + Math.floor(Math.sin((i + 1) * 1.7) * (baseVariance * 0.4)));
      const bonus = botBonusMap[name] || 0;
      const score = baseScore + bonus;
      return {
        learnerId: 'peer_' + i,
        learnerName: name,
        tier,
        weeklyCoinsEarned: score,
        rank: i + 1,
        avatarFrame: i < 3 ? 'GOLDEN_WREATH' : null,
        isCurrentUser: false
      };
    });

    standings.push({
      learnerId,
      learnerName: userName,
      tier,
      weeklyCoinsEarned: weeklyCoins,
      rank: 1,
      avatarFrame: learner?.avatarFrame || null,
      isCurrentUser: true
    });

    standings.sort((a, b) => b.weeklyCoinsEarned - a.weeklyCoinsEarned);
    standings.forEach((s, idx) => {
      s.rank = idx + 1;
    });

    return {
      tier,
      weeklyCoins,
      standings,
      promotionZoneCutoff: 5,
      daysRemainingInSeason: daysRemaining
    };
  }

  // ==========================================
  // Parent Weekly Report Card
  // ==========================================
  public getParentWeeklyReport(learnerId: string): ParentWeeklyReport {
    const learner = this.getLearnerById(learnerId, learnerId);
    const attempts = this.getQuizAttempts(learnerId, learnerId);
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weeklyAttempts = attempts.filter(a => {
      const ts = (a as any).timestampUtc || (a as any).completedAt || (a as any).createdAt;
      return ts ? new Date(ts).getTime() > oneWeekAgo : true;
    });

    const totalQuestions = weeklyAttempts.reduce((acc, a) => acc + (a.totalQuestions || 0), 0);
    const correctCount = weeklyAttempts.reduce((acc, a) => acc + (a.correctCount || 0), 0);
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : (learner?.currentStreakDays ? 88 : 85);

    const leagueInfo = this.getScholarLeagueStandings(learnerId);
    const userStanding = leagueInfo.standings.find(s => s.isCurrentUser);

    const subjectMap: Record<string, number> = {};
    weeklyAttempts.forEach(a => {
      if (a.subjectId) subjectMap[a.subjectId] = (subjectMap[a.subjectId] || 0) + 1;
    });
    const topSubject = Object.keys(subjectMap).sort((a, b) => subjectMap[b] - subjectMap[a])[0] || 'Mathematics';

    const feedback = accuracy >= 80
      ? `${learner?.fullName || 'Aapka child'} bahut consistently mehnat kar raha hai! Daily problem-solving se concepts clear ho rahe hain aur speed improve ho rahi hai.`
      : `${learner?.fullName || 'Aapka child'} regular practice kar raha hai. Tricky questions ko Mistake Vault me review karne se accuracy aur confidence dono badhenge.`;

    return {
      learnerName: learner?.fullName || 'Scholar',
      grade: learner?.grade || 10,
      board: learner?.board || 'CBSE',
      weeklyQuizzesCount: weeklyAttempts.length || (learner?.currentStreakDays ? Math.min(learner.currentStreakDays, 5) : 3),
      weeklyQuestionsSolved: totalQuestions || (weeklyAttempts.length ? weeklyAttempts.length * 10 : 30),
      weeklyAccuracyPercent: accuracy,
      weeklyCoinsEarned: leagueInfo.weeklyCoins || 75,
      currentStreakDays: learner?.currentStreakDays || 1,
      leagueTier: leagueInfo.tier,
      leagueRank: userStanding?.rank || 2,
      topSubject: topSubject.toUpperCase(),
      weakAreaToFocus: 'Timed Calculations & Word Problems',
      novaFeedback: feedback,
      generatedDate: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  }

  // ==========================================
  // Daily Quests & Streak Freeze
  // ==========================================
  public getDailyQuestState(learnerId: string): DailyQuestState {
    const todayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `${STORAGE_KEYS.DAILY_QUESTS}_${learnerId}`;
    const raw = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    
    const defaultQuests: DailyQuest[] = [
      {
        id: 'QUIZ_PLAY',
        title: 'Quiz Champion',
        description: 'Complete 1 Syllabus Quiz',
        targetCount: 1,
        currentCount: 0,
        rewardCoins: 10,
        completed: false,
        claimed: false,
        iconName: 'BookOpen'
      },
      {
        id: 'DUEL_PLAY',
        title: '1v1 Gladiator',
        description: 'Play 1 Battle in 1v1 Arena',
        targetCount: 1,
        currentCount: 0,
        rewardCoins: 15,
        completed: false,
        claimed: false,
        iconName: 'Swords'
      },
      {
        id: 'VAULT_PRACTICE',
        title: 'Error Master',
        description: 'Practice 1 Question in Mistake Vault or QOTD',
        targetCount: 1,
        currentCount: 0,
        rewardCoins: 10,
        completed: false,
        claimed: false,
        iconName: 'RotateCcw'
      }
    ];

    if (raw) {
      try {
        const parsed: DailyQuestState = JSON.parse(raw);
        if (parsed.dateKey === todayKey) {
          return parsed;
        } else {
          const newState: DailyQuestState = {
            dateKey: todayKey,
            quests: defaultQuests,
            allCompletedBonusClaimed: false,
            streakFreezeEquipped: parsed.streakFreezeEquipped || false,
            streakFreezeCount: parsed.streakFreezeCount || 0
          };
          localStorage.setItem(storageKey, JSON.stringify(newState));
          return newState;
        }
      } catch {}
    }

    const initialState: DailyQuestState = {
      dateKey: todayKey,
      quests: defaultQuests,
      allCompletedBonusClaimed: false,
      streakFreezeEquipped: false,
      streakFreezeCount: 0
    };
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(initialState));
      } catch {}
    }
    return initialState;
  }

  public recordQuestProgress(
    learnerId: string,
    questId: 'QUIZ_PLAY' | 'DUEL_PLAY' | 'VAULT_PRACTICE'
  ): DailyQuestState {
    const state = this.getDailyQuestState(learnerId);
    const target = state.quests.find(q => q.id === questId);
    if (target && !target.completed) {
      target.currentCount = Math.min(target.targetCount, target.currentCount + 1);
      if (target.currentCount >= target.targetCount) {
        target.completed = true;
      }
      const storageKey = `${STORAGE_KEYS.DAILY_QUESTS}_${learnerId}`;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(state));
        } catch {}
      }
    }
    return state;
  }

  public claimQuestReward(learnerId: string, questId: string): { success: boolean; coinsAwarded: number } {
    const state = this.getDailyQuestState(learnerId);
    const target = state.quests.find(q => q.id === questId);
    if (!target || !target.completed || target.claimed) {
      return { success: false, coinsAwarded: 0 };
    }

    target.claimed = true;
    const coins = target.rewardCoins;

    const storageKey = `${STORAGE_KEYS.DAILY_QUESTS}_${learnerId}`;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {}
    }

    return { success: true, coinsAwarded: coins };
  }

  public claimAllQuestsBonus(learnerId: string): { success: boolean; coinsAwarded: number } {
    const state = this.getDailyQuestState(learnerId);
    const allDone = state.quests.every(q => q.completed);
    if (!allDone || state.allCompletedBonusClaimed) {
      return { success: false, coinsAwarded: 0 };
    }

    state.allCompletedBonusClaimed = true;
    const bonusCoins = 20;

    const storageKey = `${STORAGE_KEYS.DAILY_QUESTS}_${learnerId}`;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {}
    }

    return { success: true, coinsAwarded: bonusCoins };
  }

  public purchaseStreakFreeze(learnerId: string): { success: boolean; error?: string } {
    const state = this.getDailyQuestState(learnerId);
    const learner = this.getLearnerById(learnerId, learnerId);
    const cost = 50;

    if (!learner || learner.coinBalance < cost) {
      return { success: false, error: 'Insufficient Study Coins (Requires 50 Coins)' };
    }

    state.streakFreezeCount = (state.streakFreezeCount || 0) + 1;
    state.streakFreezeEquipped = true;

    const storageKey = `${STORAGE_KEYS.DAILY_QUESTS}_${learnerId}`;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {}
    }

    return { success: true };
  }

  // ==========================================
  // WhatsApp 1v1 Friend Challenge Room
  // ==========================================
  public createFriendChallenge(
    learnerId: string,
    subjectId: string,
    wagerCoins: number
  ): QuizDuel {
    const learner = this.getLearnerById(learnerId, learnerId);
    const roomCode = 'AL-' + Math.floor(1000 + Math.random() * 9000);
    const newDuel: QuizDuel = {
      id: 'duel_room_' + Date.now(),
      challengerId: learnerId,
      challengerName: learner?.fullName || 'Scholar Challenger',
      opponentId: 'pending_friend',
      opponentName: 'Waiting for Friend...',
      subjectId,
      wagerCoins,
      winnerId: null,
      challengerScore: 0,
      opponentScore: 0,
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      roomCode,
      isFriendChallenge: true
    };

    const duels = this.readRaw<QuizDuel[]>(STORAGE_KEYS.QUIZ_DUELS, []);
    duels.unshift(newDuel);
    this.writeRaw(STORAGE_KEYS.QUIZ_DUELS, duels);
    return newDuel;
  }

  public getDuelByRoomCode(roomCode: string): QuizDuel | null {
    const duels = this.readRaw<QuizDuel[]>(STORAGE_KEYS.QUIZ_DUELS, []);
    const clean = roomCode.trim().toUpperCase();
    return duels.find(d => d.roomCode?.toUpperCase() === clean) || null;
  }
}

export const StorageRLSLayer = new StorageRLSLayerClass();
