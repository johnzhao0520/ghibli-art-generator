'use client';

import React from 'react';

type PrimaryProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  color?: 'emerald' | 'blue' | 'slate';
  'aria-label'?: string;
  'aria-busy'?: 'true' | 'false';
};

export function PrimaryButton({
  children, onClick, className = '', disabled = false, color = 'emerald', ...rest
}: PrimaryProps) {
  const colorMap = {
    emerald: 'bg-emerald-500 hover:bg-emerald-600 focus-visible:ring-emerald-400',
    blue: 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-400',
    slate: 'bg-slate-700 hover:bg-slate-800 focus-visible:ring-slate-400',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full max-w-xs text-white rounded-md px-5 py-3 font-medium transition-colors shadow
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
        ${colorMap[color]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

type OutlineProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  'aria-label'?: string;
};

export function OutlineButton({ children, onClick, className = '', ...rest }: OutlineProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full max-w-xs rounded-md px-5 py-3 font-medium border border-emerald-200 text-emerald-700
      hover:bg-emerald-50 transition-colors ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}