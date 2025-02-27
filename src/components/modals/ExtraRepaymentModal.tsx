import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

type ExtraRepaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
  formatCurrency: (value: number) => string;
};

export function ExtraRepaymentModal({
  isOpen,
  onClose,
  onSubmit,
  formatCurrency,
}: ExtraRepaymentModalProps) {
  const [amount, setAmount] = useState<number>(0);
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const { selectionStart } = input;
    
    // Count commas before cursor in the previous value
    const previousValue = amount ? amount.toString() : '0';
    const previousCommasBeforeCursor = (previousValue.substring(0, selectionStart || 0).match(/,/g) || []).length;
    
    // Remove all non-numeric characters for storing the raw value
    const rawInput = parseNumber(input.value);
    const rawValue = rawInput ? parseFloat(rawInput) : 0;
    
    // Calculate cursor position
    const digitsBeforeCursor = (selectionStart || 0) - previousCommasBeforeCursor;
    
    // Update the value
    setAmount(rawValue);
    setError('');
    
    // Store cursor position data for after render
    setCursorPosition({
      digitsBeforeCursor,
      selectionStart: selectionStart || 0
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount above 0');
      return;
    }
    
    onSubmit(amount);
    onClose();
  };

  // Set cursor position after the input value has been updated
  useEffect(() => {
    if (inputRef.current && cursorPosition) {
      const formattedValue = formatNumber(amount);
      
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
  }, [amount, cursorPosition]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Extra Repayment Amount
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="extraAmount" className="block text-sm font-medium text-gray-700 mb-1">
              How much extra would you like to pay with each repayment?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                ref={inputRef}
                type="text"
                id="extraAmount"
                value={formatNumber(amount)}
                onChange={handleAmountChange}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">This amount will be added to your regular payments</p>
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}