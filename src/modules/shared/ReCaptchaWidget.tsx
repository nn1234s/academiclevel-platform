import React, { useState, useEffect } from 'react';

interface ReCaptchaWidgetProps {
  isVerified: boolean;
  onVerify: (verified: boolean) => void;
  hasError?: boolean;
}

export const ReCaptchaWidget: React.FC<ReCaptchaWidgetProps> = ({
  isVerified,
  onVerify,
  hasError = false,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);

  // Sync internal state when parent resets
  useEffect(() => {
    if (!isVerified) {
      setIsVerifying(false);
    }
  }, [isVerified]);

  const handleClick = () => {
    if (isVerified || isVerifying) return;

    setIsVerifying(true);
    // Realistic verification latency simulation (650ms)
    setTimeout(() => {
      setIsVerifying(false);
      onVerify(true);
    }, 650);
  };

  return (
    <div
      className={`w-full max-w-[304px] h-[78px] bg-[#f9f9f9] border ${
        hasError ? 'border-red-500 shadow-sm shadow-red-200' : 'border-[#d3d3d3]'
      } rounded-[3px] shadow-[0_0_4px_1px_rgba(0,0,0,0.08)] flex items-center justify-between px-3 py-2 select-none font-sans mx-auto transition-all`}
    >
      {/* Left Checkbox & Label */}
      <div
        onClick={handleClick}
        className="flex items-center gap-3 cursor-pointer group py-1"
        role="checkbox"
        aria-checked={isVerified}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <div className="w-7 h-7 flex items-center justify-center shrink-0">
          {isVerified ? (
            /* Verified Green Checkmark */
            <svg
              className="w-7 h-7 text-[#0f9d58] animate-in zoom-in-75 duration-200"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M4.5 12.5L9.5 17.5L20 7"
                stroke="#0f9d58"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : isVerifying ? (
            /* Verifying Blue Spinner Ring */
            <div className="w-6 h-6 border-3 border-[#1a73e8] border-t-transparent rounded-full animate-spin" />
          ) : (
            /* Unchecked Standard Box */
            <div className="w-[26px] h-[26px] bg-white border-2 border-[#c1c1c1] rounded-[2px] group-hover:border-[#b2b2b2] transition-colors shadow-2xs" />
          )}
        </div>

        <span className="text-[14px] text-[#282727] font-normal tracking-tight">
          I&apos;m not a robot
        </span>
      </div>

      {/* Right reCAPTCHA Brand & Badge */}
      <div className="flex flex-col items-center justify-center shrink-0 pl-2">
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
          {/* Top Blue Curved Arrow */}
          <path
            d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8z"
            fill="#1a73e8"
          />
          {/* Bottom Gray Curved Arrow */}
          <path
            d="M12 20v3l4-4-4-4v3c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8z"
            fill="#80868b"
          />
        </svg>
        <span className="text-[10px] text-[#555555] font-semibold tracking-wider mt-0.5">
          reCAPTCHA
        </span>
        <div className="flex items-center gap-1 text-[8px] text-[#555555] mt-[1px]">
          <a
            href="/policies.html#privacy"
            target="_blank"
            rel="noreferrer"
            className="hover:underline text-[#555555]"
            onClick={e => e.stopPropagation()}
          >
            Privacy
          </a>
          <span>-</span>
          <a
            href="/policies.html#terms"
            target="_blank"
            rel="noreferrer"
            className="hover:underline text-[#555555]"
            onClick={e => e.stopPropagation()}
          >
            Terms
          </a>
        </div>
      </div>
    </div>
  );
};
