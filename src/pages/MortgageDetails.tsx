import React, { useState } from 'react';
import { FormData } from '../types';
import { LoanAmountInput } from '../components/mortgage/LoanAmountInput';
import { MortgageTypeSelect } from '../components/mortgage/MortgageTypeSelect';
import { InterestRateInput } from '../components/mortgage/InterestRateInput';
import { LoanTermInput } from '../components/mortgage/LoanTermInput';
import { PaymentFrequencySelect } from '../components/mortgage/PaymentFrequencySelect';
import { ExtraRepaymentToggle } from '../components/mortgage/ExtraRepaymentToggle';

type MortgageDetailsProps = {
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onNext: () => void;
  formatCurrency: (value: number) => string;
  getFrequencyLabel: (frequency: string) => string;
};

export function MortgageDetails({
  formData,
  onInputChange,
  onNext,
  getFrequencyLabel,
}: MortgageDetailsProps) {
  const [showInterestOnlyWarning, setShowInterestOnlyWarning] = useState(false);

  const handleMortgageTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    
    if (newType === 'interest-only' && Number(formData.currentTerm) > 5) {
      setShowInterestOnlyWarning(true);
      const syntheticEvent = {
        target: {
          name: 'currentTerm',
          value: '5'
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onInputChange(syntheticEvent);
    }
    
    onInputChange(e);
  };

  const handleTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTerm = Number(e.target.value);
    const maxTerm = formData.mortgageType === 'interest-only' ? 5 : 30;
    
    if (newTerm > maxTerm) {
      const syntheticEvent = {
        target: {
          name: 'currentTerm',
          value: maxTerm.toString()
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onInputChange(syntheticEvent);
      
      if (formData.mortgageType === 'interest-only') {
        setShowInterestOnlyWarning(true);
      }
      return;
    }
    
    onInputChange(e);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Current Mortgage Details
      </h2>
      <div className="space-y-4">
        <LoanAmountInput
          value={formData.loanAmount}
          onChange={onInputChange}
        />
        
        <MortgageTypeSelect
          value={formData.mortgageType}
          onChange={handleMortgageTypeChange}
        />
        
        <InterestRateInput
          value={formData.currentRate}
          onChange={onInputChange}
        />
        
        <LoanTermInput
          value={formData.currentTerm}
          onChange={handleTermChange}
          mortgageType={formData.mortgageType}
          showWarning={showInterestOnlyWarning}
        />
        
        <PaymentFrequencySelect
          value={formData.paymentFrequency}
          onChange={onInputChange}
        />
        
        <ExtraRepaymentToggle
          checked={formData.hasExtraRepayments}
          onChange={onInputChange}
          currentExtraRepayment={formData.currentExtraRepayment}
          onExtraRepaymentChange={onInputChange}
          getFrequencyLabel={getFrequencyLabel}
          paymentFrequency={formData.paymentFrequency}
        />
      </div>
      
      <div className="mt-6">
        <button
          onClick={onNext}
          className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}