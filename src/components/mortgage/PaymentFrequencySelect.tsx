import React from 'react';
import { PaymentFrequency } from '../../types';

type PaymentFrequencySelectProps = {
  value: PaymentFrequency;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export function PaymentFrequencySelect({ value, onChange }: PaymentFrequencySelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="paymentFrequency" className="block text-sm font-medium text-gray-700">
        Payment Frequency
      </label>
      <select
        id="paymentFrequency"
        name="paymentFrequency"
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      >
        <option value="weekly">Weekly</option>
        <option value="fortnightly">Fortnightly</option>
        <option value="monthly">Monthly</option>
      </select>
    </div>
  );
}