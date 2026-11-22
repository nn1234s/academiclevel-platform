import React from 'react';
import { Award, ShieldCheck, CheckCircle2, BookOpen, GraduationCap, Sparkles } from 'lucide-react';

interface KidFounderGlazeShowcaseProps {
  theme?: 'dark' | 'light';
  variant?: 'full' | 'compact';
}

export const KidFounderGlazeShowcase: React.FC<KidFounderGlazeShowcaseProps> = ({
  theme = 'dark',
  variant = 'full'
}) => {
  const isDark = theme === 'dark';

  const curriculumHighlights = [
    {
      id: 'cbse-standard',
      title: 'CBSE & NCERT Aligned',
      badge: '📘 National Curriculum',
      subtitle: 'Classes 1–12 • NEP 2020 Competency Framework',
      desc: 'Carefully indexed chapter-wise assessments calibrated to the National Curriculum Framework and latest board marking schemes.',
      accent: 'from-indigo-500/20 via-blue-500/10 to-indigo-500/5',
      borderAccent: 'border-indigo-500/60'
    },
    {
      id: 'icse-standard',
      title: 'ICSE / CISCE Standards',
      badge: '🏛️ Rigorous Analytics',
      subtitle: 'Application-Oriented Analytical Problem Sets',
      desc: 'In-depth problem solving, structured step-marking rubrics, and conceptual clarity across Mathematics and Science.',
      accent: 'from-blue-500/20 via-cyan-500/10 to-blue-500/5',
      borderAccent: 'border-blue-500/60'
    },
    {
      id: 'igcse-standard',
      title: 'Cambridge IGCSE Curriculum',
      badge: '🌐 Global Benchmark',
      subtitle: 'Critical Thinking • Inquiry-Based Questions',
      desc: 'Benchmarked international inquiry modules emphasizing higher-order thinking skills, experimental design, and reasoning.',
      accent: 'from-purple-500/20 via-pink-500/10 to-purple-500/5',
      borderAccent: 'border-purple-500/60'
    },
    {
      id: 'olympiad-standard',
      title: 'National & International Olympiads',
      badge: '🏆 Competitive Foundation',
      subtitle: 'IMO, NSO, NTSE & Regional Olympiads',
      desc: 'Higher-order thinking questions (HOTS) specifically created to train speed, pattern recognition, and logical problem solving.',
      accent: 'from-amber-500/20 via-yellow-500/10 to-amber-500/5',
      borderAccent: 'border-amber-500/60'
    },
    {
      id: 'socratic-ai',
      title: 'Socratic Nova AI Tutoring',
      badge: '🤖 Pedagogical AI',
      subtitle: 'Instant Hints • Step-by-Step Guidance',
      desc: 'Zero rote answers — Nova asks guiding Socratic questions that help students discover solutions through their own reasoning.',
      accent: 'from-emerald-500/20 via-teal-500/10 to-emerald-500/5',
      borderAccent: 'border-emerald-500/60'
    },
    {
      id: 'rewards-system',
      title: 'Verified Study Rewards',
      badge: '🎁 Tangible Milestones',
      subtitle: 'Physical Merchandise & Certified Awards',
      desc: 'Real rewards (stationery sets, smart gifts, books, and verified certificates) awarded only through genuine student effort.',
      accent: 'from-teal-500/20 via-cyan-500/10 to-teal-500/5',
      borderAccent: 'border-teal-500/60'
    }
  ];

  return (
    <section className={`relative rounded-3xl overflow-hidden transition-all ${
      isDark
        ? 'bg-gradient-to-b from-slate-900/90 via-slate-950 to-indigo-950/40 border border-slate-800 p-6 sm:p-12 shadow-2xl text-slate-100'
        : 'bg-gradient-to-b from-amber-50/50 via-white to-orange-50/40 border-2 border-amber-300/80 p-6 sm:p-12 shadow-2xl text-slate-900'
    }`}>
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badges & Hook */}
      <div className="relative z-10 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex flex-wrap items-center justify-center gap-2">
          <span className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md flex items-center space-x-1.5">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic Excellence &amp; Board Verification</span>
          </span>

          <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider border ${
            isDark ? 'bg-indigo-950/80 border-indigo-700/80 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}>
            🛡️ CBSE • ICSE • Cambridge IGCSE
          </span>
        </div>

        <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
          isDark ? 'text-white' : 'text-slate-950'
        }`}>
          Built for Students.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-300">
            Calibrated to Authentic Curriculum Standards.
          </span>
        </h2>

        <p className={`text-xs sm:text-sm sm:leading-relaxed max-w-3xl mx-auto font-medium ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          AcademicLevel delivers structured, chapter-by-chapter mastery. Every assessment is mapped strictly to national and international education boards, empowering students to build deep conceptual intuition and genuine academic confidence.
        </p>
      </div>

      {/* Curriculum & Academic Excellence Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
        {curriculumHighlights.map(item => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl border transition-all duration-300 bg-gradient-to-br ${item.accent} ${
              isDark ? 'border-slate-800 hover:border-indigo-500/50 bg-slate-900/60' : 'border-slate-200 hover:border-indigo-400 bg-white/80'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                isDark ? 'bg-slate-950/80 border-slate-700 text-indigo-300' : 'bg-slate-100 border-slate-200 text-indigo-700'
              }`}>
                {item.badge}
              </span>
            </div>

            <h3 className={`font-black text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {item.title}
            </h3>
            <p className={`text-[11px] font-semibold mt-0.5 ${isDark ? 'text-indigo-300/90' : 'text-indigo-600'}`}>
              {item.subtitle}
            </p>
            <p className={`text-xs mt-2.5 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
