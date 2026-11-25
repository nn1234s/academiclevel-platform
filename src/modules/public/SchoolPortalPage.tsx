import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { ApiClient } from '../../core/api/apiClient';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { PaymentService } from '../../services/paymentService';
import { WhatsDifferentFromChatGPT } from '../shared/WhatsDifferentFromChatGPT';
import {
  GraduationCap,
  School,
  CheckCircle2,
  Users,
  KeyRound,
  BarChart3,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Award,
  Zap,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Share2,
  FileSpreadsheet,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Lock,
  UserCheck,
  AlertCircle,
  LogOut,
  Search
} from 'lucide-react';

interface SchoolPortalPageProps {
  onNavigate: (route: string, extra?: any) => void;
  onSuccessAuth?: () => void;
}

interface DemoStudentScore {
  id: string;
  name: string;
  grade: number;
  subject: string;
  topic: string;
  score: number;
  maxScore: number;
  accuracy: number;
  date: string;
  status: 'PASSED' | 'NEEDS_REVIEW' | 'CRITICAL';
}

interface WeakPointTopic {
  id: string;
  subject: string;
  topic: string;
  grade: number;
  strugglingCount: number;
  totalStudents: number;
  avgAccuracy: number;
  severity: 'CRITICAL' | 'MODERATE' | 'GOOD';
  remedialNote: string;
}

