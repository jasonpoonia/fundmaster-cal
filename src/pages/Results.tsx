import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, PiggyBank } from 'lucide-react';
import { FormData, PaymentFrequency } from '../types';
import { ExtraRepaymentModal } from '../components/modals/ExtraRepaymentModal';
import { FrequencySelector } from '../components/results/FrequencySelector';
import { CurrentMortgageSummary } from '../components/results/CurrentMortgageSummary';
import { ExtraRepaymentInput } from '../components/results/ExtraRepaymentInput';
import { RateComparison } from '../components/results/RateComparison';
import { ReportActions } from '../components/results/ReportActions';
import { MortgageBalanceChart } from '../components/results/MortgageBalanceChart';
import { calculateLoanBalance } from '../utils/calculations';

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
  displayFrequency: PaymentFrequency;
  onDisplayFrequencyChange: (frequency: PaymentFrequency) => void;
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
  displayFrequency,
  onDisplayFrequencyChange
}: ResultsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mortgageBalanceData, setMortgageBalanceData] = useState<any[]>([]);
  const baseMonthlyPayment = getBaseMonthlyPayment();

  // Generate mortgage balance data for chart
  useEffect(() => {
    if (results.length === 0 || !formData.currentTerm) return;

    const years = Math.ceil(formData.currentTerm as number);
    const data = [];

    for (let year = 0; year <= years; year++) {
      const dataPoint: any = { year };
      
      // Current rate balance
      dataPoint.currentBalance = calculateLoanBalance(
        formData.loanAmount,
        formData.currentRate as number,
        baseMonthlyPayment,
        year * 12
      );
      
      // Add balance for each term option
      results.forEach(result => {
        // For time preference with extra repayments, calculate with extra payments
        if (formData.preference === 'time' && extraRepayment > 0) {
          const monthlyExtraPayment = convertFromMonthlyAmount(extraRepayment, displayFrequency) * 
            (displayFrequency === 'weekly' ? 4.33 : displayFrequency === 'fortnightly' ? 2.17 : 1);
          
          dataPoint[result.term] = calculateLoanBalance(
            formData.loanAmount,
            result.newRate,
            result.newPayment + monthlyExtraPayment,
            year * 12
          );
        } else {
          dataPoint[result.term] = calculateLoanBalance(
            formData.loanAmount,
            result.newRate,
            result.newPayment,
            year * 12
          );
        }
      });
      
      data.push(dataPoint);
    }
    
    setMortgageBalanceData(data);
  }, [formData, results, baseMonthlyPayment, extraRepayment, displayFrequency]);

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

  const handleFrequencyChange = (newFrequency: PaymentFrequency) => {
    onDisplayFrequencyChange(newFrequency);
  };

  return (
    <div className="space-y-8">
      <ExtraRepaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleExtraRepaymentSubmit}
        formatCurrency={formatCurrency}
      />

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700">
        Your Results
      </h2>

      <CurrentMortgageSummary
        formData={formData}
        baseMonthlyPayment={baseMonthlyPayment}
        getPaymentDisplay={getPaymentDisplay}
        formatCurrency={formatCurrency}
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg">
        <FrequencySelector
          displayFrequency={displayFrequency}
          onFrequencyChange={handleFrequencyChange}
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
        getFrequencyLabel={getFrequencyLabel}
        convertFromMonthlyAmount={convertFromMonthlyAmount}
      />

      {mortgageBalanceData.length > 0 && (
        <MortgageBalanceChart
          mortgageBalanceData={mortgageBalanceData}
          results={results}
          formatCurrency={formatCurrency}
        />
      )}

      <ReportActions
        formData={formData}
        results={results}
        extraRepayment={extraRepayment}
        extraRepaymentResults={extraRepaymentResults}
        formatCurrency={formatCurrency}
        getFrequencyLabel={getFrequencyLabel}
        convertFromMonthlyAmount={convertFromMonthlyAmount}
        displayFrequency={displayFrequency}
      />
    </div>
  );
}