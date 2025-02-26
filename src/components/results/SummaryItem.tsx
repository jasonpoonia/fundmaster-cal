import React from 'react';

type SummaryItemProps = {
  label: string;
  value: string;
};

export function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}