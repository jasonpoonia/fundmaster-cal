import React from 'react';

type InterestRateInputProps = {
  value: number | '';
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function InterestRateInput({ value, onChange }: InterestRateInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="currentRate" className="block text-sm font-medium text-gray-700">
        Current Interest Rate (%)
      </label>
      <input
        type="number"
        id="currentRate"
        name="currentRate"
        value={value}
        onChange={onChange}
        step="0.01"
        min="0"
        max="100"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />
    </div>
  );
}