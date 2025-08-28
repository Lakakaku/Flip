'use client';

import React from 'react';
import { AlertCircle } from '@/components/ui/icons';

type FormErrorProps = {
  message?: string;
  className?: string;
};

export default function FormError({ message, className = '' }: FormErrorProps) {
  if (!message) return null;

  return (
    <div className={`flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}