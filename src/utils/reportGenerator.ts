import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FormData, PaymentFrequency } from '../types';
import { calculateLoanBalance } from './calculations';

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
    doc.setTextColor(44, 39, 129); // Primary color
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
    doc.text(`Date: ${new Date().toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 66);
    
    // Current mortgage details
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Current Mortgage Details', 20, 80);
    
    const currentDetails = [
      ['Loan Amount', `$${formatCurrency(formData.loanAmount)}`],
      ['Interest Rate', `${formData.currentRate}%`],
      ['Remaining Term', `${formData.currentTerm} years`],
      ['Payment Frequency', getFrequencyLabel(formData.paymentFrequency)],
      ['Mortgage Type', formData.mortgageType === 'principal-and-interest' ? 'Principal and Interest' : 'Interest Only']
    ];
    
    if (formData.hasExtraRepayments) {
      currentDetails.push([
        'Current Extra Repayment', 
        `$${formatCurrency(formData.currentExtraRepayment)} per ${getFrequencyLabel(formData.paymentFrequency)} payment`
      ]);
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
    doc.text(`${formData.selectedBank} - Rate Comparison`, 20, (doc as any).lastAutoTable.finalY + 20);
    
    // Add preference information
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    if (formData.preference === 'money') {
      doc.text('Your preference: Lower minimum repayment', 20, (doc as any).lastAutoTable.finalY + 30);
    } else {
      doc.text(`Your preference: Save term/interest with $${formatCurrency(extraRepayment)} extra per payment`, 20, (doc as any).lastAutoTable.finalY + 30);
    }
    
    // Create table headers and data based on preference
    let headers: string[] = [];
    const resultsData = results.map(result => {
      const term = result.term === 'Custom'
        ? 'Custom Rate'
        : result.term === 'floating'
        ? 'Floating'
        : result.term.endsWith('y')
        ? `${result.term.replace('y', ' Year(s)')}`
        : `${result.term.replace('m', ' Month(s)')}`;
        
      if (formData.preference === 'money') {
        headers = ['Term', 'New Rate', `${getFrequencyLabel(formData.paymentFrequency)} Savings`, 'Total Savings'];
        return [
          term,
          `${result.newRate}%`,
          `$${formatCurrency(convertFromMonthlyAmount(result.monthlySavings, formData.paymentFrequency))}`,
          `$${formatCurrency(result.totalSavings)}`,
        ];
      } else {
        headers = ['Term', 'New Rate', 'Years Saved', 'Interest Saved'];
        return [
          term,
          `${result.newRate}%`,
          `${Math.round(result.yearsSaved * 10) / 10} years`,
          `$${formatCurrency(result.totalSaved)}`,
        ];
      }
    });
    
    (doc as any).autoTable({
      startY: (doc as any).lastAutoTable.finalY + 35,
      head: [headers],
      body: resultsData,
      theme: 'striped',
      headStyles: { 
        fillColor: [44, 39, 129], // Primary color
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
    
    // Add mortgage balance chart data
    if (formData.currentTerm) {
      const years = Math.ceil(formData.currentTerm as number);
      const chartData = [];
      
      // Generate chart data for current rate and best option
      const bestOption = results.length > 0 ? results[0] : null;
      
      if (bestOption) {
        for (let year = 0; year <= years; year += Math.max(1, Math.floor(years / 5))) {
          const currentBalance = calculateLoanBalance(
            formData.loanAmount,
            formData.currentRate as number,
            convertFromMonthlyAmount(formData.currentExtraRepayment, formData.paymentFrequency),
            year * 12
          );
          
          let newBalance;
          if (formData.preference === 'time' && extraRepayment > 0) {
            const monthlyExtraPayment = convertFromMonthlyAmount(extraRepayment, formData.paymentFrequency) * 
              (formData.paymentFrequency === 'weekly' ? 4.33 : formData.paymentFrequency === 'fortnightly' ? 2.17 : 1);
            
            newBalance = calculateLoanBalance(
              formData.loanAmount,
              bestOption.newRate,
              bestOption.newPayment + monthlyExtraPayment,
              year * 12
            );
          } else {
            newBalance = calculateLoanBalance(
              formData.loanAmount,
              bestOption.newRate,
              bestOption.newPayment,
              year * 12
            );
          }
          
          chartData.push([
            `Year ${year}`,
            `$${formatCurrency(currentBalance)}`,
            `$${formatCurrency(newBalance)}`
          ]);
        }
        
        // Add chart data table
        doc.addPage();
        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.text('Mortgage Balance Over Time', 20, 20);
        
        (doc as any).autoTable({
          startY: 30,
          head: [['Year', 'Current Rate Balance', `${bestOption.term} Balance`]],
          body: chartData,
          theme: 'striped',
          headStyles: { 
            fillColor: [44, 39, 129], // Primary color
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
      }
    }
    
    // Extra repayments section
    if (formData.preference === 'time' && extraRepayment > 0 && extraRepaymentResults) {
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text('Additional Repayments Impact', 20, (doc as any).lastAutoTable.finalY + 20);
      
      const extraRepaymentData = [
        ['Additional Payment', `$${formatCurrency(extraRepayment)} per ${getFrequencyLabel(formData.paymentFrequency)} payment`],
        ['Annual Extra Payments', `$${formatCurrency(extraRepaymentResults.annualExtraPayment)}`],
        ['New Loan Term', `${Math.floor(extraRepaymentResults.newTerm)} years and ${Math.round((extraRepaymentResults.newTerm % 1) * 12)} months`],
        ['Time Saved', `${Math.floor(extraRepaymentResults.yearsSaved)} years and ${Math.round((extraRepaymentResults.yearsSaved % 1) * 12)} months`],
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
    
    // Add a new page for Next Steps and Contact Information
    doc.addPage();
    
    // Reset background for new page
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Next steps
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Next Steps', 20, 30);
    
    const nextSteps = [
      'Schedule a consultation with a Fundmaster advisor to discuss your options in detail',
      'Prepare documentation for refinancing if you decide to proceed',
      'Review your budget to ensure you can comfortably make the payments',
      'Consider your long-term financial goals and how this mortgage fits into your plan'
    ];
    
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    let yPos = 40;
    
    nextSteps.forEach((step, index) => {
      doc.text(`${index + 1}. ${step}`, 20, yPos, {
        maxWidth: pageWidth - 40,
        align: 'justify'
      });
      yPos += 10;
    });
    
    // Contact information without icons
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Contact Us', 20, yPos + 20);
    
    // Create a styled contact info box
    doc.setFillColor(241, 245, 249); // Light blue-gray background
    doc.roundedRect(20, yPos + 25, pageWidth - 40, 40, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    
    // Contact details without icons
    doc.text('Phone: 0800 FUNDMASTER (0800 386 362)', 30, yPos + 35);
    doc.text('Email: info@fundmaster.co.nz', 30, yPos + 45);
    doc.text('Website: www.fundmaster.co.nz', 30, yPos + 55);
    
    // Disclaimer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const disclaimer = 'This report is provided for informational purposes only. Rates and calculations are estimates and may vary. Please consult with a Fundmaster advisor for personalized recommendations. The information contained in this report does not constitute financial advice.';
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