'use client';

import React from 'react';
import { FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import type { FieldError } from 'react-hook-form';

type FormFieldProps = {
  label: string;
  error?: FieldError;
  children: React.ReactNode;
  className?: string;
};

export default function FormField({ label, error, children, className = '' }: FormFieldProps) {
  return (
    <FormItem className={className}>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        {children}
      </FormControl>
      <FormMessage error={error} />
    </FormItem>
  );
}