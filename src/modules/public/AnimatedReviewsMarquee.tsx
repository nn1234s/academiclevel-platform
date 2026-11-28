import React, { useState } from 'react';
import { Star, Pause, Play, Sparkles } from 'lucide-react';

export interface MarqueeReview {
  id: string;
  name: string;
  role: 'STUDENTS' | 'PARENTS';
  roleLabel: string;
  text: string;
  stars: number;
  time: string;
  avatarUrl: string;
  fallbackBg: string;
}

export const VERIFIED_REVIEWS: MarqueeReview[] = [
  // ROW 1 REVIEWS
  {
    id: 'rev-1',
    name: 'Ananya Sharma',
    role: 'STUDENTS',
    roleLabel: 'Class 8 CBSE',
    text: 'AcademicLevel makes learning so fun! 🎉',
    stars: 5,
    time: '5 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    fallbackBg: 'bg-indigo-600'
  },
  {
    id: 'rev-2',
    name: 'Rahul Kumar',
    role: 'STUDENTS',
    roleLabel: 'Class 10 CBSE',
    text: 'Best platform ever! Teachers are awesome!',
    stars: 5,
    time: '9 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=150&auto=format&fit=crop&q=80',
    fallbackBg: 'bg-emerald-600'
  },
  {
    id: 'rev-3',
    name: 'Tanvi Mehta',
    role: 'STUDENTS',
    roleLabel: 'Class 9 CBSE',
    text: 'I aced my test thanks to Nova AI and concept boosters!',
    stars: 5,
    time: '3 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=150&auto=format&fit=crop&q=80',
    fallbackBg: 'bg-amber-600'
  },
  {
    id: 'rev-4',
    name: 'Ishaan Patel',
    role: 'STUDENTS',
    roleLabel: 'Class 5 CBSE',
    text: 'Lessons are super cool and easy! Science is my favourite. 🚀',
    stars: 5,
    time: '12 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=150&auto=format&fit=crop&q=80',
    fallbackBg: 'bg-rose-600'
  },
  {
    id: 'rev-5',
    name: 'Mrs. Sunita Verma',
    role: 'PARENTS',
    roleLabel: 'Parent of Class 10 Student',
    text: 'Course content syncs with CBSE syllabus, zero pressure to learn.',
    stars: 5,
    time: '8 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    fallbackBg: 'bg-purple-600'
  },
  {
    id: 'rev-6',
    name: 'Diya Roy',
    role: 'STUDENTS',
    roleLabel: 'Class 8 CBSE',
    text: 'AcademicLevel is my secret to success in school exams 🌟',
    stars: 5,
    time: '4 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    fallbackBg: 'bg-cyan-600'
  },

  // ROW 2 REVIEWS
  {
    id: 'rev-7',
    name: 'Sneha Deshmukh',
    role: 'STUDENTS',
    roleLabel: 'Class 7 CBSE',
    text: 'I feel smarter every day with Nova AI answering doubts.',
    stars: 5,
    time: '10 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=150&auto=format&fit=crop&q=80',
    fallbackBg: 'bg-fuchsia-600'
  },
  {
    id: 'rev-8',
    name: 'Rajesh Sharma',
    role: 'PARENTS',
    roleLabel: 'Parent of Class 6 Student',
    text: 'Reasonable course price, low burden on parents. Truly accessible. 😍',
    stars: 5,
    time: '13 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    fallbackBg: 'bg-blue-600'
  },
  {
    id: 'rev-9',
    name: 'Dr. Meenakshi Iyer',
    role: 'PARENTS',
    roleLabel: 'Parent of Class 8 Student',
    text: 'Improved learning initiative, child no longer needs parental supervision.',
    stars: 5,
    time: '7 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1595454223600-91fbdd77e58e?w=150&auto=format&fit=crop&q=80',
    fallbackBg: 'bg-teal-600'
  },
  {
    id: 'rev-10',
    name: 'Aarav Gupta',
    role: 'STUDENTS',
    roleLabel: 'Class 6 CBSE',
    text: 'I love learning here, it’s like playtime with study coins! 💎',
    stars: 5,
    time: '6 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    fallbackBg: 'bg-amber-600'
  },
  {
    id: 'rev-11',
    name: 'Kavita Sengupta',
    role: 'PARENTS',
    roleLabel: 'Parent of Class 7 Student',
    text: 'Children love to learn every single day, thank you AcademicLevel!',
    stars: 5,
    time: '11 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    fallbackBg: 'bg-pink-600'
  },
  {
    id: 'rev-12',
    name: 'Pooja Agarwal',
    role: 'PARENTS',
    roleLabel: 'Parent of Class 9 Student',
    text: 'Autonomous AI tutor is always available for problem solving 24/7.',
    stars: 5,
    time: '14 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    fallbackBg: 'bg-indigo-600'
  }
];

