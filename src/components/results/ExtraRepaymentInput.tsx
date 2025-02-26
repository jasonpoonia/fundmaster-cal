import React from 'react';

type ExtraRepaymentInputProps = {
  extraRepayment: number;
  onExtraRepaymentChange: (value: number) => void;
  formatCurrency: (value: number) => string;
  getFrequencyLabel: (frequency: string) => string;
  paymentFrequency: string;
};

export function ExtraRepaymentInput({
  extraRepayment,
  onExtraRepaymentChange,
  formatCurrency,
  getFrequencyLabel,
  paymentFrequency,
}: ExtraRepaymentInputProps) {
  return (
    <div className="bg-blue-50 p-6 lg:p-8 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Additional Payment Settings
      </h3>
      <div className="space-y-2">
        <label htmlFor="extraRepayment" className="block text-sm font-medium text-gray-700">
          Amount Above Minimum (Fortnightly) ($)
        </label>
        <input
          type="text"
          id="extraRepayment"
          value={`$${formatCurrency(extraRepayment)}`}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '');
            onExtraRepaymentChange(value ? parseInt(value) / 100 : 0);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}