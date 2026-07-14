'use client';

import { useRef, useState, KeyboardEvent, ClipboardEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const LENGTH = 6;

export function OtpInput({ value, onChange, error }: OtpInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(LENGTH, ' ').split('').slice(0, LENGTH);

  const updateValue = (index: number, digit: string) => {
    const arr = value.padEnd(LENGTH, ' ').split('').slice(0, LENGTH);
    arr[index] = digit;
    const next = arr.join('').replace(/ /g, '').slice(0, LENGTH);
    onChange(next);
  };

  const handleChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    updateValue(index, digit);
    if (index < LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[index]?.trim()) {
        updateValue(index, '');
      } else if (index > 0) {
        updateValue(index - 1, '');
        inputsRef.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-3">
        {Array.from({ length: LENGTH }).map((_, i) => (
          <motion.input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i]?.trim() ?? ''}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'flex h-12 w-10 items-center justify-center rounded-xl border bg-surface-elevated text-center text-lg font-semibold text-foreground shadow-soft transition-all sm:h-14 sm:w-12',
              'focus:border-champagne/50 focus:ring-2 focus:ring-champagne/20 focus:outline-none',
              error ? 'border-red-400' : 'border-border/80',
              digits[i]?.trim() && 'border-champagne/40',
            )}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-center text-xs text-red-500 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