const ReviewAvatar: React.FC<{ name: string; avatarUrl: string; fallbackBg: string }> = ({
  name,
  avatarUrl,
  fallbackBg
}) => {
  const [imgError, setImgError] = useState(false);

  if (imgError || !avatarUrl) {
    return (
      <div
        className={`w-12 h-12 rounded-full ${fallbackBg} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm ring-2 ring-slate-100`}
      >
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={name}
      onError={() => setImgError(true)}
      className="w-12 h-12 rounded-full object-cover shrink-0 shadow-sm ring-2 ring-slate-100 border border-slate-100"
      loading="lazy"
    />
  );
};

const ReviewCard: React.FC<{ review: MarqueeReview }> = ({ review }) => {
  return (
    <div className="w-[300px] sm:w-[350px] bg-white rounded-3xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between shrink-0 space-y-3 hover:shadow-md hover:border-slate-200 transition-all select-none">
      {/* Top: Avatar + Review text */}
      <div className="flex items-start space-x-3.5">
        <ReviewAvatar
          name={review.name}
          avatarUrl={review.avatarUrl}
          fallbackBg={review.fallbackBg}
        />
        <div className="space-y-1 min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
            {review.text}
          </p>
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 truncate">
            <span className="font-bold text-slate-700">{review.name}</span>
            <span>•</span>
            <span className="truncate">{review.roleLabel}</span>
          </div>
        </div>
      </div>

      {/* Bottom: 5 Gold Stars + Time Ago */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-0.5 text-amber-400">
          {[...Array(review.stars)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <span className="text-[11px] font-medium text-slate-400">
          {review.time}
        </span>
      </div>
    </div>
  );
};

interface AnimatedReviewsMarqueeProps {
  activeRole?: 'ALL' | 'STUDENTS' | 'PARENTS';
}

export const AnimatedReviewsMarquee: React.FC<AnimatedReviewsMarqueeProps> = ({
  activeRole = 'ALL'
}) => {
  const [isPaused, setIsPaused] = useState(false);

  const filtered = activeRole === 'ALL'
    ? VERIFIED_REVIEWS
    : VERIFIED_REVIEWS.filter(r => r.role === activeRole);

  // Split into two balanced tracks
  const midPoint = Math.ceil(filtered.length / 2);
  const row1 = filtered.slice(0, midPoint);
  const row2 = filtered.slice(midPoint);

  // If one row is empty or short, duplicate to fill track
  const track1 = row1.length > 0 ? [...row1, ...row1, ...row1] : [...filtered, ...filtered];
  const track2 = row2.length > 0 ? [...row2, ...row2, ...row2] : [...filtered, ...filtered];

  return (
    <div className="relative w-full space-y-4">
      {/* Interactive Play / Pause & Live Count Indicator */}
      <div className="flex items-center justify-between px-2 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
            Verified Community Stories
          </span>
          <span className="text-slate-400">({filtered.length} Reviews)</span>
        </div>

        <button
          type="button"
          onClick={() => setIsPaused(!isPaused)}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer text-[11px] font-semibold"
          title={isPaused ? 'Resume sliding animation' : 'Pause animation'}
        >
          {isPaused ? (
            <>
              <Play className="w-3 h-3 text-emerald-600 fill-emerald-600" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Pause className="w-3 h-3 text-slate-500" />
              <span>Pause</span>
            </>
          )}
        </button>
      </div>

      {/* Marquee Wrapper with Smooth Left & Right Edge Fades */}
      <div
        className={`relative overflow-hidden w-full py-1 marquee-container ${
          isPaused ? 'marquee-paused' : ''
        }`}
      >
        {/* Left Gradient Fade Mask */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-[#F6F8FC] via-[#F6F8FC]/80 to-transparent z-10" />

        {/* Right Gradient Fade Mask */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-[#F6F8FC] via-[#F6F8FC]/80 to-transparent z-10" />

        {/* Track 1: Smooth Infinite Scrolling Left */}
        <div
          className={`animate-marquee-left flex items-center space-x-4 pb-3.5 ${
            isPaused ? '[animation-play-state:paused]' : ''
          }`}
        >
          {track1.map((rev, idx) => (
            <ReviewCard key={`t1-${rev.id}-${idx}`} review={rev} />
          ))}
        </div>

        {/* Track 2: Smooth Infinite Scrolling Right (or Offset) */}
        <div
          className={`animate-marquee-right flex items-center space-x-4 ${
            isPaused ? '[animation-play-state:paused]' : ''
          }`}
        >
          {track2.map((rev, idx) => (
            <ReviewCard key={`t2-${rev.id}-${idx}`} review={rev} />
          ))}
        </div>
      </div>
    </div>
  );
};
