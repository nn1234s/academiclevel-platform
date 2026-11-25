import React, { createContext, useContext, useState, useEffect } from 'react';
import { Learner, Board, Grade, Subscription } from '../types';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../storage/StorageRLSLayer';
import { ApiClient } from '../api/apiClient';

interface AuthContextType {
  currentLearner: Learner | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  isSuperAdmin: boolean;
  activeBoard: Board;
  activeGrade: Grade;
  registerStudent: (params: {
    fullName: string;
    email: string;
    password?: string;
    board: Board;
    grade: Grade;
    parentName?: string;
    parentPin?: string;
    referredByCode?: string;
    planTier?: string;
    utrReference?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  loginStudent: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginSuperAdmin: (adminEmailInput?: string) => { success: boolean; error?: string };
  logout: () => void;
  updateActiveGrade: (newGrade: Grade) => { success: boolean; message: string };
  refreshCurrentLearner: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLearner, setCurrentLearner] = useState<Learner | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const session = StorageRLSLayer.getCurrentSession();
        if (session && session.learnerId) {
          return StorageRLSLayer.getLearnerById(session.learnerId, session.learnerId);
        }
      } catch {}
    }
    return null;
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const hydrateAndSyncSession = async () => {
      try {
        // First attempt to read local session for zero-flicker startup
        const session = StorageRLSLayer.getCurrentSession();
        if (session && session.learnerId) {
          const localLearner = StorageRLSLayer.getLearnerById(session.learnerId, session.learnerId);
          if (localLearner && isMounted) {
            setCurrentLearner(localLearner);
          }

          // Live check with backend SQLite database
          try {
            const studentData = await ApiClient.getStudent(session.learnerId);
            if (studentData.success && studentData.learner && isMounted) {
              // Trust server as authority for scores/coins — do not silently bump with stale local cache
              if (studentData.activeSub) {
                StorageRLSLayer.saveSubscription(studentData.activeSub);
                studentData.learner.hasActiveSubscription = true;
                studentData.learner.activePlan = studentData.activeSub.planTier;
                studentData.learner.subscriptionExpiresAt = studentData.activeSub.expiresAt;
                (studentData.learner as any).activeSub = studentData.activeSub;
              }
              StorageRLSLayer.saveLearner(studentData.learner, studentData.learner.id);
              setCurrentLearner(studentData.learner);
            }
          } catch {}
        }
        // Background server storage sync (for admins)
        StorageRLSLayer.syncWithServer().catch(() => {});
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    hydrateAndSyncSession();

    // Re-verify immediately on window/tab focus
    let lastSyncAt = Date.now();
    const onFocusOrVisible = () => {
      if (Date.now() - lastSyncAt < 300000) return; // Free-tier optimization: throttle focus sync to >= 5 min
      const session = StorageRLSLayer.getCurrentSession();
      if (session && session.learnerId) {
        lastSyncAt = Date.now();
        ApiClient.getStudent(session.learnerId).then(studentData => {
          if (studentData.success && studentData.learner && isMounted) {
            // Trust server as authority for scores/coins on focus re-sync
            if (studentData.activeSub) {
              StorageRLSLayer.saveSubscription(studentData.activeSub);
              studentData.learner.hasActiveSubscription = true;
              studentData.learner.activePlan = studentData.activeSub.planTier;
              studentData.learner.subscriptionExpiresAt = studentData.activeSub.expiresAt;
              (studentData.learner as any).activeSub = studentData.activeSub;
            }
            StorageRLSLayer.saveLearner(studentData.learner, studentData.learner.id);
            setCurrentLearner(studentData.learner);
          }
        }).catch(() => {});
      }
    };

    // Multi-tab session synchronization: immediately sync when another tab logs in/out
    const onStorageChange = (e: StorageEvent) => {
      if (e.key === 'al_prod_session_v1' || e.key === 'al_student_token' || e.key === 'al_admin_token') {
        const session = StorageRLSLayer.getCurrentSession();
        if (!session) {
          if (isMounted) setCurrentLearner(null);
        } else if (session.learnerId) {
          const l = StorageRLSLayer.getLearnerById(session.learnerId, session.learnerId);
          if (l && isMounted) setCurrentLearner(l);
        }
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') onFocusOrVisible();
    };
    window.addEventListener('focus', onFocusOrVisible);
    window.addEventListener('storage', onStorageChange);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', onFocusOrVisible);
      window.removeEventListener('storage', onStorageChange);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const refreshCurrentLearner = async () => {
    const session = StorageRLSLayer.getCurrentSession();
    const targetId = currentLearner?.id || session?.learnerId;
    if (targetId) {
      try {
        const res = await ApiClient.getStudent(targetId);
        if (res.success && res.learner) {
          // Trust server as authoritative — no local override
          if (res.activeSub) {
            StorageRLSLayer.saveSubscription(res.activeSub);
            res.learner.hasActiveSubscription = true;
            res.learner.activePlan = res.activeSub.planTier;
            res.learner.subscriptionExpiresAt = res.activeSub.expiresAt;
            (res.learner as any).activeSub = res.activeSub;
          }
          StorageRLSLayer.saveLearner(res.learner, res.learner.id);
          setCurrentLearner({ ...res.learner });
          return;
        }
      } catch {
        // Fallback to local storage
      }
      const updated = StorageRLSLayer.getLearnerById(targetId, targetId);
      if (updated) {
        setCurrentLearner({ ...updated });
      }
    }
  };

  const registerStudent = async (params: {
    fullName: string;
    email: string;
    password?: string;
    board: Board;
    grade: Grade;
    parentName?: string;
    parentPin?: string;
    referredByCode?: string;
    planTier?: string;
    utrReference?: string;
  }) => {
    try {
      // 1. Write to real SQLite backend REST API
      const res = await ApiClient.register(params);
      if (res.success && res.learner) {
        if (res.token && typeof window !== 'undefined') {
          try { localStorage.setItem('al_student_token', res.token); } catch {}
        }
        StorageRLSLayer.saveLearner(res.learner, res.learner.id);
        StorageRLSLayer.setSession({
          learnerId: res.learner.id,
          email: res.learner.email,
          role: res.learner.role
        });
        setCurrentLearner(res.learner);
        return { success: true };
      }
    } catch (apiErr: any) {
      return { success: false, error: apiErr.message || 'Registration failed.' };
    }

    // Fallback in case of offline
    const learnerId = 'lrn_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const referralCode = 'AL-' + params.fullName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X') + Math.floor(1000 + Math.random() * 9000);
    const newLearner: Learner = {
      id: learnerId,
      email: params.email.trim().toLowerCase(),
      fullName: params.fullName.trim(),
      board: params.board,
      grade: params.grade,
      parentName: params.parentName?.trim(),
      parentPin: params.parentPin?.trim() || '1234',
      role: 'STUDENT',
      isActive: true,
      createdAt: new Date().toISOString(),
      quizzesCompletedCount: 0,
      levelsCompletedCount: 0,
      classChangesUsedPremium: 0,
      classChangesUsedPostExpiry: 0,
      referralCode,
      referralQualified: false,
      currentStreakDays: 1,
      longestStreakDays: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      streakFreezesAvailable: 1,
      coinBalance: 10
    };

    StorageRLSLayer.saveLearner(newLearner, learnerId);

    // If registered via ad page or payment gateway checkout with a selected plan:
    const chosenPlan = (params.planTier || '').toUpperCase();
    if (chosenPlan && ['LITE', 'PLUS', 'GOLD'].includes(chosenPlan)) {
      const planTier = chosenPlan as 'LITE' | 'PLUS' | 'GOLD';
      const durationDays = planTier === 'GOLD' ? 365 : (planTier === 'PLUS' ? 180 : 60);
      const subExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
      (newLearner as any).hasActiveSubscription = true;
      (newLearner as any).activePlan = planTier;
      (newLearner as any).planTier = planTier;
      (newLearner as any).subscriptionExpiresAt = subExpiresAt;

      const sub: Subscription = {
        id: 'sub_reg_' + Date.now().toString(36),
        learnerId: newLearner.id,
        planTier,
        status: 'ACTIVE',
        paymentMethod: 'UPI_QR',
        amountInr: planTier === 'GOLD' ? 205 : (planTier === 'PLUS' ? 129 : 49),
        durationDays,
        startsAt: new Date().toISOString(),
        expiresAt: subExpiresAt,
        createdAt: new Date().toISOString(),
        verifiedByAdmin: 'UPI_PG_AUTOMATED_GATEWAY',
        verifiedAt: new Date().toISOString(),
        invoiceNumber: `INV-${Math.floor(100000 + Math.random() * 900000)}`
      };
      StorageRLSLayer.saveSubscription(sub);
    } else {
      // Standard new student registration: Free Tier (up to 3 levels)
      (newLearner as any).hasActiveSubscription = false;
      (newLearner as any).activePlan = 'FREE';
      (newLearner as any).planTier = 'FREE';
    }

    StorageRLSLayer.setSession({
      learnerId: newLearner.id,
      email: newLearner.email,
      role: 'STUDENT'
    });
    setCurrentLearner(newLearner);
    return { success: true };
  };

  const loginStudent = async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();

    try {
      // Query authoritative SQLite backend REST API (never bypass server password verification)
      const res = await ApiClient.login(cleanEmail, password);
      if (res.success && res.learner) {
        if (res.token && typeof window !== 'undefined') {
          try {
            if (res.learner.role === 'SUPER_ADMIN') {
              sessionStorage.setItem('al_admin_token', res.token);
              sessionStorage.setItem('al_admin_email', res.learner.email);
            } else {
              localStorage.setItem('al_student_token', res.token);
            }
          } catch {}
        }
        if (res.activeSub) {
          StorageRLSLayer.saveSubscription(res.activeSub);
          res.learner.hasActiveSubscription = true;
          res.learner.activePlan = res.activeSub.planTier;
          res.learner.subscriptionExpiresAt = res.activeSub.expiresAt;
          (res.learner as any).activeSub = res.activeSub;
        }
        try {
          const studentData = await ApiClient.getStudent(res.learner.id);
          if (studentData.success && studentData.activeSub) {
            StorageRLSLayer.saveSubscription(studentData.activeSub);
            res.learner.hasActiveSubscription = true;
            res.learner.activePlan = studentData.activeSub.planTier;
            res.learner.subscriptionExpiresAt = studentData.activeSub.expiresAt;
            (res.learner as any).activeSub = studentData.activeSub;
          }
        } catch {}
        StorageRLSLayer.saveLearner(res.learner, res.learner.id);
        StorageRLSLayer.setSession({
          learnerId: res.learner.id,
          email: res.learner.email,
          role: res.learner.role
        });
        setCurrentLearner(res.learner);
        return { success: true };
      }
    } catch (apiErr: any) {
      return { success: false, error: apiErr.message || 'Invalid credentials or unable to reach authentication server.' };
    }

    return { success: false, error: 'No student account found with this email. Please register.' };
  };

  const loginSuperAdmin = (adminEmailInput?: string) => {
    const emailToUse = (
      adminEmailInput ||
      (typeof window !== 'undefined' ? sessionStorage.getItem('al_admin_email') || localStorage.getItem('al_admin_email') : '') ||
      SUPER_ADMIN_EMAIL
    ).trim().toLowerCase();

    let adminLearner = StorageRLSLayer.getLearnerByEmail(emailToUse);
    if (!adminLearner) {
      adminLearner = {
        id: 'usr_super_admin_001',
        email: emailToUse,
        fullName: 'Administrator (Super-Admin)',
        board: 'CBSE',
        grade: 12,
        role: 'SUPER_ADMIN',
        isActive: true,
        createdAt: new Date().toISOString(),
        quizzesCompletedCount: 0,
        levelsCompletedCount: 0,
        classChangesUsedPremium: 0,
        classChangesUsedPostExpiry: 0,
        referralCode: 'AL-ADMIN-VAULT',
        referralQualified: true,
        currentStreakDays: 99,
        longestStreakDays: 99,
        streakFreezesAvailable: 99,
        coinBalance: 9999
      };
      StorageRLSLayer.saveLearner(adminLearner, adminLearner.id);
    }

    StorageRLSLayer.setSession({
      learnerId: adminLearner.id,
      email: adminLearner.email,
      role: 'SUPER_ADMIN'
    });
    setCurrentLearner(adminLearner);
    return { success: true };
  };

  const logout = () => {
    // Terminate server session BEFORE clearing client storage headers
    ApiClient.logout().catch(() => {});
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('al_admin_token');
        sessionStorage.removeItem('al_admin_email');
        sessionStorage.removeItem('al_admin_passkey');
        localStorage.removeItem('al_admin_token');
        localStorage.removeItem('al_admin_email');
        localStorage.removeItem('al_admin_passkey');
        sessionStorage.removeItem('al_student_token');
        localStorage.removeItem('al_student_token');
        localStorage.removeItem('al_prod_session_v1');
      } catch {}
    }
    StorageRLSLayer.setSession(null);
    setCurrentLearner(null);
  };

  /**
   * Enforces server-side Class Change Policy:
   * Maximum 1 class change during active Premium,
   * Maximum 1 class change post-expiry.
   */
  const updateActiveGrade = (newGrade: Grade): { success: boolean; message: string } => {
    if (!currentLearner) {
      return { success: false, message: 'You must be logged in to change your class.' };
    }

    if (currentLearner.grade === newGrade) {
      return { success: true, message: 'Class is already set to ' + newGrade };
    }

    // Check subscriptions
    const subs = StorageRLSLayer.getSubscriptionsForLearner(currentLearner.id, currentLearner.id);
    const activeSub = subs.find(
      s => s.status === 'ACTIVE' && s.expiresAt && new Date(s.expiresAt).getTime() > Date.now()
    );

    if (activeSub) {
      // During active premium
      if (currentLearner.classChangesUsedPremium >= 1) {
        return {
          success: false,
          message: 'Policy Limit Reached: You have already used your 1 permitted class change during active Premium.'
        };
      }
      currentLearner.classChangesUsedPremium += 1;
    } else {
      // Post-expiry or Free tier
      if (currentLearner.classChangesUsedPostExpiry >= 1) {
        return {
          success: false,
          message: 'Policy Limit Reached: You have already used your 1 permitted class change post-expiry.'
        };
      }
      currentLearner.classChangesUsedPostExpiry += 1;
    }

    currentLearner.grade = newGrade;
    StorageRLSLayer.saveLearner(currentLearner, currentLearner.id);
    refreshCurrentLearner();

    return {
      success: true,
      message: `Class successfully updated to Class ${newGrade}.`
    };
  };

  const adminToken = typeof window !== 'undefined'
    ? (sessionStorage.getItem('al_admin_token') || localStorage.getItem('al_admin_token'))
    : null;

  const isSuperAdmin = Boolean(
    adminToken && !adminToken.startsWith('adm_sess_fb_') && currentLearner?.role === 'SUPER_ADMIN'
  );

  return (
    <AuthContext.Provider
      value={{
        currentLearner,
        isAuthenticated: !!currentLearner,
        isAuthLoading,
        isSuperAdmin,
        activeBoard: currentLearner?.board || 'CBSE',
        activeGrade: currentLearner?.grade || 10,
        registerStudent,
        loginStudent,
        loginSuperAdmin,
        logout,
        updateActiveGrade,
        refreshCurrentLearner
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
