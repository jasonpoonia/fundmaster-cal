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

export const convertToMonthlyAmount = (amount: number, frequency: PaymentFrequency) => {
  switch (frequency) {
    case 'weekly':
      return amount * 52 / 12;
    case 'fortnightly':
      return amount * 26 / 12;
    case 'monthly':
      return amount;
    default:
      return amount;
  }
};

export const convertFromMonthlyAmount = (monthlyAmount: number, frequency: PaymentFrequency) => {
  switch (frequency) {
    case 'weekly':
      return monthlyAmount * 12 / 52;
    case 'fortnightly':
      return monthlyAmount * 12 / 26;
    case 'monthly':
      return monthlyAmount;
    default:
      return monthlyAmount;
  }
};

export const convertToFortnightly = (amount: number, fromFrequency: PaymentFrequency): number => {
  // First convert to monthly, then to fortnightly
  const monthlyAmount = convertToMonthlyAmount(amount, fromFrequency);
  return convertFromMonthlyAmount(monthlyAmount, 'fortnightly');
};

export const convertFromFortnightly = (fortnightlyAmount: number, toFrequency: PaymentFrequency): number => {
  // First convert to monthly, then to target frequency
  const monthlyAmount = convertToMonthlyAmount(fortnightlyAmount, 'fortnightly');
  return convertFromMonthlyAmount(monthlyAmount, toFrequency);
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