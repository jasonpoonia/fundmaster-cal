import { PaymentFrequency } from '../types';

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-NZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
  const monthlyRate = rate / 100 / 12;
  const numberOfPayments = years * 12;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
};

export const calculateNewTerm = (principal: number, rate: number, payment: number) => {
  const monthlyRate = rate / 100 / 12;
  return Math.log(payment / (payment - principal * monthlyRate)) / (12 * Math.log(1 + monthlyRate));
};

export const calculateTotalInterest = (principal: number, monthlyPayment: number, years: number) => {
  return (monthlyPayment * years * 12) - principal;
};

// Convert any payment amount to its monthly equivalent
export const convertToMonthlyAmount = (amount: number, frequency: PaymentFrequency) => {
  switch (frequency) {
    case 'weekly':
      return amount * 52 / 12; // 52 weeks per year / 12 months
    case 'fortnightly':
      return amount * 26 / 12; // 26 fortnights per year / 12 months
    case 'monthly':
      return amount;
    default:
      return amount;
  }
};

// Convert any monthly amount to the specified frequency
export const convertFromMonthlyAmount = (monthlyAmount: number, frequency: PaymentFrequency) => {
  switch (frequency) {
    case 'weekly':
      return monthlyAmount * 12 / 52; // Convert monthly to weekly
    case 'fortnightly':
      return monthlyAmount * 12 / 26; // Convert monthly to fortnightly
    case 'monthly':
      return monthlyAmount;
    default:
      return monthlyAmount;
  }
};

// Calculate total annual savings based on frequency and amount
export const calculateAnnualSavings = (amount: number, frequency: PaymentFrequency) => {
  switch (frequency) {
    case 'weekly':
      return amount * 52; // 52 weeks per year
    case 'fortnightly':
      return amount * 26; // 26 fortnights per year
    case 'monthly':
      return amount * 12; // 12 months per year
    default:
      return amount * 12;
  }
};

// Calculate loan balance at any point in time
export const calculateLoanBalance = (
  principal: number,
  annualRate: number,
  monthlyPayment: number,
  monthsPassed: number
) => {
  const monthlyRate = annualRate / 100 / 12;
  let balance = principal;

  for (let i = 0; i < monthsPassed; i++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance = Math.max(0, balance - principalPayment);
  }

  return balance;
};

export const getFrequencyLabel = (frequency: PaymentFrequency) => {
  switch (frequency) {
    case 'weekly':
      return 'Weekly';
    case 'fortnightly':
      return 'Fortnightly';
    case 'monthly':
      return 'Monthly';
    default:
      return '';
  }
};