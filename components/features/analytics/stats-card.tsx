'use client';

import React from 'react';

type StatsCardProps = {
  title: string;
  value: string | number;
  change?: string;
  className?: string;
};

export default function StatsCard({ title, value, change, className = '' }: StatsCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow ${className}`}>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
      {change && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{change}</p>
      )}
    </div>
  );
}