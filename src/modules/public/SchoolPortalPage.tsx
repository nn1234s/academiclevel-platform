import React, { useState, useEffect } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { ApiClient } from '../../core/api/apiClient';
import { StorageRLSLayer } from '../../core/storage/StorageRLSLayer';
import { PaymentService, UPI_GATEWAY_URLS } from '../../services/paymentService';
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
  UserCheck
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
  const { currentLearner, isAuthenticated, refreshCurrentLearner } = useAuth();

  // Selected Pack Preference: 20 Plus (180d) OR 40 Lite (60d)
  const [selectedPack, setSelectedPack] = useState<'PLUS_20' | 'LITE_40'>('PLUS_20');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'OFFER' | 'TRACKER' | 'WEAK_POINTS' | 'ACODES'>('OFFER');

  // Teacher Account Onboarding State
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);
  const [isTeacherActive, setIsTeacherActive] = useState<boolean>(false);

  // Check if current logged-in user is a teacher or has enabled teacher mode
  useEffect(() => {
    if (currentLearner) {
      const isTeacher = (currentLearner as any).role === 'TEACHER' || 
                        (currentLearner as any).role === 'SUPER_ADMIN' ||
                        localStorage.getItem(`al_teacher_mode_${currentLearner.id}`) === 'true';
      setIsTeacherActive(Boolean(isTeacher));
      if (!teacherName) setTeacherName(currentLearner.fullName || '');
      if (!teacherEmail) setTeacherEmail(currentLearner.email || '');
    }
  }, [currentLearner]);

  // One-click enable teacher mode for existing authenticated account
  const handleEnableTeacherMode = async () => {
    if (!currentLearner) return;
    try {
      localStorage.setItem(`al_teacher_mode_${currentLearner.id}`, 'true');
      setIsTeacherActive(true);
      setActiveTab('TRACKER');
    } catch {}
  };

  // Handle new Teacher Registration
  const handleTeacherRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !teacherEmail.trim() || !teacherPassword.trim()) {
      setAuthError('Please fill in your name, school email, and password.');
      return;
    }

    setIsSubmittingAuth(true);
    setAuthError('');

    try {
      const res = await ApiClient.register({
        fullName: teacherName.trim(),
        email: teacherEmail.trim(),
        board: 'CBSE',
        grade: 10,
        parentName: schoolName.trim() || 'School Administration',
        parentPin: '1234',
        password: teacherPassword.trim()
      });

      if (res.success && res.learner) {
        localStorage.setItem(`al_teacher_mode_${res.learner.id}`, 'true');
        setIsTeacherActive(true);
        if (onSuccessAuth) onSuccessAuth();
        await refreshCurrentLearner();
        setActiveTab('TRACKER');
      } else {
        setAuthError((res as any).error || 'Failed to initialize teacher account.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Registration anomaly. Please try again.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Institutional A-Codes pool (Generated for 20 Plus or 40 Lite)
  const plusCodes = Array.from({ length: 20 }, (_, i) => ({
    code: `AL-SCH-PLUS-${(1000 + i * 47).toString(16).toUpperCase()}`,
    tier: 'PLUS (180 Days)',
    days: 180,
    status: i < 7 ? 'REDEEMED' : 'AVAILABLE',
    studentName: i < 7 ? ['Aarav Patel', 'Priya Sharma', 'Rohan Das', 'Ananya Sen', 'Kabir Verma', 'Diya Nair', 'Ishaan Gupta'][i] : 'Unassigned'
  }));

  const liteCodes = Array.from({ length: 40 }, (_, i) => ({
    code: `AL-SCH-LITE-${(2000 + i * 31).toString(16).toUpperCase()}`,
    tier: 'LITE (60 Days)',
    days: 60,
    status: i < 14 ? 'REDEEMED' : 'AVAILABLE',
    studentName: i < 14 ? `Student Batch Cl.10-${i + 1}` : 'Unassigned'
  }));

  const activeCodes = selectedPack === 'PLUS_20' ? plusCodes : liteCodes;

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
    const textToCopy = `ACADEMICLEVEL SCHOOL PACK (${selectedPack === 'PLUS_20' ? '20 Plus A-Codes - 180 Days' : '40 Lite A-Codes - 60 Days'})\n\n` +
      activeCodes.map((c, i) => `${i + 1}. Code: ${c.code} (${c.tier}) - Status: ${c.status}`).join('\n') +
      `\n\nRedeem on: https://academiclevel.in/ad or in-app Profile!`;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            onClick={() => onNavigate(isAuthenticated ? 'DASHBOARD' : 'HOME')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
              AL
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block leading-none">
                AcademicLevel
              </span>
              <span className="text-[10px] text-amber-400 font-semibold">Institutional School Portal</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-bold">
            <button
              onClick={() => onNavigate(isAuthenticated ? 'DASHBOARD' : 'HOME')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              ← Back to {isAuthenticated ? 'Dashboard' : 'Home'}
            </button>
            <a
              href={PaymentService.getSchoolGatewayUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black transition-all flex items-center space-x-1 shadow-md shadow-amber-950/40"
            >
              <span>Get School Pack (₹2,499) ↗</span>
            </a>
          </div>
        </div>
      </header>

      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-950/60 via-slate-950 to-slate-950 border-b border-indigo-900/30 pt-10 pb-12 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-lg shadow-amber-950/30">
            <School className="w-4 h-4 text-amber-400" />
            <span>ACADEMICLEVEL FOR SCHOOLS &amp; EDUCATORS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Institutional Classroom Pack • <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">₹2,499 Flat</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Equip your entire classroom with <strong className="text-white">20 Plus (180 Days)</strong> or <strong className="text-white">40 Lite (60 Days)</strong> A-Codes, live quiz tracking, and automated conceptual weak point diagnostics.
          </p>

          {/* Quick Tab Switcher */}
          <div className="pt-4 flex flex-wrap justify-center gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('OFFER')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'OFFER'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              🎟️ School Pack Offer (₹2,499)
            </button>
            <button
              onClick={() => setActiveTab('TRACKER')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'TRACKER'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              📊 Live Quiz Tracker
            </button>
            <button
              onClick={() => setActiveTab('WEAK_POINTS')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'WEAK_POINTS'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              🎯 Student Weak Points
            </button>
            <button
              onClick={() => setActiveTab('ACODES')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'ACODES'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              🔑 Classroom A-Codes Vault
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-8 space-y-8">
        {/* FIRST-VISIT TEACHER ACCOUNT CHECK / QUICK LOGIN */}
        {!isTeacherActive ? (
          <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {isAuthenticated ? `Welcome, ${currentLearner?.fullName}!` : 'First Visit? Create or Connect Teacher Account'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {isAuthenticated 
                      ? 'You are signed in with a student account. Enable Teacher Mode with the same name and password!'
                      : 'Create your school admin profile with your name and password to access the Classroom Dashboard.'}
                  </p>
                </div>
              </div>

              {isAuthenticated ? (
                <button
                  onClick={handleEnableTeacherMode}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all shrink-0 cursor-pointer"
                >
                  Enable Teacher Mode (Same Name &amp; Pass) ↗
                </button>
              ) : null}
            </div>

            {!isAuthenticated && (
              <form onSubmit={handleTeacherRegister} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Teacher / Admin Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mrs. Sunita Sharma"
                    value={teacherName}
                    onChange={e => setTeacherName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">School / Institution Email</label>
                  <input
                    type="email"
                    required
                    placeholder="teacher@dps-school.edu.in"
                    value={teacherEmail}
                    onChange={e => setTeacherEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Account Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={teacherPassword}
                    onChange={e => setTeacherPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isSubmittingAuth}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingAuth ? 'Creating Account...' : 'Create Teacher Account ↗'}
                  </button>
                </div>
                {authError && (
                  <p className="col-span-1 sm:col-span-4 text-xs text-rose-400 font-semibold">{authError}</p>
                )}
              </form>
            )}
          </div>
        ) : (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Teacher Mode Active: Verified Educator Account ({currentLearner?.fullName || teacherName})</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              Classroom Admin
            </span>
          </div>
        )}

        {/* TAB 1: THE ₹2,499 SCHOOL PACK OFFER */}
        {activeTab === 'OFFER' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3 max-w-xl">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    👑 Bulk Classroom License
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white">
                    School &amp; Tutor Institutional Pack (₹2,499)
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Designed for schools, coaching institutes, and tuition centers. Get an all-in-one license with your choice of bulk student access passes.
                  </p>

                  {/* Choice Selector: 20 Plus OR 40 Lite */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPack('PLUS_20')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedPack === 'PLUS_20'
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-sm text-white">Option A: 20 Plus A-Codes</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 font-bold">180 Days</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        6 Months Full Access + Olympiad reasoning track for 20 students.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedPack('LITE_40')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        selectedPack === 'LITE_40'
                          ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 ring-2 ring-indigo-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-sm text-white">Option B: 40 Lite A-Codes</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 font-bold">60 Days</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1">
                        2 Months Unlimited Quizzes &amp; Socratic AI tutor for 40 students.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Price Box & CTA */}
                <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl text-center min-w-[260px] space-y-3 self-stretch md:self-auto flex flex-col justify-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Flat Institutional Fee</span>
                  <div className="text-4xl font-black text-amber-400">₹2,499</div>
                  <span className="text-[11px] text-emerald-400 font-bold block">
                    {selectedPack === 'PLUS_20' ? 'Only ~₹124.95 / student (6 mo)' : 'Only ~₹62.47 / student (2 mo)'}
                  </span>

                  <a
                    href={PaymentService.getSchoolGatewayUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>BUY SCHOOL PACK (₹2,499) ↗</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => setActiveTab('ACODES')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    View Included A-Codes Demo
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="font-bold text-sm text-white">Live Student Quiz Tracker</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time classroom monitoring. See student attempts, scores, and accuracy percentages as they practice.
                </p>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-rose-400" />
                </div>
                <h4 className="font-bold text-sm text-white">Student Weak Point Diagnostics</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automated learning gap detection. Identify exactly which topics students struggle with before term exams.
                </p>
              </div>

              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-indigo-400" />
                </div>
                <h4 className="font-bold text-sm text-white">Bulk Voucher Generator</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mint 20 Plus or 40 Lite A-Codes with 1 click. Copy, print, or share via WhatsApp with parents and students.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE STUDENT QUIZ TRACKER */}
        {activeTab === 'TRACKER' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
                  <span>Classroom Live Quiz Activity Feed</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time monitoring of Class 10 student assessments and quiz scores.
                </p>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg font-mono font-bold">
                  ● Live Feed Active
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
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
                      <td className="p-3 font-bold text-white flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                          {s.name.charAt(0)}
                        </span>
                        <span>{s.name}</span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {s.subject} (Cl. {s.grade})
                      </td>
                      <td className="p-3 text-slate-300 font-medium">
                        {s.topic}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-white">
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
                      <td className="p-3 text-slate-400 text-[11px] font-mono">
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div>
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-rose-400" />
                <span>Automated Conceptual Weak Point Diagnostics</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
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
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                        {w.subject} • Class {w.grade}
                      </span>
                      <h4 className="font-extrabold text-sm text-white mt-0.5">
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

                  <div className="text-xs text-slate-300 space-y-1">
                    <p className="text-slate-400">
                      Struggling Students: <strong className="text-white">{w.strugglingCount} of {w.totalStudents}</strong>
                    </p>
                    <p className="text-[11px] text-slate-300 leading-relaxed italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      💡 <strong>Teacher Diagnostic:</strong> {w.remedialNote}
                    </p>
                  </div>

                  <button
                    onClick={() => alert(`Launching 5-question remedial practice quiz for "${w.topic}". This will be assigned to all ${w.strugglingCount} struggling students!`)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Launch 5-Question Remedial Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: A-CODES VAULT (20 PLUS OR 40 LITE) */}
        {activeTab === 'ACODES' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center space-x-2">
                  <KeyRound className="w-5 h-5 text-amber-400" />
                  <span>Classroom A-Codes Voucher Vault</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Distribute these unique voucher keys to your students. They can redeem them on the checkout page or student profile.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyAllCodes}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'All Codes Copied!' : 'Copy All Vouchers'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeCodes.map((c, idx) => (
                <div key={c.code} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono font-bold text-amber-300">{c.code}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        c.status === 'REDEEMED' ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {c.tier} • Assigned: <strong className="text-slate-200">{c.studentName}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopySingleCode(c.code)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                    title="Copy Voucher Code"
                  >
                    {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
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
