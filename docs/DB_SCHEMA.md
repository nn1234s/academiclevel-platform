# AcademicLevel Database Schema & Ledger Architecture

## 1. Relational Entities (Tenant-Scoped via `learner_id`)

### 1.1 `learners` (Users / Students)
```sql
CREATE TABLE learners (
  id VARCHAR(64) PRIMARY KEY, -- e.g. "lrn_784920491"
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  parent_name VARCHAR(255),
  parent_email VARCHAR(255),
  parent_pin_hash VARCHAR(64), -- 4-digit PIN for parent control
  board VARCHAR(32) NOT NULL, -- 'CBSE' | 'ICSE' | 'IGCSE'
  grade INT NOT NULL CHECK (grade BETWEEN 1 AND 12),
  role VARCHAR(32) NOT NULL DEFAULT 'STUDENT', -- 'STUDENT' | 'SUPER_ADMIN'
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Quota & Governance
  quizzes_completed_count INT NOT NULL DEFAULT 0,
  levels_completed_count INT NOT NULL DEFAULT 0,
  
  -- Class Change Controls
  class_changes_used_premium INT NOT NULL DEFAULT 0 CHECK (class_changes_used_premium <= 1),
  class_changes_used_post_expiry INT NOT NULL DEFAULT 0 CHECK (class_changes_used_post_expiry <= 1),
  
  -- Gamification & Referral
  referral_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. "AL-STUDENT99"
  referred_by VARCHAR(64) REFERENCES learners(id),
  referral_qualified BOOLEAN NOT NULL DEFAULT FALSE, -- turns true after 1st quiz completed
  last_spin_timestamp_utc TIMESTAMP WITH TIME ZONE,
  
  -- Streak Management
  current_streak_days INT NOT NULL DEFAULT 0,
  longest_streak_days INT NOT NULL DEFAULT 0,
  last_study_date DATE,
  streak_freezes_available INT NOT NULL DEFAULT 0
);
```

### 1.2 `subscriptions` (Premium Entitlements)
```sql
CREATE TABLE subscriptions (
  id VARCHAR(64) PRIMARY KEY,
  learner_id VARCHAR(64) NOT NULL REFERENCES learners(id),
  plan_tier VARCHAR(32) NOT NULL, -- 'LITE' (60d) | 'PLUS' (180d) | 'TRIAL'
  status VARCHAR(32) NOT NULL, -- 'PENDING_VERIFICATION' | 'ACTIVE' | 'EXPIRED' | 'REVOKED'
  payment_method VARCHAR(32) NOT NULL DEFAULT 'UPI_QR',
  utr_reference VARCHAR(12) UNIQUE NOT NULL, -- Global 12-digit uniqueness
  amount_inr DECIMAL(10,2) NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  verified_by_admin VARCHAR(255), -- 'admin@academiclevel.in'
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 1.3 `study_coin_ledger` (Append-Only Immutable Ledger)
```sql
CREATE TABLE study_coin_ledger (
  entry_id VARCHAR(64) PRIMARY KEY,
  learner_id VARCHAR(64) NOT NULL REFERENCES learners(id),
  amount INT NOT NULL, -- Positive for credits, negative for debits
  transaction_type VARCHAR(32) NOT NULL, -- 'CREDIT' | 'DEBIT'
  reason_code VARCHAR(64) NOT NULL,
  -- 'LEVEL_COMPLETED_REWARD' (+25)
  -- 'REFERRAL_SIGNUP_QUALIFIED' (+40)
  -- 'DAILY_SPIN_WHEEL' (+2, +3, +5, +40)
  -- 'MALL_PURCHASE' (-X)
  -- 'GIFT_STORE_REDEMPTION' (-X)
  -- 'ADMIN_ADJUSTMENT' (+/-X)
  balance_after INT NOT NULL,
  metadata JSONB,
  timestamp_utc TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  signature_hash VARCHAR(64) NOT NULL -- SHA256(entry_id + learner_id + amount + balance_after + timestamp)
);
```

### 1.4 `course_progress` & `quiz_attempts`
```sql
CREATE TABLE course_progress (
  id VARCHAR(64) PRIMARY KEY,
  learner_id VARCHAR(64) NOT NULL REFERENCES learners(id),
  board VARCHAR(32) NOT NULL,
  grade INT NOT NULL,
  subject_id VARCHAR(64) NOT NULL,
  level_node VARCHAR(32) NOT NULL, -- 'FOUNDATION' | 'CONCEPT' | 'EXAM_READY' | 'OLYMPIAD'
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  best_score_percent DECIMAL(5,2) DEFAULT 0.0,
  coin_reward_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  calendar_year INT NOT NULL
);

CREATE TABLE quiz_attempts (
  id VARCHAR(64) PRIMARY KEY,
  learner_id VARCHAR(64) NOT NULL REFERENCES learners(id),
  subject_id VARCHAR(64) NOT NULL,
  level_node VARCHAR(32) NOT NULL,
  total_questions INT NOT NULL,
  correct_count INT NOT NULL,
  accuracy_percent DECIMAL(5,2) NOT NULL,
  total_duration_seconds INT NOT NULL,
  anti_cheat_passed BOOLEAN NOT NULL DEFAULT TRUE, -- time_per_question >= 3 sec
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 1.5 `certificates` (Level & Annual Master)
```sql
CREATE TABLE certificates (
  certificate_id VARCHAR(64) PRIMARY KEY, -- e.g. "AL-CERT-2026-XXXX"
  learner_id VARCHAR(64) NOT NULL REFERENCES learners(id),
  learner_name VARCHAR(255) NOT NULL,
  certificate_type VARCHAR(32) NOT NULL, -- 'LEVEL_MASTERY' | 'ANNUAL_MASTER'
  board VARCHAR(32) NOT NULL,
  grade INT NOT NULL,
  subject_name VARCHAR(128),
  level_name VARCHAR(64),
  academic_year VARCHAR(16) NOT NULL, -- '2026-2027'
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  verification_token VARCHAR(64) UNIQUE NOT NULL,
  UNIQUE(learner_id, certificate_type, academic_year) -- Master Certificate deduplication
);
```

### 1.6 `acodes` (Promotional & Scholarship Vouchers)
```sql
CREATE TABLE acodes (
  code VARCHAR(32) PRIMARY KEY, -- 'AL-XXXX-XXXX'
  plan_tier VARCHAR(32) NOT NULL, -- 'LITE' | 'PLUS' | 'CUSTOM'
  duration_days INT NOT NULL,
  is_redeemed BOOLEAN NOT NULL DEFAULT FALSE,
  redeemed_by VARCHAR(64) REFERENCES learners(id),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(255) NOT NULL, -- Super admin email
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 1.7 `student_packs_messages` & `friendships`
```sql
CREATE TABLE friendships (
  id VARCHAR(64) PRIMARY KEY,
  requester_id VARCHAR(64) NOT NULL REFERENCES learners(id),
  receiver_id VARCHAR(64) NOT NULL REFERENCES learners(id),
  status VARCHAR(32) NOT NULL, -- 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'BLOCKED'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_packs_messages (
  id VARCHAR(64) PRIMARY KEY,
  sender_id VARCHAR(64) NOT NULL REFERENCES learners(id),
  receiver_id VARCHAR(64) NOT NULL REFERENCES learners(id),
  content TEXT NOT NULL,
  flagged_for_review BOOLEAN NOT NULL DEFAULT FALSE,
  flag_reason VARCHAR(64), -- 'PII_DETECTED' | 'PROFANITY_DETECTED'
  is_delivered BOOLEAN NOT NULL DEFAULT TRUE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
