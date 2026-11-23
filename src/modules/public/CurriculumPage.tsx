import React, { useState, useEffect } from 'react';
import { Board, Grade, Subject, Question } from '../../core/types';
import { CurriculumService } from '../../services/curriculumService';
import { OfflineBankService } from '../../services/offlineBankService';
import { StudyCoinIcon } from '../shared/StudyCoinIcon';
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Star,
  Trophy,
  Award,
  Zap,
  Target,
  RefreshCw,
  Flame,
  Check,
  Crown
} from 'lucide-react';

export type CurriculumTrack = 'CBSE' | 'ICSE' | 'CAMBRIDGE' | 'OLYMPIAD' | 'ALL';

interface CurriculumPageProps {
  track?: CurriculumTrack;
  onOpenRegister: () => void;
  onNavigate: (route: string, extra?: any) => void;
  onSelectPlan?: (tier: 'LITE' | 'PLUS' | 'GOLD') => void;
}

export const CurriculumPage: React.FC<CurriculumPageProps> = ({
  track = 'CBSE',
  onOpenRegister,
  onNavigate,
  onSelectPlan
}) => {
  // Active board state
  const [activeBoard, setActiveBoard] = useState<Board>(() => {
    if (track === 'ICSE') return 'ICSE';
    if (track === 'CAMBRIDGE') return 'IGCSE';
    return 'CBSE';
  });

  const [selectedGrade, setSelectedGrade] = useState<Grade>(10);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('math');

  // Interactive sample question state
  const [sampleQuestions, setSampleQuestions] = useState<Question[]>([]);
  const [currentSampleIndex, setCurrentSampleIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // Sync board with track prop when route changes
  useEffect(() => {
    if (track === 'ICSE') setActiveBoard('ICSE');
    else if (track === 'CAMBRIDGE') setActiveBoard('IGCSE');
    else if (track === 'CBSE' || track === 'OLYMPIAD' || track === 'ALL') setActiveBoard('CBSE');
  }, [track]);

  // Load sample questions whenever board, grade, or subject changes
  useEffect(() => {
    try {
      const questions = OfflineBankService.getQuestions(activeBoard, selectedGrade, selectedSubjectId, 'FOUNDATION', 5);
      setSampleQuestions(questions.length > 0 ? questions : []);
      setCurrentSampleIndex(0);
      setSelectedOption(null);
      setShowFeedback(false);
    } catch {
      setSampleQuestions([]);
    }
  }, [activeBoard, selectedGrade, selectedSubjectId]);

  const subjects = CurriculumService.getSubjects(activeBoard, selectedGrade);
  const currentQ = sampleQuestions[currentSampleIndex];

  const handleSelectOption = (idx: number) => {
    if (showFeedback) return;
    setSelectedOption(idx);
    setShowFeedback(true);
    if (currentQ && idx === currentQ.correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNextSample = () => {
    if (sampleQuestions.length === 0) return;
    setSelectedOption(null);
    setShowFeedback(false);
    setCurrentSampleIndex(prev => (prev + 1) % sampleQuestions.length);
  };

  const trackInfo = {
    CBSE: {
      badge: 'NCERT & NEP 2020 Aligned',
      title: 'CBSE Classes 1 to 12 Curriculum',
      subtitle: 'Complete chapter-wise curriculum, past-year board exam questions (PYQs), and competency-based assessments mapped strictly to the latest CBSE and NCERT guidelines.',
      features: [
        'All 12 Classes covered from Primary to Senior Secondary',
        'Mathematics, Science (Physics/Chemistry/Biology), Computer Science, English & Social',
        '4 Progression Nodes: Foundation, Conceptual, Board Specimen, and Olympiad HOTS',
        '100% verified question bank with step-by-step Socratic explanations'
      ],
      tagColor: 'bg-indigo-50 border-indigo-200 text-indigo-700'
    },
    ICSE: {
      badge: 'CISCE Standards & Analytical Mastery',
      title: 'ICSE & CISCE Classes 1 to 12 Curriculum',
      subtitle: 'In-depth analytical syllabi emphasizing structured problem-solving, detailed step marking, and comprehensive scientific clarity across all CISCE subjects.',
      features: [
        'Rigorous analytical problem sets tailored to CISCE standards',
        'Detailed step-marking rubrics and theoretical question banks',
        'Complete coverage of Classes 1–10 (ICSE) and Classes 11–12 (ISC)',
        'Socratic Nova AI tutoring to break down complex proofs and equations'
      ],
      tagColor: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    CAMBRIDGE: {
      badge: 'Cambridge International & IGCSE Benchmark',
      title: 'Cambridge IGCSE & International Curriculum',
      subtitle: 'Internationally benchmarked inquiry-based learning modules designed for Cambridge Primary, Lower Secondary, and Upper Secondary IGCSE curricula.',
      features: [
        'Inquiry-based problem solving and critical thinking challenges',
        'Cambridge IGCSE syllabus mapping with global scoring rubrics',
        'Interactive experiments and visual real-world application models',
        'Autonomous AI hints that guide students without giving raw answers away'
      ],
      tagColor: 'bg-purple-50 border-purple-200 text-purple-700'
    },
    OLYMPIAD: {
      badge: 'National & International Olympiad Foundations',
      title: 'Olympiad & Competitive Foundations (Classes 1–12)',
      subtitle: 'High-order thinking skills (HOTS), speed simulation, pattern recognition, and elite math/science olympiad training (IMO, NSO, NTSE).',
      features: [
        'Challenging HOTS questions designed for top percentile ranks',
        'Speed simulators and pattern recognition drills',
        'National and International Olympiad syllabus coverage',
        'Earn double Study Coins and physical prizes in the Gift Store'
      ],
      tagColor: 'bg-amber-50 border-amber-200 text-amber-700'
    },
    ALL: {
      badge: 'Comprehensive K-12 Multi-Board Curriculum',
      title: 'Full Curriculum & Grade Progression Directory',
      subtitle: 'Select any Board (CBSE, ICSE, Cambridge) or Olympiad track to explore syllabus nodes and test drive real sample questions.',
      features: [
        '12,000 Syllabus-Verified Questions across all boards and classes',
        'Socratic Nova AI Tutor available 24/7 for instant guided help',
        '3 Full Curriculum Levels 100% Free for every registered learner',
        'Physical rewards: books, stationery, plushies, and certificates'
      ],
      tagColor: 'bg-emerald-50 border-emerald-200 text-emerald-700'
    }
  }[track];

  return (
    <div className="max-w-6xl mx-auto space-y-12 text-slate-900 py-6 px-4">
      {/* 1. TOP STICKY CONVERSION RIBBON (BEG FOR FREE SIGNUP) */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 rounded-3xl p-4 sm:p-5 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
            🎁
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className="font-black text-sm sm:text-base tracking-tight uppercase">
                100% Free Student Account Available!
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase shadow-xs">
                3 Levels Free
              </span>
            </div>
            <p className="text-xs text-white/95 mt-0.5 font-medium">
              Join 10,000+ scholars. Practice 3 complete curriculum levels free on any subject. No credit card or payment required.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenRegister}
          className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 hover:scale-[1.02] cursor-pointer whitespace-nowrap"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>SIGN UP FREE NOW &rarr;</span>
        </button>
      </div>

      {/* 2. BOARD HEADER HERO */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs"
          style={{ backgroundColor: track === 'CBSE' ? '#eef2ff' : (track === 'ICSE' ? '#eff6ff' : (track === 'CAMBRIDGE' ? '#faf5ff' : '#fffbeb')),
                   borderColor: track === 'CBSE' ? '#c7d2fe' : (track === 'ICSE' ? '#bfdbfe' : (track === 'CAMBRIDGE' ? '#e9d5ff' : '#fde68a')),
                   color: track === 'CBSE' ? '#4338ca' : (track === 'ICSE' ? '#1d4ed8' : (track === 'CAMBRIDGE' ? '#7e22ce' : '#b45309')) }}>
          <BookOpen className="w-4 h-4" />
          <span>{trackInfo.badge}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {trackInfo.title}
        </h1>

        <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-medium">
          {trackInfo.subtitle}
        </p>

        {/* Board Switcher Tabs (Seperate URLs) */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => onNavigate('CURRICULUM_CBSE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              track === 'CBSE'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            📘 CBSE Classes 1–12
          </button>
          <button
            onClick={() => onNavigate('CURRICULUM_ICSE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              track === 'ICSE'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            🏛️ ICSE / CISCE
          </button>
          <button
            onClick={() => onNavigate('CURRICULUM_CAMBRIDGE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              track === 'CAMBRIDGE'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            🌐 Cambridge IGCSE
          </button>
          <button
            onClick={() => onNavigate('CURRICULUM_OLYMPIAD')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              track === 'OLYMPIAD'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            🏆 Olympiad &amp; HOTS
          </button>
        </div>
      </section>

      {/* 3. INTERACTIVE SAMPLE QUESTIONS TEST DRIVE (CRUCIAL USER REQUEST) */}
      <section className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-xs">
                <Target className="w-3.5 h-3.5" />
                <span>Live Interactive Sample Questions</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Test Drive Free
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Try a Real {track === 'ALL' ? 'CBSE' : track} Sample Question
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Select your Class and Subject below to preview authentic questions from our 12,000-question syllabus bank.
            </p>
          </div>

          {/* Grade & Subject Selectors */}
          <div className="flex items-center gap-2">
            <select
              value={selectedGrade}
              onChange={e => setSelectedGrade(Number(e.target.value) as Grade)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
              aria-label="Select Class"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                <option key={g} value={g}>Class {g}</option>
              ))}
            </select>

            <select
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs uppercase"
              aria-label="Select Subject"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* The Question Card */}
        {currentQ ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-mono font-bold text-indigo-700 uppercase bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                {currentQ.board} • Class {currentQ.grade} • {(currentQ.subjectId || selectedSubjectId).toUpperCase()} • {currentQ.topicTag || 'Core Chapter'}
              </span>
              <span className="font-bold">
                Sample Question {currentSampleIndex + 1} of {sampleQuestions.length}
              </span>
            </div>

            <div className="p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {currentQ.text}
              </p>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let btnStyle = 'bg-white hover:bg-indigo-50/50 border-slate-200 text-slate-800 shadow-xs';
                if (showFeedback) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-400/40';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-2 ring-rose-400/40';
                  } else {
                    btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={showFeedback}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start space-x-3 cursor-pointer ${btnStyle}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-xs sm:text-sm font-medium pt-0.5 leading-snug flex-1">
                      {opt}
                    </span>
                    {showFeedback && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 ml-auto" />
                    )}
                    {showFeedback && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Explanation Box */}
            {showFeedback && (
              <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {selectedOption === currentQ.correctIndex ? (
                      <span className="flex items-center space-x-1.5 text-emerald-700 font-bold text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Brilliant! That is the correct answer. 🎉</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1.5 text-rose-700 font-bold text-xs sm:text-sm">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Not quite right, but every mistake is a chance to learn!</span>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleNextSample}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Try Next Sample</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed pt-2 border-t border-indigo-100">
                  <strong className="text-slate-900 block mb-1">💡 Step-by-Step Explanation:</strong>
                  <p>{currentQ.explanation}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <p>Loading curriculum sample questions...</p>
          </div>
        )}

        {/* 4. BEG FOR FREE SIGNUP CALLOUT (DIRECTLY TIED TO SAMPLE QUESTION EXPERIENCE) */}
        <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <span className="text-xs font-black uppercase text-amber-800 tracking-wider">
                🚀 Want to solve the full 12,000 Questions?
              </span>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                100% Free
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900">
              Sign Up Now &amp; Unlock 3 Full Levels for FREE!
            </h3>
            <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
              Do not get stuck on boring PDFs. Enjoy 1-on-1 Socratic Nova AI hints, earn real Study Coins on every question, and redeem them for real gifts. No credit card required.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center space-x-2 hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>CREATE FREE ACCOUNT (FREE 3 LEVELS)</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. CURRICULUM SYLLABUS HIGHLIGHTS */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Why AcademicLevel Leads {track === 'ALL' ? 'Indian' : track} Education
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Engineered from ground up with cognitive science, adaptive algorithms, and syllabus verification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trackInfo.features.map((feat, idx) => (
            <div key={idx} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs">
                ✓
              </div>
              <p className="text-xs font-bold text-slate-900 leading-snug">{feat}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SUBJECT CATALOGUE PREVIEW FOR THIS BOARD */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Classes 1–12 Subjects for {activeBoard}
            </h2>
            <p className="text-xs text-slate-600">
              Each subject contains 4 difficulty stages: Foundation, Conceptual, Exam PYQs &amp; Olympiad HOTS.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map(s => {
            const levels = CurriculumService.getLevels(activeBoard, selectedGrade, s.id);
            return (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center text-2xl mb-4">
                    {s.icon}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">{s.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{s.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      4 Progression Nodes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {levels.map(l => (
                        <span
                          key={l.node}
                          className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10px] text-indigo-700 font-mono font-bold"
                        >
                          {l.node}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => {
                      setSelectedSubjectId(s.id);
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Try Sample {s.name} Questions &uarr;</span>
                  </button>

                  <button
                    onClick={onOpenRegister}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <span>Enroll Free in {s.name} (3 Levels Free)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. BOTTOM URGENT CALL TO ACTION (BEG FOR FREE SIGNUP) */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-amber-50 border-2 border-indigo-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>ZERO RISK • NO CREDIT CARD • 100% FREE STARTER</span>
        </div>

        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Ready to Dominate Your School Exams?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Sign up in 10 seconds. You get instant access to 3 complete curriculum levels across Mathematics, Science, Computer Science, English, and Social Studies.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={onOpenRegister}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center space-x-2 hover:scale-[1.02] cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span>CREATE FREE STUDENT ACCOUNT NOW</span>
          </button>

          <button
            onClick={() => onNavigate('PRICING')}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm rounded-2xl transition-all flex items-center justify-center shadow-xs cursor-pointer"
          >
            Compare Upgrades (From ₹49)
          </button>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>3 Levels Free Forever</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Socratic Nova AI Guidance</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Real Earnable Physical Gifts</span>
          </div>
        </div>
      </section>
    </div>
  );
};
