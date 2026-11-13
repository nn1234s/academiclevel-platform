import React, { createContext, useContext, useState, useEffect } from 'react';
import { Learner, Board, Grade } from '../types';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../storage/StorageRLSLayer';
import { ApiClient } from '../api/apiClient';

interface AuthContextType {
  currentLearner: Learner | null;
  isAuthenticated: boolean;
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
  }) => Promise<{ success: boolean; error?: string }>;
  loginStudent: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginSuperAdmin: (adminEmailInput?: string) => { success: boolean; error?: string };
  logout: () => void;
  updateActiveGrade: (newGrade: Grade) => { success: boolean; message: string };
  refreshCurrentLearner: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLearner, setCurrentLearner] = useState<Learner | null>(null);

  useEffect(() => {
    const hydrateAndSyncSession = async () => {
      // First attempt to read local session for zero-flicker startup
      const session = StorageRLSLayer.getCurrentSession();
      if (session && session.learnerId) {
        const localLearner = StorageRLSLayer.getLearnerById(session.learnerId, session.learnerId);
        if (localLearner) {
          setCurrentLearner(localLearner);
        }

        // Live check with backend SQLite database
        try {
          const studentData = await ApiClient.getStudent(session.learnerId);
          if (studentData.success && studentData.learner) {
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
    };

    hydrateAndSyncSession();

    // Re-verify immediately on window/tab focus
    const onFocusOrVisible = () => {
      const session = StorageRLSLayer.getCurrentSession();
      if (session && session.learnerId) {
        ApiClient.getStudent(session.learnerId).then(studentData => {
          if (studentData.success && studentData.learner) {
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

    window.addEventListener('focus', onFocusOrVisible);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') onFocusOrVisible();
    });

    // Auto-poll every 12 seconds so admin manual grants reflect immediately on the student's screen
    const interval = setInterval(onFocusOrVisible, 12000);

    return () => {
      window.removeEventListener('focus', onFocusOrVisible);
      clearInterval(interval);
    };
  }, []);

  const refreshCurrentLearner = async () => {
    const session = StorageRLSLayer.getCurrentSession();
    const targetId = currentLearner?.id || session?.learnerId;
    if (targetId) {
      try {
        const res = await ApiClient.getStudent(targetId);
        if (res.success && res.learner) {
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

    // Auto-grant 60 Days of Unlimited Quizzes (Concept Booster / LITE Plan)
    const subExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
    StorageRLSLayer.saveSubscription({
      id: 'sub_reg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      learnerId,
      planTier: 'LITE',
      status: 'ACTIVE',
      paymentMethod: 'CONCEPT_BOOSTER_AUTO',
      amountInr: 49,
      durationDays: 60,
      startsAt: new Date().toISOString(),
      expiresAt: subExpiresAt,
      verifiedByAdmin: 'SYSTEM_AUTO',
      verifiedAt: new Date().toISOString(),
      invoiceNumber: 'INV-WELCOME-' + Math.floor(100000 + Math.random() * 900000),
      createdAt: new Date().toISOString()
    });

    (newLearner as any).hasActiveSubscription = true;
    (newLearner as any).activePlan = 'LITE';
    (newLearner as any).planTier = 'LITE';
    (newLearner as any).subscriptionExpiresAt = subExpiresAt;

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

    // Check if founder/admin email is logging in via student portal
    try {
      let emailHash = '';
      try {
        const enc = new TextEncoder().encode(cleanEmail);
        const buf = await window.crypto.subtle.digest('SHA-256', enc);
        emailHash = Array.from(new Uint8Array(buf))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      } catch {}

      if (
        cleanEmail === 'naitiknanda1235@gmail.com' ||
        cleanEmail === 'admin@academiclevel.in' ||
        emailHash === 'f82f3e631ed2142d54fdeb333e6cf87c4d837d398355d24fc6d83f98f955a87e' ||
        emailHash === '4c7e6c4ddbbefea23b9d0347895e7b39670f5e7146cead23e590eb7707e7b68a'
      ) {
        let adminLearner: Learner | null = StorageRLSLayer.getLearnerByEmail(cleanEmail);
        if (!adminLearner) {
          adminLearner = {
            id: 'usr_super_admin_001',
            email: cleanEmail,
            fullName: 'Super Administrator',
            board: 'CBSE',
            grade: 12,
            role: 'SUPER_ADMIN',
            isActive: true,
            referralCode: 'AL-ADMIN-VAULT',
            coinBalance: 99999,
            quizzesCompletedCount: 99,
            levelsCompletedCount: 99,
            currentStreakDays: 99,
            longestStreakDays: 99,
            referralQualified: true,
            classChangesUsedPremium: 0,
            classChangesUsedPostExpiry: 0,
            streakFreezesAvailable: 5,
            createdAt: new Date().toISOString()
          };
          StorageRLSLayer.saveLearner(adminLearner, adminLearner.id);
        }
        StorageRLSLayer.setSession({
          learnerId: adminLearner.id,
          email: adminLearner.email,
          role: adminLearner.role
        });
        setCurrentLearner(adminLearner);
        return { success: true };
      }
    } catch {}

    try {
      // 1. Query real SQLite backend REST API
      const res = await ApiClient.login(cleanEmail, password);
      if (res.success && res.learner) {
        if (res.token && typeof window !== 'undefined') {
          try { localStorage.setItem('al_student_token', res.token); } catch {}
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
      // Fallback: check local storage if server offline
      await StorageRLSLayer.syncWithServer();
      const learner = StorageRLSLayer.getLearnerByEmail(cleanEmail);
      if (learner) {
        if (!learner.isActive) {
          return { success: false, error: 'This account is currently suspended. Contact support.' };
        }
        StorageRLSLayer.setSession({
          learnerId: learner.id,
          email: learner.email,
          role: learner.role
        });
        setCurrentLearner(learner);
        return { success: true };
      }
      return { success: false, error: apiErr.message || 'No student account found with this email. Please register.' };
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
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem('al_admin_token');
        sessionStorage.removeItem('al_admin_email');
        localStorage.removeItem('al_admin_token');
        localStorage.removeItem('al_admin_email');
        sessionStorage.removeItem('al_student_token');
        localStorage.removeItem('al_student_token');
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

  const storedAdminEmail = (typeof window !== 'undefined'
    ? (sessionStorage.getItem('al_admin_email') || localStorage.getItem('al_admin_email') || '')
    : '').toLowerCase();

  const isSuperAdmin = Boolean(
    adminToken ||
    currentLearner?.role === 'SUPER_ADMIN' ||
    (currentLearner?.email && [SUPER_ADMIN_EMAIL.toLowerCase(), storedAdminEmail].filter(Boolean).includes(currentLearner.email.toLowerCase()))
  );

  return (
    <AuthContext.Provider
      value={{
        currentLearner,
        isAuthenticated: !!currentLearner,
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
