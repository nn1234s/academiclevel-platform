import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const FAQS: FAQItem[] = [
  {
    q: 'What is included in the Concept Booster plan?',
    a: 'Every student receives 60 days of full, unlimited adaptive AI quizzes across all subjects. To unlock extended access, Olympiad mock tests, verified parent analytics, and 1-on-1 Socratic tutoring, you can upgrade to PLUS (₹129 for 180 days). Your certificates, coin balances, and study profile remain 100% safe.'
  },
  {
    q: 'Which school boards are supported?',
    a: 'We fully support CBSE (Central Board of Secondary Education), ICSE/CISCE (Council for the Indian School Certificate Examinations), and Cambridge IGCSE across Classes 1 through 12.'
  },
  {
    q: 'How does the UPI QR payment work?',
    a: 'When you choose Lite or Plus, we generate a dynamic NPCI-compliant UPI QR code. Pay using any UPI app (GPay, PhonePe, Paytm, BHIM). Then enter your 12-digit bank UTR reference number. Our administrative team audits and activates your subscription directly.'
  },
  {
    q: 'Can I change my class after enrolling?',
    a: 'Yes, but to ensure fair curriculum use and prevent account sharing, students are allowed a maximum of 1 class change during an active Premium period and 1 class change post-expiry.'
  },
  {
    q: 'How do I earn Study Coins?',
    a: 'Coins are awarded through an append-only ledger: +25 Coins for mastering any distinct course level (with >= 70% accuracy and passing the anti-cheat timer), +40 Coins when an invited friend registers and finishes their first quiz, and daily spin wheel rewards.'
  },
  {
    q: 'What is Nova AI Tutor?',
    a: 'Nova is our built-in Socratic AI coach. Instead of just giving away answers, Nova asks guiding questions, diagnoses conceptual mistakes, and adapts to your age tier (playful for primary, exam-focused for high school).'
  },
  {
    q: 'What if my internet connection is slow or drops?',
    a: 'AcademicLevel features an Offline Question Bank that synchronizes to your browser. If AI response time exceeds 2,500ms or your network is slow, it seamlessly serves verified offline questions without interrupting your quiz.'
  }
];

export const FAQPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-slate-100 py-6 px-4">
      <div className="text-center">
        <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
          Frequently Asked Questions
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-2">
          Everything You Need to Know
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Clear answers regarding curriculum, quotas, UPI payments, and anti-cheat policies.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow-md"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-indigo-300 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transform transition-transform ${
                    isOpen ? 'rotate-180 text-indigo-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
