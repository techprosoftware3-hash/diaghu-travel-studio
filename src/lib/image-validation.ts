import Tesseract from 'tesseract.js';

export interface ValidationResult {
  isValid: boolean;
  message: string;
  errorCode?: string;
  confidence: number;
}

export async function validatePaymentProof(file: File): Promise<ValidationResult> {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    return {
      isValid: true,
      message: 'pdf_accepted',
      errorCode: 'pdf_accepted',
      confidence: 0
    };
  }

  try {
    // Perform OCR on the image
    const result = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        // Optional: log progress
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    const text = result.data.text.toLowerCase();
    const confidence = result.data.confidence;

    console.log('OCR Result:', { text, confidence });

    // Check if the image contains enough text (less likely to be a human photo)
    const wordCount = text.split(/\s+/).filter(word => word.length > 2).length;
    
    // Check for price patterns (numbers with currency symbols)
    const pricePatterns = [
      /\$\s*\d+\.?\d*/g,  // $50.00
      /\d+\.?\d*\s*\$/g,  // 50.00 $
      /usd\s*\d+/gi,      // USD 50
      /\d+\s*usd/gi,      // 50 USD
      /eur\s*\d+/gi,      // EUR 50
      /\d+\s*eur/gi,      // 50 EUR
      /€\s*\d+/g,         // €50
      /\d+\s*€/g,         // 50 €
    ];

    const hasPrice = pricePatterns.some(pattern => pattern.test(text));

    // Check for common receipt/invoice keywords
    const receiptKeywords = [
      'receipt', 'invoice', 'payment', 'pay', 'total', 'amount',
      'paypal', 'transaction', 'order', 'purchase', 'date',
      'comprobante', 'factura', 'pago', 'total', 'monto',
      'transacción', 'orden', 'compra', 'fecha'
    ];

    const hasKeywords = receiptKeywords.some(keyword => text.includes(keyword));

    // Validation logic
    if (wordCount < 5) {
      return {
        isValid: false,
        message: 'insufficient_text',
        errorCode: 'insufficient_text',
        confidence
      };
    }

    if (!hasPrice && !hasKeywords) {
      return {
        isValid: false,
        message: 'not_payment_proof',
        errorCode: 'not_payment_proof',
        confidence
      };
    }

    if (confidence < 50) {
      return {
        isValid: false,
        message: 'low_confidence',
        errorCode: 'low_confidence',
        confidence
      };
    }

    return {
      isValid: true,
      message: 'validation_success',
      errorCode: 'validation_success',
      confidence
    };

  } catch (error) {
    console.error('OCR Error:', error);
    // If OCR fails, allow the upload but warn the user
    return {
      isValid: true,
      message: 'validation_failed',
      errorCode: 'validation_failed',
      confidence: 0
    };
  }
}
