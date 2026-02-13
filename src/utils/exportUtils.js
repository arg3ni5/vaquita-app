import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Converts OKLCH and other modern CSS color functions to RGB for html2canvas compatibility
 */
const fixColorsForExport = (clonedDoc) => {
  // Get all elements in the cloned document
  const allElements = clonedDoc.getElementsByTagName('*');
  
  for (let element of allElements) {
    const computedStyle = window.getComputedStyle(element);
    
    // Fix colors that might use oklch or other unsupported formats
    const propertiesToFix = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'fill',
      'stroke'
    ];
    
    propertiesToFix.forEach(prop => {
      const value = computedStyle[prop];
      if (value && value !== 'none' && value !== 'transparent') {
        try {
          // Set the computed RGB value directly
          element.style[prop] = value;
        } catch {
          // Intentionally ignore errors for invalid or unsupported CSS properties
          // Some properties may not be settable or may cause exceptions in certain contexts
        }
      }
    });
  }
};

export const exportAsImage = async (elementId, filename = 'resumen-vaquita') => {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f8fafc', // slate-50
      logging: false,
      onclone: (clonedDoc) => {
        fixColorsForExport(clonedDoc);
      },
    });

    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = image;
    link.click();
    return true;
  } catch (error) {
    console.error('Error exporting as image:', error);
    return false;
  }
};

export const exportAsPDF = async (elementId, filename = 'resumen-vaquita') => {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#f8fafc',
      logging: false,
      onclone: (clonedDoc) => {
        fixColorsForExport(clonedDoc);
      },
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let pageNumber = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if the content is taller than one page
    while (heightLeft > 0) {
      pageNumber++;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, -pageHeight * pageNumber, pdfWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting as PDF:', error);
    return false;
  }
};
