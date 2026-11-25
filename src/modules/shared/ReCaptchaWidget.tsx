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

  useEffect(() => {
    if (!isVerified) {
      setIsVerifying(false);
    }
  }, [isVerified]);

  const handleClick = () => {
    if (isVerified || isVerifying) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onVerify(true);
    }, 650);
  };

  return (
    <div
      className={`w-[304px] max-w-full h-[74px] bg-[#f9f9f9] border ${
        hasError ? 'border-red-500' : 'border-[#d3d3d3]'
      } rounded-[3px] shadow-[0_0_4px_1px_rgba(0,0,0,0.08)] flex items-center justify-between px-[12px] select-none mx-auto`}
      style={{ fontFamily: 'Roboto, helvetica, arial, sans-serif' }}
    >
      {/* Left Checkbox & Label */}
      <div
        onClick={handleClick}
        className="flex items-center gap-[12px] cursor-pointer group py-1"
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
        <div className="w-[28px] h-[28px] flex items-center justify-center shrink-0">
          {isVerified ? (
            <svg className="w-[28px] h-[28px]" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path
                d="M5 14.5L11 20.5L23.5 7.5"
                stroke="#0F9D58"
                strokeWidth="3.6"
                strokeLinecap="butt"
                strokeLinejoin="miter"
              />
            </svg>
          ) : isVerifying ? (
            <svg className="w-[28px] h-[28px] animate-spin" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="12" stroke="#D2E3FC" strokeWidth="4" />
              <path d="M16 4 A12 12 0 1 1 5.6 22" stroke="#4285F4" strokeWidth="4" strokeLinecap="round" />
            </svg>
          ) : (
            <div className="w-[28px] h-[28px] bg-white border-2 border-[#c1c1c1] rounded-[2px] group-hover:border-[#b2b2b2] transition-colors" />
          )}
        </div>

        <span
          className="text-[14px] text-[#000000] font-normal leading-[17px]"
          style={{ fontFamily: 'Roboto, helvetica, arial, sans-serif' }}
        >
          I&apos;m not a robot
        </span>
      </div>

      {/* Right reCAPTCHA Transparent Vector Logo & Links */}
      <div className="flex flex-col items-center justify-center shrink-0 w-[58px]">
        <svg className="w-[32px] h-[32px]" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          {/* Top-left light blue arrow */}
          <path
            d="M32 10C21.5 10 12.8 17.2 10.6 27H19.4C21.3 21.8 26.2 18 32 18C35.8 18 39.2 19.6 41.6 22.1L36 27H53V10L47.5 14.8C43.5 11.8 38 10 32 10Z"
            fill="#4285F4"
          />
          {/* Right dark navy arrow */}
          <path
            d="M53.4 27H44.6C44.9 28.6 45 30.3 45 32C45 37.8 41.2 42.7 36 44.6V53.4C45.8 51.2 53 42.5 53 32C53 30.3 53.2 28.6 53.4 27Z"
            fill="#1C3AA9"
          />
          {/* Bottom-left grey arrow */}
          <path
            d="M22.4 41.9C20 39.4 18.5 35.9 18.5 32C18.5 30.3 18.8 28.6 19.4 27H10.6C10.2 28.6 10 30.3 10 32C10 38 12.5 43.4 16.5 47.4L11 53H28V36L22.4 41.9Z"
            fill="#ABABAB"
          />
        </svg>
        <span
          className="text-[10px] text-[#555555] font-normal leading-[10px] mt-[4px]"
          style={{ fontFamily: 'Roboto, helvetica, arial, sans-serif' }}
        >
          reCAPTCHA
        </span>
        <div
          className="flex items-center gap-[3px] text-[8px] text-[#555555] leading-[9px] mt-[2px]"
          style={{ fontFamily: 'Roboto, helvetica, arial, sans-serif' }}
        >
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
