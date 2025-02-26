import React from 'react';
import { AlertCircle } from 'lucide-react';
import { MortgageType } from '../../types';

type MortgageTypeSelectProps = {
  value: MortgageType;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export function MortgageTypeSelect({ value, onChange }: MortgageTypeSelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="mortgageType" className="block text-sm font-medium text-gray-700">
        Type of Mortgage
      </label>
      <select
        id="mortgageType"
        name="mortgageType"
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      >
        <option value="principal-and-interest">Principal and Interest</option>
        <option value="interest-only">Interest Only</option>
      </select>
      {value === 'interest-only' && (
        <p className="mt-1 text-sm text-amber-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          Interest-only period is limited to 5 years maximum
        </p>
      )}
    </div>
  );
}