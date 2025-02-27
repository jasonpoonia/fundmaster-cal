import { PaymentFrequency } from '../types';

// Helper function to round to a specific number of decimal places
const roundToPrecision = (value: number, decimals: number = 2): number => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const formatCurrency = (value: number) => {
  // Ensure value is rounded before formatting
  const roundedValue = roundToPrecision(value, 2);
  return new Intl.NumberFormat('en-NZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(roundedValue);
};

export const calculateMonthlyPayment = (principal: number, rate: number, years: number) => {
  const monthlyRate = rate / 100 / 12;
  const numberOfPayments = years * 12;
  const payment = (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
  return roundToPrecision(payment, 4); // Higher precision for intermediate calculation
};

export const calculateNewTerm = (principal: number, rate: number, payment: number) => {
  const monthlyRate = rate / 100 / 12;
  const term = Math.log(payment / (payment - principal * monthlyRate)) / (12 * Math.log(1 + monthlyRate));
  return roundToPrecision(term, 4); // Higher precision for intermediate calculation
};

export const calculateTotalInterest = (principal: number, monthlyPayment: number, years: number) => {
  const totalPayments = roundToPrecision(monthlyPayment * years * 12, 2);
  return roundToPrecision(totalPayments - principal, 2);
};

// Convert any payment amount to its monthly equivalent
export const convertToMonthlyAmount = (amount: number, frequency: PaymentFrequency) => {
  let result: number;
  switch (frequency) {
    case 'weekly':
      result = amount * 52 / 12; // 52 weeks per year / 12 months
      break;
    case 'fortnightly':
      result = amount * 26 / 12; // 26 fortnights per year / 12 months
      break;
    case 'monthly':
      result = amount;
      break;
    default:
      result = amount;
  }
  return roundToPrecision(result, 4); // Higher precision for intermediate calculation
};

// Convert any monthly amount to the specified frequency
export const convertFromMonthlyAmount = (monthlyAmount: number, frequency: PaymentFrequency) => {
  let result: number;
  switch (frequency) {
    case 'weekly':
      result = monthlyAmount * 12 / 52; // Convert monthly to weekly
      break;
    case 'fortnightly':
      result = monthlyAmount * 12 / 26; // Convert monthly to fortnightly
      break;
    case 'monthly':
      result = monthlyAmount;
      break;
    default:
      result = monthlyAmount;
  }
  return roundToPrecision(result, 2); // Round to cents
};

// Calculate total annual savings based on frequency and amount
export const calculateAnnualSavings = (amount: number, frequency: PaymentFrequency) => {
  let result: number;
  switch (frequency) {
    case 'weekly':
      result = amount * 52; // 52 weeks per year
      break;
    case 'fortnightly':
      result = amount * 26; // 26 fortnights per year
      break;
    case 'monthly':
      result = amount * 12; // 12 months per year
      break;
    default:
      result = amount * 12;
  }
  return roundToPrecision(result, 2);
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
    const interestPayment = roundToPrecision(balance * monthlyRate, 6);
    const principalPayment = roundToPrecision(monthlyPayment - interestPayment, 6);
    balance = Math.max(0, roundToPrecision(balance - principalPayment, 2));
  }

  return roundToPrecision(balance, 2);
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

// Calculate total savings consistently from per-payment savings
export const calculateTotalSavingsFromPerPayment = (
  perPaymentSavings: number, 
  frequency: PaymentFrequency, 
  termYears: number
): number => {
  // Get exact number of payments based on frequency
  let paymentsPerYear: number;
  switch (frequency) {
    case 'weekly':
      paymentsPerYear = 52;
      break;
    case 'fortnightly':
      paymentsPerYear = 26;
      break;
    case 'monthly':
      paymentsPerYear = 12;
      break;
    default:
      paymentsPerYear = 12;
  }
  
  const totalPayments = paymentsPerYear * termYears;
  return roundToPrecision(perPaymentSavings * totalPayments, 2);
};

// Calculate loan payoff with extra payments
export const calculateLoanWithExtraPayments = (
  principal: number,
  annualRate: number,
  regularMonthlyPayment: number,
  extraPayment: number,
  frequency: PaymentFrequency,
  termYears: number
) => {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = termYears * 12;
  
  // Convert extra payment to monthly equivalent based on frequency
  const monthlyExtraPayment = convertToMonthlyAmount(extraPayment, frequency);
  
  // Calculate total monthly payment
  const totalMonthlyPayment = roundToPrecision(regularMonthlyPayment + monthlyExtraPayment, 4);
  
  // Calculate original loan details (without extra payments)
  let originalBalance = principal;
  let originalTotalInterest = 0;
  
  for (let month = 0; month < totalMonths; month++) {
    const monthlyInterest = roundToPrecision(originalBalance * monthlyRate, 6);
    originalTotalInterest = roundToPrecision(originalTotalInterest + monthlyInterest, 6);
    const principalPayment = roundToPrecision(regularMonthlyPayment - monthlyInterest, 6);
    originalBalance = Math.max(0, roundToPrecision(originalBalance - principalPayment, 2));
  }
  
  // Calculate new loan details with extra payments
  let newBalance = principal;
  let newTotalInterest = 0;
  let month = 0;
  
  while (newBalance > 0 && month < totalMonths) {
    const monthlyInterest = roundToPrecision(newBalance * monthlyRate, 6);
    newTotalInterest = roundToPrecision(newTotalInterest + monthlyInterest, 6);
    const principalPayment = roundToPrecision(totalMonthlyPayment - monthlyInterest, 6);
    newBalance = Math.max(0, roundToPrecision(newBalance - principalPayment, 2));
    month++;
  }
  
  // Calculate results
  const newTermInYears = roundToPrecision(month / 12, 4);
  const yearsSaved = roundToPrecision(termYears - newTermInYears, 2);
  const interestSaved = roundToPrecision(originalTotalInterest - newTotalInterest, 2);
  const annualExtraPayment = calculateAnnualSavings(extraPayment, frequency);
  
  return {
    newTerm: newTermInYears,
    monthsSaved: totalMonths - month,
    yearsSaved: yearsSaved,
    totalSaved: interestSaved,
    annualExtraPayment: annualExtraPayment
  };
};