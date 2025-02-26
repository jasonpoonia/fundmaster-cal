import React, { useRef, useState, useEffect } from 'react';

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

  const handleExtraRepaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    // Store cursor position data for after render
    setCursorPosition({
      digitsBeforeCursor,
      selectionStart: selectionStart || 0
    });
  };

  // Set cursor position after the input value has been updated
  useEffect(() => {
    if (inputRef.current && cursorPosition) {
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
  }, [extraRepayment, cursorPosition]);

  return (
    <div className="bg-primary-50 p-6 lg:p-8 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Additional Payment Settings
      </h3>
      <div className="space-y-2">
        <label htmlFor="extraRepayment" className="block text-sm font-medium text-gray-700">
          Extra Amount Per {getFrequencyLabel(paymentFrequency)} Payment ($)
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            ref={inputRef}
            type="text"
            id="extraRepayment"
            value={formatNumber(extraRepayment)}
            onChange={handleExtraRepaymentChange}
            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
        <p className="text-sm text-gray-500">
          This amount will be added to each {paymentFrequency.toLowerCase()} payment
        </p>
      </div>
    </div>
  );
}