export type PaymentFrequency = 'weekly' | 'fortnightly' | 'monthly';
export type MortgageType = 'principal-and-interest' | 'interest-only';

export type Bank = {
  name: string;
  rates: {
    [key: string]: number;
  };
};

export type FormData = {
  name: string;
  email: string;
  phone: string;
  loanAmount: number;
  currentRate: number | '';
  currentTerm: number | '';
  mortgageType: MortgageType;
  paymentFrequency: PaymentFrequency;
  hasExtraRepayments: boolean;
  currentExtraRepayment: number;
  preference: 'time' | 'money' | '';
  selectedBank: string;
  selectedTerms: string[];
  customRate?: number;
  customRates: Record<string, number>;
};