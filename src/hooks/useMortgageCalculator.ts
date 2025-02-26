import { useState } from 'react';
import { FormData, PaymentFrequency } from '../types';
import { banks } from '../data/banks';
import {
  calculateMonthlyPayment,
  calculateNewTerm,
  calculateTotalInterest,
  convertToMonthlyAmount,
  convertFromMonthlyAmount,
  calculateAnnualSavings,
  calculateLoanBalance
} from '../utils/calculations';

export function useMortgageCalculator() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    loanAmount: 0,
    currentRate: '',
    currentTerm: '',
    mortgageType: 'principal-and-interest',
    paymentFrequency: 'fortnightly',
    hasExtraRepayments: false,
    currentExtraRepayment: 0,
    preference: '',
    selectedBank: '',
    selectedTerms: [],
    customRate: 0,
    customRates: {}
  });

  const [extraRepayment, setExtraRepayment] = useState<number>(0);
  const [showExtraRepayment, setShowExtraRepayment] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'loanAmount') {
      const numericValue = typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value.toString();
      const numberValue = numericValue ? parseInt(numericValue) : 0;
      setFormData(prev => ({
        ...prev,
        [name]: numberValue
      }));
    } else if (name === 'currentExtraRepayment') {
      const numericValue = typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value.toString();
      const numberValue = numericValue ? parseInt(numericValue) : 0;
      setFormData(prev => ({
        ...prev,
        [name]: numberValue
      }));
    } else if (name === 'currentRate' || name === 'currentTerm') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    } else if (type === 'checkbox') {
      if (name === 'hasExtraRepayments') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
          ...prev,
          [name]: checked,
          currentExtraRepayment: checked ? prev.currentExtraRepayment : 0
        }));
      } else if (name.startsWith('term_')) {
        const termKey = name.replace('term_', '');
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
          ...prev,
          selectedTerms: checked 
            ? [...prev.selectedTerms, termKey]
            : prev.selectedTerms.filter(t => t !== termKey)
        }));
      }
    } else {
      if (name === 'selectedBank') {
        const bank = banks.find(b => b.name === value);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          selectedTerms: bank && bank.name !== 'Custom Rate' ? Object.keys(bank.rates) : [],
          customRates: {}
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const updateCustomRate = (term: string, rate: number) => {
    setFormData(prev => ({
      ...prev,
      customRates: {
        ...prev.customRates,
        [term]: rate
      }
    }));
  };

  const getBaseMonthlyPayment = () => {
    if (!formData.currentRate || !formData.currentTerm) return 0;
    
    if (formData.mortgageType === 'interest-only') {
      return (formData.loanAmount * (formData.currentRate / 100)) / 12;
    }
    return calculateMonthlyPayment(
      formData.loanAmount,
      formData.currentRate,
      formData.currentTerm
    );
  };

  const calculateWithExtraRepayment = (
    principal: number,
    rate: number,
    regularPayment: number,
    extraAmount: number,
    frequency: PaymentFrequency
  ) => {
    const monthlyRate = rate / 100 / 12;
    const totalMonths = (formData.currentTerm as number) * 12;
    
    // Convert extra payment to its monthly equivalent based on frequency
    let monthlyExtraPayment = 0;
    
    switch (frequency) {
      case 'weekly':
        // 52 weeks per year / 12 months = 4.33 weeks per month
        monthlyExtraPayment = extraAmount * 4.33;
        break;
      case 'fortnightly':
        // 26 fortnights per year / 12 months = 2.17 fortnights per month
        monthlyExtraPayment = extraAmount * 2.17;
        break;
      case 'monthly':
        monthlyExtraPayment = extraAmount;
        break;
    }
    
    // Calculate total monthly payment including extra
    const totalMonthlyPayment = regularPayment + monthlyExtraPayment;

    // Calculate original loan details (without extra payments)
    let originalBalance = principal;
    let originalTotalInterest = 0;
    
    for (let month = 0; month < totalMonths; month++) {
      const monthlyInterest = originalBalance * monthlyRate;
      originalTotalInterest += monthlyInterest;
      const principalPayment = regularPayment - monthlyInterest;
      originalBalance = Math.max(0, originalBalance - principalPayment);
    }

    // Calculate new loan details with extra payments
    let newBalance = principal;
    let newTotalInterest = 0;
    let month = 0;

    while (newBalance > 0 && month < totalMonths) {
      const monthlyInterest = newBalance * monthlyRate;
      newTotalInterest += monthlyInterest;
      const totalPrincipalPayment = totalMonthlyPayment - monthlyInterest;
      newBalance = Math.max(0, newBalance - totalPrincipalPayment);
      month++;
    }

    // Calculate new term in years and total interest saved
    const newTermInYears = month / 12;
    const yearsSaved = (formData.currentTerm as number) - newTermInYears;
    const interestSaved = originalTotalInterest - newTotalInterest;

    // Calculate annual extra payment based on frequency for display
    const annualExtraPayment = calculateAnnualSavings(extraAmount, frequency);

    return {
      newTerm: newTermInYears,
      monthsSaved: totalMonths - month,
      yearsSaved: yearsSaved,
      totalSaved: interestSaved,
      annualExtraPayment: annualExtraPayment
    };
  };

  const getSelectedBankRates = () => {
    if (!formData.currentRate || !formData.currentTerm) return [];
    
    if (formData.selectedBank === 'Custom Rate') {
      const newRate = formData.customRate || 0;
      const baseMonthlyPayment = getBaseMonthlyPayment();
      const newMonthlyPayment = formData.mortgageType === 'interest-only'
        ? (formData.loanAmount * (newRate / 100)) / 12
        : calculateMonthlyPayment(formData.loanAmount, newRate, formData.currentTerm as number);
      
      if (formData.preference === 'money') {
        const currentPayment = baseMonthlyPayment + convertToMonthlyAmount(formData.currentExtraRepayment, formData.paymentFrequency);
        const newPayment = newMonthlyPayment + convertToMonthlyAmount(extraRepayment, formData.paymentFrequency);

        return [{
          term: 'Custom',
          currentRate: formData.currentRate,
          newRate,
          currentPayment,
          newPayment,
          monthlySavings: currentPayment - newPayment,
          totalSavings: calculateTotalInterest(formData.loanAmount, currentPayment, formData.currentTerm as number) - 
                       calculateTotalInterest(formData.loanAmount, newPayment, formData.currentTerm as number),
          frequency: formData.paymentFrequency
        }];
      } else {
        const extraRepaymentResults = calculateWithExtraRepayment(
          formData.loanAmount,
          newRate,
          newMonthlyPayment,
          extraRepayment,
          formData.paymentFrequency
        );

        return [{
          term: 'Custom',
          currentRate: formData.currentRate,
          newRate,
          currentTerm: formData.currentTerm,
          newTerm: extraRepaymentResults.newTerm,
          yearsSaved: extraRepaymentResults.yearsSaved,
          monthsSaved: extraRepaymentResults.monthsSaved,
          newPayment: newMonthlyPayment,
          totalSaved: extraRepaymentResults.totalSaved,
          annualExtraPayment: extraRepaymentResults.annualExtraPayment
        }];
      }
    }

    const bank = banks.find(b => b.name === formData.selectedBank);
    if (!bank) return [];

    return formData.selectedTerms.map(term => {
      const defaultRate = bank.rates[term];
      const newRate = formData.customRates[term] !== undefined ? formData.customRates[term] : defaultRate;
      const baseMonthlyPayment = getBaseMonthlyPayment();
      const newMonthlyPayment = formData.mortgageType === 'interest-only'
        ? (formData.loanAmount * (newRate / 100)) / 12
        : calculateMonthlyPayment(formData.loanAmount, newRate, formData.currentTerm as number);
      
      if (formData.preference === 'money') {
        const currentPayment = baseMonthlyPayment + convertToMonthlyAmount(formData.currentExtraRepayment, formData.paymentFrequency);
        const newPayment = newMonthlyPayment + convertToMonthlyAmount(extraRepayment, formData.paymentFrequency);

        return {
          term,
          currentRate: formData.currentRate,
          newRate,
          currentPayment,
          newPayment,
          monthlySavings: currentPayment - newPayment,
          totalSavings: calculateTotalInterest(formData.loanAmount, currentPayment, formData.currentTerm as number) - 
                       calculateTotalInterest(formData.loanAmount, newPayment, formData.currentTerm as number),
          frequency: formData.paymentFrequency
        };
      } else {
        const extraRepaymentResults = calculateWithExtraRepayment(
          formData.loanAmount,
          newRate,
          newMonthlyPayment,
          extraRepayment,
          formData.paymentFrequency
        );

        return {
          term,
          currentRate: formData.currentRate,
          newRate,
          currentTerm: formData.currentTerm,
          newTerm: extraRepaymentResults.newTerm,
          yearsSaved: extraRepaymentResults.yearsSaved,
          monthsSaved: extraRepaymentResults.monthsSaved,
          newPayment: newMonthlyPayment,
          totalSaved: extraRepaymentResults.totalSaved,
          annualExtraPayment: extraRepaymentResults.annualExtraPayment
        };
      }
    });
  };

  const getComparisonData = () => {
    const results = getSelectedBankRates();
    if (results.length === 0) return [];

    if (formData.preference === 'money') {
      return results.map(result => ({
        name: result.term === 'Custom' ? 'Custom Rate' : 
          result.term === 'floating' ? 'Floating' :
          result.term.endsWith('y') ? `${result.term.replace('y', ' Year')}` :
          `${result.term.replace('m', ' Month')}`,
        currentPayment: result.currentPayment,
        newPayment: result.newPayment,
        savings: result.monthlySavings
      }));
    } else {
      return results.map(result => ({
        name: result.term === 'Custom' ? 'Custom Rate' :
          result.term === 'floating' ? 'Floating' :
          result.term.endsWith('y') ? `${result.term.replace('y', ' Year')}` :
          `${result.term.replace('m', ' Month')}`,
        currentTerm: result.currentTerm,
        newTerm: result.newTerm,
        yearsSaved: result.yearsSaved,
        totalSaved: result.totalSaved,
        annualExtraPayment: result.annualExtraPayment
      }));
    }
  };

  return {
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
  };
}