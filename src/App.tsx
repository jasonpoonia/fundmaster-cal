import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { PersonalInfo } from './pages/PersonalInfo';
import { MortgageDetails } from './pages/MortgageDetails';
import { BankSelection } from './pages/BankSelection';
import { PreferenceSelection } from './pages/PreferenceSelection';
import { Results } from './pages/Results';
import { useMortgageCalculator } from './hooks/useMortgageCalculator';
import { calculateMonthlyPayment } from './utils/calculations';
import { banks } from './data/banks';
import { formatCurrency, getFrequencyLabel, convertFromMonthlyAmount } from './utils/calculations';
import { PaymentFrequency } from './types';

function App() {
  const [step, setStep] = useState(1);
  const [displayFrequency, setDisplayFrequency] = useState<PaymentFrequency>('fortnightly');
  const {
    formData,
    extraRepayment,
    showExtraRepayment,
    handleInputChange,
    setFormData,
    setExtraRepayment,
    setShowExtraRepayment,
    getBaseMonthlyPayment,
    calculateWithExtraRepayment,
    getSelectedBankRates,
    getComparisonData,
    updateCustomRate
  } = useMortgageCalculator();

  const handleNext = () => {
    if (step === 1) {
      if (!formData.loanAmount || !formData.currentRate || !formData.currentTerm) {
        alert('Please fill in all mortgage details');
        return;
      }
      if (formData.hasExtraRepayments && !formData.currentExtraRepayment) {
        alert('Please enter your current extra repayment amount');
        return;
      }
    } else if (step === 2) {
      if (!formData.selectedBank || 
          (formData.selectedBank !== 'Custom Rate' && formData.selectedTerms.length === 0) || 
          (formData.selectedBank === 'Custom Rate' && !formData.customRate)) {
        alert('Please select a bank and at least one term');
        return;
      }
    } else if (step === 4) {
      if (!formData.name || !formData.email || !formData.phone) {
        alert('Please fill in all personal information fields');
        return;
      }
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert('Please enter a valid email address');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handlePreferenceChange = (newPreference: 'money' | 'time', callback?: () => void) => {
    setFormData(prev => {
      const updatedData = { ...prev, preference: newPreference };
      // Call the callback after state update is complete
      if (callback) setTimeout(callback, 0);
      return updatedData;
    });
  };

  const handleDisplayFrequencyChange = (newFrequency: PaymentFrequency) => {
    setDisplayFrequency(newFrequency);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 lg:py-12 flex-grow">
        <div className="w-full bg-white rounded-xl shadow-lg p-6 lg:p-12">
          <div className="mb-8 lg:mb-12">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="w-12 h-12 lg:w-16 lg:h-16 text-primary-500" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-center text-gray-800 mb-2">
              Mortgage Repayment Calculator
            </h1>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-6 lg:mt-8">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="w-full">
            {step === 1 && (
              <MortgageDetails
                formData={formData}
                onInputChange={handleInputChange}
                onNext={handleNext}
                formatCurrency={formatCurrency}
                getFrequencyLabel={getFrequencyLabel}
              />
            )}

            {step === 2 && (
              <BankSelection
                formData={formData}
                banks={banks}
                onInputChange={handleInputChange}
                onNext={handleNext}
                onBack={handleBack}
                updateCustomRate={updateCustomRate}
              />
            )}

            {step === 3 && (
              <PreferenceSelection
                formData={formData}
                onPreferenceSelect={handlePreferenceChange}
                onNext={handleNext}
                onBack={handleBack}
                extraRepayment={extraRepayment}
                onExtraRepaymentChange={setExtraRepayment}
                getFrequencyLabel={getFrequencyLabel}
                formatCurrency={formatCurrency}
              />
            )}

            {step === 4 && (
              <PersonalInfo
                formData={formData}
                onInputChange={handleInputChange}
                onNext={handleNext}
                onBack={handleBack}
              />
            )}

            {step === 5 && (
              <Results
                formData={formData}
                results={getSelectedBankRates(displayFrequency)}
                showExtraRepayment={showExtraRepayment}
                extraRepayment={extraRepayment}
                extraRepaymentResults={
                  extraRepayment > 0
                    ? calculateWithExtraRepayment(
                        formData.loanAmount,
                        getSelectedBankRates(displayFrequency)[0].newRate,
                        calculateMonthlyPayment(
                          formData.loanAmount,
                          getSelectedBankRates(displayFrequency)[0].newRate,
                          formData.currentTerm
                        ),
                        extraRepayment,
                        displayFrequency
                      )
                    : null
                }
                onExtraRepaymentToggle={() => setShowExtraRepayment(!showExtraRepayment)}
                onExtraRepaymentChange={setExtraRepayment}
                onBack={handleBack}
                onPreferenceChange={handlePreferenceChange}
                formatCurrency={formatCurrency}
                getFrequencyLabel={getFrequencyLabel}
                convertFromMonthlyAmount={convertFromMonthlyAmount}
                getComparisonData={() => getComparisonData(displayFrequency)}
                getBaseMonthlyPayment={getBaseMonthlyPayment}
                displayFrequency={displayFrequency}
                onDisplayFrequencyChange={handleDisplayFrequencyChange}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="py-3 text-center text-gray-500 text-sm bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto">
          Developed by{' '}
          <a 
            href="https://lucidmedia.co.nz/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-800 transition-colors"
          >
            Lucid Media
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;