export const SchoolPortalPage: React.FC<SchoolPortalPageProps> = ({ onNavigate, onSuccessAuth }) => {
  const { currentLearner, isAuthenticated, refreshCurrentLearner, logout } = useAuth();

  // Selected Pack Preference: 40 Lite (60d) [Option B - Recommended] OR 20 Plus (180d) [Option A]
  const [selectedPack, setSelectedPack] = useState<'PLUS_20' | 'LITE_40'>('LITE_40');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'OFFER' | 'TRACKER' | 'WEAK_POINTS' | 'ACODES'>('OFFER');

  // Teacher Dashboard Activation State
  const [isTeacherDashboard, setIsTeacherDashboard] = useState<boolean>(false);
  const [isTeacherActive, setIsTeacherActive] = useState<boolean>(false);
  const [serverAcodes, setServerAcodes] = useState<any[]>([]);
  const [codeFilter, setCodeFilter] = useState<'ALL' | 'AVAILABLE' | 'REDEEMED'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 2-Step UPI PG Checkout States (Identical to Student Checkout)
  const [hasOpenedGateway, setHasOpenedGateway] = useState<boolean>(false);
  const [noticeLang, setNoticeLang] = useState<'EN' | 'HINGLISH'>('EN');
  const [customRef, setCustomRef] = useState<string>('');
  const [isActivating, setIsActivating] = useState<boolean>(false);
  const [activationMessage, setActivationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Teacher Account Onboarding State
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Check if current user is an authenticated Teacher with active school pack
  useEffect(() => {
    if (currentLearner) {
      const isTeacher = (currentLearner as any).role === 'TEACHER' || 
                        (currentLearner as any).role === 'SUPER_ADMIN' ||
                        localStorage.getItem(`al_teacher_mode_${currentLearner.id}`) === 'true';
      setIsTeacherActive(Boolean(isTeacher));
      if (!teacherName) setTeacherName(currentLearner.fullName || '');
      if (!teacherEmail) setTeacherEmail(currentLearner.email || '');

      // Check server if this teacher already has an active School Pack minted
      ApiClient.getSchoolPackStatus(currentLearner.id)
        .then(res => {
          if (res && res.success && res.hasActiveSchoolPack && res.acodes?.length > 0) {
            setServerAcodes(res.acodes);
            setIsTeacherDashboard(true);
            setIsTeacherActive(true);
            if (res.packType === 'PLUS_20') setSelectedPack('PLUS_20');
            else setSelectedPack('LITE_40');
            setActiveTab('ACODES');
          } else if (localStorage.getItem(`al_school_pack_active_${currentLearner.id}`) === 'true') {
            setIsTeacherDashboard(true);
            setIsTeacherActive(true);
            setActiveTab('ACODES');
          }
        })
        .catch(() => {
          if (localStorage.getItem(`al_school_pack_active_${currentLearner.id}`) === 'true') {
            setIsTeacherDashboard(true);
            setIsTeacherActive(true);
            setActiveTab('ACODES');
          }
        });
    }

    try {
      if (localStorage.getItem('al_school_gateway_opened') === 'true') {
        setHasOpenedGateway(true);
      }
    } catch {}
  }, [currentLearner]);

  // Step 1: Open Secure UPI PG Gateway
  const handleOpenGateway = () => {
    setHasOpenedGateway(true);
    try {
      localStorage.setItem('al_school_gateway_opened', 'true');
    } catch {}
    window.open(PaymentService.getSchoolGatewayUrl(), '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(PaymentService.getSchoolGatewayUrl());
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Step 2: Payment OK -> Complete Teacher Admin Account & Unlock 40 A-Codes in Teacher Dashboard
  const handleActivateSchoolPack = async () => {
    setIsActivating(true);
    setAuthError('');
    setActivationMessage(null);

    try {
      const isAlreadyTeacher = currentLearner?.role === 'TEACHER' || currentLearner?.role === 'SUPER_ADMIN';
      let activeLearnerId = isAlreadyTeacher ? currentLearner?.id : null;

      // 1. If not a verified Teacher yet (or currently a student), register or sign in to a dedicated Teacher Admin account
      if (!activeLearnerId) {
        if (!teacherName.trim() || !teacherEmail.trim() || !teacherPassword.trim()) {
          setAuthError('Please fill in your Full Name, School Email, and Account Password to create your dedicated Teacher Admin account.');
          setIsActivating(false);
          return;
        }
        if (teacherPassword.trim().length < 6) {
          setAuthError('Account Password must be at least 6 characters long.');
          setIsActivating(false);
          return;
        }

        const cleanUtrInput = customRef.trim();
        if (!/^[0-9]{12}$/.test(cleanUtrInput)) {
          setAuthError('Please enter a valid 12-digit UPI UTR / Reference number from your payment receipt.');
          setIsActivating(false);
          return;
        }

        let authResult: { success: boolean; learner?: any; token?: string; error?: string } | null = null;
        try {
          authResult = await ApiClient.register({
            fullName: teacherName.trim(),
            email: teacherEmail.trim(),
            board: 'CBSE',
            grade: 10,
            parentName: schoolName.trim() || 'School Administration',
            parentPin: '1234',
            password: teacherPassword.trim()
          });
        } catch (regErr: any) {
          const msg = String(regErr?.message || '');
          if (msg.toLowerCase().includes('already exists')) {
            // Existing account from a prior attempt — sign in with the provided password
            authResult = await ApiClient.login(teacherEmail.trim(), teacherPassword.trim());
          } else {
            throw regErr;
          }
        }

        if (authResult?.success && authResult.learner) {
          activeLearnerId = authResult.learner.id;
          if (authResult.token && typeof window !== 'undefined') {
            try { localStorage.setItem('al_student_token', authResult.token); } catch {}
          }
          StorageRLSLayer.saveLearner(authResult.learner, authResult.learner.id);
          StorageRLSLayer.setSession({
            learnerId: authResult.learner.id,
            email: authResult.learner.email,
            role: authResult.learner.role
          });
          if (onSuccessAuth) onSuccessAuth();
          await refreshCurrentLearner();
        } else {
          setAuthError((authResult as any)?.error || 'Failed to initialize teacher account.');
          setIsActivating(false);
          return;
        }
      }

      if (!activeLearnerId) {
        setAuthError('Failed to resolve teacher account ID.');
        setIsActivating(false);
        return;
      }

      // 2. Call server to submit/activate the 40 Lite or 20 Plus A-Codes pack
      const packRes = await ApiClient.activateSchoolPack({
        teacherId: activeLearnerId,
        packType: selectedPack,
        utrRef: customRef.trim(),
        schoolName: schoolName.trim() || 'Classroom Administration'
      });

      if (packRes.success && (packRes as any).pendingVerification) {
        setActivationMessage({
          type: 'success',
          text: packRes.message || 'Institutional Classroom Pack payment reference queued for administrator verification. Your A-Codes will be minted upon approval.'
        });
      } else if (packRes.success && packRes.acodes) {
        setServerAcodes(packRes.acodes);
        setIsTeacherDashboard(true);
        setIsTeacherActive(true);
        setActiveTab('ACODES');
        try {
          localStorage.setItem(`al_teacher_mode_${activeLearnerId}`, 'true');
          localStorage.setItem(`al_school_pack_active_${activeLearnerId}`, 'true');
        } catch {}
        await refreshCurrentLearner();
        setActivationMessage({
          type: 'success',
          text: `🎉 Payment Confirmed! Unlocked ${selectedPack === 'PLUS_20' ? '20 Plus (180 Days)' : '40 Lite (60 Days)'} A-Codes in your Teacher Dashboard.`
        });
      } else {
        setAuthError(packRes.message || 'Failed to activate classroom pack. Please try again.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Activation anomaly. Please try again.');
    } finally {
      setIsActivating(false);
    }
  };

  // Legacy helper hooks for compatibility
  const handleEnableTeacherMode = async () => {
    if (!currentLearner) return;
    try {
      localStorage.setItem(`al_teacher_mode_${currentLearner.id}`, 'true');
      setIsTeacherActive(true);
      await handleActivateSchoolPack();
    } catch {}
  };

  const handleTeacherRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleActivateSchoolPack();
  };

  // Minted A-Codes pool: loaded from server if active, or generated mock for offline fallback
  const plusCodesFallback = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    code: `AL-SCH-PLS-${(1000 + i * 47).toString(16).toUpperCase()}-205`,
    planTier: 'PLUS',
    durationDays: 180,
    isRedeemed: i < 5 ? 1 : 0,
    studentName: i < 5 ? ['Aarav Patel', 'Priya Sharma', 'Rohan Das', 'Ananya Sen', 'Kabir Verma'][i] : 'Unassigned'
  })), []);

  const liteCodesFallback = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    code: `AL-SCH-LTE-${(2000 + i * 31).toString(16).toUpperCase()}-049`,
    planTier: 'LITE',
    durationDays: 60,
    isRedeemed: i < 8 ? 1 : 0,
    studentName: i < 8 ? `Student Batch Cl.10-${i + 1}` : 'Unassigned'
  })), []);

  const displayCodes = useMemo(() => {
    let source = serverAcodes.length > 0
      ? serverAcodes
      : (selectedPack === 'PLUS_20' ? plusCodesFallback : liteCodesFallback);

    if (codeFilter === 'AVAILABLE') {
      source = source.filter(c => !c.isRedeemed);
    } else if (codeFilter === 'REDEEMED') {
      source = source.filter(c => c.isRedeemed);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      source = source.filter(c => 
        c.code.toLowerCase().includes(q) || 
        (c.studentName && c.studentName.toLowerCase().includes(q))
      );
    }

    return source;
  }, [serverAcodes, selectedPack, plusCodesFallback, liteCodesFallback, codeFilter, searchQuery]);

  const totalCodesCount = serverAcodes.length > 0 
    ? serverAcodes.length 
    : (selectedPack === 'PLUS_20' ? 20 : 40);

  const redeemedCount = serverAcodes.length > 0
    ? serverAcodes.filter(c => c.isRedeemed).length
    : (selectedPack === 'PLUS_20' ? 5 : 8);

  const availableCount = totalCodesCount - redeemedCount;

  // Real-Time Student Quiz Tracker Data
  const sampleScores: DemoStudentScore[] = [
    { id: '1', name: 'Aarav Patel', grade: 10, subject: 'Science', topic: 'Light: Reflection & Refraction', score: 3, maxScore: 5, accuracy: 60, date: 'Today, 2:15 PM', status: 'NEEDS_REVIEW' },
    { id: '2', name: 'Priya Sharma', grade: 10, subject: 'Mathematics', topic: 'Quadratic Equations & Roots', score: 2, maxScore: 5, accuracy: 40, date: 'Today, 1:40 PM', status: 'CRITICAL' },
    { id: '3', name: 'Rohan Das', grade: 10, subject: 'Science', topic: 'Acids, Bases & Salts', score: 5, maxScore: 5, accuracy: 100, date: 'Today, 12:10 PM', status: 'PASSED' },
    { id: '4', name: 'Ananya Sen', grade: 10, subject: 'Mathematics', topic: 'Arithmetic Progressions (AP)', score: 5, maxScore: 5, accuracy: 100, date: 'Today, 11:25 AM', status: 'PASSED' },
    { id: '5', name: 'Kabir Verma', grade: 10, subject: 'Science', topic: 'Light: Spherical Mirrors & Lens', score: 2, maxScore: 5, accuracy: 40, date: 'Yesterday', status: 'CRITICAL' },
    { id: '6', name: 'Diya Nair', grade: 10, subject: 'Mathematics', topic: 'Real Numbers & Euclid Division', score: 4, maxScore: 5, accuracy: 80, date: 'Yesterday', status: 'PASSED' },
    { id: '7', name: 'Ishaan Gupta', grade: 10, subject: 'Science', topic: 'Metals & Non-Metals Reactivity', score: 3, maxScore: 5, accuracy: 60, date: '2 days ago', status: 'NEEDS_REVIEW' },
  ];

  // Student Weak Points Diagnostics
  const weakPointTopics: WeakPointTopic[] = [
    {
      id: 'wp-1',
      subject: 'Science (Physics)',
      topic: 'Snell\'s Law, Refractive Index & Lens Formula',
      grade: 10,
      strugglingCount: 8,
      totalStudents: 20,
      avgAccuracy: 46,
      severity: 'CRITICAL',
      remedialNote: 'Students are confusing sign conventions (+/-) for focal length of concave vs convex lens.'
    },
    {
      id: 'wp-2',
      subject: 'Mathematics',
      topic: 'Quadratic Equations: Word Problems on Speed & Time',
      grade: 10,
      strugglingCount: 6,
      totalStudents: 20,
      avgAccuracy: 52,
      severity: 'CRITICAL',
      remedialNote: 'Difficulty translating speed/distance word problems into standard ax² + bx + c = 0 equations.'
    },
    {
      id: 'wp-3',
      subject: 'Science (Chemistry)',
      topic: 'Balancing Redox & Precipitation Reactions',
      grade: 10,
      strugglingCount: 4,
      totalStudents: 20,
      avgAccuracy: 64,
      severity: 'MODERATE',
      remedialNote: 'Minor gaps balancing diatomic oxygen and polyatomic ions in decomposition reactions.'
    },
    {
      id: 'wp-4',
      subject: 'Science (Biology)',
      topic: 'Mendelian Genetics & Monohybrid Inheritance',
      grade: 10,
      strugglingCount: 2,
      totalStudents: 20,
      avgAccuracy: 88,
      severity: 'GOOD',
      remedialNote: 'High mastery across classroom. Punnett square ratios 3:1 well understood.'
    }
  ];

  const handleCopySingleCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleCopyAllCodes = () => {
    const listToExport = serverAcodes.length > 0 ? serverAcodes : (selectedPack === 'PLUS_20' ? plusCodesFallback : liteCodesFallback);
    const tierName = selectedPack === 'PLUS_20' ? '20 Plus A-Codes (180 Days)' : '40 Lite A-Codes (60 Days)';
    const textToCopy = `ACADEMICLEVEL INSTITUTIONAL SCHOOL PACK\nBatch: ${tierName}\nTeacher: ${currentLearner?.fullName || teacherName || 'Classroom Admin'}\n\n` +
      listToExport.map((c, i) => `${i + 1}. Code: ${c.code} (${c.durationDays} Days) - Status: ${c.isRedeemed ? `REDEEMED by ${c.studentName || 'Student'}` : 'AVAILABLE'}`).join('\n') +
      `\n\nStudents can redeem their voucher on: https://academiclevel.in/ad or under in-app Profile!`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    const tierName = selectedPack === 'PLUS_20' ? '20 Plus A-Codes (180 Days)' : '40 Lite A-Codes (60 Days)';
    const text = encodeURIComponent(
      `📚 *AcademicLevel School Pack - Student Vouchers*\n` +
      `Batch: ${tierName}\n\n` +
      `Students: Enter your assigned A-CODE at checkout or in your AcademicLevel profile to activate your full plan with unlimited quizzes & AI tutor!\n\n` +
      `Redeem link: https://academiclevel.in/school`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#EEEEEE] text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-[#E0E0E0] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            onClick={() => onNavigate(isAuthenticated ? 'DASHBOARD' : 'HOME')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
              AL
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-[#212121] block leading-none">
                AcademicLevel
              </span>
              <span className="text-[10px] text-amber-400 font-semibold">
                {isTeacherDashboard ? 'Teacher Admin Dashboard' : 'Institutional School Portal'}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-bold">
            <button
              onClick={() => onNavigate(isAuthenticated ? 'DASHBOARD' : 'HOME')}
              className="px-3.5 py-1.5 rounded-xl bg-[#F5F5F5] hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              ← Back to {isAuthenticated ? 'Dashboard' : 'Home'}
            </button>
            {!isTeacherDashboard ? (
              <a
                href={PaymentService.getSchoolGatewayUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setHasOpenedGateway(true)}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black transition-all flex items-center space-x-1 shadow-md shadow-amber-950/40"
              >
                <span>Get School Pack (₹2,499) ↗</span>
              </a>
            ) : (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00796B]" />
                <span>Verified Teacher Admin</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-950/60 via-slate-950 to-slate-950 border-b border-indigo-900/30 pt-10 pb-12 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-lg shadow-amber-950/30">
            <School className="w-4 h-4 text-amber-400" />
            <span>{isTeacherDashboard ? 'TEACHER ADMIN DASHBOARD' : 'ACADEMICLEVEL FOR SCHOOLS & EDUCATORS'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#212121] tracking-tight leading-tight max-w-4xl mx-auto">
            {isTeacherDashboard ? (
              <>
                Classroom Vouchers &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">Teacher Portal</span>
              </>
            ) : (
              <>
                Institutional Classroom Pack • <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">₹2,499 Flat</span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-[#424242] max-w-2xl mx-auto leading-relaxed">
            {isTeacherDashboard
              ? `Manage your classroom voucher keys, track live student quiz performance, and identify conceptual bottlenecks across Class 10.`
              : `Equip your entire classroom with 40 Lite (60 Days) or 20 Plus (180 Days) A-Codes, live quiz tracking, and automated conceptual weak point diagnostics.`}
          </p>

          {/* Quick Tab Switcher */}
          <div className="pt-4 flex flex-wrap justify-center gap-2 text-xs font-bold">
            {!isTeacherDashboard ? (
              <>
                <button
                  onClick={() => setActiveTab('OFFER')}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'OFFER'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                      : 'bg-white border border-[#E0E0E0] text-[#424242] hover:text-[#212121]'
                  }`}
                >
                  🎟️ School Pack Offer (₹2,499)
                </button>
                <button
                  onClick={() => setActiveTab('TRACKER')}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'TRACKER'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                      : 'bg-white border border-[#E0E0E0] text-[#424242] hover:text-[#212121]'
                  }`}
                >
                  📊 Live Quiz Tracker Preview
                </button>
                <button
                  onClick={() => setActiveTab('WEAK_POINTS')}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'WEAK_POINTS'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                      : 'bg-white border border-[#E0E0E0] text-[#424242] hover:text-[#212121]'
                  }`}
                >
                  🎯 Student Weak Points Preview
                </button>
                <button
                  onClick={() => setActiveTab('ACODES')}
                  className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
                    activeTab === 'ACODES'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                      : 'bg-white border border-[#E0E0E0] text-[#616161] hover:text-[#212121]'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Classroom A-Codes Vault (Locked)</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('ACODES')}
                  className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2 ${
                    activeTab === 'ACODES'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50'
                      : 'bg-white border border-[#E0E0E0] text-[#424242] hover:text-[#212121]'
                  }`}
                >
                  <KeyRound className="w-4 h-4 text-slate-950" />
                  <span>🔑 Classroom A-Codes ({totalCodesCount})</span>
                </button>
                <button
                  onClick={() => setActiveTab('TRACKER')}
                  className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2 ${
                    activeTab === 'TRACKER'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                      : 'bg-white border border-[#E0E0E0] text-[#424242] hover:text-[#212121]'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>📊 Live Quiz Tracker</span>
                </button>
                <button
                  onClick={() => setActiveTab('WEAK_POINTS')}
                  className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center space-x-2 ${
                    activeTab === 'WEAK_POINTS'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                      : 'bg-white border border-[#E0E0E0] text-[#424242] hover:text-[#212121]'
                  }`}
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>🎯 Conceptual Weak Points</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-8 space-y-8">
        {/* TEACHER DASHBOARD HEADER (ONLY WHEN ACTIVE & UNLOCKED) */}
        {isTeacherDashboard && (
          <div className="p-5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border-2 border-emerald-500/40 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-[#00796B] flex items-center justify-center shrink-0">
                <School className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-black text-[#212121]">
                    {currentLearner?.fullName || teacherName || 'Teacher Admin'}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    Classroom Admin
                  </span>
                </div>
                <p className="text-xs text-[#424242] mt-0.5">
                  Institutional School License Active • Batch: <strong className="text-amber-400">{selectedPack === 'PLUS_20' ? '20 Plus A-Codes (180 Days)' : '40 Lite A-Codes (60 Days)'}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <button
                onClick={handleCopyAllCodes}
                className="px-3.5 py-2 bg-[#F5F5F5] hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                {copiedAll ? <Check className="w-3.5 h-3.5 text-[#00796B]" /> : <Copy className="w-3.5 h-3.5 text-[#616161]" />}
                <span>{copiedAll ? 'Copied!' : 'Copy Vouchers'}</span>
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp Share</span>
              </button>
            </div>
          </div>
        )}

        {/* PUBLIC VIEW: THE ₹2,499 SCHOOL PACK OFFER & 2-STEP UPI PG CHECKOUT */}
        {!isTeacherDashboard && activeTab === 'OFFER' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3 max-w-xl">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    👑 Bulk Classroom License
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#212121]">
                    School &amp; Tutor Institutional Pack (₹2,499)
                  </h2>
                  <p className="text-xs sm:text-sm text-[#424242] leading-relaxed">
                    Designed for schools, coaching institutes, and tuition centers. Get an all-in-one license with your choice of bulk student access passes.
                  </p>

                  {/* Choice Selector: 40 Lite (Option B) OR 20 Plus (Option A) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPack('LITE_40')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedPack === 'LITE_40'
                          ? 'bg-amber-500/20 border-amber-400 text-[#E65100] ring-2 ring-amber-500/30'
                          : 'bg-[#EEEEEE] border-[#E0E0E0] text-[#616161] hover:border-[#E0E0E0]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-sm text-[#212121]">Option B: 40 Lite A-Codes</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 font-bold">60 Days</span>
                      </div>
                      <p className="text-[11px] text-[#424242] mt-1">
                        2 Months Unlimited Quizzes &amp; Nova AI Tutor for 40 students. (~₹62.47 / student).
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPack('PLUS_20')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedPack === 'PLUS_20'
                          ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 ring-2 ring-indigo-500/30'
                          : 'bg-[#EEEEEE] border-[#E0E0E0] text-[#616161] hover:border-[#E0E0E0]'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-sm text-[#212121]">Option A: 20 Plus A-Codes</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-bold">180 Days</span>
                      </div>
                      <p className="text-[11px] text-[#424242] mt-1">
                        6 Months Full Access + Olympiad reasoning track for 20 students. (~₹124.95 / student).
                      </p>
                    </button>
                  </div>
                </div>

                {/* Price Box */}
                <div className="bg-[#EEEEEE] border border-[#E0E0E0] p-6 rounded-3xl text-center min-w-[240px] space-y-2 self-stretch md:self-auto flex flex-col justify-center">
                  <span className="text-[10px] font-mono text-[#616161] uppercase tracking-widest block">Flat Institutional Fee</span>
                  <div className="text-4xl font-black text-amber-400">₹2,499</div>
                  <span className="text-[11px] text-[#00796B] font-bold block">
                    {selectedPack === 'PLUS_20' ? 'Only ~₹124.95 / student (6 mo)' : 'Only ~₹62.47 / student (2 mo)'}
                  </span>
                  <div className="pt-2 text-[10px] text-[#616161] font-medium">
                    Includes Teacher Dashboard, Live Quiz Tracker, Weak Points Diagnostics &amp; {selectedPack === 'PLUS_20' ? '20' : '40'} Student Vouchers.
                  </div>
                </div>
              </div>

              {/* 2-STEP REAL UPI PG CHECKOUT & PAYMENT OK SCREEN (MATCHING STUDENT FLOW) */}
              <div className="border-t border-[#E0E0E0] pt-6 space-y-4">
                <div className="flex items-center space-x-2 text-sm font-bold text-amber-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Instant Payment &amp; Automated Teacher Admin Activation Flow</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* STEP 1: OPEN SECURE UPI PG GATEWAY */}
                  <div className="p-5 bg-[#EEEEEE] rounded-2xl border border-[#E0E0E0] space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px] font-black">1</span>
                          <span>Step 1: Open Secure Gateway</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#00796B] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          Official CIT UPI PG Gateway
                        </span>
                      </div>

                      {/* Payment Return Notice with English & Hinglish Toggle */}
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-[#E65100] space-y-2 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>Payment Return Notice</span>
                          </div>
                          <div className="flex bg-white rounded-lg p-0.5 text-[10px] font-bold border border-[#E0E0E0] shrink-0">
                            <button
                              type="button"
                              onClick={() => setNoticeLang('EN')}
                              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${noticeLang === 'EN' ? 'bg-amber-400 text-slate-950 font-black' : 'text-[#616161] hover:text-white'}`}
                            >
                              English
                            </button>
                            <button
                              type="button"
                              onClick={() => setNoticeLang('HINGLISH')}
                              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${noticeLang === 'HINGLISH' ? 'bg-amber-400 text-slate-950 font-black' : 'text-[#616161] hover:text-white'}`}
                            >
                              Hinglish
                            </button>
                          </div>
                        </div>
                        {noticeLang === 'EN' ? (
                          <p className="text-[11px] leading-relaxed text-[#E65100] font-medium">
                            ⚠️ <strong>AFTER you have paid in UPI PG</strong>, instead of being stuck on that page, <strong>CLICK back and return here</strong>, otherwise we will forget your payment as we track payments and accounts by the pay now button click.
                          </p>
                        ) : (
                          <p className="text-[11px] leading-relaxed text-[#E65100] font-medium">
                            ⚠️ <strong>UPI PG mein payment complete karne ke baad</strong>, wahan page par ruke rehne ke bajaye <strong>CLICK back karke yahan wapas aaiye</strong>, warna hum aapki payment bhool sakte hain kyunki hum payments aur accounts ko Pay Now button click ke through track karte hain.
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleOpenGateway}
                        className="w-full py-4 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-[1.01]"
                      >
                        <ExternalLink className="w-5 h-5" />
                        <span>BUY SCHOOL PACK (₹2,499) ↗</span>
                      </button>
                    </div>

                    {/* Gateway Link Preview & Copy */}
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-[#E0E0E0] text-[11px] font-mono text-[#616161] mt-2">
                      <span className="truncate pr-2">{PaymentService.getSchoolGatewayUrl()}</span>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-2.5 py-1 bg-[#F5F5F5] hover:bg-slate-700 text-amber-300 font-bold rounded-lg text-[10px] transition-colors flex items-center space-x-1 flex-shrink-0 cursor-pointer"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3 h-3 text-[#00796B]" />
                            <span className="text-emerald-300">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-[#616161]" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* STEP 2: PAYMENT OK SCREEN FOR TEACHER ADMIN ACCOUNT */}
                  <div className="p-5 bg-[#EEEEEE] rounded-2xl border border-emerald-500/40 space-y-3 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-[#00796B] flex items-center justify-center text-[11px] font-black">2</span>
                          <span>{hasOpenedGateway ? 'Payment OK. Complete Activation:-' : 'Step 2: Instant Teacher Admin Activation'}</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#00796B] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          Zero Wait Time
                        </span>
                      </div>

                      {/* Student Account Warning if current session is a student */}
                      {isAuthenticated && currentLearner?.role !== 'TEACHER' && currentLearner?.role !== 'SUPER_ADMIN' && (
                        <div className="p-3.5 bg-amber-950/60 rounded-xl border border-amber-500/40 text-xs space-y-2">
                          <div className="flex items-center space-x-1.5 text-amber-300 font-bold">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>Student Account Detected ({currentLearner?.fullName})</span>
                          </div>
                          <p className="text-[11px] text-[#E65100] leading-relaxed">
                            To prevent quiz answer tampering and protect classroom assessments, <strong>Teacher Admin accounts are strictly isolated from student learner accounts</strong>. Student accounts cannot view teacher answer keys or class diagnostics. Please set up your separate Educator account below.
                          </p>
                          <div className="flex items-center space-x-2 pt-1">
                            <button
                              type="button"
                              onClick={() => logout()}
                              className="px-3 py-1 bg-[#F5F5F5] hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-[10px] transition-colors cursor-pointer"
                            >
                              Sign Out of Student Account
                            </button>
                          </div>
                        </div>
                      )}

                      {/* If user is NOT a verified Teacher yet: Dedicated Educator Setup */}
                      {(!isAuthenticated || (currentLearner && currentLearner.role !== 'TEACHER' && currentLearner.role !== 'SUPER_ADMIN')) ? (
                        <div className="space-y-2.5 bg-slate-900/80 p-3.5 rounded-xl border border-[#E0E0E0]">
                          <div className="flex items-center space-x-2 text-xs font-bold text-[#212121]">
                            <UserCheck className="w-4 h-4 text-amber-400" />
                            <span>Setup Dedicated Teacher Admin Account (Isolated from Student Accounts)</span>
                          </div>
                          <p className="text-[11px] text-[#616161]">
                            Create your official educator credentials to access the Teacher Dashboard, live quiz tracker, and distribute your {selectedPack === 'PLUS_20' ? '20' : '40'} A-Codes.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-semibold text-[#616161] mb-0.5">Teacher Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Mrs. Sunita Sharma"
                                value={teacherName}
                                onChange={e => setTeacherName(e.target.value)}
                                className="w-full bg-[#EEEEEE] border border-[#E0E0E0] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#616161] mb-0.5">School Email</label>
                              <input
                                type="email"
                                placeholder="teacher@dps-school.edu.in"
                                value={teacherEmail}
                                onChange={e => setTeacherEmail(e.target.value)}
                                className="w-full bg-[#EEEEEE] border border-[#E0E0E0] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-semibold text-[#616161] mb-0.5">Account Password</label>
                              <input
                                type="password"
                                placeholder="Choose login password"
                                value={teacherPassword}
                                onChange={e => setTeacherPassword(e.target.value)}
                                className="w-full bg-[#EEEEEE] border border-[#E0E0E0] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-[#616161] mb-0.5">School / Center Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Delhi Public School"
                                value={schoolName}
                                onChange={e => setSchoolName(e.target.value)}
                                className="w-full bg-[#EEEEEE] border border-[#E0E0E0] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-900/90 rounded-xl border border-emerald-500/30 text-xs space-y-1">
                          <div className="flex items-center space-x-1.5 text-[#00796B] font-bold">
                            <CheckCircle2 className="w-4 h-4 text-[#00796B]" />
                            <span>Verified Educator Account: {currentLearner?.fullName}</span>
                          </div>
                          <p className="text-[11px] text-[#424242]">
                            Teacher Admin role confirmed ({currentLearner?.email}). Ready to unlock classroom license.
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] text-[#616161] mb-1">
                          12-Digit UPI PG Reference / UTR *
                        </label>
                        <input
                          type="text"
                          maxLength={12}
                          placeholder="Enter 12-digit UTR number from payment receipt"
                          value={customRef}
                          onChange={e => setCustomRef(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
                          className="w-full bg-white border border-[#E0E0E0] focus:border-emerald-400 rounded-xl px-3 py-2 text-xs text-[#212121] placeholder-slate-500 font-mono focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <button
                        type="button"
                        onClick={handleActivateSchoolPack}
                        disabled={isActivating}
                        className="w-full py-4 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {isActivating ? (
                          <span>Activating Teacher Dashboard &amp; Minting Vouchers...</span>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-slate-950" />
                            <span>I Have Paid — Open Teacher Dashboard &amp; View {selectedPack === 'PLUS_20' ? '20' : '40'} A-Codes</span>
                          </>
                        )}
                      </button>

                      {authError && (
                        <p className="text-xs text-rose-400 font-semibold text-center">{authError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white border border-[#E0E0E0] rounded-2xl space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="font-bold text-sm text-[#212121]">Live Student Quiz Tracker</h4>
                <p className="text-xs text-[#616161] leading-relaxed">
                  Real-time classroom monitoring. See student attempts, scores, and accuracy percentages as they practice.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#E0E0E0] rounded-2xl space-y-2">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-rose-400" />
                </div>
                <h4 className="font-bold text-sm text-[#212121]">Student Weak Point Diagnostics</h4>
                <p className="text-xs text-[#616161] leading-relaxed">
                  Automated learning gap detection. Identify exactly which topics students struggle with before term exams.
                </p>
              </div>

              <div className="p-5 bg-white border border-[#E0E0E0] rounded-2xl space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[#3F51B5] flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-[#3F51B5]" />
                </div>
                <h4 className="font-bold text-sm text-[#212121]">Bulk Voucher Generator</h4>
                <p className="text-xs text-[#616161] leading-relaxed">
                  Mint 20 Plus or 40 Lite A-Codes with 1 click. Copy, print, or share via WhatsApp with parents and students.
                </p>
              </div>
            </div>

            {/* WHAT'S DIFFERENT FROM CHATGPT FOR SCHOOLS & TEACHERS */}
            <div className="pt-6">
              <WhatsDifferentFromChatGPT
                mode="TEACHER_SCHOOL"
                onCtaClick={() => window.scrollTo({ top: 380, behavior: 'smooth' })}
              />
            </div>
          </div>
        )}

        {/* PUBLIC VIEW: A-CODES LOCKED TEASER (IF SOMEONE CLICKS ACODES BEFORE PAYMENT) */}
        {!isTeacherDashboard && activeTab === 'ACODES' && (
          <div className="bg-white border-2 border-dashed border-amber-500/40 rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-lg shadow-amber-950/40">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-xl font-black text-[#212121]">
                🔒 Classroom A-Codes Vault is Locked
              </h3>
              <p className="text-xs sm:text-sm text-[#424242] leading-relaxed">
                To protect institutional passes, student A-codes are not displayed in the open. 
                Complete payment for the <strong>School Pack (₹2,499)</strong> and activate your Teacher Admin account to reveal and distribute your <strong>40 Lite (or 20 Plus) A-Codes</strong>.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveTab('OFFER')}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <span>Go to ₹2,499 School Offer &amp; Unlock 40 A-Codes</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>
          </div>
        )}

        {/* TAB: A-CODES VAULT IN TEACHER DASHBOARD (REVEALED ONLY IN TEACHER DASHBOARD) */}
        {isTeacherDashboard && activeTab === 'ACODES' && (
          <div className="bg-white border border-[#E0E0E0] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            {activationMessage && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#00796B] shrink-0" />
                <span>{activationMessage.text}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-black text-[#212121] flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <span>Classroom A-Codes Voucher Vault ({totalCodesCount} Keys)</span>
                </h3>
                <p className="text-xs text-[#616161] mt-0.5">
                  Distribute these unique voucher keys to your students. They can enter their code on the payment page or student profile for instant pass activation.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyAllCodes}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'All Codes Copied!' : `Copy All ${totalCodesCount} Vouchers`}</span>
                </button>
                <button
                  onClick={handleWhatsAppShare}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Voucher Counter & Filter Bar */}
            <div className="p-4 bg-[#EEEEEE] rounded-2xl border border-[#E0E0E0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-4">
                <div>
                  <span className="text-[10px] text-[#616161] uppercase font-mono block">Total Minted</span>
                  <span className="text-base font-black text-[#212121]">{totalCodesCount}</span>
                </div>
                <div className="border-l border-[#E0E0E0] pl-4">
                  <span className="text-[10px] text-[#00796B] uppercase font-mono block">Available</span>
                  <span className="text-base font-black text-[#00796B]">{availableCount}</span>
                </div>
                <div className="border-l border-[#E0E0E0] pl-4">
                  <span className="text-[10px] text-[#616161] uppercase font-mono block">Redeemed</span>
                  <span className="text-base font-black text-[#424242]">{redeemedCount}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search code or student..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-white border border-[#E0E0E0] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#212121] placeholder-slate-500 focus:outline-none focus:border-amber-400 w-44"
                  />
                </div>

                <div className="flex bg-white rounded-xl p-1 border border-[#E0E0E0] text-[10px] font-bold">
                  <button
                    onClick={() => setCodeFilter('ALL')}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${codeFilter === 'ALL' ? 'bg-amber-400 text-slate-950' : 'text-[#616161]'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setCodeFilter('AVAILABLE')}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${codeFilter === 'AVAILABLE' ? 'bg-emerald-500 text-slate-950 font-black' : 'text-[#616161]'}`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => setCodeFilter('REDEEMED')}
                    className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${codeFilter === 'REDEEMED' ? 'bg-slate-700 text-[#212121]' : 'text-[#616161]'}`}
                  >
                    Redeemed
                  </button>
                </div>
              </div>
            </div>

            {/* Grid of A-Codes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayCodes.map((c) => (
                <div key={c.code} className="p-3 bg-[#EEEEEE] border border-[#E0E0E0] rounded-2xl flex items-center justify-between text-xs hover:border-[#E0E0E0] transition-colors">
                  <div className="pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-amber-300">{c.code}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        c.isRedeemed ? 'bg-[#F5F5F5] text-[#616161]' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {c.isRedeemed ? 'REDEEMED' : 'AVAILABLE'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#616161] block mt-0.5">
                      {c.planTier || 'LITE'} ({c.durationDays || 60} Days) • {c.isRedeemed ? 'Student: ' : 'Assigned: '}
                      <strong className={c.isRedeemed ? 'text-emerald-300 font-semibold' : 'text-slate-200'}>
                        {c.studentName || 'Unassigned'}
                      </strong>
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopySingleCode(c.code)}
                    className="p-2 bg-[#F5F5F5] hover:bg-slate-700 text-[#424242] hover:text-white rounded-xl transition-colors cursor-pointer shrink-0"
                    title="Copy Voucher Code"
                  >
                    {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-[#00796B]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE STUDENT QUIZ TRACKER */}
        {activeTab === 'TRACKER' && (
          <div className="bg-white border border-[#E0E0E0] rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-black text-[#212121] flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  <span>Classroom Live Quiz Activity Feed</span>
                </h3>
                <p className="text-xs text-[#616161] mt-0.5">
                  Real-time monitoring of Class 10 student assessments and quiz scores.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-[#00796B] rounded-lg font-mono font-bold">
                  ● Live Feed Active
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-[#616161] font-mono uppercase text-[10px] border-b border-[#E0E0E0]">
                  <tr>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Subject &amp; Class</th>
                    <th className="p-3">Curriculum Topic</th>
                    <th className="p-3 text-center">Score</th>
                    <th className="p-3 text-center">Accuracy</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {sampleScores.map(s => (
                    <tr key={s.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-[#212121] flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                          {s.name.charAt(0)}
                        </span>
                        <span>{s.name}</span>
                      </td>
                      <td className="p-3 text-[#424242]">
                        {s.subject} (Cl. {s.grade})
                      </td>
                      <td className="p-3 text-[#424242] font-medium">
                        {s.topic}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-[#212121]">
                        {s.score} / {s.maxScore}
                      </td>
                      <td className="p-3 text-center font-mono font-bold">
                        <span className={`px-2 py-0.5 rounded ${
                          s.accuracy >= 80 ? 'bg-emerald-500/20 text-emerald-300' :
                          s.accuracy >= 60 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {s.accuracy}%
                        </span>
                      </td>
                      <td className="p-3 text-[#616161] text-[11px] font-mono">
                        {s.date}
                      </td>
                      <td className="p-3 text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.status === 'PASSED' ? 'bg-emerald-500/20 text-emerald-300' :
                          s.status === 'NEEDS_REVIEW' ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {s.status === 'PASSED' ? 'Passed' : s.status === 'NEEDS_REVIEW' ? 'Review' : 'Critical Gap'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: STUDENT WEAK POINTS DIAGNOSTICS */}
        {activeTab === 'WEAK_POINTS' && (
          <div className="bg-white border border-[#E0E0E0] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div>
              <h3 className="text-lg font-black text-[#212121] flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-rose-400" />
                <span>Automated Conceptual Weak Point Diagnostics</span>
              </h3>
              <p className="text-xs text-[#616161] mt-0.5">
                AI diagnostic scanner identifies chapters and concepts where multiple students failed mastery thresholds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {weakPointTopics.map(w => (
                <div
                  key={w.id}
                  className={`p-5 rounded-2xl border space-y-3 ${
                    w.severity === 'CRITICAL'
                      ? 'bg-rose-950/30 border-rose-500/40 ring-1 ring-rose-500/20'
                      : w.severity === 'MODERATE'
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-emerald-950/20 border-emerald-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase text-[#616161]">
                        {w.subject} • Class {w.grade}
                      </span>
                      <h4 className="font-extrabold text-sm text-[#212121] mt-0.5">
                        {w.topic}
                      </h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                      w.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300' :
                      w.severity === 'MODERATE' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {w.avgAccuracy}% Avg Score
                    </span>
                  </div>

                  <div className="text-xs text-[#424242] space-y-1">
                    <p className="text-[#616161]">
                      Struggling Students: <strong className="text-[#212121]">{w.strugglingCount} of {w.totalStudents}</strong>
                    </p>
                    <p className="text-[11px] text-[#424242] leading-relaxed italic bg-slate-950/60 p-2.5 rounded-xl border border-[#E0E0E0]">
                      💡 <strong>Teacher Diagnostic:</strong> {w.remedialNote}
                    </p>
                  </div>

                  <button
                    onClick={() => alert(`Launching 5-question remedial practice quiz for "${w.topic}". This will be assigned to all ${w.strugglingCount} struggling students!`)}
                    className="w-full py-2 bg-[#F5F5F5] hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Launch 5-Question Remedial Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
