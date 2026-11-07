import Tesseract from 'tesseract.js';

export interface ValidationResult {
  isValid: boolean;
  message: string;
  confidence: number;
}

export async function validatePaymentProof(file: File): Promise<ValidationResult> {
  // Check if file is an image
  if (!file.type.startsWith('image/')) {
    return {
      isValid: true,
      message: 'PDF - se aceptará sin validación de imagen',
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
        message: 'La imagen parece no contener suficiente texto. Por favor cargue un comprobante de pago válido.',
        confidence
      };
    }

    if (!hasPrice && !hasKeywords) {
      return {
        isValid: false,
        message: 'La imagen no parece ser un comprobante de pago. Por favor cargue una captura de su recibo o factura.',
        confidence
      };
    }

    if (confidence < 50) {
      return {
        isValid: false,
        message: 'No se pudo leer claramente la imagen. Por favor cargue una imagen más nítida del comprobante.',
        confidence
      };
    }

    return {
      isValid: true,
      message: 'Imagen validada correctamente como comprobante de pago.',
      confidence
    };

  } catch (error) {
    console.error('OCR Error:', error);
    // If OCR fails, allow the upload but warn the user
    return {
      isValid: true,
      message: 'No se pudo validar la imagen automáticamente. Por favor asegúrese de que sea un comprobante de pago válido.',
      confidence: 0
    };
  }
}
