import React, { useEffect, useState } from 'react';
import { Mail, ExternalLink, AlertCircle } from 'lucide-react';
import { SiteConfigService } from '../../services/siteConfigService';

interface LegalPageProps {
  pageType: 'PRIVACY' | 'TERMS' | 'SAFETY' | 'POLICIES';
}

export const LegalPages: React.FC<LegalPageProps> = ({ pageType }) => {
  const [legalConfig, setLegalConfig] = useState(() => SiteConfigService.getLegal());

  useEffect(() => {
    return SiteConfigService.subscribe(() => {
      setLegalConfig(SiteConfigService.getLegal());
    });
  }, []);
  useEffect(() => {
    if (pageType === 'TERMS') {
      document.getElementById('terms')?.scrollIntoView({ behavior: 'smooth' });
    } else if (pageType === 'SAFETY') {
      document.getElementById('children')?.scrollIntoView({ behavior: 'smooth' });
    } else if (pageType === 'PRIVACY') {
      document.getElementById('privacy')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [pageType]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-16">
      {/* Hero Header with Deep Violet Gradient */}
      <header className="bg-gradient-to-br from-[#180928] via-[#2e1065] to-[#3b0764] text-white py-12 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur-md text-xs font-bold tracking-wide text-white mb-4">
            <span className="text-amber-400 font-extrabold">A✦</span> AcademicLevel
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
            Policies &amp; Privacy
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-2xl leading-relaxed">
            Clear information for learners, parents and teachers about using AcademicLevel, how information is handled, and how to contact us.
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">
        {/* On this page Navigation Pills */}
        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
            On this page
          </h2>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'privacy', label: 'Privacy policy' },
              { id: 'children', label: 'Children & student safety' },
              { id: 'terms', label: 'Terms of use' },
              { id: 'acceptable', label: 'Acceptable use' },
              { id: 'ai', label: 'AI & learning disclaimer' },
              { id: 'payments', label: 'Premium, payments & ACodes' },
              { id: 'rewards', label: 'Coins & rewards' },
              { id: 'refunds', label: 'Refunds & complaints' },
              { id: 'changes', label: 'Policy changes' },
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => scrollToSection(pill.id)}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold transition-colors border border-indigo-100 cursor-pointer"
              >
                {pill.label}
              </button>
            ))}
          </div>
        </section>

        {/* Content Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-10 text-sm leading-relaxed text-slate-700">
          <div className="inline-block px-3 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold">
            Privacy Policy · Effective date: {legalConfig.lastUpdatedDate || 'November 2026'}
          </div>

          {/* 1. Privacy Policy */}
          <section id="privacy" className="space-y-4 pt-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              1. {legalConfig.privacyPolicyHeading || 'Privacy Policy'}
            </h2>
            {legalConfig.privacySummary && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs sm:text-sm text-indigo-950 font-medium leading-relaxed">
                <strong>Executive Summary:</strong> {legalConfig.privacySummary}
              </div>
            )}
            <p>
              AcademicLevel (&quot;AcademicLevel&quot;, &quot;we&quot;, &quot;us&quot;), operated by{' '}
              <a
                href="https://zingquark.academiclevel.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline font-semibold"
              >
                ZingQuark (ZQ Technology)
              </a>{' '}
              - UDYAM Reg: UDYAM-OD-19-0189385, provides online curriculum mastery learning, quizzes, courses, an AI study assistant called Nova, learner profiles, learning points, and paid membership subscription plans (Lite, Plus, 1-Year Gold VIP, and Institutional School Packs) required for active curriculum progression, unlimited practice, and verifiable certificates. Contact:{' '}
              <a href={`mailto:${legalConfig.contactEmail || 'academiclevels@gmail.com'}`} className="text-indigo-600 hover:underline font-medium">
                {legalConfig.contactEmail || 'academiclevels@gmail.com'}
              </a>.
            </p>

            <h3 className="text-base font-bold text-slate-900 mt-4">Information the service processes</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Account and sign-in information:</strong> account identifiers and the email address made available by the sign-in service, to authenticate you and associate your learner profile with your account.
              </li>
              <li>
                <strong>Learner profile:</strong> the learner name you enter, selected class/grade, learning coins, completed levels, quiz count, course progress and Premium plan/expiry information.
              </li>
              <li>
                <strong>Learning and AI inputs:</strong> when you use Nova or generate a quiz, the app sends the relevant prompt or learning request, class, subject, course/level details and, for Nova chat, recent conversation messages needed to answer.
              </li>
              <li>
                <strong>Device storage:</strong> the app uses browser local storage to remember settings and learning progress on the device. Some profile data is also saved to your signed-in AcademicLevel account so it can sync across devices.
              </li>
              <li>
                <strong>Support messages:</strong> if you email us, we receive the email address and the information you choose to include.
              </li>
            </ul>

            <div className="p-3.5 bg-slate-50 border-l-4 border-indigo-600 rounded-r-lg text-xs sm:text-sm text-slate-700 font-medium">
              <strong>Security Notice:</strong> Do not enter passwords, government ID numbers, home addresses, precise location, financial account details, or other highly sensitive information into learner profiles, quizzes or Nova chats.
            </div>

            <h3 className="text-base font-bold text-slate-900 mt-4">Why information is used</h3>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To sign you in, maintain your learner profile and sync progress.</li>
              <li>To provide grade-appropriate quizzes, courses, AI study responses, certificates and learning features.</li>
              <li>To maintain coins, plan status and ACode creation/redemption records.</li>
              <li>To respond to support, protect the service, troubleshoot errors and prevent misuse.</li>
            </ul>

            <h3 className="text-base font-bold text-slate-900 mt-4">Service providers, Turso Cloud Database &amp; Sharing</h3>
            <p>
              AcademicLevel uses high-reliability cloud hosting and managed Turso (libSQL) database infrastructure to operate the application and securely store user accounts, completed quizzes, subscriptions, coin balances, and gift requests with encryption-at-rest. Information necessary for these services is processed under enterprise data protection standards. We do not sell or trade personal user information. We may disclose information where required by law, to protect student safety, or enforce our terms of service.
            </p>

            <h3 className="text-base font-bold text-slate-900 mt-4">Storage, security and retention</h3>
            <p>
              We employ strict authentication guards, role-based access controls, and Turso cloud database encryption. User account details, learning progression, and subscription records are retained while the account is active. Non-essential client preferences are stored locally in browser storage. Account deletion via our dedicated flow permanently removes all user records from active cloud database tables.
            </p>

            <h3 className="text-base font-bold text-slate-900 mt-4">Your choices and requests</h3>
            <p>
              You or your parent/guardian may ask to access, correct or delete learner information, withdraw consent where applicable, or raise a privacy concern by emailing{' '}
              <a href="mailto:academiclevels@gmail.com" className="text-indigo-600 hover:underline font-medium">
                academiclevels@gmail.com
              </a>{' '}
              with the subject &quot;Privacy Request&quot;. Include the account email and enough detail to identify the request; do not send passwords or identity documents unless we specifically explain a safe and necessary process. We may need to verify authority before acting. We will respond within a reasonable time and handle requests under applicable law.
            </p>

            <h3 className="text-base font-bold text-slate-900 mt-4">Account &amp; Data Deletion (Google Play &amp; DPDP Policy Compliance)</h3>
            <p>
              In accordance with Google Play&apos;s Account Deletion Policy and applicable data protection regulations, users and guardians may request and execute permanent deletion of their account and all associated personal data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong>In-App Deletion:</strong> Authenticated learners can delete their account directly within the application under <strong>Profile &gt; Danger Zone &gt; Delete Account</strong>.
              </li>
              <li>
                <strong>Web Deletion Portal:</strong> Anyone who has created an account may initiate complete account and personal data deletion via our dedicated web URL at{' '}
                <a href="/delacc" className="text-indigo-600 hover:underline font-bold">
                  https://academiclevel.in/delacc
                </a>.
              </li>
            </ul>
            <p className="mt-2 text-xs text-slate-600">
              Upon account deletion, all profile data, learning records, quiz scores, certificates, and coin balances are permanently purged from active databases, and all login sessions are immediately revoked.
            </p>

            <h3 className="text-base font-bold text-slate-900 mt-4">Cookies and Analytics Technologies</h3>
            <p>
              AcademicLevel uses local browser storage for essential platform functionality, session persistence, and progress caching. Non-intrusive analytics cookies or anonymous metrics may be used to evaluate page performance and platform reliability without collecting personal student identities. You may adjust cookie preferences in your browser at any time without impacting basic quiz access.
            </p>
          </section>

          {/* 2. Children & Student Safety */}
          <section id="children" className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              2. Children &amp; Student Safety
            </h2>
            <p>
              AcademicLevel is intended for learning and should be used with parent, guardian or teacher awareness, especially by children.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Parents/guardians should review this policy, supervise account creation and use, and contact us about a child&apos;s account or personal information.</li>
              <li>Do not share personal contact details, school address, passwords, photos, precise location or private family information in Nova chats or public/support content.</li>
              <li>Nova is an automated study helper, not a person, counsellor, teacher replacement or emergency service. Do not rely on it for safety, health or other urgent decisions.</li>
              <li>
                If you believe a child&apos;s information has been submitted without appropriate permission, contact{' '}
                <a href="mailto:academiclevels@gmail.com" className="text-indigo-600 hover:underline font-medium">
                  academiclevels@gmail.com
                </a>{' '}
                so we can review the issue.
              </li>
              <li>All child safety safeguards have been implemented.</li>
            </ul>
          </section>

          {/* 3. Terms of Use */}
          <section id="terms" className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              3. Terms of Use
            </h2>
            <p>
              By accessing AcademicLevel, you agree to use it lawfully and follow these terms. If you are under the age of majority where you live, use the service with permission and supervision from a parent or guardian.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide a learner name and class that you are permitted to use. Keep sign-in credentials private.</li>
              <li>Use the service for personal educational purposes. Do not copy, resell, reverse engineer, disrupt or attempt to gain unauthorised access to the app or its systems.</li>
              <li>Do not impersonate another learner, manipulate progress or rewards, exploit bugs, or misuse ACodes.</li>
              <li>Features, question banks, AI responses, availability and pricing may change. We may suspend access where needed to protect users, the service or legal compliance.</li>
              <li>We aim for reliable access but do not guarantee uninterrupted availability, error-free content or compatibility with every device.</li>
              <li>These terms do not remove rights that cannot legally be excluded. Mandatory consumer and other applicable laws continue to apply.</li>
            </ul>
          </section>

          {/* 4. Acceptable Use */}
          <section id="acceptable" className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              4. Acceptable Use &amp; Community Safety
            </h2>
            <p>
              Do not use AcademicLevel to harass, threaten, bully, share hateful or sexually explicit material, cheat other users, distribute malware, probe systems without permission, or submit unlawful or harmful content. Do not use Nova to request dangerous instructions or to process another person&apos;s private information without permission. We may restrict accounts or report serious unlawful activity where appropriate.
            </p>
          </section>

          {/* 5. AI Disclaimer */}
          <section id="ai" className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              5. AI &amp; Educational Disclaimer
            </h2>
            <p>
              Nova and AI-generated quizzes can be inaccurate, incomplete, outdated or unsuitable for a particular syllabus. Check important answers against textbooks, teachers and trusted sources. AcademicLevel is a supplementary learning tool, not a substitute for formal teaching, assessment, professional advice or supervision. Do not use AI output as the sole basis for important decisions.
            </p>
          </section>

          {/* 6. Payments & ACodes */}
          <section id="payments" className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              6. {legalConfig.termsHeading || 'Premium Plans, Payments & ACodes'}
            </h2>
            {legalConfig.termsSummary && (
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                <strong>Terms Summary:</strong> {legalConfig.termsSummary}
              </div>
            )}
            <ul className="list-disc pl-5 space-y-2">
              <li>A paid subscription plan (AcademicLevel Lite ₹49, Plus ₹129, 1-Year Gold VIP ₹205) or an authorized school institutional A-Code voucher is mandatory to unlock complete daily quizzes, syllabus progression, verifiable certificates, and 24/7 Nova AI tutoring.</li>
              <li>AcademicLevel Lite is listed at ₹49 for 2 months (60 days); AcademicLevel Plus is listed at ₹129 for 6 months (180 days); AcademicLevel 1-Year Gold is listed at ₹205 for 365 days. The price and plan shown at checkout should be checked before paying.</li>
              <li>Payments are processed securely via our integrated UPI Payment Gateway (UPIPG) and authorized checkout links. A parent or guardian must supervise purchases by a child.</li>
              <li>Gateway transactions and payment confirmations are verified and recorded securely. Subscriptions activate instantly upon successful gateway completion or verified payment confirmation.</li>
              <li>ACodes are intended for one learner and one redemption. Treat a code like a voucher; do not publish it or share it with strangers. ACode creation in the app is not proof that payment was received.</li>
              <li>
                Keep your payment receipt. For an incorrect activation, duplicate payment or payment dispute, contact{' '}
                <a href={`mailto:${legalConfig.contactEmail || 'academiclevels@gmail.com'}`} className="text-indigo-600 hover:underline font-medium">
                  {legalConfig.contactEmail || 'academiclevels@gmail.com'}
                </a>{' '}
                with the plan, date and transaction reference. Never email a UPI PIN, OTP or password.
              </li>
            </ul>
          </section>

          {/* 7. Coins & Rewards */}
          <section id="rewards" className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              7. Learning Coins &amp; Rewards
            </h2>
            <p>
              Learning coins are in-app points, not cash, stored value, a bank balance or cryptocurrency. They cannot be withdrawn or transferred for money. Reward-store selections may create an email request rather than an automatically confirmed order. A request is not an order confirmation; availability, exact item, delivery details and any real-world payment must be confirmed separately by AcademicLevel. Ask a parent/guardian before requesting a physical reward or gift card.
            </p>
          </section>

          {/* 8. Refunds & Complaints */}
          <section id="refunds" className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              8. Refunds, Cancellations &amp; Complaints
            </h2>
            {legalConfig.refundPolicySummary && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed">
                <strong>Refund Policy Terms:</strong> {legalConfig.refundPolicySummary}
              </div>
            )}
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Full refunds are available within a strict <strong>20-minute window</strong> from the time of transaction for accidental purchases, incorrect plan selections, or duplicate payments. To claim a full refund, email{' '}
                <a href="mailto:academiclevels@gmail.com" className="text-indigo-600 hover:underline font-medium">
                  academiclevels@gmail.com
                </a>{' '}
                within 20 minutes of payment with your registered account email, plan details, and UPI transaction reference/UTR. Eligible requests submitted within the 20-minute window are processed for a 100% full refund.
              </li>
              <li>
                For privacy complaints, use the subject &quot;Privacy Complaint&quot;. We will acknowledge and review complaints and provide a response or next steps. You may also exercise rights or approach the appropriate authority as provided by applicable law.
              </li>
            </ul>
          </section>

          {/* 9. Policy Changes */}
          <section id="changes" className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              9. Changes to These Policies
            </h2>
            <p>
              We may update these policies when the app, providers or legal requirements change. The effective date at the top will be updated when a revised version is published. Please review this page periodically. Material changes may also be communicated through the app where appropriate.
            </p>
          </section>

          {/* Contact Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600" />
              Contact AcademicLevel
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              For privacy requests, parent/guardian questions, account deletion, payments, refunds, complaints or general support:
            </p>
            <div className="pt-1">
              <a
                href="mailto:academiclevels@gmail.com"
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                academiclevels@gmail.com
              </a>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Subject suggestion: Privacy Request / Parent Query / Payment Support
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200 text-xs">
              <a
                href="https://academiclevel.in/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-medium"
              >
                <span>Website: academiclevel.in</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
              AcademicLevel -{' '}
              <a
                href="https://zingquark.academiclevel.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline font-semibold"
              >
                ZingQuark (ZQ Technology)
              </a>{' '}
              - UDYAM Reg: UDYAM-OD-19-0189385
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
