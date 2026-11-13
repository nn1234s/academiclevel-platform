import React, { useState, useEffect } from 'react';

// Exact reCAPTCHA v2 logo provided by user as self-contained data URI
const RECAPTCHA_LOGO =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAAAoCAYAAABaW2IIAAAGBklEQVR4AexYXUwcVRT+ll2WtnRpUym0Gljkp4AU2PrT0Ghq0pcmRo3xQU30xfhijIlRm6ZtYmOsrSaaqA2kaqkxMcYHa6Wa+KDxL2kMUkDtEsuvsLvAAlug/JT9n/GcOzO747oLCwwbbdjMd8+559y553xz7p25kCXfxL8s3MS/dXL/1+KuV269cv/BJ7C+LJdTlPmAjA+/D+LUxQBOtQRwUsXrJBknSJ74MgDGaxcCOHamH6cvjKPl0jT6R4KQlxNsibGGV27zBhP2V5nhviahcyiKThdJwm9DJBmDiuxgnfBTmxfnf/Th3S8m8MxbQ3jixCA++2EKnokQotLqqBpOjh9m1W0WvPRADrZt5h5hsRxlCVJgAVIkQgMB72QIZy768EKjB00tPvhDkrCvpFkTcpxIttmEDVaaXiWmCnYpS08zkKQTIKJBP+SoQpAH+WYi+PznaTz/nlssV7bpMbcQ1XeT6hQ9qX1Vxt9dUbzxdRAj05S5biaZunTpLFCIilYmggFIOoI8sMcTxOEPhtHec4O7AlddAbxzflzoizWGk/trQkLTdyFMzhEN5VJSJz2WiKqrIu4n9nKQXipRpSrUBVd1fDqMk5+OoY9eON1uP441D2NsKl7l2LwJiqHkAmEZjd+GMDWvpK20VB1VUYVIQa8LdsLKDVUw/O8KMsFXPx7F0eZRjE0vTYxnMoxclPb9J5dCGKK3JCcuQA0/fQ5EKgtiqghu2cdgXQOP42rJoRBkSa0gO8kx6A1ibCqMxHvYnQyGkfNel/BLryQCc3AGB6Sc4oWhjol75KSL3Th9uBaHnrSjvjwXJpMwiYYJSmFaoipBYVxmYxi51r4IphdkTv0f0HcKbMCLBy04+VgO8m1URGK4d/c2PHpgJxoPVeOVp+3YsS07ToEehhShSkm0LMhKXfHwSI1J1lPBEHIc9Js/EvYBGxlqZCZ29GEr9tfkoKbIgiMP5RDBeKnM9Ok4uG873nyuTBDkWwWoUQgqS1SdLi1hCLmBcQmT8xSPEtEqpVPFcnvqXjNuL7TQIOXatdOMww9alY6u3VWci2cfuVXcEzNThfkTIWsV5MljztSKIeSujihPlWNq0Ies2iHjvuocvUno1XSSEUpCsyN/g7AQJyG1hj/yMYLiKWqe5NIQcp5JCRKdA/kloAfbGPdXW5AVX4HJM1Gtfw7ewPGzgzSfatAY0lNjVaYXDMdQvYsKQ8iN03cnGgoiQh9gPdjG2Lk1vTDO/jkcaeqF1+cHk6DjipCsS/Rh16QUCYF9izIjZ3pRaeBi1+O7XTh+oDcl/GMdaG1tRUdHJ2Zn51JOVVtuw1dv70HbR3sJ9+DXc3ejjdF8Fy6fuxOXm/egvdmB9rP1eP/l0pTzaA5DyEm00ZeC2WxGRUUF8vJsWuw1l4aQSyfLiopdGSXGOWWMXDhM+4QjZhCGkeM32GJwudyYn4//2ZKKYygUpjelciJJNSZdu2HklgoYDAbQ3d0Nn28y5dCJiWvo6nJieHgk5ZjlODJGjpNign19PXA6u+D1jmFmZgbXCaxfueJEb283FhYW4Ha7CB6qIH3c+MYVIqPkOEdeurOzMxgY6CeSTnQ5nUJnG/s1DA97Vl1Bw8hx0tnZ2bBac8C6lqResl2D3p5Mj9JH2+UaVCu4sj1oGDmr1YrKyipUVVUSQWssX40My5hxCUU/1uNxr7iChpCzWLIFsS1b8mCz2VBaWgaLxUJ7ZnlPnEkx9Nz5cDA6OgK/3683p6UbQq6srBRMTIuYn38LqqvvwKZNmzTTkjKRlHbDxo0bUVNTA5aaLV1pCDnea4kB+ZhVX1+PgoICWGgvJkuebRr097ONK19YWAiHwyFWg96frm4IuVTBOMHy8nLU1taiqKgYfL7kxDUk3sd2My3n4mI76urqxFmU50gcl24/gVy6t6U/LisrC7m0PEtK7Gho2EdE62C3lyA/v4DOmnmiKtu3F8BOtrq6euxraEAJjc3N5X8YpflHYIp01pycPi7/d2vr1i0oLi6iPVkJXrYOh0O8YdnGPpNpdYSg+2WUnC5uRtS/AQAA//+qdqPvAAAABklEQVQDAG1c8qIE2tKfAAAAAElFTkSuQmCC';

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
        <img
          src={RECAPTCHA_LOGO}
          alt="reCAPTCHA"
          className="w-7 h-auto object-contain"
          loading="eager"
        />
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
