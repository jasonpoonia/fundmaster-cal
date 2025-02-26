import React, { useState, useRef, useEffect } from 'react';
import { PiggyBank, Clock, ArrowLeft, AlertCircle } from 'lucide-react';
import { FormData } from '../types';

type PreferenceSelectionProps = {
  formData: FormData;
  onPreferenceSelect: (preference: 'money' | 'time', callback?: () => void) => void;
  onBack: () => void;
  extraRepayment?: number;
  onExtraRepaymentChange?: (value: number) => void;
  formatCurrency?: (value: number) => string;
  getFrequencyLabel?: (frequency: string) => string;
  onNext?: () => void;
};

export function PreferenceSelection({
  formData,
  onPreferenceSelect,
  onBack,
  extraRepayment = 0,
  onExtraRepaymentChange,
  formatCurrency,
  getFrequencyLabel,
  onNext,
}: PreferenceSelectionProps) {
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<{ digitsBeforeCursor: number, selectionStart: number } | null>(null);

  // Format number with commas
  const formatNumber = (num: number): string => {
    if (!num && num !== 0) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  // Remove non-numeric characters
  const parseNumber = (str: string): string => {
    return str.replace(/[^\d.]/g, '');
  };

  const handlePreferenceSelect = (preference: 'money' | 'time') => {
    setError('');
    onPreferenceSelect(preference);
  };

  const handleNext = () => {
    if (!formData.preference) {
      setError('Please select a preference before continuing');
      return;
    }

    if (formData.preference === 'time' && (!extraRepayment || extraRepayment <= 0)) {
      setError('Please enter an extra repayment amount');
      return;
    }

    if (onNext) {
      onNext();
    }
  };

  const handleExtraRepaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onExtraRepaymentChange) return;
    
    const input = e.target;
    const { selectionStart } = input;
    
    // Count commas before cursor in the previous value
    const previousValue = extraRepayment ? extraRepayment.toString() : '0';
    const previousCommasBeforeCursor = (previousValue.substring(0, selectionStart || 0).match(/,/g) || []).length;
    
    // Remove all non-numeric characters for storing the raw value
    const rawInput = parseNumber(input.value);
    const rawValue = rawInput ? parseFloat(rawInput) : 0;
    
    // Calculate cursor position
    const digitsBeforeCursor = (selectionStart || 0) - previousCommasBeforeCursor;
    
    // Update the value
    onExtraRepaymentChange(rawValue);
    setError('');
    
    // Store cursor position data for after render
    setCursorPosition({
      digitsBeforeCursor,
      selectionStart: selectionStart || 0
    });
  };

  // Set cursor position after the input value has been updated
  useEffect(() => {
    if (inputRef.current && cursorPosition && formatCurrency) {
      const formattedValue = formatNumber(extraRepayment);
      
      let countDigits = 0;
      let newCursorPosition = 0;
      
      // Calculate new cursor position based on digits before cursor
      for (let i = 0; i < formattedValue.length; i++) {
        if (formattedValue[i] !== ',') {
          countDigits++;
        }
        if (countDigits > cursorPosition.digitsBeforeCursor) {
          newCursorPosition = i;
          break;
        }
        newCursorPosition = i + 1;
      }
      
      inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
    }
  }, [extraRepayment, cursorPosition, formatCurrency]);

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
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => handlePreferenceSelect('money')}
          className={`flex-1 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            formData.preference === 'money'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700'
          }`}
        >
          <PiggyBank className="w-5 h-5" />
          Minimum Repayment
        </button>
        <button
          type="button"
          onClick={() => handlePreferenceSelect('time')}
          className={`flex-1 py-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
            formData.preference === 'time'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-primary-100 hover:text-primary-700'
          }`}
        >
          <Clock className="w-5 h-5" />
          Save Term/Interest
        </button>
      </div>

      {formData.preference === 'time' && onExtraRepaymentChange && formatCurrency && (
        <div className="mt-6 space-y-4">
          <div className="bg-primary-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Extra Repayment Settings
            </h3>
            <div className="space-y-2">
              <label htmlFor="extraRepayment" className="block text-sm font-medium text-gray-700">
                Extra Repayment Amount ($)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  ref={inputRef}
                  type="text"
                  id="extraRepayment"
                  name="extraRepayment"
                  value={formatNumber(extraRepayment)}
                  onChange={handleExtraRepaymentChange}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                This amount will be added to each payment to help pay off your mortgage faster
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <button
          onClick={handleNext}
          className={`w-full py-3 rounded-lg transition-colors ${
            (!formData.preference || (formData.preference === 'time' && (!extraRepayment || extraRepayment <= 0)))
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}