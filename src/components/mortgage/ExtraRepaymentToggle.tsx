import React from 'react';

type ExtraRepaymentToggleProps = {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentExtraRepayment: number;
  onExtraRepaymentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  getFrequencyLabel: (frequency: string) => string;
  paymentFrequency: string;
};

export function ExtraRepaymentToggle({
  checked,
  onChange,
  currentExtraRepayment,
  onExtraRepaymentChange,
  getFrequencyLabel,
  paymentFrequency,
}: ExtraRepaymentToggleProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <input
          type="checkbox"
          id="hasExtraRepayments"
          name="hasExtraRepayments"
          checked={checked}
          onChange={onChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="hasExtraRepayments" className="ml-2 block text-sm font-medium text-gray-700">
          I'm currently paying above the minimum repayment
        </label>
      </div>
      {checked && (
        <div className="mt-4">
          <label htmlFor="currentExtraRepayment" className="block text-sm font-medium text-gray-700">
            Additional {getFrequencyLabel(paymentFrequency)} Repayment 
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              id="currentExtraRepayment"
              name="currentExtraRepayment"
              value={currentExtraRepayment || ''}
              onChange={onExtraRepaymentChange}
              min="0"
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      )}
    </div>
  );
}