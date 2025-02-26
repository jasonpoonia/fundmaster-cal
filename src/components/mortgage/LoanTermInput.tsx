import React from 'react';
import { AlertCircle } from 'lucide-react';
import { MortgageType } from '../../types';

type LoanTermInputProps = {
  value: number | '';
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mortgageType: MortgageType;
  showWarning?: boolean;
};

export function LoanTermInput({ value, onChange, mortgageType, showWarning }: LoanTermInputProps) {
  const maxTerm = mortgageType === 'interest-only' ? 5 : 30;
  
  return (
    <div className="space-y-2">
      <label htmlFor="currentTerm" className="block text-sm font-medium text-gray-700">
        Remaining Term (years)
      </label>
      <input
        type="number"
        id="currentTerm"
        name="currentTerm"
        value={value}
        onChange={onChange}
        min="1"
        max={maxTerm}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />
      {showWarning && (
        <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          Term has been adjusted to the maximum 5-year period for interest-only loans
        </p>
      )}
      <p className="text-sm text-gray-500">
        Maximum term: {maxTerm} years
      </p>
    </div>
  );
}