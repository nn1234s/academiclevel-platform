import React from 'react';

interface StudyCoinIconProps {
  className?: string;
  size?: number | string;
  animate?: boolean;
  glow?: boolean;
}

export const StudyCoinIcon: React.FC<StudyCoinIconProps> = ({
  className = 'w-4 h-4',
  size,
  animate = false,
  glow = false
}) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <img
      src="/al-coin.png"
      alt="AL Study Coin"
      style={style}
      className={`inline-block object-contain flex-shrink-0 select-none align-middle drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] ${glow ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''} ${animate ? 'animate-pulse' : ''} ${className}`}
      loading="eager"
      onError={(e) => {
        const target = e.currentTarget;
        if (!target.src.endsWith('/coin.png')) {
          target.src = '/coin.png';
        }
      }}
    />
  );
};

export default StudyCoinIcon;
