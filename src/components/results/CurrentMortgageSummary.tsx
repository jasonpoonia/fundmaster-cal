import React from 'react';
import { FormData } from '../../types';
import { SummaryItem } from './SummaryItem';
import { convertToMonthlyAmount } from '../../utils/calculations';

type CurrentMortgageSummaryProps = {
  formData: FormData;
  baseMonthlyPayment: number;
  getPaymentDisplay: (monthlyAmount: number, frequency?: string) => string;
  formatCurrency: (value: number) => string;
};

export function CurrentMortgageSummary({
  formData,
  baseMonthlyPayment,
  getPaymentDisplay,
  formatCurrency,
}: CurrentMortgageSummaryProps) {
  const frequencyLabel = formData.paymentFrequency === 'fortnightly' ? 'Fortnightly' : 
                     formData.paymentFrequency === 'weekly' ? 'Weekly' : 'Monthly';
                     
  return (
    <div className="space-y-2">
      <div className="bg-gray-50 p-6 lg:p-8 rounded-lg border border-gray-200">
        <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-6">
          Current Mortgage Summary
        </h3>
        <div className="text-sm text-gray-600 mb-4">
        All repayment amounts shown are {frequencyLabel.toLowerCase()}
      </div>
        <div className="grid grid-cols-3 gap-6">
          <SummaryItem
            label="Loan Amount"
            value={`${formatCurrency(formData.loanAmount)}`}
          />
          <SummaryItem
            label="Interest Rate"
            value={`${formData.currentRate}%`}
          />
          <SummaryItem
            label="Remaining Term"
            value={`${formData.currentTerm} years`}
          />
          <SummaryItem
            label="Minimum Repayment"
            value={getPaymentDisplay(baseMonthlyPayment, formData.paymentFrequency)}
          />
          <SummaryItem
          label="Extra Repayment"
          value={`${formatCurrency(formData.currentExtraRepayment)}`}
        />
          <SummaryItem
            label="Total Repayment"
            value={getPaymentDisplay(baseMonthlyPayment + convertToMonthlyAmount(formData.currentExtraRepayment, formData.paymentFrequency), formData.paymentFrequency)}
          />
        </div>
      </div>
      
    </div>
  );
}