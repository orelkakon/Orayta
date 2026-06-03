'use client';

import styled from 'styled-components';

const Svg = styled.svg`
  display: block;
  flex-shrink: 0;
`;

interface Props {
  size?: number;
}

export default function OraytaLogo({ size = 44 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer ring */}
      <circle cx="22" cy="22" r="21" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
      {/* Inner fill */}
      <circle cx="22" cy="22" r="18" fill="rgba(255,255,255,0.12)" />

      {/* Torah scroll body */}
      <rect x="10" y="14" width="24" height="16" rx="3" fill="rgba(255,255,255,0.9)" />
      {/* Left roller */}
      <rect x="8" y="12" width="4" height="20" rx="2" fill="rgba(255,255,255,0.75)" />
      {/* Right roller */}
      <rect x="32" y="12" width="4" height="20" rx="2" fill="rgba(255,255,255,0.75)" />

      {/* Text lines on scroll */}
      <line x1="14" y1="19" x2="30" y2="19" stroke="rgba(92,61,30,0.25)" strokeWidth="1" />
      <line x1="14" y1="22" x2="30" y2="22" stroke="rgba(92,61,30,0.25)" strokeWidth="1" />
      <line x1="14" y1="25" x2="26" y2="25" stroke="rgba(92,61,30,0.25)" strokeWidth="1" />

      {/* Initials א.ק in center */}
      <text
        x="22"
        y="26"
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        fontFamily="'Frank Ruhl Libre', serif"
        fill="rgba(92,61,30,0.85)"
        direction="rtl"
      >
        א.ק
      </text>

      {/* Crown dots on top */}
      <circle cx="17" cy="11" r="1.2" fill="rgba(196,149,106,0.9)" />
      <circle cx="22" cy="9.5" r="1.5" fill="rgba(196,149,106,0.9)" />
      <circle cx="27" cy="11" r="1.2" fill="rgba(196,149,106,0.9)" />
    </Svg>
  );
}
