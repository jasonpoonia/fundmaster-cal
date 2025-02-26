import { FormData } from '../types';

export const sendEmailReport = async (formData: FormData, pdfBlob: Blob) => {
  // Since we don't have a backend API, we'll simulate email sending
  // by triggering a download with a custom filename
  try {
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fundmaster-mortgage-report-${formData.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show a message to the user about the download
    alert(`Since we don't have an email server set up, the report has been downloaded to your device.\n\nIn a production environment, this would be emailed to: ${formData.email}`);
    
    return true;
  } catch (error) {
    console.error('Error handling report:', error);
    return false;
  }
};