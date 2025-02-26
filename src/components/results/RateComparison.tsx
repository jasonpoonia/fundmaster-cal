import React, { useMemo } from 'react';
import { FormData, PaymentFrequency } from '../../types';

type RateComparisonProps = {
  formData: FormData;
  results: any[];
  baseMonthlyPayment: number;
  extraRepayment: number;
  displayFrequency: PaymentFrequency;
  getPaymentDisplay: (monthlyAmount: number, frequency?: PaymentFrequency) => string;
  formatCurrency: (value: number) => string;
};

export function RateComparison({
  formData,
  results,
  baseMonthlyPayment,
  extraRepayment,
  displayFrequency,
  getPaymentDisplay,
  formatCurrency,
}: RateComparisonProps) {
  const bestOption = useMemo(() => {
    if (results.length === 0) return null;
    
    if (formData.preference === 'money') {
      return results.reduce((best, current) => 
        current.totalSavings > best.totalSavings ? current : best
      , results[0]);
    } else {
      return results.reduce((best, current) => 
        current.yearsSaved > best.yearsSaved ? current : best
      , results[0]);
    }
  }, [results, formData.preference]);

  const getTermDisplay = (term: string) => {
    if (term === 'Custom') return 'Custom Rate';
    if (term === 'floating') return 'Floating';
    if (term.endsWith('y')) return `${term.replace('y', ' Year')}`;
    if (term.endsWith('m')) return `${term.replace('m', ' Month')}`;
    return term;
  };

  const calculateInterestSaved = (result: any) => {
    const currentTotalInterest = formData.loanAmount * (formData.currentRate / 100) * formData.currentTerm;
    const newTotalInterest = formData.loanAmount * (result.newRate / 100) * result.newTerm;
    return currentTotalInterest - newTotalInterest;
  };

  // Convert fortnightly extra repayment to display frequency
  const getExtraRepaymentForDisplay = () => {
    switch (displayFrequency) {
      case 'weekly':
        return extraRepayment * (26/52); // Convert fortnightly to weekly
      case 'monthly':
        return extraRepayment * (26/12); // Convert fortnightly to monthly
      default:
        return extraRepayment; // Keep as fortnightly
    }
  };

  return (
    <div className="bg-primary-50 p-6 lg:p-8 rounded-lg">
      <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-6">
        {formData.selectedBank} - Rate Comparison
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {results.map((result, index) => (
          <div 
            key={index} 
            className={`bg-white p-6 rounded-lg shadow-sm transition-all duration-300 h-full ${
              result.term === bestOption?.term ? 'ring-2 ring-primary-500 shadow-lg' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-700">
                {getTermDisplay(result.term)}
              </h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Rate:</span>
                <span className="font-semibold text-primary-600">{result.newRate}%</span>
              </div>
              {formData.preference === 'money' ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">New Payment:</span>
                    <span className="font-semibold text-primary-600">
                      {getPaymentDisplay(result.newPayment, displayFrequency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Savings:</span>
                    <span className="font-semibold text-primary-600">
                      {getPaymentDisplay(baseMonthlyPayment - result.newPayment, displayFrequency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Savings:</span>
                    <span className="font-semibold text-primary-600">
                      ${formatCurrency(result.totalSavings)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Payment:</span>
                      <span className="font-semibold text-primary-600">
                        {getPaymentDisplay(result.newPayment + extraRepayment, displayFrequency)}
                      </span>
                    </div>
                    <div className="pl-4 space-y-1">
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Minimum Payment:</span>
                        <span>{getPaymentDisplay(result.newPayment, displayFrequency)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Extra Repayment:</span>
                        <span>${formatCurrency(getExtraRepaymentForDisplay())} {displayFrequency === 'weekly' ? 'Weekly' : displayFrequency === 'monthly' ? 'Monthly' : 'Fortnightly'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 space-y-2 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Years Saved:</span>
                      <span className="font-semibold text-primary-600">
                        {Math.round(result.yearsSaved * 10) / 10} years
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Interest Saved:</span>
                      <span className="font-semibold text-primary-600">
                        ${formatCurrency(calculateInterestSaved(result))}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}