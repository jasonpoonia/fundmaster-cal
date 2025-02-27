import React, { useState } from 'react';
import { Download, Mail, Loader2 } from 'lucide-react';
import { FormData, PaymentFrequency } from '../../types';
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
  displayFrequency: PaymentFrequency;
};

export function ReportActions({
  formData,
  results,
  extraRepayment,
  extraRepaymentResults,
  formatCurrency,
  getFrequencyLabel,
  convertFromMonthlyAmount,
  displayFrequency,
}: ReportActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const doc = generatePDFReport(
        formData,
        results,
        extraRepayment,
        extraRepaymentResults,
        formatCurrency,
        getFrequencyLabel,
        convertFromMonthlyAmount
      );
      doc.save(`fundmaster-mortgage-report-${formData.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating your report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmailReport = async () => {
    setIsSending(true);
    try {
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
    } catch (error) {
      console.error('Error sending report:', error);
      alert('There was an error sending your report. Please try downloading instead.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Report...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Download Report
          </>
        )}
      </button>
      <button
        onClick={handleEmailReport}
        disabled={isSending}
        className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending Report...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" />
            Email Report
          </>
        )}
      </button>
    </div>
  );
}