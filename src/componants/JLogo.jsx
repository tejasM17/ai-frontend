import React from "react";

const JLogo = ({ size = 64 }) => (
     <svg
          width={size}
          height={size}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
     >
          <defs>
               <linearGradient id="j-sci-fi" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#00fff7" />
                    <stop offset="1" stopColor="#0e0e2e" />
               </linearGradient>
               <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                    <feMerge>
                         <feMergeNode in="coloredBlur" />
                         <feMergeNode in="SourceGraphic" />
                    </feMerge>
               </filter>
          </defs>
          {/* Outer glow circle */}
          <circle cx="32" cy="32" r="28" fill="#101828" />
          {/* The "J" letter with glow */}
          <path
               d="M44 16v18c0 7-5 12-12 12s-12-5-12-12"
               stroke="url(#j-sci-fi)"
               strokeWidth="6"
               strokeLinecap="round"
               strokeLinejoin="round"
               filter="url(#glow)"
          />
          {/* Sci-fi dot */}
          <circle cx="32" cy="48" r="3" fill="#00fff7" filter="url(#glow)" opacity="0.7" />
     </svg>
);

export default JLogo;