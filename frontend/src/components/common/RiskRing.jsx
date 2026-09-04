import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const RiskRing = ({
  riskPercent = 0, // 0 to 100
  revenueAtRisk = 0,
  sparklineData = [12, 14, 15, 13, 18, 22, 25],
  size = 220,
  strokeWidth = 14,
  className = ""
}) => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const normalizedRisk = Math.min(Math.max(riskPercent, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270-degree arc open at bottom
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (normalizedRisk / 100) * arcLength;

  // Calculate sparkline points for the bottom trail
  const sparkWidth = size * 0.65;
  const sparkHeight = 24;
  const minVal = Math.min(...(sparklineData.length ? sparklineData : [0]));
  const maxVal = Math.max(...(sparklineData.length ? sparklineData : [1])) || 1;
  const range = maxVal - minVal || 1;

  const points = (sparklineData.length >= 2 ? sparklineData : [10, 12, 15, 14, 18, 20, 24])
    .map((val, idx, arr) => {
      const x = (idx / (arr.length - 1)) * sparkWidth;
      const y = sparkHeight - ((val - minVal) / range) * sparkHeight;
      return `${x},${y}`;
    })
    .join(' ');

  // Gradient IDs
  const gradientId = `risk-gradient-${Math.round(riskPercent)}`;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* SVG Ring */}
      <svg
        width={size}
        height={size * 0.85}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E8B450" />
            <stop offset="60%" stopColor="#FF9B54" />
            <stop offset="100%" stopColor="#FF6B4A" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Track Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1B2130"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
        />

        {/* Dynamic Risk Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(135 ${size / 2} ${size / 2})`}
          initial={prefersReducedMotion ? false : { strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          filter={normalizedRisk > 40 ? "url(#glow)" : undefined}
        />
      </svg>

      {/* Hero Content inside the Ring */}
      <div className="absolute top-[18%] flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-semibold tracking-wider text-cg-muted uppercase mb-1 flex items-center gap-1.5">
          <span 
            className="w-2 h-2 rounded-full animate-pulse" 
            style={{ backgroundColor: normalizedRisk > 50 ? '#FF6B4A' : '#E8B450' }} 
          />
          Revenue at Risk
        </span>
        <div className="text-3xl sm:text-4xl font-extrabold text-cg-primary font-mono tabular-nums tracking-tight">
          ${Math.round(revenueAtRisk).toLocaleString()}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-full bg-cg-surface border border-cg-border text-cg-risk font-semibold">
            {normalizedRisk.toFixed(1)}% Risk Level
          </span>
        </div>
      </div>

      {/* 7-Day Sparkline Trail beneath */}
      <div className="mt-[-12px] flex flex-col items-center">
        <div className="text-[10px] uppercase font-mono tracking-widest text-cg-muted/70 mb-1 flex items-center gap-1">
          <span>7-Day Risk Velocity</span>
        </div>
        <svg
          width={sparkWidth}
          height={sparkHeight + 4}
          className="overflow-visible"
        >
          <polyline
            fill="none"
            stroke="#FF6B4A"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.8"
            points={points}
          />
          {sparklineData.map((val, idx, arr) => {
            const x = (idx / (arr.length - 1)) * sparkWidth;
            const y = sparkHeight - ((val - minVal) / range) * sparkHeight;
            return (
              <circle
                key={idx}
                cx={x}
                cy={y}
                r={idx === arr.length - 1 ? 3.5 : 1.5}
                fill={idx === arr.length - 1 ? "#FF6B4A" : "#8891A6"}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};
