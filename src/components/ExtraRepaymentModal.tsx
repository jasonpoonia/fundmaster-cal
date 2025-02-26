import React, { useState } from 'react';
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
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid amount above 0');
      return;
    }
    
    onSubmit(numericAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Additional Fortnightly Payment
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
              How much extra would you like to pay?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="text"
                id="extraAmount"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  setAmount(value);
                  setError('');
                }}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}