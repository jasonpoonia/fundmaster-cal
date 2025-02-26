import React, { useState } from 'react';
import { ArrowLeft, Pencil, Check, X } from 'lucide-react';
import { FormData, Bank } from '../types';

type BankSelectionProps = {
  formData: FormData;
  banks: Bank[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onNext: () => void;
  onBack: () => void;
  updateCustomRate: (term: string, rate: number) => void;
};

type EditableRate = {
  term: string;
  rate: number;
};

const AVAILABLE_TERMS = [
  { key: '6m', label: '6 Months' },
  { key: '1y', label: '1 Year' },
  { key: '18m', label: '18 Months' },
  { key: '2y', label: '2 Years' },
  { key: '3y', label: '3 Years' },
  { key: '4y', label: '4 Years' },
  { key: '5y', label: '5 Years' },
  { key: 'floating', label: 'Floating' }
];

export function BankSelection({
  formData,
  banks,
  onInputChange,
  onNext,
  onBack,
  updateCustomRate,
}: BankSelectionProps) {
  const [editingRate, setEditingRate] = useState<EditableRate | null>(null);

  const handleRateEdit = (term: string, rate: number) => {
    setEditingRate({ term, rate });
  };

  const handleRateSave = () => {
    if (editingRate) {
      updateCustomRate(editingRate.term, editingRate.rate);
      setEditingRate(null);
    }
  };

  const handleRateCancel = () => {
    setEditingRate(null);
  };

  const getEffectiveRate = (term: string, defaultRate: number) => {
    return formData.customRates[term] !== undefined ? formData.customRates[term] : defaultRate;
  };

  const selectedBank = banks.find(b => b.name === formData.selectedBank);

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
        Select Your Bank
      </h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="bank" className="block text-sm font-medium text-gray-700">
            Choose a Bank
          </label>
          <select
            id="bank"
            name="selectedBank"
            value={formData.selectedBank}
            onChange={onInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a bank</option>
            {banks.map(bank => (
              <option key={bank.name} value={bank.name}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        {formData.selectedBank && formData.selectedBank !== 'Custom Rate' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Terms to Compare
            </label>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {AVAILABLE_TERMS.map(({ key, label }) => {
                const defaultRate = selectedBank?.rates[key];
                if (defaultRate === undefined) return null;
                
                const effectiveRate = getEffectiveRate(key, defaultRate);
                const isEditing = editingRate?.term === key;

                return (
                  <div key={key} className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg">
                    <input
                      type="checkbox"
                      id={`term_${key}`}
                      name={`term_${key}`}
                      checked={formData.selectedTerms.includes(key)}
                      onChange={onInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`term_${key}`} className="flex-grow text-sm text-gray-700">
                      {label}
                    </label>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editingRate.rate}
                          onChange={(e) => setEditingRate({ 
                            term: key, 
                            rate: parseFloat(e.target.value) || 0 
                          })}
                          className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          step="0.01"
                          min="0"
                          max="100"
                        />
                        <button
                          onClick={handleRateSave}
                          className="p-1 text-green-600 hover:text-green-800 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleRateCancel}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${formData.customRates[key] !== undefined ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                          {effectiveRate}%
                        </span>
                        <button
                          onClick={() => handleRateEdit(key, effectiveRate)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {formData.selectedBank === 'Custom Rate' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Custom Rates
            </label>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {AVAILABLE_TERMS.map(({ key, label }) => {
                const rate = formData.customRates[key] || 0;
                const isEditing = editingRate?.term === key;

                return (
                  <div key={key} className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg">
                    <input
                      type="checkbox"
                      id={`term_${key}`}
                      name={`term_${key}`}
                      checked={formData.selectedTerms.includes(key)}
                      onChange={onInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`term_${key}`} className="flex-grow text-sm text-gray-700">
                      {label}
                    </label>
                    
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editingRate.rate}
                          onChange={(e) => setEditingRate({ 
                            term: key, 
                            rate: parseFloat(e.target.value) || 0 
                          })}
                          className="w-20 px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          step="0.01"
                          min="0"
                          max="100"
                        />
                        <button
                          onClick={handleRateSave}
                          className="p-1 text-green-600 hover:text-green-800 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleRateCancel}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-600 font-medium">
                          {rate}%
                        </span>
                        <button
                          onClick={() => handleRateEdit(key, rate)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div className="mt-8">
        <button
          onClick={onNext}
          className="w-full lg:w-auto lg:px-8 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors"
          disabled={
            formData.selectedBank === 'Custom Rate'
              ? formData.selectedTerms.length === 0 || formData.selectedTerms.some(term => !formData.customRates[term])
              : formData.selectedTerms.length === 0
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}