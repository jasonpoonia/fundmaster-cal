import React, { useMemo } from 'react';
import { FormData, PaymentFrequency } from '../../types';
import { calculateAnnualSavings } from '../../utils/calculations';

type RateComparisonProps = {
  formData: FormData;
  results: any[];
  baseMonthlyPayment: number;
  extraRepayment: number;
  displayFrequency: PaymentFrequency;
  getPaymentDisplay: (monthlyAmount: number, frequency?: PaymentFrequency) => string;
  formatCurrency: (value: number) => string;
  getFrequencyLabel: (frequency: string) => string;
  convertFromMonthlyAmount: (amount: number, frequency: string) => number;
};

export function RateComparison({
  formData,
  results,
  baseMonthlyPayment,
  extraRepayment,
  displayFrequency,
  getPaymentDisplay,
  formatCurrency,
  getFrequencyLabel,
  convertFromMonthlyAmount,
}: RateComparisonProps) {
  // Define the order of terms for display
  const termOrder = ['6m', '1y', '18m', '2y', '3y', '4y', '5y', 'floating', 'Custom'];

  const bestOption = useMemo(() => {
    if (results.length === 0) return null;
    
    if (formData.preference === 'money') {
      // For money preference, find the option with the highest savings
      return results.reduce((best, current) => 
        current.totalSavings > best.totalSavings ? current : best
      , results[0]);
    } else {
      // For time preference, find the option with the most years saved
      return results.reduce((best, current) => 
        current.yearsSaved > best.yearsSaved ? current : best
      , results[0]);
    }
  }, [results, formData.preference]);

  const getTermDisplay = (term: string) => {
    if (term === 'Custom') return 'Custom Rate';
    if (term === 'floating') return 'Floating';
    if (term.endsWith('y')) return `${term.replace('y', ' Year(s)')}`;
    if (term.endsWith('m')) return `${term.replace('m', ' Months')}`;
    return term;
  };

  const annualExtraPayments = calculateAnnualSavings(extraRepayment, displayFrequency);

  // Sort results according to the predefined order
  const sortedResults = [...results].sort((a, b) => {
    const indexA = termOrder.indexOf(a.term);
    const indexB = termOrder.indexOf(b.term);
    return indexA - indexB;
  });
  const getMortgageTypeDisplay = (type: string) => {
    return type === 'principal-and-interest' ? 'Principal and Interest' : 'Interest Only';
  };
  return (
    <div className="bg-primary-50 p-6 lg:p-8 rounded-lg">
      <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-6">
        {formData.selectedBank} - Rate Comparison ({getMortgageTypeDisplay(formData.mortgageType)})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedResults.map((result, index) => (
          <div 
            key={index} 
            className="bg-white p-6 rounded-lg shadow-sm transition-all duration-300 h-full"
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
                    <span className="text-gray-600">Minimum Repayment:</span>
                    <span className="font-semibold text-primary-600">
                      {getPaymentDisplay(result.newPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Savings:</span>
                    <span className="font-semibold text-primary-600">
                      {getPaymentDisplay(baseMonthlyPayment - result.newPayment)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Savings Across Term:</span>
                    <span className="font-semibold text-primary-600">
                      ${formatCurrency(result.totalSavings)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Repayment:</span>
                      <span className="font-semibold text-primary-600">
                        ${formatCurrency(convertFromMonthlyAmount(result.newPayment, displayFrequency) + extraRepayment)} {getFrequencyLabel(displayFrequency)}
                    </span>
                    </div>
                    <div className="pl-4 space-y-1">
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Minimum Repayment:</span>
                        <span>{getPaymentDisplay(result.newPayment)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Extra Repayment:</span>
                        <span>${formatCurrency(extraRepayment)} per {displayFrequency.toLowerCase()} payment</span>
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
                      <span className="text-gray-600">Interest Saved Across Term:</span>
                      <span className="font-semibold text-primary-600">
                        ${formatCurrency(result.totalSaved)}
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