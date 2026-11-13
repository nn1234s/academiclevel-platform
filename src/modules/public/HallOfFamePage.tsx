import React from 'react';
import { ArrowLeft, ShieldCheck, Mail, ExternalLink } from 'lucide-react';

interface HallOfFamePageProps {
  onNavigateHome?: () => void;
}

export const HallOfFamePage: React.FC<HallOfFamePageProps> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 rounded-3xl my-4">
      <div className="max-w-[720px] mx-auto">
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center space-x-1.5 text-blue-600 hover:text-blue-800 font-semibold text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to AcademicLevel Home</span>
          </button>
        )}

        <header className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Security Hall of Fame</h1>
          <p className="text-slate-600 text-base max-w-xl mx-auto">
            A big thank you to the security researchers who helped keep our students and platform safe.
          </p>
        </header>

        {/* Responsible Disclosure Box */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 text-[0.95rem] shadow-xs">
          <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center space-x-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span>Responsible Disclosure</span>
          </h2>
          <p className="text-slate-600 leading-relaxed">
            We value the security of our learning community. If you discover a technical vulnerability on our platform,
            please report it responsibly to{' '}
            <a
              href="mailto:securityacademiclevels@gmail.com"
              className="text-blue-600 font-semibold hover:underline"
            >
              securityacademiclevels@gmail.com
            </a>{' '}
            before disclosing it publicly. Valid high-impact reports are recognized below.
          </p>
        </section>

        {/* 2026 Year Section */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-blue-600 border-b-2 border-slate-200 pb-2 mb-4">
            2026
          </h2>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-blue-300 transition-all">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Prabir Kumar Nanda</h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[0.95rem]">
                <li>Authentication and login flow vulnerabilities</li>
                <li>Password security and recovery flaws</li>
                <li>Quiz scoring and answer counting logic bugs</li>
              </ul>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:border-blue-300 transition-all">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Preetish Priyadarshini</h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 text-[0.95rem]">
                <li>Multiple core application code and logic vulnerabilities</li>
              </ul>
            </div>
          </div>
        </section>

        <footer className="text-center mt-12 pt-6 border-t border-slate-200 text-sm text-slate-500">
          <p>Note: We currently offer public recognition only and do not run a paid cash bounty program.</p>
        </footer>
      </div>
    </div>
  );
};
