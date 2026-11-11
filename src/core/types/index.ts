export type Board = 'CBSE' | 'ICSE' | 'IGCSE';
export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type UserRole = 'STUDENT' | 'SUPER_ADMIN';

export type PlanTier = 'FREE' | 'LITE' | 'PLUS' | 'TRIAL';
export type SubscriptionStatus = 'NONE' | 'PENDING_VERIFICATION' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export type LevelNode = 'FOUNDATION' | 'CONCEPT' | 'EXAM_READY' | 'OLYMPIAD';

export interface Learner {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  parentName?: string;
  parentEmail?: string;
  parentPin?: string;
  board: Board;
  grade: Grade;
  role: UserRole;
  isActive: boolean;
  createdAt: string;

  // Quota & Gate enforcement
  quizzesCompletedCount: number;
  levelsCompletedCount: number;

  // Class Change Governance
  classChangesUsedPremium: number; // Max 1 during active premium
  classChangesUsedPostExpiry: number; // Max 1 post-expiry

  // Gamification & Referral
  referralCode: string;
  referredBy?: string;
  referralQualified: boolean; // Becomes true after 1st quiz
  lastSpinTimestampUtc?: string; // 24-hr UTC cooldown

  // Streaks
  currentStreakDays: number;
  longestStreakDays: number;
  lastStudyDate?: string;
  streakFreezesAvailable: number;

  // Real-time coin cache (source of truth is ledger)
  coinBalance: number;
  avatarFrame?: string;
}

export interface Subscription {
  id: string;
  learnerId: string;
  planTier: 'LITE' | 'PLUS' | 'TRIAL';
  status: SubscriptionStatus;
  paymentMethod: 'UPI_QR' | 'ACODE_SCHOLARSHIP' | 'ADMIN_TRIAL';
  utrReference?: string;
  payerUpiId?: string;
  amountInr: number;
  durationDays: number;
  startsAt?: string;
  expiresAt?: string;
  verifiedByAdmin?: string;
  verifiedAt?: string;
  createdAt: string;
  invoiceNumber?: string;
}

export type CoinTransactionType = 'CREDIT' | 'DEBIT';

export type CoinReasonCode =
  | 'LEVEL_COMPLETED_REWARD' // +25
  | 'REFERRAL_SIGNUP_QUALIFIED' // +40 to referrer
  | 'DAILY_SPIN_WHEEL' // +2, +3, +5, +40
  | 'QOTD_COMPLETION' // +1
  | 'MALL_PURCHASE' // -X
  | 'GIFT_STORE_REDEMPTION' // -X
  | 'ADMIN_ADJUSTMENT'; // +/-X

export interface CoinLedgerEntry {
  entryId: string;
  learnerId: string;
  amount: number;
  transactionType: CoinTransactionType;
  reasonCode: CoinReasonCode;
  balanceAfter: number;
  metadata?: Record<string, any>;
  timestampUtc: string;
  signatureHash: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  grades: Grade[];
  boards: Board[];
}

export interface CourseLevel {
  id: string;
  subjectId: string;
  board: Board;
  grade: Grade;
  node: LevelNode;
  title: string;
  description: string;
  questionCount: number;
  estimatedMinutes: number;
  topics: string[];
}

export interface Question {
  id: string;
  board: Board;
  grade: Grade;
  subjectId: string;
  levelNode: LevelNode;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topicTag: string;
  source?: 'GEMINI_LIVE' | 'CURATED_OFFLINE';
}

export interface QuizAttempt {
  id: string;
  learnerId: string;
  subjectId: string;
  levelNode: LevelNode;
  board: Board;
  grade: Grade;
  totalQuestions: number;
  correctCount: number;
  accuracyPercent: number;
  totalDurationSeconds: number;
  antiCheatPassed: boolean;
  completedAt: string;
}

export interface LevelProgress {
  learnerId: string;
  board: Board;
  grade: Grade;
  subjectId: string;
  levelNode: LevelNode;
  isCompleted: boolean;
  bestScorePercent: number;
  coinRewardClaimed: boolean;
  completedAt?: string;
  calendarYear: number;
}

export type CertificateType = 'LEVEL_MASTERY' | 'ANNUAL_MASTER';

export interface Certificate {
  certificateId: string;
  learnerId: string;
  learnerName: string;
  certificateType: CertificateType;
  board: Board;
  grade: Grade;
  subjectName?: string;
  levelName?: string;
  academicYear: string;
  issuedAt: string;
  verificationToken: string;
}

export interface ACode {
  code: string; // 'AL-XXXX-XXXX'
  planTier: 'LITE' | 'PLUS';
  durationDays: number;
  isRedeemed: boolean;
  redeemedBy?: string;
  redeemedAt?: string;
  createdBy: string;
  expiresAt: string;
  createdAt: string;
}

export interface Friendship {
  id: string;
  requesterId: string;
  receiverId: string;
  requesterName: string;
  receiverName: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED';
  createdAt: string;
}

export interface StudentPackMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  flaggedForReview: boolean;
  flagReason?: string;
  isDelivered: boolean;
  sentAt: string;
}

export interface GiftRequest {
  id: string;
  learnerId: string;
  learnerName: string;
  itemTitle: string;
  coinsCost: number;
  shippingAddress: string;
  contactPhone: string;
  status: 'PENDING_APPROVAL' | 'APPROVED_DISPATCHED' | 'REJECTED';
  adminNotes?: string;
  voucherCode?: string;
  requestedAt: string;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestampUtc: string;
  actorEmail: string;
  actionType: string;
  targetId: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: string;
}

export interface Scholarship {
  id: string;
  title: string;
  description: string;
  targetQuizCount: number;
  rewardCoins: number;
  durationDays: number;
  targetGrade?: number | 'ALL';
  targetBoard?: Board | 'ALL';
  badgeTitle?: string;
  maxRecipients?: number; // 0 for unlimited
  claimedCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScholarshipClaim {
  id: string;
  scholarshipId: string;
  scholarshipTitle?: string;
  learnerId: string;
  learnerName?: string;
  learnerEmail?: string;
  coinsAwarded: number;
  claimedAt: string;
}

export interface SystemMetrics {
  totalLearners: number;
  activeSubscriptions: number;
  pendingVerifications: number;
  totalCoinVolume: number;
  quizzesCompleted24h: number;
  offlineFallbackHits: number;
}
