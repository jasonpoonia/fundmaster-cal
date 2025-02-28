import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FormData, PaymentFrequency } from '../types';
import { calculateLoanBalance } from './calculations';
// Helper function for consistent total savings calculation
const calculateTotalSavingsFromPerPayment = (
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
  return Math.round(perPaymentSavings * totalPayments * 100) / 100;
};
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
    
    // Helper function to get mortgage type display name
    const getMortgageTypeDisplay = () => {
      return formData.mortgageType === 'principal-and-interest' ? 'Principal and Interest' : 'Interest Only';
    };
    
    // COVER PAGE WITH CLIENT INFORMATION
    
    // Add background
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Add Fundmaster logo
    // We'll use a placeholder function as a comment - in actual implementation you'd need to handle image loading
    try {
      // For illustration - in real code you'd need to handle image loading properly
      doc.addImage('https://fundmaster.co.nz/wp-content/uploads/2023/03/Fundmaster-Transparent-e1710129937649.png', 'PNG', pageWidth / 2 - 30, 15, 60, 20, undefined, 'FAST');
    } catch (error) {
      // Fallback to text if image can't be loaded
      doc.setFontSize(24);
      doc.setTextColor(44, 39, 129); // Primary color
      doc.text('Fundmaster', pageWidth / 2, 20, { align: 'center' });
    }
    
    // Subheader
    doc.setFontSize(14);
    doc.setTextColor(71, 85, 105);
    doc.text('Financial Adviser & Mortgage Broker Auckland', pageWidth / 2, 40, { align: 'center' });
    
    // Divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 45, pageWidth - 20, 45);
    
    // Client information
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(`Prepared for: ${formData.name}`, 20, 55);
    doc.text(`Email: ${formData.email}`, 20, 62);
    doc.text(`Phone: ${formData.phone}`, 20, 69);
    doc.text(`Date: ${new Date().toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })}`, 20, 76);
    
    // CURRENT MORTGAGE SUMMARY SECTION - moved lower on the page
    
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Current Mortgage Summary', 20, 100); // Moved from 80 to 100
    
    // Add a note about frequency
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`All repayment amounts shown are ${getFrequencyLabel(formData.paymentFrequency).toLowerCase()}`, 20, 108); // Moved from 88 to 108
    
    // Calculate current mortgage values
    const currentMinimumPayment = convertFromMonthlyAmount(
      formData.mortgageType === 'interest-only' 
        ? (formData.loanAmount * (formData.currentRate as number / 100)) / 12
        : calculateMonthlyPayment(formData.loanAmount, formData.currentRate as number, formData.currentTerm as number),
      formData.paymentFrequency
    );
    
    // Current mortgage data for table
    const mortgageSummaryData = [
      [
        { title: 'Loan Amount', value: `$${formatCurrency(formData.loanAmount)}` },
        { title: 'Interest Rate', value: `${formData.currentRate}%` },
        { title: 'Remaining Term', value: `${formData.currentTerm} years` }
      ],
      [
        { title: 'Minimum Repayment', value: `$${formatCurrency(currentMinimumPayment)}` },
        { title: 'Extra Repayment', value: `$${formatCurrency(formData.currentExtraRepayment)}` },
        { title: 'Total Repayment', value: `$${formatCurrency(currentMinimumPayment + formData.currentExtraRepayment)}` }
      ]
    ];
    
    // Create mortgage summary grid - moved lower
    const startY = 115; // Moved from 95 to 115
    const rowHeight = 30;
    const margin = 20;
    const columnWidth = (pageWidth - 40) / 3;
    
    // Draw the mortgage summary background
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(margin, startY - 5, pageWidth - (margin * 2), (rowHeight * mortgageSummaryData.length) + 10, 3, 3, 'F');
    
    // Draw the mortgage summary grid
    mortgageSummaryData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = margin + (colIndex * columnWidth);
        const y = startY + (rowIndex * rowHeight);
        
        // Draw cell title
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(10);
        doc.text(cell.title, x + 5, y + 7);
        
        // Draw cell value
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(cell.value, x + 5, y + 20);
        doc.setFont(undefined, 'normal');
      });
    });
    
    // RATE COMPARISON SECTION (TABLE-BASED)
    
    // Start a new page for rate comparison
    doc.addPage();
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Add rate comparison title with mortgage type
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(`${formData.selectedBank} - Rate Comparison (${getMortgageTypeDisplay()})`, 20, 30);
    
    // Add frequency note
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`All repayment amounts shown are ${getFrequencyLabel(formData.paymentFrequency).toLowerCase()}`, 20, 40);
    
    // Sort results
    const termOrder = ['6m', '1y', '18m', '2y', '3y', '4y', '5y', 'floating', 'Custom'];
    const sortedResults = [...results].sort((a, b) => {
      const indexA = termOrder.indexOf(a.term);
      const indexB = termOrder.indexOf(b.term);
      return indexA - indexB;
    });
    
    // Term display formatting
    const getTermDisplay = (term) => {
      if (term === 'Custom') return 'Custom Rate';
      if (term === 'floating') return 'Floating';
      if (term.endsWith('y')) return `${term.replace('y', ' Year(s)')}`;
      if (term.endsWith('m')) return `${term.replace('m', ' Months')}`;
      return term;
    };

    // Updated term display with rate
    const getTermRateDisplay = (term, rate) => {
      return `${getTermDisplay(term)} @ ${rate}%`;
    };
    
    // Generate the rate comparison table based on preference
    if (formData.preference === 'money') {
      // For money preference - show repayment savings
      const tableData = sortedResults.map(result => {
        // Calculate displayed savings amount and total savings consistently
        const displayedSavingsAmount = convertFromMonthlyAmount(result.monthlySavings, formData.paymentFrequency);
        const displayedTotalSavings = calculateTotalSavingsFromPerPayment(
          displayedSavingsAmount, 
          formData.paymentFrequency, 
          formData.currentTerm as number
        );
        
        return [
          getTermRateDisplay(result.term, result.newRate),
          `$${formatCurrency(convertFromMonthlyAmount(result.currentPayment, formData.paymentFrequency))}`,
          `$${formatCurrency(convertFromMonthlyAmount(result.newPayment, formData.paymentFrequency))}`,
          `$${formatCurrency(displayedSavingsAmount)}`,
          `$${formatCurrency(displayedTotalSavings)}`
        ];
      });
      
      // Generate the table
      (doc as any).autoTable({
        startY: 50,
        head: [['Term & Rate', 'Current Repayment', 'New Repayment', 'Repayment Savings', 'Total Savings Across Term']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [44, 39, 129],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 'auto' },
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right' }
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
          overflow: 'linebreak'
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        margin: { left: 20, right: 20 },
        didDrawPage: (data) => {
          // Add header on new pages
          if (data.pageCount > 1) {
            doc.setFillColor(248, 250, 252);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            
            doc.setFontSize(16);
            doc.setTextColor(30, 41, 59);
            doc.text(`${formData.selectedBank} - Rate Comparison (${getMortgageTypeDisplay()}) (Continued)`, 20, 20);
            
            doc.setFontSize(10);
            doc.setTextColor(71, 85, 105);
            doc.text(`All repayment amounts shown are ${getFrequencyLabel(formData.paymentFrequency).toLowerCase()}`, 20, 28);
          }
        }
      });
    } else {
      // For time preference - show time saved
      const tableData = sortedResults.map(result => {
        const totalRepayment = convertFromMonthlyAmount(result.newPayment, formData.paymentFrequency) + extraRepayment;
        return [
          getTermRateDisplay(result.term, result.newRate),
          `$${formatCurrency(totalRepayment)}`,
          `$${formatCurrency(convertFromMonthlyAmount(result.newPayment, formData.paymentFrequency))}`,
          `$${formatCurrency(extraRepayment)}`,
          `${Math.round(result.yearsSaved * 10) / 10} years`,
          `$${formatCurrency(result.totalSaved)}`
        ];
      });
      
      // Generate the table
      (doc as any).autoTable({
        startY: 50,
        head: [['Term & Rate', 'Total Repayment', 'Min Repayment', 'Extra Repayment', 'Years Saved', 'Interest Saved']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [44, 39, 129],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 'auto' },
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right' },
          4: { halign: 'right' },
          5: { halign: 'right' }
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
          overflow: 'linebreak'
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        margin: { left: 20, right: 20 },
        didDrawPage: (data) => {
          // Add header on new pages
          if (data.pageCount > 1) {
            doc.setFillColor(248, 250, 252);
            doc.rect(0, 0, pageWidth, pageHeight, 'F');
            
            doc.setFontSize(16);
            doc.setTextColor(30, 41, 59);
            doc.text(`${formData.selectedBank} - Rate Comparison (${getMortgageTypeDisplay()}) (Continued)`, 20, 20);
            
            doc.setFontSize(10);
            doc.setTextColor(71, 85, 105);
            doc.text(`All repayment amounts shown are ${getFrequencyLabel(formData.paymentFrequency).toLowerCase()}`, 20, 28);
          }
        }
      });
    }
    
    // MORTGAGE BALANCE CHART SECTION
    
    doc.addPage();
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Mortgage Balance Over Time', 20, 30);
    
    // Add frequency note for clarity
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(`Shows how your loan balance will change over the term of your mortgage.`, 20, 40);
    
    // Generate chart data
    if (formData.currentTerm) {
      const years = Math.ceil(formData.currentTerm as number);
      
      // Calculate the base monthly payment
      const baseMonthlyPayment = formData.mortgageType === 'interest-only' 
        ? (formData.loanAmount * (formData.currentRate as number / 100)) / 12
        : calculateMonthlyPayment(formData.loanAmount, formData.currentRate as number, formData.currentTerm as number);
      
      // Prepare chart data with consistent intervals
      const chartData = [];
      const yearInterval = Math.max(1, Math.floor(years / 10)); // Ensure reasonable number of points
      
      for (let year = 0; year <= years; year += yearInterval) {
        const dataPoint = { year };
        
        // Current balance
        const currentBalance = calculateLoanBalance(
          formData.loanAmount,
          formData.currentRate as number,
          baseMonthlyPayment,
          year * 12
        );
        
        // Option balances (top 3 options only)
        const optionBalances = results.slice(0, 3).map(result => {
          let balance;
          
          // Calculate with extra payments if preference is 'time'
          if (formData.preference === 'time' && extraRepayment > 0) {
            const monthlyExtraPayment = convertFromMonthlyAmount(extraRepayment, formData.paymentFrequency) * 
              (formData.paymentFrequency === 'weekly' ? 4.33 : formData.paymentFrequency === 'fortnightly' ? 2.17 : 1);
            
            balance = calculateLoanBalance(
              formData.loanAmount,
              result.newRate,
              result.newPayment + monthlyExtraPayment,
              year * 12
            );
          } else {
            balance = calculateLoanBalance(
              formData.loanAmount,
              result.newRate,
              result.newPayment,
              year * 12
            );
          }
          return balance;
        });
        
        // Add to data point
        dataPoint.currentBalance = currentBalance;
        optionBalances.forEach((balance, index) => {
          dataPoint[`option${index + 1}`] = balance;
        });
        
        chartData.push(dataPoint);
      }
      
      // Chart dimensions & positioning
      const chartStartY = 50;
      const chartHeight = 160;
      const chartWidth = pageWidth - 40;
      const chartEndY = chartStartY + chartHeight;
      
      // Max/min for scaling
      const maxBalance = formData.loanAmount * 1.05; // Add 5% padding
      
      // Draw chart background
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(20, chartStartY, chartWidth, chartHeight, 3, 3, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(20, chartStartY, chartWidth, chartHeight, 3, 3, 'S');
      
      // Draw axes
      doc.setDrawColor(71, 85, 105);
      doc.setLineWidth(0.5);
      doc.line(40, chartStartY, 40, chartEndY); // Y-axis
      doc.line(40, chartEndY, 20 + chartWidth, chartEndY); // X-axis
      
      // Axes labels
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text("Loan Balance ($)", 15, chartStartY + (chartHeight / 2), { angle: 90 });
      doc.text("Years", 20 + (chartWidth / 2), chartEndY + 20, { align: 'center' });
      
      // Y-axis ticks & labels
      const numYTicks = 5;
      for (let i = 0; i <= numYTicks; i++) {
        const y = chartEndY - (i * (chartHeight / numYTicks));
        const value = maxBalance * (i / numYTicks);
        
        // Tick mark
        doc.line(38, y, 40, y);
        
        // Gridline
        doc.setDrawColor(226, 232, 240);
        doc.line(40, y, 20 + chartWidth, y);
        
        // Label
        doc.setDrawColor(71, 85, 105);
        doc.setFontSize(8);
        doc.text(`$${formatCurrency(value)}`, 36, y, { align: 'right' });
      }
      
      // X-axis ticks & labels
      const numXTicks = Math.min(10, years);
      for (let i = 0; i <= numXTicks; i++) {
        const x = 40 + (i * ((chartWidth - 20) / numXTicks));
        const value = Math.round(years * (i / numXTicks));
        
        // Tick mark
        doc.line(x, chartEndY, x, chartEndY + 2);
        
        // Gridline
        doc.setDrawColor(226, 232, 240);
        doc.line(x, chartStartY, x, chartEndY);
        
        // Label
        doc.setDrawColor(71, 85, 105);
        doc.setFontSize(8);
        doc.text(`Year ${value}`, x, chartEndY + 10, { align: 'center' });
      }
      
      // Helper functions for coordinates
      const yearToX = (year) => 40 + ((year / years) * (chartWidth - 20));
      const balanceToY = (balance) => chartEndY - ((balance / maxBalance) * chartHeight);
      
      // Define line colors
      const colors = [
        [94, 163, 184],  // Current balance - blue
        [239, 68, 68],   // Option 1 - red
        [249, 115, 22],  // Option 2 - orange
        [34, 197, 94]    // Option 3 - green
      ];
      
      // Draw current balance line
      doc.setDrawColor(colors[0][0], colors[0][1], colors[0][2]);
      doc.setLineWidth(1.5);
      
      let lastX = null;
      let lastY = null;
      
      chartData.forEach(dataPoint => {
        const x = yearToX(dataPoint.year);
        const y = balanceToY(dataPoint.currentBalance);
        
        if (lastX !== null && lastY !== null) {
          doc.line(lastX, lastY, x, y);
        }
        
        lastX = x;
        lastY = y;
      });
      
      // Draw option lines (up to 3)
      for (let i = 0; i < Math.min(3, results.length); i++) {
        doc.setDrawColor(colors[i + 1][0], colors[i + 1][1], colors[i + 1][2]);
        doc.setLineWidth(1.5);
        
        lastX = null;
        lastY = null;
        
        chartData.forEach(dataPoint => {
          const x = yearToX(dataPoint.year);
          const y = balanceToY(dataPoint[`option${i + 1}`]);
          
          if (lastX !== null && lastY !== null) {
            doc.line(lastX, lastY, x, y);
          }
          
          lastX = x;
          lastY = y;
        });
      }
      
      // Draw legend
      const legendY = chartEndY + 30;
      doc.setFontSize(10);
      
      // Current balance legend
      doc.setFillColor(colors[0][0], colors[0][1], colors[0][2]);
      doc.rect(40, legendY, 12, 6, 'F');
      doc.setTextColor(30, 41, 59);
      doc.text('Current Balance', 58, legendY + 4);
      
      // Term display for legend
      const termDisplay = (term) => {
        if (term === 'Custom') return 'Custom Rate';
        if (term === 'floating') return 'Floating';
        if (term.endsWith('y')) return `${term.replace('y', ' Year')}`;
        if (term.endsWith('m')) return `${term.replace('m', ' Month')}`;
        return term;
      };
      
      // Option legends (first column)
      for (let i = 0; i < Math.min(2, results.length); i++) {
        doc.setFillColor(colors[i + 1][0], colors[i + 1][1], colors[i + 1][2]);
        doc.rect(40, legendY + ((i + 1) * 12), 12, 6, 'F');
        doc.setTextColor(30, 41, 59);
        doc.text(`${termDisplay(results[i].term)} @ ${results[i].newRate}%`, 58, legendY + 4 + ((i + 1) * 12));
      }
      
      // Option legend (second column if needed)
      if (results.length > 2) {
        doc.setFillColor(colors[3][0], colors[3][1], colors[3][2]);
        doc.rect(150, legendY, 12, 6, 'F');
        doc.setTextColor(30, 41, 59);
        doc.text(`${termDisplay(results[2].term)} @ ${results[2].newRate}%`, 168, legendY + 4);
      }
      
      // Add table with balance data
      const tableHeaders = [
        'Year', 
        'Current Balance', 
        ...results.slice(0, 3).map(result => `${termDisplay(result.term)} @ ${result.newRate}%`)
      ];
      
      // Prepare table data (show only key years for readability)
      const tableBody = chartData
        .filter((_, index, array) => {
          // First, last, and some in between (5-7 rows total)
          const interval = Math.max(1, Math.floor(array.length / 5));
          return index === 0 || index === array.length - 1 || index % interval === 0;
        })
        .map(dataPoint => [
          `Year ${dataPoint.year}`,
          `$${formatCurrency(dataPoint.currentBalance)}`,
          ...Object.keys(dataPoint)
            .filter(key => key.startsWith('option'))
            .slice(0, 3)
            .map(key => `$${formatCurrency(dataPoint[key])}`)
        ]);
      
      // Generate balance data table
      (doc as any).autoTable({
        startY: legendY + 60,
        head: [tableHeaders],
        body: tableBody,
        theme: 'striped',
        headStyles: { 
          fillColor: [44, 39, 129],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 9,
          textColor: [71, 85, 105],
          cellPadding: 5
        },
        alternateRowStyles: {
          fillColor: [241, 245, 249]
        }
      });
    }
    
    // EXTRA REPAYMENTS SECTION (if applicable)
    
    if (formData.preference === 'time' && extraRepayment > 0 && extraRepaymentResults) {
      doc.addPage();
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      doc.setFontSize(16);
      doc.setTextColor(30, 41, 59);
      doc.text('Additional Repayments Impact', 20, 30);
      
      // Extra repayment data table
      const extraRepaymentData = [
        ['Additional Repayment', `$${formatCurrency(extraRepayment)} per ${getFrequencyLabel(formData.paymentFrequency)}`],
        ['Annual Extra Repayments', `$${formatCurrency(extraRepaymentResults.annualExtraPayment)}`],
        ['New Loan Term', `${Math.floor(extraRepaymentResults.newTerm)} years and ${Math.round((extraRepaymentResults.newTerm % 1) * 12)} months`],
        ['Time Saved', `${Math.floor(extraRepaymentResults.yearsSaved)} years and ${Math.round((extraRepaymentResults.yearsSaved % 1) * 12)} months`],
        ['Total Interest Saved', `$${formatCurrency(extraRepaymentResults.totalSaved)}`],
      ];
      
      // Generate extra repayment table
      (doc as any).autoTable({
        startY: 40,
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
    
    // NEXT STEPS AND CONTACT INFORMATION
    
    doc.addPage();
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Next steps section
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Next Steps', 20, 30);
    
    const nextSteps = [
      'Schedule a consultation with a Fundmaster adviser to discuss your options in detail',
      'Prepare documentation for refinancing if you decide to proceed',
      'Review your budget to ensure you can comfortably make the repayments',
      'Consider your long-term financial goals and how this mortgage fits into your plan'
    ];
    
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    let yPos = 40;
    
    // Draw next steps list
    nextSteps.forEach((step, index) => {
      doc.text(`${index + 1}. ${step}`, 20, yPos, {
        maxWidth: pageWidth - 40,
        align: 'justify'
      });
      yPos += 10;
    });
    
    // Contact information
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text('Contact Us', 20, yPos + 20);
    
    // Styled contact box
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(20, yPos + 25, pageWidth - 40, 40, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    
    // Contact details
    doc.text('Phone: 0800 FUNDMASTER (0800 386 362)', 30, yPos + 35);
    doc.text('Email: admin@fundmaster.co.nz', 30, yPos + 45);
    doc.text('Website: www.fundmaster.co.nz', 30, yPos + 55);
    
    // Footer disclaimer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const disclaimer = 'This report is provided for informational purposes only. Rates and calculations are estimates and may vary. Please consult with a Fundmaster adviser for personalized recommendations. The information contained in this report does not constitute financial advice.';
    doc.text(disclaimer, 20, pageHeight - 20, {
      maxWidth: pageWidth - 40,
      align: 'justify'
    });
    
    // Generation date in footer
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

// Helper function for calculating monthly payment (needed for PDF generation)
function calculateMonthlyPayment(principal: number, rate: number, years: number) {
  const monthlyRate = rate / 100 / 12;
  const numberOfPayments = years * 12;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
}