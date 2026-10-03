import React from 'react';

// Person/Lock/Shield: usados por el Login original (color de marca quemado a
// propósito, ver LoginForm.tsx/AuthScreenLayout.tsx).
export const PersonIcon: React.FC = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1E45" strokeWidth="2" opacity={0.55}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
);

export const LockIcon: React.FC = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1E45" strokeWidth="2" opacity={0.55}>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
);

export const ShieldIcon: React.FC = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
        <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" />
    </svg>
);

// EyeIcon/EyeOffIcon: currentColor — los usan AppTextField y LoginIntro
// (componentes del rediseño, guardados sin usar por ahora).
export const EyeIcon: React.FC = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export const EyeOffIcon: React.FC = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3l18 18" />
        <path d="M10.6 5.1A10.9 10.9 0 0112 5c7 0 10.5 7 10.5 7a13.5 13.5 0 01-3.1 4.1M6.6 6.6C3.8 8.3 1.5 12 1.5 12s3.5 7 10.5 7a10.4 10.4 0 004.9-1.2" />
        <path d="M9.9 9.9a3 3 0 004.2 4.2" />
    </svg>
);
