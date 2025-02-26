import React, { useState, useRef, useEffect } from 'react';

type LoanAmountInputProps = {
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | number) => void;
};

export function LoanAmountInput({ value, onChange }: LoanAmountInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<{ digitsBeforeCursor: number, selectionStart: number } | null>(null);
  
  // Format number with commas
  const formatNumber = (num: number): string => {
    if (!num && num !== 0) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };
  
  // Remove non-numeric characters
  const parseNumber = (str: string): string => {
    return str.replace(/[^\d]/g, '');
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const { selectionStart } = input;
    
    // Count commas before cursor in the previous value
    const previousValue = value.toString();
    const previousCommasBeforeCursor = (previousValue.substring(0, selectionStart || 0).match(/,/g) || []).length;
    
    // Remove all non-numeric characters for storing the raw value
    const rawInput = parseNumber(input.value);
    const rawValue = rawInput ? parseInt(rawInput, 10) : 0;
    
    // Calculate cursor position
    const digitsBeforeCursor = (selectionStart || 0) - previousCommasBeforeCursor;
    
    // Create a synthetic event-like object that includes the parsed value
    const syntheticEvent = {
      target: {
        name: e.target.name,
        value: rawValue
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    // Call the parent's onChange with the synthetic event
    onChange(syntheticEvent);
    
    // Store cursor position data for after render
    setCursorPosition({
      digitsBeforeCursor,
      selectionStart: selectionStart || 0
    });
  };
  
  // Set cursor position after the input value has been updated
  useEffect(() => {
    if (inputRef.current && cursorPosition) {
      const formattedValue = formatNumber(value);
      
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
  }, [value, cursorPosition]);
  
  return (
    <div className="space-y-2">
      <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700">
        Current Loan Amount ($)
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
        <input
          ref={inputRef}
          type="text"
          id="loanAmount"
          name="loanAmount"
          value={formatNumber(value)}
          onChange={handleChange}
          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
    </div>
  );
}