import React from 'react';
import { FormData } from '../../types';
import { SummaryItem } from './SummaryItem';

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
  return (
    <div className="bg-gray-50 p-6 lg:p-8 rounded-lg border border-gray-200">
      <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-6">
        Current Mortgage Summary
      </h3>
      <div className="grid grid-cols-3 gap-6">
        <SummaryItem
          label="Loan Amount"
          value={`$${formatCurrency(formData.loanAmount)}`}
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
          value={`$${formatCurrency(formData.currentExtraRepayment)} ${formData.paymentFrequency === 'fortnightly' ? 'Fortnightly' : formData.paymentFrequency === 'weekly' ? 'Weekly' : 'Monthly'}`}
        />
        <SummaryItem
          label="Total Repayment"
          value={getPaymentDisplay(baseMonthlyPayment + formData.currentExtraRepayment, formData.paymentFrequency)}
        />
      </div>
    </div>
  );
}