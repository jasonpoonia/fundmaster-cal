import React from 'react';
import { PaymentFrequency } from '../../types';

type FrequencySelectorProps = {
  displayFrequency: PaymentFrequency;
  onFrequencyChange: (frequency: PaymentFrequency) => void;
};

export function FrequencySelector({
  displayFrequency,
  onFrequencyChange,
}: FrequencySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="displayFrequency" className="text-sm font-medium text-gray-600">
        Show payments as:
      </label>
      <select
        id="displayFrequency"
        value={displayFrequency}
        onChange={(e) => onFrequencyChange(e.target.value as PaymentFrequency)}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      >
        <option value="weekly">Weekly</option>
        <option value="fortnightly">Fortnightly</option>
        <option value="monthly">Monthly</option>
      </select>
    </div>
  );
}