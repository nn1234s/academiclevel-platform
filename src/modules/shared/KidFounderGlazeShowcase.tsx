import React, { useState } from 'react';
import { Award, Sparkles, ShieldCheck, CheckCircle2, Terminal, Code, Cpu, ExternalLink, X, ZoomIn } from 'lucide-react';

interface KidFounderGlazeShowcaseProps {
  theme?: 'dark' | 'light';
  variant?: 'full' | 'compact';
}

export const KidFounderGlazeShowcase: React.FC<KidFounderGlazeShowcaseProps> = ({
  theme = 'dark',
  variant = 'full'
}) => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string; subtitle: string } | null>(null);

  const isDark = theme === 'dark';

  const certificates = [
    {
      id: 'iit-bombay',
      title: 'IIT Bombay Mood Indigo Coding Project',
      badge: '🏛️ IIT Bombay Certified',
      subtitle: 'Young Animator & Software Builder — STEM.org Accredited',
      desc: 'Officially certified in competitive coding and interactive application architecture under the prestigious IIT Bombay Mood Indigo National Coding Project.',
      image: '/founder-certs/iit-bombay-cert.jpg',
      tags: ['IIT Bombay', 'Mood Indigo', 'STEM.org Accredited', 'Google / Amazon Alumni Evaluated'],
      accent: 'from-amber-500/20 via-orange-500/10 to-amber-500/5',
      borderAccent: 'border-amber-500/60'
    },
    {
      id: 'python-dsa',
      title: 'Python, Algorithms & Game Dev Specialization',
      badge: '🐍 4x Python & Web Credentials',
      subtitle: 'Python Developer • Intermediate DSA • Pygame Engine • Web Dev',
      desc: 'Formally mastered Object-Oriented Programming, Data Structures, Time Complexity, Recursion, Bit Manipulation, and GUI Game Engines with Tkinter & Pygame.',
      image: '/founder-certs/coding-certs-python.jpg',
      tags: ['Python Developer', 'DSA & Algorithms', 'Pygame Space Invaders', 'Junior Web Dev'],
      accent: 'from-indigo-500/20 via-blue-500/10 to-indigo-500/5',
      borderAccent: 'border-indigo-500/60'
    },
    {
      id: 'apps-logic',
      title: 'App Architecture & Algorithmic Logic Suite',
      badge: '📱 4x App & Animation Credentials',
      subtitle: 'App Lab Developer • Game Lab Developer • Junior Animator • Rising Star',
      desc: 'Engineered event-driven UI systems, database integration, block-to-text algorithm pipelines, and STEM logic architecture across 100+ projects.',
      image: '/founder-certs/coding-certs-apps.jpg',
      tags: ['App Lab Database', 'Game Lab Physics', 'Play Lab Animation', 'STEM Logic Star'],
      accent: 'from-emerald-500/20 via-teal-500/10 to-emerald-500/5',
      borderAccent: 'border-emerald-500/60'
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
          <span className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5 text-slate-950" />
            <span>Literal IIT Bombay Certified Kid Founder</span>
          </span>

          <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider border ${
            isDark ? 'bg-indigo-950/80 border-indigo-700/80 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-800'
          }`}>
            🛡️ STEM.org Accredited • Grade 5 Prodigy
          </span>

          <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider border ${
            isDark ? 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            ⭐ 8x Coding &amp; Software Credentials
          </span>
        </div>

        <h2 className={`text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight ${
          isDark ? 'text-white' : 'text-slate-950'
        }`}>
          Built by a Kid for Kids.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300">
            Certified by IIT Bombay.
          </span>
        </h2>

        <p className={`text-xs sm:text-sm sm:leading-relaxed max-w-3xl mx-auto font-medium ${
          isDark ? 'text-slate-300' : 'text-slate-700'
        }`}>
          Most education platforms are created by corporate executives who never sat in your child’s classroom.
          <strong> AcademicLevel is completely different:</strong> it was coded, designed, and architected by a <strong>10-year-old Grade 5 student prodigy</strong> with 8+ formal software engineering certifications in Python, Data Structures &amp; Algorithms, Game Engines, and Full-Stack Development — verified by <strong>IIT Bombay Mood Indigo</strong> and <strong>STEM.org</strong>.
        </p>

        <div className={`p-4 rounded-2xl border text-xs italic max-w-2xl mx-auto ${
          isDark ? 'bg-slate-950/60 border-slate-800 text-amber-300/90' : 'bg-white border-amber-200 text-amber-900'
        }`}>
          &quot;Adults build platforms to test and stress you out. We built AcademicLevel so studying feels like leveling up your favorite game — fast hints, instant coin rewards, and zero boring lectures.&quot;
        </div>
      </div>

      {/* 3 Featured Credentials Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        {certificates.map(cert => (
          <div
            key={cert.id}
            className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:scale-[1.02] shadow-xl ${
              isDark
                ? `bg-slate-950/80 ${cert.borderAccent} hover:border-amber-400`
                : `bg-white ${cert.borderAccent} hover:border-amber-500`
            }`}
          >
            <div>
              {/* Image Preview with Zoom Overlay */}
              <div
                onClick={() => setSelectedImage({ src: cert.image, title: cert.title, subtitle: cert.subtitle })}
                className="relative overflow-hidden cursor-pointer bg-slate-950 aspect-[4/3] flex items-center justify-center border-b border-slate-800/80 group"
              >
                <img
                  src={cert.image}
                  alt={cert.title}
                  className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 text-white text-xs font-bold backdrop-blur-[2px]">
                  <ZoomIn className="w-4 h-4 text-amber-300" />
                  <span>Click to Inspect Certificate</span>
                </div>

                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/75 backdrop-blur-md text-amber-300 border border-amber-400/40">
                  {cert.badge}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-2.5">
                <h3 className={`text-base font-extrabold leading-snug ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}>
                  {cert.title}
                </h3>

                <p className={`text-[11px] font-bold text-amber-400`}>
                  {cert.subtitle}
                </p>

                <p className={`text-xs leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  {cert.desc}
                </p>
              </div>
            </div>

            {/* Tags Footer */}
            <div className={`p-4 pt-3 border-t text-[10px] flex flex-wrap gap-1.5 ${
              isDark ? 'border-slate-800/80 bg-slate-900/50' : 'border-slate-100 bg-slate-50'
            }`}>
              {cert.tags.map(t => (
                <span
                  key={t}
                  className={`px-2 py-0.5 rounded-md font-mono font-medium ${
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-white border border-slate-200 text-slate-700'
                  }`}
                >
                  ✓ {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 8-Credential Quick Bar */}
      <div className={`mt-10 rounded-2xl p-5 border text-center relative z-10 ${
        isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400 block mb-3">
          🎓 Complete Verification Roster (Grade 5 Coding Credentials)
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] font-bold">
          <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            🏛️ IIT Bombay Mood Indigo Certified
          </span>
          <span className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
            🐍 Python Developer (OOP &amp; Data Structures)
          </span>
          <span className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300">
            ⚡ Intermediate Python Programmer (DSA &amp; Recursion)
          </span>
          <span className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
            🎮 Python Game Developer (Pygame Engine)
          </span>
          <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            🌐 Junior Web Developer (HTML5/CSS3)
          </span>
          <span className="px-3 py-1 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300">
            📱 Junior App Lab Developer (Databases)
          </span>
          <span className="px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
            🕹️ Junior Game Lab Developer (Physics)
          </span>
          <span className="px-3 py-1 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300">
            ⭐ Rising Coding Star (STEM.org)
          </span>
        </div>
      </div>

      {/* Interactive Modal Zoom */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="max-w-4xl w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl relative space-y-4"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                Verified Certificate Credentials
              </span>
              <h3 className="text-xl font-black text-white">{selectedImage.title}</h3>
              <p className="text-xs text-amber-300 font-medium">{selectedImage.subtitle}</p>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Student privacy protected. All certifications verified by STEM.org and respective institutional issuing authorities.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
