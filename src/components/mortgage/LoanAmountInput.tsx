import React from 'react';

type LoanAmountInputProps = {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function LoanAmountInput({ value, onChange }: LoanAmountInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700">
        Current Loan Amount ($)
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
        <input
          type="number"
          id="loanAmount"
          name="loanAmount"
          value={value || ''}
          onChange={onChange}
          min="0"
          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
    </div>
  );
}