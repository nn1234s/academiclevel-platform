import React from 'react';
import {
  BookOpen,
  School,
  CreditCard,
  Sparkles,
  Gift,
  ShieldCheck,
  Award,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  FileText,
  HelpCircle,
  Lock,
  UserX,
  Compass
} from 'lucide-react';

interface SitemapPageProps {
  onNavigate: (route: string, params?: any) => void;
}

interface SitemapSection {
  title: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
  items: {
    label: string;
    description: string;
    route?: string;
    externalHref?: string;
    pill?: string;
  }[];
}

export const SitemapPage: React.FC<SitemapPageProps> = ({ onNavigate }) => {
  const sections: SitemapSection[] = [
    {
      title: 'Curriculum & Academic Tracks',
      icon: BookOpen,
      description: 'Comprehensive K-12 learning modules mapped strictly to national and international boards.',
      badge: 'Classes 1–12',
      items: [
        {
          label: 'CBSE Curriculum (Classes 1–12)',
          description: 'NCERT-aligned Mathematics, Science, Social Sciences, and English adaptive quizzes.',
          route: 'PUBLIC_COURSES',
          pill: 'CBSE'
        },
        {
          label: 'ICSE / CISCE Curriculum',
          description: 'Rigorous application-oriented syllabi covering Classes 1 through 10.',
          route: 'PUBLIC_COURSES',
          pill: 'ICSE'
        },
        {
          label: 'Cambridge IGCSE Programme',
          description: 'International benchmarked critical thinking and problem-solving modules.',
          route: 'PUBLIC_COURSES',
          pill: 'IGCSE'
        },
        {
          label: 'Olympiad & Foundation Tracks',
          description: 'Advanced competitive exam practice (IMO, NSO, NTSE) for Classes 6–10.',
          route: 'PUBLIC_COURSES',
          pill: 'Foundations'
        },
        {
          label: 'Public Course Explorer',
          description: 'Browse all available grades, chapters, and topics without mandatory registration.',
          route: 'PUBLIC_COURSES'
        }
      ]
    },
    {
      title: 'Schools & Institutional Portal',
      icon: School,
      description: 'Turnkey enterprise packages and diagnostic dashboards for schools, teachers, and principals.',
      badge: 'Institution',
      items: [
        {
          label: 'Institutional School Pack (₹2,499)',
          description: 'Bulk enrollment for 100 students with full premium access and analytics.',
          route: 'SCHOOL_PORTAL',
          pill: '₹24.99/student'
        },
        {
          label: 'Teacher & Principal Dashboard',
          description: 'Class-wide real-time mastery heatmaps, weak topic diagnoses, and automated reports.',
          route: 'SCHOOL_PORTAL'
        },
        {
          label: 'Chapter-Aligned Worksheets',
          description: 'Printable and digital homework quizzes calibrated to CBSE and ICSE curricula.',
          route: 'SCHOOL_PORTAL'
        },
        {
          label: 'School Onboarding & Setup Guide',
          description: 'Assisted CSV roster upload, custom school badges, and teacher support desk.',
          route: 'SCHOOL_PORTAL'
        }
      ]
    },
    {
      title: 'Plans & Memberships',
      icon: CreditCard,
      description: 'Transparent, affordable pricing tiers designed for every student and family in India.',
      badge: 'Fair Pricing',
      items: [
        {
          label: 'Concept Booster Lite — ₹49',
          description: '60 days of full, unlimited adaptive AI quizzes across all subjects.',
          route: 'PRICING',
          pill: '60 Days'
        },
        {
          label: 'AcademicLevel Plus Pass — ₹129',
          description: '180 days access with Socratic Nova AI tutoring, Olympiad mocks, and parent analytics.',
          route: 'PRICING',
          pill: '180 Days'
        },
        {
          label: '1-Year Gold VIP Pass — ₹205',
          description: '365 days of full VIP access, maximum coin yield, and physical gift store eligibility.',
          route: 'PRICING',
          pill: 'Best Value'
        },
        {
          label: 'Direct UPI QR Verification',
          description: 'Instant NPCI-compliant payment via GPay, PhonePe, Paytm, or BHIM with UTR tracking.',
          route: 'PRICING'
        }
      ]
    },
    {
      title: 'AI & Learning Engine',
      icon: Sparkles,
      description: 'Next-generation educational technology built on Socratic pedagogy and cognitive mastery.',
      badge: 'Nova AI',
      items: [
        {
          label: 'Socratic Nova AI Coach',
          description: 'Dialogue-driven tutoring that asks guiding questions instead of spoon-feeding answers.',
          route: 'DASHBOARD'
        },
        {
          label: 'Daily Adaptive Quizzes',
          description: 'Dynamic difficulty scaling that challenges high performers and supports struggling learners.',
          route: 'DASHBOARD'
        },
        {
          label: 'Offline Question Bank',
          description: 'Seamless browser-cached fallback ensuring zero interruption even on slow networks.',
          route: 'FAQ'
        },
        {
          label: 'Certificate Verification Engine',
          description: 'Cryptographically verifiable, tamper-evident completion certificates (/verify).',
          route: 'VERIFY_CERTIFICATE',
          pill: '/verify'
        }
      ]
    },
    {
      title: 'Rewards & Physical Gift Store',
      icon: Gift,
      description: 'Real tangible physical rewards dispatched directly to students for consistent learning habits.',
      badge: 'Study Coins',
      items: [
        {
          label: 'Tangible Reward Storefront',
          description: 'Redeem Study Coins earned via quizzes for real dispatched merchandise.',
          route: 'STORE'
        },
        {
          label: 'Milton Insulated Flasks & Bottles',
          description: 'Premium stainless-steel temperature-retention bottles (2,500 Study Coins).',
          route: 'STORE',
          pill: '2,500 Coins'
        },
        {
          label: 'Original Pokémon Collector Cards',
          description: 'Sealed holographic collector packs for arcade & quiz milestones (4,500 Study Coins).',
          route: 'STORE',
          pill: '4,500 Coins'
        },
        {
          label: 'Faber-Castell Creative Art Kits',
          description: 'Complete student drawing and stationery sets dispatched to verified addresses.',
          route: 'STORE',
          pill: '1,800 Coins'
        }
      ]
    },
    {
      title: 'Legal, Privacy & Child Safety',
      icon: ShieldCheck,
      description: 'Strict adherence to Indian legal mandates, child protection laws, and data privacy.',
      badge: 'DPDP 2023',
      items: [
        {
          label: 'Privacy Policy & Data Security',
          description: 'Full DPDP Act 2023 compliance with zero commercial ad-tracking or data sales.',
          route: 'PRIVACY'
        },
        {
          label: 'Terms of Service & Fair Play',
          description: 'Rules of enrollment, anti-cheat mechanisms, and subscription policies.',
          route: 'TERMS'
        },
        {
          label: 'Child Safety & Minor Protocol',
          description: 'COPPA-aligned protective guardrails ensuring an ad-free, secure learning environment.',
          route: 'SAFETY'
        },
        {
          label: 'Google Play Mandated Account Deletion',
          description: 'Self-service immediate account and data erasure portal (/delacc).',
          route: 'ACCOUNT_DELETION',
          pill: '/delacc'
        }
      ]
    },
    {
      title: 'Company, Community & Recognition',
      icon: Award,
      description: 'Learn about our educational mission, public achievements, and community channels.',
      badge: 'About Us',
      items: [
        {
          label: 'Frequently Asked Questions (FAQ)',
          description: 'Comprehensive answers about boards, billing, coin economics, and syllabus.',
          route: 'FAQ'
        },
        {
          label: 'About AcademicLevel',
          description: 'Our educational mandate: "Learn in your era" — democratizing elite AI tutoring.',
          route: 'ABOUT'
        },
        {
          label: '#1 Most Innovative EdTech Award',
          description: 'Honored by EdTech Century for groundbreaking Socratic AI learning architecture.',
          route: 'INNOVATIVE_EDTECH',
          pill: 'EdTech Century'
        },
        {
          label: 'Security & Bug Bounty Hall of Fame',
          description: 'Honoring security researchers who responsibly report vulnerabilities.',
          route: 'HALL_OF_FAME',
          pill: '/halloffame'
        },
        {
          label: 'AcademicLevel on YouTube',
          description: 'Official video lectures, animated explanations, and exam preparation guides.',
          externalHref: 'https://youtube.com/academiclevels',
          pill: 'youtube.com/academiclevels'
        },
        {
          label: 'AcademicLevel on Instagram',
          description: 'Daily quiz challenges, student shoutouts, and study motivation reels.',
          externalHref: 'https://instagram.com/academiclevel1',
          pill: 'instagram.com/academiclevel1'
        }
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 text-slate-900 py-8 px-4 sm:px-6">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold tracking-wider uppercase shadow-xs">
          <Compass className="w-4 h-4 text-indigo-600" />
          <span>Platform Directory &amp; Sitemap</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          AcademicLevel Sitemap
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Explore all public sections of India&apos;s premier AI-powered K-12 educational platform. Discover curricula, school institutional packs, pricing plans, Socratic AI tools, and legal compliance documentation.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {sections.map((sec, secIdx) => {
          const Icon = sec.icon;
          return (
            <div
              key={secIdx}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:border-slate-300 hover:shadow-md transition-all group"
            >
              <div>
                {/* Section Header */}
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-105 group-hover:bg-indigo-100 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-wide">
                      {sec.title}
                    </h2>
                  </div>
                  {sec.badge && (
                    <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {sec.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                  {sec.description}
                </p>

                {/* Section Item List */}
                <div className="space-y-3">
                  {sec.items.map((item, itemIdx) => {
                    const isExternal = Boolean(item.externalHref);
                    return isExternal ? (
                      <a
                        key={itemIdx}
                        href={item.externalHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-white transition-all flex items-start justify-between gap-3 group/link block shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover/link:text-indigo-600 transition-colors">
                              {item.label}
                            </span>
                            {item.pill && (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold">
                                {item.pill}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            {item.description}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-indigo-600 flex-shrink-0 mt-1 transition-colors" />
                      </a>
                    ) : (
                      <button
                        key={itemIdx}
                        type="button"
                        onClick={() => item.route && onNavigate(item.route)}
                        className="w-full text-left p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-white transition-all flex items-start justify-between gap-3 group/btn cursor-pointer shadow-2xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 group-hover/btn:text-indigo-600 transition-colors">
                              {item.label}
                            </span>
                            {item.pill && (
                              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                                {item.pill}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            {item.description}
                          </p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-indigo-600 flex-shrink-0 mt-1 group-hover/btn:translate-x-0.5 transition-all" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & XML Sitemap Note */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Search Engine XML Sitemap</span>
          </h3>
          <p className="text-xs text-slate-600">
            For search engines and web crawlers, our machine-readable sitemap is indexed at <span className="font-mono text-indigo-700">/sitemap.xml</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-800 transition-all shadow-xs"
          >
            <span>View sitemap.xml</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={() => onNavigate('PRICING')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
          >
            <span>Explore Plans</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;
