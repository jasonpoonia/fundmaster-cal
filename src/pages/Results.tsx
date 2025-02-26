import React, { useState } from 'react';
import { ArrowLeft, Clock, PiggyBank } from 'lucide-react';
import { FormData, PaymentFrequency } from '../types';
import { ExtraRepaymentModal } from '../components/modals/ExtraRepaymentModal';
import { FrequencySelector } from '../components/results/FrequencySelector';
import { CurrentMortgageSummary } from '../components/results/CurrentMortgageSummary';
import { ExtraRepaymentInput } from '../components/results/ExtraRepaymentInput';
import { RateComparison } from '../components/results/RateComparison';
import { ReportActions } from '../components/results/ReportActions';

type ResultsProps = {
  formData: FormData;
  results: any[];
  showExtraRepayment: boolean;
  extraRepayment: number;
  extraRepaymentResults: any;
  onExtraRepaymentToggle: () => void;
  onExtraRepaymentChange: (value: number) => void;
  onBack: () => void;
  onPreferenceChange: (preference: 'money' | 'time') => void;
  formatCurrency: (value: number) => string;
  getFrequencyLabel: (frequency: string) => string;
  convertFromMonthlyAmount: (amount: number, frequency: string) => number;
  getComparisonData: () => any[];
  getBaseMonthlyPayment: () => number;
};

export function Results({
  formData,
  results,
  showExtraRepayment,
  extraRepayment,
  extraRepaymentResults,
  onExtraRepaymentToggle,
  onExtraRepaymentChange,
  onBack,
  onPreferenceChange,
  formatCurrency,
  getFrequencyLabel,
  convertFromMonthlyAmount,
  getComparisonData,
  getBaseMonthlyPayment,
}: ResultsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayFrequency, setDisplayFrequency] = useState<PaymentFrequency>(formData.paymentFrequency);
  const baseMonthlyPayment = getBaseMonthlyPayment();

  const getPaymentDisplay = (monthlyAmount: number, frequency: PaymentFrequency = displayFrequency) => {
    const frequencyAmount = convertFromMonthlyAmount(monthlyAmount, frequency);
    return `$${formatCurrency(frequencyAmount)} ${getFrequencyLabel(frequency)}`;
  };

  const handlePreferenceSwitch = () => {
    const newPreference = formData.preference === 'money' ? 'time' : 'money';
    onExtraRepaymentChange(0);
    
    if (newPreference === 'time') {
      setIsModalOpen(true);
      return;
    }
    
    onPreferenceChange(newPreference);
  };

  const handleExtraRepaymentSubmit = (amount: number) => {
    onExtraRepaymentChange(amount);
    onPreferenceChange('time');
  };

  return (
    <div className="space-y-8">
      <ExtraRepaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleExtraRepaymentSubmit}
        formatCurrency={formatCurrency}
        getFrequencyLabel={getFrequencyLabel}
        paymentFrequency={displayFrequency}
      />

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-4">
          <FrequencySelector
            displayFrequency={displayFrequency}
            onFrequencyChange={setDisplayFrequency}
          />

          <button
            onClick={handlePreferenceSwitch}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors"
          >
            {formData.preference === 'money' ? (
              <>
                <Clock className="w-4 h-4" />
                <span>Switch to Save Term/Interest</span>
              </>
            ) : (
              <>
                <PiggyBank className="w-4 h-4" />
                <span>Switch to Lower Minimum Repayment</span>
              </>
            )}
          </button>
        </div>
      </div>

      <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700">
        Your Results
      </h2>

      <CurrentMortgageSummary
        formData={formData}
        baseMonthlyPayment={baseMonthlyPayment}
        getPaymentDisplay={(amount) => getPaymentDisplay(amount, 'fortnightly')}
        formatCurrency={formatCurrency}
      />

      {formData.preference === 'time' && (
        <ExtraRepaymentInput
          extraRepayment={extraRepayment}
          onExtraRepaymentChange={onExtraRepaymentChange}
          formatCurrency={formatCurrency}
          getFrequencyLabel={getFrequencyLabel}
          paymentFrequency={displayFrequency}
        />
      )}

      <RateComparison
        formData={formData}
        results={results}
        baseMonthlyPayment={baseMonthlyPayment}
        extraRepayment={extraRepayment}
        displayFrequency={displayFrequency}
        getPaymentDisplay={getPaymentDisplay}
        formatCurrency={formatCurrency}
      />

      <ReportActions
        formData={formData}
        results={results}
        extraRepayment={extraRepayment}
        extraRepaymentResults={extraRepaymentResults}
        formatCurrency={formatCurrency}
        getFrequencyLabel={getFrequencyLabel}
        convertFromMonthlyAmount={convertFromMonthlyAmount}
      />
    </div>
  );
}