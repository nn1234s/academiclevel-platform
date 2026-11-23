import React from 'react';
import { useLanguage } from '../../core/i18n/LanguageContext';
import { Globe, CheckCircle2, Sparkles, X } from 'lucide-react';

export const LanguagePreferenceModal: React.FC = () => {
  const { showPromptModal, setShowPromptModal, chooseLanguage, language } = useLanguage();

  if (!showPromptModal) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lang-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-200">
        {/* Top Decorative Gradient Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 p-6 text-white text-center relative">
          <button
            onClick={() => setShowPromptModal(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss language prompt"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md mx-auto flex items-center justify-center shadow-inner mb-3">
            <Globe className="w-6 h-6 text-white" />
          </div>

          <h2 id="lang-modal-title" className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Welcome to AcademicLevel?
          </h2>
          <p className="text-indigo-100 text-sm font-semibold mt-1">
            How you wanna see UI?
          </p>
        </div>

        {/* Content & Options */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 text-center">
            Choose your preferred interface language. You can change this anytime from the top navigation bar.
          </p>

          <div className="space-y-3 pt-1">
            {/* Option 1: Hindi (Hinglish UI) */}
            <button
              onClick={() => chooseLanguage('hi')}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group cursor-pointer ${
                language === 'hi'
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <span className="text-2xl p-2 rounded-xl bg-amber-50 border border-amber-200 shadow-xs">
                  🇮🇳
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Hindi
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      Hinglish UI
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                    Hinglish UI — Padhai, quizzes aur hints aasan conversational Hinglish mein
                  </p>
                </div>
              </div>
              <CheckCircle2
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  language === 'hi' ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-400'
                }`}
              />
            </button>

            {/* Option 2: English */}
            <button
              onClick={() => chooseLanguage('en')}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group cursor-pointer ${
                language === 'en'
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <span className="text-2xl p-2 rounded-xl bg-blue-50 border border-blue-200 shadow-xs">
                  🇬🇧
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      English
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      Standard
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                    Standard English interface and academic question bank
                  </p>
                </div>
              </div>
              <CheckCircle2
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  language === 'en' ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-400'
                }`}
              />
            </button>
          </div>

          <div className="pt-2 text-center">
            <span className="inline-flex items-center space-x-1 text-[11px] text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Questions, formulas and core terms adapt seamlessly</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
