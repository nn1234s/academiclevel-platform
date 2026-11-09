import React from 'react';
import { Sparkles, Target, ShieldCheck, Heart, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 text-slate-100 py-6 px-4">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
          Our Educational Mandate
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white mt-3 leading-tight">
          &quot;Learn in your era.&quot;
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
          Democratizing elite AI-guided academic mastery for every school student across India and overseas.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        <h2 className="text-xl font-bold text-white">The AcademicLevel Philosophy</h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Indian school education has historically been divided between two extremes: expensive coaching institutions charging lakhs of rupees, or rote textbook memorization that fails to build first-principles thinking.
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          AcademicLevel bridges this divide by embedding true <strong>Socratic Pedagogy</strong> into an age-adaptive interface. Whether a child is in Class 2 learning their first fractions or Class 12 preparing for Physics Board examinations, our AI engine adapts to their developmental stage.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
            <Target className="w-5 h-5 text-indigo-400 mb-2" />
            <h3 className="font-bold text-white text-xs">Curriculum Precision</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Zero off-syllabus noise. Everything maps strictly to CBSE, ICSE/CISCE, or Cambridge IGCSE.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="font-bold text-white text-xs">Child Safety First</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Compliant with the Digital Personal Data Protection (DPDP) Act 2023. Zero behavioral ad trackers.
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
            <Award className="w-5 h-5 text-amber-400 mb-2" />
            <h3 className="font-bold text-white text-xs">Effort-Backed Economy</h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Real rewards, tangible gift items, and verified certificates earned only through genuine effort.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
