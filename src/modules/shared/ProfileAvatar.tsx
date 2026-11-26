import React, { useEffect, useState } from 'react';
import { Learner } from '../../core/types';

export const PRESET_EMOJI_PFPS = [
  { emoji: '🦁', label: 'Lion' },
  { emoji: '🐯', label: 'Tiger' },
  { emoji: '🦊', label: 'Fox' },
  { emoji: '🐼', label: 'Panda' },
  { emoji: '🦄', label: 'Unicorn' },
  { emoji: '🦅', label: 'Eagle' },
  { emoji: '🐺', label: 'Wolf' },
  { emoji: '🐨', label: 'Koala' },
  { emoji: '🐸', label: 'Frog' },
  { emoji: '🐙', label: 'Octopus' },
  { emoji: '🚀', label: 'Rocket' },
  { emoji: '⚡', label: 'Spark' },
  { emoji: '👑', label: 'Crown' },
  { emoji: '🎓', label: 'Scholar' },
  { emoji: '🌟', label: 'Star' },
  { emoji: '🤖', label: 'Robo' }
] as const;

export const LOCAL_PFP_EVENT = 'al-pfp-updated';

export function getLocalCustomPfpKey(learnerId: string): string {
  return `al_custom_pfp_${learnerId}`;
}

export function getLocalCustomPfp(learnerId?: string): string | null {
  if (!learnerId || typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(getLocalCustomPfpKey(learnerId));
  } catch {
    return null;
  }
}

export function setLocalCustomPfp(learnerId: string, dataUrl: string | null): void {
  if (typeof window === 'undefined') return;
  const key = getLocalCustomPfpKey(learnerId);
  if (dataUrl) {
    window.localStorage.setItem(key, dataUrl);
  } else {
    window.localStorage.removeItem(key);
  }
  window.dispatchEvent(new CustomEvent(LOCAL_PFP_EVENT, { detail: { learnerId } }));
}

export function parseEmojiPfp(avatarFrame?: string | null): string | null {
  if (!avatarFrame) return null;
  if (avatarFrame.startsWith('emoji:')) {
    return avatarFrame.slice(6) || null;
  }
  return null;
}

interface ProfileAvatarProps {
  learner: Pick<Learner, 'id' | 'fullName' | 'avatarFrame'>;
  sizeClass?: string;
  textClass?: string;
  roundedClass?: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  learner,
  sizeClass = 'w-16 h-16',
  textClass = 'text-2xl',
  roundedClass = 'rounded-2xl'
}) => {
  const [localPhoto, setLocalPhoto] = useState<string | null>(() => getLocalCustomPfp(learner.id));

  useEffect(() => {
    setLocalPhoto(getLocalCustomPfp(learner.id));
    const onPfpUpdate = (e: Event) => {
      const detail = (e as CustomEvent<{ learnerId?: string }>).detail;
      if (!detail?.learnerId || detail.learnerId === learner.id) {
        setLocalPhoto(getLocalCustomPfp(learner.id));
      }
    };
    window.addEventListener(LOCAL_PFP_EVENT, onPfpUpdate);
    return () => window.removeEventListener(LOCAL_PFP_EVENT, onPfpUpdate);
  }, [learner.id]);

  if (localPhoto) {
    return (
      <img
        src={localPhoto}
        alt={`${learner.fullName} profile`}
        className={`${sizeClass} ${roundedClass} object-cover border border-indigo-400/40 shadow-md shrink-0`}
      />
    );
  }

  const emoji = parseEmojiPfp(learner.avatarFrame);
  if (emoji) {
    return (
      <div
        className={`${sizeClass} ${roundedClass} bg-indigo-50 border border-indigo-200 flex items-center justify-center ${textClass} shadow-sm shrink-0 select-none`}
        aria-label={`${learner.fullName} avatar`}
      >
        {emoji}
      </div>
    );
  }

  const initials = (learner.fullName || 'AL').substring(0, 2).toUpperCase();
  return (
    <div
      className={`${sizeClass} ${roundedClass} bg-indigo-600 text-white flex items-center justify-center ${textClass} font-black shadow-md shrink-0 select-none`}
    >
      {initials}
    </div>
  );
};
