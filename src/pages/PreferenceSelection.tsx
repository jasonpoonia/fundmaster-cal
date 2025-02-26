import React from 'react';
import { PiggyBank, Clock, ArrowLeft } from 'lucide-react';
import { FormData } from '../types';

type PreferenceSelectionProps = {
  formData: FormData;
  onPreferenceSelect: (preference: 'money' | 'time') => void;
  onBack: () => void;
  extraRepayment?: number;
  onExtraRepaymentChange?: (value: number) => void;
  formatCurrency?: (value: number) => string;
  onNext?: () => void;
};

export function PreferenceSelection({
  formData,
  onPreferenceSelect,
  onBack,
  extraRepayment = 0,
  onExtraRepaymentChange,
  formatCurrency,
  onNext,
}: PreferenceSelectionProps) {
  const handleMoneyPreference = () => {
    onPreferenceSelect('money');
    if (onNext) {
      onNext();
    }
  };

  const handleTimePreference = () => {
    onPreferenceSelect('time');
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        What would you prefer to do?
      </h2>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handleMoneyPreference}
          className={`flex-1 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            formData.preference === 'money'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-primary-500 hover:text-white'
          }`}
        >
          <PiggyBank className="w-5 h-5" />
          Minimum Repayment
        </button>
        <button
          type="button"
          onClick={handleTimePreference}
          className={`flex-1 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            formData.preference === 'time'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-primary-500 hover:text-white'
          }`}
        >
          <Clock className="w-5 h-5" />
          Save Term/Interest
        </button>
      </div>

      {formData.preference === 'time' && onExtraRepaymentChange && formatCurrency && (
        <div className="mt-6 space-y-6">
          <div className="bg-primary-50 p-6 rounded-lg">
            <div className="space-y-2">
              <label htmlFor="extraRepayment" className="block text-sm font-medium text-gray-700">
                Extra Repayment Amount ($)
              </label>
              <input
                type="text"
                id="extraRepayment"
                value={`$${formatCurrency(extraRepayment)}`}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  onExtraRepaymentChange(value ? parseInt(value) / 100 : 0);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {onNext && (
            <button
              onClick={onNext}
              disabled={extraRepayment <= 0}
              className={`w-full py-3 rounded-lg transition-colors ${
                extraRepayment > 0
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          )}
        </div>
      )}
    </div>
  );
}