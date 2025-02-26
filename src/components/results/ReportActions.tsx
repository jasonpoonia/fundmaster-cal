import React from 'react';
import { Download, Mail } from 'lucide-react';
import { FormData } from '../../types';
import { generatePDFReport } from '../../utils/reportGenerator';
import { sendEmailReport } from '../../utils/emailService';

type ReportActionsProps = {
  formData: FormData;
  results: any[];
  extraRepayment: number;
  extraRepaymentResults: any;
  formatCurrency: (value: number) => string;
  getFrequencyLabel: (frequency: string) => string;
  convertFromMonthlyAmount: (amount: number, frequency: string) => number;
};

export function ReportActions({
  formData,
  results,
  extraRepayment,
  extraRepaymentResults,
  formatCurrency,
  getFrequencyLabel,
  convertFromMonthlyAmount,
}: ReportActionsProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <button
        onClick={() => {
          const doc = generatePDFReport(
            formData,
            results,
            extraRepayment,
            extraRepaymentResults,
            formatCurrency,
            getFrequencyLabel,
            convertFromMonthlyAmount
          );
          doc.save('fundmaster-mortgage-report.pdf');
        }}
        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <Download className="w-4 h-4" />
        Download Report
      </button>
      <button
        onClick={async () => {
          const doc = generatePDFReport(
            formData,
            results,
            extraRepayment,
            extraRepaymentResults,
            formatCurrency,
            getFrequencyLabel,
            convertFromMonthlyAmount
          );
          const pdfBlob = doc.output('blob');
          const success = await sendEmailReport(formData, pdfBlob);
          
          if (success) {
            alert('Report has been sent to your email!');
          } else {
            alert('Failed to send report. Please try downloading instead.');
          }
        }}
        className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
      >
        <Mail className="w-4 h-4" />
        Email Report
      </button>
    </div>
  );
}