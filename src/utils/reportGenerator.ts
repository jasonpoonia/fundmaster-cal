import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FormData } from '../types';

const FUNDMASTER_LOGO = 'https://i.imgur.com/YourLogoHere.png';

export const generatePDFReport = (
  formData: FormData,
  results: any[],
  extraRepayment: number,
  extraRepaymentResults: any,
  formatCurrency: (value: number) => string,
  getFrequencyLabel: (frequency: string) => string,
  convertFromMonthlyAmount: (amount: number, frequency: string) => number
) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Add a subtle background pattern
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Header with branding
    doc.setFontSize(24);
    doc.setTextColor(59, 130, 246);
    doc.text('Fundmaster', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105);
    doc.text('Financial Advisor & Mortgage Broker Auckland', pageWidth / 2, 30, { align: 'center' });
    
    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 35, pageWidth - 20, 35);
    
    // Client information
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Prepared for: ${formData.name}`, 20, 45);
    doc.text(`Email: ${formData.email}`, 20, 52);
    doc.text(`Phone: ${formData.phone}`, 20, 59);
    
    // Current mortgage details
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Current Mortgage Details', 20, 75);
    
    const currentDetails = [
      ['Loan Amount', `$${formatCurrency(formData.loanAmount)}`],
      ['Interest Rate', `${formData.currentRate}%`],
      ['Remaining Term', `${formData.currentTerm} years`],
      ['Payment Frequency', getFrequencyLabel(formData.paymentFrequency)],
    ];
    
    if (formData.hasExtraRepayments) {
      currentDetails.push(['Current Extra Repayment', `$${formatCurrency(formData.currentExtraRepayment)}`]);
    }
    
    (doc as any).autoTable({
      startY: 85,
      head: [],
      body: currentDetails,
      theme: 'plain',
      styles: { 
        fontSize: 12,
        textColor: [71, 85, 105],
        cellPadding: 5
      },
      columnStyles: {
        0: { fontStyle: 'bold' }
      }
    });
    
    // Results comparison
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Rate Comparison Results', 20, (doc as any).lastAutoTable.finalY + 20);
    
    const resultsData = results.map(result => {
      const term = result.term === 'Custom'
        ? 'Custom Rate'
        : result.term === 'floating'
        ? 'Floating'
        : result.term.endsWith('y')
        ? `${result.term.replace('y', ' Year')}`
        : `${result.term.replace('m', ' Month')}`;
        
      if (formData.preference === 'money') {
        return [
          term,
          `${result.newRate}%`,
          `$${formatCurrency(convertFromMonthlyAmount(result.monthlySavings, formData.paymentFrequency))}`,
          `$${formatCurrency(result.totalSavings)}`,
        ];
      } else {
        return [
          term,
          `${result.newRate}%`,
          `${Math.round(result.yearsSaved * 10) / 10} years`,
          `${Math.round(result.monthsSaved)} months`,
        ];
      }
    });
    
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 30,
      head: [formData.preference === 'money' 
        ? ['Term', 'New Rate', `${getFrequencyLabel(formData.paymentFrequency)} Savings`, 'Total Savings']
        : ['Term', 'New Rate', 'Years Saved', 'Months Saved']
      ],
      body: resultsData,
      theme: 'striped',
      headStyles: { 
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontSize: 12,
        fontStyle: 'bold'
      },
      styles: { 
        fontSize: 11,
        textColor: [71, 85, 105],
        cellPadding: 6
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249]
      }
    });
    
    // Extra repayments section
    if (extraRepayment > 0 && extraRepaymentResults) {
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text('Additional Repayments Impact', 20, (doc as any).lastAutoTable.finalY + 20);
      
      const extraRepaymentData = [
        ['Additional Payment', `$${formatCurrency(extraRepayment)}`],
        ['New Loan Term', `${Math.floor(extraRepaymentResults.newTerm)} years and ${Math.round((extraRepaymentResults.newTerm % 1) * 12)} months`],
        ['Time Saved', `${Math.floor(extraRepaymentResults.monthsSaved / 12)} years and ${Math.round(extraRepaymentResults.monthsSaved % 12)} months`],
        ['Total Interest Saved', `$${formatCurrency(extraRepaymentResults.totalSaved)}`],
      ];
      
      (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 30,
        head: [],
        body: extraRepaymentData,
        theme: 'plain',
        styles: { 
          fontSize: 11,
          textColor: [71, 85, 105],
          cellPadding: 5
        },
        columnStyles: {
          0: { fontStyle: 'bold' }
        }
      });
    }
    
    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const disclaimer = 'This report is provided for informational purposes only. Rates and calculations are estimates and may vary. Please consult with a Fundmaster advisor for personalized recommendations.';
    doc.text(disclaimer, 20, pageHeight - 20, {
      maxWidth: pageWidth - 40,
      align: 'justify'
    });
    
    // Footer
    const today = new Date().toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.setFontSize(8);
    doc.text(`Generated on ${today}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
    
    return doc;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};